// controllers/admin.controller.js
const User = require('../models/User');
const Route = require('../models/Route');
const Report = require('../models/Report');

// ==================== DRIVER MANAGEMENT ====================

/// @desc    Get all drivers with all their assigned routes
// @route   GET /api/admin/drivers
// @access  Private/Admin

exports.getAllDrivers = async (req, res) => {
  try {
    // Step 1: Get all users with role 'driver'
    const drivers = await User.find({ role: 'driver' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Step 2: Fetch all routes grouped by driverId
    const routes = await Route.find()
      .populate('assignedDriver', 'name email phone')
      .select('routeName deliveryDays isActive assignedDriver');

    // Step 3: Map routes to corresponding drivers
    const driverData = drivers.map(driver => {
      const driverRoutes = routes.filter(
        route => route.assignedDriver?._id.toString() === driver._id.toString()
      );

      return {
        ...driver.toObject(),
        totalRoutes: driverRoutes.length,
        assignedRoutes: driverRoutes.map(route => ({
          routeName: route.routeName,
          deliveryDays: route.deliveryDays,
          isActive: route.isActive
        }))
      };
    });

    // Step 4: Send response
    res.status(200).json({
      success: true,
      count: driverData.length,
      drivers: driverData
    });

  } catch (error) {
    console.error('Error fetching drivers with routes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching drivers with routes',
      error: error.message
    });
  }
};


// @desc    Get single driver
// @route   GET /api/admin/drivers/:id
// @access  Private/Admin
exports.getDriver = async (req, res) => {
  try {
    const driver = await User.findOne({ 
      _id: req.params.id, 
      role: 'driver' 
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching driver'
    });
  }
};

// @desc    Create new driver
// @route   POST /api/admin/drivers
// @access  Private/Admin
exports.createDriver = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create driver
    const driver = await User.create({
      name,
      email,
      password,
      phone,
      role: 'driver',
      
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      driver
    });
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating driver'
    });
  }
};

// @desc    Update driver
// @route   PUT /api/admin/drivers/:id
// @access  Private/Admin
exports.updateDriver = async (req, res) => {
  try {
    const { name, email, phone, isActive } = req.body;

    const driver = await User.findOne({ 
      _id: req.params.id, 
      role: 'driver' 
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Update fields
    if (name) driver.name = name;
    if (email) driver.email = email;
    if (phone) driver.phone = phone;
    // if (assignedRoute !== undefined) driver.assignedRoute = assignedRoute || null;
    if (isActive !== undefined && isActive !== 'Inactive') driver.isActive = isActive;

    await driver.save();

    res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating driver'
    });
  }
};

// @desc    Delete driver
// @route   DELETE /api/admin/drivers/:id
// @access  Private/Admin
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await User.findOneAndDelete({ 
      _id: req.params.id, 
      role: 'driver' 
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting driver'
    });
  }
};

// @desc    Toggle driver active status
// @route   PATCH /api/admin/drivers/:id/toggle-status
// @access  Private/Admin
exports.toggleDriverStatus = async (req, res) => {
  try {
    const driver = await User.findOne({ 
      _id: req.params.id, 
      role: 'driver' 
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    driver.isActive = !driver.isActive;
    await driver.save();

    res.status(200).json({
      success: true,
      message: `Driver ${driver.isActive ? 'activated' : 'deactivated'}`,
      driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling driver status'
    });
  }
};

// ==================== ROUTE MANAGEMENT ====================

// @desc    Get all routes
// @route   GET /api/admin/routes
// @access  Private/Admin
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find()
      .populate('assignedDriver', 'name email phone')
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: routes.length,
      routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching routes'
    });
  }
};

// @desc    Get single route
// @route   GET /api/admin/routes/:id
// @access  Private/Admin
exports.getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('assignedDriver', 'name email phone');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.status(200).json({
      success: true,
      route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching route'
    });
  }
};

// @desc    Create new route
// @route   POST /api/admin/routes
// @access  Private/Admin
exports.createRoute = async (req, res) => {
  try {
    const { routeName, description, shops, assignedDriver, deliveryDays } = req.body;

    // Check if route name exists
    const existingRoute = await Route.findOne({ routeName });
    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: 'Route name already exists'
      });
    }

    // Create route
    const route = await Route.create({
      routeName,
      description,
      shops: shops || [],
      assignedDriver: assignedDriver || null,
      deliveryDays: deliveryDays || [],
      createdBy: req.user._id
    });

    // If driver assigned, update driver's assignedRoute
    if (assignedDriver) {
      await User.findByIdAndUpdate(assignedDriver, { assignedRoute: route._id });
    }

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      route
    });
  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating route'
    });
  }
};

