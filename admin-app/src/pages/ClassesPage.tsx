import { useEffect, useState } from 'react';
import { classesApi, type Class } from '../api/client';

export function ClassesPage() {
  const [list, setList] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    classesApi
      .list({ pageSize: 200 })
      .then((r) => setList(r.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  if (loading) return <div>Loading classes...</div>;
  if (error) return <div style={{ color: '#b91c1c' }}>Error: {error}</div>;

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 24, color: '#0f172a' }}>Classes</h1>
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
              <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Name</th>
              <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Subject</th>
              <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Teacher</th>
              <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Status</th>
              <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Students</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: 12, fontSize: 14 }}>{c.name}</td>
                <td style={{ padding: 12, fontSize: 14 }}>{c.subject?.name ?? c.subjectId}</td>
                <td style={{ padding: 12, fontSize: 14 }}>{c.teacher?.name ?? c.teacherId}</td>
                <td style={{ padding: 12, fontSize: 14 }}>{c.status}</td>
                <td style={{ padding: 12, fontSize: 14 }}>
                  {(c.students?.length ?? 0)} / {c.capacity ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>No classes yet.</div>
        )}
      </div>
    </div>
  );
}
