import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './routes/auth';
import { sessions } from './routes/sessions';
import { admin } from './routes/admin';

const app = new Hono();

// CORS middleware
app.use('*', cors());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// Mount routes
app.route('/api/auth', auth);
app.route('/api/sessions', sessions);
app.route('/api/admin', admin);

// Start server
const port = 3000;
console.log(`Server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});