import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/posts')
      .then(res => setPosts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(`/api/posts/${postId}`, { data: { userId: user.id } });
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return (
    <main className="main-content">
      <div className="loading">Loading posts…</div>
    </main>
  );

  return (
    <main className="main-content">
      <div className="page-header">
        <h1 className="page-title">All Posts</h1>
        <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{posts.length} article{posts.length !== 1 ? 's' : ''}</span>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✍️</div>
          <h3>No posts yet</h3>
          <p>Be the first to write something.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/new')}>
            Write a Post
          </button>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <div className="post-card" key={post._id} onClick={() => navigate(`/posts/${post._id}`)}>
              <h2 className="post-card-title">{post.title}</h2>
              <p className="post-card-excerpt">{post.content}</p>
              <div className="post-card-meta">
                <div>
                  <span className="post-card-author">By {post.authorName || 'Anonymous'}</span>
                  &nbsp;&nbsp;·&nbsp;&nbsp;
                  <span className="post-card-date">{formatDate(post.createdAt)}</span>
                </div>
                {user.id === post.author && (
                  <div className="post-card-actions" onClick={e => e.stopPropagation()}>
                    <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                      onClick={() => navigate(`/posts/${post._id}/edit`)}>Edit</button>
                    <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                      onClick={(e) => handleDelete(e, post._id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
