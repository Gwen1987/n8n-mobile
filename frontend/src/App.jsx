import { useState, useEffect, useCallback, useMemo } from 'react';

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
  runBtn: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginTop: '12px',
    background: '#0d9488',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontFamily: 'inherit',
    fontSize: '13px',
    cursor: 'pointer',
  },
  runBtnDisabled: {
    background: '#475569',
    cursor: 'not-allowed',
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
  execError: {
    fontSize: '12px',
    color: '#fca5a5',
    background: '#7f1d1d',
    padding: '8px',
    borderRadius: '4px',
    marginTop: '8px',
    wordBreak: 'break-word',
  },
  execErrorNode: {
    color: '#f87171',
    fontWeight: 500,
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
  cardClickable: {
    cursor: 'pointer',
  },
  diagram: {
    marginTop: '16px',
    padding: '12px',
    background: '#0f172a',
    borderRadius: '6px',
    overflowX: 'auto',
  },
  diagramLoading: {
    textAlign: 'center',
    padding: '20px',
    color: '#64748b',
    fontSize: '12px',
  },
  nodeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  nodeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  node: {
    padding: '8px 12px',
    background: '#334155',
    borderRadius: '6px',
    border: '2px solid #475569',
    fontSize: '12px',
    minWidth: '120px',
  },
  nodeError: {
    borderColor: '#ef4444',
    background: '#7f1d1d',
  },
  nodeTrigger: {
    borderColor: '#22c55e',
  },
  nodeName: {
    fontWeight: 500,
    color: '#f8fafc',
    marginBottom: '2px',
  },
  nodeType: {
    fontSize: '10px',
    color: '#94a3b8',
  },
  connector: {
    width: '2px',
    height: '16px',
    background: '#475569',
    marginLeft: '20px',
  },
  connectorArrow: {
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '8px solid #475569',
    marginLeft: '14px',
  },
  expandHint: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '8px',
  },
  nodeClickable: {
    cursor: 'pointer',
  },
  nodeExpanded: {
    borderColor: '#4f46e5',
    background: '#1e293b',
  },
  nodeParams: {
    marginTop: '8px',
    padding: '12px',
    background: '#1e293b',
    borderRadius: '6px',
    border: '1px solid #334155',
  },
  paramRow: {
    marginBottom: '12px',
  },
  paramLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  paramInput: {
    width: '100%',
    padding: '8px 10px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '4px',
    color: '#f8fafc',
    fontFamily: 'inherit',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  paramSelect: {
    width: '100%',
    padding: '8px 10px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '4px',
    color: '#f8fafc',
    fontFamily: 'inherit',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  codeBlock: {
    width: '100%',
    minHeight: '120px',
    padding: '10px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '4px',
    color: '#94a3b8',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '11px',
    whiteSpace: 'pre-wrap',
    overflow: 'auto',
    boxSizing: 'border-box',
  },
  saveBtn: {
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
  saveBtnDisabled: {
    background: '#475569',
    cursor: 'not-allowed',
  },
  paramHint: {
    fontSize: '10px',
    color: '#64748b',
    marginTop: '4px',
  },
  closeNodeBtn: {
    display: 'inline-block',
    padding: '4px 8px',
    background: '#334155',
    border: 'none',
    borderRadius: '4px',
    color: '#94a3b8',
    fontFamily: 'inherit',
    fontSize: '11px',
    cursor: 'pointer',
    marginBottom: '8px',
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

  const [running, setRunning] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [workflowDetails, setWorkflowDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [selectedNode, setSelectedNode] = useState(null); // { workflowId, nodeName }
  const [editedParams, setEditedParams] = useState({});
  const [saving, setSaving] = useState(false);

  const toggleExpand = async (id) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (!workflowDetails[id]) {
      setLoadingDetails(l => ({ ...l, [id]: true }));
      try {
        const res = await fetch(`/api/workflows/${id}`);
        const data = await res.json();
        if (res.ok) {
          setWorkflowDetails(d => ({ ...d, [id]: data }));
        }
      } catch (e) {
        console.error('Failed to fetch workflow details:', e);
      } finally {
        setLoadingDetails(l => ({ ...l, [id]: false }));
      }
    }
  };

  const runWorkflow = async (id) => {
    setRunning(r => ({ ...r, [id]: true }));
    try {
      const res = await fetch(`/api/workflows/${id}/run`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to run');
      alert('Workflow started!');
      refresh();
    } catch (e) {
      alert(`Failed to run: ${e.message}`);
    } finally {
      setRunning(r => ({ ...r, [id]: false }));
    }
  };

  const selectNode = (workflowId, nodeName) => {
    if (selectedNode?.workflowId === workflowId && selectedNode?.nodeName === nodeName) {
      setSelectedNode(null);
      setEditedParams({});
      return;
    }
    const workflow = workflowDetails[workflowId];
    const node = workflow?.nodes?.find(n => n.name === nodeName);
    if (node) {
      setSelectedNode({ workflowId, nodeName });
      setEditedParams(JSON.parse(JSON.stringify(node.parameters || {})));
    }
  };

  const updateParam = (key, value) => {
    setEditedParams(p => ({ ...p, [key]: value }));
  };

  const saveNodeParams = async () => {
    if (!selectedNode) return;
    setSaving(true);
    try {
      const workflow = workflowDetails[selectedNode.workflowId];
      const updatedNodes = workflow.nodes.map(n => {
        if (n.name === selectedNode.nodeName) {
          return { ...n, parameters: editedParams };
        }
        return n;
      });

      const res = await fetch(`/api/workflows/${selectedNode.workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: updatedNodes }),
      });

      if (res.ok) {
        const updated = await res.json();
        setWorkflowDetails(d => ({ ...d, [selectedNode.workflowId]: updated }));
        alert('Saved!');
      } else {
        const err = await res.json();
        alert(`Failed: ${err.message || err.error || 'Unknown error'}`);
      }
    } catch (e) {
      alert(`Failed to save: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Check if node is a code node (read-only)
  const isCodeNode = (type) => {
    return type?.includes('code') || type?.includes('Code') || type?.includes('function') || type?.includes('Function');
  };

  // Get editable fields for common node types
  const getEditableFields = (node) => {
    const type = node.type || '';
    const params = node.parameters || {};

    if (type.includes('scheduleTrigger')) {
      return [
        { key: 'rule.interval', label: 'Interval', type: 'select', options: [
          { value: 'seconds', label: 'Seconds' },
          { value: 'minutes', label: 'Minutes' },
          { value: 'hours', label: 'Hours' },
          { value: 'days', label: 'Days' },
          { value: 'weeks', label: 'Weeks' },
          { value: 'months', label: 'Months' },
        ], getValue: () => params.rule?.interval?.[0]?.field || 'hours' },
        { key: 'rule.intervalValue', label: 'Every', type: 'number', getValue: () => {
          const interval = params.rule?.interval?.[0];
          return interval?.triggerAtHour || interval?.triggerAtMinute || interval?.minutesInterval || interval?.hoursInterval || 1;
        }},
      ];
    }

    if (type.includes('gmail')) {
      return [
        { key: 'resource', label: 'Resource', type: 'text', getValue: () => params.resource || '' },
        { key: 'operation', label: 'Operation', type: 'text', getValue: () => params.operation || '' },
        { key: 'simple', label: 'Simple Output', type: 'select', options: [
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
        ], getValue: () => params.simple },
      ];
    }

    if (type.includes('slack')) {
      return [
        { key: 'channel', label: 'Channel', type: 'text', getValue: () => params.channel || '' },
        { key: 'text', label: 'Message', type: 'textarea', getValue: () => params.text || '' },
      ];
    }

    if (type.includes('webhook')) {
      return [
        { key: 'path', label: 'Path', type: 'text', getValue: () => params.path || '' },
        { key: 'httpMethod', label: 'Method', type: 'select', options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' },
        ], getValue: () => params.httpMethod || 'GET' },
      ];
    }

    if (type.includes('httpRequest')) {
      return [
        { key: 'url', label: 'URL', type: 'text', getValue: () => params.url || '' },
        { key: 'method', label: 'Method', type: 'select', options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' },
        ], getValue: () => params.method || 'GET' },
      ];
    }

    // Generic: show all simple string/number/boolean params
    return Object.entries(params)
      .filter(([k, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
      .slice(0, 6) // Limit to 6 params
      .map(([k, v]) => ({
        key: k,
        label: k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
        type: typeof v === 'boolean' ? 'select' : typeof v === 'number' ? 'number' : 'text',
        options: typeof v === 'boolean' ? [{ value: true, label: 'Yes' }, { value: false, label: 'No' }] : undefined,
        getValue: () => v,
      }));
  };

  const filteredWorkflows = workflows.filter(w => {
    if (filter === 'active') return w.active;
    if (filter === 'inactive') return !w.active;
    return true;
  });

  const workflowNames = useMemo(() => {
    const map = {};
    workflows.forEach(w => { map[w.id] = w.name; });
    return map;
  }, [workflows]);

  const hasWebhook = (w) => w.nodes?.some(n => n.type === 'n8n-nodes-base.webhook');

  // Get error nodes from last execution for a workflow
  const getErrorNodes = (workflowId) => {
    const lastExec = executions.find(e => e.workflowId === workflowId && e.status === 'error');
    if (!lastExec) return new Set();
    const failedNode = lastExec.data?.resultData?.lastNodeExecuted;
    return failedNode ? new Set([failedNode]) : new Set();
  };

  // Build ordered node list following connections
  const getOrderedNodes = (workflow) => {
    if (!workflow?.nodes) return [];
    const nodes = workflow.nodes;
    const connections = workflow.connections || {};

    // Find trigger/start nodes (nodes with no incoming connections)
    const hasIncoming = new Set();
    Object.values(connections).forEach(nodeConns => {
      Object.values(nodeConns).forEach(outputs => {
        outputs.forEach(conns => {
          conns.forEach(c => hasIncoming.add(c.node));
        });
      });
    });

    const startNodes = nodes.filter(n => !hasIncoming.has(n.name));
    const ordered = [];
    const visited = new Set();

    const visit = (nodeName) => {
      if (visited.has(nodeName)) return;
      visited.add(nodeName);
      const node = nodes.find(n => n.name === nodeName);
      if (node) ordered.push(node);
      const nodeConns = connections[nodeName];
      if (nodeConns) {
        Object.values(nodeConns).forEach(outputs => {
          outputs.forEach(conns => {
            conns.forEach(c => visit(c.node));
          });
        });
      }
    };

    startNodes.forEach(n => visit(n.name));
    // Add any unvisited nodes
    nodes.forEach(n => {
      if (!visited.has(n.name)) ordered.push(n);
    });

    return ordered;
  };

  const formatNodeType = (type) => {
    if (!type) return '';
    return type.replace('n8n-nodes-base.', '').replace(/([A-Z])/g, ' $1').trim();
  };

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
        {tab === 'workflows' && filteredWorkflows.map(w => {
          const isExpanded = expanded === w.id;
          const details = workflowDetails[w.id];
          const errorNodes = getErrorNodes(w.id);
          const orderedNodes = details ? getOrderedNodes(details) : [];

          return (
            <div key={w.id} style={styles.card}>
              <div
                style={{ ...styles.cardHeader, ...styles.cardClickable }}
                onClick={() => toggleExpand(w.id)}
              >
                <h3 style={styles.workflowName}>{w.name}</h3>
                <button
                  style={{
                    ...styles.toggle,
                    background: w.active ? '#4f46e5' : '#475569',
                  }}
                  onClick={(e) => { e.stopPropagation(); toggleWorkflow(w.id, w.active); }}
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
              {!isExpanded && (
                <div style={styles.expandHint}>Tap to view diagram</div>
              )}
              {isExpanded && (
                <div style={styles.diagram}>
                  {loadingDetails[w.id] ? (
                    <div style={styles.diagramLoading}>Loading...</div>
                  ) : (
                    <div style={styles.nodeList}>
                      {orderedNodes.map((node, idx) => {
                        const isError = errorNodes.has(node.name);
                        const isTrigger = node.type?.includes('Trigger');
                        const isSelected = selectedNode?.workflowId === w.id && selectedNode?.nodeName === node.name;
                        const isCode = isCodeNode(node.type);
                        const editableFields = !isCode ? getEditableFields(node) : [];

                        return (
                          <div key={node.id || node.name}>
                            {idx > 0 && (
                              <>
                                <div style={styles.connector} />
                                <div style={styles.connectorArrow} />
                              </>
                            )}
                            <div style={styles.nodeRow}>
                              <div
                                style={{
                                  ...styles.node,
                                  ...styles.nodeClickable,
                                  ...(isError ? styles.nodeError : {}),
                                  ...(isTrigger && !isError ? styles.nodeTrigger : {}),
                                  ...(isSelected ? styles.nodeExpanded : {}),
                                }}
                                onClick={(e) => { e.stopPropagation(); selectNode(w.id, node.name); }}
                              >
                                <div style={styles.nodeName}>{node.name}</div>
                                <div style={styles.nodeType}>{formatNodeType(node.type)}</div>
                              </div>
                            </div>

                            {isSelected && (
                              <div style={styles.nodeParams}>
                                <button
                                  style={styles.closeNodeBtn}
                                  onClick={(e) => { e.stopPropagation(); setSelectedNode(null); }}
                                >
                                  Close
                                </button>

                                {isCode ? (
                                  <div style={styles.paramRow}>
                                    <div style={styles.paramLabel}>Code (read-only)</div>
                                    <pre style={styles.codeBlock}>
                                      {node.parameters?.jsCode || node.parameters?.functionCode || node.parameters?.code || JSON.stringify(node.parameters, null, 2)}
                                    </pre>
                                  </div>
                                ) : editableFields.length > 0 ? (
                                  <>
                                    {editableFields.map(field => (
                                      <div key={field.key} style={styles.paramRow}>
                                        <div style={styles.paramLabel}>{field.label}</div>
                                        {field.type === 'select' ? (
                                          <select
                                            style={styles.paramSelect}
                                            value={editedParams[field.key] ?? field.getValue()}
                                            onChange={(e) => {
                                              const val = e.target.value === 'true' ? true : e.target.value === 'false' ? false : e.target.value;
                                              updateParam(field.key, val);
                                            }}
                                          >
                                            {field.options.map(opt => (
                                              <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
                                            ))}
                                          </select>
                                        ) : field.type === 'textarea' ? (
                                          <textarea
                                            style={{ ...styles.paramInput, minHeight: '80px', resize: 'vertical' }}
                                            value={editedParams[field.key] ?? field.getValue()}
                                            onChange={(e) => updateParam(field.key, e.target.value)}
                                          />
                                        ) : (
                                          <input
                                            style={styles.paramInput}
                                            type={field.type}
                                            value={editedParams[field.key] ?? field.getValue()}
                                            onChange={(e) => updateParam(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                                          />
                                        )}
                                      </div>
                                    ))}
                                    <button
                                      style={{ ...styles.saveBtn, ...(saving ? styles.saveBtnDisabled : {}) }}
                                      onClick={(e) => { e.stopPropagation(); saveNodeParams(); }}
                                      disabled={saving}
                                    >
                                      {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                  </>
                                ) : (
                                  <div style={styles.paramHint}>
                                    No editable parameters for this node type.
                                    <pre style={{ ...styles.codeBlock, marginTop: '8px' }}>
                                      {JSON.stringify(node.parameters, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {hasWebhook(w) && w.active && (
                <button style={styles.webhookBtn} onClick={(e) => { e.stopPropagation(); triggerWebhook(w); }}>
                  Trigger Webhook
                </button>
              )}
              <button
                style={{ ...styles.runBtn, ...(running[w.id] ? styles.runBtnDisabled : {}) }}
                onClick={(e) => { e.stopPropagation(); runWorkflow(w.id); }}
                disabled={running[w.id]}
              >
                {running[w.id] ? 'Running...' : 'Run Now'}
              </button>
            </div>
          );
        })}

        {tab === 'executions' && executions.map(ex => {
          const errorInfo = ex.data?.resultData?.error;
          const failedNode = ex.data?.resultData?.lastNodeExecuted;
          return (
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
              <div style={styles.workflowName}>{workflowNames[ex.workflowId] || `Workflow ${ex.workflowId}`}</div>
              <div style={styles.execMeta}>
                {formatDate(ex.startedAt)} &bull; {ex.stoppedAt ? `${((new Date(ex.stoppedAt) - new Date(ex.startedAt)) / 1000).toFixed(1)}s` : 'running'}
              </div>
              {ex.status === 'error' && errorInfo && (
                <div style={styles.execError}>
                  {failedNode && <div style={styles.execErrorNode}>{failedNode}</div>}
                  {errorInfo.message}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
