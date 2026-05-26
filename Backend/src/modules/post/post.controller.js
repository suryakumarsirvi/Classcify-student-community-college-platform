import postService from './post.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';

export const createPost = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file || !file.buffer) {
    throw new ApiError(400, 'Media file is required');
  }

  const { caption, tags } = req.body;
  const post = await postService.createPost(req.user._id || req.user.id, caption, tags, file.buffer, file.mimetype);
  res.status(201).json(post);
});

export const getPosts = asyncHandler(async (req, res) => {
  const posts = await postService.getPosts(req.query.page);
  res.json(posts);
});

export const likePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const post = await postService.likePost(postId, req.user._id || req.user.id);
  res.json(post);
});

export const addComment = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const { text } = req.body;
  if (!text) {
    throw new ApiError(400, 'Comment text is required');
  }

  const post = await postService.addComment(postId, text, req.user._id || req.user.id);
  res.json(post);
});

export const updateComment = asyncHandler(async (req, res) => {
  const postId = req.params.postId || req.params.id;
  const commentId = req.params.commentId;
  const { text } = req.body;
  if (!text) {
    throw new ApiError(400, 'Comment text is required');
  }

  const post = await postService.updateComment(postId, commentId, req.user._id || req.user.id, text);
  res.json(post);
});

export const deleteComment = asyncHandler(async (req, res) => {
  const postId = req.params.postId || req.params.id;
  const commentId = req.params.commentId;

  const post = await postService.deleteComment(postId, commentId, req.user._id || req.user.id);
  res.json(post);
});

export const searchPosts = asyncHandler(async (req, res) => {
  const query = req.query.q;
  if (!query) {
    throw new ApiError(400, 'Search query required');
  }

  const posts = await postService.searchPosts(query);
  res.json(posts);
});

export const getExplorePosts = asyncHandler(async (req, res) => {
  const posts = await postService.getExplorePosts();
  res.json(posts);
});

export const getPostsByAuthor = asyncHandler(async (req, res) => {
  const posts = await postService.getPostsByAuthor(req.params.authorId);
  res.json(posts);
});
