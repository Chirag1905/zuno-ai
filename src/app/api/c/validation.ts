import { z } from "zod";

export const IdSchema = z.object({
    id: z.cuid({ message: "Invalid chat ID" }),
});

export const UpdateChatSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
});