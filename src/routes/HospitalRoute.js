const express = require('express');
const router = express.Router();
const HospitalController = require('../controllers/HospitalController');
const upload= require('../middlewares/UploadMiddleware');
const { Authenticate, Authorize } = require("../middlewares/AuthMiddleware");
router.post('/create-hospital',Authenticate, Authorize(["admin"]),upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]),HospitalController.createHospital);
router.get('/get-hospital/:id', HospitalController.getHospital);
router.get('/get-all-hospitals', HospitalController.getAllHospitals);
router.put('/update-hospital/:id',Authenticate, Authorize(["admin"]),upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]), HospitalController.updateHospital);
router.delete('/delete-hospital/:id',Authenticate, Authorize(["admin"]), HospitalController.deleteHospital);
router.post('/delete-all-hospitals',Authenticate, Authorize(["admin"]), HospitalController.deleteManyHospitals);
router.get('/search-hospital', HospitalController.searchHospital);
router.get('/get-all-doctors-hospital/:id', HospitalController.getAllDoctorsHospital);
module.exports = router;