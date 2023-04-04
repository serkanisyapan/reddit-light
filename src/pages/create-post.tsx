import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postValidation } from "@/utils/postValidation";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type PostInputs = {
  title: string;
  content: string;
};

export default function App() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostInputs>({
    resolver: zodResolver(postValidation),
    defaultValues: {
      title: "",
      content: "",
    },
  });
  const { mutate, isLoading: isPosting } = api.post.createPost.useMutation({
      onSuccess: () => {
          router.push("/")
        }
    });

  const onSubmit: SubmitHandler<PostInputs> = (data) => {
    mutate({content: data.content, title: data.title})
  };

  return (
    <div className="flex h-screen justify-center">
      <form
        className="mt-16 flex w-96 flex-col p-2"
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
          className={`textarea-primary textarea text-base ${
            errors.content ? "textarea-error" : ""
          }`}
          {...register("content", { required: true })}
        />
        {errors.content && <span>This field is required</span>}
        <button disabled={isPosting} className="btn-primary btn mt-5" type="submit">
          {isPosting ? <LoadingSpinner /> : "Create Post"}
        </button>
      </form>
    </div>
  );
}
