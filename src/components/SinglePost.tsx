import type { RouterOutputs } from "@/utils/api";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useUser } from "@clerk/nextjs";
import { PostOptions } from "./PostOptions";
import { VoteSection } from "./VoteSection";
dayjs.extend(relativeTime);

type PostType = RouterOutputs["post"]["getAll"]["posts"][number];

export const SinglePost = (props: PostType) => {
  const { post, author } = props;
  const { user } = useUser();
  const isPostAuthor = post.authorId === user?.id;
  if (post.content.length > 250) {
    post.content = post.content.slice(0, 250) + "...";
  }

  return (
    <Link href={`/post/${post.id}`} legacyBehavior>
      <div
        className="box-border flex cursor-pointer rounded-md border-[1px] border-neutral bg-neutral-focus
          p-4 hover:border-white
        "
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
            {post.content.length > 250 && (
              <Link
                className="ml-2 cursor-pointer text-primary hover:underline"
                href={`/post/${post.id}`}
              >
                Read More
              </Link>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
};
