import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { auth } from './routes/auth';

const app = new Hono();

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// Mount auth routes
app.route('/api/auth', auth);

// Start server
const port = 3000;
console.log(`Server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});