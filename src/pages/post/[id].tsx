import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "@/utils/api";
import { generateSSGHelper } from "@/utils/ssgHelper";
import { Navbar } from "@/components/Navbar";
import PostView from "@/components/PostView";

const PostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.post.getPostById.useQuery(
    {
      id,
    },
    { refetchOnWindowFocus: false }
  );
  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.title} - ${data.author.username}`}</title>
        <meta
          name="description"
          content={`Posted by u/${data.author.username} - ${data.post._count.comments} comments and ${data.post.postVoteSum} votes`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <div className="mt-5 md:w-full md:max-w-2xl">
        <PostView {...data} />
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
  const id = context.params?.id;
  if (typeof id !== "string") throw new Error("No id found.");
  await ssg.post.getPostById.prefetch({ id });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default PostPage;
