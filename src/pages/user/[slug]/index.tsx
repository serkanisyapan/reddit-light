import { Navbar } from "@/components/Navbar";
import { ProfileFeed } from "@/components/ProfileFeed";
import { ProfileFeedTabs } from "@/components/ProfileFeedTabs";
import ScrollToTop from "@/components/ScrollToTop";
import { api } from "@/utils/api";
import { generateSSGHelper } from "@/utils/ssgHelper";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserProfile.useQuery(
    {
      username,
    },
    { refetchOnWindowFocus: false }
  );
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
      <ProfileFeed userId={data.id} feed="posts" />
      <ScrollToTop />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
  const username = context.params?.slug;
  if (typeof username !== "string") throw new Error("No slug found.");
  await ssg.profile.getUserProfile.prefetch({ username });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
