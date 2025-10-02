import express from 'express';
import contestUpdater from '../services/contestUpdater.js';

const router = express.Router();

router.get('/update-contests', async (req, res) => {
  try {
    await contestUpdater.updateContests();
    res.json({ success: true, message: 'Contests updated successfully' });
  } catch (error) {
    console.error('Error in /update-contests route:', error);
    res.status(500).json({ success: false, message: 'Failed to update contests' });
  }
});

export default router;
