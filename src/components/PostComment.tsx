import { type Comment } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { DeleteIcon, EditIcon, MoreIcon } from "./Icons";
import { LoadingSpinner } from "./LoadingSpinner";
import type { PostType } from "@/types/postType";
dayjs.extend(relativeTime);

export default function PostComment(props: Comment) {
  return (
    <div className="flex bg-neutral-focus">
      <div className="w-full max-w-[95%]">
        <div className="mb-2 flex flex-row items-center justify-between gap-2 text-sm">
          <div className="flex flex-row gap-2">
            <Image
              className="rounded-full "
              src={`${props.picture}`}
              alt="profile picture"
              height={24}
              width={24}
            />
            <div className="flex items-center gap-2 text-slate-500">
              <Link href={`/user/${props.username}`}>
                <span className="text-white hover:cursor-pointer hover:underline">
                  u/{props.username}
                </span>
              </Link>
              <span>-</span>
              <span>{`${dayjs(props.createdAt).fromNow()}`}</span>
            </div>
          </div>
        </div>
        <p className="whitespace-pre-wrap break-words text-base">
          {props.comment}
        </p>
      </div>
    </div>
  );
}

const CommentOptions = (props: PostType) => {
  const { post, author } = props;
  return (
    <div className="dropdown-end dropdown">
      <label
        onClick={(event) => event.stopPropagation()}
        tabIndex={0}
        className="cursor-pointer"
      >
        <MoreIcon />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow"
      >
        <Link href={`/post/edit/${post.id}`}>
          <li>
            <a>
              <EditIcon />
              Edit Comment
            </a>
          </li>
        </Link>
        <li>
          <a>
            {/* {isDeleting ? <LoadingSpinner /> : <DeleteIcon />} */}
            Delete Comment
          </a>
        </li>
      </ul>
    </div>
  );
};
