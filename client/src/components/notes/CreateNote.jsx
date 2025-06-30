// client/src/components/notes/CreateNote.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

export default function CreateNote() {
  const [note, setNote] = useState({
    title: "",
    content: "",
    date: "",
    time: "",
    tags: "", // NEW: Store as a comma-separated string for input
    isPinned: false, // NEW: Checkbox state
    color: "rgb(138, 111, 25)", // NEW: Color input state, default light beige
    isFavorite: false, // NEW: Checkbox state
  });

  const navigate = useNavigate();

  const onChangeInput = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle checkboxes differently
    if (type === "checkbox") {
      setNote({ ...note, [name]: checked });
    } else {
      setNote({ ...note, [name]: value });
    }
  };

  const createNote = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("tokenStore");
      if (!token) return navigate("/"); // Redirect if no token

      // Prepare the note object for the API
      const newNoteData = {
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

      await axios.post(`${api}/api/notes`, newNoteData, {
        headers: { Authorization: token },
      });

      navigate("/"); // Redirect to home on success
    } catch (err) {
      console.error("Create Note error:", err.response ? err.response.data.msg : err.message);
      alert(err.response ? err.response.data.msg : "Failed to create note."); // Show error to user
      // No need for window.location.href, navigate is better
    }
  };

  return (
    <div className="create-note">
      <h2>Create Note</h2>
      <form onSubmit={createNote} autoComplete="off">
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

        <button type="submit">Save Note</button>
      </form>
    </div>
  );
}