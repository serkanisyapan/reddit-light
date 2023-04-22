import { toast } from "react-hot-toast";
import { ShareIcon } from "./Icons";

export default function MediaButtons(props: { postId: string }) {
  return (
    <button
      onClick={(event) => {
        event.stopPropagation();
        void navigator.clipboard.writeText(
          `https://reddit-light.vercel.app/post/${props.postId}`
        );
        toast.success("Copied to clipboard.");
      }}
      className="flex flex-row gap-2 pt-3 hover:text-white"
    >
      <ShareIcon />
      Share
    </button>
  );
}
