# TaskFlow — Phase 8

Phase 8 is the technical hardening pass. The polished UI is now wired to the local SQLite database instead of mock task data.

## What was audited/fixed
- Home, Tareas and Calendario read real tasks from SQLite.
- Task cards can toggle completion and refresh from the database.
- Create/edit task writes to SQLite and reloads the detail screen.
- Categories are persisted and used by tasks.
- Subtasks are persisted and can be toggled from task detail.
- Statistics are calculated from SQLite.
- Local notifications are scheduled/cancelled when reminders are enabled, edited, deleted or completed.
- Theme remains persisted in SQLite and all main screens respect light/dark mode.
- Seed data uses local device dates instead of UTC date strings.
- Added `app/diagnostics.js` for a quick database sanity check.
- EAS/APK configuration from Phase 7 is preserved.

## Run
```bash
npm install
npx expo-doctor
npx expo start
```

## Android APK
```bash
npx eas login
npx eas build:configure
npm run build:apk
```

Replace the placeholder EAS project ID in `app.json` after `eas build:configure` links the project.

## Manual QA checklist
1. Create a task.
2. Edit its title/date/time/priority/category.
3. Add and toggle subtasks.
4. Toggle completion from Home and Tareas.
5. Filter/search tasks.
6. Open Calendar and verify the selected date.
7. Enable a reminder and verify it appears in Android scheduled notifications.
8. Edit a task reminder and verify the old notification is cancelled.
9. Delete a task and verify its notifications disappear.
10. Change theme to Claro/Oscuro/Sistema and restart the app.
11. Open `/diagnostics` and verify database counts.
12. Run `npx expo-doctor` before building the APK.
