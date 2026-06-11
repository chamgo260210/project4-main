import {useState, useEffect} from 'react'
import Dropdown from './Dropdown'
import MaskedApiKeyInput from './MaskedApiKeyInput'

function getSavableImageUrl(imageUrl) {
  const invalidPreviewImages = [
    '/test_src/error.png',
    './test_src/error.png',
    '/test_src/loading.gif',
    './test_src/loading.gif',
  ]

  if (!imageUrl || invalidPreviewImages.includes(imageUrl)) {
    return '/noImage.jpg'
  }

  return imageUrl
}

function CreateImageForm({ title, 
                           author,
                           content,
                           quality, setQuality,
                           coverImageUrl, setCoverImageUrl,
                           onAddBook, onCancel, selectedCategory }) {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  const [createdAt, setCreatedAt] = useState('')
  const [updatedAt, setUpdatedAt] = useState('')
  const [imageSize, setImageSize] = useState('768x1024')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const now = new Date().toISOString()
    setCreatedAt(now)
    setUpdatedAt(now)
  }, [])

  const handlePreviewImage = async () => {
    // const prompt = `
    //                     # 역할
    //                     너는 북커버 제작 담당자야.

    //                     # 지침
    //                     - 북커버의 앞면 표지만을 보여줄 것
    //                     - 전문적인 북커버 디자인, 높은 퀄리티의 일러스트레이션, 두드러진 시각적 표현, 작품에 적합한 안전성
    //                     - 이야기의 분위기나 무드를 포함

    //                     # 책 정보
    //                     - 제목 : "${title}"
    //                     - 내용 요약 : ${content}.
    //                     `

    try {
      alert('이미지 생성 시, 비용이 발생할 수 있습니다.');
      setLoading(true)
      setCoverImageUrl('/test_src/loading.gif')

      // const res = await fetch('https://api.openai.com/v1/images/generations', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${apiKey}`,
      //   },
      //   body: JSON.stringify({
      //     model: 'gpt-image-2',
      //     prompt,
      //     n: 1,
      //     size: imageSize,
      //     quality,
      //     output_format: 'png',
      //   }),
      // })
      const res = await fetch(`${API_BASE_URL}/api/v1/books/cover?apiKey=${encodeURIComponent(apiKey)}&imageSize=${imageSize}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
         },
        body: JSON.stringify({
          title: title,
          content: content
        }),
      })
      

      if (!res.ok) {
        setCoverImageUrl('/test_src/error.png')
        const errData = await res.json().catch(() => ({}))
        const status = res.status
        if (status === 401) throw new Error('API Key가 올바르지 않습니다. 확인 후 다시 시도해주세요.')
        if (status === 429) throw new Error('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.')
        throw new Error(errData?.error?.message || 'OpenAI 이미지 생성에 실패했습니다.')
      }

      const data = await res.json()
      const b64Json = data.b64Json;
      
      if (!b64Json) throw new Error('이미지 데이터를 받지 못했습니다.')

      setCoverImageUrl(`data:image/png;base64,${b64Json}`)
      alert('이미지 생성을 완료했습니다.')
    } catch (err) {
      console.error(err);
      console.log(b64Json);
      alert('이미지 생성을 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitBook = async () => {

    if (!title || !title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    if (!author || !author.trim()) {
      alert('저자 이름을 입력해주세요.')
      return
    }
    if (!content || !content.trim()) {
      alert('내용을 입력해주세요.')
      return
    }
    const newBook = {
      title,
      author,
      content,
      likes: 0,
      views: 0,
      category: selectedCategory,
      coverImageUrl: getSavableImageUrl(coverImageUrl),
    }

    if (onAddBook) {
      await onAddBook(newBook)
      return
    }

  }
    
    return (<>
        <form className="create-write-layout">

            <aside className="create-preview-card">
                <div className="create-preview-image-box">
                    <img src={coverImageUrl} alt="book cover" />
                </div>

                <strong>이미지 미리보기</strong>
                <p>선택된 품질: {quality}</p>
                <p>선택된 크기: {imageSize}</p>
                <span>
                    입력 작성 후 이미지 생성하기를 누르고, 기다리시면 생성된 이미지가 보입니다.
                </span>
            </aside>
            <div className="create-image-controls">
                <label>
                    api키
                    <MaskedApiKeyInput value={apiKey} onChange={setApiKey} />
                </label>

                <div className="create-quality-group">
                    <p>품질</p>
                    <Dropdown value={quality} onChange={setQuality} />
                </div>

                <div className="create-quality-group">
                    <p>이미지 크기</p>
                    <select value={imageSize} onChange={e => setImageSize(e.target.value)}>
                      <option value="640x1024">640x1024</option>
                      <option value="768x1024">768x1024</option>
                      <option value="896x1280">896x1280</option>
                    </select>
                </div>

                <div className="create-action-row">
                    <button
                        type="button"
                        className="create-preview-button"
                        onClick={handlePreviewImage}
                        disabled={loading}
                    >
                    {loading ? '이미지 생성 중...' : '이미지 생성하기'}
                    </button>

                    <button
                    type="button"
                    className="create-submit-button"
                    onClick={handleSubmitBook}
                    >
                    등록하기
                    </button>

                    <button
                    type="button"
                    className="create-preview-button"
                    onClick={onCancel}
                    >
                    취소
                    </button>
                </div>
            </div>
        </form>
  </>
    )
};

export default CreateImageForm;