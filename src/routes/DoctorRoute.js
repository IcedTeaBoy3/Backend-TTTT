const express = require("express");
const router = express.Router();
const DoctorController = require("../controllers/DoctorController");
const { Authenticate, Authorize } = require("../middlewares/AuthMiddleware");
const upload = require('../middlewares/UploadMiddleware');

router.post(
  "/create-doctor",
  Authenticate,
  Authorize(["admin"]),
  DoctorController.createDoctor
);
router.put("/update-doctor/:id", Authenticate, Authorize(["admin","doctor"]), upload.single('avatar'),DoctorController.updateDoctor);
router.delete("/delete-doctor/:id", Authenticate, Authorize(["admin"]), DoctorController.deleteDoctor);
router.post("/delete-many-doctors", Authenticate, Authorize(["admin"]), DoctorController.deleteManyDoctors);
router.get("/get-all-doctors", DoctorController.getAllDoctors);
router.get("/get-doctor/:id", DoctorController.getDoctor);
router.get("/search-doctors", DoctorController.searchDoctors);
router.get("/get-doctor-by-userId",Authenticate,DoctorController.getDoctorByUserId);
router.get("/:id/statistics", Authenticate, Authorize(["doctor"]), DoctorController.getDoctorStatistics);

module.exports = router;
