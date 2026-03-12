---
title: 05 서비스 개발 Spec 예(생성)
---
# Post-Note 개발 상세 Spec

## 1. 프로젝트 개요

포스트잇형 개인 노트 관리 웹 서비스. 사용자가 메모를 **포스트잇 형태**로 작성하고, **자유 배치(Freeform)** 또는 **칸반(Kanban)** 방식으로 관리할 수 있는 반응형 웹 애플리케이션입니다.

### 핵심 가치
- 직관적인 포스트잇 UX (파스텔 톤, 끝 말림 효과)
- Markdown 지원으로 풍부한 메모 작성
- AI 기반 메모 요약 및 중요 알림
- Desktop/Mobile 반응형 지원

---

## 2. 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| **Frontend** | Next.js + React | 최신 (App Router) |
| **스타일링** | Tailwind CSS | 최신 (v4+) |
| **Backend** | Python + FastAPI | 최신 |
| **Database** | SQLite3 | - |
| **AI/LLM** | Google Gemini | `gemini-3-flash-preview` |
| **인증** | JWT (JSON Web Token) | - |
| **API 문서** | Swagger UI (FastAPI 내장) | - |

> **참고**: 모든 라이브러리는 Context7 MCP를 통해 최신 API 기준으로 구현합니다.

---

## 3. 시스템 아키텍처

```
┌─────────────────────────────────────────────────┐
│                   Client (Browser)               │
│  ┌───────────────────────────────────────────┐   │
│  │         Next.js Frontend (React)          │   │
│  │  - Pages (App Router)                     │   │
│  │  - Components (Freeform, Kanban, etc.)    │   │
│  │  - Tailwind CSS                           │   │
│  └──────────────────┬────────────────────────┘   │
└─────────────────────┼────────────────────────────┘
                      │ REST API (JSON)
┌─────────────────────┼────────────────────────────┐
│  ┌──────────────────┴────────────────────────┐   │
│  │         FastAPI Backend (Python)           │   │
│  │  - Auth Router (JWT)                      │   │
│  │  - Notes Router (CRUD)                    │   │
│  │  - AI Router (Gemini 요약/알림)            │   │
│  └──────────┬──────────────┬─────────────────┘   │
│             │              │                     │
│  ┌──────────┴───┐  ┌──────┴──────────────┐      │
│  │   SQLite3    │  │  Gemini API          │      │
│  │   Database   │  │  (gemini-3-flash-    │      │
│  │              │  │   preview)           │      │
│  └──────────────┘  └─────────────────────┘      │
└──────────────────────────────────────────────────┘
```

### 디렉토리 구조

