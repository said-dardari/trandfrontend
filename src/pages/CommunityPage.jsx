import React, { useEffect, useState } from 'react';
import { socialAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { user } = useAuth();

  const loadFeed = async () => {
    setLoading(true);
    try {
      const res = await socialAPI.getFeed();
      setPosts(res.data.posts || []);
    } catch (e) {
      console.error('Error loading feed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const submitPost = async () => {
    if (!newPost.trim()) return;
    try {
      await socialAPI.post({ content: newPost.trim(), username: user?.username || 'anonymous' });
      setNewPost('');
      loadFeed();
    } catch (e) {
      console.error('Error creating post:', e);
    }
  };

  const loadComments = async (postId) => {
    try {
      const res = await socialAPI.getComments(postId);
      setComments(prev => ({ ...prev, [postId]: res.data.comments || [] }));
    } catch (e) {
      console.error('Error loading comments:', e);
    }
  };

  const addComment = async (postId, content) => {
    if (!content.trim()) return;
    try {
      await socialAPI.comment({ post_id: postId, content: content.trim(), username: user?.username || 'anonymous' });
      loadComments(postId);
    } catch (e) {
      console.error('Error adding comment:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Community Zone</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Share a Strategy</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your trade idea..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={submitPost}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Post
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Public Feed</h2>
          {loading ? (
            <div className="text-gray-500 dark:text-gray-400 italic">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 italic">No posts yet</div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-300">{post.username} • {new Date(post.created_at).toLocaleString()}</div>
                  <div className="text-md font-medium text-gray-900 dark:text-white mt-1">{post.content}</div>
                  <div className="mt-2">
                    <button
                      onClick={() => loadComments(post.id)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View comments
                    </button>
                  </div>
                  <div className="mt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addComment(post.id, e.target.value);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  {comments[post.id] && comments[post.id].length > 0 && (
                    <div className="mt-3 space-y-2">
                      {comments[post.id].map(c => (
                        <div key={c.id} className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{c.username}:</span> {c.content}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
