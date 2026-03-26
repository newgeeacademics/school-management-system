import { useEffect, useState } from 'react';
import { subjectsApi, type Subject } from '../api/client';

export function SubjectsPage() {
  const [list, setList] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    subjectsApi
      .list({ pageSize: 200 })
      .then((r) => setList(r.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  if (loading) return <div>Loading subjects...</div>;
  if (error) return <div style={{ color: '#b91c1c' }}>Error: {error}</div>;

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 24, color: '#0f172a' }}>Subjects</h1>
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Code</th>
              <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Name</th>
              <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Department</th>
              <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: 12, fontSize: 14 }}>{s.code}</td>
                <td style={{ padding: 12, fontSize: 14 }}>{s.name}</td>
                <td style={{ padding: 12, fontSize: 14 }}>{s.department}</td>
                <td style={{ padding: 12, fontSize: 14, maxWidth: 280 }}>{s.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>No subjects yet.</div>
        )}
      </div>
    </div>
  );
}
