"use client";

import { useState, useRef, useEffect } from "react";
import { HabitCheckbox } from "./habit-checkbox";
import { HabitProgressBar } from "./habit-progress-bar";
import dynamic from "next/dynamic";

const MonthlyChart = dynamic(() => import("./monthly-chart").then((mod) => mod.MonthlyChart), {
    loading: () => <div className="h-[300px] w-full bg-muted/10 animate-pulse rounded-lg" />,
    ssr: false,
});
const HabitFormDialog = dynamic(() => import("./habit-form-dialog").then((mod) => mod.HabitFormDialog), { ssr: false });
const BugReportDialog = dynamic(() => import("./bug-report-dialog").then((mod) => mod.BugReportDialog), { ssr: false });
const UpgradeDialog = dynamic(() => import("./upgrade-dialog").then((mod) => mod.UpgradeDialog), { ssr: false });
import { StreakCounter } from "./streak-counter";
import { HabitStreakBadge } from "./habit-streak-badge";
import { UserProfile } from "@/features/profile/components/user-profile";
import { Onboarding } from "@/features/onboarding/components/onboarding";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Gift } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useHabits, Habit } from "@/hooks/use-habits";
import { useHabitStreaks } from "@/hooks/use-habit-streaks";
import { useSubscription } from "@/hooks/use-subscription";
import { getDaysInMonth, getMonthName, getDayName, calculateDailyProgress, getCompletedCount } from "@/lib/habits-data";

const MOTIVATIONAL_QUOTES = ["Small daily improvements lead to stunning results.", "Success is the sum of small efforts repeated day in and day out.", "The secret of getting ahead is getting started.", "You don't have to be great to start, but you have to start to be great.", "Consistency is what transforms average into excellence.", "Every day is a new opportunity to improve yourself.", "Progress, not perfection.", "The only bad workout is the one that didn't happen.", "Believe you can and you're halfway there.", "Your habits shape your future.", "Discipline is choosing between what you want now and what you want most.", "A year from now, you'll wish you had started today.", "The best time to plant a tree was 20 years ago. The second best time is now.", "Make each day your masterpiece.", "What you do every day matters more than what you do once in a while.", "Champions are made from something deep inside – a desire, a dream, a vision.", "It's not about being the best. It's about being better than you were yesterday.", "The difference between try and triumph is a little umph.", "Your future is created by what you do today, not tomorrow.", "Motivation gets you started. Habit keeps you going.", "Fall seven times, stand up eight.", "The journey of a thousand miles begins with a single step.", "Excellence is not a singular act, but a habit.", "Don't count the days, make the days count.", "You are what you repeatedly do.", "Great things are done by a series of small things brought together.", "Start where you are. Use what you have. Do what you can.", "The harder you work, the luckier you get.", "Dream big, start small, act now.", "Be stronger than your excuses.", "One day or day one. You decide."];

const getDailyQuote = (date: Date): string => {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
};

