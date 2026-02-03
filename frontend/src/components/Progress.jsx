export default function Progress({ progress }) {
  const { total, sent, failed, status } = progress;

  if (status === 'idle' || total === 0) {
    return null;
  }

  const percentage = total > 0 ? Math.round((sent / total) * 100) : 0;

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h3>Progress</h3>
        <span className="progress-status">{status}</span>
      </div>
      <div className="progress-bar-wrapper">
        <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="progress-stats">
        <div className="stat">
          <span className="stat-label">Sent:</span>
          <span className="stat-value">{sent}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Failed:</span>
          <span className="stat-value failed">{failed}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{total}</span>
        </div>
      </div>
      <div className="progress-percentage">{percentage}%</div>
    </div>
  );
}
