import express from 'express';
import passport from 'passport';

const router = express.Router();

// Google OAuth login route
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    accessType: 'offline',
    prompt: 'consent'
  })
);

// Google OAuth callback route
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to frontend dashboard
    const user = req.user as any;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    res.redirect(`${frontendUrl}/dashboard?name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&picture=${encodeURIComponent(user.picture || '')}`);
  }
);

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user route
router.get('/me', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const user = req.user as any;
      const User = (await import('../models/User.js')).default;
      const userDoc = await User.findById(user._id);
      
      if (!userDoc) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: userDoc._id,
        googleId: userDoc.googleId,
        email: userDoc.email,
        name: userDoc.name,
        picture: userDoc.picture,
        subscribed: userDoc.subscribed,
        reminderPreference: userDoc.reminderPreference,
        platforms: userDoc.platforms,
        platformColors: userDoc.platformColors,
        timeZone: userDoc.timeZone
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

export default router;
