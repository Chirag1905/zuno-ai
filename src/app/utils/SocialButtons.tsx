"use client";

import { signInWithProvider } from "@/lib/social-auth";

type Props = {
    googleLoading: boolean;
    githubLoading: boolean;
    setGoogleLoading: (v: boolean) => void;
    setGithubLoading: (v: boolean) => void;
};

export default function SocialButtons({
    googleLoading,
    githubLoading,
    setGoogleLoading,
    setGithubLoading,
}: Props) {
    return (
        <div className="space-y-3">
            <button
                onClick={() => signInWithProvider("google", setGoogleLoading)}
                disabled={googleLoading}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2 text-white disabled:opacity-60"
            >
                {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>

            <button
                onClick={() => signInWithProvider("github", setGithubLoading)}
                disabled={githubLoading}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2 text-white disabled:opacity-60"
            >
                {githubLoading ? "Connecting..." : "Continue with GitHub"}
            </button>
        </div>
    );
}