```
post-note/
├── frontend/                    # Next.js 프로젝트
│   ├── src/
│   │   ├── app/                 # App Router 페이지
│   │   │   ├── layout.tsx       # 루트 레이아웃
│   │   │   ├── page.tsx         # 메인 (로그인 리다이렉트)
│   │   │   ├── login/           # 로그인 페이지
│   │   │   ├── register/        # 회원가입 페이지
│   │   │   └── notes/           # 메모 메인 페이지
│   │   │       └── page.tsx     # Freeform/Kanban 전환 뷰
│   │   ├── components/          # 재사용 컴포넌트
│   │   │   ├── common/          # 공통 컴포넌트
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── MarkdownRenderer.tsx
│   │   │   ├── notes/           # 메모 관련 컴포넌트
│   │   │   │   ├── NoteCard.tsx           # 포스트잇 카드
│   │   │   │   ├── NoteCreateModal.tsx    # 메모 생성 팝업
│   │   │   │   ├── NoteDetailModal.tsx    # 메모 상세 보기
│   │   │   │   ├── FreeformView.tsx       # 자유 배치 뷰
│   │   │   │   ├── KanbanView.tsx         # 칸반 뷰
│   │   │   │   └── KanbanColumn.tsx       # 칸반 컬럼
│   │   │   ├── ai/              # AI 관련 컴포넌트
│   │   │   │   ├── AiSummaryPanel.tsx
│   │   │   │   └── AiAlertBadge.tsx
│   │   │   └── auth/            # 인증 컴포넌트
│   │   │       ├── LoginForm.tsx
│   │   │       └── RegisterForm.tsx
│   │   ├── hooks/               # 커스텀 훅
│   │   │   ├── useAuth.ts
│   │   │   ├── useNotes.ts
│   │   │   └── useDragDrop.ts
│   │   ├── lib/                 # 유틸리티
│   │   │   ├── api.ts           # API 클라이언트
│   │   │   └── constants.ts
│   │   └── types/               # TypeScript 타입 정의
│   │       └── index.ts
│   ├── public/
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
├── backend/                     # FastAPI 프로젝트
│   ├── main.py                  # FastAPI 앱 진입점
│   ├── config.py                # 설정 (DB, API Key 등)
│   ├── database.py              # SQLite3 연결 관리
│   ├── models/                  # Pydantic 모델
│   │   ├── user.py
│   │   └── note.py
│   ├── routers/                 # API 라우터
│   │   ├── auth.py              # 인증 API
│   │   ├── notes.py             # 메모 CRUD API
│   │   └── ai.py                # AI 요약/알림 API
│   ├── services/                # 비즈니스 로직
│   │   ├── auth_service.py
│   │   ├── note_service.py
│   │   └── ai_service.py        # Gemini 연동
│   ├── utils/                   # 유틸리티
│   │   └── security.py          # JWT 토큰 관리
│   └── requirements.txt
├── test/                        # 테스트 코드 (GEMINI.md 규칙)
│   ├── backend/
│   │   ├── test_auth.py
│   │   ├── test_notes.py
│   │   └── test_ai.py
│   └── frontend/
├── scripts/                     # 유틸리티 스크립트 (GEMINI.md 규칙)
├── docs/                        # 문서
│   ├── requirement.md
│   ├── spec.md                  # 이 문서
│   ├── backend-wiki.md          # 백엔드 위키 (GEMINI.md 규칙)
│   └── frontend-wiki.md         # 프론트엔드 위키 (GEMINI.md 규칙)
└── GEMINI.md                    # 프로젝트 규칙
```

---

## 4. 데이터베이스 설계 (SQLite3)

### 4.1 users 테이블

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | INTEGER | PK, AUTOINCREMENT | 사용자 고유 ID |
| `email` | TEXT | UNIQUE, NOT NULL | 이메일 (로그인 ID) |
| `password_hash` | TEXT | NOT NULL | 비밀번호 해시 (bcrypt) |
| `nickname` | TEXT | NOT NULL | 사용자 닉네임 |
| `created_at` | TEXT | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 가입일시 |
| `updated_at` | TEXT | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 수정일시 |

### 4.2 notes 테이블

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | INTEGER | PK, AUTOINCREMENT | 메모 고유 ID |
| `user_id` | INTEGER | FK(users.id), NOT NULL | 작성자 ID |
| `title` | TEXT | NOT NULL | 메모 제목 |
| `content` | TEXT | NOT NULL, DEFAULT '' | 메모 내용 (Markdown) |
| `note_type` | TEXT | NOT NULL, CHECK('free','kanban') | 메모 타입 |
| `color` | TEXT | NOT NULL, DEFAULT '#FFEAA7' | 메모 색상 (파스텔 HEX) |
| `kanban_status` | TEXT | CHECK('plan','progress','done'), DEFAULT NULL | 칸반 상태 |
| `progress_percent` | INTEGER | DEFAULT 0, CHECK(0~100) | 진척도 (%) - progress 상태 시 |
| `due_date` | TEXT | DEFAULT NULL | 마감일 (YYYY-MM-DD, D-Day용) |
| `position_x` | REAL | DEFAULT 0 | Freeform X 좌표 |
| `position_y` | REAL | DEFAULT 0 | Freeform Y 좌표 |
| `width` | REAL | DEFAULT 240 | 카드 너비 |
| `height` | REAL | DEFAULT 200 | 카드 높이 |
| `z_index` | INTEGER | DEFAULT 0 | 겹침 순서 (Freeform overlap용) |
| `kanban_order` | INTEGER | DEFAULT 0 | 칸반 내 정렬 순서 |
| `is_archived` | INTEGER | DEFAULT 0 | 보관 여부 (0/1) |
| `created_at` | TEXT | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| `updated_at` | TEXT | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 수정일시 |

