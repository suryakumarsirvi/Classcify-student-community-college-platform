import resourceRepository from './implementations/resource.repository.js';
import ApiError from '../../utils/ApiError.js';

class ResourceService {
  async uploadResource(fileName, fileUrl, uploadedBy, classroom) {
    if (!classroom) {
      throw new ApiError(400, 'Classroom is required');
    }

    return await resourceRepository.create({
      fileName,
      fileUrl,
      uploadedBy,
      classroom,
      uploadDate: new Date()
    });
  }

  async getResources() {
    return await resourceRepository.findAll();
  }
}

export default new ResourceService();
