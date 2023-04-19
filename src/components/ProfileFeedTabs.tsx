import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/router";

const postFeedOptions = ["posts", "upvoted", "downvoted", "comments"];
const visitorOptions = ["posts", "comments"];

interface TabsType {
  feedOption: string;
  username: string;
  key: number;
}

const Tabs = ({ feedOption, username }: TabsType) => {
  const router = useRouter();
  return (
    <Link
      href={`/user/${username}/${feedOption}`}
      className={`tab-bordered tab tab-sm md:tab-lg ${
        router.query?.feed === feedOption ||
        (!router.query?.feed && feedOption === "posts")
          ? "tab-active"
          : ""
      }`}
    >
      {feedOption}
    </Link>
  );
};

export const ProfileFeedTabs = (props: { username: string }) => {
  const { user } = useUser();
  if (!user || user.username !== props.username)
    return (
      <div tabIndex={0} className="tabs">
        {visitorOptions.map((feedOption, id) => (
          <Tabs feedOption={feedOption} key={id} username={props.username} />
        ))}
      </div>
    );
  return (
    <div tabIndex={0} className="tabs">
      {postFeedOptions.map((feedOption, id) => (
        <Tabs feedOption={feedOption} key={id} username={props.username} />
      ))}
    </div>
  );
};
