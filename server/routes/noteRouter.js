// server/routes/noteRoute.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const noteCtrl = require("../controllers/noteCtrl");

router.route("/")
  .get(auth, noteCtrl.getNotes) // Get all notes (with potential filtering/sorting)
  .post(auth, noteCtrl.createNote); // Create a new note

router.route("/search")
  .get(auth, noteCtrl.searchNotes); // Search notes

router.route("/tags")
  .get(auth, noteCtrl.getAllTags); // NEW: Get all unique tags for the user

router.route("/:id")
  .get(auth, noteCtrl.getNote) // Get a single note
  .put(auth, noteCtrl.updateNote) // Update a note
  .delete(auth, noteCtrl.deleteNote); // Delete a note

router.route("/:id/summarize")
  .post(auth, noteCtrl.summarizeNote); // Summarize a note

module.exports = router;