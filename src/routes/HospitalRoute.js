const express = require('express');
const router = express.Router();
const HospitalController = require('../controllers/HospitalController');
const { Authenticate, Authorize } = require("../middlewares/AuthMiddleware");
router.post('/create-hospital',Authenticate, Authorize(["admin"]),HospitalController.createHospital);
router.get('/get-hospital/:id', HospitalController.getHospital);
router.get('/get-all-hospitals', HospitalController.getAllHospitals);
router.put('/update-hospital/:id',Authenticate, Authorize(["admin"]), HospitalController.updateHospital);
router.delete('/delete-hospital/:id',Authenticate, Authorize(["admin"]), HospitalController.deleteHospital);
router.delete('/delete-all-hospitals',Authenticate, Authorize(["admin"]), HospitalController.deleteManyHospitals);

module.exports = router;