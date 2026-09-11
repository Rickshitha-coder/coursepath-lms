import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  function validate() {
    const errs = {};
    if (!EMAIL_RE.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return; // prevent submission on invalid data
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/dashboard' : '/dashboard');
    } catch (err) {
      setFormError(err.message);
    }
  }

  return (
    <main className="page page-narrow">
      <h1>Login</h1>
      {formError && <p className="form-error" role="alert">{formError}</p>}
      <form onSubmit={handleSubmit} noValidate>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
      <p>No account? <Link to="/register">Register here</Link>.</p>
    </main>
  );
}
