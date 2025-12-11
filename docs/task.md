# Performance Optimization Task

- [x] Analyze current performance bottlenecks <!-- id: 0 -->
    - [x] Check `next.config.ts` for optimization settings
    - [x] Inspect dependencies in `package.json`
- [x] Implement Code Splitting and Lazy Loading <!-- id: 1 -->
    - [x] Update `next.config.ts`
    - [x] Lazy load `MonthlyChart`
    - [x] Lazy load Dialogs (`HabitFormDialog`, `BugReportDialog`, `UpgradeDialog`, `AvatarSelectionDialog`, `AchievementBadges`)
- [x] Optimize Images and Assets <!-- id: 2 -->
    - [x] Verify `UserProfile` uses `next/image`
    - [x] Check `HabitCheckbox`
- [x] Verify Performance Improvements <!-- id: 4 -->
    - [x] Run build verification
- [x] Fix Vercel Build <!-- id: 5 -->
    - [x] Create `.npmrc` with `legacy-peer-deps`
- [x] Debug Vercel "Failure to Fetch"
    - [x] Investigate missing environment variables
    - [x] Add error logging for Supabase client

