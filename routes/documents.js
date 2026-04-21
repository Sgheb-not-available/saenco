const router = require('express').Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, type, size, to_char(upload_date, \'YYYY-MM-DD\') as upload_date, filename FROM documents ORDER BY upload_date DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { originalname, filename, size } = req.file;
    const ext = path.extname(originalname).replace('.', '').toLowerCase();
    const sizeFormatted = (size / 1024 / 1024).toFixed(2) + ' MB';

    const { rows } = await db.query(
      'INSERT INTO documents (name, type, size, filename) VALUES ($1, $2, $3, $4) RETURNING id, name, type, size, to_char(upload_date, \'YYYY-MM-DD\') as upload_date, filename',
      [originalname, ext, sizeFormatted, filename]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT filename FROM documents WHERE id = $1', [req.params.id]);
    if (rows.length > 0) {
      const filePath = path.join(__dirname, '../public/uploads/', rows[0].filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.query('DELETE FROM documents WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;