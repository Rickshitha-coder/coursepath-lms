import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Reusable navbar. Shows Login/Register when logged out, and
// Dashboard/Logout when logged in — dynamic navigation driven entirely by
// AuthContext, no page reload needed.
export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">Coursepath</Link>
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/courses">Courses</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <span className="navbar-user">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn-link" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
