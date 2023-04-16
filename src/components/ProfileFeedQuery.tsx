import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";

const postFeedOptions = ["posts", "upvoted", "downvoted", "comments"];

export const ProfileFeedQuery = (props: { username: string }) => {
  const { user } = useUser();
  const router = useRouter();
  if (!user || user.username !== props.username) return <div />;
  return (
    <>
      <div className="tabs">
        {postFeedOptions.map((feedOption, _id) => (
          <div
            onClick={(event) => {
              void router.push({
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                pathname: `/user/${props.username}/${event.currentTarget.textContent}`,
              });
            }}
            key={_id}
            className={`tab-bordered tab tab-lg ${
              router.query?.feed === feedOption ? "tab-active" : ""
            }`}
          >
            {feedOption}
          </div>
        ))}
      </div>
    </>
  );
};
