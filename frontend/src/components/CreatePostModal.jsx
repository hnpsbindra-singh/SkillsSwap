import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

export default function CreatePostModal({ isOpen, onClose, onCreated }) {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skillsWanted.includes(trimmed)) {
      setSkillsWanted([...skillsWanted, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setSkillsWanted(skillsWanted.filter((s) => s !== skill));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (skillsWanted.length === 0) {
      setError('Add at least one skill you want');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/posts'), {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), skillsWanted }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to create post');
      }

      const data = await res.json();
      setTitle('');
      setDescription('');
      setSkillsWanted([]);
      setSkillInput('');
      onCreated && onCreated(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div
        className="modal-content slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', width: '90%' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={22} style={{ color: 'var(--accent-blue)' }} />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Create Barter Post
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem',
            background: 'var(--danger-light)', border: '1px solid var(--danger-border)',
            color: 'var(--danger)', fontSize: '0.85rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Title
            </label>
            <input
              className="input-field"
              placeholder="e.g., Python tutoring for Guitar lessons"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Description
            </label>
            <textarea
              className="textarea-field"
              placeholder="Describe what you're offering and what you're looking for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Skills Wanted */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Skills You Want
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="input-field"
                placeholder="Type a skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={addSkill}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}
              >
                <Plus size={16} />
                Add
              </button>
            </div>
            {skillsWanted.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' }}>
                {skillsWanted.map((skill, i) => (
                  <span
                    key={i}
                    className="skill-tag"
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    onClick={() => removeSkill(skill)}
                  >
                    {skill}
                    <X size={12} />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <span className="skeleton" style={{ width: 18, height: 18, borderRadius: '50%' }} />
                Creating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Create Post
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
