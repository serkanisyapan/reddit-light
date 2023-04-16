import { createTRPCRouter, privateProcedure, publicProcedure } from "@/server/api/trpc";
import { postValidation } from "@/utils/postValidation";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Vote, Comment } from "@prisma/client"
import { filterUserInfo } from "@/utils/filterUserInfo";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { User } from "@clerk/nextjs/dist/api";

type PostTypes= {
  id: string;
  updatedAt: Date;
  createdAt: Date;
  title: string;
  content: string;
  authorId: string;
  votes: Vote[]
  comments: Comment[]
}
const voteValidation = z.object({
  value: z.number(),
  postId: z.string(),
  userId: z.string()
})
const commentValidation = z.object({
  comment: z.string().min(1, "Comment must be at least 1 character."),
  postId: z.string(),
  userId: z.string()
})


const addUserDataToPost = async (posts: PostTypes[]) => {
    const users = (await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 25,
    })).map(filterUserInfo)

    return posts.map((post) => {
      const author= users.find((user) => user.id === post.authorId) 
      if (!author || !author.username) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Post author not found.'
        })
      }
      return {
        post,
        author: {
          ...author,
          username: author.username,
        }
      }
})}

// Create a new ratelimiter, that allows 1 requests per 1 minutes
const rateLimitPost = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});
const rateLimitComment = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
})

export const postRouter = createTRPCRouter({
  getAll: publicProcedure
  .input(z.object({
    limit: z.number().min(1).max(15).nullish(),
    cursor: z.string().nullish()
  }))
  .query(async ({ ctx, input }) => {
    const { cursor } = input
    const limit = input.limit ?? 15
    const posts = await ctx.prisma.post.findMany({
      include: {votes: true, comments: true},
      orderBy: {createdAt: "desc"}, 
      take: limit + 1,
      cursor: cursor ? {id: cursor} : undefined,
    });
    let nextCursor: typeof cursor | undefined = undefined;
    if (posts.length > limit) {
      const nextPost = posts.pop() as typeof posts[number]
      nextCursor = nextPost.id
    }
    const postsWithUserData = await addUserDataToPost(posts)
    return {posts:postsWithUserData, nextCursor};
  }),

  createPost: privateProcedure.input(postValidation).mutation(async ({ ctx, input }) => {
    const authorId = ctx.userId;
    const { success } = await rateLimitPost.limit(authorId)
    if (!success) throw new TRPCError({code: "TOO_MANY_REQUESTS"})

    const post = await ctx.prisma.post.create({
      data: {
        authorId,
        title: input.title,
        content: input.content
      }
    });
    return post;
  }),

  commentPost: privateProcedure
  .input(commentValidation)
  .mutation(async({ ctx, input }) => {
    const user:User = (await clerkClient.users.getUser(input.userId))
    if (!user || !user.username) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Comment author not found.'
      })
    }
    const authorId = ctx.userId;
    const { success } = await rateLimitComment.limit(authorId)
    if (!success) throw new TRPCError({code: "TOO_MANY_REQUESTS"})
    if (input.userId !== authorId) throw new TRPCError({code: "UNAUTHORIZED"})
    const comment = await ctx.prisma.comment.create({
      data: {
        comment: input.comment,
        postId: input.postId,
        userId: authorId,
        username: user.username,
        picture: user.profileImageUrl
      }
    })
    return comment
  }),

  deletePost: privateProcedure
  .input(z.object({id: z.string(), userId: z.string()}))
  .mutation(async({ ctx, input }) => {
    const authorId = ctx.userId
    if (input.userId !== authorId) throw new TRPCError({code: "UNAUTHORIZED"})
    const post = await ctx.prisma.post.delete({
      where: {
        id: input.id
      }
    })
    return post
  }),

  editPost: privateProcedure
  .input(z.object({
    id: z.string(),
    userId: z.string(),
    data: z.object({
      title: z.string(),
      content: z.string()
    })
  }))
  .mutation(async({ ctx, input }) => {
    const { id, data } = input
    const authorId = ctx.userId
    if (input.userId !== authorId) throw new TRPCError({code: "UNAUTHORIZED"})
    const post = ctx.prisma.post.update({
      where: {
        id
      },
      data
    })
    return post
  }),

  votePost: privateProcedure
  .input(voteValidation)
  .mutation(async({ ctx, input }) => {
    const authorId = ctx.userId 
    if (input.userId !== authorId) throw new TRPCError({code: "UNAUTHORIZED"})

    // checks if user already voted for that post, if exists delete
    const previousVote = await ctx.prisma.vote.findFirst({
      where: {
       userId: authorId,
       postId: input.postId 
      }
    })
    const deletePrevVote = async() => {
      if (!previousVote) return
      await ctx.prisma.vote.delete({
        where: {
          id: previousVote.id
        }
      })
    }
    if (previousVote) {
      if (previousVote.value === input.value) {
        void deletePrevVote()
        return
      }
      void deletePrevVote()
    }

    const vote = await ctx.prisma.vote.create({
      data: {
        value: input.value,
        postId: input.postId,
        userId: authorId
      }
    })
    return vote
  }),

  getUserFeed: publicProcedure
  .input(z.object({
    userId: z.string(),
    feed: z.string(),
    limit: z.number().min(1).max(20).nullish(),
    cursor: z.string().nullish()
  }))
  .query(async({ ctx, input }) =>{
    const { cursor } = input;
    const limit = input.limit ?? 20
    let getPosts: PostTypes[];
    if (input.feed === "upvoted" || input.feed === "downvoted") {
      getPosts = await ctx.prisma.post.findMany({
        where: {
          votes: {
            some: {
              userId: input.userId,
              value: input.feed === "upvoted" ? 1 : -1
            }
          },
        },
        orderBy: {
          createdAt: "desc"
        },
        include: {votes:true, comments: true},
        take: limit + 1,
        cursor: cursor ? {id: cursor} : undefined
      })
    } else if (input.feed === "comments") {
      getPosts = await ctx.prisma.post.findMany({
        where: {
          comments: {
            some: {
              userId: input.userId
            }
          }
        },
        include: {votes:true, comments: true},
        orderBy: {createdAt: "desc"},
        take: limit + 1,
        cursor: cursor ? {id: cursor} : undefined
      })
    } else {
      getPosts = await ctx.prisma.post.findMany({
        include: {votes:true, comments: true},
        where: {
          authorId: input.userId
        },
        orderBy: {createdAt: "desc"},
        take: limit + 1,
        cursor: cursor ? {id: cursor} : undefined
      })
    }
    let nextCursor: typeof cursor | undefined = undefined;
    if (getPosts.length > limit) {
      const nextPost = getPosts.pop() as typeof getPosts[number]
      nextCursor = nextPost.id
    }
    const userFeedPosts = await addUserDataToPost(getPosts)
    return {posts: userFeedPosts, nextCursor}
  }),

  getPostById: publicProcedure
  .input(z.object({id: z.string()}))
  .query(async({ctx, input}) => {
    const post = await ctx.prisma.post.findUnique({
      include: {votes: true, comments: true},
      where:{
        id: input.id
      }
    })
    if (!post) throw new TRPCError({code: "NOT_FOUND"})
    return (await addUserDataToPost([post]))[0];
  }),
});
