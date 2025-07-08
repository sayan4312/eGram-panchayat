const Log = require('../models/Log');

exports.getAdminLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .populate('performedBy', 'name email');
    res.json({ data: logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};
