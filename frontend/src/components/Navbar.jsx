import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, MessageSquare, Bell, User, LogOut, Shield, Menu, X, ArrowRightLeft, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

export default function Navbar() {
  const { user, logout, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [profileHovered, setProfileHovered] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const dropdownRef = useRef(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      setIsAlreadyInstalled(isStandalone);
    };
    checkInstalled();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  const navLinks = [
    { to: '/explore', label: 'Explore Feed', icon: Compass },
    { to: '/requests', label: 'Barter Requests', icon: Bell },
    { to: '/chats', label: 'Messages', icon: MessageSquare },
  ];

  // Fetch pending barter requests
  useEffect(() => {
    if (!user || !token) return;
    const fetchPendingCount = async () => {
      try {
        const res = await fetch(apiUrl('/api/requests/recieved'), {
          headers: { 'Authorization': 'Bearer ' + token },
        });
        if (res.ok) {
          const data = await res.json();
          const pending = data.filter((r) => r.status === 'PENDING').length;
          setPendingCount(pending);
        }
      } catch (err) {
        console.error('Failed to fetch pending count:', err);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 15000);
    return () => clearInterval(interval);
  }, [user, token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%' }}>
      {/* 3px Accent Gradient Bar */}
      <div style={{ height: '4px', background: 'var(--gradient-primary)', width: '100%' }} />
      {/* Main Navbar */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%',
        }}>
          {/* Logo / Brand */}
          <Link to="/explore" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              color: '#ffffff',
            }}>
              <ArrowRightLeft size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.025em',
                color: 'var(--text-primary)', lineHeight: 1.1,
              }}>
                SkillsBarter
              </span>
              <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
                Skill Exchange Platform
              </span>
            </div>
          </Link>
 
          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="nav-desktop">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onMouseEnter={() => setHoveredLink(to)}
                onMouseLeave={() => setHoveredLink(null)}
                style={{
                  textDecoration: 'none',
                  height: '40px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0 1.1rem',
                  margin: '0 0.15rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: isActive(to) ? '#ffffff' : (hoveredLink === to ? 'var(--text-link)' : 'var(--text-secondary)'),
                  background: isActive(to) 
                    ? 'var(--gradient-primary)' 
                    : (hoveredLink === to ? 'rgba(37, 99, 235, 0.05)' : 'transparent'),
                  borderRadius: '9999px',
                  boxShadow: isActive(to) ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                }}
              >
                <Icon size={16} style={{ 
                  color: isActive(to) ? '#ffffff' : (hoveredLink === to ? 'var(--text-link)' : 'var(--text-muted)'), 
                  transition: 'color 0.2s' 
                }} />
                {label}
                {label === 'Barter Requests' && pendingCount > 0 && (
                  <span style={{
                    marginLeft: '0.35rem',
                    background: isActive(to) ? '#ffffff' : 'var(--danger)',
                    color: isActive(to) ? 'var(--text-link)' : '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    minWidth: '18px',
                    height: '18px',
                  }}>
                    {pendingCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Profile Dropdown + Mobile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {!isAlreadyInstalled && (
              <button
                onClick={handleInstallClick}
                className="btn-primary nav-desktop"
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.8rem',
                  borderRadius: '9999px',
                  background: 'var(--gradient-accent)',
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 700,
                  border: 'none',
                  marginRight: '0.4rem',
                }}
              >
                <Download size={14} />
                Install App
              </button>
            )}

            {/* Profile dropdown (desktop) */}
            <div ref={dropdownRef} style={{ position: 'relative' }} className="nav-desktop">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                onMouseEnter={() => setProfileHovered(true)}
                onMouseLeave={() => setProfileHovered(false)}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: user?.profilePic
                    ? (user.profilePic.startsWith('data:') ? `url(${user.profilePic}) center/cover` : `url(data:image/jpeg;base64,${user.profilePic}) center/cover`)
                    : 'linear-gradient(135deg, var(--text-link), #3b82f6)',
                  border: profileHovered || profileOpen ? '2px solid var(--text-link)' : '2px solid rgba(37, 99, 235, 0.2)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                  transition: 'all 0.2s ease',
                  boxShadow: profileHovered ? '0 0 8px rgba(37, 99, 235, 0.3)' : 'none',
                }}
              >
                {!user?.profilePic && (user?.name?.charAt(0)?.toUpperCase() || <User size={18} />)}
              </button>

              {profileOpen && (
                <div className="slide-up" style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                  minWidth: '220px', borderRadius: '0.5rem', overflow: 'hidden',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                }}>
                  {/* User info */}
                  <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {user?.name}
                    </p>
                    <p style={{ margin: '0.15rem 0 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      @{user?.username}
                    </p>
                  </div>

                  <div style={{ padding: '0.4rem' }}>
                    <Link
                      to="/profile"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.6rem 0.75rem', borderRadius: '0.375rem',
                        textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.88rem',
                        fontWeight: 500, transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={16} style={{ color: 'var(--text-muted)' }} />
                      My Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          padding: '0.6rem 0.75rem', borderRadius: '0.375rem',
                          textDecoration: 'none', color: 'var(--text-link)', fontSize: '0.88rem',
                          fontWeight: 600, transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.06)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Shield size={16} style={{ color: 'var(--text-link)' }} />
                        Admin Dashboard
                      </Link>
                    )}

                    <div style={{ height: '1px', background: '#e2e8f0', margin: '0.4rem 0' }} />

                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%',
                        padding: '0.6rem 0.75rem', borderRadius: '0.375rem', border: 'none',
                        background: 'transparent', color: 'var(--danger)', fontSize: '0.88rem',
                        fontWeight: 500, cursor: 'pointer', transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="btn-ghost nav-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ padding: '0.5rem', display: 'none', color: 'var(--text-secondary)' }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="slide-up nav-mobile-menu" style={{
          borderTop: '1px solid #e2e8f0',
          padding: '0.75rem 1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
          background: '#ffffff',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
        }}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              style={{
                textDecoration: 'none', padding: '0.7rem 1rem', borderRadius: '0.375rem',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                fontSize: '0.95rem', fontWeight: 650,
                color: isActive(to) ? 'var(--text-link)' : 'var(--text-secondary)',
                background: isActive(to) ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
              }}
            >
              <Icon size={18} style={{ color: isActive(to) ? 'var(--text-link)' : 'var(--text-muted)' }} />
              {label}
              {label === 'Barter Requests' && pendingCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--danger)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '9999px',
                  lineHeight: 1,
                }}>
                  {pendingCount}
                </span>
              )}
            </Link>
          ))}

          <Link
            to="/profile"
            style={{
              textDecoration: 'none', padding: '0.7rem 1rem', borderRadius: '0.375rem',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              fontSize: '0.95rem', fontWeight: 650,
              color: isActive('/profile') ? 'var(--text-link)' : 'var(--text-secondary)',
              background: isActive('/profile') ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
            }}
          >
            <User size={18} style={{ color: isActive('/profile') ? 'var(--text-link)' : 'var(--text-muted)' }} />
            My Profile
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              style={{
                textDecoration: 'none', padding: '0.7rem 1rem', borderRadius: '0.375rem',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                fontSize: '0.95rem', fontWeight: 650, color: 'var(--text-link)',
                background: isActive('/admin') ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
              }}
            >
              <Shield size={18} />
              Admin Dashboard
            </Link>
          )}

          {!isAlreadyInstalled && (
            <button
              onClick={handleInstallClick}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.7rem 1rem', borderRadius: '0.375rem', border: 'none',
                background: 'var(--gradient-accent)', color: '#ffffff', fontSize: '0.95rem',
                fontWeight: 650, cursor: 'pointer', width: '100%', textAlign: 'left',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)',
                marginBottom: '0.5rem',
              }}
            >
              <Download size={18} style={{ color: '#ffffff' }} />
              Install App
            </button>
          )}

          <div style={{ height: '1px', background: '#e2e8f0', margin: '0.5rem 0' }} />

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.7rem 1rem', borderRadius: '0.375rem', border: 'none',
              background: 'transparent', color: 'var(--danger)', fontSize: '0.95rem',
              fontWeight: 650, cursor: 'pointer', width: '100%', textAlign: 'left',
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}

      {/* PWA Install Instructions Modal */}
      {showInstallModal && (
        <div className="modal-overlay fade-in" onClick={() => setShowInstallModal(false)} style={{ zIndex: 1100 }}>
          <div
            className="modal-content slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '450px', width: '90%', padding: '2rem', background: '#ffffff', borderRadius: '12px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                How to Install App
              </h3>
              <button onClick={() => setShowInstallModal(false)} className="btn-ghost" style={{ padding: '0.3rem' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>💻 On Desktop (Chrome / Edge / Brave):</strong>
                <p style={{ margin: 0, lineHeight: 1.5 }}>
                  Look at the right side of the address bar at the top of your browser and click the <strong>Install</strong> icon (computer with down arrow), or open the browser menu (three dots) and select <strong>Install SkillsBarter</strong>.
                </p>
              </div>

              <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>📱 On Mobile (Android):</strong>
                <p style={{ margin: 0, lineHeight: 1.5 }}>
                  A prompt should appear automatically. If not, open Chrome's menu (three dots) and tap <strong>Add to Home screen</strong> or <strong>Install App</strong>.
                </p>
              </div>

              <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>🍎 On iOS (iPhone / iPad Safari):</strong>
                <p style={{ margin: 0, lineHeight: 1.5 }}>
                  Tap the <strong>Share</strong> button (square with an arrow pointing up) at the bottom of Safari, scroll down, and tap <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="btn-primary"
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Inline style tag for responsive nav */}
      <style>{`
        @media (min-width: 769px) {
          .nav-mobile-toggle { display: none !important; }
          .nav-mobile-menu { display: none !important; }
        }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
