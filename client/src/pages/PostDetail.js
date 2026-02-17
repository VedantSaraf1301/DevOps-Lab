import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';

export default function PostDetail() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    axios.get(`/api/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(`/api/posts/${id}`, { data: { userId: user.id } });
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return <main className="main-content"><div className="loading">Loading…</div></main>;
  if (!post)   return null;

  const isOwner = user.id === post.author;

  return (
    <main className="main-content">
      <div className="back-btn" onClick={() => navigate('/')}>
        ← Back to posts
      </div>

      <div className="post-full">
        <div className="post-full-header">
          <h1 className="post-full-title">{post.title}</h1>
          <div className="post-full-meta">
            <span>By {post.authorName || 'Anonymous'}</span>
            <span>{formatDate(post.createdAt)}</span>
            {post.updatedAt !== post.createdAt && <span>Updated {formatDate(post.updatedAt)}</span>}
          </div>
        </div>

        <div className="post-full-content">{post.content}</div>

        {isOwner && (
          <div className="post-full-actions">
            <button className="btn btn-outline" onClick={() => navigate(`/posts/${id}/edit`)}>✏️ Edit Post</button>
            <button className="btn btn-danger" onClick={handleDelete}>🗑 Delete Post</button>
          </div>
        )}
      </div>
    </main>
  );
}
