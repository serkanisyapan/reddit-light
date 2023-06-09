import { AlertIcon } from "@/components/Icons";
import { Navbar } from "@/components/Navbar";
import { ProfileFeed } from "@/components/ProfileFeed";
import { ProfileFeedTabs } from "@/components/ProfileFeedTabs";
import ScrollToTop from "@/components/ScrollToTop";
import { api } from "@/utils/api";
import { generateSSGHelper } from "@/utils/ssgHelper";
import { useUser } from "@clerk/nextjs";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";

const FeedPage: NextPage<{ feed: string; username: string }> = ({
  feed,
  username,
}) => {
  const { user } = useUser();
  const { data } = api.profile.getUserProfile.useQuery(
    {
      username,
    },
    { refetchOnWindowFocus: false }
  );
  if (
    (feed === "upvoted" || feed === "downvoted") &&
    username !== user?.username
  ) {
    return (
      <div className="flex h-full w-full flex-col items-center">
        <Navbar />
        <div className="mt-52 flex flex-col items-center justify-center">
          <span className="flex flex-col items-center gap-2">
            <AlertIcon /> You do not have permission to access this page.
          </span>
          <span className="text-white text-opacity-60">
            You can only see your own votes.
          </span>
        </div>
      </div>
    );
  }
  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{username} - Profile</title>
        <meta name="description" content={`u/${username} profile page`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <ProfileFeedTabs username={username} />
      <ProfileFeed userId={data.id} feed={feed} />
      <ScrollToTop />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
  const username = context.params?.slug;
  const feed = context.params?.feed;
  if (typeof username !== "string") throw new Error("No slug found.");
  await ssg.profile.getUserProfile.prefetch({ username });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      feed,
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default FeedPage;
