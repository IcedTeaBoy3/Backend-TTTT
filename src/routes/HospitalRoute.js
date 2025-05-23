const express = require('express');
const router = express.Router();
const HospitalController = require('../controllers/HospitalController');
const upload= require('../middlewares/UploadMiddleware');
const { Authenticate, Authorize } = require("../middlewares/AuthMiddleware");
router.post('/create-hospital',Authenticate, Authorize(["admin"]),upload.single('image'),HospitalController.createHospital);
router.get('/get-hospital/:id', HospitalController.getHospital);
router.get('/get-all-hospitals', HospitalController.getAllHospitals);
router.put('/update-hospital/:id',Authenticate, Authorize(["admin"]),upload.single('image'), HospitalController.updateHospital);
router.delete('/delete-hospital/:id',Authenticate, Authorize(["admin"]), HospitalController.deleteHospital);
router.post('/delete-all-hospitals',Authenticate, Authorize(["admin"]), HospitalController.deleteManyHospitals);

module.exports = router;