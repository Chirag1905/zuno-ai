import { z } from "zod";

export const IdSchema = z.object({
    id: z.uuid("Invalid user ID"),
});
