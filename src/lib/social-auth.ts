import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

export async function signInWithProvider(
  provider: "google" | "github",
  setLoading: (v: boolean) => void
) {
  try {
    setLoading(true);
    await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard",
    });
  } catch (err: any) {
    toast.error(err?.message || `Failed to sign in with ${provider}`);
    setLoading(false);
  }
}