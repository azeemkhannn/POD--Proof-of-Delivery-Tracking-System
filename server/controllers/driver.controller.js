// controllers/driver.controller.js
const Route = require('../models/Route');
const Report = require('../models/Report');
const User = require('../models/User');
const { route } = require('../routes/auth.routes');


// Helper function to get day name
const getDayName = (date = new Date()) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// @desc    Check if route is available today
// @route   GET /api/driver/route/check
// @access  Private/Driver
exports.checkRouteAvailability = async (req, res) => {
  try {
    const driverId = req.user.id; // logged-in driver ID
    const today = getDayName(); // e.g., "Monday"

    // Find all routes assigned to this driver
    const routes = await Route.find({ assignedDriver: driverId }).populate('assignedDriver');

    if (!routes || routes.length === 0) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'No route assigned to you yet. Contact admin.'
      });
    }

    // Filter routes that are active today
    const todayRoutes = routes.filter(
      route => route.isActive && route.deliveryDays.includes(today)
    );

    if (todayRoutes.length === 0) {
      return res.status(200).json({
        success: true,
        available: false,
        message: `No delivery scheduled for ${today}.`,
        deliveryDays: routes.flatMap(r => r.deliveryDays),
      });
    }

    // If at least one route matches today's schedule
    res.status(200).json({
      success: true,
      available: true,
      message: 'You have route(s) scheduled for today.',
      totalRoutesToday: todayRoutes.length,
      todayRoutes: todayRoutes.map(r => ({
        routeName: r.routeName,
        deliveryDays: r.deliveryDays,
        isActive: r.isActive
      }))
    });

  } catch (error) {
    console.error('Error checking route availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking route availability',
      error: error.message
    });
  }
};

// @desc    Get today's routes (auto-unlocked)
// @route   GET /api/driver/route
// @access  Private/Driver
exports.getTodayRoute = async (req, res) => {
  try {
    const assignedDriver = req.user.id;


    // Find all routes assigned to this driver
    const routes = await Route.find({ assignedDriver }).populate('assignedDriver');

    if (!routes || routes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No routes assigned. Please contact your admin.'
      });
    }

    const today = getDayName(); // e.g. "Wednesday"

    // Filter routes active and scheduled for today
    const todayRoutes = routes.filter(
      route => route.isActive && route.deliveryDays.includes(today)
    );

    if (todayRoutes.length === 0) {
      return res.status(403).json({
        success: false,
        message: `No delivery scheduled for ${today}.`,
      });
    }

    // ✅ Check if today's report already submitted
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingReport = await Report.findOne({
      driver: assignedDriver,
      route: { $in: todayRoutes.map(r => r._id) },
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'completed'
    });

    if (existingReport) {
      return res.status(403).json({
        success: false,
        message: 'Your report for today has already been submitted ✅.',
        reportSubmitted: true
      });
    }

    // ✅ If no report found, send route
    res.status(200).json({
      success: true,
      reportSubmitted: false,
      route: todayRoutes.map(route => ({
        _id: route._id,
        routeName: route.routeName,
        description: route.description,
        shops: route.shops,
        deliveryDays: route.deliveryDays
      }))
    });

  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching route'
    });
  }
};




// @desc    Submit daily report
// @route   POST /api/driver/report
// @access  Private/Driver
exports.submitReport = async (req, res) => {
  try {

    const { shops, notes, status,totalPickup } = req.body;
    const todayName = getDayName(); // e.g. "Wednesday"

    // Find today's active route for this driver
    const route = await Route.findOne({
      assignedDriver: req.user.id,
      isActive: true,
      deliveryDays: { $in: [todayName] } // checks if today is in deliveryDays array
    }).populate('_id');


    if (!route) {
      return res.status(400).json({
        success: false,
        message: 'No route assigned for today. Cannot submit report.'
      });
    }

    // const driver = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if report already exists for today
    const existingReport = await Report.findOne({
      driver: req.user.id,
      date: today
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Report already submitted for today.Thank You ✅.'
      });
    }

    // Create new report
    const report = await Report.create({
      driver: req.user.id,
      route: route._id,
      date: today,
      shops: shops || [],
      notes: notes || '',
      totalPickup: totalPickup || 0,
      status: status || 'in-progress',
      startTime: new Date()
    });

    // If completed, update route shop targets based on sellout performance
    if (status === 'completed' && shops && shops.length > 0) {

      const routeToUpdate = await Route.findOne({
        assignedDriver: req.user.id,
        isActive: true,
        deliveryDays: { $in: [todayName] } // checks if today is in deliveryDays array
      })

      if (routeToUpdate) {
        shops.forEach(reportShop => {
          // Find matching shop in route
          const shopInRoute = routeToUpdate.shops.find(
            s => s._id.toString() === reportShop.shopId
          );

          if (shopInRoute) {
            const selloutPercentage = (reportShop.sellout / shopInRoute.targetAmount) * 100;

            // If sellout is 90% or more, increase target by 10%
            if (selloutPercentage >= 90) {
              shopInRoute.targetAmount = Math.round(shopInRoute.targetAmount * 1.1);
            }
            // If sellout is between 80-89%, increase by 5%
            else if (selloutPercentage >= 80) {
              shopInRoute.targetAmount = Math.round(shopInRoute.targetAmount * 1.05);
            }
            // If sellout is less than 70%, decrease by 10%
            // else if (selloutPercentage < 70) {
            //   shopInRoute.targetAmount = Math.round(shopInRoute.targetAmount * 0.9);
            // }
            // Otherwise keep same target
          }
        });

        await routeToUpdate.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting report'
    });
  }
};

// @desc    Get today's report
// @route   GET /api/driver/report/today
// @access  Private/Driver
exports.getTodayReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const report = await Report.findOne({
      driver: req.user.id,
      date: today
    }).populate('route', 'routeName');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'No report found for today'
      });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching report'
    });
  }
};

// @desc    Update report
// @route   PUT /api/driver/report/:id
// @access  Private/Driver
exports.updateReport = async (req, res) => {
  try {
    const { shops, notes, status } = req.body;

    const report = await Report.findOne({
      _id: req.params.id,
      driver: req.user.id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update fields
    if (shops) report.shops = shops;
    if (notes !== undefined) report.notes = notes;
    if (status) {
      report.status = status;
      if (status === 'completed' && !report.endTime) {
        report.endTime = new Date();
      }
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating report'
    });
  }
};

// @desc    Get report history
// @route   GET /api/driver/history
// @access  Private/Driver
exports.getReportHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const reports = await Report.find({ driver: req.user.id })
      .populate('route', 'routeName')
      .sort('-date')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Report.countDocuments({ driver: req.user.id });

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
      message: 'Error fetching history'
    });
  }
};

// @desc    Get driver statistics
// @route   GET /api/driver/stats
// @access  Private/Driver
exports.getDriverStats = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const reports = await Report.find({
      driver: req.user.id,
      date: { $gte: startOfMonth }
    });

    const stats = {
      thisMonth: {
        totalDeliveries: reports.length,
        completed: reports.filter(r => r.status === 'completed').length,
        totalPickup: reports.reduce((sum, r) => sum + r.totalPickup, 0),
        totalSellout: reports.reduce((sum, r) => sum + r.totalSellout, 0),
        totalRemaining: reports.reduce((sum, r) => sum + r.totalRemaining, 0),
        averageSellout: reports.length > 0
          ? Math.round(reports.reduce((sum, r) => sum + r.totalSellout, 0) / reports.length)
          : 0
      }
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};