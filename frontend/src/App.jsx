import { useState, useEffect, useCallback } from 'react';

const styles = {
  app: {
    fontFamily: '"JetBrains Mono", monospace',
    background: '#0f172a',
    color: '#e2e8f0',
    minHeight: '100vh',
    padding: '0',
    margin: 0,
  },
  header: {
    background: '#1e293b',
    padding: '16px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid #334155',
  },
  title: {
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
    color: '#f8fafc',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    padding: '12px 20px',
    background: '#1e293b',
    borderBottom: '1px solid #334155',
  },
  tab: {
    padding: '8px 16px',
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    fontFamily: 'inherit',
    fontSize: '13px',
    cursor: 'pointer',
    borderRadius: '6px',
  },
  tabActive: {
    background: '#4f46e5',
    color: '#fff',
  },
  filter: {
    display: 'flex',
    gap: '8px',
    padding: '12px 20px',
    overflowX: 'auto',
  },
  filterBtn: {
    padding: '6px 12px',
    border: '1px solid #334155',
    background: 'transparent',
    color: '#94a3b8',
    fontFamily: 'inherit',
    fontSize: '12px',
    cursor: 'pointer',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
  },
  filterActive: {
    background: '#4f46e5',
    borderColor: '#4f46e5',
    color: '#fff',
  },
  list: {
    padding: '0 20px 20px',
  },
  card: {
    background: '#1e293b',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid #334155',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  workflowName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#f8fafc',
    margin: 0,
  },
  toggle: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.2s',
  },
  toggleKnob: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute',
    top: '2px',
    transition: 'left 0.2s',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
  },
  badgeActive: {
    background: '#065f46',
    color: '#6ee7b7',
  },
  badgeInactive: {
    background: '#7f1d1d',
    color: '#fca5a5',
  },
  webhookBtn: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginTop: '12px',
    background: '#4f46e5',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontFamily: 'inherit',
    fontSize: '13px',
    cursor: 'pointer',
  },
  execStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  execMeta: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  error: {
    textAlign: 'center',
    padding: '40px',
    color: '#f87171',
  },
  pullHint: {
    textAlign: 'center',
    padding: '8px',
    fontSize: '12px',
    color: '#64748b',
  },
};

function App() {
  const [tab, setTab] = useState('workflows');
  const [filter, setFilter] = useState('all');
  const [workflows, setWorkflows] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    try {
      const res = await fetch('/api/workflows');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || `Error ${res.status}`);
      setWorkflows(data.data || []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const fetchExecutions = useCallback(async () => {
    try {
      const res = await fetch('/api/executions?limit=50');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || `Error ${res.status}`);
      setExecutions(data.data || []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    await Promise.all([fetchWorkflows(), fetchExecutions()]);
    setRefreshing(false);
  }, [fetchWorkflows, fetchExecutions]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchWorkflows(), fetchExecutions()]).finally(() => setLoading(false));
  }, [fetchWorkflows, fetchExecutions]);

  const toggleWorkflow = async (id, active) => {
    const action = active ? 'deactivate' : 'activate';
    try {
      const res = await fetch(`/api/workflows/${id}/${action}`, { method: 'POST' });
      if (res.ok) {
        setWorkflows(ws => ws.map(w => w.id === id ? { ...w, active: !active } : w));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerWebhook = async (workflow) => {
    const webhookNode = workflow.nodes?.find(n => n.type === 'n8n-nodes-base.webhook');
    if (!webhookNode) return alert('No webhook node found');
    const path = webhookNode.parameters?.path || workflow.id;
    try {
      await fetch(`/api/webhook/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggered: true, timestamp: new Date().toISOString() }),
      });
      alert('Webhook triggered!');
      refresh();
    } catch (e) {
      alert('Failed to trigger webhook');
    }
  };

  const filteredWorkflows = workflows.filter(w => {
    if (filter === 'active') return w.active;
    if (filter === 'inactive') return !w.active;
    return true;
  });

  const hasWebhook = (w) => w.nodes?.some(n => n.type === 'n8n-nodes-base.webhook');

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div style={styles.app}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>n8n Mobile</h1>
      </header>

      <nav style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(tab === 'workflows' ? styles.tabActive : {}) }}
          onClick={() => setTab('workflows')}
        >
          Workflows
        </button>
        <button
          style={{ ...styles.tab, ...(tab === 'executions' ? styles.tabActive : {}) }}
          onClick={() => setTab('executions')}
        >
          Executions
        </button>
      </nav>

      {tab === 'workflows' && (
        <div style={styles.filter}>
          {['all', 'active', 'inactive'].map(f => (
            <button
              key={f}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div style={styles.pullHint} onClick={refresh}>
        {refreshing ? 'Refreshing...' : 'Tap to refresh'}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.list}>
        {tab === 'workflows' && filteredWorkflows.map(w => (
          <div key={w.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.workflowName}>{w.name}</h3>
              <button
                style={{
                  ...styles.toggle,
                  background: w.active ? '#4f46e5' : '#475569',
                }}
                onClick={() => toggleWorkflow(w.id, w.active)}
              >
                <span style={{
                  ...styles.toggleKnob,
                  left: w.active ? '22px' : '2px',
                }} />
              </button>
            </div>
            <span style={{ ...styles.badge, ...(w.active ? styles.badgeActive : styles.badgeInactive) }}>
              {w.active ? 'Active' : 'Inactive'}
            </span>
            {hasWebhook(w) && w.active && (
              <button style={styles.webhookBtn} onClick={() => triggerWebhook(w)}>
                Trigger Webhook
              </button>
            )}
          </div>
        ))}

        {tab === 'executions' && executions.map(ex => (
          <div key={ex.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.execStatus}>
                <span style={{
                  ...styles.dot,
                  background: ex.status === 'success' ? '#22c55e' : ex.status === 'error' ? '#ef4444' : '#f59e0b',
                }} />
                {ex.status}
              </span>
            </div>
            <div style={styles.workflowName}>{ex.workflowData?.name || `Workflow ${ex.workflowId}`}</div>
            <div style={styles.execMeta}>
              {formatDate(ex.startedAt)} &bull; {ex.stoppedAt ? `${((new Date(ex.stoppedAt) - new Date(ex.startedAt)) / 1000).toFixed(1)}s` : 'running'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
