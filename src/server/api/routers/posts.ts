import { createTRPCRouter, privateProcedure, publicProcedure } from "@/server/api/trpc";
import { postValidation } from "@/utils/postValidation";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Vote } from "@prisma/client"
import { filterUserInfo } from "@/utils/filterUserInfo";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type PostWithVotes = {
  id: string;
  updatedAt: Date;
  createdAt: Date;
  title: string;
  content: string;
  authorId: string;
  votes: Vote[]
}
const voteValidation = z.object({
  value: z.number(),
  postId: z.string(),
  userId: z.string()
})

const addUserDataToPost = async (posts: PostWithVotes[]) => {
    const users = (await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 50,
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
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      include: {votes: true},
      orderBy: {createdAt: "desc"}, 
      take: 25,
    });
    return addUserDataToPost(posts);
  }),

  createPost: privateProcedure.input(postValidation).mutation(async ({ ctx, input }) => {
    const authorId = ctx.userId;
    const { success } = await ratelimit.limit(authorId)
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

  deletePost: privateProcedure
  .input(z.object({id: z.string(), userId: z.string()}))
  .mutation(async({ ctx, input }) => {
    const authorId = ctx.userId
    if (input.userId !== authorId) throw new TRPCError({code: "UNAUTHORIZED"})
    await ctx.prisma.vote.deleteMany({
      where: {
        postId: input.id
      }
    })
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

  getPostsByUserId: publicProcedure
  .input(z.object({
    userId: z.string()
  }))
  .query(async({ ctx, input }) => ctx.prisma.post.findMany({
    include: {votes: true},
    where: {
      authorId: input.userId
    },
    take: 25,
    orderBy: {createdAt: "desc"}
  }).then(addUserDataToPost)),

  getPostById: publicProcedure
  .input(z.object({id: z.string()}))
  .query(async({ctx, input}) => {
    const post = await ctx.prisma.post.findUnique({
      include: {votes: true},
      where:{
        id: input.id
      }
    })
    if (!post) throw new TRPCError({code: "NOT_FOUND"})
    return (await addUserDataToPost([post]))[0];
  }),
});