### 4.3 인덱스

```sql
-- 사용자별 메모 조회 최적화
CREATE INDEX idx_notes_user_id ON notes(user_id);

-- 칸반 상태별 조회
CREATE INDEX idx_notes_kanban ON notes(user_id, note_type, kanban_status);

-- 마감일 기준 조회
CREATE INDEX idx_notes_due_date ON notes(user_id, due_date);
```

---

## 5. API 설계 (RESTful)

### 5.1 인증 API (`/api/auth`)

| Method | Endpoint | 설명 | Request Body | Response |
|--------|----------|------|--------------|----------|
| POST | `/api/auth/register` | 회원가입 | `{ email, password, nickname }` | `{ id, email, nickname }` |
| POST | `/api/auth/login` | 로그인 | `{ email, password }` | `{ access_token, token_type }` |
| GET | `/api/auth/me` | 내 정보 조회 | - (Authorization Header) | `{ id, email, nickname }` |

### 5.2 메모 API (`/api/notes`)

| Method | Endpoint | 설명 | Request Body / Params | Response |
|--------|----------|------|-----------------------|----------|
| GET | `/api/notes` | 메모 목록 조회 | Query: `?type=free\|kanban` | `[Note]` |
| POST | `/api/notes` | 메모 생성 | `{ title, content, note_type, color, kanban_status?, progress_percent?, due_date?, position_x?, position_y? }` | `Note` |
| GET | `/api/notes/{id}` | 메모 상세 조회 | - | `Note` |
| PUT | `/api/notes/{id}` | 메모 수정 | `{ title?, content?, color?, kanban_status?, progress_percent?, due_date? }` | `Note` |
| PATCH | `/api/notes/{id}/position` | 메모 위치 변경 (Freeform) | `{ position_x, position_y, z_index? }` | `Note` |
| PATCH | `/api/notes/{id}/kanban` | 칸반 상태 변경 | `{ kanban_status, kanban_order?, progress_percent? }` | `Note` |
| DELETE | `/api/notes/{id}` | 메모 삭제 | - | `{ message }` |

### 5.3 AI API (`/api/ai`)

| Method | Endpoint | 설명 | Request Body | Response |
|--------|----------|------|--------------|----------|
| POST | `/api/ai/summary` | 전체 메모 요약 | - (Authorization Header) | `{ summary: string }` |
| POST | `/api/ai/alerts` | 중요 알림 생성 | - (Authorization Header) | `{ alerts: [{ note_id, message, priority }] }` |

### 5.4 공통 응답 형식

```json
// 성공 응답
{
  "status": "success",
  "data": { ... }
}

// 에러 응답
{
  "status": "error",
  "detail": "에러 메시지"
}
```

### 5.5 인증 방식

- **Bearer Token (JWT)**: 모든 인증 필요 API에 `Authorization: Bearer <token>` 헤더 필수
- JWT Payload: `{ sub: user_id, email, exp }`
- 토큰 만료: 24시간

---

## 6. UI/UX 상세 명세

### 6.1 디자인 시스템 (Stitch 참조)

> Stitch MCP 프로젝트 `post-note` (ID: `2027687418161249866`) 기반

| 속성 | 값 | 설명 |
|------|-----|------|
| **Color Mode** | Light | 밝은 배경 |
| **Primary Color** | `#b6e6fc` | 파스텔 하늘색 |
| **Font** | Spline Sans | 메인 폰트 |
| **Border Radius** | 12px | 모든 카드/버튼에 적용 |
| **Saturation** | 2 (Medium) | 중간 채도의 파스텔 톤 |

### 6.2 포스트잇 색상 팔레트 (파스텔)

