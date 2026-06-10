import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function Card({ item, onClick }) {
  const imageSrc =
    item.coverImageUrl && item.coverImageUrl.trim()
      ? item.coverImageUrl
      : item.image || '/noImage.jpg'

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
          <div className="list-book-meta-right">
            <em>좋아요 {item.likes || 0}</em>
            <span className="list-book-views">조회 {item.views || 0}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function List({ query = '', books = [], loading, isLast, onLoadMore, onDelete, onLike, onView, onSortChange }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const observerRef = useRef() 

  const selected = selectedId ? books.find((book) => book.id === selectedId) : null

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
    if (!q) return books
    return books.filter((item) => {
      const title = item.title || ''
      const author = item.author || ''
      return title.toLowerCase().includes(q) || author.toLowerCase().includes(q)
    })
  }, [query, books])

  const isSearching = query.trim().length > 0
  const isEmpty = filteredItems.length === 0

  const handleOpen = (item) => {
    setSelectedId(item.id)
    setOpen(true)
    if (item && item.id) {
      onView(item.id);
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

  return (
    <div className="list-page-wrap">
      {/* 정렬 버튼 영역 */}
      <div className="sort-container" style={{ marginBottom: '20px', textAlign: 'right' }}>
        <select 
          className="sort-select" 
          onChange={(e) => onSortChange(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', backgroundColor: '#f0f0f0', border: '1px solid #ccc'
           }}
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
            <Card key={item.id} item={item} onClick={() => handleOpen(item)} />
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
                  src={selected.coverImageUrl && selected.coverImageUrl.trim() ? selected.coverImageUrl : selected.image || '/noImage.jpg'}
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
              <button type="button" className="modal-button modal-button--delete" onClick={handleDeleteClick}>삭제</button>
              <button type="button" className="book-like-button" onClick={handleLikeClick}><span>😍</span> 좋아요</button>
              <button type="button" className="modal-button modal-button--edit" onClick={() => navigate(`/update/${selected.id}`)}>수정</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}