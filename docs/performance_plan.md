# Performance Optimization Plan

## User Review Required
> [!IMPORTANT]
> - **System Issue**: I cannot write to the standard artifact directory due to a "no space left on device" error. I am saving this plan in your project directory at `docs/performance_plan.md`.
> - Switching `next.config.ts` images to `remotePatterns`.
> - Implementing lazy loading for `HabitTracker` and Chart components.

## Proposed Changes

### Application Config
#### [MODIFY] [next.config.ts](file:///Users/chris/Documents/Side-Hustles/Winners.Lab/Habit%20Tracker/Project%20Files/Habit%20Tracker/next.config.ts)
- Update `images.domains` to `images.remotePatterns`.
- Enable `compiler.removeConsole` in production.

### Components
#### [MODIFY] [src/app/page.tsx](file:///Users/chris/Documents/Side-Hustles/Winners.Lab/Habit%20Tracker/Project%20Files/Habit%20Tracker/src/app/page.tsx)
- Lazy load charts or heavy modals inside `HabitTracker` or related components.

#### [MODIFY] [src/features/dashboard/components/habit-tracker.tsx](file:///Users/chris/Documents/Side-Hustles/Winners.Lab/Habit%20Tracker/Project%20Files/Habit%20Tracker/src/features/dashboard/components/habit-tracker.tsx)
- Ensure images (avatars, badges) use `next/image` with proper sizing.

#### [MODIFY] [src/globals.css](file:///Users/chris/Documents/Side-Hustles/Winners.Lab/Habit%20Tracker/Project%20Files/Habit%20Tracker/src/app/globals.css)
- Verify `content-visibility` or other CSS optimizations for long lists (if any).

## Verification Plan
1. **Build Analysis**: Run `npm run build` to check for warnings.
2. **Visual Inspection**: Ensure smooth loading states for lazy components.