| 색상명 | HEX | 용도/미리보기 |
|--------|-----|--------------|
| 노란색 | `#FFEAA7` | 기본 포스트잇 |
| 분홍색 | `#FDCFE8` | 중요 메모 |
| 하늘색 | `#B6E6FC` | 아이디어 |
| 연두색 | `#C4E9B2` | 완료/긍정 |
| 보라색 | `#D5C6F0` | 개인 메모 |
| 주황색 | `#FFDAB9` | 긴급 |
| 민트색 | `#B2E6D4` | 프로젝트 |
| 라벤더 | `#E8D5F5` | 참고 |

### 6.3 스크린 구성 (Stitch 디자인 기준)

#### 스크린 1: 로그인 페이지
- **Stitch Screen**: `로그인 페이지 (개선)` / Desktop 2560×2048
- **구성**: 좌측 브랜딩 영역 + 우측 로그인 폼
- **요소**:
  - 이메일 입력 필드
  - 비밀번호 입력 필드
  - 로그인 버튼 (Primary Color)
  - "회원가입" 링크

#### 스크린 2: 회원가입 페이지
- **Stitch Screen**: `회원 가입 페이지 (파스텔 블루)` / Desktop 2560×2048
- **구성**: 로그인과 동일한 레이아웃
- **요소**:
  - 이메일 입력
  - 닉네임 입력
  - 비밀번호 입력
  - 비밀번호 확인 입력
  - 가입 버튼
  - "로그인으로 돌아가기" 링크

#### 스크린 3: 메인 자유 배치 모드 (Freeform)
- **Stitch Screen**: `메인 자유 배치 모드 (AI 아이콘 및 메뉴 정리)` / Desktop 2560×2058
- **구성**:
  - 상단 헤더바: 로고, 뷰 전환(Freeform/Kanban) 토글, AI 요약 버튼, 사용자 메뉴
  - 메인 캔버스: 자유 배치 가능한 포스트잇 노트 영역
  - 플로팅 버튼: 메모 추가 (+) 버튼
- **인터랙션**:
  - Drag & Drop으로 메모 위치 이동
  - 메모 간 Overlap (z-index 관리) 허용
  - 메모 클릭 → 상세 보기 모달

#### 스크린 4: 칸반 보드 뷰 (Kanban)
- **Stitch Screen**: `심플 칸반 보드 뷰 (상태 중심)` / Desktop 2560×2048
- **구성**:
  - 동일한 상단 헤더바
  - 3개 컬럼: **Plan(계획)** → **Progress(실행중)** → **Done(완료)**
  - 각 컬럼에 해당 상태의 포스트잇 나열
- **인터랙션**:
  - Drag & Drop으로 컬럼 간 이동 (상태 변경)
  - Progress 컬럼의 메모에는 진척도 표시 (% 바)

#### 스크린 5: 메모 생성 팝업
- **Stitch Screen**: `상세 메모 생성 팝업` / Desktop 2560×2048
- **구성**: 중앙 모달 팝업
- **입력 필드**:
  1. **메모 타입**: `Free` / `Kanban` 라디오 선택
     - Kanban 선택 시: Plan/Progress/Done 상태 선택 드롭다운
     - Progress 선택 시: 진척도 % 슬라이더 (0~100)
  2. **메모 색상**: 파스텔 색상 팔레트 선택 (원형/사각 색상 버튼)
  3. **메모 제목**: 텍스트 입력
  4. **메모 내용**: Markdown 에디터 (미리보기 지원)
  5. **마감날짜** (옵션): 날짜 선택기 (Date Picker)

#### 스크린 6: 모바일 칸반 보드
- **Stitch Screen**: `모바일 심플 칸반 보드` / Mobile 780×2012
- **구성**:
  - 탭 방식으로 Plan/Progress/Done 전환
  - 세로 스크롤로 메모 나열
  - 하단 플로팅 추가 버튼

#### 스크린 7: 모바일 메이슨리 뷰
- **Stitch Screen**: `모바일 메이슨리 뷰 (이미지 제거 및 텍스트 수정)` / Mobile 780×1782
- **구성**:
  - 2열 메이슨리(Masonry) 레이아웃으로 포스트잇 나열
  - Freeform의 모바일 대응 뷰
  - 터치 탭으로 상세 보기

