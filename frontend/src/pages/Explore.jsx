import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowRightLeft, X, MessageSquare, Shield, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BarterCard from '../components/BarterCard';
import CreatePostModal from '../components/CreatePostModal';

export default function Explore() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [tab, setTab] = useState('explore'); // 'explore' | 'my-posts'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailPost, setDetailPost] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [requestSkills, setRequestSkills] = useState([]);
  const [requestSkillInput, setRequestSkillInput] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');

  // Fetch all posts
  const fetchPosts = async (currentTab = tab) => {
    setLoading(true);
    try {
      const endpoint = currentTab === 'my-posts' ? '/api/posts/me' : '/api/posts';
      const res = await fetch(apiUrl(endpoint), {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(tab);
  }, [tab]);

  // Search posts
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPosts();
      return;
    }
    setSearching(true);
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/posts/search/posts?skill=${encodeURIComponent(searchQuery.trim())}`), {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchPosts();
  };

  // Open post detail
  const openDetail = async (post) => {
    setDetailPost(null);
    setDetailLoading(true);
    setRequestSkills([]);
    setRequestSkillInput('');
    setRequestSuccess('');
    setRequestError('');
    try {
      const res = await fetch(apiUrl(`/api/posts/${post.id}`), {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        setDetailPost(data);
      }
    } catch (err) {
      console.error('Failed to fetch post detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailPost(null);
    setDetailLoading(false);
  };


  // Send barter request
  const addRequestSkill = () => {
    const trimmed = requestSkillInput.trim();
    if (trimmed && !requestSkills.includes(trimmed)) {
      setRequestSkills([...requestSkills, trimmed]);
      setRequestSkillInput('');
    }
  };

  const handleRequestKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRequestSkill();
    }
  };

  const sendBarterRequest = async () => {
    if (requestSkills.length === 0) {
      setRequestError('Add at least one skill you want');
      return;
    }
    setSendingRequest(true);
    setRequestError('');
    try {
      const res = await fetch(apiUrl(`/api/posts/${detailPost.id}/request`), {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skillsWanted: requestSkills }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to send request');
      }
      setRequestSuccess('Barter request sent successfully!');
      setRequestSkills([]);
    } catch (err) {
      setRequestError(err.message);
    } finally {
      setSendingRequest(false);
    }
  };

  // Skeleton cards
  const SkeletonCard = () => (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div className="skeleton" style={{ height: '1.2rem', width: '75%', borderRadius: '0.4rem', marginBottom: '0.8rem' }} />
      <div className="skeleton" style={{ height: '0.9rem', width: '40%', borderRadius: '0.4rem', marginBottom: '1rem' }} />
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
        <div className="skeleton" style={{ height: '1.5rem', width: '4rem', borderRadius: '9999px' }} />
        <div className="skeleton" style={{ height: '1.5rem', width: '5rem', borderRadius: '9999px' }} />
      </div>
      <div className="skeleton" style={{ height: '0.8rem', width: '30%', borderRadius: '0.4rem' }} />
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="section-header" style={{ margin: '0 0 0.5rem' }}>
            <ArrowRightLeft size={28} style={{ color: '#a78bfa', marginRight: '0.6rem' }} />
            Explore Barters
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Discover skill exchange opportunities
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.9rem', color: '#64748b', pointerEvents: 'none' }} />
            <input
              className="input-field"
              placeholder="Search by skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: searchQuery ? '2.5rem' : '1rem' }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute', right: '0.6rem', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '0.2rem', color: '#64748b',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button onClick={handleSearch} className="btn-primary" disabled={searching}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
          >
            <Search size={16} />
            Search
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem'
        }}>
          <button
            onClick={() => setTab('explore')}
            style={{
              padding: '0.5rem 1rem', borderRadius: '0.45rem', border: 'none',
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
            background: tab === 'explore' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
            color: tab === 'explore' ? 'var(--text-link)' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          Explore Feed
        </button>
        <button
          onClick={() => setTab('my-posts')}
          style={{
            padding: '0.5rem 1rem', borderRadius: '0.45rem', border: 'none',
            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
            background: tab === 'my-posts' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
            color: tab === 'my-posts' ? 'var(--text-link)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            My Barter Posts
          </button>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
            <ArrowRightLeft size={48} style={{ color: '#4b5563', marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, margin: '0 0 0.5rem' }}>
              No barter posts found
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.25rem' }}>
              {searchQuery ? 'Try a different search term' : 'Be the first to create a barter post!'}
            </p>
            <button onClick={() => setCreateOpen(true)} className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={18} />
              Create Post
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {posts.map((post) => (
              <BarterCard key={post.id} post={post} onClick={openDetail} />
            ))}
          </div>
        )}

        {/* Floating Create Button */}
        <button
          onClick={() => setCreateOpen(true)}
          className="btn-primary"
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem',
            width: '56px', height: '56px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(37, 99, 235, 0.25)',
            zIndex: 50,
          }}
        >
          <Plus size={24} />
        </button>

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={() => fetchPosts()}
        />

        {/* Detail Modal */}
        {(detailPost || detailLoading) && (
          <div className="modal-overlay fade-in" onClick={closeDetail}>
            <div
              className="modal-content slide-up"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '580px', width: '90%', maxHeight: '85vh', overflowY: 'auto' }}
            >
              {detailLoading ? (
                <div style={{ padding: '2rem' }}>
                  <div className="skeleton" style={{ height: '1.5rem', width: '70%', borderRadius: '0.4rem', marginBottom: '1rem' }} />
                  <div className="skeleton" style={{ height: '0.9rem', width: '40%', borderRadius: '0.4rem', marginBottom: '1.5rem' }} />
                  <div className="skeleton" style={{ height: '4rem', width: '100%', borderRadius: '0.4rem', marginBottom: '1rem' }} />
                  <div className="skeleton" style={{ height: '2rem', width: '60%', borderRadius: '0.4rem' }} />
                </div>
              ) : detailPost && (
                <div style={{ padding: '0.5rem' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1, marginRight: '1rem' }}>
                      {detailPost.title}
                    </h2>
                    <button onClick={closeDetail} className="btn-ghost" style={{ padding: '0.3rem', flexShrink: 0 }}>
                      <X size={20} />
                    </button>
                  </div>

                  {/* Creator */}
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    by
                    <button
                      onClick={() => navigate(`/profile/${detailPost.creatorId}`)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--text-link)',
                        fontWeight: 600, cursor: 'pointer', padding: 0,
                        fontSize: 'inherit', fontFamily: 'inherit',
                        textDecoration: 'underline', transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--text-link-hover)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-link)'}
                    >
                      {detailPost.creatorName}
                    </button>
                  </p>

                  {/* Description */}
                  <div style={{
                    padding: '1rem', borderRadius: '0.6rem', marginBottom: '1.25rem',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
                  }}>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {detailPost.description}
                    </p>
                  </div>

                  {/* Skills */}
                  {detailPost.skillsOffered && detailPost.skillsOffered.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Skills Offered
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                        {detailPost.skillsOffered.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                      </div>
                    </div>
                  )}

                  {detailPost.skillsWanted && detailPost.skillsWanted.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Skills Wanted
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                        {detailPost.skillsWanted.map((s, i) => (
                          <span key={i} className="skill-tag" style={{ background: 'rgba(37, 99, 235, 0.08)', borderColor: 'rgba(37, 99, 235, 0.2)' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Send Barter Request */}
                  {detailPost.creatorId !== user?.id && (
                    <>
                      {/* Divider */}
                      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1.5rem 0' }} />

                      <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.75rem' }}>
                        Send Barter Request
                      </h3>

                      {requestSuccess && (
                        <div className="fade-in" style={{
                          padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem',
                          background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)',
                          color: '#22c55e', fontSize: '0.85rem',
                        }}>
                          {requestSuccess}
                        </div>
                      )}

                      {requestError && (
                        <div className="fade-in" style={{
                          padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem',
                          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#f87171', fontSize: '0.85rem',
                        }}>
                          {requestError}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <input
                          className="input-field"
                          placeholder="Skills you can offer..."
                          value={requestSkillInput}
                          onChange={(e) => setRequestSkillInput(e.target.value)}
                          onKeyDown={handleRequestKeyDown}
                          style={{ flex: 1 }}
                        />
                        <button type="button" className="btn-secondary" onClick={addRequestSkill}
                          style={{ flexShrink: 0 }}
                        >
                          Add
                        </button>
                      </div>

                      {requestSkills.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                          {requestSkills.map((s, i) => (
                            <span key={i} className="skill-tag" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              onClick={() => setRequestSkills(requestSkills.filter((_, idx) => idx !== i))}
                            >
                              {s}
                              <X size={12} />
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={sendBarterRequest}
                        className="btn-primary"
                        disabled={sendingRequest}
                        style={{
                          width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                          opacity: sendingRequest ? 0.7 : 1,
                        }}
                      >
                        {sendingRequest ? 'Sending...' : (
                          <>
                            <ArrowRightLeft size={18} />
                            Send Barter Request
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
