function InputInfo({ title, setTitle, author, setAuthor, content, setContent, categories, selectedCategory, setSelectedCategory }) {
  return (
    <>
      <div className="create-two-columns">
        <label>
          도서 제목
          <input
            value={title}
            placeholder="제목"
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label>
          작가 이름
          <input
            value={author}
            placeholder="작가 이름"
            onChange={(e) => setAuthor(e.target.value)}
          />
        </label>
      </div>

      <label>
        카테고리
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">선택하세요</option>
          {categories && categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.description}
            </option>
          ))}
        </select>
      </label>

      <label>
        내용
        <textarea
          value={content}
          placeholder="내용"
          rows={8}
          onChange={(e) => setContent(e.target.value)}
        />
      </label>
    </>
  )
}

export default InputInfo