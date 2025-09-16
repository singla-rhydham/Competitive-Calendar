# Contest Calendar System - Setup Guide

## 🎯 Overview

This system provides a central contest calendar with database integration and Google Calendar synchronization. Users can subscribe/unsubscribe to receive contest notifications directly in their Google Calendar.

## 🏗️ Architecture

### Backend (Express + Node.js)
- **Database**: MongoDB with Mongoose
- **Authentication**: Google OAuth 2.0 with Passport.js
- **APIs**: RESTful endpoints for subscription management
- **Background Jobs**: Cron jobs for contest updates every 6 hours
- **Calendar Integration**: Google Calendar API for contest insertion

### Frontend (Next.js + React + Tailwind)
- **UI**: Modern, responsive dashboard
- **Authentication**: Google OAuth integration
- **Real-time Updates**: Dynamic subscription status and contest display

## 📋 Features Implemented

### ✅ Database Models
- **Users Table**: Extended with `subscribed` and `reminderPreference` fields
- **Contests Table**: Stores contest data from multiple platforms

### ✅ Contest Updater Service
- Fetches contests from Codeforces, LeetCode, AtCoder, CodeChef
- Runs every 6 hours via cron job
- Prevents duplicates using unique contest IDs
- Normalizes data across platforms

### ✅ Google Calendar Integration
- Adds contests to user's primary calendar
- Removes contests when unsubscribing
- Color-coded events by platform
- Smart reminders (1 hour and 10 minutes before)

### ✅ API Endpoints
- `POST /api/subscribe` - Subscribe to contest notifications
- `POST /api/unsubscribe` - Unsubscribe from notifications
- `GET /api/status` - Get user subscription status
- `GET /api/contests` - Get upcoming contests

### ✅ Frontend Features
- Real-time subscription status
- Loading states and success/error messages
- Upcoming contests display
- Responsive design with animations

## 🚀 Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/contest-calendar

# Session Configuration
SESSION_SECRET=your_session_secret_here

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback` (development)
   - Your production URL (when deploying)

### 3. MongoDB Setup

1. Create a MongoDB Atlas account or use local MongoDB
2. Create a database named `contest-calendar`
3. Update `MONGODB_URI` in your `.env` file

### 4. Backend Setup

```bash
cd backend
npm install
npm run build
npm run dev
```

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🔄 How It Works

### Contest Update Flow
1. **Cron Job**: Runs every 6 hours
2. **Data Fetching**: Fetches contests from all platforms
3. **Database Update**: Stores/updates contests in MongoDB
4. **User Sync**: Adds new contests to subscribed users' calendars

### Subscription Flow
1. **User Login**: Google OAuth authentication
2. **Subscribe**: User clicks subscribe button
3. **Calendar Integration**: Contests added to Google Calendar
4. **Status Update**: User marked as subscribed in database

### Unsubscription Flow
1. **Unsubscribe**: User clicks unsubscribe button
2. **Calendar Cleanup**: Contest events removed from calendar
3. **Status Update**: User marked as unsubscribed

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  googleId: String,
  email: String,
  name: String,
  picture: String,
  accessToken: String,
  refreshToken: String,
  subscribed: Boolean,        // NEW
  reminderPreference: String, // NEW
  createdAt: Date,
  updatedAt: Date
}
```

### Contests Collection
```javascript
{
  _id: ObjectId,
  id: String,        // unique: platform + contest id
  platform: String,  // Codeforces, LeetCode, AtCoder, CodeChef
  name: String,
  startTime: Date,
  endTime: Date,
  url: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Frontend Features

### Dashboard Components
- **User Profile**: Shows user info from Google
- **Subscription Toggle**: Subscribe/unsubscribe with real-time feedback
- **Contest List**: Displays upcoming contests with platform badges
- **Status Messages**: Success/error feedback for actions

### UI/UX Enhancements
- **Loading States**: Button shows "Processing..." during API calls
- **Success Messages**: "Contests have been added to your Google Calendar!"
- **Error Handling**: Graceful error messages for failed operations
- **Responsive Design**: Works on desktop and mobile

## 🔧 API Reference

### Authentication Endpoints
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### Subscription Endpoints
- `POST /api/subscribe` - Subscribe to notifications
- `POST /api/unsubscribe` - Unsubscribe from notifications
- `GET /api/status` - Get subscription status
- `GET /api/contests` - Get upcoming contests

## 🚀 Deployment Considerations

### Environment Variables
- Update `FRONTEND_URL` for production
- Use secure `SESSION_SECRET`
- Configure production MongoDB URI

### Google OAuth
- Add production redirect URIs
- Update authorized domains

### Cron Jobs
- Ensure server stays running for cron jobs
- Consider using external cron services for production

## 🐛 Troubleshooting

### Common Issues
1. **Google Calendar Permission**: Ensure Calendar API is enabled
2. **MongoDB Connection**: Check connection string and network access
3. **CORS Issues**: Verify `FRONTEND_URL` matches your frontend domain
4. **Token Expiry**: Google tokens may need refresh (handled automatically)

### Debug Mode
- Check server logs for contest update status
- Monitor MongoDB for data insertion
- Verify Google Calendar events are created

## 📈 Future Enhancements

### Potential Improvements
- **Email Notifications**: Send email reminders
- **Custom Reminders**: User-configurable reminder times
- **Contest Filtering**: Filter by platform or difficulty
- **Mobile App**: React Native or PWA
- **Analytics**: Track user engagement
- **Admin Panel**: Manage contests and users

## 🎉 Success!

Your contest calendar system is now fully functional with:
- ✅ Centralized contest database
- ✅ Google Calendar integration
- ✅ Subscribe/unsubscribe functionality
- ✅ Automated contest updates
- ✅ Modern, responsive UI

Users can now log in with Google, subscribe to contest notifications, and have all upcoming contests automatically added to their Google Calendar!
