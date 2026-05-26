import postRepository from './implementations/post.repository.js';
import cloudinaryService from '../../services/storage/cloudinary.service.js';
import ApiError from '../../utils/ApiError.js';

class PostService {
  async createPost(userId, caption, tagsStr, fileBuffer, mimeType) {
    const resourceType = mimeType.startsWith('video/') ? 'video' : 'image';
    const result = await cloudinaryService.upload(fileBuffer, 'classcify/posts', resourceType);

    const tags = tagsStr ? tagsStr.split(',').map((tag) => tag.trim()) : [];

    return await postRepository.create({
      caption,
      tags,
      media: {
        public_id: result.public_id,
        url: result.secure_url,
        resource_type: result.resource_type
      },
      author: userId
    });
  }

  async getPosts(page) {
    const pageNum = parseInt(page) || 1;
    const limit = 10;
    const skip = (pageNum - 1) * limit;

    return await postRepository.getFeedPosts(skip, limit);
  }

  async likePost(postId, userId) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    return post;
  }

  async addComment(postId, text, authorId) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    post.comments.push({ text, author: authorId });
    await post.save();
    return post;
  }

  async updateComment(postId, commentId, authorId, text) {
    const post = await postRepository.findOneAndUpdate(
      {
        _id: postId,
        'comments._id': commentId,
        'comments.author': authorId
      },
      { $set: { 'comments.$.text': text } }
    );

    if (!post) {
      throw new ApiError(404, 'Post or comment not found');
    }

    return post;
  }

  async deleteComment(postId, commentId, authorId) {
    const post = await postRepository.findOneAndUpdate(
      { _id: postId },
      { $pull: { comments: { _id: commentId, author: authorId } } }
    );

    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    return post;
  }

  async searchPosts(query) {
    return await postRepository.search(query, 50);
  }

  async getExplorePosts() {
    return await postRepository.getExplorePosts(100);
  }

  async getPostsByAuthor(authorId) {
    return await postRepository.getPostsByAuthor(authorId);
  }
}

export default new PostService();
