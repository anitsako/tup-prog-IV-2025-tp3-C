import app from './app.js';
import { testConnection } from './db.js';

const PORT = process.env.PORT || 3000;

(async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
  });
})();