### 6.4 포스트잇 카드 디자인

```
┌────────────────────────┐ ─┐
│  📌 메모 제목           │  │ 끝 말림 효과
│                        │  │ (CSS box-shadow +
│  메모 내용 미리보기     │  │  gradient)
│  최대 10줄 표시         │  │
│  ...                   │  │
│                        │  │
│  📅 D-3  ■■■■□ 70%    │  │ 마감일 + 진척도
└────────────────────────┘ ─┘
                          ↗ 말린 모서리
```

**CSS 포스트잇 효과**(참고):
```css
.note-card {
  border-radius: 2px 2px 2px 12px;  /* 좌하단만 둥글게 */
  box-shadow:
    2px 2px 5px rgba(0,0,0,0.1),    /* 기본 그림자 */
    inset 0 -30px 30px -20px rgba(0,0,0,0.03);  /* 내부 말림 효과 */
  position: relative;
}

.note-card::after {
  content: '';
  position: absolute;
  bottom: 0; right: 0;
  width: 30px; height: 30px;
  background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.04) 50%);
  border-radius: 0 0 0 12px;  /* 모서리 말림 */
}
```

### 6.5 반응형 전략

| Breakpoint | 디바이스 | Freeform 뷰 | Kanban 뷰 |
|------------|---------|-------------|-----------|
| ≥1280px | Desktop | 자유 드래그 배치 (캔버스) | 3컬럼 나란히 |
| 768~1279px | Tablet | 그리드 레이아웃 (3열) | 3컬럼 (좁게) |
| <768px | Mobile | 메이슨리 2열 | 탭 전환 방식 |

---

## 7. 기능 상세 명세

### 7.1 인증 시스템

#### 회원가입 Flow
1. 이메일 형식 검증 (프론트 + 백엔드)
2. 비밀번호 최소 8자, 영문+숫자 조합 검증
3. 비밀번호 확인 일치 검증
4. 이메일 중복 확인 (DB 조회)
5. bcrypt 해싱 후 DB 저장
6. 성공 → 로그인 페이지로 리다이렉트

#### 로그인 Flow
1. 이메일/비밀번호 입력
2. DB 조회 + bcrypt 비교
3. JWT 토큰 발급 (24시간 유효)
4. LocalStorage에 토큰 저장
5. 메인 페이지로 리다이렉트

#### 인증 상태 복원
- 페이지 새로고침 시 LocalStorage의 JWT 토큰으로 `/api/auth/me` 호출하여 인증 상태 복원

### 7.2 Freeform 뷰

#### Desktop
- 넓은 캔버스 영역에 포스트잇 자유 배치
- **Drag & Drop**: 마우스로 포스트잇 위치 이동
- **Overlap**: 포스트잇 간 겹침 허용 (z-index 관리, 클릭 시 맨 앞으로)
- **Resize**: 포스트잇 크기 변경 (우하단 핸들)
- 배치 정보(x, y, z_index, width, height)는 DB에 자동 저장

#### Mobile
- 2열 메이슨리(Masonry) 레이아웃
- 자유 배치는 불가, 자동 배열
- 터치 탭으로 상세 보기

### 7.3 Kanban 뷰

#### 3개 프로세스 컬럼

| 컬럼 | 설명 | 색상 아이콘 |
|------|------|------------|
| **Plan (계획)** | 계획 단계의 메모 | 📋 |
| **Progress (실행중)** | 진행 중인 메모 | 🔄 |
| **Done (완료)** | 완료된 메모 | ✅ |

#### Drag & Drop 상태 변경
- 포스트잇을 컬럼 간 끌어 놓으면 상태 자동 변경
- Progress 컬럼으로 이동 시 진척도 입력 프롬프트 표시

#### 진척도 표시
- Progress 상태의 메모에 진척도 바 표시 (0~100%)
- 색상: 0~30% 빨간색, 31~70% 노란색, 71~100% 초록색

