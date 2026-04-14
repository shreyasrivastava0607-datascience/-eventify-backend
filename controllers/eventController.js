const Event = require("../models/Event");
const User  = require("../models/User");

// ─── Admin: Create Event with Smart Clash Detection ───────────────────────────
const createEvent = async (req, res, next) => {
  try {
    const {
      title, description, date, venue,
      imageURL, targetDepartments, targetYears, status, formLink,
    } = req.body;

    if (!title || !date || !venue || !description) {
      return res.status(400).json({
        success: false,
        message: "title, description, date, and venue are required.",
      });
    }

    const eventDate  = new Date(date);
    const newDepts   = targetDepartments || [];
    const newVenue   = venue.trim().toLowerCase();
    const cleanYears = (targetYears || [])
      .filter(y => y !== null && y !== undefined)
      .map(y => Number(y));

    // ── Smart Clash Detection ─────────────────────────────────────────────────
    const sameDateEvents = await Event.find({ date: eventDate });

    for (const existingEvent of sameDateEvents) {
      const existingVenue = existingEvent.venue.trim().toLowerCase();
      const existingDepts = existingEvent.targetDepartments || [];

      const venueClash = existingVenue === newVenue;
      if (!venueClash) continue;

      const newIsOpenForAll      = newDepts.includes("Open for All") || newDepts.length === 0;
      const existingIsOpenForAll = existingDepts.includes("Open for All") || existingDepts.length === 0;
      const departmentOverlap    = newDepts.some((dept) => existingDepts.includes(dept));
      const deptClash            = newIsOpenForAll || existingIsOpenForAll || departmentOverlap;

      if (venueClash && deptClash) {
        return res.status(400).json({
          success: false,
          message: `Scheduling clash detected! "${existingEvent.title}" is already scheduled at "${existingEvent.venue}" on this date for overlapping departments.`,
          clashWith: {
            id: existingEvent._id, title: existingEvent.title,
            venue: existingEvent.venue, date: existingEvent.date,
            targetDepartments: existingEvent.targetDepartments,
          },
        });
      }
    }

    const newEvent = await Event.create({
      title, description,
      date:              eventDate,
      venue,
      imageURL:          imageURL || "",
      targetDepartments: newDepts,
      targetYears:       cleanYears,
      status:            status || "upcoming",
      formLink:          formLink || "",
    });

    res.status(201).json({ success: true, message: "Event created successfully.", data: newEvent });

  } catch (error) {
    next(error);
  }
};

// ─── Student/Admin: Get Events ────────────────────────────────────────────────
const getEvents = async (req, res, next) => {
  try {
    const { department, year, role, _id: userId } = req.user;

    // ── Auto-mark past events as completed ────────────────────────────────────
    await Event.updateMany(
      { date: { $lt: new Date() }, status: "upcoming" },
      { $set: { status: "completed" } }
    );

    let events;

    if (role === "admin") {
      events = await Event.find().sort({ date: 1 });
      return res.status(200).json({ success: true, count: events.length, data: events });
    }

    events = await Event.find({
      $and: [
        {
          $or: [
            { targetDepartments: department },
            { targetDepartments: "Open for All" },
            { targetDepartments: { $size: 0 } },
          ],
        },
        {
          $or: [
            { targetYears: year },
            { targetYears: { $size: 0 } },
          ],
        },
      ],
    }).sort({ date: 1 });

    // ── Preserve _id explicitly so frontend select works correctly ────────────
    const eventsWithStatus = events.map(ev => {
      const obj = ev.toObject();
      return {
        ...obj,
        _id:          ev._id,
        isRegistered: ev.registeredStudents.some(
          id => id.toString() === userId.toString()
        ),
      };
    });

    res.status(200).json({ success: true, count: eventsWithStatus.length, data: eventsWithStatus });

  } catch (error) {
    next(error);
  }
};

// ─── Student: Get Single Event by ID ─────────────────────────────────────────
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "registeredStudents", "rollNumber department year"
    );
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// ─── Student: Register for an Event ──────────────────────────────────────────
const registerForEvent = async (req, res, next) => {
  try {
    const eventId   = req.params.id;
    const studentId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    if (event.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Registration is closed. This event has already been completed.",
      });
    }

    const alreadyRegistered = event.registeredStudents.some(
      (id) => id.toString() === studentId.toString()
    );
    if (alreadyRegistered) {
      return res.status(409).json({ success: false, message: "You have already registered for this event." });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { registeredStudents: studentId } },
      { new: true }
    );

    res.status(200).json({
      success:           true,
      message:           "Successfully registered for the event.",
      registrationCount: updatedEvent.registeredStudents.length,
    });

  } catch (error) {
    next(error);
  }
};

// ─── Admin: Get Registered Students for an Event ─────────────────────────────
const getRegistrations = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "registeredStudents", "rollNumber name department year"
    );
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    res.status(200).json({
      success: true,
      event:   { id: event._id, title: event.title },
      count:   event.registeredStudents.length,
      data:    event.registeredStudents,
    });

  } catch (error) {
    next(error);
  }
};

// ─── Admin: Update Event ──────────────────────────────────────────────────────
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Event updated successfully.", data: updatedEvent });

  } catch (error) {
    next(error);
  }
};

// ─── Admin: Delete Event ──────────────────────────────────────────────────────
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Event deleted successfully." });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent, getEvents, getEventById,
  registerForEvent, getRegistrations,
  updateEvent, deleteEvent,
};