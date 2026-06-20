import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Shield, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/explore');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, postsRes] = await Promise.all([
        fetch(apiUrl('/api/admin/users'), {
          headers: { 'Authorization': 'Bearer ' + token },
        }),
        fetch(apiUrl('/api/admin/posts'), {
          headers: { 'Authorization': 'Bearer ' + token },
        }),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (postsRes.ok) setPosts(await postsRes.json());
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="glass-card fade-in" style={{ padding: '1.5rem', flex: 1, minWidth: '200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, margin: '0 0 0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </p>
          <p style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 800, margin: 0 }}>
            {loading ? '—' : value}
          </p>
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: '0.75rem',
          background: `${color}15`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  const tableContainerStyle = {
    overflowX: 'auto', borderRadius: '0.6rem',
    border: '1px solid var(--border-subtle)',
  };

  const tableStyle = {
    width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem',
  };

  const thStyle = {
    textAlign: 'left', padding: '0.85rem 1rem',
    color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '1px solid var(--border-subtle)',
    background: 'var(--bg-tertiary)',
  };

  const tdStyle = {
    padding: '0.8rem 1rem',
    borderBottom: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
          <Shield size={28} style={{ color: 'var(--accent-blue)' }} />
          <h1 className="section-header" style={{ margin: 0 }}>Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <StatCard icon={Users} label="Total Users" value={users.length} color="var(--accent-blue)" />
          <StatCard icon={FileText} label="Total Posts" value={posts.length} color="#3b82f6" />
          <StatCard icon={BarChart3} label="Active Barters" value={posts.filter(p => !p.deleted).length} color="#22c55e" />
        </div>

        {/* Users Table */}
        <div className="glass-card fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} style={{ color: 'var(--accent-blue)' }} />
            Users ({users.length})
          </h2>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="skeleton" style={{ height: '1rem', width: '50%', borderRadius: '0.4rem', margin: '0 auto 0.6rem' }} />
              <div className="skeleton" style={{ height: '1rem', width: '70%', borderRadius: '0.4rem', margin: '0 auto 0.6rem' }} />
              <div className="skeleton" style={{ height: '1rem', width: '60%', borderRadius: '0.4rem', margin: '0 auto' }} />
            </div>
          ) : (
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Username</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id || i}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                          }}>
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>@{u.username}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '0.2rem 0.55rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700,
                          background: u.role === 'ADMIN' ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-tertiary)',
                          color: u.role === 'ADMIN' ? 'var(--text-link)' : 'var(--text-secondary)',
                          border: u.role === 'ADMIN' ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid var(--border-subtle)',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
                          background: u.verified ? '#22c55e' : 'var(--text-muted)',
                          marginRight: '0.4rem', verticalAlign: 'middle',
                        }} />
                        <span style={{ color: u.verified ? '#22c55e' : 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {u.verified ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Posts Table */}
        <div className="glass-card fade-in" style={{ padding: '1.5rem' }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} style={{ color: 'var(--accent-blue)' }} />
            Posts ({posts.length})
          </h2>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="skeleton" style={{ height: '1rem', width: '50%', borderRadius: '0.4rem', margin: '0 auto 0.6rem' }} />
              <div className="skeleton" style={{ height: '1rem', width: '70%', borderRadius: '0.4rem', margin: '0 auto 0.6rem' }} />
              <div className="skeleton" style={{ height: '1rem', width: '60%', borderRadius: '0.4rem', margin: '0 auto' }} />
            </div>
          ) : (
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Title</th>
                    <th style={thStyle}>Creator</th>
                    <th style={thStyle}>Skills</th>
                    <th style={thStyle}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p, i) => (
                    <tr key={p.id || i}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...tdStyle, fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>
                        {p.creatorName || '—'}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {(p.skillsWanted || p.skillsOffered || []).slice(0, 3).map((s, si) => (
                            <span key={si} className="skill-tag" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                              {s}
                            </span>
                          ))}
                          {(p.skillsWanted || p.skillsOffered || []).length > 3 && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                              +{(p.skillsWanted || p.skillsOffered || []).length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {formatDate(p.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
