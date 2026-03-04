const express = require('express');
const pool = require('../db');

const apiRouter = express.Router();
const viewRouter = express.Router();

apiRouter.post('/', async (req, res) => {
  const {
    intentionKey,
    producto,
    cantidad,
    foto_url,
    audio_url,
    telefono,
    nombre
  } = req.body;

  try {
    let baseData = {};

    if (intentionKey) {
      const [intentions] = await pool.execute(
        'SELECT * FROM intentions WHERE intention_key = ?',
        [intentionKey]
      );
      if (intentions.length) {
        const i = intentions[0];
        baseData = {
          producto: i.producto,
          cantidad: i.cantidad,
          foto_url: i.foto_url,
          audio_url: i.audio_url,
          telefono: i.telefono,
          nombre: i.nombre
        };
      }
    }

    const finalData = {
      producto: producto ?? baseData.producto ?? null,
      cantidad: cantidad ?? baseData.cantidad ?? null,
      foto_url: foto_url ?? baseData.foto_url ?? null,
      audio_url: audio_url ?? baseData.audio_url ?? null,
      telefono: telefono ?? baseData.telefono ?? null,
      nombre: nombre ?? baseData.nombre ?? null
    };

    const [result] = await pool.execute(
      `INSERT INTO orders
        (intention_key, producto, cantidad, foto_url, audio_url, telefono, nombre, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        intentionKey || null,
        finalData.producto,
        finalData.cantidad,
        finalData.foto_url,
        finalData.audio_url,
        finalData.telefono,
        finalData.nombre
      ]
    );

    if (intentionKey) {
      await pool.execute(
        'UPDATE intentions SET converted_to_order_at = NOW() WHERE intention_key = ?',
        [intentionKey]
      );
    }

    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      ok: true,
      order: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al crear la orden' });
  }
});

apiRouter.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, intention_key, producto, cantidad, created_at FROM orders ORDER BY created_at DESC'
    );
    res.json({ ok: true, orders: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al listar las órdenes' });
  }
});

apiRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ ok: false, error: 'Orden no encontrada' });
    }
    res.json({ ok: true, order: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al obtener la orden' });
  }
});

viewRouter.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, intention_key, producto, cantidad, created_at FROM orders ORDER BY created_at DESC'
    );
    res.render('orders-list', { orders: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar las órdenes');
  }
});

viewRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    if (!rows.length) {
      return res.status(404).send('Orden no encontrada');
    }
    res.render('order-detail', { order: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar la orden');
  }
});

module.exports = {
  apiRouter,
  viewRouter
};

