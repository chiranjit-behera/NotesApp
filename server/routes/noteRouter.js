// // server/routes/noteRouter.js
// const router = require('express').Router();
// const auth = require('../middleware/auth');
// const noteCtrl = require('../controllers/noteCtrl');

// // Move specific routes that could be misinterpreted as IDs BEFORE the /:id route
// router.route('/search') // This must come before /:id
//     .get(auth, noteCtrl.searchNotes);

// router.route('/tags') // THIS MUST COME BEFORE /:id
//     .get(auth, noteCtrl.getAllTags);

// router.route('/trash') // This also needs to come before /:id
//     .get(auth, noteCtrl.getTrashedNotes); // Get all notes in trash

// // New trash sub-routes should also be higher up if their first segment could be an ID
// router.route('/trash/:id/restore')
//     .put(auth, noteCtrl.restoreNote);

// router.route('/trash/:id/permanent')
//     .delete(auth, noteCtrl.permanentDeleteNote);


// // General routes for /api/notes
// router.route('/')
//     .get(auth, noteCtrl.getNotes)
//     .post(auth, noteCtrl.createNote);

// // This is the general /:id route, which should come last after all specific named routes
// router.route('/:id')
//     .get(auth, noteCtrl.getNote)
//     .put(auth, noteCtrl.updateNote)
//     .delete(auth, noteCtrl.deleteNote);

// router.route('/:id/summarize') // This specific route can stay after /:id as it has an extra segment
//     .post(auth, noteCtrl.summarizeNote);


// module.exports = router;



// server/routes/noteRouter.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const noteCtrl = require('../controllers/noteCtrl');

// Make sure more specific routes come before general ones like /:id
router.route('/search')
    .get(auth, noteCtrl.searchNotes);

router.route('/tags')
    .get(auth, noteCtrl.getAllTags);

router.route('/trash')
    .get(auth, noteCtrl.getTrashedNotes);

router.route('/trash/:id/restore')
    .put(auth, noteCtrl.restoreNote);

router.route('/trash/:id/permanent')
    .delete(auth, noteCtrl.permanentDeleteNote);

// --- OPTIONAL: Dedicated checklist item toggle route ---
router.route('/:noteId/checklist/:itemId/toggle') // Example route structure
    .put(auth, noteCtrl.toggleChecklistItem);

// General notes routes
router.route('/')
    .get(auth, noteCtrl.getNotes)
    .post(auth, noteCtrl.createNote);

router.route('/:id')
    .get(auth, noteCtrl.getNote)
    .put(auth, noteCtrl.updateNote)
    .delete(auth, noteCtrl.deleteNote);

router.route('/:id/summarize')
    .post(auth, noteCtrl.summarizeNote);

module.exports = router;