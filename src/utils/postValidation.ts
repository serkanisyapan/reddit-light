import { z } from "zod";

export const postValidation = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title must be between 1-255 chars." })
    .max(255),
  content: z.string().trim().min(1, { message: "Text cannot be empty." }),
});
