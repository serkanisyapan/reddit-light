import type { RouterOutputs } from "@/utils/api";
import Link from "next/link";
import Image from "next/image";

type PostWithUserInfo = RouterOutputs["post"]["getAll"][number];

export const SinglePost = (props: PostWithUserInfo) => {
  const { post, author } = props;
  return (
    <Link href={`/post/${post.id}`} legacyBehavior>
      <div
        className="box-border cursor-pointer rounded-md border-[1px] border-neutral bg-neutral p-4 hover:border-white"
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
        <p className="text-lg">{post.content}</p>
      </div>
    </Link>
  );
};
