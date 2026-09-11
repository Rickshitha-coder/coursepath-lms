import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();
  return (
    <main className="page">
      <section className="hero">
        <h1>Learn at your own pace with Coursepath</h1>
        <p>
          Browse real courses, enroll, track your progress module by module,
          and chat with classmates in real time — all backed by a real
          database and a real REST API.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/courses">Browse courses</Link>
          {!isAuthenticated && <Link className="btn btn-outline" to="/register">Create an account</Link>}
        </div>
      </section>
    </main>
  );
}
