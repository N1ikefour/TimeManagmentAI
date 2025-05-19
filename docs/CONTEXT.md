# Focus App - Feature Specification

## Overview

The application is designed to boost user productivity by helping them focus on high-priority tasks. Artificial intelligence is used to prioritize tasks, and a focus mode is implemented to block distractions and structure work sessions using the Pomodoro technique.

## Main Screens and User Flow

1. **Welcome Screen**

   - **Description**: A clean, minimalist screen displaying the logo and a brief welcome message.
   - **User Actions**: Register / Log in

2. **Registration / Login**

   - **Method**: Via email (with confirmation).
   - **Validation**: Checks for valid and existing email, confirmation via code/link.
   - **Result**: Successful registration redirects the user to the dashboard.

3. **Main Dashboard**

   - **Contents**:
     - List of current tasks
     - Tasks prioritized by AI (from highest to lowest importance)
     - "Quick Add Task" button
     - Button to open AI chat
     - Button to enter Focus Mode
   - **Features**:
     - Quick Task Add: User types a task → it's added to the list → AI analyzes and sets priority.
     - AI Chat: Users can input tasks in natural language. AI processes the input and creates a structured task (title, description, deadline, priority).

4. **Focus Mode**

   - **Purpose**: Eliminate distractions and organize work sessions with a timer.
   - **Features**:
     - Blocks all internal app notifications
     - Starts a timer (default 25 minutes; configurable)
     - Minimalist interface (only task, timer, and stop button visible)
     - Visual/audio signals for session start and end

5. **End of Focus Session**
   - **Upon Completion**:
     - Progress report is displayed (completed task, time spent)
     - Buttons: "Start New Session", "Take a Break"
   - **Reporting**:
     - Number of completed tasks
     - Total focus time per day/week

## Additional Components (for phased development)

- **AI Prioritization**

  - **Input**: List of tasks (manual or via chat)
  - **Output**: Sorted task list by importance and urgency
  - **Methods**:
    - NLP analysis of task phrasing
    - User context (previously completed tasks, calendar, etc.)

- **User Settings**
  - Configure session and break durations
  - Configure AI prioritization (e.g., manually override priority)
  - Task history and focus session statistics

## Technical Notes for Developer

- **Frontend**: React Native with TypeScript, Expo, and Expo Router
- **Backend/Database**: Supabase
- **UI Framework**: React Native Paper
- **AI Processing**: DeepSeek

- **AI**:

  - Embedded NLP module (e.g., spaCy, OpenAI API) for task processing

- **Database**:

  - Users, tasks, priorities, focus sessions, settings

- **Authentication**:
  - Firebase Auth / OAuth2 with email confirmation

## Database Schema

- **Users**

  - id: UUID
  - email: String
  - password_hash: String
  - created_at: Timestamp
  - updated_at: Timestamp

- **Tasks**

  - id: UUID
  - user_id: UUID (foreign key to Users)
  - title: String
  - description: Text
  - priority: Integer
  - deadline: Timestamp
  - created_at: Timestamp
  - updated_at: Timestamp

- **FocusSessions**

  - id: UUID
  - user_id: UUID (foreign key to Users)
  - task_id: UUID (foreign key to Tasks)
  - start_time: Timestamp
  - end_time: Timestamp
  - duration: Integer

- **Settings**
  - id: UUID
  - user_id: UUID (foreign key to Users)
  - session_duration: Integer
  - break_duration: Integer
  - ai_priority_override: Boolean

## Optimal Folder Structure

```
root/
│
├── src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   └── assets/
│
├── backend/
│   ├── api/
│   ├── models/
│   ├── services/
│   └── utils/
│
├── config/
│
├── tests/
│
└── docs/
```

- **src/**: Contains all the frontend code.

  - **components/**: Reusable UI components.
  - **screens/**: Different screens of the application.
  - **navigation/**: Navigation setup and configuration.
  - **services/**: API calls and external services.
  - **hooks/**: Custom React hooks.
  - **context/**: Context API for state management.
  - **utils/**: Utility functions and helpers.
  - **assets/**: Static assets like images and fonts.

- **backend/**: Contains backend-related code.

  - **api/**: API endpoints and controllers.
  - **models/**: Database models and schemas.
  - **services/**: Business logic and services.
  - **utils/**: Utility functions and helpers.

- **config/**: Configuration files.

- **tests/**: Test cases and testing utilities.

- **docs/**: Documentation files.
