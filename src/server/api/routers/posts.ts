import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

const filtereUserInfo = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profilePicture: user.profileImageUrl
  }
}

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 25,
    });

    const users = (await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 25
    })).map(filtereUserInfo)

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId)
      if (!author) {
        throw new TRPCError({code: "NOT_FOUND", message:"Author does not exist."})
      }

      return {
        post,
        author
      }
    })

  }),
});
