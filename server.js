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

// Default data for fresh deployment
const defaults = {
  'players.json': [
    {num:1,name:'Устинов Семён',pos:'Вр'},{num:30,name:'Распопов Денис',pos:'Вр'},
    {num:2,name:'Эрленбуш Илья',pos:'Защ'},{num:5,name:'Колотыгин Андрей',pos:'Защ'},
    {num:9,name:'Аитов Михаил',pos:'Защ'},{num:12,name:'Суковатицын Матвей',pos:'Защ'},
    {num:13,name:'Бабкин Вадим',pos:'Защ'},{num:18,name:'Ибрагимов Дамир',pos:'Защ'},
    {num:19,name:'Тарасов Александр',pos:'Защ'},{num:23,name:'Некрасов Андрей',pos:'Защ'},
    {num:34,name:'Суханов Никита',pos:'Защ'},
    {num:3,name:'Бушманов Игорь',pos:'Нап'},{num:4,name:'Коркин Семён',pos:'Нап'},
    {num:6,name:'Эрленбуш Арсений',pos:'Нап'},{num:7,name:'Сидорин Егор',pos:'Нап'},
    {num:8,name:'Распопов Дмитрий',pos:'Нап'},{num:10,name:'Бушманов Дмитрий',pos:'Нап'},
    {num:11,name:'Дмитриев Семён',pos:'Нап'},{num:14,name:'Фомин Андрей',pos:'Нап'},
    {num:15,name:'Симахин Арсений',pos:'Нап'},{num:17,name:'Чукреев Остап',pos:'Нап'},
    {num:21,name:'Чухманов Максим',pos:'Нап'},{num:31,name:'Колотыгин Алексей',pos:'Нап'},
    {num:49,name:'Сидорин Кирилл',pos:'Нап'}
  ],
  'matches.json': [],
  'gallery.json': [],
  'news.json': [],
  'contacts.json': { address:'', arena:'', phone:'', email:'', hours:'', socialVk:'', socialTg:'', socialYt:'' }
};

// Ensure data files exist
function ensureDataFiles() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  for (const [file, data] of Object.entries(defaults)) {
    const fp = path.join(dataDir, file);
    if (!fs.existsSync(fp)) {
      fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf-8');
    }
  }
}
ensureDataFiles();

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
}
function writeJson(file, data) {
  fs.writeFileSync(path.join(dataDir, file), JSON.stringify(data, null, 2), 'utf-8');
}

// API: get all players
app.get('/api/players', (req, res) => {
  res.json(readJson('players.json'));
});

// API: save players
app.post('/api/players', (req, res) => {
  writeJson('players.json', req.body);
  res.json({ ok: true });
});

// API: get all matches
app.get('/api/matches', (req, res) => {
  res.json(readJson('matches.json'));
});

// API: save matches
app.post('/api/matches', (req, res) => {
  writeJson('matches.json', req.body);
  res.json({ ok: true });
});

// API: get gallery
app.get('/api/gallery', (req, res) => {
  res.json(readJson('gallery.json'));
});

// API: save gallery
app.post('/api/gallery', (req, res) => {
  writeJson('gallery.json', req.body);
  res.json({ ok: true });
});

// API: get news
app.get('/api/news', (req, res) => {
  res.json(readJson('news.json'));
});

// API: save news
app.post('/api/news', (req, res) => {
  writeJson('news.json', req.body);
  res.json({ ok: true });
});

// API: get contacts
app.get('/api/contacts', (req, res) => {
  res.json(readJson('contacts.json'));
});

// API: save contacts
app.post('/api/contacts', (req, res) => {
  writeJson('contacts.json', req.body);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Сайт ХК «ШАДР» запущен: http://localhost:${PORT}`);
  console.log(`Админ-панель: http://localhost:${PORT}/admin.html`);
});
