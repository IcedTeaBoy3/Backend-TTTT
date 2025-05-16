const express = require('express');
const router = express.Router();
const SpecialtyController = require('../controllers/SpecialtyController');
const { Authenticate, Authorize } = require('../middlewares/AuthMiddleware');

router.post('/create-specialty',Authenticate, Authorize(["admin"]),SpecialtyController.createSpecialty);
router.get('/get-specialty/:id', SpecialtyController.getSpecialty);
router.get('/get-all-specialties', SpecialtyController.getAllSpecialties);
router.put('/update-specialty/:id',Authenticate, Authorize(["admin"]), SpecialtyController.updateSpecialty);
router.delete('/delete-specialty/:id',Authenticate, Authorize(["admin"]), SpecialtyController.deleteSpecialty);
router.post('/delete-all-specialties',Authenticate, Authorize(["admin"]), SpecialtyController.deleteManySpecialties);
module.exports = router;