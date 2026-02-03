import { useState } from 'react';
import { sendEmails } from '../api';

export default function UploadForm({ onStartSending, isSending }) {
  const [csvFile, setCsvFile] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCsvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setCsvFile(file);
      setError('');
    }
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('Attachment file size must be less than 10MB');
        return;
      }
      setAttachmentFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('csv', csvFile);
    if (attachmentFile) {
      formData.append('attachment', attachmentFile);
    }
    formData.append('subject', subject.trim());
    formData.append('message', message.trim());

    try {
      await sendEmails(formData);
      onStartSending();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to start sending emails');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <div className="form-group">
        <label htmlFor="csv">CSV File *</label>
        <input
          type="file"
          id="csv"
          accept=".csv"
          onChange={handleCsvChange}
          disabled={isSending}
          required
        />
        {csvFile && <p className="file-name">Selected: {csvFile.name}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="attachment">Attachment (Optional)</label>
        <input
          type="file"
          id="attachment"
          onChange={handleAttachmentChange}
          disabled={isSending}
        />
        {attachmentFile && <p className="file-name">Selected: {attachmentFile.name}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="subject">Subject *</label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={isSending}
          placeholder="Enter email subject"
          maxLength={200}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSending}
          placeholder="Enter email message. Use {name} to personalize."
          rows={6}
          maxLength={10000}
          required
        />
        <small>Tip: Use {'{name}'} to personalize emails with recipient names</small>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="submit-button" disabled={isSending}>
        {isSending ? 'Sending...' : 'Start Sending'}
      </button>
    </form>
  );
}
