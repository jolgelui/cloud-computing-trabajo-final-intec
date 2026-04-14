import 'dotenv/config';
import app from './app.js';

const port = Number.parseInt(process.env.PORT, 10) || 3000;

app.listen(port, () => {
  console.log(`API http://localhost:${port}`);
  console.log(`Swagger http://localhost:${port}/api-docs`);
});
