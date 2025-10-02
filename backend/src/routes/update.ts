import express from 'express';
import contestUpdater from '../services/contestUpdater.js';
import googleCalendarService from '../services/googleCalendar.js';

const router = express.Router();

router.get('/update-contests', async (req, res) => {
  try {
    await contestUpdater.updateContests();
    await googleCalendarService.syncContestsForSubscribedUsers();
    res.json({ success: true, message: 'Contests and user calendars updated successfully' });
  } catch (error) {
    console.error('Error in /update-contests route:', error);
    res.status(500).json({ success: false, message: 'Failed to update contests and user calendars' });
  }
});

export default router;
