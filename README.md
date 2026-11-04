# TaskFlow

TaskFlow is a comprehensive task management mobile application built with React Native and Expo. It helps users organize their tasks, manage subtasks, categorize their activities, set up local notifications, and view their progress—all with local SQLite persistence.

## Key Features

- **Task Management:** Create, edit, and organize tasks with customizable titles, dates, times, priorities, and categories.
- **Subtasks:** Break down larger tasks into manageable subtasks.
- **Local Database Persistence:** All task data, categories, and settings are securely stored locally using Expo SQLite.
- **Local Notifications:** Schedule and manage local reminders for tasks.
- **Categorization & Filtering:** Organize tasks by customizable categories and efficiently search or filter them.
- **Interactive Calendar:** View and manage tasks by date directly from the integrated calendar.
- **Theming System:** Full support for Light, Dark, and System default themes.
- **Data Export:** Export and backup database data locally.
- **Offline First:** Fully functional without an internet connection.

## Tech Stack

- **Framework:** React Native
- **Toolchain:** Expo SDK 57
- **Routing:** Expo Router
- **UI Components:** React Native Paper
- **Local Storage:** Expo SQLite
- **Notifications:** Expo Notifications

## Installation & Running Locally

1. **Clone the repository** (or download the source code).
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run Expo Doctor** (optional but recommended to ensure environment sanity):
   ```bash
   npx expo-doctor
   ```
4. **Start the application:**
   ```bash
   npx expo start
   ```
   You can run it on an Android emulator, iOS simulator, or a physical device via the Expo Go app.

## Building for Android

TaskFlow is configured to be built using Expo Application Services (EAS).

1. **Log in to EAS:**
   ```bash
   npx eas login
   ```
2. **Configure the project:**
   ```bash
   npx eas build:configure
   ```
   *(Note: Ensure to update the EAS project ID in `app.json` if necessary after linking the project.)*
3. **Build the APK:**
   ```bash
   npm run build:apk
   ```

## Diagnostics

The application includes a diagnostics screen (`/diagnostics`) to perform a quick sanity check of the local SQLite database and ensure all tables and basic counts are functioning correctly.
