const router = require('express').Router();
const db = require('../db');

router.post('/', async (req, res) => {
  try {
    const { date, title, description } = req.body;
    const { rows } = await db.query(
      'INSERT INTO events (date, title, description) VALUES ($1::date, $2, $3) RETURNING id, title, description, to_char(date, \'YYYY-MM-DD\') as date',
      [date, title, description]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, title, description, to_char(date, \'YYYY-MM-DD\') as date FROM events ORDER BY date ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;