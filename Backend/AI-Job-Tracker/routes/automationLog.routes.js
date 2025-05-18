import express from 'express';
import AutomationLog from '../models/automationLog.model.js';
const router = express.Router();

// GET /api/automation/logs?userId=...&limit=...
router.get('/logs', async (req, res) => {
  try {
    const { userId, limit = 50 } = req.query;
    const query = userId ? { userId } : {};
    const logs = await AutomationLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 