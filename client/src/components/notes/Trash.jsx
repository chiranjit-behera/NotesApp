// client/src/components/notes/Trash.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { api } from "../../api";

export default function Trash() {
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [token, setToken] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null); // For "Read More" popup

  const observer = useRef();
  const lastNoteElementRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore]
  );

  const getTrashedNotes = async (fetchToken, fetchPage) => {
    setLoadingMore(true);
    try {
      const res = await axios.get(`${api}/api/notes/trash?page=${fetchPage}`, {
        headers: { Authorization: fetchToken },
      });
      setTrashedNotes((prevNotes) => {
        const existingIds = new Set(prevNotes.map(n => n._id));
        const uniqueNewNotes = res.data.filter(n => !existingIds.has(n._id));
        return [...prevNotes, ...uniqueNewNotes];
      });
      setHasMore(res.data.length > 0);
    } catch (err) {
      console.error("Failed to fetch trashed notes", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("tokenStore");
    setToken(storedToken);
    if (storedToken) {
      setTrashedNotes([]); // Reset notes when token changes
      setPage(1); // Reset page to 1
      setHasMore(true);
      getTrashedNotes(storedToken, 1);
    }
  }, []);

  useEffect(() => {
    if (page > 1 && token) {
      getTrashedNotes(token, page);
    }
  }, [page, token]);

  const restoreNote = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to restore this note?")) return;
      if (token) {
        await axios.put(`${api}/api/notes/trash/${id}/restore`, {}, {
          headers: { Authorization: token },
        });
        setTrashedNotes(trashedNotes.filter(note => note._id !== id));
      }
    } catch (error) {
      console.error("Failed to restore note:", error);
      alert("Failed to restore note.");
    }
  };

  const permanentDeleteNote = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to permanently delete this note? This action cannot be undone.")) return;
      if (token) {
        await axios.delete(`${api}/api/notes/trash/${id}/permanent`, {
          headers: { Authorization: token },
        });
        setTrashedNotes(trashedNotes.filter(note => note._id !== id));
      }
    } catch (error) {
      console.error("Failed to permanently delete note:", error);
      alert("Failed to permanently delete note.");
    }
  };

  const openPopup = (note) => {
    setSelectedNote(note);
    document.body.style.overflow = "hidden"; // Prevent background scroll
  };

  const closePopup = () => {
    setSelectedNote(null);
    document.body.style.overflow = "auto"; // Restore background scroll
  };


  return (
    <div >
      <div className="note-wrapper">
        <h2 className="trash-header">Trash <span role="img" aria-label="trash">🗑️</span></h2>
        <p className="trash-info">Notes in trash are automatically deleted after 30 days.</p>
      </div>
      <div className="note-wrapper">
        {trashedNotes.length === 0 && !loadingMore ? (
          <p className="no-notes-message">No notes in trash.</p>
        ) : (
          trashedNotes.map((note, index) => {
            const isLastElement = trashedNotes.length === index + 1;
            const ref = isLastElement ? lastNoteElementRef : null;

            const trashedDate = note.trashedAt ? new Date(note.trashedAt) : null;
            const deleteDate = trashedDate ? new Date(trashedDate.getTime() + 30 * 24 * 60 * 60 * 1000) : null; // 30 days later

            return (
              <div
                className="card"
                key={note._id}
                ref={ref}
                style={{ backgroundColor: note.color }}
                onClick={() => openPopup(note)}
              >
                <div className="note-header-icons">
                  {/* No pins/favorites in trash view */}
                  <div className="noteUpdated">
                    {note.createdAt < note.updatedAt ? "Updated" : ""}
                  </div>
                </div>

                <h4 title={note.title}>{note.title}</h4>
                

                <div className="text-wrapper">
                  <p>{note.content}</p>
                </div>

                {note.tags && note.tags.length > 0 && (
                  <div className="tags-display">
                    {note.tags.map(tag => (
                      <span key={tag} className="note-tag">{tag}</span>
                    ))}
                  </div>
                )}

                {(note.date || note.time) && (
                  <p className="date">
                    {note.date}
                    {note.date && note.time ? " " : ""}
                    {note.time}
                  </p>
                )}
                {trashedDate && (
                  <p className="trashed-date">
                    Trashed: {trashedDate.toLocaleDateString()}
                  </p>
                )}
                {deleteDate && (
                  <p className="delete-in-info">
                    Deletes on: {deleteDate.toLocaleDateString()}
                  </p>
                )}

                <div className="card-footer trash-footer">
                  <button onClick={(e) => { e.stopPropagation(); restoreNote(note._id); }}>
                    Restore
                  </button>
                  <button className="delete-permanent-btn" onClick={(e) => { e.stopPropagation(); permanentDeleteNote(note._id); }}>
                    Delete Permanently
                  </button>
                </div>
              </div>
            );
          })
        )}

        {loadingMore && <div className="loading-indicator spinner"></div>}

        {/* "Read More" Popup (similar to Home.js) */}
        {selectedNote && (
          <div className="popup-overlay" onClick={closePopup}>
            <div
              className="popup-content animated"
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: selectedNote.color }}
            >
              <div className="popup-header-icons">
                <h4>{selectedNote.title}</h4>
              </div>

              <p>
                <strong>Content:</strong> {selectedNote.content}
              </p>

              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="tags-display">
                  <strong>Tags:</strong>
                  {selectedNote.tags.map(tag => (
                    <span key={tag} className="note-tag">{tag}</span>
                  ))}
                </div>
              )}

              {(selectedNote.date || selectedNote.time) && (
                <p>
                  <strong>Date:</strong> {selectedNote.date}
                  {selectedNote.date && selectedNote.time ? " " : ""}
                  {selectedNote.time}
                </p>
              )}
              {selectedNote.name && (
                <p>
                  <strong>By:</strong> {selectedNote.name}
                </p>
              )}

              {selectedNote.trashedAt && (
                <p>
                  <strong>Trashed On:</strong> {new Date(selectedNote.trashedAt).toLocaleDateString()}
                </p>
              )}

              {/* No summarization in trash popup, but you can add if needed */}

              <button className="closeBtn" onClick={closePopup}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}