### 7.4 메모 카드 상세

#### 미리보기 (카드)
- 제목 표시
- 내용 최대 10줄 표시 (11줄 이상이면 `...` 말줄임 처리)
- Markdown 렌더링된 형태로 표시
- 마감일 D-Day 배지 표시 (예: `D-3`, `D-Day`, `D+2`)
- Kanban인 경우 진척도 % 바 표시

#### 상세 보기 (모달)
- 전체 내용 Markdown 렌더링
- 편집 모드 전환 가능
- 메모 타입, 색상, 마감일 등 메타 정보 표시 및 수정
- 삭제 기능

### 7.5 D-Day 표시

| 조건 | 표시 | 스타일 |
|------|------|--------|
| 마감일 미설정 | 표시 안 함 | - |
| 마감일 > 오늘 | `D-N` | 일반 텍스트 |
| 마감일 = 오늘 | `D-Day` | 빨간색 강조 + 깜빡임 |
| 마감일 < 오늘 | `D+N` | 빨간색 + 취소선 |

### 7.6 AI 기능 (Gemini 연동)

#### 전체 메모 요약
- 사용자의 모든 메모를 Gemini에 전달 → 종합 요약 생성
- **프롬프트 예시**:
  ```
  다음은 사용자의 메모 목록입니다. 전체적인 요약과 키워드를 한국어로 만들어주세요.
  [메모 데이터]
  ```
- UI: 사이드 패널 또는 모달에 요약 결과 표시

#### 중요 알림 기능
- 마감일 임박 메모, 오래된 미완료 메모 등을 Gemini가 분석
- **프롬프트 예시**:
  ```
  현재 날짜: {today}
  다음 메모 목록을 분석하여 지금 시점에서 가장 중요하고 긴급한 알림을
  우선순위와 함께 한국어로 생성해주세요.
  [메모 데이터 (제목, 상태, 마감일, 진척도)]
  ```
- UI: 알림 배지 + 알림 목록 드롭다운

### 7.7 Markdown 지원 범위

| 문법 | 지원 여부 | 설명 |
|------|----------|------|
| `# 제목` | ✅ | H1~H6 |
| `**굵게**` | ✅ | Bold |
| `*기울임*` | ✅ | Italic |
| `~~취소선~~` | ✅ | Strikethrough |
| `- 목록` | ✅ | Unordered list |
| `1. 순서 목록` | ✅ | Ordered list |
| `[ ] 체크박스` | ✅ | Task list |
| `` `코드` `` | ✅ | Inline code |
| ```` ``` 코드블록 ``` ```` | ✅ | Code block |
| `[링크](url)` | ✅ | Link |
| `> 인용` | ✅ | Blockquote |
| `---` | ✅ | 구분선 |
| `![이미지](url)` | ❌ | 이미지 미지원 (텍스트 전용) |

---

## 8. 보안 명세

### 8.1 SQL Injection 방지 (GEMINI.md 규칙 준수)

```python
# ✅ 올바른 방법 - 파라미터 바인딩
cursor.execute(
    "SELECT * FROM notes WHERE user_id = ? AND note_type = ?",
    (user_id, note_type)
)

# ❌ 금지 - 문자열 포맷팅
cursor.execute(f"SELECT * FROM notes WHERE user_id = {user_id}")
```

- 모든 쿼리는 파라미터 바인딩 사용 (SQLite3 `?` 플레이스홀더)
- 동적 컬럼 (정렬, 필터)은 화이트리스트 매핑으로 검증:

```python
# 정렬 컬럼 화이트리스트
ALLOWED_SORT_COLUMNS = {
    "created_at": "created_at",
    "updated_at": "updated_at",
    "title": "title",
    "due_date": "due_date",
}
```

### 8.2 비밀번호 해싱

- `bcrypt` 사용 (salt rounds: 12)
- 평문 비밀번호 절대 저장 금지

### 8.3 JWT 토큰

- Algorithm: `HS256`
- 만료 시간: 24시간
- Secret Key: 환경변수 `SECRET_KEY`로 관리

