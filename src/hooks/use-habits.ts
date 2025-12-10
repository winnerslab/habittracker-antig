"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { createDemoHabits } from "@/lib/demo-habits";

export interface Habit {
    id: string;
    name: string;
    emoji: string;
    goal: number;
    sort_order: number;
}

export interface HabitCompletion {
    [habitId: string]: {
        [day: number]: boolean;
    };
}

export const useHabits = (year: number, month: number) => {
    const { user } = useAuth();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [completions, setCompletions] = useState<HabitCompletion>({});
    const [loading, setLoading] = useState(true);

    // Fetch habits
    const fetchHabits = useCallback(async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from("habits")
            .select("*")
            .eq("user_id", user.id)
            .order("sort_order", { ascending: true });

        if (error) {
            console.error("Error fetching habits:", error);
            toast.error("Failed to load habits");
            return;
        }

        setHabits(data || []);
    }, [user]);

    // Fetch completions for the current month
    const fetchCompletions = useCallback(async () => {
        if (!user) return;

        // Format dates without timezone conversion to avoid date shifting
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`;

        const { data, error } = await supabase
            .from("habit_completions")
            .select("*")
            .eq("user_id", user.id)
            .gte("completed_date", startDate)
            .lte("completed_date", endDate);

        if (error) {
            console.error("Error fetching completions:", error);
            toast.error("Failed to load completions");
            return;
        }

        // Transform data into the HabitCompletion format
        const completionsMap: HabitCompletion = {};
        data?.forEach((completion) => {
            // Parse YYYY-MM-DD manually to avoid timezone issues
            const [y, m, d] = completion.completed_date.split('-').map(Number);
            const day = d;

            if (!completionsMap[completion.habit_id]) {
                completionsMap[completion.habit_id] = {};
            }
            completionsMap[completion.habit_id][day] = true;
        });

        setCompletions(completionsMap);
    }, [user, year, month]);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            setLoading(true);
            await fetchHabits();

            // Check if we need to create demo habits
            const { data: existingHabits } = await supabase
                .from("habits")
                .select("id")
                .eq("user_id", user.id)
                .limit(1);

            if (!existingHabits || existingHabits.length === 0) {
                await createDemoHabits(user.id);
                await fetchHabits(); // Refresh to show demo habits
            }

            await fetchCompletions();
            setLoading(false);
        };

        if (user) {
            loadData();
        }
    }, [user, fetchHabits, fetchCompletions]);

    // Add habit
    const addHabit = async (habitData: { name: string; emoji: string; goal: number }) => {
        if (!user) return;

        const newHabit = {
            user_id: user.id,
            name: habitData.name,
            emoji: habitData.emoji,
            goal: habitData.goal,
            sort_order: habits.length,
        };

        const { data, error } = await supabase
            .from("habits")
            .insert(newHabit)
            .select()
            .single();

        if (error) {
            console.error("Error adding habit:", error);
            toast.error("Failed to add habit");
            return;
        }

        setHabits((prev) => [...prev, data]);
        toast.success("Habit added!");
    };

    // Update habit
    const updateHabit = async (id: string, habitData: { name: string; emoji: string; goal: number }) => {
        if (!user) return;

        const { error } = await supabase
            .from("habits")
            .update({
                name: habitData.name,
                emoji: habitData.emoji,
                goal: habitData.goal,
            })
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) {
            console.error("Error updating habit:", error);
            toast.error("Failed to update habit");
            return;
        }

        setHabits((prev) =>
            prev.map((h) =>
                h.id === id ? { ...h, ...habitData } : h
            )
        );
        toast.success("Habit updated!");
    };

    // Delete habit
    const deleteHabit = async (id: string) => {
        if (!user) return;

        const { error } = await supabase
            .from("habits")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) {
            console.error("Error deleting habit:", error);
            toast.error("Failed to delete habit");
            return;
        }

        setHabits((prev) => prev.filter((h) => h.id !== id));
        setCompletions((prev) => {
            const newCompletions = { ...prev };
            delete newCompletions[id];
            return newCompletions;
        });
        toast.success("Habit deleted!");
    };

    // Reset habit tracking history (completions and streaks)
    const resetHabitHistory = async (id: string) => {
        if (!user) return;

        // Delete all completions for this habit
        const { error: completionsError } = await supabase
            .from("habit_completions")
            .delete()
            .eq("habit_id", id)
            .eq("user_id", user.id);

        if (completionsError) {
            console.error("Error resetting completions:", completionsError);
            toast.error("Failed to reset tracking history");
            return;
        }

        // Reset streak for this habit
        const { error: streakError } = await supabase
            .from("habit_streaks")
            .update({
                current_streak: 0,
                longest_streak: 0,
                last_completed_date: null,
            })
            .eq("habit_id", id)
            .eq("user_id", user.id);

        if (streakError) {
            console.error("Error resetting streak:", streakError);
            // Don't return - completions were already reset
        }

        // Clear local completions state for this habit
        setCompletions((prev) => {
            const newCompletions = { ...prev };
            delete newCompletions[id];
            return newCompletions;
        });

        toast.success("Tracking history reset!");
    };

    // Toggle completion
    const toggleCompletion = async (habitId: string, day: number, onStreakUpdate?: () => void) => {
        if (!user) return;

        // Format date without timezone conversion to avoid date shifting
        const completedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isCompleted = completions[habitId]?.[day] === true;

        if (isCompleted) {
            // Remove completion
            const { error } = await supabase
                .from("habit_completions")
                .delete()
                .eq("habit_id", habitId)
                .eq("completed_date", completedDate)
                .eq("user_id", user.id);

            if (error) {
                console.error("Error removing completion:", error);
                toast.error("Failed to update");
                return;
            }

            setCompletions((prev) => ({
                ...prev,
                [habitId]: {
                    ...prev[habitId],
                    [day]: false,
                },
            }));
        } else {
            // Add completion (upsert to handle duplicates gracefully)
            const { error } = await supabase
                .from("habit_completions")
                .upsert({
                    habit_id: habitId,
                    user_id: user.id,
                    completed_date: completedDate,
                }, {
                    onConflict: "user_id,habit_id,completed_date",
                    ignoreDuplicates: false,
                });

            if (error) {
                console.error("Error adding completion:", JSON.stringify(error, null, 2));
                toast.error(`Failed to update: ${error.message}`);
                return;
            }

            setCompletions((prev) => ({
                ...prev,
                [habitId]: {
                    ...prev[habitId],
                    [day]: true,
                },
            }));
        }

        // Trigger streak recalculation
        if (onStreakUpdate) {
            onStreakUpdate();
        }
    };

    return {
        habits,
        completions,
        loading,
        addHabit,
        updateHabit,
        deleteHabit,
        resetHabitHistory,
        toggleCompletion,
    };
};
