const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const router = express.Router();
const JWT_SECRET = 'secretul_tau_super_megasecret';

// Middleware JWT
function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token lipsă!' });
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid sau expirat!' });
  }
}

// Înregistrare
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ message: 'Completează toate câmpurile!' });
  if (await User.findOne({ where: { email } })) return res.status(409).json({ message: 'Email deja folosit!' });
  const hash = await bcrypt.hash(password, 10);
  await User.create({ email, password: hash, role });
  res.json({ message: 'Utilizator creat!' });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ message: 'Utilizator inexistent!' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Parolă greșită!' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, role: user.role });
});

// Rută protejată
router.get('/profile', authMiddleware, async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
  if (!user) return res.status(404).json({ message: 'Utilizator inexistent!' });
  res.json({ message: 'Profil accesat!', user });
});

// Pentru testare cu Postman, export users (fără parolă)
router.get('/users', async (req, res) => {
  const users = await User.findAll({ attributes: ['email', 'role'] });
  res.json(users);
});

module.exports = router;