// @desc    Update route
// @route   PUT /api/admin/routes/:id
// @access  Private/Admin
exports.updateRoute = async (req, res) => {
  try {
    const { routeName, description, shops, deliveryDays, isActive , assignedDriver} = req.body;
  console.log('Assigned Driver ID:', assignedDriver);
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Update fields
    if (routeName) route.routeName = routeName;
    if (description !== undefined) route.description = description;
    if (shops) route.shops = shops;
    if (deliveryDays) route.deliveryDays = deliveryDays;
    if (isActive !== undefined) route.isActive = isActive;
    route.assignedDriver = assignedDriver || null;

    await route.save();

    res.status(200).json({
      success: true,
      message: 'Route updated successfully',
      route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating route'
    });
  }
};

// @desc    Delete route
// @route   DELETE /api/admin/routes/:id
// @access  Private/Admin
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Remove route assignment from driver
    if (route.assignedDriver) {
      await User.findByIdAndUpdate(route.assignedDriver, { assignedRoute: null });
    }

    await route.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting route'
    });
  }
};

// @desc    Assign driver to route
// @route   PATCH /api/admin/routes/:id/assign-driver
// @access  Private/Admin
exports.assignDriverToRoute = async (req, res) => {
  try {
    const { driverId } = req.body;

    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Check if driver exists and is a driver
    const driver = await User.findOne({ _id: driverId, role: 'driver' });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Remove old driver assignment
    if (route.assignedDriver) {
      await User.findByIdAndUpdate(route.assignedDriver, { assignedRoute: null });
    }

    // Assign new driver
    route.assignedDriver = driverId;
    await route.save();

    // Update driver's assigned route
    driver.assignedRoute = route._id;
    await driver.save();

    res.status(200).json({
      success: true,
      message: 'Driver assigned successfully',
      route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning driver'
    });
  }
};

// ==================== REPORTS & ANALYTICS ====================

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const reports = await Report.find(query)
      .populate('driver', 'name email phone')
      .populate('route', 'routeName')
      .sort('-date')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reports'
    });
  }
};

// @desc    Get reports by driver
// @route   GET /api/admin/reports/driver/:driverId
// @access  Private/Admin
exports.getDriverReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { driver: req.params.driverId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const reports = await Report.find(query)
      .populate('route', 'routeName')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching driver reports'
    });
  }
};

// @desc    Get reports by route
// @route   GET /api/admin/reports/route/:routeId
// @access  Private/Admin
exports.getRouteReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { route: req.params.routeId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const reports = await Report.find(query)
      .populate('driver', 'name')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching route reports'
    });
  }
};

// @desc    Get reports by date
// @route   GET /api/admin/reports/date/:date
// @access  Private/Admin
exports.getReportsByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const reports = await Report.find({
      date: { $gte: date, $lt: nextDay }
    })
      .populate('driver', 'name email')
      .populate('route', 'routeName');

    res.status(200).json({
      success: true,
      count: reports.length,
      date: date.toISOString().split('T')[0],
      reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reports'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Total counts
    const totalDrivers = await User.countDocuments({ role: 'driver', isActive: true });
    const totalRoutes = await Route.countDocuments({ isActive: true });
    
    // Today's reports
    const todayReports = await Report.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('driver', 'name').populate('route', 'routeName');

    const todayStats = {
      totalDeliveries: todayReports.length,
      completed: todayReports.filter(r => r.status === 'completed').length,
      inProgress: todayReports.filter(r => r.status === 'in-progress').length,
      pending: todayReports.filter(r => r.status === 'pending').length,
      totalPickup: todayReports.reduce((sum, r) => sum + r.totalPickup, 0),
      totalSellout: todayReports.reduce((sum, r) => sum + r.totalSellout, 0),
      totalRemaining: todayReports.reduce((sum, r) => sum + r.totalRemaining, 0)
    };

    // This month's stats
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthReports = await Report.find({
      date: { $gte: startOfMonth }
    });

    const monthStats = {
      totalDeliveries: monthReports.length,
      totalPickup: monthReports.reduce((sum, r) => sum + r.totalPickup, 0),
      totalSellout: monthReports.reduce((sum, r) => sum + r.totalSellout, 0),
      totalRemaining: monthReports.reduce((sum, r) => sum + r.totalRemaining, 0)
    };

    // Top performers (this month)
    const topDrivers = await Report.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: {
        _id: '$driver',
        totalSellout: { $sum: '$totalSellout' },
        deliveriesCount: { $sum: 1 }
      }},
      { $sort: { totalSellout: -1 } },
      { $limit: 5 }
    ]);

    const topDriversDetails = await User.populate(topDrivers, {
      path: '_id',
      select: 'name email'
    });

    res.status(200).json({
      success: true,
      dashboard: {
        overview: {
          totalDrivers,
          totalRoutes,
          activeDeliveriesToday: todayStats.totalDeliveries
        },
        today: todayStats,
        thisMonth: monthStats,
        topDrivers: topDriversDetails,
        recentReports: todayReports.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
};