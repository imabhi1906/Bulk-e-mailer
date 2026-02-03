import express from 'express';
import { getJobProgress } from '../services/jobQueue.js';

const router = express.Router();

/**
 * GET /api/progress
 * Returns current job progress
 */
router.get('/', (req, res) => {
  const progress = getJobProgress();

  if (!progress) {
    return res.json({
      total: 0,
      sent: 0,
      failed: 0,
      logs: [],
      status: 'idle',
    });
  }

  res.json({
    total: progress.total,
    sent: progress.sent,
    failed: progress.failed,
    logs: progress.logs,
    status: progress.status,
  });
});

export default router;
