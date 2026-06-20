import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Key, Eye, EyeOff, Copy, ArrowRight, ArrowRightLeft, Compass, MessageSquare, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, forgotPassword } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', username: '', password: '' });
  const [forgotForm, setForgotForm] = useState({ username: '', newPassword: '', key: '' });

  const tabs = [
    { id: 'login', label: 'Login' },
    { id: 'register', label: 'Register' },
    { id: 'forgot', label: 'Forgot Password' },
  ];

  const validate = () => {
    if (tab === 'login') {
      if (!loginForm.username.trim()) return 'Username is required';
      if (!loginForm.password) return 'Password is required';
      if (loginForm.password.length < 8) return 'Password must be at least 8 characters';
    } else if (tab === 'register') {
      if (!registerForm.name.trim()) return 'Name is required';
      if (!registerForm.username.trim()) return 'Username is required';
      if (!registerForm.password) return 'Password is required';
      if (registerForm.password.length < 8) return 'Password must be at least 8 characters';
    } else {
      if (!forgotForm.username.trim()) return 'Username is required';
      if (!forgotForm.key.trim()) return 'Recovery code is required';
      if (!forgotForm.newPassword) return 'New password is required';
      if (forgotForm.newPassword.length < 8) return 'Password must be at least 8 characters';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationErr = validate();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        await login(loginForm.username, loginForm.password);
        navigate('/explore');
      } else if (tab === 'register') {
        const data = await register(registerForm.name, registerForm.username, registerForm.password);
        setRecoveryCode(data.recoveryCode);
      } else {
        await forgotPassword(forgotForm.username, forgotForm.newPassword, forgotForm.key);
        setTab('login');
        setError('');
        setForgotForm({ username: '', newPassword: '', key: '' });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyRecoveryCode = () => {
    navigator.clipboard.writeText(recoveryCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputWrapperStyle = {
    position: 'relative', display: 'flex', alignItems: 'center',
  };

  const iconStyle = {
    position: 'absolute', left: '0.85rem', color: '#64748b', pointerEvents: 'none',
  };

  const inputStyle = {
    width: '100%', paddingLeft: '2.75rem',
  };

  return (
    <div className="auth-container" style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
    }}>
      {/* Left Pane: Creative branding & info */}
      <div className="auth-hero-pane" style={{
        flex: 1.2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.02) 0%, rgba(124, 58, 237, 0.02) 100%)',
        borderRight: '1px solid var(--border-subtle)',
      }}>
        {/* Floating animated blobs */}
        <div style={{
          position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.08))',
          filter: 'blur(70px)', top: '-50px', left: '-50px', zIndex: 0, pointerEvents: 'none'
        }} />

        <div style={{ zIndex: 1, maxWidth: '520px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)', color: '#fff'
            }}>
              <ArrowRightLeft size={20} />
            </div>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
              skillsSwap
            </span>
          </div>

          <h1 style={{
            fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.15,
            color: 'var(--text-primary)', marginBottom: '1.5rem',
            letterSpacing: '-0.03em'
          }}>
            Discover. Barter. <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Grow Together.</span>
          </h1>

          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6,
            marginBottom: '2.5rem', fontWeight: 500
          }}>
            Welcome to the premier peer-to-peer exchange network. Swap your expertise in coding, designing, language, music, or business directly with matches in real-time. No fees, no cash—just pure collaboration.
          </p>

          {/* Feature lists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.08)', color: 'var(--text-link)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Compass size={18} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.15rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Direct Skill Exchange
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Find listings matching what you want to learn, and offer what you specialize in.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.08)', color: '#22c55e',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <MessageSquare size={18} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.15rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Integrated Live Messaging
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-link)', background: 'rgba(37, 99, 235, 0.08)', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem', fontWeight: 700 }}>WS</span>
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Negotiate terms, match requests, and swap knowledge in built-in secure chats.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(124, 58, 237, 0.08)', color: 'var(--accent-purple)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Award size={18} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.15rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Verified Profiles
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Build trust by verifying your profile and listing verified skills.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating animated icon tags */}
        <div className="floating-tag float-anim-1" style={{
          position: 'absolute', top: '15%', right: '10%',
          background: '#fff', border: '1px solid var(--border-subtle)',
          borderRadius: '9999px', padding: '0.5rem 1.1rem', fontSize: '0.82rem',
          fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)', color: 'var(--text-secondary)', zIndex: 2
        }}>
          🚀 Coding
        </div>

        <div className="floating-tag float-anim-2" style={{
          position: 'absolute', bottom: '20%', right: '15%',
          background: '#fff', border: '1px solid var(--border-subtle)',
          borderRadius: '9999px', padding: '0.5rem 1.1rem', fontSize: '0.82rem',
          fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)', color: 'var(--text-secondary)', zIndex: 2
        }}>
          🎨 UI Design
        </div>

        <div className="floating-tag float-anim-3" style={{
          position: 'absolute', top: '50%', right: '5%',
          background: '#fff', border: '1px solid var(--border-subtle)',
          borderRadius: '9999px', padding: '0.5rem 1.1rem', fontSize: '0.82rem',
          fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)', color: 'var(--text-secondary)', zIndex: 2
        }}>
          📈 Marketing
        </div>
      </div>

      {/* Right Pane: Form container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Mobile blobs */}
        <div className="mobile-only-blob" style={{
          position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(124, 58, 237, 0.05))',
          filter: 'blur(50px)', top: '10%', right: '10%', zIndex: -1, pointerEvents: 'none'
        }} />

        <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
          {/* Logo / Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="mobile-logo-wrapper" style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)', color: '#fff',
              margin: '0 auto 0.75rem',
            }}>
              <ArrowRightLeft size={22} />
            </div>
            <h2 style={{
              fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.35rem',
              color: 'var(--text-primary)', letterSpacing: '-0.025em'
            }}>
              skillsSwap
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Exchange skills, grow together
            </p>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', borderRadius: '0.6rem', padding: '0.25rem',
            background: 'var(--bg-tertiary)', marginBottom: '1.5rem',
            border: '1px solid var(--border-subtle)',
          }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setError(''); setRecoveryCode(''); }}
                style={{
                  flex: 1, padding: '0.6rem 0.5rem', borderRadius: '0.45rem',
                  border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                  transition: 'all 0.2s ease',
                  background: tab === t.id ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  color: tab === t.id ? 'var(--text-link)' : 'var(--text-secondary)',
                  boxShadow: 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Recovery Code Success */}
          {recoveryCode && (
            <div className="fade-in" style={{
              padding: '1rem', borderRadius: '0.6rem', marginBottom: '1.25rem',
              background: 'var(--success-light)', border: '1px solid var(--success-border)',
            }}>
              <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem', margin: '0 0 0.5rem' }}>
                ✓ Registration Successful!
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 0.6rem' }}>
                Save your recovery code. You'll need it to reset your password:
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 0.85rem', borderRadius: '0.4rem',
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
              }}>
                <code style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {recoveryCode}
                </code>
                <button
                  type="button"
                  onClick={copyRecoveryCode}
                  className="btn-ghost"
                  style={{ padding: '0.35rem', flexShrink: 0 }}
                >
                  <Copy size={16} style={{ color: copied ? '#22c55e' : '#94a3b8' }} />
                </button>
              </div>
              {copied && (
                <p style={{ color: '#22c55e', fontSize: '0.75rem', margin: '0.4rem 0 0', textAlign: 'right' }}>
                  Copied!
                </p>
              )}
              <button
                type="button"
                onClick={() => { setTab('login'); setRecoveryCode(''); }}
                className="btn-primary"
                style={{ width: '100%', marginTop: '0.85rem', padding: '0.65rem', fontSize: '0.88rem' }}
              >
                Go to Login
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="fade-in" style={{
              padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem',
              background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--danger-border)',
              color: 'var(--danger)', fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          {/* Forms */}
          {!recoveryCode && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Register: Name */}
              {tab === 'register' && (
                <div style={inputWrapperStyle}>
                  <User size={18} style={iconStyle} />
                  <input
                    className="input-field"
                    style={inputStyle}
                    placeholder="Full Name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  />
                </div>
              )}

              {/* Username */}
              <div style={inputWrapperStyle}>
                <Mail size={18} style={iconStyle} />
                <input
                  className="input-field"
                  style={inputStyle}
                  placeholder="Username(user@example.com)"
                  value={tab === 'login' ? loginForm.username : tab === 'register' ? registerForm.username : forgotForm.username}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (tab === 'login') setLoginForm({ ...loginForm, username: val });
                    else if (tab === 'register') setRegisterForm({ ...registerForm, username: val });
                    else setForgotForm({ ...forgotForm, username: val });
                  }}
                />
              </div>

              {/* Forgot: Recovery Key */}
              {tab === 'forgot' && (
                <div style={inputWrapperStyle}>
                  <Key size={18} style={iconStyle} />
                  <input
                    className="input-field"
                    style={inputStyle}
                    placeholder="Recovery Code"
                    value={forgotForm.key}
                    onChange={(e) => setForgotForm({ ...forgotForm, key: e.target.value })}
                  />
                </div>
              )}

              {/* Password */}
              <div style={inputWrapperStyle}>
                <Lock size={18} style={iconStyle} />
                <input
                  className="input-field"
                  style={{ ...inputStyle, paddingRight: '2.75rem' }}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={tab === 'forgot' ? 'New Password(Minimum 8 digits)' : 'Password(Minimum 8 digits)'}
                  value={
                    tab === 'login' ? loginForm.password :
                    tab === 'register' ? registerForm.password :
                    forgotForm.newPassword
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (tab === 'login') setLoginForm({ ...loginForm, password: val });
                    else if (tab === 'register') setRegisterForm({ ...registerForm, password: val });
                    else setForgotForm({ ...forgotForm, newPassword: val });
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.75rem', background: 'none', border: 'none',
                    cursor: 'pointer', padding: '0.2rem', color: 'var(--text-muted)',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  marginTop: '0.25rem', opacity: loading ? 0.7 : 1,
                  border: 'none',
                }}
              >
                {loading ? (
                  <>
                    <span className="skeleton" style={{ width: 18, height: 18, borderRadius: '50%' }} />
                    {tab === 'login' ? 'Signing in...' : tab === 'register' ? 'Creating account...' : 'Resetting...'}
                  </>
                ) : (
                  <>
                    {tab === 'login' ? 'Sign In' : tab === 'register' ? 'Create Account' : 'Reset Password'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab switch hints */}
          {!recoveryCode && (
            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              {tab === 'login' && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', margin: 0 }}>
                  Don't have an account?{' '}
                  <span onClick={() => { setTab('register'); setError(''); }} style={{ color: 'var(--text-link)', cursor: 'pointer', fontWeight: 600 }}>
                    Register
                  </span>
                </p>
              )}
              {tab === 'register' && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', margin: 0 }}>
                  Already have an account?{' '}
                  <span onClick={() => { setTab('login'); setError(''); }} style={{ color: 'var(--text-link)', cursor: 'pointer', fontWeight: 600 }}>
                    Sign In
                  </span>
                </p>
              )}
              {tab === 'forgot' && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', margin: 0 }}>
                  Remember your password?{' '}
                  <span onClick={() => { setTab('login'); setError(''); }} style={{ color: 'var(--text-link)', cursor: 'pointer', fontWeight: 600 }}>
                    Sign In
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Page Specific Inline Styles for Split Pane and Animations */}
      <style>{`
        @media (max-width: 900px) {
          .auth-hero-pane {
            display: none !important;
          }
          .mobile-logo-wrapper {
            display: flex !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-logo-wrapper {
            display: none !important;
          }
        }
        
        @keyframes float-tag-1 {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes float-tag-2 {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes float-tag-3 {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-10px) rotate(1.5deg); }
        }
        
        .float-anim-1 {
          animation: float-tag-1 4.5s infinite alternate ease-in-out;
        }
        .float-anim-2 {
          animation: float-tag-2 5s infinite alternate ease-in-out;
        }
        .float-anim-3 {
          animation: float-tag-3 4s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
}
