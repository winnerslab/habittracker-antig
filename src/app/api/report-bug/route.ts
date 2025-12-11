import { NextResponse } from 'next/server';
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: Request) {
    try {
        const { summary, description, stepsToReproduce, severity, contactEmail } = await req.json();

        // Construct the formatted message
        const message = `
🚨 *New Bug Report* 🚨

📝 *Summary:*
${summary}

Example: "The login button is unresponsive on mobile"

ℹ️ *Description:*
${description}

👣 *Steps to Reproduce:*
${stepsToReproduce || "Not provided"}

🔥 *Severity:* ${severity}

📧 *Contact Email:* ${contactEmail || "Not provided"}
`.trim();

        const { success, errors } = await sendTelegramMessage(message);

        if (!success) {
            console.error('Telegram API error:', errors);
            return NextResponse.json(
                { error: 'Partially failed to send notifications', details: errors },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Bug report error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
