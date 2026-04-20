import express from 'express';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3080;
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_API_KEY) {
  console.error('ERROR: N8N_API_KEY environment variable is required');
  process.exit(1);
}

app.use(express.json());

// Serve static frontend files in production
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, '..', 'frontend', 'dist')));

// Proxy helper
async function proxyToN8n(method, path, body = null) {
  const url = `${N8N_BASE_URL}/api/v1${path}`;
  const options = {
    method,
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  const data = await response.json();
  return { status: response.status, data };
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Workflows
app.get('/api/workflows', async (req, res) => {
  try {
    const { status, data } = await proxyToN8n('GET', '/workflows');
    res.status(status).json(data);
  } catch (error) {
    console.error('Error fetching workflows:', error.message);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

app.get('/api/workflows/:id', async (req, res) => {
  try {
    const { status, data } = await proxyToN8n('GET', `/workflows/${req.params.id}`);
    res.status(status).json(data);
  } catch (error) {
    console.error('Error fetching workflow:', error.message);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
});

app.post('/api/workflows/:id/activate', async (req, res) => {
  try {
    const { status, data } = await proxyToN8n('POST', `/workflows/${req.params.id}/activate`);
    res.status(status).json(data);
  } catch (error) {
    console.error('Error activating workflow:', error.message);
    res.status(500).json({ error: 'Failed to activate workflow' });
  }
});

app.post('/api/workflows/:id/deactivate', async (req, res) => {
  try {
    const { status, data } = await proxyToN8n('POST', `/workflows/${req.params.id}/deactivate`);
    res.status(status).json(data);
  } catch (error) {
    console.error('Error deactivating workflow:', error.message);
    res.status(500).json({ error: 'Failed to deactivate workflow' });
  }
});

app.post('/api/workflows/:id/run', async (req, res) => {
  try {
    // Use the public API endpoint for running workflows (added in n8n 1.x)
    const { status, data } = await proxyToN8n('POST', `/workflows/${req.params.id}/run`, req.body || {});
    // If the public API doesn't support it, try the test webhook approach
    if (status === 405 || status === 404) {
      // Fallback: try to get workflow and trigger via test webhook if it has one
      const wfRes = await proxyToN8n('GET', `/workflows/${req.params.id}`);
      if (wfRes.status === 200 && wfRes.data) {
        const webhookNode = wfRes.data.nodes?.find(n => n.type === 'n8n-nodes-base.webhook');
        if (webhookNode) {
          const path = webhookNode.parameters?.path || req.params.id;
          const webhookUrl = `${N8N_BASE_URL}/webhook-test/${path}`;
          const webhookRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ triggered: true, timestamp: new Date().toISOString() }),
          });
          const webhookData = await webhookRes.text();
          try {
            res.status(webhookRes.status).json(JSON.parse(webhookData));
          } catch {
            res.status(webhookRes.status).json({ message: 'Workflow triggered via test webhook' });
          }
          return;
        }
      }
      res.status(status).json({ error: 'Workflow does not support direct execution. Add a webhook node to trigger it.' });
      return;
    }
    res.status(status).json(data);
  } catch (error) {
    console.error('Error running workflow:', error.message);
    res.status(500).json({ error: 'Failed to run workflow' });
  }
});

// Executions
app.get('/api/executions', async (req, res) => {
  try {
    const params = new URLSearchParams(req.query);
    params.set('includeData', 'true');
    const { status, data } = await proxyToN8n('GET', `/executions?${params}`);
    res.status(status).json(data);
  } catch (error) {
    console.error('Error fetching executions:', error.message);
    res.status(500).json({ error: 'Failed to fetch executions' });
  }
});

app.get('/api/executions/:id', async (req, res) => {
  try {
    const { status, data } = await proxyToN8n('GET', `/executions/${req.params.id}`);
    res.status(status).json(data);
  } catch (error) {
    console.error('Error fetching execution:', error.message);
    res.status(500).json({ error: 'Failed to fetch execution' });
  }
});

// Webhook trigger proxy
app.post('/api/webhook/:path(*)', async (req, res) => {
  try {
    const webhookUrl = `${N8N_BASE_URL}/webhook/${req.params.path}`;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.text();
    try {
      res.status(response.status).json(JSON.parse(data));
    } catch {
      res.status(response.status).send(data);
    }
  } catch (error) {
    console.error('Error triggering webhook:', error.message);
    res.status(500).json({ error: 'Failed to trigger webhook' });
  }
});

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`n8n Mobile proxy running on port ${PORT}`);
  console.log(`Proxying to n8n at ${N8N_BASE_URL}`);
});
