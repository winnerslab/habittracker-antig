"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
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
    const { isPro } = useSubscription();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [completionsCache, setCompletionsCache] = useState<Record<string, HabitCompletion>>({});
    // Use ref to access latest cache in loadData without triggering re-renders
    const completionsCacheRef = useRef(completionsCache);

    // Keep ref in sync
    useEffect(() => {
        completionsCacheRef.current = completionsCache;
    }, [completionsCache]);

    const [loading, setLoading] = useState(true);

    // Helper to get cache key
    const getCacheKey = (y: number, m: number) => `${y}-${m}`;

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

    // Fetch completions for a specific month
    const fetchMonthCompletions = async (targetYear: number, targetMonth: number) => {
        if (!user) return null;

        const startDate = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-01`;
        const endDate = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(new Date(targetYear, targetMonth + 1, 0).getDate()).padStart(2, '0')}`;

        const { data, error } = await supabase
            .from("habit_completions")
            .select("*")
            .eq("user_id", user.id)
            .gte("completed_date", startDate)
            .lte("completed_date", endDate);

        if (error) {
            console.error(`Error fetching completions for ${startDate}:`, error);
            return null;
        }

        const completionsMap: HabitCompletion = {};
        data?.forEach((completion) => {
            const [y, m, d] = completion.completed_date.split('-').map(Number);
            const day = d;

            if (!completionsMap[completion.habit_id]) {
                completionsMap[completion.habit_id] = {};
            }
            completionsMap[completion.habit_id][day] = true;
        });

        return completionsMap;
    };

    // Load data
    const loadData = useCallback(async () => {
        if (!user) return;

        // Determine which months to fetch
        const currentKey = getCacheKey(year, month);
        const monthsToFetch = [{ year, month, key: currentKey }];

        // If Pro, preload adjacent months
        if (isPro) {
            const prevDate = new Date(year, month - 1, 1);
            const nextDate = new Date(year, month + 1, 1);

            monthsToFetch.push({
                year: prevDate.getFullYear(),
                month: prevDate.getMonth(),
                key: getCacheKey(prevDate.getFullYear(), prevDate.getMonth())
            });
            monthsToFetch.push({
                year: nextDate.getFullYear(),
                month: nextDate.getMonth(),
                key: getCacheKey(nextDate.getFullYear(), nextDate.getMonth())
            });
        }

        // Check if current month is cached using Ref
        const cache = completionsCacheRef.current;
        const isCurrentCached = !!cache[currentKey];
        if (!isCurrentCached) {
            setLoading(true);
        }

        // Identify missing keys
        const missingMonths = monthsToFetch.filter(m => !cache[m.key]);

        if (missingMonths.length === 0) {
            if (!isCurrentCached) setLoading(false);
            return;
        }

        // Fetch missing data
        // We use a flag to track if we're still mounted/valid or just rely on async
        const results = await Promise.all(
            missingMonths.map(async (m) => {
                const data = await fetchMonthCompletions(m.year, m.month);
                return { key: m.key, data };
            })
        );

        // Update cache
        setCompletionsCache(prev => {
            const next = { ...prev };
            results.forEach(res => {
                if (res.data) {
                    next[res.key] = res.data;
                }
            });
            return next;
        });

        if (!isCurrentCached) {
            setLoading(false);
        }
    }, [user, year, month, isPro]); // Removed completionsCache dependency

    // Initial load and updates
    useEffect(() => {
        if (!user) return;

        const init = async () => {
            await fetchHabits();
            // Check demo habits logic only on initial mount or if empty? 
            // Existing logic checked every mount. Keeping it simple.
            const { data: existingHabits } = await supabase
                .from("habits")
                .select("id")
                .eq("user_id", user.id)
                .limit(1);

            if (!existingHabits || existingHabits.length === 0) {
                await createDemoHabits(user.id);
                await fetchHabits();
            }

            // loadData is triggered by separate effect below
        };

        init();
    }, [user, fetchHabits]); // Run once on user change/mount

    // Trigger loadData when month/year changes
    useEffect(() => {
        loadData();
    }, [loadData]);


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
        setCompletionsCache((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach(key => {
                const monthCompletions = { ...next[key] };
                delete monthCompletions[id];
                next[key] = monthCompletions;
            });
            return next;
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
        setCompletionsCache((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach(key => {
                const monthCompletions = { ...next[key] };
                delete monthCompletions[id];
                next[key] = monthCompletions;
            });
            return next;
        });

        toast.success("Tracking history reset!");
    };

    // Toggle completion
    const toggleCompletion = async (habitId: string, day: number, onStreakUpdate?: () => void) => {
        if (!user) return;

        // Format date without timezone conversion to avoid date shifting
        const completedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const currentKey = `${year}-${month}`; // Hardcoded here as local helper is inside hook range but might need moving out if reused broadly
        // Note: Using the same key format as getCacheKey

        const isCompleted = completionsCache[currentKey]?.[habitId]?.[day] === true;

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

            setCompletionsCache((prev) => {
                const next = { ...prev };
                if (!next[currentKey]) next[currentKey] = {};
                if (!next[currentKey][habitId]) next[currentKey][habitId] = {};

                next[currentKey] = {
                    ...next[currentKey],
                    [habitId]: {
                        ...next[currentKey][habitId],
                        [day]: false
                    }
                };
                return next;
            });
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

            setCompletionsCache((prev) => {
                const next = { ...prev };
                if (!next[currentKey]) next[currentKey] = {};
                if (!next[currentKey][habitId]) next[currentKey][habitId] = {};

                next[currentKey] = {
                    ...next[currentKey],
                    [habitId]: {
                        ...next[currentKey][habitId],
                        [day]: true
                    }
                };
                return next;
            });
        }

        // Trigger streak recalculation
        if (onStreakUpdate) {
            onStreakUpdate();
        }
    };

    return {
        habits,
        completions: completionsCache[`${year}-${month}`] || {},
        loading,
        addHabit,
        updateHabit,
        deleteHabit,
        resetHabitHistory,
        toggleCompletion,
    };
};
