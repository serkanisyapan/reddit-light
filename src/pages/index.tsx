import { type NextPage } from "next";
import { api } from "@/utils/api";
import { Navbar } from "@/components/Navbar";
import { LoadingSpinner, SpinnerContainer } from "@/components/LoadingSpinner";
import { SinglePost } from "@/components/SinglePost";
import useScrollPosition from "@/hooks/useScrollPosition";
import { useEffect } from "react";
import ScrollToTop from "@/components/ScrollToTop";

const Home: NextPage = () => {
  const {
    data,
    hasNextPage: hasNextPosts,
    fetchNextPage: fetchNextPosts,
    isLoading: isPostsLoading,
    isFetching: isPostsFetching,
  } = api.post.getAll.useInfiniteQuery(
    {
      limit: 15,
    },
    {
      getNextPageParam: (lastPosts) => lastPosts.nextCursor,
      refetchOnWindowFocus: false,
    }
  );
  const { scrollPosition } = useScrollPosition();

  let postContent;
  if (isPostsLoading) {
    postContent = <SpinnerContainer />;
  } else if (!data) {
    postContent = <div className="h-screen">Something went wrong...</div>;
  }

  const fetchedPosts = data?.pages.flatMap((allPosts) => allPosts.posts);
  if (data) {
    postContent = (
      <div className="mt-5 flex flex-col">
        {fetchedPosts?.map((post) => (
          <SinglePost {...post} key={post.post.id} />
        ))}
        {isPostsFetching && (
          <div className="text-center">
            <LoadingSpinner />
          </div>
        )}
        <ScrollToTop />
      </div>
    );
  }

  useEffect(() => {
    if (scrollPosition && hasNextPosts && !isPostsLoading) {
      void fetchNextPosts();
    }
  }, [scrollPosition, hasNextPosts, isPostsLoading, fetchNextPosts]);

  return (
    <>
      <Navbar />
      <div className="mb-8 md:w-full md:max-w-2xl">{postContent}</div>
    </>
  );
};

export default Home;
