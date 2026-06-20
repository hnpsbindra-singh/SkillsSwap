import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function VerificationWall() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const hasBio = user?.bio && user.bio.trim().length > 0;
  const hasSkills = user?.skillsOffered && user.skillsOffered.length > 0;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Local floating blobs for creative visual impact */}
      <div style={{
        position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(37, 99, 235, 0.12))',
        filter: 'blur(70px)', top: '10%', left: '15%', zIndex: 0, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: '250px', height: '250px', borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(124, 58, 237, 0.08))',
        filter: 'blur(60px)', bottom: '15%', right: '15%', zIndex: 0, pointerEvents: 'none'
      }} />

      <div className="glass-card fade-in" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '3rem 2.5rem',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.15), 0 0 30px rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(79, 70, 229, 0.18)',
        borderRadius: '1.5rem',
        zIndex: 1,
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Animated Icon Circle */}
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1))',
          border: '2px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.75rem',
          color: 'var(--accent-purple)',
          boxShadow: '0 8px 20px rgba(99, 102, 241, 0.15)',
        }}>
          <ShieldAlert size={36} />
        </div>
 
        <h2 style={{
          fontSize: '1.65rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: '0 0 0.75rem',
          letterSpacing: '-0.025em',
        }}>
          Verification Required
        </h2>
 
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          margin: '0 0 2.25rem',
        }}>
          To unlock the explore feed, barter requests, and messaging, please complete your profile details.
        </p>
 
        {/* Verification Steps List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
          textAlign: 'left',
          marginBottom: '2.25rem',
          background: 'rgba(15, 23, 42, 0.02)',
          padding: '1.5rem',
          borderRadius: '1rem',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: '#10b981', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
            }}>
              ✓
            </div>
            <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Step 1: Register Account
            </span>
          </div>
 
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: hasBio ? '#10b981' : 'rgba(79, 70, 229, 0.1)',
              color: hasBio ? '#fff' : 'var(--accent-indigo)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
              boxShadow: hasBio ? '0 2px 6px rgba(16, 185, 129, 0.25)' : 'none',
              border: hasBio ? 'none' : '1px solid rgba(79, 70, 229, 0.25)',
            }}>
              {hasBio ? '✓' : '2'}
            </div>
            <span style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: hasBio ? 'var(--text-secondary)' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flex: 1
            }}>
              Step 2: Add Bio
              {!hasBio && (
                <span style={{
                  fontSize: '0.68rem', color: 'var(--danger)',
                  background: 'var(--danger-light)', border: '1px solid var(--danger-border)',
                  padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700, marginLeft: 'auto'
                }}>
                  Required
                </span>
              )}
            </span>
          </div>
 
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: hasSkills ? '#10b981' : 'rgba(79, 70, 229, 0.1)',
              color: hasSkills ? '#fff' : 'var(--accent-indigo)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
              boxShadow: hasSkills ? '0 2px 6px rgba(16, 185, 129, 0.25)' : 'none',
              border: hasSkills ? 'none' : '1px solid rgba(79, 70, 229, 0.25)',
            }}>
              {hasSkills ? '✓' : '3'}
            </div>
            <span style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: hasSkills ? 'var(--text-secondary)' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flex: 1
            }}>
              Step 3: Add Skills Offered
              {!hasSkills && (
                <span style={{
                  fontSize: '0.68rem', color: 'var(--danger)',
                  background: 'var(--danger-light)', border: '1px solid var(--danger-border)',
                  padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700, marginLeft: 'auto'
                }}>
                  Required
                </span>
              )}
            </span>
          </div>
        </div>
 
        {/* Action Button */}
        <button
          onClick={() => navigate('/profile')}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '0.9rem',
            fontSize: '1rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 6px 20px rgba(79, 70, 229, 0.25)',
            background: 'var(--gradient-primary)',
          }}
        >
          Complete My Profile
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
