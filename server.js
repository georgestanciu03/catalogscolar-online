const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();

const PORT = 5000;
const SECRET = "secret123";
const { sequelize, User, Subject, Grade } = require('./models');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// === Middleware pentru autentificare cu JWT ===
function auth(role = null) {
  return (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Fără token!" });
    try {
      const user = jwt.verify(token, SECRET);
      req.user = user;
      if (role && user.role !== role) {
        return res.status(403).json({ message: "Acces interzis!" });
      }
      next();
    } catch {
      res.status(401).json({ message: "Token invalid!" });
    }
  };
}

// === LOGIN elev/profesor ===
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Cont inexistent!" });

    // Compara direct parolele (NU bcrypt)
    if (password !== user.password)
      return res.status(400).json({ message: "Parolă greșită!" });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      SECRET,
      { expiresIn: "2h" }
    );
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Eroare server!" });
  }
});

// === RUTE ELEV ===
// Vezi notele proprii
app.get('/api/elev/grades', auth('elev'), async (req, res) => {
  try {
    const note = await Grade.findAll({
      where: { student_id: req.user.id },
      include: [
        { model: Subject, attributes: ['name'] }
      ]
    });
    // Afișare prietenoasă
    const rezultat = note.map(n => ({
      id: n.id,
      subject: n.Subject?.name || '-',
      grade: n.grade
    }));
    res.json(rezultat);
  } catch (err) {
    res.status(500).json({ message: "Eroare server!" });
  }
});

// === RUTE PROFESOR ===
// Vezi toate notele, cu elev și materie (join)
app.get('/api/profesor/grades', auth('profesor'), async (req, res) => {
  try {
    const note = await Grade.findAll({
      include: [
        { model: User, as: 'student', attributes: ['id', 'name'] },
        { model: Subject, attributes: ['id', 'name'] }
      ]
    });
    const rezultat = note.map(n => ({
      id: n.id,
      studentId: n.student?.id,
      studentName: n.student?.name,
      subject: n.Subject?.name,
      grade: n.grade
    }));
    res.json(rezultat);
  } catch (err) {
    res.status(500).json({ message: "Eroare server!" });
  }
});

// Adaugă notă (profesor)
app.post('/api/profesor/grades', auth('profesor'), async (req, res) => {
  const { student_id, subject_id, grade } = req.body;
  if (!student_id || !subject_id || !grade)
    return res.status(400).json({ message: "Completează toate câmpurile!" });
  try {
    await Grade.create({
      student_id,
      subject_id,
      professor_id: req.user.id,
      grade
    });
    res.json({ message: "Notă adăugată!" });
  } catch (err) {
    res.status(500).json({ message: "Eroare server!" });
  }
});

// Șterge notă (profesor)
app.delete('/api/profesor/grades/:id', auth('profesor'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const sters = await Grade.destroy({ where: { id } });
    if (!sters)
      return res.status(404).json({ message: "Notă inexistentă!" });
    res.json({ message: "Notă ștearsă!" });
  } catch (err) {
    res.status(500).json({ message: "Eroare server!" });
  }
});

// Calculează medii pentru toți elevii (profesor)
app.get('/api/profesor/medii', auth('profesor'), async (req, res) => {
  try {
    const elevi = await User.findAll({ where: { role: 'elev' } });
    const rezultate = [];
    for (let elev of elevi) {
      const note = await Grade.findAll({ where: { student_id: elev.id } });
      const media =
        note.length > 0
          ? (note.reduce((s, n) => s + n.grade, 0) / note.length).toFixed(2)
          : '-';
      rezultate.push({ id: elev.id, name: elev.name, media });
    }
    res.json(rezultate);
  } catch (err) {
    res.status(500).json({ message: "Eroare server!" });
  }
});

// === PORNEȘTE SERVERUL ===
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log(`Server rulează pe http://localhost:${PORT}`);
  } catch (err) {
    console.error("Eroare conexiune DB!", err);
  }
});
