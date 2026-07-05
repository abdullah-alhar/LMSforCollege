import React, { useEffect, useState } from 'react';
import { History, Loader2, RefreshCw } from 'lucide-react';
import client from '../../api/client';

const RecentLogins = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await client.get('/super-admin/recent-logins');
      setEntries(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Recent login activity could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Login History</h1>
          <p>Web login and logout activity stored in the dedicated audit database.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}><RefreshCw size={15} /> Refresh</button>
      </div>

      {loading ? (
        <div className="state-box"><Loader2 className="spin" /> Loading login activity…</div>
      ) : error ? (
        <div className="form-alert error">{error}</div>
      ) : !entries.length ? (
        <div className="state-box"><History size={30} /><h3>No login activity yet</h3><p>New successful web logins will appear here.</p></div>
      ) : (
        <div className="card recent-logins-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>User Index</th><th>Event</th><th>Role</th><th>Date</th><th>Time</th></tr></thead>
              <tbody>
                {entries.map((entry, index) => {
                  const date = new Date(entry.timestamp || entry.dateTime);
                  return (
                    <tr key={`${entry.username}-${entry.timestamp}-${index}`}>
                      <td><strong>{entry.username || 'Unknown'}</strong></td>
                      <td><span className={`badge ${entry.event === 'LOGOUT' ? 'badge-paid' : 'badge-free'}`}>{entry.event || 'LOGIN'}</span></td>
                      <td><span className="badge badge-teal">{String(entry.role || 'STUDENT').replace('_', ' ')}</span></td>
                      <td>{date.toLocaleDateString()}</td>
                      <td>{date.toLocaleTimeString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentLogins;
