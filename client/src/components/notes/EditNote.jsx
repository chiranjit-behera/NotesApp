// client/src/components/notes/EditNote.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";

export default function EditNote() {
  const [note, setNote] = useState({
    title: "",
    content: "",
    date: "",
    time: "",
    tags: "", // NEW: Store as comma-separated string for input
    isPinned: false, // NEW
    color: "rgb(138, 111, 25)", // NEW
    isFavorite: false, // NEW
    id: "", // Note ID
  });

  const navigate = useNavigate();
  const params = useParams(); // Hook to get URL parameters

  useEffect(() => {
    const getNote = async () => {
      const token = localStorage.getItem("tokenStore");
      if (!token) {
        navigate("/"); // Redirect if no token
        return;
      }

      if (params.id) {
        try {
          const res = await axios.get(`${api}/api/notes/${params.id}`, {
            headers: { Authorization: token },
          });
          setNote({
            title: res.data.title,
            content: res.data.content,
            // Format date for input[type="date"] (YYYY-MM-DD)
            date: res.data.date || "",
            time: res.data.time || "",
            // Convert tags array back to comma-separated string for display in input
            tags: res.data.tags ? res.data.tags.join(', ') : '',
            isPinned: res.data.isPinned || false,
            color: res.data.color || "#FDF5E6",
            isFavorite: res.data.isFavorite || false,
            id: res.data._id,
          });
        } catch (err) {
          console.error("Failed to fetch note for edit:", err.response ? err.response.data.msg : err.message);
          alert("Failed to load note for editing.");
          navigate("/"); // Redirect on error fetching note
        }
      }
    };
    getNote();
  }, [params.id, navigate]); // Add navigate to dependencies

  const onChangeInput = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle checkboxes differently
    if (type === "checkbox") {
      setNote({ ...note, [name]: checked });
    } else {
      setNote({ ...note, [name]: value });
    }
  };

  const editNote = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("tokenStore");
      if (!token) return navigate("/"); // Redirect if no token

      // Prepare the note object for the API
      const updatedNoteData = {
        title: note.title,
        content: note.content,
        date: note.date,
        time: note.time,
        // Convert comma-separated tags string to an array of trimmed, lowercase tags
        tags: note.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag !== ''),
        isPinned: note.isPinned,
        color: note.color,
        isFavorite: note.isFavorite,
      };

      await axios.put(`${api}/api/notes/${note.id}`, updatedNoteData, {
        headers: { Authorization: token },
      });

      navigate("/"); // Redirect to home on success
    } catch (err) {
      console.error("Edit Note error:", err.response ? err.response.data.msg : err.message);
      alert(err.response ? err.response.data.msg : "Failed to update note."); // Show error to user
    }
  };

  return (
    <div className="create-note">
      <h2>Edit Note</h2>
      <form onSubmit={editNote} autoComplete="off">
        <div className="row">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            value={note.title}
            id="title"
            name="title"
            required
            onChange={onChangeInput}
          />
        </div>

        <div className="row">
          <label htmlFor="content">Content</label>
          <textarea
            value={note.content}
            id="content"
            name="content"
            required
            rows="10"
            onChange={onChangeInput}
          />
        </div>

        {/* NEW: Tags Input */}
        <div className="row">
          <label htmlFor="tags">Tags (comma-separated, e.g., work, personal, idea)</label>
          <input
            type="text"
            value={note.tags}
            id="tags"
            name="tags"
            onChange={onChangeInput}
            placeholder="Add tags like: todo, project, urgent"
          />
        </div>

        <div className="row">
          <label htmlFor="date">Date (optional)</label>
          <input
            type="date"
            id="date"
            name="date"
            value={note.date}
            onChange={onChangeInput}
          />
        </div>

        <div className="row">
          <label htmlFor="time">Time (optional)</label>
          <input
            type="time"
            id="time"
            name="time"
            value={note.time}
            onChange={onChangeInput}
          />
        </div>

        {/* NEW: Pin, Favorite, Color Controls */}
        <div className="row checkbox-row">
          <label htmlFor="isPinned">
            <input
              type="checkbox"
              id="isPinned"
              name="isPinned"
              checked={note.isPinned}
              onChange={onChangeInput}
            />
            Pin Note 📌
          </label>
        </div>

        <div className="row checkbox-row">
          <label htmlFor="isFavorite">
            <input
              type="checkbox"
              id="isFavorite"
              name="isFavorite"
              checked={note.isFavorite}
              onChange={onChangeInput}
            />
            Favorite Note ⭐
          </label>
        </div>

        <div className="row color-picker-row">
          <label htmlFor="color">Note Color:</label>
          <input
            type="color"
            id="color"
            name="color"
            value={note.color}
            onChange={onChangeInput}
          />
          <span style={{ backgroundColor: note.color, width: '20px', height: '20px', display: 'inline-block', borderRadius: '4px', border: '1px solid #555', marginLeft: '10px' }}></span>
        </div>

        <button type="submit">Update Note</button>
      </form>
    </div>
  );
}





