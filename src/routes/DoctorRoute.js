const express = require('express');
const router = express.Router();
const DoctorController = require('../controllers/DoctorController');
const { Authenticate, Authorize } = require("../middlewares/AuthMiddleware");
// router.get('/get-doctor/:id',Authenticate,Authorize(['admin','doctor']) ,DoctorController.getDoctor);
// router.get('/get-all-doctors',Authenticate ,DoctorController.getAllDoctors);
// router.get('/get-doctor/:id',Authenticate, DoctorController.getDoctor);
// router.get('/get-all-doctors', DoctorController.getAllDoctors);

module.exports = router;