import useScrollPosition from "@/hooks/useScrollPosition";
import { api } from "@/utils/api";
import { useEffect } from "react";
import { LoadingSpinner, SpinnerContainer } from "./LoadingSpinner";
import PostComment from "./PostComment";
import { SinglePost } from "./SinglePost";

export const ProfileFeed = (props: { userId: string; feed: string }) => {
  const scrollPosition = useScrollPosition();
  const {
    data,
    isLoading,
    hasNextPage: hasNextPosts,
    fetchNextPage: fetchNextPosts,
    isFetching: isPostsFetching,
  } = api.post.getUserFeed.useInfiniteQuery(
    {
      userId: props.userId,
      feed: props.feed,
      limit: 20,
    },
    {
      getNextPageParam: (lastPosts) => lastPosts.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (scrollPosition && hasNextPosts && !isLoading) {
      void fetchNextPosts();
    }
  }, [scrollPosition, hasNextPosts, isLoading, fetchNextPosts]);

  const fetchedPosts = data?.pages.flatMap((allPosts) => allPosts.posts);
  if (isLoading) return <SpinnerContainer />;
  if (!data || fetchedPosts?.length === 0) {
    return (
      <div className="mt-52 items-center text-2xl">
        User does not have any posts.
      </div>
    );
  }

  return (
    <div className="mb-8 mt-5 flex flex-col gap-3 md:w-full md:max-w-2xl">
      {fetchedPosts?.map((post) => {
        const findUserComment = post.post.comments.find(
          (comment) => comment.userId === props.userId
        );
        return (
          <div className="bg-neutral-focus" key={post.post.id}>
            <SinglePost {...post} />
            <hr></hr>
            {props.feed === "comments" && findUserComment && (
              <div className="ml-8 bg-neutral-focus p-4">
                <PostComment {...findUserComment} />
              </div>
            )}
          </div>
        );
      })}
      {isPostsFetching && (
        <div className="text-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};
