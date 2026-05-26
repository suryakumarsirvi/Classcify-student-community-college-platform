import Report from '../../../database/models/report.model.js';
import ReportRepositoryContract from '../contracts/report.repository.contract.js';

class ReportRepository extends ReportRepositoryContract {
  async findAll() {
    return await Report.find().sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Report.findById(id);
  }

  async create(reportData) {
    const report = new Report(reportData);
    return await report.save();
  }

  async update(id, reportData) {
    return await Report.findByIdAndUpdate(id, reportData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Report.findByIdAndDelete(id);
  }
}

export default new ReportRepository();
