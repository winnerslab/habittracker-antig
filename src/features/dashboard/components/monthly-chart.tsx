"use client";

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Habit, HabitCompletion, calculateDailyProgress } from "@/lib/habits-data";

interface MonthlyChartProps {
    habits: Habit[];
    completions: HabitCompletion;
    daysInMonth: number;
    currentDay: number;
}

export const MonthlyChart = ({ habits, completions, daysInMonth, currentDay }: MonthlyChartProps) => {
    const data = Array.from({ length: Math.min(currentDay, daysInMonth) }, (_, i) => {
        const day = i + 1;
        return {
            day,
            progress: calculateDailyProgress(day, habits, completions),
        };
    });

    return (
        <div className="w-full h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        tickFormatter={(value) => (value % 5 === 0 || value === 1 ? value : "")}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        tickFormatter={(value) => `${value}%`}
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--foreground))",
                        }}
                        formatter={(value: number) => [`${value}%`, "Progress"]}
                        labelFormatter={(label) => `Day ${label}`}
                    />
                    <Area
                        type="monotone"
                        dataKey="progress"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#progressGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
