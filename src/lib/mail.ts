import nodemailer from "nodemailer";

/* =============================
   TRANSPORTER
============================= */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/* =============================
   TYPES
============================= */
type EmailPayload = {
    to: string;
    subject: string;
    text?: string;
    html?: string;
};

/* =============================
   FUNCTION OVERLOADS
============================= */
export async function sendEmail(
    to: string,
    subject: string,
    text?: string
): Promise<void>;

export async function sendEmail(payload: EmailPayload): Promise<void>;

/* =============================
   IMPLEMENTATION
============================= */
export async function sendEmail(
    arg1: string | EmailPayload,
    subject?: string,
    text?: string
): Promise<void> {
    // Normalize payload
    const payload: EmailPayload =
        typeof arg1 === "string"
            ? {
                to: arg1,
                subject: subject!,
                text,
            }
            : arg1;

    // Send email
    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
    });
}