const Notes = require("../models/noteModel");
const { GeminiClient } = require("../utils/geminiClient"); // Assuming this utility exists
const moment = require('moment'); // Import moment for date calculations

const noteCtrl = {
  getNotes: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 12;
      const skip = (page - 1) * limit;

      const sortBy = req.query.sortBy || "updatedAt";
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
      const filterTag = req.query.tag;

      const query = { user_id: req.user.id, isTrashed: false }; // Only get non-trashed notes

      if (filterTag && filterTag !== "") {
        query.tags = filterTag.toLowerCase();
      }

      let sort = { isPinned: -1 }; // Always prioritize pinned notes (true comes first)

      const validSortFields = ['updatedAt', 'createdAt', 'title', 'date', 'isFavorite'];
      if (validSortFields.includes(sortBy)) {
        sort[sortBy] = sortOrder;
      }

      const notes = await Notes.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      res.json(notes);
    } catch (err) {
      console.error("Error in getNotes:", err);
      return res.status(500).json({ msg: err.message });
    }
  },
  createNote: async (req, res) => {
    try {
      const { title, content, date, time, tags, isPinned, color, isFavorite, checklistItems } = req.body;

      if (!title || !content) {
        return res.status(400).json({ msg: "Please fill in all required fields." });
      }

      const newNote = new Notes({
        title,
        content,
        date: date || "",
        time: time || "",
        user_id: req.user?.id,
        name: req.user?.name,
        tags: tags || [],
        isPinned: isPinned || false,
        color: color || "rgb(138, 111, 25)",
        isFavorite: isFavorite || false,
        isTrashed: false, // Ensure new notes are not trashed
        trashedAt: null,
        checklistItems: checklistItems || []
      });

      await newNote.save();
      res.json({ msg: "Note created successfully!" });
    } catch (err) {
      console.error("Error in createNote:", err);
      return res.status(500).json({ msg: err.message });
    }
  },
  // Modified deleteNote to move to trash instead of permanent delete (used by frontend 'Delete' button)
  deleteNote: async (req, res) => {
    try {
      const note = await Notes.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user.id },
        // IMPORTANT: Set isTrashed to true and record trashedAt
        { isTrashed: true, trashedAt: new Date(), isPinned: false, isFavorite: false }, // Also unpin/unfavorite
        { new: true } // Return the updated document
      );

      if (!note) return res.status(404).json({ msg: "Note not found or you don't have permission." });
      res.json({ msg: "Note moved to trash successfully!" });
    } catch (err) {
      console.error("Error in deleteNote (to trash):", err);
      return res.status(500).json({ msg: err.message });
    }
  },
  updateNote: async (req, res) => {
    try {
      const { title, content, date, time, tags, isPinned, color, isFavorite, checklistItems } = req.body;

      if (!title || !content) {
        return res.status(400).json({ msg: "Title and content cannot be empty." });
      }

      const result = await Notes.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user.id, isTrashed: false }, // Only update if not in trash
        {
          title,
          content,
          date: date || "",
          time: time || "",
          tags: tags || [],
          isPinned: isPinned || false,
          color: color || "rgb(138, 111, 25)",
          isFavorite: isFavorite || false,
          checklistItems: checklistItems || []
        },
        { new: true }
      );

      if (!result) return res.status(404).json({ msg: "Note not found, in trash, or you don't have permission." });
      res.json({ msg: "Note updated successfully!" });
    } catch (err) {
      console.error("Error in updateNote:", err);
      return res.status(500).json({ msg: err.message });
    }
  },
  getNote: async (req, res) => {
    try {
      const note = await Notes.findOne({ _id: req.params.id, user_id: req.user.id }); // Can get a trashed note for viewing
      if (!note) return res.status(404).json({ msg: "Note not found or you don't have permission." });
      res.json(note);
    } catch (err) {
      console.error("Error in getNote:", err);
      return res.status(500).json({ msg: err.message });
    }
  },
  searchNotes: async (req, res) => {
    try {
      const { q } = req.query;
      const query = { user_id: req.user.id, isTrashed: false }; // Search only non-trashed notes

      if (!q || q.trim() === "") {
        const notes = await Notes.find(query).sort({ isPinned: -1, updatedAt: -1 });
        return res.json(notes);
      }

      const regex = new RegExp(q, "i");

      query.$or = [
        { title: regex },
        { content: regex },
        { tags: regex }
      ];

      const notes = await Notes.find(query).sort({ isPinned: -1, updatedAt: -1 });

      res.json(notes);
    } catch (err) {
      console.error("Error in searchNotes:", err);
      return res.status(500).json({ msg: err.message });
    }
  },
  summarizeNote: async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({ msg: "No content provided for summarization." });

      const summary = await GeminiClient.getSummary(content);
      res.json({ summary });
    } catch (err) {
      console.error("Summarization error:", err);
      return res.status(500).json({ msg: "Failed to summarize note." });
    }
  },
  getAllTags: async (req, res) => {
    try {
      // Only get tags from non-trashed notes for the main view
      const tags = await Notes.distinct('tags', { user_id: req.user.id, isTrashed: false });
      const cleanedTags = tags.filter(tag => tag && tag.trim() !== "");
      res.json(cleanedTags);
    } catch (err) {
      console.error("Error in getAllTags:", err);
      return res.status(500).json({ msg: err.message });
    }
  },
  toggleChecklistItem: async (req, res) => {
        try {
            const { noteId, itemId } = req.params;
            const { isCompleted } = req.body;

            const note = await Notes.findOne({ _id: noteId, user_id: req.user.id });
            if (!note) return res.status(404).json({ msg: "Note not found." });

            const item = note.checklistItems.id(itemId); // Mongoose helper to find subdocument by _id or id
            if (!item) return res.status(404).json({ msg: "Checklist item not found." });

            item.isCompleted = isCompleted; // Update the status

            await note.save(); // Save the parent document to persist changes to the subdocument
            res.json({ msg: "Checklist item toggled!", item });
        } catch (err) {
            console.error("Error in toggleChecklistItem:", err);
            return res.status(500).json({ msg: err.message });
        }
    },

  // --- NEW TRASH-RELATED CONTROLLERS ---

  // Get notes currently in trash
  getTrashedNotes: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 12;
      const skip = (page - 1) * limit;

      const notes = await Notes.find({ user_id: req.user.id, isTrashed: true })
        .sort({ trashedAt: -1 }) // Sort by when they were trashed (newest first)
        .skip(skip)
        .limit(limit);

      res.json(notes);
    } catch (err) {
      console.error("Error in getTrashedNotes:", err);
      return res.status(500).json({ msg: err.message });
    }
  },

  // Restore a note from trash
  restoreNote: async (req, res) => {
    try {
      const note = await Notes.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user.id, isTrashed: true },
        { isTrashed: false, trashedAt: null },
        { new: true }
      );

      if (!note) return res.status(404).json({ msg: "Note not found in trash or you don't have permission." });
      res.json({ msg: "Note restored successfully!" });
    } catch (err) {
      console.error("Error in restoreNote:", err);
      return res.status(500).json({ msg: err.message });
    }
  },

  // Permanently delete a note from trash
  permanentDeleteNote: async (req, res) => {
    try {
      const result = await Notes.findOneAndDelete({ _id: req.params.id, user_id: req.user.id, isTrashed: true });

      if (!result) return res.status(404).json({ msg: "Note not found in trash or you don't have permission." });
      res.json({ msg: "Note permanently deleted successfully!" });
    } catch (err) {
      console.error("Error in permanentDeleteNote:", err);
      return res.status(500).json({ msg: err.message });
    }
  },

  // NEW: Function for auto-deletion, callable by cron
  autoDeleteTrashedNotes: async () => {
    try {
        const thirtyDaysAgo = moment().subtract(30, 'days').toDate();

        const result = await Notes.deleteMany({
            isTrashed: true,
            trashedAt: { $lt: thirtyDaysAgo }
        });

        console.log(`[Scheduler] Auto-deleted ${result.deletedCount} notes from trash older than 30 days.`);
        return result.deletedCount;
    } catch (error) {
        console.error('[Scheduler] Error during auto-deletion of trashed notes:', error);
        throw error;
    }
  }
};

module.exports = noteCtrl;