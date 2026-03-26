import { useEffect, useState } from 'react';
import { usersApi, subjectsApi, classesApi } from '../api/client';
import { Users, BookOpen, GraduationCap, Building2 } from 'lucide-react';

export function DashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    subjects: 0,
    classes: 0,
    students: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      usersApi.list({ pageSize: 500 }),
      subjectsApi.list({ pageSize: 500 }),
      classesApi.list({ pageSize: 500 }),
    ])
      .then(([u, s, c]) => {
        const users = u.data || [];
        setStats({
          users: users.length,
          subjects: (s.data || []).length,
          classes: (c.data || []).length,
          students: users.filter((x) => x.role === 'student').length,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: '#b91c1c' }}>Error: {error}</div>;

  const cards = [
    { label: 'Total users', value: stats.users, icon: Users },
    { label: 'Students', value: stats.students, icon: GraduationCap },
    { label: 'Subjects', value: stats.subjects, icon: BookOpen },
    { label: 'Classes', value: stats.classes, icon: Building2 },
  ];

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 24, color: '#0f172a' }}>Dashboard</h1>
      <p style={{ margin: '0 0 24px', color: '#64748b' }}>
        Overview of your classroom data. This admin app runs separately and calls the backend API.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            style={{
              padding: 20,
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ padding: 8, background: '#fff7ed', borderRadius: 8, color: '#ea580c' }}>
                <Icon size={20} />
              </div>
              <span style={{ fontSize: 14, color: '#64748b' }}>{label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
