const express = require("express");
const {
  createEvent,
  getEvents,
  getEventById,
  registerForEvent,
  getRegistrations,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// ─── Admin Only Routes ────────────────────────────────────────────────────────
router.post("/",            protect, adminOnly, createEvent);
router.put("/:id",          protect, adminOnly, updateEvent);
router.delete("/:id",       protect, adminOnly, deleteEvent);
router.get("/:id/registrations", protect, adminOnly, getRegistrations);

router.patch("/:id/gallery", protect, adminOnly, async (req, res) => {
  try {
    const Event = require("../models/Event");
    const { galleryImages } = req.body;
    if (!galleryImages || !Array.isArray(galleryImages)) {
      return res.status(400).json({ success: false, message: "galleryImages array is required." });
    }
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: { galleryImages, status: "completed" } },
      { new: true }
    );
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });
    res.status(200).json({ success: true, message: "Gallery updated!", data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get("/",        protect, getEvents);
router.get("/:id",     protect, getEventById);
router.post("/:id/register", protect, registerForEvent);

module.exports = router;