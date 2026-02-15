export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Import the monitor dynamically to avoid side effects during build
        const { startMonitoring } = await import('@/lib/llm-monitor');
        startMonitoring();
    }
}
