"use client";

import Button from "@/components/ui/Button";

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
            <Button
                onClick={() => { window.location.href = "/api/auth/oauth/google"; setGoogleLoading(true) }}
                text={googleLoading ? "Connecting..." : "Continue with Google"}
                disabled={googleLoading}
                textClassName="text-white"
                className="w-full justify-center rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 py-2 disabled:opacity-60"
            />

            <Button
                onClick={() => { window.location.href = "/api/auth/oauth/github"; setGithubLoading(true) }}
                text={githubLoading ? "Connecting..." : "Continue with GitHub"}
                disabled={githubLoading}
                textClassName="text-white"
                className="w-full justify-center rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 py-2 disabled:opacity-60"
            />
        </div>
    );
}
