import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscription.js';
import updateRoutes from './routes/update.js';
import { initializePassport } from './config/passport.js';
import contestUpdater from './services/contestUpdater.js';
import googleCalendarService from './services/googleCalendar.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy so secure cookies work behind Render's proxy
app.set('trust proxy', 1);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport strategies
initializePassport();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/contest-calendar')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/auth', authRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api', updateRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Initialize contest updater (dev-only initial trigger)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Initializing contest updater (dev)...');
    setTimeout(() => {
      contestUpdater.triggerUpdate();
    }, 5000); // Wait 5 seconds after server start
  }
});
