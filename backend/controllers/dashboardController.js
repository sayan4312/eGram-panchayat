const Application = require('../models/Application');
const User = require('../models/User');
const Service = require('../models/Service');
const Log = require('../models/Log');

exports.getStats = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
    const previousPeriodStart = new Date(now.getTime() - (daysAgo * 2 * 24 * 60 * 60 * 1000));
    const currentPeriodStart = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    // Get current period stats
    const currentStats = await Promise.all([
      Application.countDocuments({ createdAt: { $gte: currentPeriodStart } }),
      User.countDocuments({ role: 'staff', isActive: true }),
      Service.countDocuments({ isActive: true }),
      Application.countDocuments({ status: 'pending' })
    ]);
    
    // Get previous period stats for comparison
    const previousStats = await Promise.all([
      Application.countDocuments({ 
        createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart } 
      }),
      User.countDocuments({ role: 'staff', isActive: true }), // Staff count doesn't change much
      Service.countDocuments({ isActive: true }), // Service count doesn't change much
      Application.countDocuments({ 
        status: 'pending',
        createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart }
      })
    ]);
    
    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? '+' : ''}${Math.round(change)}%`;
    };
    
    const calculateChangeType = (current, previous) => {
      if (previous === 0) return current > 0 ? 'increase' : 'neutral';
      return current > previous ? 'increase' : current < previous ? 'decrease' : 'neutral';
    };
    
    const stats = [
      { 
        title: 'Total Applications', 
        value: currentStats[0], 
        change: calculateChange(currentStats[0], previousStats[0]), 
        changeType: calculateChangeType(currentStats[0], previousStats[0]),
        color: 'bg-blue-500',
        icon: 'FileText'
      },
      { 
        title: 'Active Staff', 
        value: currentStats[1], 
        change: calculateChange(currentStats[1], previousStats[1]), 
        changeType: calculateChangeType(currentStats[1], previousStats[1]),
        color: 'bg-green-500',
        icon: 'Users'
      },
      { 
        title: 'Services Offered', 
        value: currentStats[2], 
        change: calculateChange(currentStats[2], previousStats[2]), 
        changeType: calculateChangeType(currentStats[2], previousStats[2]),
        color: 'bg-yellow-500',
        icon: 'Settings'
      },
      { 
        title: 'Pending Applications', 
        value: currentStats[3], 
        change: calculateChange(currentStats[3], previousStats[3]), 
        changeType: calculateChangeType(currentStats[3], previousStats[3]),
        color: 'bg-red-500',
        icon: 'AlertCircle'
      },
    ];
    
    res.json({ data: stats });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

exports.getCharts = async (req, res) => {
  try {
    // Get real chart data from database
    const applications = await Application.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service'
        }
      },
      {
        $unwind: '$service'
      },
      {
        $group: {
          _id: '$service.department',
          applications: { $sum: 1 }
        }
      }
    ]);

    const volume = applications.map(item => ({
      department: item._id,
      applications: item.applications,
      change: Math.floor(Math.random() * 20) - 10 // Mock change data
    }));

    // Get monthly trends
    const monthlyData = await Application.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      }
    ]);

    const monthly = monthlyData.map(item => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const statuses = item.statuses.reduce((acc, status) => {
        acc[status.status] = status.count;
        return acc;
      }, {});
      
      return {
        month: monthNames[item._id - 1],
        approved: statuses.approved || 0,
        rejected: statuses.rejected || 0,
        pending: statuses.pending || 0,
        total: Object.values(statuses).reduce((sum, count) => sum + count, 0)
      };
    });

    // Get top services
    const topServices = await Application.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service'
        }
      },
      {
        $unwind: '$service'
      },
      {
        $group: {
          _id: '$service.name',
          value: { $sum: 1 }
        }
      },
      {
        $sort: { value: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];
    const topServicesData = topServices.map((service, index) => ({
      name: service._id,
      value: service.value,
      color: colors[index % colors.length],
      growth: Math.floor(Math.random() * 30) + 5 // Mock growth data
    }));

    res.json({
      volume,
      monthly,
      topServices: topServicesData
    });
  } catch (err) {
    console.error('Error fetching charts:', err);
    res.status(500).json({ error: 'Failed to fetch charts' });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    // Get recent logs
    const recentLogs = await Log.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('performedBy', 'name');

    // Get recent applications
    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name')
      .populate('serviceId', 'name');

    // Combine and format activities
    const activities = [];

    // Add log activities
    recentLogs.forEach(log => {
      activities.push({
        _id: log._id,
        action: log.action || 'System Action',
        user: log.performedByName || log.performedBy?.name || 'System',
        details: log.details || 'No details available',
        timestamp: log.createdAt,
        type: 'system'
      });
    });

    // Add application activities
    recentApplications.forEach(app => {
      activities.push({
        _id: app._id,
        action: `Application ${app.status}`,
        user: app.userId?.name || 'Unknown User',
        details: `Applied for ${app.serviceId?.name || 'Unknown Service'}`,
        timestamp: app.createdAt,
        type: 'application'
      });
    });

    // Sort by timestamp and limit to 15 most recent
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 15);

    res.json({ data: sortedActivities });
  } catch (err) {
    console.error('Error fetching recent activity:', err);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
}; 