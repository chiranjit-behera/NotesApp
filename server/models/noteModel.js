const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    // Content can now store HTML from a rich text editor
    content: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      trim: true
    },
    time: {
      type: String,
      trim: true
    },
    user_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
      set: (v) => Array.isArray(v) ? v.map(tag => tag.trim().toLowerCase()).filter(tag => tag) : []
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "#8A6F19", // Your specified default color
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isTrashed: {
      type: Boolean,
      default: false,
    },
    trashedAt: {
      type: Date,
      default: null, // Will be set when a note is moved to trash
    },
    checklistItems: [
        {
            id: { type: String, required: true }, // Using string for UUID or nanoid on frontend
            text: { type: String, required: true, trim: true },
            isCompleted: { type: Boolean, default: false }
        }
    ],
    // attachments: [
    //   {
    //     filename: { type: String, required: true },
    //     filepath: { type: String, required: true }, // URL or path to the stored file
    //     mimetype: { type: String, required: true }, // e.g., 'image/jpeg', 'application/pdf', 'audio/webm'
    //     size: { type: Number, default: 0 }, // File size in bytes
    //     uploadedAt: { type: Date, default: Date.now },
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notes", noteSchema);