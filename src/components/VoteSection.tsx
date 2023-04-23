import type { PostType } from "@/types/postType";
import { api } from "@/utils/api";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { DownvoteIcon, UpvoteIcon } from "./Icons";

export const VoteSection = (props: PostType) => {
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
    if (!user) {
      toast.error("You must sign in to vote.");
      return;
    }
    mutate({
      value: voteType === "upvote" ? 1 : -1,
      postId: post.id,
      userId: user?.id,
    });
  };

  useEffect(() => {
    const isUserVotedPost = () => {
      if (!user) return;
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
  }, [post.votes, user?.id, user]);

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
