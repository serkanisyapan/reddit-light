import { api } from "@/utils/api";
import { SpinnerContainer } from "./LoadingSpinner";
import { SinglePost } from "./SinglePost";

export const ProfileFeed = (props: { userId: string; feed: string }) => {
  const { data, isLoading } = api.post.getUserFeed.useQuery(
    {
      userId: props.userId,
      feed: props.feed,
    },
    { refetchOnWindowFocus: false }
  );

  if (isLoading) return <SpinnerContainer />;
  if (!data || data.length === 0)
    return (
      <div className="mt-52 items-center text-2xl">
        User does not have any posts.
      </div>
    );

  return (
    <div className="mb-8 mt-5 flex flex-col gap-3 md:w-full md:max-w-2xl">
      {data.map((post) => (
        <SinglePost {...post} key={post.post.id} />
      ))}
    </div>
  );
};