export const HabitTracker = () => {
    const {
        user,
        signOut
    } = useAuth();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    // State for viewing historical months
    const [viewedYear, setViewedYear] = useState(currentYear);
    const [viewedMonth, setViewedMonth] = useState(currentMonth);

    const daysInMonth = getDaysInMonth(viewedYear, viewedMonth);
    const isCurrentMonth = viewedYear === currentYear && viewedMonth === currentMonth;

    const {
        habits,
        completions,
        loading,
        addHabit,
        updateHabit,
        deleteHabit,
        resetHabitHistory,
        toggleCompletion
    } = useHabits(viewedYear, viewedMonth);
    const { streaks, calculateStreak } = useHabitStreaks(user?.id);
    const { isPro, canAddMoreHabits, refreshSubscription } = useSubscription();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [namesCollapsed, setNamesCollapsed] = useState(false);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem("onboarding-completed");
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    }, []);

    const handleOnboardingComplete = () => {
        localStorage.setItem("onboarding-completed", "true");
        setShowOnboarding(false);
    };
    const [bugReportOpen, setBugReportOpen] = useState(false);
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Scroll to show current day on initial load
    useEffect(() => {
        if (!loading && isCurrentMonth && scrollContainerRef.current) {
            // Small delay to ensure DOM is rendered
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    const currentDayCell = scrollContainerRef.current.querySelector(`[data-day="${currentDay}"]`);
                    if (currentDayCell) {
                        currentDayCell.scrollIntoView({ behavior: 'instant', inline: 'end', block: 'nearest' });
                    }
                }
            }, 100);
        }
    }, [loading, isCurrentMonth, currentDay]);

    // Navigate to previous month
    const goToPreviousMonth = () => {
        if (!isPro) {
            setUpgradeDialogOpen(true);
            return;
        }
        if (viewedMonth === 0) {
            setViewedMonth(11);
            setViewedYear(viewedYear - 1);
        } else {
            setViewedMonth(viewedMonth - 1);
        }
    };

    // Navigate to next month
    const goToNextMonth = () => {
        if (!isPro) {
            setUpgradeDialogOpen(true);
            return;
        }
        // Don't allow navigating beyond current month
        if (viewedYear === currentYear && viewedMonth === currentMonth) {
            return;
        }
        if (viewedMonth === 11) {
            setViewedMonth(0);
            setViewedYear(viewedYear + 1);
        } else {
            setViewedMonth(viewedMonth + 1);
        }
    };

    const canGoNext = !(viewedYear === currentYear && viewedMonth === currentMonth);

    const handleToggleCompletion = async (habitId: string, day: number) => {
        await toggleCompletion(habitId, day, () => calculateStreak(habitId));
    };
    const handleSaveHabit = async (habitData: {
        name: string;
        emoji: string;
        goal: number;
        id?: string;
    }) => {
        if (habitData.id) {
            await updateHabit(habitData.id, habitData);
        } else {
            await addHabit(habitData);
        }
        setEditingHabit(null);
    };
    const handleDeleteHabit = async (id: string) => {
        await deleteHabit(id);
        setEditingHabit(null);
    };
    const handleResetHistory = async (id: string) => {
        await resetHabitHistory(id);
        // Refresh streaks after reset
        calculateStreak(id);
    };
    const openAddDialog = () => {
        // Check if user can add more habits (free users limited to 3)
        if (!canAddMoreHabits(habits.length)) {
            setUpgradeDialogOpen(true);
            return;
        }
        setEditingHabit(null);
        setDialogOpen(true);
    };
    const openEditDialog = (habit: Habit) => {
        setEditingHabit(habit);
        setDialogOpen(true);
    };

    // Calculate overall progress
    const displayDay = isCurrentMonth ? currentDay : daysInMonth;
    const totalPossible = habits.length * displayDay;
    const totalCompleted = habits.reduce((acc, habit) => {
        return acc + getCompletedCount(habit.id, completions);
    }, 0);
    const overallProgress = totalPossible > 0 ? Math.round(totalCompleted / totalPossible * 100) : 0;

    // Get day headers with day name
    const dayHeaders = Array.from({
        length: daysInMonth
    }, (_, i) => {
        const date = new Date(viewedYear, viewedMonth, i + 1);
        return {
            day: i + 1,
            name: getDayName(date.getDay())
        };
    });
    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-foreground">Loading your habits...</div>
        </div>;
    }
    return <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <header className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                            {getMonthName(viewedMonth)} {viewedYear}
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground italic leading-relaxed">
                            {getDailyQuote(now)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                        <StreakCounter />
                        <UserProfile onSignOut={signOut} />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span className="text-primary font-medium">{overallProgress}%</span>
                    <div className="w-32 sm:w-48 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{
                            width: `${overallProgress}%`
                        }} />
                    </div>
                </div>
            </header>

            {/* Habit Grid */}
            <>
                {/* Habit Grid */}
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                    <div ref={scrollContainerRef} className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className={`text-left p-2 sm:p-3 text-xs sm:text-sm font-medium text-foreground sticky left-0 bg-card z-20 transition-all shadow-[2px_0_8px_rgba(0,0,0,0.3)] ${namesCollapsed ? "min-w-[100px]" : "min-w-[150px] sm:min-w-[200px]"}`}>
                                        <div className="flex items-center gap-2">
                                            <span>My Habits</span>
                                            <button
                                                onClick={() => setNamesCollapsed(!namesCollapsed)}
                                                className="md:hidden p-1 hover:bg-muted rounded transition-colors"
                                                aria-label={namesCollapsed ? "Expand habit names" : "Collapse habit names"}
                                            >
                                                {namesCollapsed ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </th>
                                    {!namesCollapsed && (
                                        <th className="text-center p-2 sm:p-3 min-w-[60px] sticky bg-card z-20 transition-all shadow-[2px_0_8px_rgba(0,0,0,0.3)]" style={{ left: '150px' }}>
                                        </th>
                                    )}
                                    {dayHeaders.map(({
                                        day,
                                        name
                                    }) => <th key={day} data-day={day} className={`p-1 sm:p-2 text-center min-w-[36px] sm:min-w-[40px] ${isCurrentMonth && day === currentDay ? "bg-primary/10" : isCurrentMonth && day > currentDay ? "opacity-40" : ""}`}>
                                            <div className="text-[9px] sm:text-[10px] text-muted-foreground">{name}</div>
                                            <div className="text-[11px] sm:text-xs text-foreground font-medium">{day}</div>
                                        </th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {habits.map(habit => <tr key={habit.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
                                    <td className={`p-2 sm:p-3 sticky left-0 bg-card z-10 transition-all shadow-[2px_0_8px_rgba(0,0,0,0.3)] ${namesCollapsed ? "min-w-[100px]" : ""}`}>
                                        <button
                                            onClick={() => openEditDialog(habit)}
                                            className="flex items-center gap-1.5 sm:gap-2 w-full text-left hover:bg-muted/50 rounded p-1 -m-1 transition-colors touch-manipulation"
                                        >
                                            <span className="text-sm sm:text-base">{habit.emoji}</span>
                                            {namesCollapsed ? (
                                                <HabitStreakBadge streak={streaks[habit.id]?.current_streak || 0} />
                                            ) : (
                                                <>
                                                    <span className="text-xs sm:text-sm text-foreground flex-1 truncate">{habit.name}</span>
                                                    <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    {!namesCollapsed && (
                                        <td className="p-2 sm:p-3 text-center sticky bg-card z-10 transition-all shadow-[2px_0_8px_rgba(0,0,0,0.3)]" style={{ left: '150px' }}>
                                            <div className="flex justify-center">
                                                <HabitStreakBadge streak={streaks[habit.id]?.current_streak || 0} />
                                            </div>
                                        </td>
                                    )}
                                    {dayHeaders.map(({
                                        day
                                    }) => <td key={day} className={`p-0.5 sm:p-1 text-center ${isCurrentMonth && day === currentDay ? "bg-primary/10" : isCurrentMonth && day > currentDay ? "opacity-40" : ""}`}>
                                            <div className="flex justify-center">
                                                <HabitCheckbox checked={completions[habit.id]?.[day] === true} onChange={() => handleToggleCompletion(habit.id, day)} disabled={!isCurrentMonth || day > currentDay} />
                                            </div>
                                        </td>)}
                                </tr>)}
                                {/* Add Habit Row */}
                                <tr onClick={openAddDialog} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer group touch-manipulation">
                                    <td className={`p-2 sm:p-3 sticky left-0 bg-card z-10 transition-all shadow-[2px_0_8px_rgba(0,0,0,0.3)] ${namesCollapsed ? "min-w-[100px]" : ""}`}>
                                        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            {!namesCollapsed && <span className="text-xs sm:text-sm">Add new habit...</span>}
                                        </div>
                                    </td>
                                    {!namesCollapsed && (
                                        <td className="p-2 sm:p-3 sticky bg-card z-10 transition-all shadow-[2px_0_8px_rgba(0,0,0,0.3)]" style={{ left: '150px' }}></td>
                                    )}
                                    {dayHeaders.map(({
                                        day
                                    }) => <td key={day} className={`p-1 text-center ${isCurrentMonth && day === currentDay ? "bg-primary/10" : isCurrentMonth && day > currentDay ? "opacity-40" : ""}`}>
                                            <div className="flex justify-center">
                                                <div className="w-5 h-5 rounded border border-dashed border-border/50" />
                                            </div>
                                        </td>)}
                                </tr>
                                {/* Daily Progress Row */}
                                <tr className="bg-muted-solid">
                                    <td className={`p-2 sm:p-3 sticky left-0 bg-muted-solid z-10 text-xs sm:text-sm font-medium text-foreground transition-all shadow-[2px_0_8px_rgba(0,0,0,0.3)] ${namesCollapsed ? "min-w-[100px]" : ""}`}>
                                        {!namesCollapsed ? "Progress" : "%"}
                                    </td>
                                    {!namesCollapsed && (
                                        <td className="p-2 sm:p-3 bg-muted-solid sticky z-10 transition-all shadow-[2px_0_8px_rgba(0,0,0,0.3)]" style={{ left: '150px' }}></td>
                                    )}
                                    {dayHeaders.map(({
                                        day
                                    }) => {
                                        const progress = (!isCurrentMonth || day <= currentDay) ? calculateDailyProgress(day, habits, completions) : 0;
                                        return <td key={day} className={`p-1 sm:p-2 text-center ${isCurrentMonth && day === currentDay ? "bg-primary/10" : isCurrentMonth && day > currentDay ? "opacity-40" : ""}`}>
                                            <span className={`text-[10px] sm:text-xs font-medium ${progress === 100 ? "text-primary" : progress >= 70 ? "text-foreground" : "text-muted-foreground"}`}>
                                                {(!isCurrentMonth || day <= currentDay) ? (progress === 100 ? "🏆" : `${progress}%`) : "-"}
                                            </span>
                                        </td>;
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bottom Section: Chart and Progress Bars */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Monthly Progress Chart */}
                    <div className="bg-card rounded-lg border border-border p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-base sm:text-lg font-semibold text-foreground">Monthly Progress</h2>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToPreviousMonth}
                                    className="h-7 w-7 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToNextMonth}
                                    disabled={!canGoNext}
                                    className="h-7 w-7 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Daily completion rate over time</p>
                        <MonthlyChart habits={habits} completions={completions} daysInMonth={daysInMonth} currentDay={isCurrentMonth ? currentDay : daysInMonth} />
                    </div>

                    {/* Individual Habit Analysis */}
                    <div className="bg-card rounded-lg border border-border p-3 sm:p-4">
                        {/* Column Headers */}
                        <div className="flex items-center gap-2 sm:gap-3 pb-2 border-b border-border mb-2">
                            <h2 className="text-base sm:text-lg font-semibold text-foreground min-w-[120px] sm:min-w-[180px]">Analysis</h2>
                            <div className="flex items-center gap-2 sm:gap-3 flex-1">
                                <div className="text-[10px] sm:text-xs text-muted-foreground w-7 sm:w-8 text-center font-medium">Goal</div>
                                <div className="text-[10px] sm:text-xs text-muted-foreground w-7 sm:w-8 text-center font-medium">Actual</div>
                                <div className="text-[10px] sm:text-xs text-muted-foreground w-10 sm:w-12 text-center font-medium">Streak Best</div>
                                <div className="text-[10px] sm:text-xs text-muted-foreground flex-1 text-center font-medium">Progress</div>
                                <div className="text-[10px] sm:text-xs text-muted-foreground w-8 sm:w-10 text-center font-medium"></div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            {habits.map(habit => <HabitProgressBar key={habit.id} name={habit.name} emoji={habit.emoji} goal={habit.goal} actual={getCompletedCount(habit.id, completions)} longestStreak={streaks[habit.id]?.longest_streak || 0} />)}
                        </div>
                    </div>
                </div>
            </>
        </div>

        {/* Habit Form Dialog */}
        <HabitFormDialog open={dialogOpen} onOpenChange={setDialogOpen} habit={editingHabit} onSave={handleSaveHabit} onDelete={handleDeleteHabit} onResetHistory={handleResetHistory} />

        {/* Footer */}
        <footer className="mt-6 sm:mt-8 pb-4 sm:pb-6 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
                Built for Winners by WinnersLab 🏆
            </p>
            <button
                onClick={() => setBugReportOpen(true)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors underline"
            >
                🐛 Report a Bug
            </button>
        </footer>

        {/* Bug Report Dialog */}
        <BugReportDialog open={bugReportOpen} onOpenChange={setBugReportOpen} />

        {/* Upgrade Dialog */}
        <UpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />

        {/* Onboarding */}
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
    </div>;
};
