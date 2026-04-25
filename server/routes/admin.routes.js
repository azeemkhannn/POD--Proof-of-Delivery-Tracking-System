// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, isAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// Driver Management
router.get('/drivers', adminController.getAllDrivers);
router.get('/drivers/:id', adminController.getDriver);
router.post('/drivers', adminController.createDriver);
router.put('/drivers/:id', adminController.updateDriver);
router.delete('/drivers/:id', adminController.deleteDriver);
router.patch('/drivers/:id/toggle-status', adminController.toggleDriverStatus);

// Route Management
router.get('/routes', adminController.getAllRoutes);
router.get('/routes/:id', adminController.getRoute);
router.post('/routes', adminController.createRoute);
router.put('/routes/:id', adminController.updateRoute);
router.delete('/routes/:id', adminController.deleteRoute);
router.patch('/routes/:id/assign-driver', adminController.assignDriverToRoute);

// Reports & Analytics
router.get('/reports', adminController.getAllReports);
router.get('/reports/driver/:driverId', adminController.getDriverReports);
router.get('/reports/route/:routeId', adminController.getRouteReports);
router.get('/reports/date/:date', adminController.getReportsByDate);
router.get('/dashboard', adminController.getDashboardStats);

module.exports = router;