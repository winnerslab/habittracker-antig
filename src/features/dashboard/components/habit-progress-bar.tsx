import { Progress } from "@/components/ui/progress";

interface HabitProgressBarProps {
    name: string;
    emoji: string;
    goal: number;
    actual: number;
    longestStreak?: number;
}

export const HabitProgressBar = ({ name, emoji, goal, actual, longestStreak = 0 }: HabitProgressBarProps) => {
    const percentage = Math.min(Math.round((actual / goal) * 100), 100);

    return (
        <div className="flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-[120px] sm:min-w-[180px]">
                <span className="text-sm sm:text-base">{emoji}</span>
                <span className="text-xs sm:text-sm text-foreground truncate">{name}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
                <div className="text-[10px] sm:text-xs text-foreground w-7 sm:w-8 text-center font-medium">{goal}</div>
                <div className="text-[10px] sm:text-xs text-foreground w-7 sm:w-8 text-center font-medium">{actual}</div>
                <div className="text-[10px] sm:text-xs text-foreground w-10 sm:w-12 text-center font-medium">{longestStreak}</div>
                <Progress value={percentage} className="flex-1 h-2 sm:h-3" />
                <span className="text-[10px] sm:text-xs text-foreground w-8 sm:w-10 text-center font-medium">{percentage}%</span>
            </div>
        </div>
    );
};
