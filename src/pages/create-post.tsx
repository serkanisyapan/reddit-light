import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const postValidator = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title must be between 1-255 chars." })
    .max(255),
  content: z.string().trim().min(1, { message: "Text cannot be empty." }),
});

type PostInputs = {
  title: string;
  content: string;
};

export default function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostInputs>({
    resolver: zodResolver(postValidator),
    defaultValues: {
      title: "",
      content: "",
    },
  });
  const onSubmit: SubmitHandler<PostInputs> = (data) => console.log(data);

  return (
    <div data-theme="halloween" className="flex h-screen justify-center">
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
        <button className="btn-primary btn mt-5" type="submit">
          Create Post
        </button>
      </form>
    </div>
  );
}
