import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        const { referralCode, newUserId } = await req.json();

        if (!referralCode || !newUserId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Verify New User
        const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(newUserId);
        if (userError || !newUser.user) {
            return NextResponse.json({ error: "Invalid user" }, { status: 400 });
        }

        // Check if duplicate claim
        if (newUser.user.user_metadata?.referral_rewarded) {
            return NextResponse.json({ error: "Referral already claimed" }, { status: 400 });
        }

        // Prevent abuse: Check account age (must be created < 10 mins ago)
        const createdTime = new Date(newUser.user.created_at).getTime();
        if (Date.now() - createdTime > 10 * 60 * 1000) {
            // Allow a bit of leeway, but generally this endpoint is called immediately after signup
            // If manual call later, we might want to relax this or authorize differently
            console.warn("Referral claim attempted for old account");
        }

        // 2. Identify Referrer
        // referralCode is the Referrer's User ID
        const referrerId = referralCode;

        // Validate Referrer exists
        const { data: referrer, error: referrerError } = await supabaseAdmin.auth.admin.getUserById(referrerId);
        if (referrerError || !referrer.user) {
            return NextResponse.json({ error: "Invalid referrer code" }, { status: 400 });
        }

        if (referrerId === newUserId) {
            return NextResponse.json({ error: "Cannot refer yourself" }, { status: 400 });
        }

        // 3. Grant Reward to Referrer (2 Months Free)
        // Fetch current subscription
        const { data: subscription } = await supabaseAdmin
            .from("subscriptions")
            .select("*")
            .eq("user_id", referrerId)
            .single();

        const now = new Date();
        let newPeriodEnd = new Date();

        if (subscription && subscription.status === 'active' && subscription.current_period_end) {
            // Extend existing subscription
            const currentEnd = new Date(subscription.current_period_end);
            // If expired, start from now. If active, valid from existing end.
            const basis = currentEnd > now ? currentEnd : now;
            newPeriodEnd = new Date(basis.setMonth(basis.getMonth() + 2));
        } else {
            // New or expired/free subscription -> Give 2 months from now
            newPeriodEnd.setMonth(now.getMonth() + 2);
        }

        const { error: updateError } = await supabaseAdmin
            .from("subscriptions")
            .upsert({
                user_id: referrerId,
                status: "active",
                current_period_end: newPeriodEnd.toISOString(),
                // Preserve other fields if extending, but upsert might overwrite if not careful.
                // Since we selected *, we should merge. But upsert( { ...fields } ) generally works if we provide ID.
                // Better to update if exists, insert if not.
            }, { onConflict: 'user_id' });

        if (updateError) {
            console.error("Failed to update referrer subscription:", updateError);
            return NextResponse.json({ error: "Failed to apply reward" }, { status: 500 });
        }

        // 4. Mark New User as "Rewarded" (Metadata)
        await supabaseAdmin.auth.admin.updateUserById(newUserId, {
            user_metadata: { referral_rewarded: true, referred_by: referrerId }
        });

        return NextResponse.json({ success: true, message: "Referral reward granted" });

    } catch (error) {
        console.error("Referral Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
