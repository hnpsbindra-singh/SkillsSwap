import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Camera, Edit3, Save, Trash2, Eye, EyeOff, Shield, Award, X, Plus, MessageSquare, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token, user, fetchUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', skillsOffered: [], recoveryCode: '' });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    fetchProfile();
    fetchMyPosts();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const endpoint = isOwnProfile ? '/api/profile/me' : `/api/profile/${userId}`;
      const res = await fetch(apiUrl(endpoint), {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        if (isOwnProfile) {
          setEditForm({
            name: data.name || '',
            bio: data.bio || '',
            skillsOffered: data.skillsOffered || [],
            recoveryCode: data.recoveryCode || '',
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosts = async () => {
    try {
      const endpoint = isOwnProfile ? '/api/posts/me' : '/api/posts';
      const res = await fetch(apiUrl(endpoint), {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        if (isOwnProfile) {
          setMyPosts(data);
        } else {
          setMyPosts(data.filter((p) => p.creatorId === userId));
        }
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  const handleMessageUser = () => {
    if (!profile) return;
    navigate('/chats', {
      state: {
        startChatWith: {
          id: profile.id,
          name: profile.name,
        }
      }
    });
  };

  const handleSave = async () => {
    if (!editForm.recoveryCode?.trim()) {
      setError('Recovery code is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/profile/me'), {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          bio: editForm.bio,
          skillsOffered: editForm.skillsOffered,
          recoveryCode: editForm.recoveryCode.trim(),
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to update profile');
      }
      const data = await res.json();
      setProfile(data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      if (fetchUser) fetchUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPic = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(apiUrl('/api/profile/picture'), {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      await fetchProfile();
      if (fetchUser) fetchUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !editForm.skillsOffered.includes(trimmed)) {
      setEditForm({ ...editForm, skillsOffered: [...editForm.skillsOffered, trimmed] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setEditForm({ ...editForm, skillsOffered: editForm.skillsOffered.filter((s) => s !== skill) });
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const deletePost = async (postId) => {
    setDeletingId(postId);
    try {
      const res = await fetch(apiUrl(`/api/posts/Delete/${postId}`), {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.ok) {
        setMyPosts(myPosts.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: '1.3rem', width: '50%', borderRadius: '0.4rem', marginBottom: '0.6rem' }} />
                <div className="skeleton" style={{ height: '0.9rem', width: '30%', borderRadius: '0.4rem' }} />
              </div>
            </div>
            <div className="skeleton" style={{ height: '4rem', width: '100%', borderRadius: '0.4rem' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Success / Error */}
        {success && (
          <div className="toast toast-success fade-in" style={{ marginBottom: '1rem' }}>
            {success}
          </div>
        )}
        {error && (
          <div className="toast toast-error fade-in" style={{ marginBottom: '1rem' }}>
            {error}
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.5rem' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Verification Alert Banner */}
        {isOwnProfile && profile && !profile.verified && (
          <div className="glass-card fade-in" style={{
            padding: '1.5rem',
            marginBottom: '1.5rem',
            borderLeft: '4px solid var(--warning)',
            background: 'var(--warning-light)',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <ShieldAlert size={20} />
            </div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Verification Needed
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Your profile is not verified yet. To unlock all platform features, click <strong>Edit Profile</strong> below and make sure to add a <strong>Bio</strong> and at least one <strong>Skill Offered</strong>.
              </p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-primary"
                style={{
                  background: 'var(--gradient-warning)',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
                  fontSize: '0.82rem',
                  padding: '0.5rem 1rem',
                  border: 'none',
                }}
              >
                Complete Now
              </button>
            )}
          </div>
        )}

        {/* Profile Header Card */}
        <div className="glass-card fade-in" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                  background: profile?.profilePic
                    ? (profile.profilePic.startsWith('data:') ? `url(${profile.profilePic}) center/cover` : `url(data:image/jpeg;base64,${profile.profilePic}) center/cover`)
                    : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontWeight: 700, color: '#fff',
                  border: '3px solid rgba(37, 99, 235, 0.2)',
                }}>
                  {!profile?.profilePic && profile?.name?.charAt(0)?.toUpperCase()}
                </div>
                {isOwnProfile && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      style={{
                        position: 'absolute', bottom: -4, right: -4,
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                        border: '2px solid var(--bg-secondary)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff',
                      }}
                    >
                      <Camera size={14} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadPic}
                      style={{ display: 'none' }}
                    />
                  </>
                )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {profile?.name}
                </h2>
                {profile?.role === 'ADMIN' && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem',
                    fontWeight: 700, textTransform: 'uppercase',
                      background: 'rgba(37, 99, 235, 0.08)', color: 'var(--text-link)',
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                  }}>
                    <Shield size={12} />
                    Admin
                  </span>
                )}
                {profile?.verified && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem',
                    fontWeight: 700, background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}>
                    <Award size={12} />
                    Verified
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.75rem' }}>
                @{profile?.username}
              </p>

              {/* Edit toggle or Message User */}
              {isOwnProfile ? (
                !editing ? (
                  <button onClick={() => setEditing(true)} className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                  >
                    <Edit3 size={15} />
                    Edit Profile
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleSave} className="btn-primary" disabled={saving}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                    >
                      <Save size={15} />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => {
                      setEditing(false);
                      setEditForm({
                        name: profile.name || '',
                        bio: profile.bio || '',
                        skillsOffered: profile.skillsOffered || [],
                        recoveryCode: profile.recoveryCode || '',
                      });
                    }} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                      Cancel
                    </button>
                  </div>
                )
              ) : (
                profile?.id !== user?.id && (
                  <button
                    onClick={handleMessageUser}
                    className="btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 15px rgba(37, 99, 235, 0.15)',
                    }}
                  >
                    <MessageSquare size={15} />
                    Message {profile?.name}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Bio & Skills Card */}
        <div className="glass-card fade-in" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          {/* Bio */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.6rem' }}>Bio</h3>
            {editing ? (
              <textarea
                className="textarea-field"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell others about yourself..."
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                {profile?.bio || 'No bio yet. Click Edit to add one.'}
              </p>
            )}
          </div>

          {/* Skills Offered */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.6rem' }}>Skills Offered</h3>
            {editing ? (
              <>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <input
                    className="input-field"
                    placeholder="Type a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn-secondary" onClick={addSkill}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}
                  >
                    <Plus size={15} />
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {editForm.skillsOffered.map((skill, i) => (
                    <span key={i} className="skill-tag" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      onClick={() => removeSkill(skill)}
                    >
                      {skill}
                      <X size={12} />
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {profile?.skillsOffered && profile.skillsOffered.length > 0 ? (
                  profile.skillsOffered.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>No skills added yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Name (edit mode) */}
          {editing && (
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.6rem' }}>Display Name</h3>
              <input
                className="input-field"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* Recovery Code */}
          {isOwnProfile && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Recovery Code</h3>
                {!editing && (
                  <button onClick={() => setShowRecovery(!showRecovery)} className="btn-ghost"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', padding: '0.3rem 0.6rem' }}
                  >
                    {showRecovery ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showRecovery ? 'Hide' : 'Reveal'}
                  </button>
                )}
              </div>
              {editing ? (
                <input
                  className="input-field"
                  value={editForm.recoveryCode}
                  onChange={(e) => setEditForm({ ...editForm, recoveryCode: e.target.value })}
                  placeholder="Enter custom recovery code..."
                  style={{ width: '100%', fontFamily: 'monospace' }}
                />
              ) : (
                <div style={{
                  padding: '0.6rem 0.85rem', borderRadius: '0.4rem',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
                  fontFamily: 'monospace', fontSize: '0.9rem',
                  color: 'var(--text-primary)', filter: showRecovery ? 'none' : 'blur(6px)',
                  transition: 'filter 0.3s ease', userSelect: showRecovery ? 'text' : 'none',
                }}>
                  {profile?.recoveryCode || 'N/A'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* My Posts / Barter Posts */}
        <div className="glass-card fade-in" style={{ padding: '1.75rem' }}>
          <h3 className="section-header" style={{ margin: '0 0 1rem' }}>
            {isOwnProfile ? 'My Posts' : 'Barter Posts'}
          </h3>
          {myPosts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0', margin: 0 }}>
              {isOwnProfile ? "You haven't created any posts yet." : 'No active barter posts listed.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myPosts.map((post) => (
                <div key={post.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1rem', borderRadius: '0.6rem',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 0.35rem', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>
                      {post.title}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {post.skillsWanted?.map((s, i) => (
                        <span key={i} className="skill-tag" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => deletePost(post.id)}
                      disabled={deletingId === post.id}
                      className="btn-danger"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.4rem 0.75rem', fontSize: '0.82rem', flexShrink: 0, marginLeft: '0.75rem',
                        opacity: deletingId === post.id ? 0.5 : 1,
                      }}
                    >
                      <Trash2 size={14} />
                      {deletingId === post.id ? '...' : 'Delete'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
