import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postValidation } from "@/utils/postValidation";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "react-hot-toast";
import { Navbar } from "@/components/Navbar";
import useTextarea from "@/hooks/useTextarea";

type PostInputs = {
  title: string;
  content: string;
};

export default function App() {
  const router = useRouter();
  const textareaRef = useTextarea();
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
      void router.push("/");
      toast.success("Successfully created!");
    },
    onError: (e) => {
      if (typeof e === "object") {
        toast.error("Too many requests! Try again later.");
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });
  const { ref, ...rest } = register("content", { required: true });

  const onSubmit: SubmitHandler<PostInputs> = (data) => {
    void mutate({ content: data.content, title: data.title });
  };

  return (
    <div className="flex h-full w-full flex-col">
      <Navbar />
      <div className="flex h-screen justify-center">
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
            {errors.title && <span>Title cannot be empty</span>}
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
          {errors.content && <span>Text cannot be empty</span>}
          <button
            disabled={isPosting}
            className="btn-primary btn mt-5"
            type="submit"
          >
            {isPosting ? <LoadingSpinner /> : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
}

// https://blog.logrocket.com/react-hook-form-complete-guide/
