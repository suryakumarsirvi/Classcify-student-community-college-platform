import Post from '../../../database/models/post.model.js';
import PostRepositoryContract from '../contracts/post.repository.contract.js';

class PostRepository extends PostRepositoryContract {
  async findById(id) {
    return await Post.findById(id);
  }

  async getFeedPosts(skip, limit) {
    return await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'personal.firstName personal.lastName academic.course');
  }

  async getExplorePosts(limit) {
    return await Post.find()
      .populate('author', 'personal.firstName personal.lastName academic.course')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getPostsByAuthor(authorId) {
    return await Post.find({ author: authorId })
      .populate('author', 'personal.firstName personal.lastName academic.course')
      .sort({ createdAt: -1 });
  }

  async search(queryStr, limit) {
    return await Post.find({
      $or: [
        { tags: { $regex: queryStr, $options: 'i' } },
        { caption: { $regex: queryStr, $options: 'i' } }
      ]
    })
      .populate('author', 'personal.firstName personal.lastName academic.course')
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async create(postData) {
    const post = new Post(postData);
    return await post.save();
  }

  async findOneAndUpdate(filter, updateData, options = {}) {
    return await Post.findOneAndUpdate(filter, updateData, { new: true, ...options });
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    return await Post.findByIdAndUpdate(id, updateData, { new: true, ...options });
  }
}

export default new PostRepository();
