import Asset from '../../../database/models/asset.model.js';
import AssetRepositoryContract from '../contracts/asset.repository.contract.js';

class AssetRepository extends AssetRepositoryContract {
  async find(query, sortOptions = {}) {
    return await Asset.find(query)
      .populate('author', 'personal.firstName personal.lastName')
      .sort(sortOptions);
  }

  async findById(id) {
    return await Asset.findById(id);
  }

  async create(assetData) {
    const asset = new Asset(assetData);
    return await asset.save();
  }

  async update(id, updateData) {
    return await Asset.findByIdAndUpdate(id, updateData, { new: true });
  }
}

export default new AssetRepository();
