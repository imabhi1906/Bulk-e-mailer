import { createTransporter, sendEmail } from './mailer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csvParser from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory job state
let currentJob = null;

/**
 * Validates CSV structure
 * @param {Array} rows - Parsed CSV rows
 * @returns {Object} - Validation result
 */
function validateCSV(rows) {
  if (!rows || rows.length === 0) {
    return { valid: false, error: 'CSV file is empty' };
  }

  const firstRow = rows[0];
  const requiredColumns = ['name', 'email'];
  const missingColumns = [];

  for (const col of requiredColumns) {
    if (!firstRow.hasOwnProperty(col)) {
      missingColumns.push(col);
    }
  }

  if (missingColumns.length > 0) {
    return {
      valid: false,
      error: `Missing required columns: ${missingColumns.join(', ')}. CSV must contain 'name' and 'email' columns.`,
    };
  }

  // Validate email format for all rows
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidRows = [];

  rows.forEach((row, index) => {
    const email = row.email || '';
    if (!emailRegex.test(email)) {
      invalidRows.push(index + 1);
    }
  });

  if (invalidRows.length > 0) {
    return {
      valid: false,
      error: `Invalid email format in rows: ${invalidRows.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Normalizes CSV row keys to lowercase
 * @param {Array} rows - CSV rows
 * @returns {Array} - Normalized rows
 */
function normalizeCSVRows(rows) {
  return rows.map((row) => {
    const normalized = {};
    for (const key in row) {
      normalized[key.toLowerCase()] = row[key];
    }
    return normalized;
  });
}

/**
 * Processes email sending job
 * @param {Object} jobData - Job data
 * @param {string} jobData.csvPath - Path to CSV file
 * @param {string} jobData.attachmentPath - Optional attachment path
 * @param {string} jobData.subject - Email subject
 * @param {string} jobData.message - Email message
 */
export async function processEmailJob(jobData) {
  const { csvPath, attachmentPath, subject, message } = jobData;

  // Initialize job state
  currentJob = {
    id: Date.now().toString(),
    total: 0,
    sent: 0,
    failed: 0,
    logs: [],
    status: 'processing',
    startTime: new Date().toISOString(),
  };

  try {
    // Parse CSV
    const rows = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    // Normalize and validate
    const normalizedRows = normalizeCSVRows(rows);
    const validation = validateCSV(normalizedRows);

    if (!validation.valid) {
      currentJob.status = 'failed';
      currentJob.logs.push({
        timestamp: new Date().toISOString(),
        message: `Validation error: ${validation.error}`,
        type: 'error',
      });
      return;
    }

    currentJob.total = normalizedRows.length;
    currentJob.logs.push({
      timestamp: new Date().toISOString(),
      message: `Starting to send ${currentJob.total} emails`,
      type: 'info',
    });

    // Create transporter
    const transporter = createTransporter();

    // Prepare attachment if provided
    const attachments = [];
    if (attachmentPath && fs.existsSync(attachmentPath)) {
      const attachmentName = path.basename(attachmentPath);
      attachments.push({
        filename: attachmentName,
        path: attachmentPath,
      });
    }

    // Send emails sequentially with 500ms delay
    for (const row of normalizedRows) {
      const recipientName = row.name || 'Recipient';
      const recipientEmail = row.email;

      // Personalize message
      const personalizedMessage = message.replace(/\{name\}/g, recipientName);

      const result = await sendEmail(transporter, {
        to: recipientEmail,
        subject,
        text: personalizedMessage,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (result.success) {
        currentJob.sent++;
        const timestamp = new Date();
        const formattedTime = timestamp.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        currentJob.logs.push({
          timestamp: timestamp.toISOString(),
          message: `Mail sent to ${recipientName} @ ${formattedTime}`,
          type: 'success',
        });
      } else {
        currentJob.failed++;
        currentJob.logs.push({
          timestamp: new Date().toISOString(),
          message: `Failed to send to ${recipientName} (${recipientEmail}): ${result.error}`,
          type: 'error',
        });
      }

      // 500ms delay between emails
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    currentJob.status = 'completed';
    currentJob.logs.push({
      timestamp: new Date().toISOString(),
      message: `Job completed. Sent: ${currentJob.sent}, Failed: ${currentJob.failed}`,
      type: 'info',
    });

    // Cleanup files
    try {
      if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath);
      if (attachmentPath && fs.existsSync(attachmentPath)) fs.unlinkSync(attachmentPath);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  } catch (error) {
    currentJob.status = 'failed';
    currentJob.logs.push({
      timestamp: new Date().toISOString(),
      message: `Job failed: ${error.message}`,
      type: 'error',
    });
  }
}

/**
 * Gets current job progress
 * @returns {Object|null} - Current job state or null
 */
export function getJobProgress() {
  return currentJob;
}

/**
 * Clears current job
 */
export function clearJob() {
  currentJob = null;
}

/**
 * Checks if a job is currently running
 * @returns {boolean}
 */
export function isJobRunning() {
  return currentJob !== null && currentJob.status === 'processing';
}
