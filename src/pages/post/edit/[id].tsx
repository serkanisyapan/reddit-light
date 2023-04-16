import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postValidation } from "@/utils/postValidation";
import { api } from "@/utils/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { GetStaticProps, NextPage } from "next";
import { generateSSGHelper } from "@/utils/ssgHelper";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import useTextarea from "@/hooks/useTextarea";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";

type PostInputs = {
  title: string;
  content: string;
};

const EditPostPage: NextPage<{ id: string }> = ({ id }) => {
  const textareaRef = useTextarea();
  const { data } = api.post.getPostById.useQuery({
    id,
  });
  const router = useRouter();
  const { mutate, isLoading: isEditing } = api.post.editPost.useMutation({
    onSuccess: () => {
      const id = router.query.id as string;
      void router.push(`/post/${id}`);
      toast.success("Successfully  edited!");
    },
    onError: () => {
      toast.error("Failed to edit! Please try again later.");
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostInputs>({
    resolver: zodResolver(postValidation),
    defaultValues: {
      title: data?.post.title || "",
      content: data?.post.content || "",
    },
  });

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, []);

  const onSubmit: SubmitHandler<PostInputs> = (editData) => {
    if (!data) throw new Error("Post does not exist.");
    void mutate({ id: data.post.id, userId: data.author.id, data: editData });
  };
  const { ref, ...rest } = register("content", { required: true });

  if (!data) return <div>404</div>;

  return (
    <div className="flex h-full w-full flex-col">
      <Navbar />
      <div className="flex h-full w-full justify-center">
        <form
          className="mt-16 flex w-2/5 flex-col p-2"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label className="label">
              <span className="label-text">title</span>
            </label>
            <input
              type="text"
              className={`input-primary input w-full ${
                errors.title ? "input-error" : ""
              }`}
              {...register("title")}
            />
            {errors.title && <span>This field is required</span>}
          </div>
          <label className="label mt-3">
            <span className="label-text">text</span>
          </label>
          <textarea
            className={`min-h-36 textarea-primary textarea textarea-md overflow-hidden text-lg ${
              errors.content ? "textarea-error" : ""
            }`}
            {...rest}
            ref={(e) => {
              ref(e);
              textareaRef.current = e;
            }}
          />
          {errors.content && <span>This field is required</span>}
          <button
            disabled={isEditing}
            className="btn-primary btn mt-5"
            type="submit"
          >
            {isEditing ? <LoadingSpinner /> : "Edit Post"}
          </button>
        </form>
      </div>
    </div>
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

export default EditPostPage;
