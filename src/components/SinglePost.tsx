import type { RouterOutputs } from "@/utils/api";
import Link from "next/link";
import Image from "next/image";

type PostWithUserInfo = RouterOutputs["post"]["getAll"][number];
interface SinglePostProps extends PostWithUserInfo {
  isPostPage?: boolean;
}

export const SinglePost = (props: SinglePostProps) => {
  const { post, author, isPostPage: isPost } = props;
  if (!isPost && post.content.length > 250) {
    post.content = post.content.slice(0, 250) + "...";
  }
  return (
    <Link href={`/post/${post.id}`} legacyBehavior>
      <div
        className={`box-border rounded-md border-[1px] border-neutral bg-neutral-focus p-4 ${
          isPost ? "" : "cursor-pointer hover:border-white"
        }`}
        key={post.id}
      >
        <div className="mb-2 flex flex-row gap-2">
          <Image
            className="rounded-full "
            src={`${author.profilePicture}`}
            alt="profile picture"
            width={24}
            height={24}
          />
          <div className="flex gap-2 text-slate-500">
            <Link href={`/user/${author.username}`}>
              <span className="text-white hover:cursor-pointer hover:underline">
                u/{author.username}
              </span>
            </Link>
            <span>-</span>
            <span>posted 1 hour ago</span>
          </div>
        </div>
        <h3 className="mb-3 text-xl">{post.title}</h3>
        <p className="text-lg">
          {post.content}
          {!isPost && post.content.length > 250 && (
            <Link
              className="ml-2 cursor-pointer text-primary hover:underline"
              href={`/post/${post.id}`}
            >
              Read More
            </Link>
          )}
        </p>
      </div>
    </Link>
  );
};
