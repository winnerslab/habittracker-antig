import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        const { code, userId } = await req.json();

        if (!code || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (code.toUpperCase() !== "LOCKED-IN") {
            return NextResponse.json({ error: "Invalid promo code" }, { status: 400 });
        }

        // Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Grant Lifetime Access (100 years from now)
        const now = new Date();
        const lifetimeEnd = new Date(now.setFullYear(now.getFullYear() + 100));

        const { error: updateError } = await supabaseAdmin
            .from("subscriptions")
            .upsert({
                user_id: userId,
                status: "active",
                current_period_end: lifetimeEnd.toISOString(),
                lemonsqueezy_customer_id: "PROMO_LOCKED_IN", // Marker for promo redemption
                lemonsqueezy_subscription_id: "LIFETIME"
            }, { onConflict: 'user_id' });

        if (updateError) {
            console.error("Failed to apply promo:", updateError);
            return NextResponse.json({ error: "Failed to redeem code" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Lifetime access unlocked!" });

    } catch (error) {
        console.error("Promo Redemption Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
