export function detectBestModel(prompt: string) {
    const p = prompt.toLowerCase();

    // 👨‍💻 Coding / Dev
    if (
        p.includes("code") ||
        p.includes("bug") ||
        p.includes("error") ||
        p.includes("typescript") ||
        p.includes("javascript") ||
        p.includes("react") ||
        p.includes("next") ||
        p.includes("api") ||
        p.includes("sql") ||
        p.includes("optimize") ||
        p.includes("algorithm")
    ) {
        return "deepseek";
    }

    // 🧮 Math / Logic
    if (
        p.match(/\d+/) &&
        (p.includes("solve") ||
            p.includes("calculate") ||
            p.includes("proof") ||
            p.includes("formula"))
    ) {
        return "qwen";
    }

    // ✍️ Writing / Creative
    if (
        p.includes("story") ||
        p.includes("blog") ||
        p.includes("rewrite") ||
        p.includes("improve writing") ||
        p.includes("email") ||
        p.includes("caption")
    ) {
        return "mistral";
    }

    // 💬 Default
    return "llama";
}
