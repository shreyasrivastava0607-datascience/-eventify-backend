const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    // ── Core Details ────────────────────────────────────────────────────────
    title: {
      type:      String,
      required:  [true, "Event title is required"],
      trim:      true,
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
      default: "",
    },

    galleryImages: {
      type:    [String],
      default: [],
    },

    // ── Registration Form ────────────────────────────────────────────────────
    /**
     * Optional Google Form link set by admin.
     * If present, students must open this form and then
     * click "Mark as Registered" on the website.
     */
    formLink: {
      type:    String,
      default: "",
      trim:    true,
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
    targetDepartments: {
      type:    [String],
      default: [],
    },

    targetYears: {
      type:    [Number],
      default: [],
    },

    // ── Registrations ───────────────────────────────────────────────────────
    registeredStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ─── Virtual: Registration Count ─────────────────────────────────────────────
eventSchema.virtual("registrationCount").get(function () {
  return this.registeredStudents.length;
});

eventSchema.set("toJSON",   { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model("Event", eventSchema);