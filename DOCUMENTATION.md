# Competitive Calendar - Complete Technical Documentation

> **Version:** 1.0  
> **Last Updated:** October 8, 2025  
> **Author:** Rhydham Singla

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Frontend](#frontend)
5. [Backend](#backend)
6. [Database](#database)
7. [Google OAuth & Calendar API](#google-oauth--calendar-api)
8. [Deployment](#deployment)
9. [Environment Variables](#environment-variables)
10. [Workflows & Automation](#workflows--automation)
11. [Setup Instructions](#setup-instructions)
12. [Known Issues & TODOs](#known-issues--todos)

---

## 1. Overview

**Competitive Calendar** is a full-stack web application that automatically syncs upcoming programming contests from major competitive coding platforms (Codeforces, LeetCode, AtCoder, CodeChef) directly into users' Google Calendars.

### Key Features

- **Automated Contest Fetching**: Scrapes and fetches contests from 4 major platforms every 2 days
- **Google Calendar Integration**: Adds contest events directly to users' primary Google Calendar
- **Customizable Preferences**: Users can select platforms, set reminder times, and choose calendar colors
- **Smart Synchronization**: Prevents duplicate events and handles token refresh automatically
- **Responsive UI**: Modern, animated interface built with Next.js, Tailwind CSS, and Framer Motion
- **Privacy Pages**: Includes `/privacy` and `/terms` pages for Google OAuth verification

### Problem Solved

Competitive programmers often miss contests because:
- Manual tracking across multiple platforms is tedious
- Contest schedules change frequently
- Time zone conversions are error-prone
- No unified notification system exists

This tool solves all these issues by centralizing contest data and leveraging Google Calendar's native reminder system.

---

## 2. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           USER                                  │
│                             ↓                                   │
│                   ┌─────────────────┐                           │
│                   │  Next.js Client │                           │
│                   │   (Vercel)      │                           │
│                   └────────┬────────┘                           │
│                            │                                    │
│                   ┌────────▼────────┐                           │
│                   │  Express Backend│                           │
│                   │    (Render)     │                           │
│                   └────────┬────────┘                           │
│                            │                                    │
│          ┌─────────────────┼─────────────────┐                  │
│          │                 │                 │                  │
│    ┌─────▼─────┐   ┌──────▼──────┐   ┌─────▼──────┐             │
│    │  MongoDB  │   │ Google OAuth│   │  Contest   │             │
│    │  Atlas    │   │  & Calendar │   │   APIs     │             │
│    │           │   │     API     │   │(CF, LC, AC)│             │
│    └───────────┘   └─────────────┘   └────────────┘             │
│                                                                 │
│                   ┌─────────────────┐                           │
│                   │ GitHub Actions  │                           │
│                   │  (Scheduled)    │                           │
│                   └─────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication**:
   - User clicks "Login with Google" on frontend
   - Redirected to Google OAuth consent screen
   - User grants Calendar permissions
   - Backend receives access/refresh tokens
   - User redirected to dashboard with session cookie

2. **Contest Fetching** (Automated):
   - GitHub Actions triggers `/api/update-contests` every 2 days
   - Backend fetches contests from all platforms in parallel
   - Contests normalized and stored in MongoDB
   - New contests synced to all subscribed users' calendars

3. **Subscription Flow**:
   - User subscribes with custom preferences (platforms, reminders, colors)
   - Backend queries MongoDB for upcoming contests
   - Filters contests by user's selected platforms
   - Creates calendar events using Google Calendar API
   - Stores event IDs to prevent duplicates

4. **Unsubscription Flow**:
   - User chooses to unsubscribe (with/without removing existing events)
   - If removal requested, backend fetches all contest events from calendar
   - Deletes events using stored event metadata
   - Updates user subscription status in database

---

## 3. Tech Stack

### Frontend

| Technology         | Version  | Purpose                                   |
|--------------------|----------|-------------------------------------------|
| **Next.js**        | 15.5.3   | React framework with SSR/SSG capabilities |
| **React**          | 19.1.0   | UI library for building components        |
| **TypeScript**     | 5.x      | Type-safe JavaScript                      |
| **Tailwind CSS**   | 4.x      | Utility-first CSS framework               |
| **Next/Image**     | Built-in | Optimized image loading                   |

### Backend

| Technology          | Version  | Purpose                       |
|---------------------|----------|-------------------------------|
| **Node.js**         | 22.x     | JavaScript runtime            |
| **Express**         | 5.1.0    | Web framework for API routes  |
| **TypeScript**      | 5.9.2    | Type-safe backend code        |
| **Mongoose**        | 8.8.4    | MongoDB ODM                   |
| **Passport.js**     | 0.7.0    | Authentication middleware     |
| **Google APIs**     | 144.0.0  | OAuth & Calendar integration  |
| **Axios**           | 1.12.1   | HTTP client for API requests  |
| **Cheerio**         | 1.1.2    | Web scraping (AtCoder)        |
| **express-session** | 1.18.1   | Session management            |
| **CORS**            | 2.8.5    | Cross-origin resource sharing |

### Infrastructure

| Service             | Purpose                       |
|---------------------|-------------------------------|
| **Vercel**          | Frontend hosting (Next.js)    |
| **Render**          | Backend hosting (Express API) |
| **MongoDB Atlas**   | Cloud database                |
| **GitHub Actions**  | Scheduled contest updates     |
| **Google Cloud**    | OAuth & Calendar API          |

---

## 4. Frontend

### Project Structure

```
frontend/
├── app/
│   ├── components/           # Reusable React components
│   │   ├── CalendarPreview.tsx
│   │   ├── ContestCalendar.tsx
│   │   ├── ContestCard.tsx
│   │   ├── ContestList.tsx
│   │   ├── GoogleLoginButton.tsx
│   │   ├── LinkedInFloatingButton.tsx
│   │   ├── SubscribeButton.tsx
│   │   ├── UnsubscribeButton.tsx
│   │   └── useSubscription.ts
│   ├── dashboard/            # Dashboard page
│   │   ├── ClientDashboard.tsx
│   │   └── page.tsx
│   ├── privacy/              # Privacy policy page
│   │   └── page.tsx
│   ├── terms/                # Terms of service page
│   │   └── page.tsx
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home/landing page
├── public/                   # Static assets
├── package.json
└── next.config.ts
```

### Key Components

#### **page.tsx** (Home/Landing Page)
- **Purpose**: Landing page with login functionality
- **Features**:
  - Hero section with animated calendar icon
  - Google OAuth login button
  - User profile display (if logged in)
  - Subscription status badge
  - Link to dashboard
  - Footer with credits
- **State Management**:
  - Fetches user status from `/auth/me` on mount
  - Displays loading spinner during auth check
  - Handles logout with session cleanup
- **Environment Variables**: `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_FRONTEND_URL`

#### **ClientDashboard.tsx** (Dashboard Page)
- **Purpose**: Main user dashboard after login
- **Features**:
  - Welcome card with user profile (name, email, picture)
  - Subscription management section
  - Contest calendar visualization
  - Upcoming contests list grouped by date
  - Feature cards with smooth scroll navigation
- **Data Fetching**:
  - Fetches user data from `/auth/me`
  - Fetches contests from `/api/contests`
  - Auto-refreshes contests every 5 minutes (disabled in production)
- **Responsive Design**: Adapts to mobile/tablet/desktop with Tailwind breakpoints

#### **ContestList.tsx**
- **Purpose**: Displays upcoming contests grouped by date
- **Features**:
  - Groups contests by day (Today, Tomorrow, specific dates)
  - Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
  - Empty state with friendly message
  - Animated entry transitions with Framer Motion
- **Props**: `contests: Contest[]`

#### **ContestCard.tsx**
- **Purpose**: Individual contest card component
- **Features**:
  - Platform badge with color coding:
    - Codeforces: Teal (`bg-teal-600`)
    - LeetCode: Emerald (`bg-emerald-600`)
    - AtCoder: Slate (`bg-slate-700`)
    - CodeChef: Amber (`bg-amber-700`)
  - Contest name with 2-line truncation
  - Start/end time with formatted date
  - External link icon to contest page
  - Hover animations and shadows
- **Props**: `contest: Contest`, `index: number`

#### **SubscribeButton.tsx**
- **Purpose**: Main subscription management component
- **Features**:
  - Subscribe/Unsubscribe toggle with loading states
  - Preference modal with:
    - Reminder time selection (10m, 30m, 1h, 2h)
    - Platform checkboxes (Codeforces, AtCoder, LeetCode, CodeChef)
    - Calendar color picker (11 Google Calendar colors)
  - Unsubscribe modal with options:
    - Remove all events from calendar
    - Keep events but stop adding new ones
  - Success/error toast notifications
  - Disabled state during API calls
- **Custom Hook**: Uses `useSubscription` for state management

#### **useSubscription.ts** (Custom Hook)
- **Purpose**: Manages subscription state and API calls
- **State**:
  - `isSubscribed`: Boolean subscription status
  - `isLoading`: Loading state for API calls
  - `message`: Success/error messages
  - `reminderPreference`: User's reminder time choice
  - `selectedPlatforms`: Array of selected platform names
  - `platformColors`: Map of platform to Google color ID
  - `toast`: Toast notification state
- **Methods**:
  - `submitSubscriptionChange()`: Handles subscribe/unsubscribe API calls
  - Fetches initial status from `/api/status` on mount

#### **GoogleLoginButton.tsx**
- **Purpose**: Reusable Google OAuth button
- **Features**:
  - Shows "Login with Google" when logged out
  - Shows "Logout" when logged in
  - Google logo with brand colors
  - Hover/tap animations
- **Props**: `user?: User`, `onLogout?: () => void`

#### **ContestCalendar.tsx**
- **Purpose**: Visual calendar view of contests
- **Features**:
  - Month view with contest markers
  - Color-coded by platform
  - Click to view contest details
  - Navigation between months

#### **LinkedInFloatingButton.tsx**
- **Purpose**: Floating action button linking to developer's LinkedIn
- **Features**:
  - Fixed position in bottom-right corner
  - Animated entrance with Framer Motion
  - LinkedIn brand colors and icon

### Pages

#### **/** (Home)
- Landing page for unauthenticated users
- Login flow initiation
- Brief project description

#### **/dashboard**
- Main application interface
- Requires authentication (redirects to `/` if not logged in)
- Contest management and subscription controls

#### **/privacy**
- Privacy policy page
- Required for Google OAuth verification
- Details data collection, usage, sharing, security
- Contact information

#### **/terms**
- Terms of service page
- Required for Google OAuth verification
- User responsibilities, liability limitations
- Service availability disclaimers

### Styling

#### **Tailwind CSS Configuration**
- **Color Palette**: Teal as primary color (`teal-50` to `teal-900`)
- **Dark Mode**: Theme toggle support (currently forced light mode)
- **Typography**: System font stack for performance
- **Spacing**: Consistent padding/margin scale
- **Animations**: Custom keyframes for smooth transitions

#### **Global Styles** (`globals.css`)
- CSS reset and normalization
- Tailwind directives
- Custom scrollbar styling
- Dark mode overrides

### Environment Variables (Frontend)

| Variable                   | Description                       | Example                        |
|----------------------------|-----------------------------------|--------------------------------|
| `NEXT_PUBLIC_BACKEND_URL`  | Backend API base URL              | `https://backend.onrender.com` |
| `NEXT_PUBLIC_FRONTEND_URL` | Frontend base URL (for redirects) | `https://app.vercel.app`       |

**Note**: Variables must be prefixed with `NEXT_PUBLIC_` to be accessible in browser.

---

## 5. Backend

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── passport.ts          # Passport.js OAuth configuration
│   ├── models/
│   │   ├── User.ts              # User schema (Mongoose)
│   │   └── Contest.ts           # Contest schema (Mongoose)
│   ├── routes/
│   │   ├── auth.ts              # Authentication routes
│   │   ├── subscription.ts      # Subscribe/unsubscribe routes
│   │   └── update.ts            # Contest update trigger
│   ├── services/
│   │   ├── contestUpdater.ts    # Contest fetching & DB updates
│   │   └── googleCalendar.ts    # Google Calendar integration
│   ├── utils/
│   │   └── timezone.ts          # Timezone conversion utilities
│   └── index.ts                 # Main Express server
├── .env                         # Environment variables (not committed)
├── env.example                  # Example env file
├── package.json
└── tsconfig.json
```

### Core Services

#### **contestUpdater.ts**
Main service responsible for fetching contests from all platforms and storing them in MongoDB.

**Key Methods**:

- **`updateContests()`**: Main orchestrator function
  - Prevents concurrent runs with `isRunning` flag
  - Calls `fetchAllContests()` to get data from all platforms
  - Calls `saveContests()` to upsert into MongoDB
  - Triggers `syncContestsForSubscribedUsers()` after successful update
  
- **`fetchAllContests()`**: Parallel contest fetching
  - Uses `Promise.allSettled()` to fetch from all platforms concurrently
  - Returns aggregated array of contests
  - Continues even if one platform fails

- **`fetchCodeforcesContests()`**:
  - **API**: `https://codeforces.com/api/contest.list`
  - **Format**: JSON API
  - **Filters**: Only contests with `phase === 'BEFORE'`
  - **Time Conversion**: Unix timestamps (seconds) → JavaScript Date
  - **ID Format**: `codeforces_{contest.id}`

- **`fetchLeetCodeContests()`**:
  - **API**: `https://leetcode.com/graphql` (GraphQL endpoint)
  - **Query**: `upcomingContests { title, titleSlug, startTime, duration }`
  - **Time Conversion**: Unix timestamps (seconds) → JavaScript Date
  - **Duration**: Added to startTime to calculate endTime
  - **ID Format**: `leetcode_{titleSlug}`

- **`fetchAtCoderContests()`**:
  - **Method**: Web scraping with Cheerio
  - **URL**: `https://atcoder.jp/contests`
  - **Parsing**:
    - Scrapes `#contest-table-upcoming tbody tr`
    - Extracts time from `<time>` tag
    - Converts IST timestamp to UTC using Luxon
    - Parses duration (HH:MM format)
    - Calculates endTime by adding duration to startTime
  - **ID Format**: `atcoder_{contestCode}`

- **`fetchCodeChefContests()`**:
  - **API**: `https://www.codechef.com/api/list/contests/all`
  - **Format**: JSON API with `future_contests` array
  - **Time Handling**: Uses ISO 8601 fields (`contest_start_date_iso`, `contest_end_date_iso`)
  - **Note**: ISO fields include timezone offset (+05:30 for IST), automatically converted by JavaScript Date constructor
  - **ID Format**: `codechef_{contest_code}`

- **`saveContests()`**:
  - Uses `findOneAndUpdate()` with `upsert: true` to prevent duplicates
  - Contest ID (`id` field) is unique identifier
  - Updates existing or creates new contest documents

- **Cron Job**:
  - Runs every 6 hours in development (`0 */6 * * *`)
  - Disabled in production (triggered by GitHub Actions instead)

#### **googleCalendar.ts**
Handles all Google Calendar API interactions.

**Key Methods**:

- **`addContestsToUserCalendar(userId)`**:
  - Fetches user from MongoDB
  - Sets OAuth2 credentials (access token + refresh token)
  - Queries upcoming contests filtered by user's `platforms` preference
  - Gets existing calendar events to avoid duplicates
  - For each new contest:
    - Creates event object with:
      - Summary: `${platform}: ${name}`
      - Description: Contest details + URL
      - Start/end times in user's timezone (Luxon formatting)
      - Custom reminders based on `reminderPreference`
      - Color ID based on `platformColors` mapping
      - Extended properties with `contestKey` for duplicate detection
    - Inserts event into primary calendar
  - Returns success message with count of added contests

- **`removeContestsFromUserCalendar(userId)`**:
  - Fetches user from MongoDB
  - Sets OAuth2 credentials
  - Calls `getContestEventsFromCalendar()` to find all app-created events
  - Deletes each event by ID
  - Handles 404 errors gracefully (event already deleted)
  - Returns success/failure message with count

- **`syncContestsForSubscribedUsers()`**:
  - Finds all users with `subscribed: true`
  - Calls `addContestsToUserCalendar()` for each subscribed user
  - Used after contest updates to sync new contests to all subscribers

- **`getExistingContestKeys(calendar)`**:
  - Fetches events from user's calendar
  - Filters events with `extendedProperties.private.contestKey`
  - Returns Set of contest keys to prevent duplicate additions

- **`getContestEventsFromCalendar(calendar)`**:
  - Queries calendar events from past 1 month to +6 months
  - Uses max results of 2500
  - Filters events created by the app (has `contestKey` property)
  - Returns array of event objects

- **`getColorIdForPlatform(platform, userColorMap)`**:
  - Maps platform names to Google Calendar color IDs (1-11)
  - Default colors: Codeforces (1), LeetCode (2), AtCoder (3), CodeChef (4)
  - Supports user customization via `userColorMap`

- **`mapReminderPreferenceToMinutes(pref)`**:
  - Converts preference string to minutes array
  - Options: '10m' → [10], '30m' → [30], '1h' → [60], '2h' → [120]
  - Default: [60] (1 hour)

### Routes

#### **auth.ts** (Authentication Routes)

| Method | Endpoint                | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | `/auth/google`          | Initiates Google OAuth flow        |
| GET    | `/auth/google/callback` | OAuth callback, creates session    |
| POST   | `/auth/logout`          | Destroys session                   |
| GET    | `/auth/me`              | Returns current authenticated user |

**OAuth Scopes Requested**:
- `profile`: User's name and picture
- `email`: User's email address
- `https://www.googleapis.com/auth/calendar`: Full calendar access
- `https://www.googleapis.com/auth/calendar.events`: Calendar events access

**OAuth Configuration**:
- `accessType: 'offline'`: Requests refresh token
- `prompt: 'consent'`: Forces consent screen to get refresh token every time

#### **subscription.ts** (Subscription Management Routes)

| Method | Endpoint                | Description                             | Auth Required |
|--------|-------------------------|-----------------------------------------|--------------|
| POST   | `/api/subscribe`        | Subscribe user to contest notifications | ✅           |
| POST   | `/api/unsubscribe`      | Unsubscribe from notifications          | ✅           |
| GET    | `/api/status`           | Get current subscription status         | ✅           |
| GET    | `/api/contests`         | Fetch all upcoming contests             | ❌           |

**POST /api/subscribe**:
- Request Body: `{ reminderPreference, platforms, platformColors, timeZone }`
- Updates user document with preferences
- Calls `addContestsToUserCalendar()`
- Returns `{ success, message, addedCount }`

**POST /api/unsubscribe**:
- Request Body: `{ removeExisting: boolean }`
- Sets `subscribed: false` in user document
- If `removeExisting: true`, calls `removeContestsFromUserCalendar()`
- Returns `{ success, message }`

**GET /api/status**:
- Returns full user object with subscription preferences

**GET /api/contests**:
- Public endpoint (no auth required)
- Queries MongoDB for contests with `startTime >= now`
- Sorts by `startTime` ascending
- Limits to 100 contests
- Returns `{ success, contests, total, lastUpdated }`

#### **update.ts** (Manual Contest Update Trigger)

| Method | Endpoint                | Description                             | Auth Required |
|--------|-------------------------|-----------------------------------------|---------------|
| GET    | `/api/update-contests`  | Manually trigger contest update         | ❌           |

- Called by GitHub Actions every 2 days
- Executes `contestUpdater.updateContests()`
- Executes `googleCalendar.syncContestsForSubscribedUsers()`
- Returns `{ success, message }`

### Database Models

#### **User.ts**

```typescript
interface IUser {
  googleId: string;           // Unique Google ID
  email: string;              // User's email
  name: string;               // Display name
  picture?: string;           // Profile picture URL
  accessToken?: string;       // Google OAuth access token
  refreshToken?: string;      // Google OAuth refresh token
  subscribed: boolean;        // Subscription status (default: false)
  reminderPreference: string; // Reminder time (default: '1h')
  platforms?: string[];       // Selected platforms (default: all 4)
  platformColors?: Record<string, string>; // Platform → color ID map
  timeZone?: string;          // User's timezone (default: 'Asia/Kolkata')
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `googleId`: Unique index
- `email`: Unique index

**Notes**:
- Timestamps are automatically managed by Mongoose
- `refreshToken` only set on first consent or when `prompt: 'consent'` is used
- **Important**: `UserCalendarEventSchema` was removed (event tracking now done via extended properties)

#### **Contest.ts**

```typescript
interface IContest {
  id: string;          // Unique: platform + contest ID
  platform: string;    // Enum: Codeforces, LeetCode, AtCoder, CodeChef
  name: string;        // Contest name
  startTime: Date;     // Contest start (UTC)
  endTime: Date;       // Contest end (UTC)
  url: string;         // Contest URL
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `id`: Unique index (prevents duplicates)
- `startTime`: Index for efficient time-based queries
- `platform`: Index for platform filtering

### Middleware & Configuration

#### **passport.ts** (OAuth Configuration)

- **Strategy**: `passport-google-oauth20`
- **Serialization**: Stores user `_id` in session
- **Deserialization**: Fetches full user from MongoDB by `_id`
- **Token Handling**:
  - Always updates `accessToken` on login
  - Only updates `refreshToken` if provided (not undefined)
  - This prevents overwriting valid refresh tokens with `undefined`

#### **Session Configuration** (index.ts)

```javascript
session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7  // 7 days
  }
})
```

#### **CORS Configuration**

```javascript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})
```

- Allows requests only from specified frontend URL
- Enables cookies/credentials for cross-origin requests

### Time Zone Handling

#### **timezone.ts** (CodeChef IST Parsing)

**Function**: `parseISTtoUTC(dateStr: string): Date`

- **Purpose**: Converts CodeChef's IST datetime strings to UTC Date objects
- **Format**: `"08 Oct 2025  20:00:00"` (note double space)
- **Implementation**:
  - Uses Luxon's `DateTime.fromFormat()` with `zone: "Asia/Kolkata"`
  - Converts to UTC with `.toUTC().toJSDate()`
  - Fallback to standard Date parsing if Luxon fails
- **Note**: As of latest update, CodeChef API now provides ISO 8601 timestamps with timezone offsets, making this utility less critical but still useful for fallback scenarios

### Environment Variables (Backend)

| Variable              | Description                | Example                                            |
|-----------------------|----------------------------|----------------------------------------------------|
| `PORT`                | Server port                | `5000`                                             |
| `FRONTEND_URL`        | Frontend URL for redirects | `https://app.vercel.app`                           |
| `CORS_ORIGIN`         | Allowed CORS origin        | `https://app.vercel.app`                           |
| `MONGODB_URI`         | MongoDB connection string  | `mongodb+srv://...`                                |
| `SESSION_SECRET`      | Session encryption secret  | Random 32-char hex                                 |
| `GOOGLE_CLIENT_ID`    | Google OAuth client ID     | From Google Console                                |
| `GOOGLE_CLIENT_SECRET`| Google OAuth client secret | From Google Console                                |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL         | `https://backend.onrender.com/auth/google/callback`|
| `NODE_ENV`            | Environment mode           | `production`                                       |

---

## 6. Database

### MongoDB Atlas Setup

**Cloud Provider**: MongoDB Atlas (Free Tier M0)

**Configuration**:
1. **Database Name**: `contest-calendar`
2. **Collections**:
   - `users`: User authentication and preferences
   - `contests`: Contest data from all platforms

### Collections & Indexes

#### Users Collection

**Document Structure**:
```json
{
  "_id": ObjectId("..."),
  "googleId": "1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "accessToken": "ya29.a0AfH6SM...",
  "refreshToken": "1//0gDzE-...",
  "subscribed": true,
  "reminderPreference": "1h",
  "platforms": ["Codeforces", "LeetCode", "AtCoder", "CodeChef"],
  "platformColors": {
    "Codeforces": "1",
    "LeetCode": "2",
    "AtCoder": "4",
    "CodeChef": "6"
  },
  "timeZone": "Asia/Kolkata",
  "createdAt": ISODate("2025-01-15T10:30:00Z"),
  "updatedAt": ISODate("2025-01-20T14:25:00Z")
}
```

#### Contests Collection

**Document Structure**:
```json
{
  "_id": ObjectId("..."),
  "id": "codeforces_1234",
  "platform": "Codeforces",
  "name": "Codeforces Round #800 (Div. 2)",
  "startTime": ISODate("2025-10-10T14:35:00Z"),
  "endTime": ISODate("2025-10-10T16:35:00Z"),
  "url": "https://codeforces.com/contest/1234",
  "createdAt": ISODate("2025-10-08T10:00:00Z"),
  "updatedAt": ISODate("2025-10-08T10:00:00Z")
}
```

**Indexes**:
- `id`: Unique, prevents duplicate contest entries
- `startTime`: For time-based queries (upcoming contests)
- `platform`: For platform filtering in subscriptions

### Data Flow

1. **Contest Ingestion**:
   - GitHub Actions triggers `/api/update-contests` every 2 days
   - Backend fetches from all 4 platforms
   - Data normalized to common schema
   - Upserted into `contests` collection (existing contests updated)

2. **User Subscription**:
   - User logs in via Google OAuth
   - User document created/updated in `users` collection
   - Access/refresh tokens stored securely
   - Subscription preferences saved

3. **Calendar Sync**:
   - Query contests where `startTime >= now`
   - Filter by user's `platforms` array
   - Create events in Google Calendar
   - Use `extendedProperties.private.contestKey` to track synced events

### Important Notes

- **Removed Schema**: `UserCalendarEventSchema` was removed in favor of using Google Calendar's extended properties for duplicate detection
- **Time Storage**: All times stored in UTC for consistency
- **Token Security**: Access/refresh tokens stored in MongoDB (consider encryption for production)
- **Data Retention**: Contest documents persist indefinitely (could implement cleanup for old contests)

---

## 7. Deployment

### Frontend Deployment (Vercel)

**Platform**: Vercel  
**Framework**: Next.js 15.5.3  
**Build Command**: `npm run build`  
**Output Directory**: `.next`  
**Node Version**: 22.x

#### Steps:
1. Connect GitHub repository to Vercel
2. Select `frontend` as root directory
3. Framework preset: Next.js (auto-detected)
4. Add environment variables (see table below)
5. Deploy

**Environment Variables (Vercel)**:
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
NEXT_PUBLIC_FRONTEND_URL=https://your-app.vercel.app
```

**Custom Domain** (Optional):
- Add custom domain in Vercel dashboard
- Configure DNS records
- SSL automatically provisioned

### Backend Deployment (Render)

**Platform**: Render  
**Service Type**: Web Service  
**Runtime**: Node.js 22.x  
**Build Command**: `npm install && npm run build`  
**Start Command**: `npm start`  
**Branch**: `main`

#### Steps:
1. Connect GitHub repository to Render
2. Select `backend` as root directory
3. Choose "Web Service" type
4. Set environment variables (see table below)
5. Deploy

**Environment Variables (Render)**:
```
PORT=5000
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/contest-calendar
SESSION_SECRET=<generate-random-32-char-hex>
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/auth/google/callback
NODE_ENV=production
```

**Important**: After deployment, copy the Render service URL (e.g., `https://your-backend.onrender.com`) and:
1. Update `NEXT_PUBLIC_BACKEND_URL` in Vercel
2. Update `GOOGLE_REDIRECT_URI` in Google Cloud Console
3. Update `GOOGLE_REDIRECT_URI` environment variable in Render

### Database Deployment (MongoDB Atlas)

**Platform**: MongoDB Atlas  
**Tier**: M0 (Free)  
**Region**: Choose closest to your Render region

#### Steps:
1. Create MongoDB Atlas account
2. Create new cluster (M0 free tier)
3. Create database user with read/write permissions
4. Whitelist IP addresses:
   - **Option 1**: Whitelist `0.0.0.0/0` (allow from anywhere)
   - **Option 2**: Add Render's IP ranges (less secure but more open)
5. Get connection string from "Connect" → "Connect your application"
6. Format: `mongodb+srv://username:password@cluster.mongodb.net/contest-calendar`
7. Add to Render environment variables

### GitHub Actions Setup

**Purpose**: Trigger contest updates every 2 days

#### Steps:
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add repository secret:
   - Name: `BACKEND_BASE_URL`
   - Value: `https://your-backend.onrender.com`
3. GitHub Actions workflow (`.github/workflows/deploy.yml`) already configured
4. Workflow will run automatically on schedule

**Manual Trigger**:
- Go to Actions tab → Select "Scheduled Contest Update" → Run workflow
- Optionally override `BACKEND_BASE_URL` in workflow input

---

## 8. Workflows & Automation

### GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`  
**Name**: Scheduled Contest Update  
**Schedule**: Every 2 days at 00:00 UTC (`0 0 */2 * *`)  
**Also**: Manual trigger via workflow_dispatch

#### Workflow Steps:

1. **Validate Backend URL**:
   - Checks that `BACKEND_BASE_URL` is set (from secret or workflow input)
   - Exits with error if missing

2. **Trigger Contest Update**:
   - Makes HTTP GET request to `${BACKEND_BASE_URL}/api/update-contests`
   - Retry logic: 3 attempts with 10-second delay
   - Timeout: 60 seconds per attempt
   - Success: HTTP 200 response

3. **Handle Failures**:
   - Logs error if all retries fail
   - Suggests checking Render logs
   - Workflow fails (visible in Actions tab)

#### What Happens on Trigger:

1. Backend receives request at `/api/update-contests`
2. `contestUpdater.updateContests()` executes:
   - Fetches from Codeforces API
   - Fetches from LeetCode GraphQL API
   - Scrapes AtCoder website
   - Fetches from CodeChef API
   - Normalizes and stores in MongoDB
3. `googleCalendar.syncContestsForSubscribedUsers()` executes:
   - Finds all subscribed users
   - For each user, adds new contests to their calendar
   - Skips duplicates using `contestKey` extended property
4. Returns `{ success: true, message: '...' }`

### Automation Benefits

- **No Server Costs**: GitHub Actions is free for public repositories
- **Reliability**: Runs even if local development machine is off
- **Scalability**: Handles growth without infrastructure changes
- **Monitoring**: GitHub Actions provides logs and failure notifications

### Local Development

In development, contests can be triggered:
1. **Automatically**: Cron job runs every 6 hours (if `NODE_ENV !== 'production'`)
2. **Manually**: Call `http://localhost:5000/api/update-contests` directly
3. **On Startup**: Dev mode triggers update 5 seconds after server starts

---

## Conclusion

This documentation provides a complete technical overview of the **Competitive Calendar** project. It covers the entire stack from frontend components to backend services, database schemas, deployment strategies, and automation workflows.

The project successfully solves the problem of manual contest tracking by:
- Automatically fetching contests from 4 major platforms
- Syncing directly to users' Google Calendars
- Providing customizable preferences and reminders
- Automating updates via GitHub Actions

For questions, issues, or contributions:
- **GitHub**: [github.com/singla-rhydham/Competitive-Calendar](https://github.com/singla-rhydham/Competitive-Calendar)
- **Email**: singlarhydham2004@gmail.com
- **Live App**: [competitive-calendar.vercel.app](https://competitive-calendar.vercel.app)

---

**Built with ❤️ by Rhydham Singla**
