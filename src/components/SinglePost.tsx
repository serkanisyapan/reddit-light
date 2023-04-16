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
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import PostComment from "./PostComment";
import useTextarea from "@/hooks/useTextarea";
dayjs.extend(relativeTime);

type PostWithUserInfo = RouterOutputs["post"]["getAll"]["posts"][number];
interface SinglePostProps extends PostWithUserInfo {
  isPostPage?: boolean;
}

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
            {!isPostPage && post.content.length > 250 && (
              <Link
                className="ml-2 cursor-pointer text-primary hover:underline"
                href={`/post/${post.id}`}
              >
                Read More
              </Link>
            )}
          </p>
          {isPostPage && (
            <>
              <CommentForm postId={post.id} />
              <div className="mb-5 mt-10 flex flex-col gap-8">
                {post.comments.map((comment) => (
                  <PostComment key={comment.id} {...comment} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

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
  const [voteCount, setVoteCount] = useState(0);
  const [isVoted, setIsVoted] = useState({ voted: false, value: 0 });
  const { post } = props;
  const ctx = api.useContext();
  const { mutate, isLoading: isVoting } = api.post.votePost.useMutation({
    onMutate: (context) => {
      if (isVoted.voted && isVoted.value === context.value) {
        if (context.value === 1) {
          setVoteCount((prev) => prev - 1);
        } else {
          setVoteCount((prev) => prev + 1);
        }
        setIsVoted({ voted: false, value: 0 });
      } else {
        setIsVoted({ voted: true, value: context.value });
        setVoteCount((prev) => prev + context.value);
      }
    },
    onSuccess: () => {
      void ctx.post.getAll.invalidate();
    },
  });
  const { user } = useUser();

  const handlePostVote = (voteType: string) => {
    if (!user) return;
    mutate({
      value: voteType === "upvote" ? 1 : -1,
      postId: post.id,
      userId: user?.id,
    });
  };

  useEffect(() => {
    const isUserVotedPost = () => {
      const findVote = post.votes.find((vote) => vote.userId === user?.id);
      if (!findVote) return;
      setIsVoted({ voted: findVote ? true : false, value: findVote.value });
    };
    const postVoteCount = () => {
      let voteCount = 0;
      for (const vote of post.votes) {
        voteCount += vote.value;
      }
      setVoteCount(voteCount);
      return voteCount;
    };
    postVoteCount();
    isUserVotedPost();
  }, [post.votes, user?.id]);

  return (
    <div className="mr-3 flex flex-col items-center">
      <UpvoteIcon
        isVoting={isVoting}
        isVoted={isVoted}
        handlePostVote={handlePostVote}
      />
      <span>{voteCount}</span>
      <DownvoteIcon
        isVoting={isVoting}
        isVoted={isVoted}
        handlePostVote={handlePostVote}
      />
    </div>
  );
};

const CommentForm = (props: { postId: string }) => {
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
    if (!user) throw new Error("UNAUTHORIZED");
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
