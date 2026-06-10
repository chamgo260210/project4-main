import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import UpdateForm from '../components/UpdateForm'

export default function Update({ bookURL, onUpdate, resolveImageUrl}) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadBookDetail() {
      try {
        setLoading(true)

        const res = await fetch(`${bookURL}/${id}`)

        if (!res.ok) {
          throw new Error('책 정보를 가져오지 못했습니다.')
        }

        const data = await res.json()
        setBook(data)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id && bookURL) {
      loadBookDetail()
    }
  }, [id, bookURL])

  const handleSubmit = async (updatedFields) => {
    // 만약 이미지가 있다면(coverImageUrl이 있다면), 백엔드 API를 호출하여 따로 저장합니다.
    if (updatedFields.coverImageUrl) {
      await fetch(`${bookURL}/${id}/cover-update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: updatedFields.title,
          author: updatedFields.author,
          content: updatedFields.content,
          coverImageUrl: updatedFields.coverImageUrl 
        }),
      });
    }

    // 나머지 정보(제목, 내용 등)를 업데이트합니다. (기존 로직 유지)
    await onUpdate(id, {
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    });
    
    navigate('/list');
  }

  if (loading) {
    return <p className="loading-text">도서 정보를 불러오는 중입니다...</p>
  }

  if (error) {
    return <p className="error-text">에러: {error}</p>
  }

  if (!book) {
    return <p className="error-text">도서 정보가 없습니다.</p>
  }

  return (
    <UpdateForm
      initialBook={book}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/list')}
      resolveImageUrl={resolveImageUrl}
    />
  )
}

