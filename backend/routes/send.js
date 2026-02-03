import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { processEmailJob, isJobRunning } from '../services/jobQueue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow CSV and any attachment files
    if (file.fieldname === 'csv' && !file.originalname.toLowerCase().endsWith('.csv')) {
      return cb(new Error('CSV file must have .csv extension'));
    }
    cb(null, true);
  },
});

/**
 * POST /api/send
 * Handles bulk email sending request
 */
router.post('/', upload.fields([{ name: 'csv', maxCount: 1 }, { name: 'attachment', maxCount: 1 }]), async (req, res) => {
  try {
    // Check if a job is already running
    if (isJobRunning()) {
      return res.status(409).json({
        success: false,
        error: 'A job is already in progress. Please wait for it to complete.',
      });
    }

    // Validate required fields
    if (!req.files || !req.files.csv || req.files.csv.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'CSV file is required',
      });
    }

    const { subject, message } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Subject is required',
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Sanitize inputs
    const sanitizedSubject = subject.trim().substring(0, 200);
    const sanitizedMessage = message.trim().substring(0, 10000);

    const csvPath = req.files.csv[0].path;
    const attachmentPath = req.files.attachment && req.files.attachment.length > 0 
      ? req.files.attachment[0].path 
      : null;

    // Process job in background (non-blocking)
    const jobData = {
      csvPath,
      attachmentPath,
      subject: sanitizedSubject,
      message: sanitizedMessage,
    };

    // Start job processing in background (non-blocking async execution)
    processEmailJob(jobData).catch((error) => {
      console.error('Background job error:', error);
    });

    res.json({
      success: true,
      message: 'Email sending job started',
    });
  } catch (error) {
    console.error('Send route error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
