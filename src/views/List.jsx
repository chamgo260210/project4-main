import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function Card({ item, onClick, resolveImageUrl, categoryMap }) {
  const imageSrc =
    item.coverImageUrl && item.coverImageUrl.trim()
      ? resolveImageUrl(item.coverImageUrl)
      : item.image || '/noImage.jpg'

  const getCategoryDisplay = (category) => {
    return categoryMap[category] || category
  }

  return (
    <article
      className="list-book-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <img className="list-book-image" src={imageSrc} alt={item.title} />
      <div className="list-book-content">
        <h3>{item.title}</h3>
        <div className="list-book-meta">
          <p className="list-book-author">작가: {item.author || '저자 미상'}</p>
        </div>
        <div className="list-book-meta-right">
          <em>좋아요 {item.likes || 0}</em>
          <span className="list-book-views">조회 {item.views || 0}</span>
        </div>
        {item.category && (
          <span className="list-book-category">{getCategoryDisplay(item.category)}</span>
        )}
      </div>
    </article>
  )
}

export default function List({ query = '', books = [], loading, isLast, onLoadMore, onDelete, onLike, onView, onSortChange, resolveImageUrl, selectedCategory, onCategoryChange }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [categoryMap, setCategoryMap] = useState({})
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([])
  const [editingCommentId, setEditingCommentId] = useState(null)
  const observerRef = useRef()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

  const selected = selectedId ? books.find((book) => book.id === selectedId) : null

  useEffect(() => {
    if (!selectedId) {
      setComments([])
      setCommentText('')
      setEditingCommentId(null)
      return
    }

    fetch(`${API_BASE_URL}/api/v1/books/${selectedId}/comments`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(() => setComments([]))

    setCommentText('')
    setEditingCommentId(null)
  }, [selectedId])

  const getCategoryDisplay = (category) => {
    return categoryMap[category] || category
  }

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/books/categories`)
      .then((res) => res.json())
      .then((data) => {
        const map = {}
        data.forEach(cat => {
          map[cat.name] = cat.description
        })
        setCategoryMap(map)
      })
      .catch((err) => console.error("카테고리 로딩 실패:", err))
  }, [API_BASE_URL])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !isLast) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [loading, isLast, onLoadMore])

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    let result = books
    if (selectedCategory) {
      result = result.filter(book => book.category === selectedCategory)
    }
    if (!q) return books
    return books.filter((item) => {
      const title = item.title || ''
      const author = item.author || ''
      return title.toLowerCase().includes(q) || author.toLowerCase().includes(q)
    })
  }, [query, books, selectedCategory])

  const isSearching = query.trim().length > 0
  const isEmpty = filteredItems.length === 0

  const handleOpen = (item) => {
    setSelectedId(item.id)
    setOpen(true)
    if (item && item.id) {
      onView(item.id)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedId(null)
  }

  const handleDeleteClick = async () => {
    if (!selected || !onDelete) return
    if (window.confirm('정말 이 도서를 삭제하시겠습니까?')) {
      await onDelete(selected.id)
      handleClose()
    }
  }

  const handleLikeClick = () => {
    if (selected && onLike) {
      onLike(selected.id)
    }
  }

  const handleCommentSubmit = async () => {
    if (!selected || !commentText.trim()) return

    if (editingCommentId) {
      const res = await fetch(`${API_BASE_URL}/api/v1/comments/${editingCommentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ writer: '익명', content: commentText.trim() })
      })
      const updated = await res.json()
      setComments(comments.map(c => c.id === editingCommentId ? updated : c))
      setEditingCommentId(null)
      setCommentText('')
      return
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/books/${selected.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ writer: '익명', content: commentText.trim() })
    })
    const saved = await res.json()
    setComments([saved, ...comments])
    setCommentText('')
  }

  const handleCommentEdit = (comment) => {
    setEditingCommentId(comment.id)
    setCommentText(comment.content)
  }

  const handleCommentDelete = async (commentId) => {
    if (!selected) return
    await fetch(`${API_BASE_URL}/api/v1/comments/${commentId}`, { method: 'DELETE' })
    setComments(comments.filter(c => c.id !== commentId))
    if (editingCommentId === commentId) {
      setEditingCommentId(null)
      setCommentText('')
    }
  }

  const handleCommentCancel = () => {
    setEditingCommentId(null)
    setCommentText('')
  }

  return (
    <div className="list-page-wrap">
      <div className="sort-container" style={{ marginBottom: '20px', textAlign: 'right' }}>
        <select
          onChange={(e) => onCategoryChange(e.target.value)}
          value={selectedCategory}
          style={{ padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}
        >
          <option value="">전체 카테고리</option>
          {Object.entries(categoryMap).map(([name, desc]) => (
            <option key={name} value={name}>{desc}</option>
          ))}
        </select>
        <select
          className="sort-select"
          onChange={(e) => onSortChange(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}
        >
          <option value="createdAt">최신순</option>
          <option value="views">조회순</option>
          <option value="likes">좋아요순</option>
        </select>
      </div>

      {isEmpty && !loading ? (
        <p className="list-state-message">
          {isSearching ? '검색 결과가 없습니다. 다른 검색어를 입력해 보세요.' : '등록된 도서가 없습니다.'}
        </p>
      ) : (
        <section className="list-book-grid">
          {filteredItems.map((item) => (
            <Card key={item.id} item={item} onClick={() => handleOpen(item)} resolveImageUrl={resolveImageUrl} categoryMap={categoryMap} />
          ))}
        </section>
      )}

      <div ref={observerRef} style={{ height: '1px' }} />
      {loading && <p className="list-state-message">불러오는 중...</p>}
      {isLast && !loading && !isEmpty && <p className="list-state-message">모든 도서를 불러왔습니다 📚</p>}

      {open && selected && (
        <div className="book-modal-overlay" onClick={handleClose}>
          <section className="book-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="book-detail-header">
              <div>
                <h3>{selected.title}</h3>
                <p className="book-detail-author">작가: {selected.author || '저자 미상'}</p>
              </div>
              <button type="button" className="book-detail-close" onClick={handleClose}>닫기</button>
            </div>
            <div className="book-detail-main">
              <div className="book-detail-image-wrap">
                <img
                  className="book-detail-image"
                  src={
                    selected.coverImageUrl && selected.coverImageUrl.trim()
                      ? resolveImageUrl(selected.coverImageUrl)
                      : selected.image || '/noImage.jpg'
                  }
                  alt={selected.title}
                />
              </div>
              <p className="modal-subtitle">{selected.content}</p>
            </div>
            <div className="book-detail-actions">
              <div className="book-like-info">
                <span>좋아요</span> <strong>{selected.likes || 0}</strong>
                <span>조회수</span> <strong>{selected.views || 0}</strong>
              </div>
              {selected.category && (
                <span className="book-detail-category">{getCategoryDisplay(selected.category)}</span>
              )}
              <button type="button" className="modal-button modal-button--delete" onClick={handleDeleteClick}>삭제</button>
              <button type="button" className="book-like-button" onClick={handleLikeClick}><span>😍</span> 좋아요</button>
              <button type="button" className="modal-button modal-button--edit" onClick={() => navigate(`/update/${selected.id}`)}>수정</button>
            </div>
            <div className="book-detail-comments">
              <h4>댓글</h4>
              <div className="comment-list">
                {comments.length === 0 ? (
                  <p className="comment-empty">아직 댓글이 없습니다.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-meta">
                        <span className="comment-author">{comment.writer}</span>
                        <span className="comment-created">{new Date(comment.createdAt).toLocaleString('ko-KR')}</span>
                      </div>
                      <p className="comment-text">{comment.content}</p>
                      <div className="comment-actions">
                        <button type="button" className="comment-button" onClick={() => handleCommentEdit(comment)}>
                          수정
                        </button>
                        <button type="button" className="comment-button comment-button--delete" onClick={() => handleCommentDelete(comment.id)}>
                          삭제
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="comment-form">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 입력하세요."
                  rows={3}
                />
                <div className="comment-form-actions">
                  {editingCommentId && (
                    <button type="button" className="comment-button comment-button--cancel" onClick={handleCommentCancel}>
                      취소
                    </button>
                  )}
                  <button type="button" className="modal-button modal-button--comment" onClick={handleCommentSubmit}>
                    {editingCommentId ? '수정 완료' : '등록'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}