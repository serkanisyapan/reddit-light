import { createTRPCRouter, privateProcedure, publicProcedure } from "@/server/api/trpc";
import { postValidation } from "@/utils/postValidation";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Post } from "@prisma/client";
import { filterUserInfo } from "@/utils/filterUserInfo";

const addUserDataToPost = async (posts: Post[]) => {
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

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      orderBy: {createdAt: "desc"}, 
      take: 25,
    });
    return addUserDataToPost(posts);
  }),

  createPost: privateProcedure.input(postValidation).mutation(async ({ ctx, input }) => {
    const authorId = ctx.userId;
    const post = await ctx.prisma.post.create({
      data: {
        authorId,
        title: input.title,
        content: input.content
      }
    });
    return post;
  }),

  getPostsByUserId: publicProcedure
  .input(z.object({
    userId: z.string()
  }))
  .query(async({ ctx, input }) => ctx.prisma.post.findMany({
    where: {
      authorId: input.userId
    },
    take: 25,
    orderBy: {createdAt: "desc"}
  }).then(addUserDataToPost))
});
