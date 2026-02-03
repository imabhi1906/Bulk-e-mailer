import { useState, useEffect, useRef } from 'react';
import UploadForm from './components/UploadForm';
import Progress from './components/Progress';
import Log from './components/Log';
import { getProgress } from './api';

function App() {
  const [progress, setProgress] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    logs: [],
    status: 'idle',
  });
  const [isSending, setIsSending] = useState(false);
  const pollingIntervalRef = useRef(null);

  const fetchProgress = async () => {
    try {
      const data = await getProgress();
      setProgress(data);

      // Stop polling if job is completed or failed
      if (data.status === 'completed' || data.status === 'failed') {
        setIsSending(false);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  // Poll for progress updates
  useEffect(() => {
    if (isSending) {
      // Poll immediately
      fetchProgress();

      // Then poll every 1 second
      pollingIntervalRef.current = setInterval(() => {
        fetchProgress();
      }, 1000);
    } else {
      // Clear interval when not sending
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSending]);

  const handleStartSending = () => {
    setIsSending(true);
    setProgress({
      total: 0,
      sent: 0,
      failed: 0,
      logs: [],
      status: 'processing',
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📧 Bulk Emailer</h1>
        <p>Send personalized emails to multiple recipients</p>
      </header>

      <main className="app-main">
        <div className="container">
          <div className="form-section">
            <UploadForm onStartSending={handleStartSending} isSending={isSending} />
          </div>

          {(isSending || progress.status !== 'idle') && (
            <div className="progress-section">
              <Progress progress={progress} />
              <Log logs={progress.logs} />
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with React & Node.js</p>
      </footer>
    </div>
  );
}

export default App;
