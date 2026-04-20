import express from 'express';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

// Load Slack channel name mappings
const __dirname_early = dirname(fileURLToPath(import.meta.url));
const channelConfigPath = join(__dirname_early, '..', 'slack-channels.json');
let slackChannelNames = {};
if (existsSync(channelConfigPath)) {
  try {
    slackChannelNames = JSON.parse(readFileSync(channelConfigPath, 'utf-8'));
    console.log(`Loaded ${Object.keys(slackChannelNames).length} Slack channel name mappings`);
  } catch (e) {
    console.warn('Failed to parse slack-channels.json:', e.message);
  }
}

const app = express();
const PORT = process.env.PORT || 3080;
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_EMAIL = process.env.N8N_EMAIL;
const N8N_PASSWORD = process.env.N8N_PASSWORD;

if (!N8N_API_KEY) {
  console.error('ERROR: N8N_API_KEY environment variable is required');
  process.exit(1);
}

// Session cookie storage for internal API auth
let sessionCookie = null;
let sessionExpiry = 0;

async function ensureSession() {
  // Refresh session if expired or missing (refresh 5 min before expiry)
  if (sessionCookie && Date.now() < sessionExpiry - 5 * 60 * 1000) {
    return sessionCookie;
  }

  if (!N8N_EMAIL || !N8N_PASSWORD) {
    throw new Error('N8N_EMAIL and N8N_PASSWORD required for workflow execution');
  }

  console.log('Authenticating with n8n...');
  const loginRes = await fetch(`${N8N_BASE_URL}/rest/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrLdapLoginId: N8N_EMAIL, password: N8N_PASSWORD }),
  });

  if (!loginRes.ok) {
    const err = await loginRes.text();
    throw new Error(`n8n login failed: ${err}`);
  }

  // Extract session cookie from response
  const setCookie = loginRes.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error('No session cookie received from n8n');
  }

  // Parse the cookie (n8n uses 'n8n-auth' cookie)
  sessionCookie = setCookie.split(';')[0];
  // Session typically lasts 7 days, refresh after 6 days
  sessionExpiry = Date.now() + 6 * 24 * 60 * 60 * 1000;

  console.log('n8n session established');
  return sessionCookie;
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

// Scan all workflows for Slack channel IDs
app.get('/api/slack-channels', async (req, res) => {
  try {
    const { status, data } = await proxyToN8n('GET', '/workflows');
    if (status !== 200) {
      return res.status(status).json(data);
    }

    const channelIds = new Set();

    // Scan each workflow for Slack nodes
    for (const workflow of (data.data || [])) {
      // Get full workflow details to access nodes
      const { status: wfStatus, data: wfData } = await proxyToN8n('GET', `/workflows/${workflow.id}`);
      if (wfStatus === 200 && wfData.nodes) {
        for (const node of wfData.nodes) {
          if (node.type?.toLowerCase().includes('slack')) {
            // Check both channel and channelId params (n8n uses either)
            const channelValue = node.parameters?.channelId?.value || node.parameters?.channelId
              || node.parameters?.channel?.value || node.parameters?.channel;
            if (channelValue && typeof channelValue === 'string' && !channelValue.includes('{{') && !channelValue.includes('$')) {
              channelIds.add(channelValue);
            }
          }
        }
      }
    }

    // Build response with friendly names
    const channels = Array.from(channelIds).map(id => ({
      id,
      name: slackChannelNames[id] || null,
    }));

    res.json({ channels, nameConfig: slackChannelNames });
  } catch (error) {
    console.error('Error scanning for Slack channels:', error.message);
    res.status(500).json({ error: 'Failed to scan for Slack channels' });
  }
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

// Update workflow (for node parameter changes)
app.put('/api/workflows/:id', async (req, res) => {
  try {
    // Fetch current workflow to get all required fields
    const { status: getStatus, data: current } = await proxyToN8n('GET', `/workflows/${req.params.id}`);
    if (getStatus !== 200) {
      return res.status(getStatus).json(current);
    }

    // Build PUT body with required fields only
    const updateBody = {
      name: current.name,
      nodes: req.body.nodes || current.nodes,
      connections: current.connections,
      settings: { executionOrder: current.settings?.executionOrder || 'v1' },
    };

    const { status, data } = await proxyToN8n('PUT', `/workflows/${req.params.id}`, updateBody);
    res.status(status).json(data);
  } catch (error) {
    console.error('Error updating workflow:', error.message);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

app.post('/api/workflows/:id/run', async (req, res) => {
  try {
    // Fetch the workflow data first to find the trigger node
    const { status: wfStatus, data: workflow } = await proxyToN8n('GET', `/workflows/${req.params.id}`);
    if (wfStatus !== 200) {
      return res.status(wfStatus).json(workflow);
    }

    // Find the first trigger node (nodes ending in 'Trigger' or manual trigger)
    const triggerNode = workflow.nodes?.find(n =>
      n.type?.includes('Trigger') || n.type === 'n8n-nodes-base.manualTrigger'
    );

    if (!triggerNode) {
      return res.status(400).json({ error: 'No trigger node found in workflow' });
    }

    // Use n8n's internal API with session cookie auth
    const cookie = await ensureSession();
    const url = `${N8N_BASE_URL}/rest/workflows/${req.params.id}/run`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie,
      },
      body: JSON.stringify({
        triggerToStartFrom: {
          name: triggerNode.name,
          data: { main: [[{ json: {} }]] },
        },
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error running workflow:', error.message);
    res.status(500).json({ error: error.message || 'Failed to run workflow' });
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
