import Admin from '../../../database/models/admin.model.js';
import AdminRepositoryContract from '../contracts/admin.repository.contract.js';

class AdminRepository extends AdminRepositoryContract {
  async findById(id) {
    return await Admin.findById(id).select('-password');
  }

  async findByEmail(email) {
    return await Admin.findOne({ email });
  }

  async create(adminData) {
    const admin = new Admin(adminData);
    return await admin.save();
  }
}

export default new AdminRepository();
