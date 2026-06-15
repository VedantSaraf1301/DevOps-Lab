import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../App';

export default function PostDetail() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/api/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));

    api.get(`/api/comments/${id}`)
      .then(res => setComments(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/api/posts/${id}`, { data: { userId: user.id } });
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleLike = async () => {
    try {
      const res = await api.post(`/api/posts/${id}/like`, { userId: user.id });
      setPost({ ...post, likes: res.data.likes });
    } catch (err) {
      alert(err.response?.data?.message || 'Like failed');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await api.post(`/api/comments/${id}`, {
        content: commentText,
        authorId: user.id,
        authorName: user.username,
      });
      setComments([...comments, res.data]);
      setCommentText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/api/comments/${commentId}`, { data: { userId: user.id } });
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatCommentDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return <main className="main-content"><div className="loading">Loading…</div></main>;
  if (!post)   return null;

  const isOwner = user.id === post.author;
  const liked = (post.likes || []).includes(user.id);

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
          {post.tags?.length > 0 && (
            <div className="post-card-tags" style={{ marginTop: '0.8rem' }}>
              {post.tags.map(tag => <span className="tag-chip" key={tag}>{tag}</span>)}
            </div>
          )}
        </div>

        <div className="post-full-content">{post.content}</div>

        <div className="post-full-actions">
          <button className={`btn-like ${liked ? 'btn-like-active' : ''}`} onClick={handleLike}>
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            <span>{(post.likes || []).length} {(post.likes || []).length === 1 ? 'Like' : 'Likes'}</span>
          </button>
          {isOwner && (
            <>
              <button className="btn btn-outline" onClick={() => navigate(`/posts/${id}/edit`)}>✏️ Edit Post</button>
              <button className="btn btn-danger" onClick={handleDelete}>🗑 Delete Post</button>
            </>
          )}
        </div>
      </div>

      <div className="comments-section">
        <h3 className="comments-title">Comments ({comments.length})</h3>

        <form className="comment-form" onSubmit={handleAddComment}>
          <textarea
            className="form-textarea comment-input"
            rows={3}
            placeholder="Add a comment…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={commentLoading} style={{ marginTop: '0.6rem' }}>
            {commentLoading ? 'Posting…' : 'Post Comment'}
          </button>
        </form>

        {comments.length === 0 ? (
          <p className="comments-empty">No comments yet. Be the first to share your thoughts.</p>
        ) : (
          <div className="comments-list">
            {comments.map(comment => (
              <div className="comment-item" key={comment._id}>
                <div className="comment-header">
                  <span className="comment-author">{comment.authorName || 'Anonymous'}</span>
                  <span className="comment-date">{formatCommentDate(comment.createdAt)}</span>
                  {comment.author === user.id && (
                    <button className="btn-icon comment-delete" onClick={() => handleDeleteComment(comment._id)} title="Delete comment">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
