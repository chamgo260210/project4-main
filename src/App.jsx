import React, { useEffect, useState, useCallback } from 'react'
import './App.css'
import List from './views/List'
import Header from './components/Header'
import Lower from './components/Lower'
import { Routes, Route, useNavigate } from 'react-router-dom'

import Home from './views/Home'
import Create from './views/Create'
import Update from './views/Update'

function App() {
  const [query, setQuery] = useState('')
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isLast, setIsLast] = useState(false)
  const [sortBy, setSortBy] = useState('createdAt') // [추가]

  const navigate = useNavigate()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  const bookURL = `${API_BASE_URL}/api/v1/books`

  // 백엔드의 이미지 디렉토리 연결
  const resolveImageUrl = (url) => {
  if (!url || !url.trim()) return null
  if (url.startsWith('/uploads/')) return `${API_BASE_URL}${url}`
  return url
  }

  // [수정] sort 인자를 받도록 변경
  const fetchPage = useCallback(async (pageNum, sortOption = sortBy) => {
    if (loading || (pageNum > 0 && isLast)) return
    setLoading(true)

    try {
      const res = await fetch(`${bookURL}/page?page=${pageNum}&size=8&sortBy=${sortOption}`)
      if (!res.ok) { throw new Error('도서 목록을 불러오지 못했습니다.') }
      const data = await res.json()
      
      setBooks(prev => pageNum === 0 ? data.content : [...prev, ...data.content])
      setIsLast(data.last)
      setPage(data.number + 1)
    } catch (err) {
      console.error(err)
      setError('데이터를 불러오지 못했어요.')
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [loading, isLast, bookURL, sortBy])

  useEffect(() => {
    fetchPage(0)
  }, [])

  // [추가] 정렬 변경 핸들러
  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    setPage(0)
    setBooks([])
    fetchPage(0, newSort)
  }

  const handleAddBook = async (newBook) => {
    try {
      const res = await fetch(bookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook),
      })
      if (!res.ok) throw new Error('도서 등록에 실패했습니다.')
      const saved = await res.json()
      setBooks((prevBooks) => [saved, ...prevBooks])
      alert('도서가 등록되었습니다.')
      navigate('/list')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      alert('도서 등록에 실패했습니다.')
    } finally {
      await fetchPage(0)
    }
  }

  const handleUpdateBook = async (id, updatedFields) => {
    try {
      const res = await fetch(`${bookURL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      })
      if (!res.ok) throw new Error('도서 수정에 실패했습니다.')
      const updated = await res.json()
      setBooks((prevBooks) => prevBooks.map((book) => String(book.id) === String(id) ? updated : book))
      alert('도서가 수정되었습니다.')
      navigate('/list')
    } catch (err) {
      alert('도서가 수정에 실패했습니다.')
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${bookURL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      setBooks((prevBooks) => prevBooks.filter((b) => String(b.id) !== String(id)));
      alert('도서를 삭제했습니다');
    } catch (err) {
      alert('도서 삭제에 실패했습니다');
    } finally {
      await fetchPage(0)
    }
  }

  const handleLike = async (id) => {
    try {
      const res = await fetch(`${bookURL}/${id}/likes`, { method: 'PATCH' })
      if (!res.ok) throw new Error('좋아요 처리에 실패했습니다.')
      const updated = await res.json()
      setBooks((prevBooks) => prevBooks.map((book) => String(book.id) === String(id) ? updated : book))
    } catch (err) {
      console.error(err)
    }
  }

  const handleView = async (id) => {
    try {
      const res = await fetch(`${bookURL}/${id}/views`, { method: 'PATCH' })
      if (!res.ok) throw new Error('조회수 처리에 실패했습니다.')
      const updated = await res.json()
      setBooks((prevBooks) => prevBooks.map((book) => String(book.id) === String(id) ? updated : book))
    } catch (err) {
      console.error(err)
    }
  }

  if (initialLoading) return (<><Header /><main className="app-main"><p>불러오는 중...</p></main><Lower /></>)
  if (error) return (<><Header /><main className="app-main"><p>에러: {error}</p></main><Lower /></>)

  return (
    <div className="app-root">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home books={books} />} />
          <Route path="/list" element={
            <>
              <div className="list-search-area">
                <label className="list-search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    aria-label="search"
                    className="list-search-input"
                    placeholder="책 제목 또는 작가로 검색"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              <List 
                query={query} 
                books={books} 
                onDelete={handleDelete} 
                loading={loading} 
                isLast={isLast} 
                onLoadMore={() => fetchPage(page)} 
                onLike={handleLike} 
                onView={handleView}
                onSortChange={handleSortChange} // [연결 완료]
                resolveImageUrl={resolveImageUrl}
              />
            </>
          } />
          <Route path="/create" element={<Create onCreate={handleAddBook}/>} />
          <Route path="/update/:id" element={<Update bookURL={bookURL} onUpdate={handleUpdateBook} resolveImageUrl={resolveImageUrl}/>} />
        </Routes>
      </main>
      <Lower />
    </div>
  )
}

export default App