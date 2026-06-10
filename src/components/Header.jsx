import React from 'react'
import '../App.css'
import { NavLink, useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()

  return (
    <header className="app-header">
      <h1 className="app-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <span className="app-title-mark" aria-hidden="true">📚</span>
        <span className="app-title-text">
          <strong>북</strong>적<strong>Book</strong>적 <strong>Book</strong>카페
        </span>
      </h1>
      <nav className="header-nav">
        <NavLink to="/" className="nav-link">Home</NavLink>
        <NavLink to="/list" className="nav-link">List</NavLink>
        <NavLink to="/create" className="nav-link">Create</NavLink>
      </nav>
    </header>
  )
}

export default Header
