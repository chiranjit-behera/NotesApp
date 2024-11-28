import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";

export default function EditNote({ match }) {
  const currentDate = new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'); // Get current date in "ddmmyyyy" format
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Get current time in HH:mm format

  const [note, setNote] = useState({
    title: "",
    content: "",
    date: currentDate,
    time: currentTime,
  });
  
  const navigate = useNavigate();
  const params = useParams();
  useEffect(() => {
    const getNote = async () => {
      const token = localStorage.getItem("tokenStore");
      if (params.id) {
        const res = await axios.get(`${api}/api/notes/${params.id}`, {
          headers: { Authorization: token },
        });
        setNote({
          title: res.data.title,
          content: res.data.content,
          date: new Date(res.data.date).toLocaleDateString(),
          time: res.data.time,
          id: res.data._id,
        });
      }
    };
    getNote();
  }, [params.id]);

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setNote({ ...note, [name]: value });
  };

  const editNote = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("tokenStore");
      if (token) {
        const { title, content, date, time, id } = note;
        const newNote = {
          title,
          content,
          date,
          time,
        };

        await axios.put(`${api}/api/notes/${id}`, newNote, {
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
          />
          <input
            type="time"
            id="time"
            name="time"
            defaultValue={note.time}
            onChange={onChangeInput}
          />
        </div>

        <button type="submit">Save</button>
      </form>
    </div>
  );
}
