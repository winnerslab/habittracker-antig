import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface HabitCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export const HabitCheckbox = ({ checked, onChange, disabled }: HabitCheckboxProps) => {
    return (
        <button
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={cn(
                "w-6 h-6 sm:w-7 sm:h-7 rounded-sm border transition-all duration-200 flex items-center justify-center touch-manipulation",
                "hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50",
                checked
                    ? "bg-primary border-primary animate-check-pop"
                    : "bg-transparent border-muted-foreground/30",
                disabled && "opacity-40 cursor-not-allowed hover:border-muted-foreground/30"
            )}
        >
            {checked && (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" strokeWidth={3} />
            )}
        </button>
    );
};
