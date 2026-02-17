import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';

export default function PostForm({ edit = false }) {
  const [form, setForm] = useState({ title: '', content: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (edit && id) {
      axios.get(`/api/posts/${id}`)
        .then(res => {
          if (res.data.author !== user.id) {
            navigate('/');
            return;
          }
          setForm({ title: res.data.title, content: res.data.content });
        })
        .catch(() => navigate('/'));
    }
  }, [edit, id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (edit) {
        await axios.put(`/api/posts/${id}`, { ...form, userId: user.id });
        navigate(`/posts/${id}`);
      } else {
        const res = await axios.post('/api/posts', {
          ...form,
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
