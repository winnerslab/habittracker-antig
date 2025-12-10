"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface HabitStreak {
    id: string;
    habit_id: string;
    current_streak: number;
    longest_streak: number;
    last_completed_date: string | null;
}

export const useHabitStreaks = (userId: string | undefined | null) => {
    const [streaks, setStreaks] = useState<Record<string, HabitStreak>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        fetchStreaks();
    }, [userId]);

    const fetchStreaks = async () => {
        if (!userId) return;

        const { data, error } = await supabase
            .from("habit_streaks")
            .select("*")
            .eq("user_id", userId);

        if (error) {
            console.error("Error fetching habit streaks:", error);
            setLoading(false);
            return;
        }

        const streaksMap: Record<string, HabitStreak> = {};
        data?.forEach((streak) => {
            streaksMap[streak.habit_id] = streak;
        });

        setStreaks(streaksMap);
        setLoading(false);
    };

    const calculateStreak = async (habitId: string) => {
        if (!userId) return;

        // Fetch all completions for this habit, ordered by date descending
        const { data: completions, error } = await supabase
            .from("habit_completions")
            .select("completed_date")
            .eq("habit_id", habitId)
            .eq("user_id", userId)
            .order("completed_date", { ascending: false });

        if (error) {
            console.error("Error fetching completions:", error);
            return;
        }

        if (!completions || completions.length === 0) {
            // No completions, streak is 0
            await updateStreak(habitId, 0, 0, null);
            return;
        }

        // Calculate current streak by counting consecutive days backwards from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const completionDates = completions.map(c => {
            const date = new Date(c.completed_date);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
        });

        let currentStreak = 0;

        // Check if today is completed
        const todayCompleted = completionDates.includes(today.getTime());
        const yesterdayCompleted = completionDates.includes(yesterday.getTime());

        // Only maintain streak if today OR yesterday is completed
        // If both are missing, streak is broken and resets to 0
        if (!todayCompleted && !yesterdayCompleted) {
            // Streak is broken - reset to 0
            currentStreak = 0;
        } else {
            // Start counting from today if completed, otherwise from yesterday
            let checkDate = todayCompleted ? today.getTime() : yesterday.getTime();

            // Count backwards through consecutive days
            while (completionDates.includes(checkDate)) {
                currentStreak++;
                checkDate -= 24 * 60 * 60 * 1000; // Go back one day
            }
        }

        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 1;

        for (let i = 0; i < completionDates.length - 1; i++) {
            const currentDate = completionDates[i];
            const nextDate = completionDates[i + 1];
            const dayDiff = (currentDate - nextDate) / (24 * 60 * 60 * 1000);

            if (dayDiff === 1) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

        const lastCompletedDate = completions[0].completed_date;
        await updateStreak(habitId, currentStreak, longestStreak, lastCompletedDate);
    };

    const updateStreak = async (
        habitId: string,
        currentStreak: number,
        longestStreak: number,
        lastCompletedDate: string | null
    ) => {
        if (!userId) return;

        // Use upsert to handle both insert and update atomically
        const { data, error } = await supabase
            .from("habit_streaks")
            .upsert({
                habit_id: habitId,
                user_id: userId,
                current_streak: currentStreak,
                longest_streak: longestStreak, // Note: For updates, we need to handle the max logic below or let DB trigger do it if complex, but simple upsert replaces. 
                // Wait, upsert replaces. We need to preserve the true longest streak if we are just updating current.
                // Actually, the calculation logic passed in `longestStreak` which was already calculated as `Math.max(longestStreak, tempStreak, currentStreak)`.
                // However, if we upsert, we might overwrite a historical longest streak if our local calculation missed some data (unlikely if we fetched all).
                // But wait, the existing code: `Math.max(longestStreak, existingStreak.longest_streak)`.
                // We need to replicate that logic.

                // Let's rely on the `longetStreak` passed to this function being correct based on ALL completions history.
                // The `calculateStreak` function fetches ALL completions and recalculates `longestStreak` from scratch every time.
                // So passing that value to upsert is safe and correct, provided `calculateStreak` is correct.
                last_completed_date: lastCompletedDate,
            }, {
                onConflict: "user_id,habit_id",
                ignoreDuplicates: false,
            })
            .select()
            .single();

        if (error) {
            console.error("Error updating streak:", error);
            return;
        }

        // Update local state
        setStreaks(prev => ({
            ...prev,
            [habitId]: {
                id: data.id,
                habit_id: habitId,
                current_streak: currentStreak,
                longest_streak: longestStreak, // logical correctness depends on callee, but consistent with new data
                last_completed_date: lastCompletedDate,
            },
        }));
    };

    return {
        streaks,
        loading,
        calculateStreak,
        refreshStreaks: fetchStreaks,
    };
};
