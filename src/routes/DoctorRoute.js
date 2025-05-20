const express = require("express");
const router = express.Router();
const DoctorController = require("../controllers/DoctorController");
const { Authenticate, Authorize } = require("../middlewares/AuthMiddleware");

router.post(
  "/create-doctor",
  Authenticate,
  Authorize(["admin"]),
  DoctorController.createDoctor
);
router.put("/update-doctor/:id", Authenticate, Authorize(["admin","doctor"]) ,DoctorController.updateDoctor);
router.delete("/delete-doctor/:id", Authenticate, Authorize(["admin"]), DoctorController.deleteDoctor);
router.post("/delete-many-doctors", Authenticate, Authorize(["admin"]), DoctorController.deleteManyDoctors);
router.get("/get-all-doctors", DoctorController.getAllDoctors);
router.get("/get-doctor/:id", DoctorController.getDoctor);

module.exports = router;
