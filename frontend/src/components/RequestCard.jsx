import React from 'react';
import { Check, X, Clock, ArrowRight } from 'lucide-react';

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function RequestCard({ request, type, onAccept, onReject, onViewProfile }) {
  const isPending = request.status === 'PENDING';
  const isCompleted = request.status === 'COMPLETED';

  const statusStyles = {
    PENDING: {
      background: 'rgba(234, 179, 8, 0.15)',
      color: '#eab308',
      border: '1px solid rgba(234, 179, 8, 0.3)',
    },
    COMPLETED: {
      background: 'rgba(34, 197, 94, 0.15)',
      color: '#22c55e',
      border: '1px solid rgba(34, 197, 94, 0.3)',
    },
  };

  const currentStatus = statusStyles[request.status] || statusStyles.PENDING;

  return (
    <div className="glass-card fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {(type === 'sent' ? request.receiverName : request.senderName)?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {type === 'sent' ? (
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {request.senderName}
                  </span>
                ) : (
                  <button
                    onClick={() => onViewProfile && onViewProfile(request.senderId)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-link)',
                      fontWeight: 600, cursor: 'pointer', padding: 0,
                      fontSize: '0.95rem', fontFamily: 'inherit',
                      textDecoration: 'underline', transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-link-hover)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-link)'}
                  >
                    {request.senderName}
                  </button>
                )}
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                {type === 'sent' ? (
                  <button
                    onClick={() => onViewProfile && onViewProfile(request.receiverId)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-link)',
                      fontWeight: 600, cursor: 'pointer', padding: 0,
                      fontSize: '0.95rem', fontFamily: 'inherit',
                      textDecoration: 'underline', transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-link-hover)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-link)'}
                  >
                    {request.receiverName}
                  </button>
                ) : (
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {request.receiverName}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {timeAgo(request.createdAt)}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            ...currentStatus,
            flexShrink: 0,
          }}>
            {request.status}
          </span>
        </div>

        {/* Skills wanted */}
        {request.skillsWanted && request.skillsWanted.length > 0 && (
          <div>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
              Skills Requested
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
              {request.skillsWanted.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Actions for received + pending */}
        {type === 'received' && isPending && (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button
              className="btn-primary"
              onClick={() => onAccept && onAccept(request.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, justifyContent: 'center' }}
            >
              <Check size={16} />
              Accept
            </button>
            <button
              className="btn-danger"
              onClick={() => onReject && onReject(request.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, justifyContent: 'center' }}
            >
              <X size={16} />
              Reject
            </button>
          </div>
        )}

        {/* Completed indicator */}
        {isCompleted && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
            background: 'rgba(34, 197, 94, 0.08)',
          }}>
            <Check size={16} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 500 }}>
              Barter completed successfully
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
