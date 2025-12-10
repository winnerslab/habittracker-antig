import { NextResponse } from 'next/server';

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

        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        console.log("Debug: Attempting to send Telegram message", {
            hasToken: !!telegramToken,
            hasChatId: !!chatId,
            tokenLength: telegramToken?.length,
            chatId
        });

        if (!telegramToken || !chatId) {
            console.error('Telegram credentials missing in environment variables');
            return NextResponse.json(
                { error: 'Server configuration error: Missing credentials' },
                { status: 500 }
            );
        }

        const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
            }),
        });

        const data = await response.json();
        console.log("Telegram API Response:", data);

        if (!data.ok) {
            console.error('Telegram API error:', data);
            return NextResponse.json(
                { error: `Telegram Error: ${data.description || 'Unknown error'}` },
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
