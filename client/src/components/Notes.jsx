import React from "react";
import Nav from "./notes/Nav";
import Home from "./notes/Home";
import CreateNote from "./notes/CreateNote";
import { Route, Routes } from "react-router-dom";
import EditNote from "./notes/EditNote";
import Trash from "./notes/Trash";

export default function Notes({ setIsLogin }) {
  return (
    <div className="notes-page">
      <Nav setIsLogin={setIsLogin} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateNote />} />
        <Route path="/edit/:id" element={<EditNote/>} />
        <Route path="/trash" element={<Trash />} /> {/* New Trash Route */}
      </Routes>
    </div>
  );
}
