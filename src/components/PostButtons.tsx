import { toast } from "react-hot-toast";
import { CommentIcon, ShareIcon } from "./Icons";

export default function PostButtons(props: {
  postId: string;
  commentCount: number;
}) {
  return (
    <div className="mt-2 flex flex-row gap-5">
      <button className="flex flex-row items-center gap-2 pt-3">
        <CommentIcon />
        {props.commentCount} Comments
      </button>
      <button
        onClick={(event) => {
          event.stopPropagation();
          void navigator.clipboard.writeText(
            `https://reddit-light.vercel.app/post/${props.postId}`
          );
          toast.success("Copied to clipboard.");
        }}
        className="flex flex-row items-center gap-2 pt-3 hover:text-white"
      >
        <ShareIcon />
        Share
      </button>
    </div>
  );
}
