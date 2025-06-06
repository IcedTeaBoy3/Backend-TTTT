const express  = require('express');
const router = express.Router();
const StaticController = require('../controllers/StaticController');
const { Authenticate,Authorize } = require('../middlewares/AuthMiddleware');

router.get('/appointment-stats', Authenticate, Authorize(['admin']), StaticController.getAppointmentStats);
router.get('/doctor-stats', Authenticate, Authorize(['admin']), StaticController.getDoctorStats);
router.get('/appointment-trend',Authenticate, Authorize(['admin']), StaticController.getAppointmentTrend);
router.get('/patient-stats/overview', Authenticate, Authorize(['admin']), StaticController.getPatientOverviewStats);
module.exports = router;