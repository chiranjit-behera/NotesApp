// client/src/components/notes/Home.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { api } from "../../api";
import { Link } from "react-router-dom";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [token, setToken] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");

  const observer = useRef();
  const lastNoteElementRef = useCallback(
    (node) => {
      if (loadingMore || isSearching) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, isSearching]
  );

  const getNotes = async (fetchToken, fetchPage, currentSortBy, currentSortOrder, currentSelectedTag) => {
    setLoadingMore(true);
    try {
      let url = `${api}/api/notes?page=${fetchPage}&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`;
      if (currentSelectedTag) {
        url += `&tag=${encodeURIComponent(currentSelectedTag)}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: fetchToken },
      });

      setNotes((prevNotes) => {
        const existingIds = new Set(prevNotes.map(n => n._id));
        const uniqueNewNotes = res.data.filter(n => !existingIds.has(n._id));
        return [...prevNotes, ...uniqueNewNotes];
      });
      setHasMore(res.data.length > 0);
    } catch (err) {
      console.error("Failed to fetch notes:", err.response ? err.response.data.msg : err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchAllTags = useCallback(async (fetchToken) => {
    try {
      const res = await axios.get(`${api}/api/notes/tags`, {
        headers: { Authorization: fetchToken },
      });
      setAllTags(res.data);
    } catch (err) {
      console.error("Failed to fetch tags:", err.response ? err.response.data.msg : err.message);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("tokenStore");
    setToken(storedToken);

    if (storedToken) {
      setNotes([]);
      setPage(1);
      setHasMore(true);
      getNotes(storedToken, 1, sortBy, sortOrder, selectedTag);
      fetchAllTags(storedToken);
    }
  }, [token, sortBy, sortOrder, selectedTag, fetchAllTags]);

  useEffect(() => {
    if (page > 1 && token && !isSearching) {
      getNotes(token, page, sortBy, sortOrder, selectedTag);
    }
  }, [page, token, isSearching, sortBy, sortOrder, selectedTag]);

  useEffect(() => {
    const fetchSearch = async () => {
      if (searchQuery.trim().length < 3) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await axios.get(`${api}/api/notes/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: token },
        });
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search failed:", err.response ? err.response.data.msg : err.message);
        setSearchResults([]);
      }
    };

    const handler = setTimeout(() => {
      fetchSearch();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, token]);

  // Modified deleteNote to move to trash
  const deleteNote = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to move this note to trash?")) return;
      if (!token) return;

      // Ensure this makes a DELETE request to the /api/notes/:id endpoint
      // which your backend's noteRouter is configured to move to trash
      await axios.delete(`${api}/api/notes/${id}`, {
        headers: { Authorization: token },
      });
      setNotes(notes.filter(note => note._id !== id)); // Remove from current view
      setSearchResults(searchResults.filter(note => note._id !== id));
      fetchAllTags(token); // Re-fetch tags as a unique tag might have been removed
    } catch (error) {
      console.error("Failed to move note to trash:", error.response ? error.response.data.msg : error.message);
      alert("Failed to move note to trash.");
    }
  };

  const summarizeNote = async (note) => {
    setLoadingSummary(true);
    try {
      const res = await axios.post(
        `${api}/api/notes/${note._id}/summarize`,
        { content: note.content },
        { headers: { Authorization: token } }
      );
      setSummaries((prev) => ({
        ...prev,
        [note._id]: res.data.summary,
      }));
    } catch (err) {
      console.error("Summarization failed:", err.response ? err.response.data.msg : err.message);
      alert("Failed to summarize note. Please try again.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const openPopup = (note) => {
    setSelectedNote(note);
    document.body.style.overflow = "hidden";
  };

  const closePopup = () => {
    setSelectedNote(null);
    document.body.style.overflow = "auto";
  };

  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split("_");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleTagFilterChange = (e) => {
    setSelectedTag(e.target.value);
  };

  const notesToDisplay = searchQuery.trim().length >= 3 && isSearching ? searchResults : notes;

  return (
    <>
      <div className="controls-bar">
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes (title, content, tags)..."
            aria-label="Search notes"
          />
        </div>

        <div className="sort-options">
          <label htmlFor="sort">Sort by:</label>
          <select id="sort" onChange={handleSortChange} value={`${sortBy}_${sortOrder}`}>
            <option value="isFavorite_desc">⭐ Favorites First</option>
            <option value="updatedAt_desc">Last Updated (Newest)</option>
            <option value="updatedAt_asc">Last Updated (Oldest)</option>
            <option value="createdAt_desc">Creation Date (Newest)</option>
            <option value="createdAt_asc">Creation Date (Oldest)</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
            <option value="date_desc">Note Date (Newest)</option>
            <option value="date_asc">Note Date (Oldest)</option>
          </select>
        </div>

        <div className="tag-filter-options">
          <label htmlFor="tagFilter">Filter by Tag:</label>
          <select id="tagFilter" onChange={handleTagFilterChange} value={selectedTag}>
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="note-wrapper">
        {notesToDisplay.length === 0 && !loadingMore && !isSearching ? (
          <p className="no-notes-message">
            {selectedTag ? `No notes found with tag "${selectedTag}".` : "No notes available. Start by creating one!"}
          </p>
        ) : notesToDisplay.map((note, index) => {
          const isLastElement = notesToDisplay.length === index + 1;
          const ref = isLastElement && !isSearching ? lastNoteElementRef : null;

          return (
            <div
              className="card"
              key={note._id}
              ref={ref}
              style={{ backgroundColor: note.color }}
              onClick={() => openPopup(note)}
            >
              <div className="note-header-icons">
                {note.isPinned && <span className="icon-pin" title="Pinned">📌</span>}
                {note.isFavorite && <span className="icon-favorite" title="Favorite">⭐</span>}
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
                    <span
                      key={tag}
                      className="note-tag"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTag(tag);
                      }}
                    >
                      {tag}
                    </span>
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
              <div className="card-footer">
                <span>{note.name}</span>
                <Link to={`edit/${note._id}`} onClick={(e) => e.stopPropagation()}>Edit</Link>
                {/* Ensure this click handler calls the correct deleteNote function */}
                <div onClick={(e) => { e.stopPropagation(); deleteNote(note._id); }}>
                  <p>Trash</p> {/* Changed from Delete to Trash */}
                </div>
              </div>
            </div>
          );
        })}

        {loadingMore && !isSearching && <div className="loading-indicator spinner"></div>}
        {isSearching && searchQuery.trim().length >= 3 && searchResults.length === 0 && (
          <p className="no-notes-message">No search results found for "{searchQuery}".</p>
        )}

        {selectedNote && (
          <div className="popup-overlay" onClick={closePopup}>
            <div
              className="popup-content animated"
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: selectedNote.color }}
            >
              <div className="popup-header-icons">
                {selectedNote.isPinned && <span className="icon-pin" title="Pinned">📌</span>}
                {selectedNote.isFavorite && <span className="icon-favorite" title="Favorite">⭐</span>}
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

              {loadingSummary ? (
                <div className="spinner"></div>
              ) : summaries[selectedNote._id] ? (
                <div className="summary">
                  <strong>Summary:</strong>
                  <p>{summaries[selectedNote._id]}</p>
                </div>
              ) : (
                <button onClick={() => summarizeNote(selectedNote)}>
                  Summarize
                </button>
              )}

              <button className="closeBtn" onClick={closePopup}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}