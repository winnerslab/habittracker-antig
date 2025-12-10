export interface Habit {
    id: string;
    name: string;
    emoji: string;
    goal: number;
}

export interface HabitCompletion {
    [habitId: string]: {
        [day: number]: boolean;
    };
}

export const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
};

export const getMonthName = (month: number): string => {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return months[month];
};

export const getDayName = (day: number): string => {
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    return days[day];
};

export const getWeekNumber = (date: Date): number => {
    const dayOfMonth = date.getDate();
    return Math.ceil(dayOfMonth / 7);
};

export const calculateHabitProgress = (
    habitId: string,
    completions: HabitCompletion,
    daysInMonth: number
): number => {
    const habitCompletions = completions[habitId] || {};
    const completedDays = Object.values(habitCompletions).filter(Boolean).length;
    return Math.round((completedDays / daysInMonth) * 100);
};

export const calculateDailyProgress = (
    day: number,
    habits: Habit[],
    completions: HabitCompletion
): number => {
    const total = habits.length;
    if (total === 0) return 0;

    const completed = habits.filter(
        (habit) => completions[habit.id]?.[day] === true
    ).length;

    return Math.round((completed / total) * 100);
};

export const getCompletedCount = (
    habitId: string,
    completions: HabitCompletion
): number => {
    const habitCompletions = completions[habitId] || {};
    return Object.values(habitCompletions).filter(Boolean).length;
};