### 8.4 CORS 설정

```python
# FastAPI CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 9. 환경 설정

### 9.1 Backend 환경변수 (`.env`)

```env
# 서버 설정
HOST=0.0.0.0
PORT=8000

# 데이터베이스
DATABASE_URL=sqlite:///./post_note.db

# JWT
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24시간

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3-flash-preview
```

### 9.2 Frontend 환경변수 (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 10. 개발 우선순위 및 마일스톤

### Phase 1: 기반 구축 (MVP)
1. 프로젝트 초기 세팅 (Next.js + FastAPI)
2. 데이터베이스 스키마 생성
3. 인증 시스템 (회원가입/로그인/JWT)
4. 메모 CRUD API + 기본 UI

### Phase 2: 뷰 시스템
5. Freeform 뷰 (Drag & Drop, 자유 배치)
6. Kanban 뷰 (3컬럼, 상태 변경)
7. 메모 생성 팝업 (전체 입력 필드)

### Phase 3: 기능 완성
8. Markdown 렌더링/편집
9. D-Day 표시 기능
10. 반응형 디자인 (Mobile 대응)

### Phase 4: AI 연동
11. Gemini API 연동 (전체 요약)
12. 중요 알림 기능

### Phase 5: 폴리싱
13. UI 디테일 (포스트잇 말림 효과, 애니메이션)
14. 테스트 작성 (단위 테스트 + API 테스트)
15. 문서 업데이트 (Wiki)

---

## 11. 코드 규칙 (GEMINI.md 준수 사항)

| 규칙 | 적용 |
|------|------|
| 테스트 코드 → `/test` 디렉토리 | ✅ |
| 스크립트 → `/scripts` 디렉토리 | ✅ |
| SQL Injection 방지 (파라미터 바인딩) | ✅ |
| 소스 코드 주석 → **한국어** | ✅ |
| 프론트엔드 수정 후 빌드 에러 확인 | ✅ |
| 새 API 추가 시 CURL + 테스트 검증 | ✅ |
| 백엔드 변경 → `docs/backend-wiki.md` 업데이트 | ✅ |
| 프론트엔드 변경 → `docs/frontend-wiki.md` 업데이트 | ✅ |
| Sequential Thinking MCP 사용 (단순 수정 제외) | ✅ |
| Context7 MCP로 최신 API 확인 | ✅ |

---

## 12. Stitch 디자인 참조 정보

| 항목 | 값 |
|------|-----|
| **Stitch Project ID** | `2027687418161249866` |
| **Project Title** | `post-note` |
| **총 스크린 수** | 7개 |

### 스크린 목록

| # | Screen ID | 제목 | 디바이스 | 해상도 |
|---|-----------|------|---------|--------|
| 1 | `051e257cb7da4537b857ca013f38f902` | 로그인 페이지 (개선) | Desktop | 2560×2048 |
| 2 | `9d23a039776748fe841f56db263f1ede` | 회원 가입 페이지 (파스텔 블루) | Desktop | 2560×2048 |
| 3 | `9d25a07d47334c43b20969947358c4f5` | 메인 자유 배치 모드 (AI 아이콘 및 메뉴 정리) | Desktop | 2560×2058 |
| 4 | `0e29e32df0b74f45a8ba3232370685a2` | 심플 칸반 보드 뷰 (상태 중심) | Desktop | 2560×2048 |
| 5 | `49651950c5bc43a5b2ab7ca4b5fd73ca` | 상세 메모 생성 팝업 | Desktop | 2560×2048 |
| 6 | `76ff876cf0214ea5a5aadb1278af1925` | 모바일 심플 칸반 보드 | Mobile | 780×2012 |
| 7 | `bfd36c44c0df40dca819d4bbceaabdd7` | 모바일 메이슨리 뷰 (이미지 제거 및 텍스트 수정) | Mobile | 780×1782 |

> 개발 시 각 스크린의 HTML 코드를 Stitch MCP `get_screen` API로 가져와 디자인 참조로 활용합니다.
