import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, Clock, User } from 'lucide-react';

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

export default function BarterCard({ post, onClick, onViewProfile, isNavigating }) {
  const navigate = useNavigate();

  return (
    <div className="glass-card fade-in" onClick={() => onClick && onClick(post)} style={{ cursor: 'pointer' }}>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3, flex: 1, marginRight: '0.5rem' }}>
            {post.title}
          </h3>
          <ArrowRightLeft size={20} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: '2px' }} />
        </div>

        {/* Creator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 2 }}>
          <User size={14} style={{ color: 'var(--text-muted)' }} />
          <button
            disabled={isNavigating}
            onClick={(e) => {
              e.stopPropagation();
              if (onViewProfile) {
                onViewProfile(post);
              } 
            }}
            style={{
              background: 'none',
              border: 'none',
              color: isNavigating ? 'var(--text-muted)' : 'var(--text-link)',
              fontWeight: 650,
              cursor: isNavigating ? 'wait' : 'pointer',
              padding: 0,
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              textDecoration: 'underline',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => { if (!isNavigating) e.target.style.color = 'var(--text-link-hover)'; }}
            onMouseLeave={(e) => { if (!isNavigating) e.target.style.color = 'var(--text-link)'; }}
          >
            {isNavigating ? 'Loading profile...' : post.creatorName}
          </button>
        </div>

        {/* Skills Offered */}
        {post.skillsOffered && post.skillsOffered.length > 0 && (
          <div>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
              Offering
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
              {post.skillsOffered.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Skills Wanted */}
        {post.skillsWanted && post.skillsWanted.length > 0 && (
          <div>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
              Looking for
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
              {post.skillsWanted.map((skill, i) => (
                <span key={i} className="skill-tag" style={{ background: 'rgba(37, 99, 235, 0.08)', borderColor: 'rgba(37, 99, 235, 0.2)' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <Clock size={13} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{timeAgo(post.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
