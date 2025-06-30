// import React, { useState, useEffect, useRef, useCallback } from "react";
// import axios from "axios";
// import { api } from "../../api";
// import { Link } from "react-router-dom";

// export default function Home() {
//   const [notes, setNotes] = useState([]);
//   const [token, setToken] = useState("");
//   const [selectedNote, setSelectedNote] = useState(null);
//   const [summaries, setSummaries] = useState({});
//   const [loadingSummary, setLoadingSummary] = useState(false);

//   // New state for infinite scroll
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);

//   const observer = useRef();
//   const lastNoteElementRef = useCallback(
//     (node) => {
//       if (loadingMore) return;
//       if (observer.current) observer.current.disconnect();
//       observer.current = new IntersectionObserver((entries) => {
//         if (entries[0].isIntersecting && hasMore) {
//           setPage((prevPage) => prevPage + 1);
//         }
//       });
//       if (node) observer.current.observe(node);
//     },
//     [loadingMore, hasMore]
//   );

//   const getNotes = async (fetchToken, fetchPage) => {
//     setLoadingMore(true);
//     try {
//       const res = await axios.get(`${api}/api/notes?page=${fetchPage}`, {
//         headers: { Authorization: fetchToken },
//       });
//       setNotes((prevNotes) => {
//         // To prevent duplicates, we can use a Set of IDs
//         const existingIds = new Set(prevNotes.map(n => n._id));
//         const newNotes = res.data.filter(n => !existingIds.has(n._id));
//         return [...prevNotes, ...newNotes];
//       });
//       setHasMore(res.data.length > 0);
//     } catch (err) {
//         console.error("Failed to fetch notes", err);
//     } finally {
//         setLoadingMore(false);
//     }
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("tokenStore");
//     setToken(token);
//     if (token) {
//         setNotes([]); // Reset notes when token changes
//         setPage(1); // Reset page to 1
//         getNotes(token, 1);
//     }
//   }, []); // Assuming token doesn't change during the session. If it does, add token to dependency array.

//   useEffect(() => {
//     if (page > 1 && token) {
//       getNotes(token, page);
//     }
//   }, [page, token]);

//   const deleteNote = async (id) => {
//     try {
//       const confirmDelete = window.confirm(
//         "Are you sure you want to delete this note?"
//       );
//       if (!confirmDelete) return;

//       if (token) {
//         await axios.delete(`${api}/api/notes/${id}`, {
//           headers: { Authorization: token },
//         });
//         // Instead of refetching all, just remove the note from state
//         setNotes(notes.filter(note => note._id !== id));
//       }
//     } catch (error) {
//       window.location.href = "/";
//     }
//   };

//   const summarizeNote = async (note) => {
//     setLoadingSummary(true);
//     try {
//       const res = await axios.post(
//         `${api}/api/notes/${note._id}/summarize`,
//         { content: note.content },
//         { headers: { Authorization: token } }
//       );
//       setSummaries((prev) => ({
//         ...prev,
//         [note._id]: res.data.summary,
//       }));
//     } catch (err) {
//       console.error("Summarization failed", err);
//       alert("Failed to summarize note");
//     } finally {
//       setLoadingSummary(false);
//     }
//   };

//   const openPopup = (note) => {
//     setSelectedNote(note);
//     document.body.style.overflow = "hidden"; // lock scroll
//   };

//   const closePopup = () => {
//     setSelectedNote(null);
//     document.body.style.overflow = "auto"; // restore scroll
//   };

//   return (
//     <div className="note-wrapper">
//       {notes.map((note, index) => {
//         if (notes.length === index + 1) {
//           return (
//             <div
//               className="card"
//               key={note._id}
//               ref={lastNoteElementRef}
//             >
//               <div className="noteUpdated">
//                 {note.createdAt < note.updatedAt ? "Updated" : ""}
//               </div>
//               <h4 title={note.title}>{note.title}</h4>

//               <div className="text-wrapper">
//                 <p>{note.content}</p>
//               </div>
//               {(note.date || note.time) && (
//                 <p className="date">
//                   {note.date}
//                   {note.date && note.time ? " " : ""}
//                   {note.time}
//                 </p>
//               )}
//               <div className="card-footer">
//                 {note.name}
//                 <Link to={`edit/${note._id}`}>Edit</Link>
//                 <div onClick={() => deleteNote(note._id)}>
//                   <p>Delete</p>
//                 </div>
//                 <div onClick={() => openPopup(note)}>
//                   <p>Read More</p>
//                 </div>
//               </div>
//             </div>
//           );
//         } else {
//           return (
//             <div className="card" key={note._id}>
//               <div className="noteUpdated">
//                 {note.createdAt < note.updatedAt ? "Updated" : ""}
//               </div>
//               <h4 title={note.title}>{note.title}</h4>

//               <div className="text-wrapper">
//                 <p>{note.content}</p>
//               </div>
//               {(note.date || note.time) && (
//                 <p className="date">
//                   {note.date}
//                   {note.date && note.time ? " " : ""}
//                   {note.time}
//                 </p>
//               )}
//               <div className="card-footer">
//                 {note.name}
//                 <Link to={`edit/${note._id}`}>Edit</Link>
//                 <div onClick={() => deleteNote(note._id)}>
//                   <p>Delete</p>
//                 </div>
//                 <div onClick={() => openPopup(note)}>
//                   <p>Read More</p>
//                 </div>
//               </div>
//             </div>
//           );
//         }
//       })}

