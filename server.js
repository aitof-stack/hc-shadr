const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// API cache-control
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

// File upload config
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

// API: upload image
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ url: '/uploads/' + req.file.filename });
});

const dataDir = path.join(__dirname, 'data');

// API: get all players
app.get('/api/players', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'players.json'), 'utf-8'));
  res.json(data);
});

// API: save players
app.post('/api/players', (req, res) => {
  fs.writeFileSync(path.join(dataDir, 'players.json'), JSON.stringify(req.body, null, 2), 'utf-8');
  res.json({ ok: true });
});

// API: get all matches
app.get('/api/matches', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'matches.json'), 'utf-8'));
  res.json(data);
});

// API: save matches
app.post('/api/matches', (req, res) => {
  fs.writeFileSync(path.join(dataDir, 'matches.json'), JSON.stringify(req.body, null, 2), 'utf-8');
  res.json({ ok: true });
});

// API: get gallery
app.get('/api/gallery', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'gallery.json'), 'utf-8'));
  res.json(data);
});

// API: save gallery
app.post('/api/gallery', (req, res) => {
  fs.writeFileSync(path.join(dataDir, 'gallery.json'), JSON.stringify(req.body, null, 2), 'utf-8');
  res.json({ ok: true });
});

// API: get news
app.get('/api/news', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'news.json'), 'utf-8'));
  res.json(data);
});

// API: save news
app.post('/api/news', (req, res) => {
  fs.writeFileSync(path.join(dataDir, 'news.json'), JSON.stringify(req.body, null, 2), 'utf-8');
  res.json({ ok: true });
});

// API: get contacts
app.get('/api/contacts', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'contacts.json'), 'utf-8'));
  res.json(data);
});

// API: save contacts
app.post('/api/contacts', (req, res) => {
  fs.writeFileSync(path.join(dataDir, 'contacts.json'), JSON.stringify(req.body, null, 2), 'utf-8');
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Сайт ХК «ШАДР» запущен: http://localhost:${PORT}`);
  console.log(`Админ-панель: http://localhost:${PORT}/admin.html`);
});
