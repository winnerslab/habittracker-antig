import { Flame } from "lucide-react";

interface HabitStreakBadgeProps {
    streak: number;
}

export const HabitStreakBadge = ({ streak }: HabitStreakBadgeProps) => {
    if (streak === 0) {
        return (
            <div className="flex items-center justify-center gap-1 px-2 py-1 bg-muted/30 rounded-md min-w-[50px]">
                <Flame className="w-3 h-3 text-muted-foreground/40" />
                <span className="text-xs font-semibold text-muted-foreground/40">0</span>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-1 px-2 py-1 bg-green-500/10 rounded-md border border-green-500/20 min-w-[50px] group hover:bg-green-500/20 transition-colors">
            <Flame className="w-3 h-3 text-green-500 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-green-600 dark:text-green-400">{streak}</span>
        </div>
    );
};
