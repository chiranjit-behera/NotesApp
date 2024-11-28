import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

export default function CreateNote() {

  const currentDate = new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'); // Get current date in "ddmmyyyy" format
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Get current time in HH:mm format

  const [note, setNote] = useState({
    title: "",
    content: "",
    date: currentDate,
    time: currentTime,
  });
  const navigate = useNavigate();

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setNote({ ...note, [name]: value });
  };

  const createNote = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("tokenStore");
      if (token) {
        const { title, content, date, time } = note;
        const newNote = {
          title,
          content,
          date,
          time,
        };

        await axios.post(`${api}/api/notes`, newNote, {
          headers: { Authorization: token },
        });
        return navigate("/");
      }
    } catch (err) {
      window.location.href = "/";
    }
  };

  return (
    <div className="create-note">
      <h2>Create Note</h2>
      <form onSubmit={createNote}>
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
            type="text"
            value={note.content}
            id="content"
            name="content"
            required
            rows="10"
            onChange={onChangeInput}
          />
        </div>
        <label htmlFor="date">
          Date: {note.date} {note.time}{" "}
        </label>
        <div className="row">
          <input
            type="date"
            id="date"
            name="date"
            defaultValue={note.date}
            onChange={onChangeInput}
            required
          />
          <input
            type="time"
            id="time"
            name="time"
            defaultValue={note.time}
            onChange={onChangeInput}
            required
          />
        </div>

        <button type="submit">Save</button>
      </form>
    </div>
  );
}
