import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const transaccionFields = {
  canal: { type: 'string', nullable: true },
  fecha: { type: 'string', nullable: true },
  hora: { type: 'string', nullable: true },
  marca: { type: 'string', nullable: true },
  tipoTransaccion: { type: 'string', nullable: true },
  noTarjeta: { type: 'string', nullable: true },
  noAfiliado: { type: 'string', nullable: true },
  respuesta: { type: 'string', nullable: true },
  error: { type: 'string', nullable: true },
  noAutorizacion: { type: 'string', nullable: true },
  referencia: { type: 'string', nullable: true },
  moneda: { type: 'string', nullable: true },
  monto: { type: 'string', nullable: true },
  itbis: { type: 'string', nullable: true },
  dcc: { type: 'string', nullable: true },
  tarifaDcc: { type: 'string', nullable: true },
  monedaDcc: { type: 'string', nullable: true },
  monedaDccAlfanumerica: { type: 'string', nullable: true },
  montoDcc: { type: 'string', nullable: true },
  tasaCambioDcc: { type: 'string', nullable: true },
  margenDcc: { type: 'string', nullable: true },
};

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Transacciones API',
      version: '1.0.0',
      description: 'CRUD for `transacciones` (local dev, no auth).',
    },
    tags: [{ name: 'Transacciones', description: 'Create, read, update, delete rows' }],
    servers: [{ url: '/' }],
    components: {
      schemas: {
        Transaccion: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            ...transaccionFields,
          },
        },
        TransaccionInput: {
          type: 'object',
          properties: { ...transaccionFields },
        },
        TransaccionList: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/Transaccion' } },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: [join(__dirname, 'routes', '*.js')],
};

export const swaggerSpec = swaggerJsdoc(options);
