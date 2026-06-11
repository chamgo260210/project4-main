function normalizeImageSrc(src) {
  if (!src || !src.trim()) return '/public/noImage.png'

  if (
    src.startsWith('data:') ||
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('/')
  ) {
    return src
  }

  if (src.startsWith('./')) {
    return src.replace('./', '/')
  }

  return `/${src}`
}

function CreatePreviewCard({ coverImageUrl, quality }) {
  const imageSrc = normalizeImageSrc(coverImageUrl)

  return (
    <aside className="create-preview-card">
        <div className="create-preview-image-box">
            <img src={coverImageUrl} alt="book cover" />
        </div>
        <strong>이미지 미리보기</strong>
        <p>선택된 품질: {quality}</p>
        <span>
            입력 작성 후 이미지 생성하기를 누르고, 기다리시면 생성된 이미지가 보입니다.
        </span>
    </aside>
  )
}

export default CreatePreviewCard