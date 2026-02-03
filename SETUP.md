# Quick Setup Guide

## Prerequisites

- Node.js 18+ installed
- Gmail account with App Password enabled

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   Create a file named `.env` in the `backend` directory with the following content:
   ```env
   SMTP_EMAIL=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

   **Important:** For Gmail, you must use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password.

4. **Start the server:**
   ```bash
   npm start
   ```

   The backend will be available at `http://localhost:3000`

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file (optional):**
   Create a file named `.env` in the `frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

   If you skip this step, it will default to `http://localhost:3000`

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## Testing

1. Use the provided `sample.csv` file to test
2. Open `http://localhost:5173` in your browser
3. Upload the CSV file
4. Enter a subject and message
5. Click "Start Sending"

## Troubleshooting

### CSV Parser Issues

If you encounter issues with `csv-parser` and ES modules, you can switch to `papaparse`:

1. Install papaparse:
   ```bash
   cd backend
   npm install papaparse
   ```

2. Update `backend/services/jobQueue.js`:
   - Replace `import csvParser from 'csv-parser';` with `import Papa from 'papaparse';`
   - Replace the CSV parsing section with:
   ```javascript
   const csvContent = fs.readFileSync(csvPath, 'utf-8');
   const parseResult = Papa.parse(csvContent, { 
     header: true, 
     skipEmptyLines: true 
   });
   const rows = parseResult.data;
   ```

### Gmail App Password

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate a new app password for "Mail"
5. Use this 16-character password in your `.env` file

### Port Already in Use

If port 3000 is already in use, change the `PORT` in your `.env` file and update `VITE_API_BASE_URL` in the frontend `.env` accordingly.
