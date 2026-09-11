import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!EMAIL_RE.test(form.email)) errs.email = 'Enter a valid email address.';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return; // prevent submission on invalid data
    try {
      await register(form.name, form.email, form.password, form.department);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setFormError(err.message);
    }
  }

  return (
    <main className="page page-narrow">
      <h1>Register</h1>
      {formError && <p className="form-error" role="alert">{formError}</p>}
      {success && <p className="form-success" role="status">Account created! Redirecting to login…</p>}
      <form onSubmit={handleSubmit} noValidate>
        <label>
          Full name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </label>
        <label>
          Department (optional)
          <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Register'}
        </button>
      </form>
      <p>Already have an account? <Link to="/login">Login here</Link>.</p>
    </main>
  );
}
