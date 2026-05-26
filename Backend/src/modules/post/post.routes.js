import express from 'express';
import auth from '../../middlewares/auth.middleware.js';
import upload from '../../middlewares/fileUpload.middleware.js';
import {
  createPost,
  getPosts,
  getPostsByAuthor,
  likePost,
  addComment,
  updateComment,
  deleteComment,
  searchPosts,
  getExplorePosts
} from './post.controller.js';

const router = express.Router();

router.route('/')
  .post(auth(['student']), upload.single('media'), createPost)
  .get(auth(['student', 'teacher', 'admin']), getPosts);

router.get('/author/:authorId', auth(['student', 'teacher', 'admin']), getPostsByAuthor);
router.post('/:id/like', auth(['student']), likePost);
router.post('/:id/comments', auth(['student']), addComment);

router.route('/:id/comments/:commentId')
  .put(auth(['student']), updateComment)
  .delete(auth(['student']), deleteComment);

router.get('/search', auth(['student', 'teacher', 'admin']), searchPosts);
router.get('/explore', auth(['student', 'teacher', 'admin']), getExplorePosts);

export default router;
