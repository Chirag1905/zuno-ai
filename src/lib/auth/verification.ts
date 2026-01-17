import { sendEmail } from "@/lib/mail";
import prisma from "@/lib/prisma";
import crypto from "crypto";

/* =====================================================
   VERIFY EMAIL
===================================================== */

export async function sendEmailVerification(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const year = new Date().getFullYear();

  await prisma.verification.create({
    data: {
      id: crypto.randomUUID(),
      identifier: email,
      value: token,
      type: "EMAIL_VERIFY",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const link = `${process.env.APP_URL}/verify-email?token=${token}`;

  const html = `
<div style="background:#f4f6f8;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:8px;padding:32px;
          box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <tr>
            <td align="center">
              <h2 style="margin:0 0 10px;color:#111827;">Verify your email</h2>
              <p style="margin:0;color:#6b7280;font-size:15px;">
                Click the button below to verify your email address.
              </p>
            </td>
          </tr>

          <!-- BUTTON -->
          <tr>
            <td align="center" style="padding:28px 0;">
              <a href="${link}"
                style="background:#2563eb;color:#ffffff;text-decoration:none;
                padding:14px 32px;border-radius:6px;font-weight:600;
                display:inline-block;">
                Verify Email
              </a>
            </td>
          </tr>

          <!-- FALLBACK LINK -->
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:14px;color:#374151;">
                If the button doesn’t work, use the link below:
              </p>

              <div style="
                background:#f9fafb;
                border:1px solid #e5e7eb;
                padding:12px;
                border-radius:6px;
                font-size:13px;
                color:#111827;
                word-break:break-all;">
                ${link}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding-top:24px;">
              <p style="margin:0;font-size:14px;color:#6b7280;">
                This link expires in <strong>10 minutes</strong>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding-top:28px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
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

  await sendEmail({
    to: email,
    subject: "Verify your email address",
    html,
    text: `Verify your email (expires in 10 minutes): ${link}`,
  });
}

/* =====================================================
   MFA / OTP EMAIL
===================================================== */

export async function sendMfaOtp(email: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const year = new Date().getFullYear();

  await prisma.verification.create({
    data: {
      id: crypto.randomUUID(),
      identifier: email,
      value: otp,
      type: "MFA_OTP",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  const html = `
<div style="background:#f4f6f8;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:8px;padding:32px;
          box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <tr>
            <td align="center">
              <h2 style="margin:0 0 8px;color:#111827;">Login Verification</h2>
              <p style="margin:0;color:#6b7280;font-size:15px;">
                Use the verification code below to complete your login.
              </p>
            </td>
          </tr>

          <!-- OTP -->
          <tr>
            <td align="center" style="padding:28px 0;">
              <div style="
                font-size:32px;
                letter-spacing:6px;
                font-weight:700;
                color:#2563eb;
                background:#f9fafb;
                border:1px solid #e5e7eb;
                padding:14px 24px;
                border-radius:8px;
                display:inline-block;">
                ${otp}
              </div>

              <p style="margin-top:8px;font-size:13px;color:#6b7280;">
                You can select and copy this code if needed.
              </p>
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin:0;font-size:14px;color:#6b7280;">
                This code is valid for <strong>5 minutes</strong>.
              </p>
              <p style="margin:10px 0 0;font-size:14px;color:#6b7280;">
                If you didn’t try to log in, please secure your account.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding-top:28px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                © ${year} Zuno AI. Security Team
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>
`;

  await sendEmail({
    to: email,
    subject: "Your login verification code",
    html,
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
}