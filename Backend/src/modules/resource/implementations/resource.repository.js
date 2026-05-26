import Resource from '../../../database/models/resource.model.js';
import ResourceRepositoryContract from '../contracts/resource.repository.contract.js';

class ResourceRepository extends ResourceRepositoryContract {
  async findAll() {
    return await Resource.find()
      .populate('uploadedBy', 'name')
      .sort({ uploadDate: -1 });
  }

  async create(resourceData) {
    const resource = new Resource(resourceData);
    return await resource.save();
  }
}

export default new ResourceRepository();