// // With Auto-Save
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useNavigate, useParams } from "react-router-dom";
// import { api } from "../../api";

// export default function EditNote() {
//   const [note, setNote] = useState({
//     title: "",
//     content: "",
//     date: "",
//     time: "",
//   });

//   const navigate = useNavigate();
//   const params = useParams();
//   const autoSaveTimer = useRef(null);

//   useEffect(() => {
//     const getNote = async () => {
//       const token = localStorage.getItem("tokenStore");
//       if (params.id && token) {
//         const res = await axios.get(`${api}/api/notes/${params.id}`, {
//           headers: { Authorization: token },
//         });
//         setNote({
//           title: res.data.title,
//           content: res.data.content,
//           date: new Date(res.data.date).toLocaleDateString(),
//           time: res.data.time,
//           id: res.data._id,
//         });
//       }
//     };
//     getNote();
//   }, [params.id]);

//   const saveNote = async () => {
//     try {
//       const token = localStorage.getItem("tokenStore");
//       if (token && note.id) {
//         const { title, content, date, time, id } = note;
//         const newNote = { title, content, date, time };
//         await axios.put(`${api}/api/notes/${id}`, newNote, {
//           headers: { Authorization: token },
//         });
//         console.log("Auto-saved");
//       }
//     } catch (err) {
//       console.error("Auto-save failed", err);
//     }
//   };

//   const onChangeInput = (e) => {
//     const { name, value } = e.target;
//     setNote((prev) => ({ ...prev, [name]: value }));

//     // Clear existing timer
//     if (autoSaveTimer.current) {
//       clearTimeout(autoSaveTimer.current);
//     }

//     // Set new timer (1.5 sec debounce)
//     autoSaveTimer.current = setTimeout(() => {
//       saveNote();
//     }, 2500);
//   };

//   const editNote = async (e) => {
//     e.preventDefault();
//     if (autoSaveTimer.current) {
//       clearTimeout(autoSaveTimer.current); // Cancel pending auto-save
//     }
//     await saveNote(); // Ensure save on manual submit
//     navigate("/");
//   };

//   return (
//     <div className="create-note">
//       <h2>Edit Note</h2>
//       <form onSubmit={editNote} autoComplete="off">
//         <div className="row">
//           <label htmlFor="title">Title</label>
//           <input
//             type="text"
//             value={note.title}
//             id="title"
//             name="title"
//             required
//             onChange={onChangeInput}
//           />
//         </div>

//         <div className="row">
//           <label htmlFor="content">Content</label>
//           <textarea
//             value={note.content}
//             id="content"
//             name="content"
//             required
//             rows="10"
//             onChange={onChangeInput}
//           />
//         </div>

//         <label>
//           Date: {note.date} {note.time}
//         </label>
//         <div className="row">
//           <input
//             type="date"
//             id="date"
//             name="date"
//             value={note.date}
//             onChange={onChangeInput}
//           />
//           <input
//             type="time"
//             id="time"
//             name="time"
//             value={note.time}
//             onChange={onChangeInput}
//           />
//         </div>

//         <button type="submit">Save</button>
//       </form>
//     </div>
//   );
// }
