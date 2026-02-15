import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";

let isMonitoring = false;
let lastStatus: boolean | null = null;

const LLM_CHECK_INTERVAL = 60 * 1000; // 1 minute

const checkLLMStatus = async (): Promise<boolean> => {
    try {
        const url = `${process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434"}/api/tags`;
        const res = await fetch(url, { method: "HEAD", cache: "no-store" });
        return res.ok;
    } catch {
        return false;
    }
}

const notifyUsers = async () => {
    console.log("LLM is now ONLINE. Sending notifications...");

    try {
        const users = await prisma.user.findMany({
            where: { emailVerified: true },
            select: { email: true, name: true },
        });

        const year = new Date().getFullYear();

        const emailPromises = users.map((user) => {
            const html = `
<div style="background:#f4f6f8;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;padding:36px;
          box-shadow:0 10px 25px rgba(0,0,0,0.06);">

          <!-- HEADER -->
          <tr>
            <td align="center">
              <div style="
                width:60px;
                height:60px;
                border-radius:50%;
                background:#ecfdf5;
                display:flex;
                align-items:center;
                justify-content:center;
                margin-bottom:16px;">
                <span style="font-size:28px;">🚀</span>
              </div>

              <h2 style="margin:0 0 10px;color:#111827;font-size:22px;">
                LLM Service is Now Active
              </h2>

              <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.6;">
                Hello <strong>${user.name || "User"}</strong>,<br/>
                Your AI engine is back online and ready to power your workflows.
              </p>
            </td>
          </tr>

          <!-- STATUS BOX -->
          <tr>
            <td style="padding:28px 0;">
              <div style="
                background:#f0fdf4;
                border:1px solid #bbf7d0;
                border-radius:8px;
                padding:16px;
                text-align:center;
                font-size:14px;
                color:#166534;
                font-weight:600;">
                ● Status: ONLINE & Operational
              </div>
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${process.env.APP_URL}"
                style="
                background:#2563eb;
                color:#ffffff;
                text-decoration:none;
                padding:14px 30px;
                border-radius:8px;
                font-weight:600;
                display:inline-block;
                box-shadow:0 4px 12px rgba(37,99,235,0.3);">
                Open Zuno AI
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding-top:24px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">
                You're receiving this because you have an active Zuno AI account.
              </p>

              <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
                © ${year} Zuno AI. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</div>
`;

            return sendEmail({
                to: user.email,
                subject: "🚀 Zuno AI is Back Online",
                html,
                text: `Hello ${user.name || "User"}, The LLM service is now active and operational. Visit ${process.env.APP_URL}`,
            });
        });

        await Promise.allSettled(emailPromises);
        console.log("Notifications sent.");
    } catch (error) {
        console.error("Failed to fetch users or send emails:", error);
    }
}

export const startMonitoring = () => {
    if (isMonitoring) return;
    isMonitoring = true;

    console.log("Starting LLM monitoring service...");

    // Initial check (don't send email on startup, just set state)
    checkLLMStatus().then((status) => {
        lastStatus = status;
        console.log(`Initial LLM status: ${status ? "ONLINE" : "OFFLINE"}`);
    });

    setInterval(async () => {
        const currentStatus = await checkLLMStatus();

        if (lastStatus === false && currentStatus === true) {
            // Transition from Offline -> Online
            await notifyUsers();
        } else if (lastStatus === true && currentStatus === false) {
            console.log("LLM went OFFLINE.");
        }

        lastStatus = currentStatus;
    }, LLM_CHECK_INTERVAL);
}
