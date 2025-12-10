import { supabase } from "@/lib/supabase/client";

export const createDemoHabits = async (userId: string) => {
    const demoHabits = [
        {
            user_id: userId,
            name: "Drink 2L Water",
            emoji: "💧",
            goal: 1,
            sort_order: 0,
        },
        {
            user_id: userId,
            name: "Exercise 30 mins",
            emoji: "🏃",
            goal: 1,
            sort_order: 1,
        },
        {
            user_id: userId,
            name: "Read 10 pages",
            emoji: "📚",
            goal: 1,
            sort_order: 2,
        },
        {
            user_id: userId,
            name: "Meditate",
            emoji: "🧘",
            goal: 1,
            sort_order: 3,
        },
    ];

    const { error } = await supabase.from("habits").insert(demoHabits);

    if (error) {
        console.error("Error creating demo habits:", error);
    }
};
