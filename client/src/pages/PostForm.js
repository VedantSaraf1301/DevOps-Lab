import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../App';

export default function PostForm({ edit = false }) {
  const [form, setForm] = useState({ title: '', content: '' });
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (edit && id) {
      api.get(`/api/posts/${id}`)
        .then(res => {
          if (res.data.author !== user.id) {
            navigate('/');
            return;
          }
          setForm({ title: res.data.title, content: res.data.content });
          setTagsInput((res.data.tags || []).join(', '));
        })
        .catch(() => navigate('/'));
    }
  }, [edit, id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    try {
      if (edit) {
        await api.put(`/api/posts/${id}`, { ...form, tags, userId: user.id });
        navigate(`/posts/${id}`);
      } else {
        const res = await api.post('/api/posts', {
          ...form,
          tags,
          authorId: user.id,
          authorName: user.username,
        });
        navigate(`/posts/${res.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content">
      <div className="back-btn" onClick={() => navigate(edit ? `/posts/${id}` : '/')}>
        ← Back
      </div>

      <div className="post-form-card">
        <h2 className="post-form-title">{edit ? 'Edit Post' : 'Write a New Post'}</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Give your post a title…"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              className="form-textarea"
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Write your post here…"
              rows={10}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tags</label>
            <input
              className="form-input"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. travel, food, tech (comma separated)"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : edit ? 'Save Changes' : 'Publish Post'}
            </button>
            <button type="button" className="btn btn-outline"
              onClick={() => navigate(edit ? `/posts/${id}` : '/')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
