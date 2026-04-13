const mongoose = require("mongoose");

/**
 * @typedef {Object} EventDocument
 *
 * Event schema for managing college events.
 * Supports upcoming and completed events with targeted audience filtering.
 */
const eventSchema = new mongoose.Schema(
  {
    // ── Core Details ────────────────────────────────────────────────────────
    title: {
      type:     String,
      required: [true, "Event title is required"],
      trim:     true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type:     String,
      required: [true, "Event description is required"],
      trim:     true,
    },

    date: {
      type:     Date,
      required: [true, "Event date is required"],
    },

    venue: {
      type:     String,
      required: [true, "Venue is required"],
      trim:     true,
    },

    // ── Media ───────────────────────────────────────────────────────────────
    imageURL: {
      type:    String,
      default: "", // Primary poster/banner image for the event
    },

    /**
     * Gallery of image URLs for completed events.
     * Populated after the event concludes.
     */
    galleryImages: {
      type:    [String],
      default: [],
    },

    // ── Status ──────────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    {
        values:  ["upcoming", "completed"],
        message: "Status must be 'upcoming' or 'completed'",
      },
      default: "upcoming",
    },

    // ── Targeting ───────────────────────────────────────────────────────────
    /**
     * If empty, the event is open to all departments.
     * Otherwise, only listed departments are targeted.
     */
    targetDepartments: {
      type:    [String],
      default: [], // e.g., ["CSE", "ECE", "MECH"]
    },

    /**
     * If empty, the event is open to all years.
     * Otherwise, only listed years are targeted (e.g., [1, 2, 3]).
     */
    targetYears: {
      type:    [Number],
      default: [], // e.g., [1, 2]
    },

    // ── Registrations ───────────────────────────────────────────────────────
    /**
     * Array of User ObjectIds who have registered for this event.
     * Populated via .populate("registeredStudents") when needed.
     */
    registeredStudents: [
      {
        type:    mongoose.Schema.Types.ObjectId,
        ref:     "User", // References the User model
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── Virtual: Registration Count ─────────────────────────────────────────────
/**
 * Virtual field that returns the number of registered students.
 * Not stored in DB — computed on the fly.
 * Usage: event.registrationCount
 */
eventSchema.virtual("registrationCount").get(function () {
  return this.registeredStudents.length;
});

// Ensure virtuals are included when converting to JSON/Object
eventSchema.set("toJSON",   { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

// ─── Index: Improve Query Performance ────────────────────────────────────────
eventSchema.index({ date: 1 });       // Fast sorting/filtering by date
eventSchema.index({ status: 1 });     // Fast filtering by status

module.exports = mongoose.model("Event", eventSchema);