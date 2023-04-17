import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useUser } from "@clerk/nextjs";
import PostComment from "./PostComment";
import { CommentForm } from "./CommentForm";
import { VoteSection } from "./VoteSection";
import { PostOptions } from "./PostOptions";
import type { PostType } from "@/types/postType";
dayjs.extend(relativeTime);

export default function PostView(props: PostType) {
  const { post, author } = props;
  const { user } = useUser();
  const isPostAuthor = post.authorId === user?.id;
  return (
    <div
      className={`box-border flex rounded-md border-[1px] border-neutral bg-neutral-focus p-4
`}
      key={post.id}
    >
      <VoteSection {...props} />
      <div className="w-full max-w-[95%]">
        <div className="mb-2 flex flex-row items-center justify-between gap-2 text-sm">
          <div className="flex flex-row gap-2">
            <Image
              className="rounded-full "
              src={`${author.profilePicture}`}
              alt="profile picture"
              width={24}
              height={24}
            />
            <div className="flex items-center gap-2 text-slate-500">
              <Link href={`/user/${author.username}`}>
                <span className="text-white hover:cursor-pointer hover:underline">
                  u/{author.username}
                </span>
              </Link>
              <span>-</span>
              <span>{`${dayjs(post.createdAt).fromNow()}`}</span>
            </div>
          </div>
          {isPostAuthor && <PostOptions {...props} />}
        </div>
        <h3 className="mb-3 break-words text-xl">{post.title}</h3>
        <p className="whitespace-pre-wrap break-words text-base">
          {post.content}
        </p>
        <>
          <CommentForm postId={post.id} />
          <div className="mb-5 mt-10 flex flex-col gap-8">
            {post.comments.map((comment) => (
              <PostComment key={comment.id} {...comment} />
            ))}
          </div>
        </>
      </div>
    </div>
  );
}
