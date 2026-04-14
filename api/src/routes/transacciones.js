import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';

const router = Router();

const updatableKeys = new Set([
  'canal',
  'fecha',
  'hora',
  'marca',
  'tipoTransaccion',
  'noTarjeta',
  'noAfiliado',
  'respuesta',
  'error',
  'noAutorizacion',
  'referencia',
  'moneda',
  'monto',
  'itbis',
  'dcc',
  'tarifaDcc',
  'monedaDcc',
  'monedaDccAlfanumerica',
  'montoDcc',
  'tasaCambioDcc',
  'margenDcc',
]);

function pickBody(body) {
  if (!body || typeof body !== 'object') return {};
  const data = {};
  for (const key of updatableKeys) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      const v = body[key];
      data[key] = v === undefined ? null : v;
    }
  }
  return data;
}

function parseId(param) {
  const id = Number.parseInt(param, 10);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

/** @param {unknown} v */
function firstQueryValue(v) {
  if (v == null) return undefined;
  if (Array.isArray(v)) return v[0];
  return v;
}

/** @param {import('express').Request['query']} query */
function parseISODateParam(query, key) {
  const raw = firstQueryValue(query[key]);
  if (raw == null || String(raw).trim() === '') return { ok: true, value: null };
  const s = String(raw).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return { ok: false, error: `Invalid ${key}; use YYYY-MM-DD` };
  }
  return { ok: true, value: s };
}

/** @param {{ value: string | null }} fechaDesde @param {{ value: string | null }} fechaHasta */
function buildFechaWhere(fechaDesde, fechaHasta) {
  const d = fechaDesde?.value ?? null;
  const h = fechaHasta?.value ?? null;
  if (!d && !h) return Prisma.sql`TRUE`;
  const hasFecha = Prisma.sql`(fecha IS NOT NULL AND trim(fecha) <> '')`;
  const fechaDate = Prisma.sql`to_date(trim(fecha), 'FMMM/FMDD/YYYY')`;
  if (d && h) {
    return Prisma.sql`${hasFecha} AND ${fechaDate} BETWEEN ${d}::date AND ${h}::date`;
  }
  if (d) return Prisma.sql`${hasFecha} AND ${fechaDate} >= ${d}::date`;
  return Prisma.sql`${hasFecha} AND ${fechaDate} <= ${h}::date`;
}

/**
 * @openapi
 * /transacciones:
 *   get:
 *     summary: List transacciones
 *     tags: [Transacciones]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 200, default: 50 }
 *       - in: query
 *         name: fechaDesde
 *         required: false
 *         schema: { type: string, format: date, example: '2026-04-01' }
 *         description: Inclusive; filtra por campo fecha (M/D/YYYY en BD)
 *       - in: query
 *         name: fechaHasta
 *         required: false
 *         schema: { type: string, format: date, example: '2026-04-30' }
 *         description: Inclusive
 *     responses:
 *       200:
 *         description: Paginated list
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TransaccionList' }
 */
router.get('/', async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
  const skip = (page - 1) * limit;

  const desde = parseISODateParam(req.query, 'fechaDesde');
  const hasta = parseISODateParam(req.query, 'fechaHasta');
  if (!desde.ok) return res.status(400).json({ error: desde.error });
  if (!hasta.ok) return res.status(400).json({ error: hasta.error });
  if (desde.value && hasta.value && desde.value > hasta.value) {
    return res.status(400).json({ error: 'fechaDesde must be <= fechaHasta' });
  }

  // Build WHERE twice: reusing the same Prisma.sql in two $queryRaw calls can break parameter binding.
  const whereCount = buildFechaWhere(desde, hasta);
  const whereSelect = buildFechaWhere(desde, hasta);

  const selectSql = Prisma.sql`
    SELECT
      id,
      canal,
      fecha,
      hora,
      marca,
      tipo_transaccion AS "tipoTransaccion",
      no_tarjeta AS "noTarjeta",
      no_afiliado AS "noAfiliado",
      respuesta,
      error,
      no_autorizacion AS "noAutorizacion",
      referencia,
      moneda,
      monto,
      itbis,
      dcc,
      tarifa_dcc AS "tarifaDcc",
      moneda_dcc AS "monedaDcc",
      moneda_dcc_alfanumerica AS "monedaDccAlfanumerica",
      monto_dcc AS "montoDcc",
      tasa_cambio_dcc AS "tasaCambioDcc",
      margen_dcc AS "margenDcc"
    FROM transacciones
    WHERE ${whereSelect}
    ORDER BY id DESC
    LIMIT ${limit} OFFSET ${skip}
  `;

  const countSql = Prisma.sql`
    SELECT COUNT(*)::int AS c FROM transacciones WHERE ${whereCount}
  `;

  try {
    const [countRows, data] = await prisma.$transaction([
      prisma.$queryRaw(countSql),
      prisma.$queryRaw(selectSql),
    ]);
    const total = countRows[0]?.c ?? 0;
    res.json({ data, total, page, limit });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Query failed (check fecha format in database)' });
  }
});

/**
 * @openapi
 * /transacciones/{id}:
 *   get:
 *     summary: Get one transaccion
 *     tags: [Transacciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Transaccion' }
 *       404:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid id' });

  const row = await prisma.transaccion.findUnique({ where: { id } });
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

/**
 * @openapi
 * /transacciones:
 *   post:
 *     summary: Create transaccion
 *     tags: [Transacciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TransaccionInput' }
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Transaccion' }
 */
router.post('/', async (req, res) => {
  const data = pickBody(req.body);
  const row = await prisma.transaccion.create({ data });
  res.status(201).json(row);
});

/**
 * @openapi
 * /transacciones/{id}:
 *   patch:
 *     summary: Update transaccion (partial)
 *     tags: [Transacciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TransaccionInput' }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Transaccion' }
 *       404:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid id' });

  const data = pickBody(req.body);
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  try {
    const row = await prisma.transaccion.update({ where: { id }, data });
    res.json(row);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

/**
 * @openapi
 * /transacciones/{id}:
 *   delete:
 *     summary: Delete transaccion
 *     tags: [Transacciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid id' });

  try {
    await prisma.transaccion.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

export default router;
