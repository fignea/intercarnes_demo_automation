const express = require('express');
const pool = require('../db');
const router = express.Router();

function buildIntentionId() {
  return `INT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function normalizePhone(v) {
  if (v == null || typeof v !== 'string') return '';
  return v.replace(/\D/g, '');
}

router.post('/', async (req, res) => {
  const {
    intentionId,
    producto,
    cantidad,
    foto_url,
    audio_url,
    telefono,
    nombre
  } = req.body;

  const phoneNorm = normalizePhone(telefono);
  const id = (intentionId ? normalizePhone(String(intentionId)) : null) || phoneNorm || buildIntentionId();

  try {
    const [result] = await pool.execute(
      `INSERT INTO intentions 
        (intention_key, producto, cantidad, foto_url, audio_url, telefono, nombre, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         producto = VALUES(producto),
         cantidad = VALUES(cantidad),
         foto_url = VALUES(foto_url),
         audio_url = VALUES(audio_url),
         telefono = VALUES(telefono),
         nombre = VALUES(nombre),
         updated_at = NOW()`,
      [id, producto || null, cantidad || null, foto_url || null, audio_url || null, phoneNorm || telefono || null, nombre || null]
    );

    const [rows] = await pool.execute(
      'SELECT * FROM intentions WHERE intention_key = ?',
      [id]
    );

    res.status(201).json({
      ok: true,
      intention: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al guardar la intención' });
  }
});

// Intención abierta por teléfono (debe ir antes de /:intentionKey)
router.get('/open-by-phone/:telefono', async (req, res) => {
  const telefonoNorm = normalizePhone(req.params.telefono || '');
  try {
    if (!telefonoNorm) {
      return res.status(404).json({ ok: false, error: 'Sin intención abierta', intention: null });
    }
    const [rows] = await pool.execute(
      `SELECT * FROM intentions
       WHERE telefono = ? AND converted_to_order_at IS NULL
       ORDER BY updated_at DESC
       LIMIT 1`,
      [telefonoNorm]
    );
    if (!rows.length) {
      return res.status(404).json({ ok: false, error: 'Sin intención abierta', intention: null });
    }
    res.json({ ok: true, intention: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al buscar intención' });
  }
});

router.get('/:intentionKey', async (req, res) => {
  const { intentionKey } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM intentions WHERE intention_key = ?',
      [intentionKey]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: 'Intención no encontrada' });
    }

    res.json({ ok: true, intention: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al obtener la intención' });
  }
});

module.exports = router;

