class PostRepositoryContract {
  async findById(id) { throw new Error('Method not implemented'); }
  async getFeedPosts(skip, limit) { throw new Error('Method not implemented'); }
  async getExplorePosts(limit) { throw new Error('Method not implemented'); }
  async getPostsByAuthor(authorId) { throw new Error('Method not implemented'); }
  async search(queryStr, limit) { throw new Error('Method not implemented'); }
  async create(postData) { throw new Error('Method not implemented'); }
  async findOneAndUpdate(filter, updateData, options) { throw new Error('Method not implemented'); }
  async findByIdAndUpdate(id, updateData, options) { throw new Error('Method not implemented'); }
}

export default PostRepositoryContract;
