"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { HabitTracker } from "@/features/dashboard/components/habit-tracker";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <HabitTracker />
    </ProtectedRoute>
  );
}
