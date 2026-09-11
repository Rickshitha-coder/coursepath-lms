import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Dashboard — fetches this student's real enrollments (or, for an admin,
// just shows account info) from the live backend and renders them
// dynamically. Loading/error states are handled explicitly.
export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (user.role !== 'student') { setLoading(false); return; }
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/enrollments/student/${user.id}`);
        if (!cancelled) setEnrollments(data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || 'Could not load your enrollments.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  return (
    <main className="page">
      <h1>Welcome back, {user.name}</h1>
      <p className="muted">{user.role === 'admin' ? 'Administrator account' : 'Student account'}</p>

      {user.role === 'admin' ? (
        <p>
          Admin course and student management lives in the full admin panel —
          open <code>/admin-dashboard.html</code> from the main site for
          course CRUD, student management, and analytics.
        </p>
      ) : (
        <>
          <h2>Your courses</h2>
          {loading && <p>Loading your courses…</p>}
          {error && <p className="form-error">{error}</p>}
          {!loading && !error && enrollments.length === 0 && (
            <p>You haven't enrolled in any courses yet. <Link to="/courses">Browse courses</Link> to get started.</p>
          )}
          <ul className="dashboard-list">
            {enrollments.map((e) => (
              <li key={e.id}>
                <strong>{e.course.name}</strong> — {e.course.instructor} ({e.course.duration} weeks)
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
