# Google Sign-In Authentication Setup

This guide will help you set up Google OAuth authentication for your Contest Calendar application.

## Prerequisites

1. **Google Cloud Console Account**: You need a Google account to create OAuth credentials
2. **MongoDB Atlas Account**: For database storage (or use local MongoDB)
3. **Node.js**: Version 16 or higher

## Step 1: Google OAuth Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Contest Calendar"
4. Click "Create"

### 1.2 Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google Calendar API" (for future calendar integration)

### 1.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

## Step 2: MongoDB Setup

### Option A: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/contest-calendar`)

### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/contest-calendar`

## Step 3: Environment Configuration

### 3.1 Backend Environment Variables

1. Copy `backend/env.example` to `backend/.env`
2. Fill in the following variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/contest-calendar

# Session Configuration
SESSION_SECRET=your_random_session_secret_here

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 3.2 Generate Session Secret

You can generate a random session secret using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Install Dependencies

### 4.1 Backend Dependencies

```bash
cd backend
npm install
```

### 4.2 Frontend Dependencies

```bash
cd frontend
npm install
```

## Step 5: Run the Application

### 5.1 Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### 5.2 Start Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## Step 6: Test the Authentication Flow

1. Open `http://localhost:3000` in your browser
2. Click "Login with Google"
3. You should be redirected to Google's OAuth consent screen
4. After authentication, you'll be redirected to the dashboard
5. The dashboard should display your name, email, and profile picture

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**:
   - Make sure the redirect URI in Google Console matches exactly: `http://localhost:5000/auth/google/callback`

2. **MongoDB connection error**:
   - Check your MongoDB URI in the `.env` file
   - Ensure your IP is whitelisted in MongoDB Atlas (if using Atlas)

3. **CORS errors**:
   - Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL

4. **Session not persisting**:
   - Check that `SESSION_SECRET` is set in your `.env` file
   - Ensure cookies are enabled in your browser

### Development vs Production

For production deployment:

1. Update Google OAuth redirect URIs to your production domain
2. Set `NODE_ENV=production` in your environment variables
3. Use HTTPS for both frontend and backend
4. Update `FRONTEND_URL` to your production frontend URL

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── passport.ts          # Passport.js configuration
│   ├── models/
│   │   └── User.ts              # User model for MongoDB
│   ├── routes/
│   │   └── auth.ts              # Authentication routes
│   └── index.ts                 # Main server file
├── .env                         # Environment variables
└── package.json

frontend/
├── app/
│   ├── page.tsx                 # Home page with login button
│   └── dashboard/
│       └── page.tsx             # Dashboard page
└── package.json
```

## Next Steps

After successful authentication setup, you can:

1. Add contest data fetching from APIs
2. Implement Google Calendar integration
3. Add notification preferences
4. Create user settings page
5. Add contest filtering and search

## Security Notes

- Never commit your `.env` file to version control
- Use strong, random session secrets
- Enable HTTPS in production
- Regularly rotate your OAuth credentials
- Implement rate limiting for API endpoints
