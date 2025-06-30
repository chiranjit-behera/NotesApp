// server/controllers/noteCtrl.js
const Notes = require("../models/noteModel");
const { GeminiClient } = require("../utils/geminiClient"); // Assuming this utility exists

const noteCtrl = {
  getNotes: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 12; // Number of notes per page
      const skip = (page - 1) * limit;

      const sortBy = req.query.sortBy || "updatedAt";
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1; // 1 for asc, -1 for desc
      const filterTag = req.query.tag; // Get tag from query parameter

      const query = { user_id: req.user.id }; // Always filter by current user

      // If a specific tag is provided, add it to the query
      if (filterTag && filterTag !== "") { // Check for non-empty tag
        query.tags = filterTag.toLowerCase(); // Ensure tag matches lowercase in DB
      }

      // Construct the sort object dynamically with pinning/favoriting priority
      let sort = {};
      if (sortBy === "isPinned") {
        sort = { isPinned: sortOrder, updatedAt: -1 }; // Pinned notes first, then by updated date
      } else if (sortBy === "isFavorite") {
        sort = { isFavorite: sortOrder, updatedAt: -1 }; // Favorite notes first, then by updated date
      } else {
        sort[sortBy] = sortOrder; // Apply standard sort
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
      const { title, content, date, time, tags, isPinned, color, isFavorite } = req.body;

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
        color: color || "rgb(138, 111, 25)", // <--- UPDATED DEFAULT COLOR
        isFavorite: isFavorite || false,
      });

      await newNote.save();
      res.json({ msg: "Note created successfully!" });
    } catch (err) {
      console.error("Error in createNote:", err);
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteNote: async (req, res) => {
    try {
      const result = await Notes.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
      if (!result) return res.status(404).json({ msg: "Note not found or you don't have permission." });
      res.json({ msg: "Note deleted successfully!" });
    } catch (err) {
      console.error("Error in deleteNote:", err);
      return res.status(500).json({ msg: err.message });
    }
  },
  updateNote: async (req, res) => {
    try {
      const { title, content, date, time, tags, isPinned, color, isFavorite } = req.body;

      if (!title || !content) {
        return res.status(400).json({ msg: "Title and content cannot be empty." });
      }

      const result = await Notes.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user.id },
        {
          title,
          content,
          date: date || "",
          time: time || "",
          tags: tags || [],
          isPinned: isPinned || false,
          color: color || "rgb(138, 111, 25)", // <--- UPDATED DEFAULT COLOR
          isFavorite: isFavorite || false,
        },
        { new: true }
      );

      if (!result) return res.status(404).json({ msg: "Note not found or you don't have permission." });
      res.json({ msg: "Note updated successfully!" });
    } catch (err) {
      console.error("Error in updateNote:", err);
      return res.status(500).json({ msg: err.message });
    }
  },
  getNote: async (req, res) => {
    try {
      const note = await Notes.findOne({ _id: req.params.id, user_id: req.user.id });
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
      if (!q || q.trim() === "") {
        // If search query is empty, return all notes for the user
        const notes = await Notes.find({ user_id: req.user.id }).sort({ updatedAt: -1 });
        return res.json(notes);
      }

      const regex = new RegExp(q, "i"); // Case-insensitive search

      const notes = await Notes.find({
        user_id: req.user.id,
        $or: [
          { title: regex },
          { content: regex },
          { tags: regex } // Search within the tags array
        ]
      }).sort({ updatedAt: -1 }); // Keep some default sort for search results

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

      const summary = await GeminiClient.getSummary(content); // Call your Gemini utility
      res.json({ summary });
    } catch (err) {
      console.error("Summarization error:", err);
      return res.status(500).json({ msg: "Failed to summarize note." });
    }
  },
  // NEW: Get all unique tags for a specific user
  getAllTags: async (req, res) => {
    try {
      // Use .distinct() to get unique values from the 'tags' array
      // for documents matching the user_id.
      const tags = await Notes.distinct('tags', { user_id: req.user.id });
      // Filter out any empty strings that might have snuck in, though setter should handle this.
      const cleanedTags = tags.filter(tag => tag && tag.trim() !== "");
      res.json(cleanedTags);
    } catch (err) {
      console.error("Error in getAllTags:", err);
      return res.status(500).json({ msg: err.message });
    }
  }
};

module.exports = noteCtrl;