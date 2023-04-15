import { type Comment } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
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
