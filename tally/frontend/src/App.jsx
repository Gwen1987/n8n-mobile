import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

const styles = {
  app: {
    fontFamily: '"JetBrains Mono", monospace',
    background: '#0f172a',
    color: '#e2e8f0',
    minHeight: '100vh',
    margin: 0,
    paddingBottom: '40px',
  },
  header: {
    background: '#1e293b',
    padding: '14px 18px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  back: {
    background: 'transparent',
    border: 'none',
    color: '#818cf8',
    fontFamily: 'inherit',
    fontSize: '20px',
    lineHeight: 1,
    padding: '4px 4px 4px 0',
    cursor: 'pointer',
  },
  titleWrap: { flex: 1, minWidth: 0 },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    margin: 0,
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  subtitle: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  refreshBtn: {
    background: 'transparent',
    border: '1px solid #334155',
    color: '#94a3b8',
    fontFamily: 'inherit',
    fontSize: '11px',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  filter: {
    display: 'flex',
    gap: '8px',
    padding: '12px 18px',
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
  list: { padding: '0 18px 20px' },
  card: {
    background: '#1e293b',
    borderRadius: '8px',
    padding: '14px',
    marginBottom: '10px',
    border: '1px solid #334155',
    cursor: 'pointer',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '8px',
  },
  formName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#f8fafc',
    margin: 0,
    lineHeight: 1.4,
  },
  meta: {
    fontSize: '11px',
    color: '#64748b',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  badgePublished: { background: '#065f46', color: '#6ee7b7' },
  badgeDraft: { background: '#334155', color: '#94a3b8' },
  badgeClosed: { background: '#7f1d1d', color: '#fca5a5' },
  badgePartial: { background: '#78350f', color: '#fcd34d' },
  count: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#818cf8',
    lineHeight: 1,
  },
  countLabel: { fontSize: '10px', color: '#64748b', marginTop: '3px' },
  countBox: { textAlign: 'right', flexShrink: 0 },
  qa: { marginBottom: '14px' },
  question: {
    fontSize: '11px',
    color: '#818cf8',
    marginBottom: '5px',
    lineHeight: 1.4,
  },
  answer: {
    fontSize: '13px',
    color: '#e2e8f0',
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  chip: {
    display: 'inline-block',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '4px',
    padding: '3px 8px',
    margin: '0 6px 6px 0',
    fontSize: '12px',
    color: '#cbd5e1',
  },
  link: { color: '#818cf8', textDecoration: 'none', borderBottom: '1px dotted #4f46e5' },
  muted: { color: '#475569' },
  preview: {
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: 1.5,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  divider: { borderTop: '1px solid #334155', margin: '12px 0' },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    fontSize: '10px',
    color: '#64748b',
  },
  smallBtn: {
    background: 'transparent',
    border: '1px solid #334155',
    color: '#64748b',
    fontFamily: 'inherit',
    fontSize: '10px',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  raw: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '10px',
    color: '#64748b',
    overflowX: 'auto',
    whiteSpace: 'pre',
    marginTop: '10px',
  },
  loadMore: {
    width: '100%',
    padding: '12px',
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#818cf8',
    fontFamily: 'inherit',
    fontSize: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  empty: { padding: '40px 20px', textAlign: 'center', color: '#475569', fontSize: '13px', lineHeight: 1.6 },
  error: {
    margin: '0 18px 12px',
    padding: '12px 14px',
    background: '#450a0a',
    border: '1px solid #7f1d1d',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '12px',
    lineHeight: 1.5,
  },
  pullBar: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#64748b',
    overflow: 'hidden',
    transition: 'height 0.15s ease-out',
  },
  tapRefresh: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#475569',
    padding: '14px',
    cursor: 'pointer',
  },
};

/* ---------- helpers ---------- */

function relativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function fullTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Some question types return option ids instead of text. Build an
// id -> label map from the question's fields so those still read as words.
function optionLabels(question) {
  const map = {};
  for (const field of question?.fields || []) {
    const fieldId = field.uuid || field.id;
    if (fieldId && field.title) map[fieldId] = field.title;
    for (const key of ['options', 'choices', 'rows', 'columns']) {
      for (const opt of field[key] || []) {
        const id = opt.id || opt.uuid || opt.value;
        const label = opt.text ?? opt.title ?? opt.label ?? opt.name;
        if (id && label != null) map[id] = label;
      }
    }
  }
  return map;
}

// Reduce one answer value to a display string (arrays are handled by the caller)
function scalarText(value, labels) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return labels[value] || value;
  if (typeof value === 'object') {
    if (value.name || value.url) return value.name || value.url;
    if (value.amount !== undefined) return [value.amount, value.currency].filter(Boolean).join(' ');
    return JSON.stringify(value);
  }
  return String(value);
}

