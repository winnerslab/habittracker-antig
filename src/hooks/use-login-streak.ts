"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface LoginStreak {
    current_streak: number;
    longest_streak: number;
    last_login_date: string;
}

const MILESTONES = [7, 30, 100];

export const useLoginStreak = () => {
    const { user } = useAuth();
    const [streak, setStreak] = useState<LoginStreak | null>(null);
    const [loading, setLoading] = useState(true);

    const checkMilestone = (newStreak: number, oldStreak: number) => {
        const milestone = MILESTONES.find(
            (m) => newStreak >= m && oldStreak < m
        );

        if (milestone) {
            const titles: { [key: number]: string } = {
                7: "🎉 Week Warrior Unlocked!",
                30: "🏆 Month Master Unlocked!",
                100: "👑 Century Champion Unlocked!",
            };
            toast.success(titles[milestone], {
                description: `Amazing! You've reached a ${milestone}-day streak!`,
                duration: 5000,
            });
        }
    };

    const updateStreak = useCallback(async () => {
        if (!user) return;

        const today = new Date().toISOString().split("T")[0];

        // Fetch existing streak
        const { data: existingStreak } = await supabase
            .from("login_streaks")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (!existingStreak) {
            // Create new streak
            const { data, error } = await supabase
                .from("login_streaks")
                .insert({
                    user_id: user.id,
                    last_login_date: today,
                    current_streak: 1,
                    longest_streak: 1,
                })
                .select()
                .single();

            if (!error && data) {
                setStreak(data);
            }
        } else {
            const lastLogin = new Date(existingStreak.last_login_date);
            const todayDate = new Date(today);
            const diffDays = Math.floor(
                (todayDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays === 0) {
                // Already logged in today
                setStreak(existingStreak);
            } else if (diffDays === 1) {
                // Consecutive day - increment streak
                const oldStreak = existingStreak.current_streak;
                const newStreak = oldStreak + 1;
                const newLongest = Math.max(newStreak, existingStreak.longest_streak);

                const { data, error } = await supabase
                    .from("login_streaks")
                    .update({
                        last_login_date: today,
                        current_streak: newStreak,
                        longest_streak: newLongest,
                    })
                    .eq("user_id", user.id)
                    .select()
                    .single();

                if (!error && data) {
                    setStreak(data);
                    checkMilestone(newStreak, oldStreak);
                }
            } else {
                // Streak broken - reset to 1
                const { data, error } = await supabase
                    .from("login_streaks")
                    .update({
                        last_login_date: today,
                        current_streak: 1,
                    })
                    .eq("user_id", user.id)
                    .select()
                    .single();

                if (!error && data) {
                    setStreak(data);
                }
            }
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (user) {
            updateStreak();
        } else {
            setLoading(false);
        }
    }, [user, updateStreak]);

    return { streak, loading };
};
