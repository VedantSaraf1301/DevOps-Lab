import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import api from '../api';
import { useAuth } from '../App';

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [allTags, setAllTags] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/posts')
      .then(res => setAllTags([...new Set(res.data.flatMap(p => p.tags || []))]))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (activeTag) params.tag = activeTag;

    const timeout = setTimeout(() => {
      api.get('/api/posts', { params })
        .then(res => setPosts(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, activeTag]);

  const handleDelete = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/api/posts/${postId}`, { data: { userId: user.id } });
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleLike = async (e, postId) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/api/posts/${postId}/like`, { userId: user.id });
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch (err) {
      alert(err.response?.data?.message || 'Like failed');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const isFiltering = Boolean(search || activeTag);

  return (
    <main className="main-content">
      <div className="page-header">
        <h1 className="page-title">All Posts</h1>
        <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{posts.length} article{posts.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          className="form-input search-input"
          type="text"
          placeholder="Search posts by title, content, or author…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {allTags.length > 0 && (
        <div className="tag-filter-bar">
          <span
            className={`tag-chip ${activeTag === '' ? 'tag-chip-active' : ''}`}
            onClick={() => setActiveTag('')}
          >
            All
          </span>
          {allTags.map(tag => (
            <span
              key={tag}
              className={`tag-chip ${activeTag === tag ? 'tag-chip-active' : ''}`}
              onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{isFiltering ? '🔍' : '✍️'}</div>
          <h3>{isFiltering ? 'No posts found' : 'No posts yet'}</h3>
          <p>{isFiltering ? 'Try a different search or tag.' : 'Be the first to write something.'}</p>
          {!isFiltering && (
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/new')}>
              Write a Post
            </button>
          )}
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => {
            const liked = (post.likes || []).includes(user.id);
            return (
              <div className="post-card" key={post._id} onClick={() => navigate(`/posts/${post._id}`)}>
                <h2 className="post-card-title">{post.title}</h2>
                <p className="post-card-excerpt">{post.content}</p>
                {post.tags?.length > 0 && (
                  <div className="post-card-tags">
                    {post.tags.map(tag => <span className="tag-chip" key={tag}>{tag}</span>)}
                  </div>
                )}
                <div className="post-card-meta">
                  <div>
                    <span className="post-card-author">By {post.authorName || 'Anonymous'}</span>
                    &nbsp;&nbsp;·&nbsp;&nbsp;
                    <span className="post-card-date">{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="post-card-actions" onClick={e => e.stopPropagation()}>
                    <button className={`btn-like ${liked ? 'btn-like-active' : ''}`} onClick={(e) => handleLike(e, post._id)}>
                      <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
                      <span>{(post.likes || []).length}</span>
                    </button>
                    {user.id === post.author && (
                      <>
                        <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                          onClick={() => navigate(`/posts/${post._id}/edit`)}>Edit</button>
                        <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                          onClick={(e) => handleDelete(e, post._id)}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
