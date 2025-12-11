
import { NextResponse } from 'next/server';
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: Request) {
    try {
        const { email, fullName } = await req.json();

        const message = `
🎉 *New User Signed Up!* 🎉

👤 *Name:* ${fullName || "N/A"}
📧 *Email:* ${email}
`.trim();

        const { success, errors } = await sendTelegramMessage(message);

        if (!success) {
            console.error('Failed to send signup notification:', errors);
            // Don't fail the request for the user, just log it
            return NextResponse.json({ success: false, errors }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Signup notification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
