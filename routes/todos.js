const router = require('express').Router();
const db = require('../db');

// Leggi tutti i todos
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM todos ORDER BY date ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aggiungi un todo
router.post('/', async (req, res) => {
  try {
    const { date, description, priority } = req.body;
    const { rows } = await db.query(
      'INSERT INTO todos (date, description, priority) VALUES ($1, $2, $3) RETURNING *',
      [date, description, priority]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Elimina un todo
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM todos WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;