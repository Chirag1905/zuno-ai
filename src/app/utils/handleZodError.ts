import { z, ZodError } from "zod";

export function formatZodError(error: ZodError) {
  return z.flattenError(error).fieldErrors;
}