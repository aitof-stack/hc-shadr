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
  'matches.json': [
    {date:'2026-06-01',opponent:'Далматово',home:true,score:{us:5,them:2},status:'win'},
    {date:'2026-06-10',opponent:'Катайск',home:false,score:{us:4,them:3},status:'win'},
    {date:'2026-06-15',opponent:'Зауралье',home:true,score:{us:2,them:3},status:'lose'},
    {date:'2026-06-20',opponent:'Курган',home:false,score:{us:3,them:1},status:'win'},
    {date:'2026-06-23',opponent:'Далматово',home:true,score:{us:1,them:4},status:'lose'},
    {date:'2026-07-03',opponent:'Катайск',home:true,score:null,status:'upcoming'},
    {date:'2026-07-10',opponent:'Зауралье',home:false,score:null,status:'upcoming'},
    {date:'2026-07-17',opponent:'Курган',home:true,score:null,status:'upcoming'},
    {date:'2026-07-24',opponent:'Далматово',home:false,score:null,status:'upcoming'},
    {date:'2026-08-01',opponent:'Зауралье',home:true,score:null,status:'upcoming'},
    {date:'2026-08-08',opponent:'Катайск',home:false,score:null,status:'upcoming'},
    {date:'2026-08-15',opponent:'Курган',home:true,score:null,status:'upcoming'}
  ],
  'gallery.json': [
    {category:'team',label:'Командное фото 2026',className:'wide',src:'https://downloader.disk.yandex.ru/preview/323aa9ba0d2bf1b569cd6fc6d01bb74ce3efbaddd20cbcce7cdda360708be25e/6a121e22/F8GrUs-1Nj38uUqyAVRcbvaSfKZzaB8R24XIj9ix1ATf1hoaFXB1IBQgPbZdHZ2IJ0zvTOAbo5ENHT4klvy3wg%3D%3D?uid=0&filename=otS58YAqtcWtSm3VoVarOG--ImYJvWwUCHuxQywUHkO0qi7Mps8zRcpRkSW_KKMKUgJbn35D5kCqPCobf9AIz_M_.jpg&disposition=inline&hash=&limit=0&content_type=image%2Fjpeg&owner_uid=0&tknv=v3&is_direct_zip_experiment=1&size=2048x2048'},
    {category:'match',label:'Матч с Зауральем'},
    {category:'training',label:'Тренировка на льду'}
  ],
  'news.json': [],
  'contacts.json': { address:'641800, г. Шадринск, ул. Спортивная, д. 1', arena:'Ледовая арена «Шадр»', phone:'+7 (35253) 3-45-67', email:'info@hc-shadr.ru', hours:'Пн–Пт: 9:00 – 20:00<br>Сб–Вс: 10:00 – 18:00', socialVk:'https://vk.com/hcshadr', socialTg:'https://t.me/hcshadr', socialYt:'https://youtube.com/@hcshadr' }
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
