# 📧 Bulk Emailer

A modern web application for sending bulk personalized emails. Built with React (frontend) and Node.js/Express (backend).

## 🚀 Features

- 📁 CSV file upload with validation
- 📎 Optional attachment support
- ✉️ Personalized email messages (using `{name}` placeholder)
- 📊 Real-time progress tracking
- 📝 Live activity log
- 🎨 Mobile-first responsive design
- 🔒 Secure SMTP configuration via environment variables

## 📂 Project Structure

```
Bulk-e-mailer/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── send.js
│   │   └── progress.js
│   ├── services/
│   │   ├── mailer.js
│   │   └── jobQueue.js
│   ├── uploads/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── components/
│   │   │   ├── UploadForm.jsx
│   │   │   ├── Progress.jsx
│   │   │   └── Log.jsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🛠️ Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure your SMTP credentials in `.env`:
```env
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Note:** For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

5. Start the server:
```bash
npm start
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to `http://localhost:3000`):
```env
VITE_API_BASE_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📋 CSV Format

Your CSV file must contain the following columns:

- `name` (or `Name`) - Recipient's name
- `email` (or `Email`) - Recipient's email address

Example CSV:
```csv
name,email
John Doe,john@example.com
Jane Smith,jane@example.com
Bob Johnson,bob@example.com
```

## 🎯 Usage

1. **Prepare your CSV file** with `name` and `email` columns
2. **Upload the CSV file** in the web interface
3. **Optionally upload an attachment** (max 10MB)
4. **Enter the email subject**
5. **Enter the email message** (use `{name}` to personalize)
6. **Click "Start Sending"**
7. **Monitor progress** in real-time

## 🌐 Deployment

### Backend (Render)

1. Push your code to a Git repository
2. Create a new Web Service on Render
3. Connect your repository
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Node Version:** 18 or higher
5. Add environment variables in Render dashboard:
   - `SMTP_EMAIL`
   - `SMTP_PASSWORD`
   - `PORT` (Render will set this automatically)
   - `FRONTEND_URL` (your Vercel frontend URL)
   - `NODE_ENV=production`

### Frontend (Vercel)

1. Push your code to a Git repository
2. Import your project in Vercel
3. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   - `VITE_API_BASE_URL` (your Render backend URL)

## 🔒 Security Notes

- Never commit `.env` files
- Use App Passwords for Gmail (not your regular password)
- Keep your SMTP credentials secure
- The app validates file sizes and formats
- Input sanitization is implemented

## 📝 API Endpoints

### POST /api/send
Sends bulk emails. Accepts multipart/form-data with:
- `csv` (file, required)
- `attachment` (file, optional)
- `subject` (string, required)
- `message` (string, required)

### GET /api/progress
Returns current job progress:
```json
{
  "total": 100,
  "sent": 42,
  "failed": 1,
  "logs": [],
  "status": "processing"
}
```

### GET /api/health
Health check endpoint.

## 🐛 Troubleshooting

**Emails not sending?**
- Verify SMTP credentials in `.env`
- Check that you're using a Gmail App Password
- Check server logs for errors

**CSV validation errors?**
- Ensure CSV has `name` and `email` columns
- Check that all emails are valid format
- Verify CSV file is not corrupted

**Progress not updating?**
- Check browser console for errors
- Verify backend is running and accessible
- Check CORS configuration

## 📄 License

ISC
