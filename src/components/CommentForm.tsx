import useTextarea from "@/hooks/useTextarea";
import { api } from "@/utils/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "./LoadingSpinner";

export const CommentForm = (props: { postId: string }) => {
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const { user } = useUser();
  const ctx = api.useContext();
  const textareaRef = useTextarea();
  const { mutate, isLoading: isCommenting } = api.post.commentPost.useMutation({
    onSuccess: () => {
      setCommentText("");
      toast.success("Comment submitted!");
      void ctx.post.getPostById.invalidate();
    },
    onError: (e) => {
      if (typeof e === "object") {
        toast.error("Too many requests! Try again later.");
      } else {
        toast.error("Failed to comment! Please try again later.");
      }
    },
  });

  const handleComment = (text: string) => {
    if (!user) {
      toast.error("You must sign in to comment.");
      return;
    }
    void mutate({ comment: text, postId: props.postId, userId: user.id });
  };

  return (
    <form className="mt-10 flex flex-col items-end justify-end">
      <textarea
        onClick={(event) => event.stopPropagation()}
        ref={textareaRef}
        disabled={isCommenting}
        onChange={(event) => setCommentText(event.target.value)}
        value={commentText}
        placeholder="Leave a comment..."
        className={`textarea-bordered textarea textarea-md w-full overflow-hidden ${
          commentError ? "textarea-error" : ""
        }
        `}
      />
      <span className="mt-2 text-slate-500">{commentText.length}/191</span>
      <div className="w-full text-slate-400">
        {commentError && <span>{commentError}</span>}
      </div>
      <button
        onClick={(event) => {
          event.preventDefault();
          if (commentText.trim().length > 0) {
            handleComment(commentText);
          } else {
            setCommentError("Comment must be at least 1 character(s)");
            setTimeout(() => {
              setCommentError("");
            }, 1500);
          }
        }}
        disabled={isCommenting}
        className="btn-primary btn-sm btn mt-3 w-28"
        type="submit"
      >
        {isCommenting ? <LoadingSpinner /> : "Comment"}
      </button>
    </form>
  );
};
