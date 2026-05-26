// frontend/src/api/post.api.js
import api from './axios';

const postApi = {
  createPost: async (formData) => {
    try {
      const response = await api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPosts: async () => {
    try {
      const response = await api.get('/api/posts');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  likePost: async (postId) => {
    try {
      const response = await api.post(`/api/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to like post';
    }
  },

  addComment: async (postId, commentText) => {
    try {
      const response = await api.post(`/api/posts/${postId}/comments`, {
        text: commentText
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to add comment';
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/api/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to delete post';
    }
  },

  updateComment: async (postId, commentId, text) => {
    try {
      const response = await api.put(`/api/posts/${postId}/comments/${commentId}`, { text });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update comment';
    }
  },

  deleteComment: async (postId, commentId) => {
    try {
      const response = await api.delete(`/api/posts/${postId}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to delete comment';
    }
  },

  // Post Search
  searchPosts: async (query) => {
    try {
      const response = await api.get(`/api/posts/search?q=${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get Explore Posts
  getExplorePosts: async () => {
    try {
      const response = await api.get('/api/posts/explore');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch posts';
    }
  },

  getUserPosts: async (userId) => {
    try {
      const response = await api.get(`/api/posts/author/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default postApi;