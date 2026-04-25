// routes/driver.routes.js
const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver.controller');
const { protect, isDriver } = require('../middleware/auth');

// All driver routes require authentication
router.use(protect);

// Route Access
router.get('/route', driverController.getTodayRoute);
router.get('/route/check', driverController.checkRouteAvailability);

// Report Management
router.post('/report', driverController.submitReport);
router.get('/report/today', driverController.getTodayReport);
router.put('/report/:id', driverController.updateReport);

// History
router.get('/history', driverController.getReportHistory);
router.get('/stats', driverController.getDriverStats);

module.exports = router;