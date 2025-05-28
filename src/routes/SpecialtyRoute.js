const express = require('express');
const router = express.Router();
const SpecialtyController = require('../controllers/SpecialtyController');

const { Authenticate, Authorize } = require('../middlewares/AuthMiddleware');
const upload = require('../middlewares/UploadMiddleware');


router.post('/create-specialty',Authenticate, Authorize(["admin"]),upload.single('image'),SpecialtyController.createSpecialty);
router.get('/get-specialty/:id', SpecialtyController.getSpecialty);
router.get('/get-all-specialties', SpecialtyController.getAllSpecialties);
router.put('/update-specialty/:id',Authenticate, Authorize(["admin"]),upload.single('image'), SpecialtyController.updateSpecialty);
router.delete('/delete-specialty/:id',Authenticate, Authorize(["admin"]), SpecialtyController.deleteSpecialty);
router.post('/delete-all-specialties',Authenticate, Authorize(["admin"]), SpecialtyController.deleteManySpecialties);
router.post('/insert-many-specialties',Authenticate, Authorize(["admin"]), SpecialtyController.insertManySpecialties);
module.exports = router;