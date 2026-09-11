const bcrypt = require('bcryptjs');
const { User, Notification } = require('../models');
const { issueToken } = require('../utils/token');
const { pushNotification } = require('../sockets');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res, next) {
  try {
    const { name, email, password, department } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ error: 'An account with that email already exists.' });

    const hash = await bcrypt.hash(password, 10); // real bcrypt hashing, never plain text
    const user = await User.create({ name, email: email.toLowerCase(), password: hash, department, role: 'student' });

    await pushNotification('all', `${name} just joined Coursepath.`);
    res.status(201).json({ id: user.id });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const user = await User.findOne({ where: { email: String(email).toLowerCase() } });
    if (!user) return res.status(401).json({ error: 'Incorrect email or password.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Incorrect email or password.' });

    const token = issueToken(user);
    res.json({ token, role: user.role, name: user.name, id: user.id });
  } catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: 'Email and new password are required.' });
    if (String(newPassword).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const user = await User.findOne({ where: { email: String(email).toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'No account found with that email.' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({});
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) { next(err); }
}

module.exports = { register, login, resetPassword, me };
