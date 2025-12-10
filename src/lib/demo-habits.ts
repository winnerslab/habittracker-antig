import { supabase } from "@/lib/supabase/client";

export const createDemoHabits = async (userId: string) => {
    const demoHabits = [
        {
            user_id: userId,
            name: "Workout 🏋🏼",
            emoji: "🏋🏼",
            goal: 1,
            sort_order: 0,
        },
    ];

    const { error } = await supabase.from("habits").insert(demoHabits);

    if (error) {
        console.error("Error creating demo habits:", error);
    }
};
