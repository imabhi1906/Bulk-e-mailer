export default function Log({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="log-container">
        <h3>Activity Log</h3>
        <div className="log-empty">No activity yet</div>
      </div>
    );
  }

  return (
    <div className="log-container">
      <h3>Activity Log</h3>
      <div className="log-list">
        {logs.map((log, index) => (
          <div key={index} className={`log-item log-${log.type}`}>
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}
