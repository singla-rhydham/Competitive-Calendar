import express from 'express';
import User from '../models/User.js';
import googleCalendarService from '../services/googleCalendar.js';

const router = express.Router();

// Subscribe to contest notifications
router.post('/subscribe', async (req, res) => {
  try {
    console.log('Subscribe endpoint called');
    console.log('Headers:', req.headers);
    console.log('Session:', req.session);
    console.log('User:', req.user);
    console.log('Is authenticated:', req.isAuthenticated());

    if (!req.isAuthenticated()) {
      console.log('User not authenticated, returning 401');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = req.user as any;
    const userId = user._id;
    console.log('User ID:', userId);

    // Update user subscription status
    await User.findByIdAndUpdate(userId, { subscribed: true });

    // Add contests to user's Google Calendar
    const result = await googleCalendarService.addContestsToUserCalendar(userId);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        addedCount: result.addedCount
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error in subscribe endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Unsubscribe from contest notifications
router.post('/unsubscribe', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = req.user as any;
    const userId = user._id;

    // Update user subscription status
    await User.findByIdAndUpdate(userId, { subscribed: false });

    // Remove contests from user's Google Calendar
    const result = await googleCalendarService.removeContestsFromUserCalendar(userId);

    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error in unsubscribe endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user subscription status
router.get('/status', async (req, res) => {
  try {
    console.log('Status endpoint called');
    console.log('Headers:', req.headers);
    console.log('Session:', req.session);
    console.log('User:', req.user);
    console.log('Is authenticated:', req.isAuthenticated());

    if (!req.isAuthenticated()) {
      console.log('User not authenticated, returning 401');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = req.user as any;
    const userId = user._id;
    console.log('User ID:', userId);

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      subscribed: userDoc.subscribed,
      reminderPreference: userDoc.reminderPreference
    });
  } catch (error) {
    console.error('Error in status endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get upcoming contests
router.get('/contests', async (req, res) => {
  try {
    const Contest = (await import('../models/Contest.js')).default;
    const upcomingContests = await Contest.find({
      startTime: { $gte: new Date() }
    }).sort({ startTime: 1 }).limit(100);

    // Transform contests to include all necessary fields
    const transformedContests = upcomingContests.map(contest => ({
      _id: contest._id,
      id: contest.id,
      platform: contest.platform,
      name: contest.name,
      startTime: contest.startTime.toISOString(),
      endTime: contest.endTime.toISOString(),
      url: contest.url,
      createdAt: contest.createdAt,
      updatedAt: contest.updatedAt
    }));

    console.log(`Returning ${transformedContests.length} upcoming contests`);

    res.json({
      success: true,
      contests: transformedContests,
      total: transformedContests.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
