import { api, type RouterOutputs } from "@/utils/api";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  DeleteIcon,
  DownvoteIcon,
  EditIcon,
  MoreIcon,
  UpvoteIcon,
} from "./Icons";
import { useUser } from "@clerk/nextjs";
import { LoadingSpinner } from "./LoadingSpinner";
import { useRouter } from "next/router";
dayjs.extend(relativeTime);

type PostWithUserInfo = RouterOutputs["post"]["getAll"][number];
interface SinglePostProps extends PostWithUserInfo {
  isPostPage?: boolean;
}

const PostOptions = (props: SinglePostProps) => {
  const { post, author } = props;
  const router = useRouter();
  const ctx = api.useContext();
  const { mutate, isLoading: isDeleting } = api.post.deletePost.useMutation({
    onSuccess: () => {
      if (!router) return;
      if (router.pathname === "/") {
        void ctx.post.getAll.invalidate();
      }
      if (router.pathname === "/user/[slug]") {
        void ctx.post.getPostsByUserId.invalidate();
      }
      if (router.pathname === "/post/[id]") {
        void router.push("/");
      }
    },
  });
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
              Edit Post
            </a>
          </li>
        </Link>
        <li
          onClick={(event) => {
            event.stopPropagation();
            mutate({ id: post.id, userId: author.id });
          }}
        >
          <a>
            {isDeleting ? <LoadingSpinner /> : <DeleteIcon />}
            Delete Post
          </a>
        </li>
      </ul>
    </div>
  );
};

const VoteSection = (props: SinglePostProps) => {
  const { post } = props;
  return (
    <div className="mr-3 flex flex-col items-center">
      <UpvoteIcon />
      <span>{post.upvotes}</span>
      <DownvoteIcon />
    </div>
  );
};

export const SinglePost = (props: SinglePostProps) => {
  const { post, author, isPostPage } = props;
  const { user } = useUser();

  const isPostAuthor = post.authorId === user?.id;
  if (!isPostPage && post.content.length > 250) {
    post.content = post.content.slice(0, 250) + "...";
  }

  return (
    <Link href={`/post/${post.id}`} legacyBehavior>
      <div
        className={`box-border flex rounded-md border-[1px] border-neutral bg-neutral-focus p-4 ${
          isPostPage ? "" : "cursor-pointer hover:border-white"
        }`}
        key={post.id}
      >
        <VoteSection {...props} />
        <div>
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
          <h3 className="mb-3 text-xl">{post.title}</h3>
          <p className="whitespace-pre-wrap text-base">
            {post.content}
            {!isPostPage && post.content.length > 250 && (
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
