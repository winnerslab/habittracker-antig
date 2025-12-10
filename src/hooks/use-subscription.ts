"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface Subscription {
    id: string;
    user_id: string;
    status: "free" | "active" | "cancelled" | "expired";
    lemonsqueezy_customer_id: string | null;
    lemonsqueezy_subscription_id: string | null;
    current_period_end: string | null;
}

export const useSubscription = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSubscription = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Error fetching subscription:", error);
        }

        // If no subscription exists, create one with free status
        if (!data) {
            const { data: newSub, error: insertError } = await supabase
                .from("subscriptions")
                .insert({ user_id: user.id, status: "free" })
                .select()
                .single();

            if (insertError) {
                console.error("Error creating subscription:", insertError);
            } else {
                setSubscription(newSub as Subscription);
            }
        } else {
            setSubscription(data as Subscription);
        }

        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    const isPro = subscription?.status === "active";
    const canAddMoreHabits = (currentHabitCount: number) => isPro || currentHabitCount < 3;

    const refreshSubscription = () => {
        fetchSubscription();
    };

    const verifyPaystackPayment = async (reference: string) => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Please sign in");

            const response = await fetch("/api/paystack/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    reference,
                    user_id: session.user.id
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            // Refresh subscription state
            await fetchSubscription();
            return true;
        } catch (error) {
            console.error("Verification error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        subscription,
        loading,
        isPro,
        canAddMoreHabits,
        refreshSubscription,
        verifyPaystackPayment,
    };
};
