# Snapgram Custom Time Limit Control

## Current State
App has ScreenTimeModal and ScreenTimeWarning components but real-time tracking is missing. localUsedSeconds is hardcoded to 0 in App.tsx. No countdown timer, no active-use detection. Backend has recordWatchTime/setScreenTimeLimit/getScreenTimeInfo APIs.

## Requested Changes (Diff)

### Add
- useTimeLimitTracker hook (localStorage-based): keys snapgram_time_limit_seconds, snapgram_used_seconds_today, snapgram_last_reset_date. Ticks only when document.visibilityState === visible + window focused. Auto-resets daily. Returns remainingSeconds, usedSeconds, limitSeconds, setLimit, isLimitReached.
- Compact remaining time display in header (e.g. "45m left") next to settings icon
- Full-screen block overlay when isLimitReached with message: "Your selected time limit has been reached. Please come back later."

### Modify
- App.tsx: use the hook, pass values to ScreenTimeModal, show remaining time in header, show ScreenTimeWarning when isLimitReached
- ScreenTimeModal.tsx: accept usedSeconds/limitSeconds/onSetLimit props from hook; save via setLimit callback instead of backend mutation
- ScreenTimeWarning.tsx: update message text to "Your selected time limit has been reached. Please come back later."

### Remove
- Nothing

## Implementation Plan
1. Create src/frontend/src/hooks/useTimeLimitTracker.ts
2. Update App.tsx to wire hook and show remaining time
3. Update ScreenTimeModal.tsx props interface
4. Update ScreenTimeWarning.tsx message
5. Validate and fix any build errors