function linkFor(type, text) {
  if (type === 'INPUT_EMAIL') return `mailto:${text}`;
  if (type === 'INPUT_PHONE_NUMBER') return `tel:${text.replace(/[^+\d]/g, '')}`;
  if (type === 'INPUT_LINK' || /^https?:\/\//i.test(text)) return text;
  return null;
}

/* ---------- answer rendering ---------- */

function Answer({ response, question }) {
  const labels = useMemo(() => optionLabels(question), [question]);
  const value = response?.answer;
  const type = question?.type || '';

  if (value === null || value === undefined || value === '') {
    return <div style={{ ...styles.answer, ...styles.muted }}>—</div>;
  }

  // Multi-value answers: checkboxes, multi-select, ranking, file uploads
  if (Array.isArray(value)) {
    if (value.length === 0) return <div style={{ ...styles.answer, ...styles.muted }}>—</div>;

    // File uploads come back as objects with a url - make them tappable
    if (value.some((v) => v && typeof v === 'object' && v.url)) {
      return (
        <div>
          {value.map((file, i) => (
            <div key={file.id || i} style={styles.answer}>
              <a href={file.url} target="_blank" rel="noreferrer" style={styles.link}>
                {file.name || file.url}
              </a>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div>
        {value.map((item, i) => (
          <span key={i} style={styles.chip}>
            {scalarText(item, labels) ?? '—'}
          </span>
        ))}
      </div>
    );
  }

  // Single objects: payments, signatures, matrix answers
  if (typeof value === 'object') {
    if (value.url) {
      return (
        <div style={styles.answer}>
          <a href={value.url} target="_blank" rel="noreferrer" style={styles.link}>
            {value.name || 'View file'}
          </a>
        </div>
      );
    }
    // Payments come back as { amount, currency }
    if (value.amount !== undefined) {
      return (
        <div style={styles.answer}>{[value.amount, value.currency].filter(Boolean).join(' ')}</div>
      );
    }
    const entries = Object.entries(value);
    if (entries.length && entries.every(([, v]) => typeof v !== 'object')) {
      return (
        <div>
          {entries.map(([k, v]) => (
            <div key={k} style={styles.answer}>
              <span style={styles.muted}>{labels[k] || k}: </span>
              {scalarText(v, labels) ?? '—'}
            </div>
          ))}
        </div>
      );
    }
    return <div style={styles.raw}>{JSON.stringify(value, null, 2)}</div>;
  }

  // Scalars. formattedAnswer carries Tally's own formatting (e.g. numbers).
  const text = response.formattedAnswer || scalarText(value, labels);
  if (text === null) return <div style={{ ...styles.answer, ...styles.muted }}>—</div>;

  if (type === 'INPUT_DATE') {
    const d = new Date(text);
    if (!Number.isNaN(d.getTime())) {
      return (
        <div style={styles.answer}>
          {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      );
    }
  }

  const href = linkFor(type, String(text));
  if (href) {
    return (
      <div style={styles.answer}>
        <a href={href} target="_blank" rel="noreferrer" style={styles.link}>
          {text}
        </a>
      </div>
    );
  }

  return <div style={styles.answer}>{text}</div>;
}

/* ---------- submission card ---------- */

function SubmissionCard({ submission, questions, index }) {
  const [open, setOpen] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  // Responses arrive in answer order, not question order - index them so the
  // card always reads in the order the form asks things.
  const byQuestion = useMemo(() => {
    const map = {};
    for (const r of submission.responses || []) map[r.questionId] = r;
    return map;
  }, [submission]);

  const answered = useMemo(
    () =>
      questions
        .map((q) => ({ q, r: byQuestion[q.id] }))
        .filter(({ r }) => r && r.answer !== null && r.answer !== undefined && r.answer !== '' &&
          !(Array.isArray(r.answer) && r.answer.length === 0)),
    [questions, byQuestion]
  );

  const skipped = questions.length - answered.length;

  const previewText = answered
    .slice(0, 2)
    .map(({ q, r }) => {
      const labels = optionLabels(q);
      const val = Array.isArray(r.answer)
        ? r.answer.map((v) => scalarText(v, labels)).filter(Boolean).join(', ')
        : scalarText(r.answer, labels);
      const label = q.title.replace(/^\d+\.\s*/, '').replace(/\s*[?:]\s*$/, '');
      return val ? `${label}: ${val}` : null;
    })
    .filter(Boolean)
    .join('  ·  ');

  return (
    <div style={styles.card} onClick={() => setOpen((v) => !v)}>
      <div style={styles.cardTop}>
        <div style={{ minWidth: 0 }}>
          <div style={styles.formName}>
            #{index} · {relativeTime(submission.submittedAt)}
          </div>
          <div style={{ ...styles.meta, marginTop: '4px' }}>
            <span>{fullTime(submission.submittedAt)}</span>
          </div>
        </div>
        {!submission.isCompleted && (
          <span style={{ ...styles.badge, ...styles.badgePartial }}>PARTIAL</span>
        )}
      </div>

      {!open && previewText && <div style={styles.preview}>{previewText}</div>}

      {open && (
        <div>
          <div style={styles.divider} />
          {answered.length === 0 && (
            <div style={{ ...styles.answer, ...styles.muted }}>No answers in this submission.</div>
          )}
          {answered.map(({ q, r }) => (
            <div key={q.id} style={styles.qa}>
              <div style={styles.question}>{q.title}</div>
              <Answer response={r} question={q} />
            </div>
          ))}
          {skipped > 0 && (
            <div style={{ ...styles.answer, ...styles.muted, fontSize: '11px' }}>
              {skipped} question{skipped === 1 ? '' : 's'} skipped
            </div>
          )}
          <div style={styles.divider} />
          <div style={styles.footerRow} onClick={(e) => e.stopPropagation()}>
            <span>{submission.id}</span>
            <button style={styles.smallBtn} onClick={() => setShowRaw((v) => !v)}>
              {showRaw ? 'hide raw' : 'raw'}
            </button>
          </div>
          {showRaw && (
            <div style={styles.raw} onClick={(e) => e.stopPropagation()}>
              {JSON.stringify(submission, null, 2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- data access ---------- */

async function api(path) {
  const res = await fetch(path);
  let body = {};
  try {
    body = await res.json();
  } catch {
    /* non-JSON error page */
  }
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

/* ---------- pull to refresh ---------- */

function usePullToRefresh(onRefresh) {
  const [pull, setPull] = useState(0);
  const pullRef = useRef(0);
  const startRef = useRef(null);

  useEffect(() => {
    const setPullBoth = (v) => {
      pullRef.current = v;
      setPull(v);
    };
    const onStart = (e) => {
      startRef.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
    };
    const onMove = (e) => {
      if (startRef.current === null) return;
      const delta = e.touches[0].clientY - startRef.current;
      // Damped so the bar never feels like it is dragging the whole page
      if (delta > 0) setPullBoth(Math.min(delta * 0.4, 70));
    };
    const onEnd = () => {
      if (pullRef.current >= 55) onRefresh();
      setPullBoth(0);
      startRef.current = null;
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [onRefresh]);

  return pull;
}

/* ---------- app ---------- */

export default function App() {
  const [forms, setForms] = useState([]);
  const [me, setMe] = useState(null);
  const [formFilter, setFormFilter] = useState('all');
  const [openForm, setOpenForm] = useState(null);

  const [subs, setSubs] = useState({ questions: [], submissions: [], counts: {}, hasMore: false, page: 1 });
  const [subFilter, setSubFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const loadForms = useCallback(async () => {
    const data = await api('/api/forms');
    setForms(data.forms || []);
  }, []);

  const loadSubmissions = useCallback(async (form, { page = 1, filter = 'all', append = false } = {}) => {
    const data = await api(
      `/api/forms/${encodeURIComponent(form.id)}/submissions?page=${page}&limit=25&filter=${filter}`
    );
    setSubs((prev) => ({
      questions: data.questions || [],
      counts: data.counts || {},
      hasMore: data.hasMore,
      page: data.page || page,
      submissions: append ? [...prev.submissions, ...(data.submissions || [])] : data.submissions || [],
    }));
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        await loadForms();
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
    // The key owner's name is a nicety - never block the app on it
    api('/api/me').then(setMe).catch(() => {});
  }, [loadForms]);

  // Reload submissions when the form or the status filter changes
  useEffect(() => {
    if (!openForm) return;
    let cancelled = false;
    setBusy(true);
    setError(null);
    loadSubmissions(openForm, { page: 1, filter: subFilter })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setBusy(false));
    return () => {
      cancelled = true;
    };
  }, [openForm, subFilter, loadSubmissions]);

  const refresh = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      if (openForm) await loadSubmissions(openForm, { page: 1, filter: subFilter });
      else await loadForms();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [openForm, subFilter, loadForms, loadSubmissions]);

  const pull = usePullToRefresh(refresh);

  const openFormView = (form) => {
    setSubs({ questions: [], submissions: [], counts: {}, hasMore: false, page: 1 });
    setSubFilter('all');
    setOpenForm(form);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    setOpenForm(null);
    setError(null);
    window.scrollTo(0, 0);
  };

  const visibleForms = useMemo(() => {
    const list = forms.filter((f) => {
      if (formFilter === 'all') return true;
      return f.status === formFilter;
    });
    // Most recently updated first - that is what you came to check
    return [...list].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [forms, formFilter]);

  const totalSubmissions = useMemo(
    () => forms.reduce((sum, f) => sum + (f.numberOfSubmissions || 0), 0),
    [forms]
  );

  const sortedSubmissions = useMemo(
    () => [...(subs.submissions || [])].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
    [subs.submissions]
  );

  return (
    <div style={styles.app}>
      <div style={{ ...styles.pullBar, height: `${pull}px`, lineHeight: `${Math.max(pull, 1)}px` }}>
        {pull >= 55 ? 'release to refresh' : pull > 0 ? 'pull to refresh' : ''}
      </div>

      <div style={styles.header}>
        {openForm && (
          <button style={styles.back} onClick={goBack} aria-label="Back">
            ‹
          </button>
        )}
        <div style={styles.titleWrap}>
          <h1 style={styles.title}>{openForm ? openForm.name : 'Tally'}</h1>
          <div style={styles.subtitle}>
            {openForm
              ? `${subs.counts?.all ?? openForm.numberOfSubmissions ?? 0} submissions`
              : me?.email || `${forms.length} forms · ${totalSubmissions} submissions`}
          </div>
        </div>
        <button style={styles.refreshBtn} onClick={refresh} disabled={busy}>
          {busy ? '···' : 'refresh'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {!openForm && (
        <>
          <div style={styles.filter}>
            {[
              ['all', 'All'],
              ['PUBLISHED', 'Published'],
              ['DRAFT', 'Draft'],
            ].map(([value, label]) => (
              <button
                key={value}
                style={{ ...styles.filterBtn, ...(formFilter === value ? styles.filterActive : {}) }}
                onClick={() => setFormFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={styles.list}>
            {loading && <div style={styles.empty}>Loading forms…</div>}
            {!loading && visibleForms.length === 0 && (
              <div style={styles.empty}>No forms here.</div>
            )}
            {visibleForms.map((form) => (
              <div key={form.id} style={styles.card} onClick={() => openFormView(form)}>
                <div style={styles.cardTop}>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={styles.formName}>{form.name}</h2>
                  </div>
                  <div style={styles.countBox}>
                    <div style={styles.count}>{form.numberOfSubmissions ?? 0}</div>
                    <div style={styles.countLabel}>
                      {form.numberOfSubmissions === 1 ? 'reply' : 'replies'}
                    </div>
                  </div>
                </div>
                <div style={styles.meta}>
                  <span
                    style={{
                      ...styles.badge,
                      ...(form.status === 'PUBLISHED' ? styles.badgePublished : styles.badgeDraft),
                    }}
                  >
                    {form.status}
                  </span>
                  {form.isClosed && <span style={{ ...styles.badge, ...styles.badgeClosed }}>CLOSED</span>}
                  <span>updated {relativeTime(form.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {openForm && (
        <>
          <div style={styles.filter}>
            {[
              ['all', 'All', subs.counts?.all],
              ['completed', 'Completed', subs.counts?.completed],
              ['partial', 'Partial', subs.counts?.partial],
            ].map(([value, label, n]) => (
              <button
                key={value}
                style={{ ...styles.filterBtn, ...(subFilter === value ? styles.filterActive : {}) }}
                onClick={() => setSubFilter(value)}
              >
                {label}
                {n !== null && n !== undefined ? ` ${n}` : ''}
              </button>
            ))}
          </div>

          <div style={styles.list}>
            {busy && sortedSubmissions.length === 0 && <div style={styles.empty}>Loading submissions…</div>}
            {!busy && sortedSubmissions.length === 0 && (
              <div style={styles.empty}>
                No submissions yet.
                <br />
                They will show up here as soon as someone fills the form in.
              </div>
            )}
            {sortedSubmissions.map((submission, i) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                questions={subs.questions}
                index={sortedSubmissions.length - i}
              />
            ))}
            {subs.hasMore && (
              <button
                style={styles.loadMore}
                disabled={busy}
                onClick={() =>
                  loadSubmissions(openForm, { page: subs.page + 1, filter: subFilter, append: true }).catch((e) =>
                    setError(e.message)
                  )
                }
              >
                {busy ? 'loading…' : 'load more'}
              </button>
            )}
          </div>
        </>
      )}

      <div style={styles.tapRefresh} onClick={refresh}>
        {busy ? 'refreshing…' : 'tap to refresh'}
      </div>
    </div>
  );
}