//     {loadingMore && <div className="loading-indicator">Loading more notes...</div>}


//       {selectedNote && (
//         <div className="popup-overlay" onClick={closePopup}>
//           <div
//             className="popup-content animated"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <h4>{selectedNote.title}</h4>
//             <p>
//               <strong>Content:</strong> {selectedNote.content}
//             </p>
//             {(selectedNote.date || selectedNote.time) && (
//               <p>
//                 <strong>Date:</strong> {selectedNote.date}
//                 {selectedNote.date && selectedNote.time ? " " : ""}
//                 {selectedNote.time}
//               </p>
//             )}
//             {selectedNote.name && (
//               <p>
//                 <strong>By:</strong> {selectedNote.name}
//               </p>
//             )}
//             {loadingSummary ? (
//               <div className="spinner"></div>
//             ) : summaries[selectedNote._id] ? (
//               <div className="summary">
//                 <strong>Summary:</strong>
//                 <p>{summaries[selectedNote._id]}</p>
//               </div>
//             ) : (
//               <button onClick={() => summarizeNote(selectedNote)}>
//                 Summarize
//               </button>
//             )}

//             <button className="closeBtn" onClick={closePopup}>
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }








// client/src/components/notes/Home.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { api } from "../../api";
import { Link } from "react-router-dom";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [token, setToken] = useState("");
  const [selectedNote, setSelectedNote] = useState(null); // For "Read More" popup
  const [summaries, setSummaries] = useState({}); // Stores summaries by note ID
  const [loadingSummary, setLoadingSummary] = useState(false);

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false); // True when search is active (typing or showing results)

  // --- Infinite Scroll State ---
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // True if more notes can be loaded
  const [loadingMore, setLoadingMore] = useState(false); // True when fetching more notes

  // --- Sorting State ---
  const [sortBy, setSortBy] = useState("updatedAt"); // Default sort by last updated
  const [sortOrder, setSortOrder] = useState("desc"); // Default sort order descending

  // --- NEW: Tag/Filter State ---
  const [allTags, setAllTags] = useState([]); // All unique tags for the current user
  const [selectedTag, setSelectedTag] = useState(""); // Tag currently selected for filtering

  // Ref for the Intersection Observer to detect when the last note is visible
  const observer = useRef();
  const lastNoteElementRef = useCallback(
    (node) => {
      // Don't trigger if already loading more or in search mode
      if (loadingMore || isSearching) return;
      if (observer.current) observer.current.disconnect(); // Disconnect previous observer

      observer.current = new IntersectionObserver((entries) => {
        // If the last element is intersecting and there are more notes to load
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1); // Increment page to load next batch
        }
      });
      if (node) observer.current.observe(node); // Observe the new last node
    },
    [loadingMore, hasMore, isSearching] // Dependencies for useCallback
  );

  // Function to fetch notes from the API
  const getNotes = async (fetchToken, fetchPage, currentSortBy, currentSortOrder, currentSelectedTag) => {
    setLoadingMore(true); // Set loading state
    try {
      let url = `${api}/api/notes?page=${fetchPage}&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`;
      if (currentSelectedTag) {
        url += `&tag=${encodeURIComponent(currentSelectedTag)}`; // Add tag filter, encode for URL
      }

      const res = await axios.get(url, {
        headers: { Authorization: fetchToken },
      });

      setNotes((prevNotes) => {
        // Create a Set of existing note IDs to prevent adding duplicates
        const existingIds = new Set(prevNotes.map(n => n._id));
        // Filter out any new notes that are already in the list
        const uniqueNewNotes = res.data.filter(n => !existingIds.has(n._id));
        return [...prevNotes, ...uniqueNewNotes]; // Append new unique notes
      });
      setHasMore(res.data.length > 0); // Update hasMore based on if data was returned
    } catch (err) {
      console.error("Failed to fetch notes:", err.response ? err.response.data.msg : err.message);
      // You might want to show an error message to the user here
    } finally {
      setLoadingMore(false); // Reset loading state
    }
  };

  // NEW: Function to fetch all unique tags for the current user
  const fetchAllTags = useCallback(async (fetchToken) => {
    try {
      const res = await axios.get(`${api}/api/notes/tags`, {
        headers: { Authorization: fetchToken },
      });
      setAllTags(res.data); // Set the unique tags
    } catch (err) {
      console.error("Failed to fetch tags:", err.response ? err.response.data.msg : err.message);
    }
  }, []); // Empty dependency array as fetchToken is available from parent scope via useEffect

  // Effect for initial load and when sorting/filtering criteria change
  useEffect(() => {
    const storedToken = localStorage.getItem("tokenStore");
    setToken(storedToken);

    if (storedToken) {
      setNotes([]); // Clear notes for a fresh fetch
      setPage(1); // Reset page to 1
      setHasMore(true); // Assume there's more data initially
      // Fetch notes with current sort, order, and tag filter
      getNotes(storedToken, 1, sortBy, sortOrder, selectedTag);
      // Fetch all unique tags for the filter dropdown
      fetchAllTags(storedToken);
    }
  }, [token, sortBy, sortOrder, selectedTag, fetchAllTags]); // Rerun when these dependencies change

  // Effect for infinite scroll pagination (when 'page' increments)
  useEffect(() => {
    if (page > 1 && token && !isSearching) {
      getNotes(token, page, sortBy, sortOrder, selectedTag);
    }
  }, [page, token, isSearching, sortBy, sortOrder, selectedTag]);

  // --- Debounced Search Effect ---
  // This effect runs whenever searchQuery or token changes, with a delay
  useEffect(() => {
    const fetchSearch = async () => {
      if (searchQuery.trim().length < 3) {
        setSearchResults([]); // Clear search results if query is too short
        setIsSearching(false); // Not actively searching
        return;
      }

      setIsSearching(true); // Indicate that a search is active
      try {
        const res = await axios.get(`${api}/api/notes/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: token },
        });
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search failed:", err.response ? err.response.data.msg : err.message);
        setSearchResults([]); // Clear results on error
      } finally {
        // Don't set isSearching to false here, as we want to keep search results displayed
        // We only set it to false when query is too short
      }
    };

    const handler = setTimeout(() => {
      fetchSearch();
    }, 500); // 500ms debounce time

    // Cleanup function: clear the timeout if the component unmounts or dependencies change before timeout fires
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, token]);


  const deleteNote = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to delete this note?")) return;
      if (!token) return;

      await axios.delete(`${api}/api/notes/${id}`, {
        headers: { Authorization: token },
      });
      // Filter out the deleted note from both main notes and search results
      setNotes(notes.filter(note => note._id !== id));
      setSearchResults(searchResults.filter(note => note._id !== id));
      fetchAllTags(token); // Re-fetch tags as a unique tag might have been removed
    } catch (error) {
      console.error("Failed to delete note:", error.response ? error.response.data.msg : error.message);
      alert("Failed to delete note.");
      // window.location.href = "/"; // Consider a more user-friendly error display than full page reload
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
    document.body.style.overflow = "hidden"; // Prevent background scroll
  };

  const closePopup = () => {
    setSelectedNote(null);
    document.body.style.overflow = "auto"; // Restore background scroll
  };

  // Handler for sorting option changes
  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split("_");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    // useEffect will trigger a re-fetch with new sorting
  };

  // Handler for tag filter changes
  const handleTagFilterChange = (e) => {
    setSelectedTag(e.target.value);
    // useEffect will trigger a re-fetch with new tag filter
  };

  // Determine which list of notes to display based on search state
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
            <option value="isPinned_desc">📌 Pinned First</option> {/* NEW */}
            <option value="isFavorite_desc">⭐ Favorites First</option> {/* NEW */}
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

        {/* NEW: Tag Filter Dropdown */}
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
          // Check if this is the last element to attach the ref for infinite scroll
          const isLastElement = notesToDisplay.length === index + 1;
          const ref = isLastElement && !isSearching ? lastNoteElementRef : null;

          return (
            <div
              className="card"
              key={note._id}
              ref={ref}
              style={{ backgroundColor: note.color }} // Apply color-coding to the card
              onClick={() => openPopup(note)} // Make the whole card clickable for popup
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

              {/* NEW: Display Tags on the card */}
              {note.tags && note.tags.length > 0 && (
                <div className="tags-display">
                  {/* Clicking a tag filters notes by that tag */}
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className="note-tag"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card onClick from firing
                        setSelectedTag(tag); // Set filter to this tag
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
                <Link to={`edit/${note._id}`} onClick={(e) => e.stopPropagation()}>Edit</Link> {/* Stop propagation to prevent popup */}
                <div onClick={(e) => { e.stopPropagation(); deleteNote(note._id); }}>
                  <p>Delete</p>
                </div>
                {/* Removed "Read More" button as the whole card is now clickable */}
              </div>
            </div>
          );
        })}

        {/* Loading indicators */}
        {loadingMore && !isSearching && <div className="loading-indicator spinner"></div>}
        {isSearching && searchQuery.trim().length >= 3 && searchResults.length === 0 && (
          <p className="no-notes-message">No search results found for "{searchQuery}".</p>
        )}


        {/* "Read More" Popup */}
        {selectedNote && (
          <div className="popup-overlay" onClick={closePopup}>
            <div
              className="popup-content animated"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              style={{ backgroundColor: selectedNote.color }} // Apply color to popup
            >
              <div className="popup-header-icons">
                {selectedNote.isPinned && <span className="icon-pin" title="Pinned">📌</span>}
                {selectedNote.isFavorite && <span className="icon-favorite" title="Favorite">⭐</span>}
                <h4>{selectedNote.title}</h4>
              </div>

              <p>
                <strong>Content:</strong> {selectedNote.content}
              </p>

              {/* NEW: Display Tags in popup */}
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

              {/* Summarize button/summary display */}
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