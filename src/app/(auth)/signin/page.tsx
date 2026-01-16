// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { authClient } from "@/lib/auth-client";
// import toast from "react-hot-toast";
// import { signInWithProvider } from "@/lib/social-auth";

// export default function SignInPage() {
//     const router = useRouter();

//     const [loading, setLoading] = useState(false);
//     const [googleLoading, setGoogleLoading] = useState(false);
//     const [githubLoading, setGithubLoading] = useState(false);

//     async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//         e.preventDefault();
//         if (loading) return;

//         setLoading(true);

//         const formData = new FormData(e.currentTarget);

//         const res = await authClient.signIn.email({
//             email: formData.get("email") as string,
//             password: formData.get("password") as string,
//         });

//         setLoading(false);

//         if (res.error) {
//             toast.error(res.error.message || "Invalid credentials");
//             return;
//         }

//         toast.success("Signed in successfully");
//         router.push("/dashboard");
//     }

//     return (
//         <main className="min-h-screen flex items-center justify-center bg-black px-4">
//             <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-lg space-y-6">

//                 <div className="text-center">
//                     <h1 className="text-2xl font-bold text-white">Welcome back</h1>
//                     <p className="text-sm text-neutral-400">Sign in to your account</p>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <input
//                         name="email"
//                         type="email"
//                         placeholder="Email"
//                         required
//                         disabled={loading}
//                         className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 text-white"
//                     />
//                     <input
//                         name="password"
//                         type="password"
//                         placeholder="Password"
//                         required
//                         disabled={loading}
//                         className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 text-white"
//                     />

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full rounded-md bg-white text-black font-medium py-2 disabled:opacity-60"
//                     >
//                         {loading ? "Signing in..." : "Sign In"}
//                     </button>
//                 </form>

//                 <div className="flex items-center gap-3">
//                     <div className="h-px flex-1 bg-neutral-800" />
//                     <span className="text-xs text-neutral-500">OR</span>
//                     <div className="h-px flex-1 bg-neutral-800" />
//                 </div>

//                 <div className="space-y-3">
//                     <button
//                         onClick={() =>
//                             signInWithProvider("google", setGoogleLoading)
//                         }
//                         disabled={googleLoading}
//                         className="w-full rounded-md border border-neutral-700 bg-neutral-900 py-2 text-white disabled:opacity-60"
//                     >
//                         {googleLoading ? "Connecting..." : "Continue with Google"}
//                     </button>

//                     <button
//                         onClick={() =>
//                             signInWithProvider("github", setGithubLoading)
//                         }
//                         disabled={githubLoading}
//                         className="w-full rounded-md border border-neutral-700 bg-neutral-900 py-2 text-white disabled:opacity-60"
//                     >
//                         {githubLoading ? "Connecting..." : "Continue with GitHub"}
//                     </button>
//                 </div>

//                 <p className="text-center text-sm text-neutral-400">
//                     Don’t have an account?{" "}
//                     <a href="/signup" className="text-white hover:underline">
//                         Sign up
//                     </a>
//                 </p>
//             </div>
//         </main>
//     );
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

import AuthLayout from "@/app/components/Layout/AuthLayout";
import InputField from "@/app/utils/InputField";
import SocialButtons from "@/app/utils/SocialButtons";

export default function SignInPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email) {
            setErrors({ email: "Email is required" });
            setLoading(false);
            return;
        }

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        // const res = await authClient.signIn.email({ email, password });
        setLoading(false);

        // if (res.error) {
        //     if (res.error.code === "EMAIL_NOT_VERIFIED") {
        //         toast.error("Please verify your email. Check your inbox.");
        //         return;
        //     }
        //     toast.error(res.error.message || "Invalid credentials");
        //     return;
        // }

        toast.success(data.data.message || "Signed in successfully");
        router.push("/dashboard");
    }

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your account"
            footer={
                <p className="text-center text-sm text-neutral-400">
                    Don’t have an account?{" "}
                    <a href="/signup" className="text-white hover:underline">
                        SignUp
                    </a>
                </p>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                    name="email"
                    type="email"
                    placeholder="Email"
                    error={errors.email}
                    disabled={loading}
                    required
                />

                <InputField
                    name="password"
                    type="password"
                    placeholder="Password"
                    error={errors.password}
                    disabled={loading}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-white text-black py-2 font-medium disabled:opacity-60"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>

            <Divider />

            <SocialButtons
                googleLoading={googleLoading}
                githubLoading={githubLoading}
                setGoogleLoading={setGoogleLoading}
                setGithubLoading={setGithubLoading}
            />
        </AuthLayout>
    );
}

function Divider() {
    return (
        <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-800" />
            <span className="text-xs text-neutral-500">OR</span>
            <div className="h-px flex-1 bg-neutral-800" />
        </div>
    );
}
