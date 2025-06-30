const express  = require('express');
const router = express.Router();
const StaticController = require('../controllers/StaticController');
const { Authenticate,Authorize } = require('../middlewares/AuthMiddleware');

router.get('/appointment-stats', Authenticate, Authorize(['admin']), StaticController.getAppointmentStats);
router.get('/appointment-trend',Authenticate, Authorize(['admin']), StaticController.getAppointmentTrend);
router.get('/stats/doctor/overview', Authenticate, Authorize(['admin']), StaticController.getDoctorOverviewStats);
router.get('/stats/doctor/by-specialty', Authenticate, Authorize(['admin']), StaticController.getDoctorStatsBySpecialty);
router.get('/stats/patient/overview', Authenticate, Authorize(['admin']), StaticController.getPatientOverviewStats);
module.exports = router;