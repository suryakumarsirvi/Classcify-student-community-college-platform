import assetRepository from './implementations/asset.repository.js';
import cloudinaryService from '../../services/storage/cloudinary.service.js';
import ApiError from '../../utils/ApiError.js';

class AssetService {
  async createAsset(userId, name, description, subject, category, tagsStr, isPaid, price, fileBuffer, mimeType, originalName, fileSize) {
    const result = await cloudinaryService.upload(fileBuffer, 'classcify/assets', 'raw');

    const fileExtension = originalName.split('.').pop().toLowerCase();
    const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim()) : [];

    return await assetRepository.create({
      name,
      description,
      author: userId,
      subject,
      category,
      fileType: fileExtension,
      media: {
        public_id: result.public_id,
        url: result.secure_url,
        resource_type: result.resource_type
      },
      tags,
      isPaid: isPaid === 'true',
      price: isPaid === 'true' ? parseFloat(price) : undefined,
      fileSize: (fileSize / (1024 * 1024)).toFixed(2) + ' MB'
    });
  }

  async getAssets(currentUserId, filters) {
    const { category, fileType, search, dateRange, sortBy } = filters;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (fileType && fileType !== 'all') {
      query.fileType = fileType;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let dateFilter;

      switch (dateRange) {
        case 'today':
          dateFilter = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          dateFilter = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          dateFilter = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      if (dateFilter) {
        query.createdAt = { $gte: dateFilter };
      }
    }

    const sortOptions = {};
    switch (sortBy) {
      case 'name':
        sortOptions.name = 1;
        break;
      case 'size':
        sortOptions.fileSize = -1;
        break;
      case 'downloads':
        sortOptions.downloads = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const assets = await assetRepository.find(query, sortOptions);
    return assets.map(asset => ({
      ...asset.toObject(),
      currentUserId
    }));
  }

  async getUserAssets(userId) {
    return await assetRepository.find({ author: userId });
  }

  async getMyDownloads(userId) {
    return await assetRepository.find({ 'downloads.userId': userId });
  }

  async getMyFavorites(userId) {
    return await assetRepository.find({ favorites: userId });
  }

  async downloadAsset(assetId, userId) {
    const asset = await assetRepository.findById(assetId);
    if (!asset) {
      throw new ApiError(404, 'Asset not found');
    }

    if (asset.isPaid && asset.author.toString() !== userId.toString()) {
      throw new ApiError(403, 'Asset needs to be purchased');
    }

    if (!asset.downloads) {
      asset.downloads = [];
    }

    if (!asset.downloads.find(d => d.userId.toString() === userId.toString())) {
      asset.downloads.push({
        userId,
        downloadedAt: new Date()
      });
      await asset.save();
    }

    return asset.media.url;
  }

  async toggleFavorite(assetId, userId) {
    const asset = await assetRepository.findById(assetId);
    if (!asset) {
      throw new ApiError(404, 'Asset not found');
    }

    const userIndex = asset.favorites.indexOf(userId);
    if (userIndex === -1) {
      asset.favorites.push(userId);
    } else {
      asset.favorites.splice(userIndex, 1);
    }

    await asset.save();
    return asset;
  }
}

export default new AssetService();
