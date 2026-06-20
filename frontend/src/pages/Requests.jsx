import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { Send, Inbox, Filter, Award, X, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';

export default function Requests() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [tab, setTab] = useState('received'); // 'sent' | 'received'
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED'
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [sentRes, recvRes] = await Promise.all([
        fetch(apiUrl('/api/requests/sent'), {
          headers: { 'Authorization': 'Bearer ' + token },
        }),
        fetch(apiUrl('/api/requests/recieved'), {
          headers: { 'Authorization': 'Bearer ' + token },
        }),
      ]);
      if (sentRes.ok) setSentRequests(await sentRes.json());
      if (recvRes.ok) setReceivedRequests(await recvRes.json());
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const openUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAccept = async (requestId) => {
    setActionLoading(requestId);
    try {
      const res = await fetch(apiUrl(`/api/requests/${requestId}/accept`), {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.ok) {
        setReceivedRequests(receivedRequests.map((r) =>
          r.id === requestId ? { ...r, status: 'COMPLETED' } : r
        ));
        showToast('Request accepted!');
      } else {
        const errText = await res.text();
        showToast(errText || 'Failed to accept', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(requestId);
    try {
      const res = await fetch(apiUrl(`/api/requests/${requestId}/reject`), {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.ok) {
        setReceivedRequests(receivedRequests.filter((r) => r.id !== requestId));
        showToast('Request rejected');
      } else {
        const errText = await res.text();
        showToast(errText || 'Failed to reject', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const currentRequests = tab === 'sent' ? sentRequests : receivedRequests;
  const filteredRequests = statusFilter === 'ALL'
    ? currentRequests
    : currentRequests.filter((r) => r.status === statusFilter);

  const SkeletonRow = () => (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
          <div>
            <div className="skeleton" style={{ height: '0.9rem', width: '120px', borderRadius: '0.4rem', marginBottom: '0.4rem' }} />
            <div className="skeleton" style={{ height: '0.7rem', width: '80px', borderRadius: '0.4rem' }} />
          </div>
        </div>
        <div className="skeleton" style={{ height: '1.4rem', width: '5rem', borderRadius: '9999px' }} />
      </div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <div className="skeleton" style={{ height: '1.4rem', width: '4rem', borderRadius: '9999px' }} />
        <div className="skeleton" style={{ height: '1.4rem', width: '5rem', borderRadius: '9999px' }} />
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Toast */}
        {toastMsg && (
          <div className={`toast ${toastMsg.type === 'error' ? 'toast-error' : 'toast-success'} fade-in`}
            style={{ position: 'fixed', top: '5rem', right: '1.5rem', zIndex: 200 }}
          >
            {toastMsg.msg}
          </div>
        )}

        {/* Header */}
        <h1 className="section-header" style={{ margin: '0 0 1.5rem' }}>
          Barter Requests
        </h1>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderRadius: '0.6rem', padding: '0.25rem',
          background: 'var(--bg-tertiary)', marginBottom: '1.5rem',
          border: '1px solid var(--border-subtle)', maxWidth: '320px',
        }}>
          <button
            onClick={() => setTab('received')}
            style={{
              flex: 1, padding: '0.6rem 1rem', borderRadius: '0.45rem',
              border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              transition: 'all 0.2s ease',
              background: tab === 'received' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
              color: tab === 'received' ? 'var(--text-link)' : 'var(--text-secondary)',
            }}
          >
            <Inbox size={16} />
            Received
            {receivedRequests.filter(r => r.status === 'PENDING').length > 0 && (
              <span style={{
                width: 20, height: 20, borderRadius: '50%', fontSize: '0.7rem',
                background: 'var(--accent-blue)', color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              }}>
                {receivedRequests.filter(r => r.status === 'PENDING').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('sent')}
            style={{
              flex: 1, padding: '0.6rem 1rem', borderRadius: '0.45rem',
              border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              transition: 'all 0.2s ease',
              background: tab === 'sent' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
              color: tab === 'sent' ? 'var(--text-link)' : 'var(--text-secondary)',
            }}
          >
            <Send size={16} />
            Sent
          </button>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          {['ALL', 'PENDING', 'COMPLETED'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                padding: '0.35rem 0.75rem', borderRadius: '9999px',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                transition: 'all 0.2s ease',
                background: statusFilter === f ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-tertiary)',
                color: statusFilter === f ? 'var(--text-link)' : 'var(--text-secondary)',
                border: statusFilter === f ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid var(--border-subtle)',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="glass-card fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
            {tab === 'sent' ? <Send size={40} style={{ color: '#4b5563', marginBottom: '0.75rem' }} /> : <Inbox size={40} style={{ color: '#4b5563', marginBottom: '0.75rem' }} />}
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, margin: '0 0 0.5rem' }}>
              No {statusFilter !== 'ALL' ? statusFilter.toLowerCase() + ' ' : ''}{tab} requests
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
              {tab === 'sent'
                ? 'Explore barter posts and send your first request!'
                : 'When someone wants to barter with you, it will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredRequests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                type={tab}
                onAccept={handleAccept}
                onReject={handleReject}
                onViewProfile={openUserProfile}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
