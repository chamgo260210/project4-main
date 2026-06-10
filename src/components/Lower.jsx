import React, { useState } from 'react'

function Lower() {
  const [activePopup, setActivePopup] = useState(null)

  const handleOpen = (type) => {
    setActivePopup(type)
  }

  const handleClose = () => {
    setActivePopup(null)
  }

  return (
    <>
      <footer className="lower-footer">
        <div className="lower-content">
          <span>(주)케이티에이블2조</span>
          <button type="button" className="lower-link" onClick={() => handleOpen('terms')}>
            이용약관
          </button>
          <button type="button" className="lower-link" onClick={() => handleOpen('creator')}>
            제작자
          </button>
        </div>
      </footer>

      {activePopup && (
        <div className="lower-modal-overlay" onClick={handleClose}>
          <section className="lower-modal" onClick={(e) => e.stopPropagation()}>
            <header className="lower-modal-header">
              <h3>{activePopup === 'terms' ? '이용약관' : '제작자'}</h3>
              <button type="button" className="lower-modal-close" onClick={handleClose}>
                ✕
              </button>
            </header>
            <div className="lower-modal-body">
              {activePopup === 'terms' ? (
                <>
                  <p><strong>Book Archive - 도서관리 시스템</strong>은 Spring Boot와 React 기반의 학습용 풀스택 도서관리 애플리케이션입니다.</p>
                  <p>이 앱은 도서 데이터의 영속적인 관리를 위한 백엔드 서버와 사용자 친화적인 프론트엔드 인터페이스를 모두 포함합니다. 사용자는 도서를 등록, 조회, 검색, 수정, 삭제할 수 있으며, 표지 이미지 미리보기, 좋아요 및 조회수 기능을 사용할 수 있습니다.</p>
                  <p><strong>주요 기능</strong></p>
                  <ul>
                    <li>도서 관리: 도서 목록 조회, 상세 보기, 등록, 수정, 삭제 기능 제공</li>
                    <li>검색: 제목 키워드를 통한 도서 검색 기능</li>
                    <li>사용자 상호작용: 좋아요 및 조회수 기능</li>
                    <li>UI/UX: 이미지 미리보기, 빈 상태 안내 (등록된 도서 없음, 검색 결과 없음) 등 사용자 편의 기능</li>
                  </ul>
                  <p><strong>기술 스택</strong></p>
                  <p><u>Backend:</u></p>
                  <ul>
                    <li>Java</li>
                    <li>Spring Boot</li>
                    <li>Spring Data JPA</li>
                    <li>Hibernate</li>
                    <li>Lombok</li>
                    <li>H2 / MySQL (데이터베이스)</li>
                  </ul>
                  <p><u>Frontend:</u></p>
                  <ul>
                    <li>React, Vite</li>
                    <li>React Router DOM</li>
                    <li>Fetch API</li>
                    <li>CSS</li>
                  </ul>
                  <p><strong>실행 방법</strong></p>
                  <ol>
                    <li>Backend (Spring Boot) 실행: IntelliJ 등 IDE에서 백엔드 프로젝트를 열고 메인 애플리케이션을 실행합니다.</li>
                    <li>Frontend (React) 실행:
                      <ul>
                        <li><code>npm install</code></li>
                        <li><code>npm run dev</code></li>
                      </ul>
                    </li>
                  </ol>
                  <p><strong>참고:</strong> 본 서비스는 학습 및 데모용으로 제작되었으며, 실제 상용 서비스가 아닙니다. 초기 버전에서는 json-server를 사용했으나, 현재는 Spring Boot 기반의 백엔드 서버가 모든 데이터 처리를 담당합니다.</p>
                </>
              ) : (
                <>
                    <p>이성민: PM/기획, 서기(2)</p>
                    <p>정휘재: 서기, 스타일링, 백엔드개발(4)</p>
                    <p>한현우: UI/레이아웃,통합/예외처리</p>
                    <p>오승진: 메인CRUD개발, 백엔드 개발(1)</p>
                    <p>안인우: UI/레이아웃, 백엔드개발(3)</p>
                    <p>김민중: 스타일링</p>
                    <p>박찬웅: OpenAI연동, CRUD, 백엔드개발(2)</p>
                    <p>박시우: 문서, CRUD, AI/프론트엔드 연동</p>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default Lower
