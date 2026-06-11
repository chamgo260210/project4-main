import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Home({ books = [], resolveImageUrl }) {
  const [popularBooks, setPopularBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryMap, setCategoryMap] = useState({})

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

  const getCategoryDisplay = (category) => {
    return categoryMap[category] || category
  }

  useEffect(() => {
    // 카테고리 데이터 받아오기
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
    async function fetchPopular() {
      try {
        // 좋아요 내림차순으로 6개만 요청
        const res = await fetch(
          `${API_BASE_URL}/api/v1/books/page?page=0&size=6&sortBy=likes`
        )
        if (!res.ok) throw new Error('인기 도서를 불러오지 못했습니다.')
        const data = await res.json()
        setPopularBooks(data.content)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPopular()
  }, [API_BASE_URL])

  return (
    <section className="home-book-section">
      <div className="home-book-header">
        <div>
          <p className="home-label">BOOK ARCHIVE</p>
          <h2 className="home-title">도서목록</h2>
        </div>
        <Link to="/list" className="home-view-button">
          전체 보기
        </Link>
      </div>
      <p className="home-description">
        좋아요를 많이 받은 책 표지를 먼저 보여주는 인기 도서 목록입니다.
        목록 페이지에서 자세한 정보를 확인할 수 있습니다.
      </p>

      {loading ? (
        <p className="home-empty-message">불러오는 중...</p>
      ) : popularBooks.length === 0 ? (
        <p className="home-empty-message">등록된 도서가 없습니다.</p>
      ) : (
      <div className="home-book-grid">
        {popularBooks.map((book) => {
          const imageSrc =
            book.coverImageUrl && book.coverImageUrl.trim()
              ? resolveImageUrl
                ? resolveImageUrl(book.coverImageUrl)
                : book.coverImageUrl
              : book.image || '/noImage.png'
        
          return (
            <article className="home-book-card" key={book.id}>
              <img
                className="home-book-image"
                src={imageSrc}
                alt={book.title}
              />
              <div className="home-book-card-info">
                <strong>{book.title}</strong>
                <div className="home-book-meta">
                  <span>작가: {book.author || '작가 미상'}</span>
                  {book.category && (
                    <span className="home-book-category">{getCategoryDisplay(book.category)}</span>
                  )}
                </div>
                <em>좋아요 {book.likes || 0}</em>
              </div>
            </article>
          )
        })}
      </div>
      )}
    </section>
  )
}

export default Home