import type { PostType } from "@/types/postType";
import { api } from "@/utils/api";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { DeleteIcon, EditIcon, MoreIcon } from "./Icons";
import { LoadingSpinner } from "./LoadingSpinner";

export const PostOptions = (props: PostType) => {
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
        void ctx.post.getUserFeed.invalidate();
      }
      if (router.pathname === "/post/[id]") {
        void router.push("/");
      }
      toast.success("Successfully deleted!");
    },
    onError: () => {
      toast.error("Something went wrong. Try again.");
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
          <li className="flex flex-row items-center">
            <span>
              <EditIcon />
            </span>
            Edit Post
          </li>
        </Link>
        <li
          className="flex flex-row items-center"
          onClick={(event) => {
            event.stopPropagation();
            mutate({ id: post.id, userId: author.id });
          }}
        >
          <span>{isDeleting ? <LoadingSpinner /> : <DeleteIcon />}</span>
          Delete Post
        </li>
      </ul>
    </div>
  );
};
