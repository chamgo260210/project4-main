import { useState, useEffect } from 'react'
import InputInfo from './InputInfo'
import CreateImageForm from './CreateImageForm'

function CreateForm({ onAddBook, onCancel }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [quality, setQuality] = useState('medium')
  const [coverImageUrl, setCoverImageUrl] = useState('noImage.jpg')
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/books/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("카테고리 로딩 실패:", err))
  }, [])

  return (
    <section className="create-write-page">
      <div className="create-write-form">
        <h1 className="create-write-title">내용 생성</h1>
        <InputInfo
          title={title}
          setTitle={setTitle}
          author={author}
          setAuthor={setAuthor}
          content={content}
          setContent={setContent}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <h1 className="create-write-title">썸네일 생성</h1>
        <CreateImageForm
          title={title}
          author={author}
          content={content}
          onAddBook={onAddBook}
          onCancel={onCancel}
          quality={quality}
          setQuality={setQuality}
          coverImageUrl={coverImageUrl}
          setCoverImageUrl={setCoverImageUrl}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>
    </section>
  )
}

export default CreateForm