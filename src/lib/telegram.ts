
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_CHAT_IDS = (process.env.TELEGRAM_CHAT_ID || "").split(",").map(id => id.trim()).filter(Boolean);
const ADDITIONAL_CHAT_ID = "5499383993";

// Deduplicate IDs
const CHAT_IDS = Array.from(new Set([...BASE_CHAT_IDS, ADDITIONAL_CHAT_ID]));

export async function sendTelegramMessage(text: string): Promise<{ success: boolean; errors?: any[] }> {
    if (!TELEGRAM_BOT_TOKEN) {
        console.error("CRITICAL: Telegram Bot Token is missing in environment variables.");
        return { success: false, errors: ["Missing Bot Token"] };
    }

    if (CHAT_IDS.length === 0) {
        console.error("CRITICAL: No Telegram Chat IDs configured in environment variables.");
        return { success: false, errors: ["Missing Chat IDs"] };
    }

    const errors: any[] = [];

    await Promise.all(CHAT_IDS.map(async (chatId) => {
        try {
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'Markdown',
                }),
            });

            const data = await response.json();
            if (!data.ok) {
                console.error(`Failed to send Telegram message to ${chatId}:`, data);
                errors.push({ chatId, error: data });
            }
        } catch (error) {
            console.error(`Error sending Telegram message to ${chatId}:`, error);
            errors.push({ chatId, error });
        }
    }));

    return { success: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}
