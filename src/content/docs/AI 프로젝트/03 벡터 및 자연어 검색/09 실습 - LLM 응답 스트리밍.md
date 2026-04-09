---
title: 09 실습 - LLM 응답 스트리밍
---
# 1. LLM 스트리밍(Streaming): 혁신적인 사용자 경험의 비밀

현대의 AI 서비스를 기획하거나 개발할 때, 응답 스트리밍은 선택이 아닌 **필수**로 자리 잡았습니다. 스트리밍이 도대체 무엇이며, 왜 모든 AI 플랫폼(ChatGPT, Claude, Gemini 등)이 이 방식을 기본으로 채택하고 있는지 알아봅시다.

## 1.1 스트리밍이란 무엇인가? (개념과 작동 방식)

**스트리밍(Streaming)**은 AI가 답변을 완성할 때까지 기다렸다가 한 번에 보여주는 대신, **문장이 생성되는 즉시 한 글자, 혹은 한 단어(Token) 단위로 쪼개서 실시간으로 화면에 밀어내는 기술**입니다.

마치 과거의 타자기가 글자를 한 땀 한 땀 찍어내듯 화면에 텍스트가 나타나기 때문에 흔히 '타자기 효과(Typewriter Effect)'라고도 부릅니다.

- **기존 방식 (일괄 처리 / Batch):** 질문 ➡️ AI가 1000자 답변을 10초 동안 모두 작성 ➡️ (10초 대기 후) 화면에 1000자가 짠! 하고 나타남.
    
- **스트리밍 방식:** 질문 ➡️ AI가 첫 단어를 0.5초 만에 작성 ➡️ 바로 화면에 출력 ➡️ 다음 단어 작성 및 출력 반복 ➡️ (10초 동안) 글자가 계속 이어져서 완성됨.
    

---

## 1.2. 스트리밍을 왜 사용해야 하는가? (도입 목적 3가지)

기술적으로 더 복잡함에도 불구하고 스트리밍을 구현해야 하는 이유는 **압도적인 사용자 경험(UX) 향상**에 있습니다.

### ① 마의 3초 룰 극복과 TTFT (Time To First Token) 단축

사람은 스마트폰이나 웹에서 버튼을 누른 후 3초 이상 화면이 멈춰 있으면 "오류가 났나?", "앱이 멈췄나?" 하고 불안해하며 이탈할 확률이 급격히 높아집니다. 스트리밍은 전체 답변 완성 시간은 똑같이 10초가 걸리더라도, **사용자가 첫 번째 글자를 보는 시간(TTFT)을 1초 이내로 단축**시킵니다. 즉, 시스템이 내 요청을 즉각적으로 처리하고 있다는 확실한 신호를 주는 것입니다.

### ② 인지적 대기 시간(Perceived Latency)의 마법

사용자는 텍스트가 한 줄씩 나타나는 것을 보며 자연스럽게 그 글을 '읽기 시작'합니다. AI가 다음 문장을 생성하는 동안 사용자는 앞 문장을 읽고 있기 때문에, **기계가 답변을 만드는 시간과 사람이 글을 읽는 시간이 겹치게(오버랩) 됩니다.** 결과적으로 사용자는 '기다렸다'는 느낌 자체를 거의 받지 못합니다.

### ③ 대화의 몰입감과 생동감 부여

정적인 텍스트 덩어리가 갑자기 나타나는 것보다, 실시간으로 타이핑되는 모습은 사용자에게 큰 심리적 만족감을 줍니다. 마치 기계가 아닌 **'생각을 하며 대답을 타이핑하는 사람'**과 대화하는 듯한 착각을 불러일으켜 서비스에 대한 몰입도를 크게 높여줍니다.

---

## 1.3. 어떤 서비스에 특히 필수적인가?

- **실시간 챗봇 서비스:** 고객센터, 사내 헬프데스크 등 즉각적인 티키타카가 중요한 대화형 인터페이스.
    
- **긴 글 생성 보조 도구:** 블로그 포스팅, 보고서, 코드 작성 등 AI의 답변 길이가 길어 총 생성 시간이 10초~30초 이상 걸릴 것으로 예상되는 모든 서비스. (스트리밍이 없으면 사용자는 30초 동안 백지 화면만 봐야 합니다.)
    
- **실시간 번역 및 요약:** 화상 회의나 실시간 대화 중 상대방의 말을 즉각적으로 처리해서 보여줘야 하는 환경.

# 2. 프로그램 제작 프롬프트

```cmd
shop-assistant.py 기존 소스를 참고해서 마지막 LLM의 응답 데이터를 스트리밍 방식으로 나타날 수 있게 shop-assistant-stream.py 를 만들어주세요.
```

# 3. 소스 참고
```python
# ============================================================
# 애터미 쇼핑몰 어시스턴트 챗봇 (Shop Assistant) - Streaming 버전
#
# 필요 패키지 설치:
#   pip install google-genai chromadb sentence-transformers gradio numpy python-dotenv
#
# 설명:
#   - 사용자 질의 -> 의도 파악 (query-process.md 프롬프트) -> 카테고리 분기
#   - [product]  : ChromaDB 벡터 검색 (Top 5) -> LLM (product-recommand.md 프롬프트)
#   - [marketing]: marketing-plan.md 전체 컨텍스트 -> LLM 답변 생성
#   - [general]  : query-process 응답의 general_msg 반환
#   - Gemini SDK: google-genai (최신 SDK)
#   - LLM 모델 : gemini-3.1-flash-light-preview
#   - 대화 히스토리: 최신 5턴(질의+응답 쌍) 유지
#
# ★ 원본(shop-assistant.py)과의 차이점:
#   - 2단계 LLM 호출(상품/마케팅 답변)에서 generate_content_stream() 사용
#   - Gradio Blocks event chaining: user() → bot() 패턴으로 스트리밍 yield
#   - 응답이 토큰 단위로 실시간 표시됨
# ============================================================

import os
import json
import re
import chromadb
import gradio as gr
from pathlib import Path
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드 (GEMINI_API_KEY 등)
load_dotenv()
from sentence_transformers import SentenceTransformer
from google import genai
from google.genai import types

# ============================================================
# 1. 설정 상수
# ============================================================
GEMINI_MODEL     = "gemini-3.1-flash-lite-preview"          # 실제 사용 가능한 최신 flash 모델
GEMINI_API_KEY   = os.environ.get("GEMINI_API_KEY", "")
CHROMA_DIR       = "./chroma"
COLLECTION_NAME  = "products"
EMBED_MODEL_ID   = "Alibaba-NLP/gte-multilingual-base"
MAX_HISTORY_TURN = 5                            # 유지할 최근 대화 턴 수
TOP_N_PRODUCTS   = 5                            # 벡터 검색 상위 N개

# 프롬프트 파일 경로
PROMPT_DIR = Path("./prompt")
QUERY_PROCESS_PROMPT_FILE   = PROMPT_DIR / "query-process.md"
PRODUCT_PROMPT_FILE         = PROMPT_DIR / "product-recommand.md"
MARKETING_PROMPT_FILE       = PROMPT_DIR / "marketing-plan.md"

# ============================================================
# 2. 프롬프트 파일 로드
# ============================================================
def load_prompt(path: Path) -> str:
    if path.exists():
        return path.read_text(encoding="utf-8")
    print(f"⚠️ 프롬프트 파일을 찾을 수 없습니다: {path}")
    return ""

QUERY_PROCESS_PROMPT = load_prompt(QUERY_PROCESS_PROMPT_FILE)
PRODUCT_PROMPT       = load_prompt(PRODUCT_PROMPT_FILE)
MARKETING_PROMPT     = load_prompt(MARKETING_PROMPT_FILE)

print("✅ 프롬프트 파일 로드 완료")

# ============================================================
# 3. Gemini 클라이언트 초기화
# ============================================================
if not GEMINI_API_KEY:
    print("⚠️ GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. 실행 전 설정이 필요합니다.")
gemini_client = genai.Client(api_key=GEMINI_API_KEY)
print(f"✅ Gemini 클라이언트 초기화 완료 (모델: {GEMINI_MODEL})")

# ============================================================
# 4. 임베딩 모델 로드
# ============================================================
print(f"[{EMBED_MODEL_ID}] 임베딩 모델을 로드합니다...")
print("최초 실행 시 모델 다운로드로 인해 수 분이 소요될 수 있습니다.")
embed_model = SentenceTransformer(EMBED_MODEL_ID, trust_remote_code=True)
print("✅ 임베딩 모델 로드 완료!\n")

# ============================================================
# 5. ChromaDB 연결 (기존 벡터 DB 사용)
# ============================================================
print(f"⏳ ChromaDB 컬렉션을 로드합니다... ({CHROMA_DIR})")
chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = chroma_client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"}
)
print(f"✅ ChromaDB 로드 완료 (총 {collection.count()}개 상품)\n")

# ============================================================
# 6. 벡터 검색 함수
# ============================================================
def vector_search_products(query: str, top_n: int = TOP_N_PRODUCTS) -> list[dict]:
    """
    ChromaDB에서 query를 벡터 임베딩 후 코사인 유사도 기반 검색 수행.
    반환: [{meta: {...}, document: str, score: float}, ...]
    """
    if not query.strip():
        return []
    query_vec = embed_model.encode([query], show_progress_bar=False).tolist()
    results = collection.query(
        query_embeddings=query_vec,
        n_results=top_n,
        include=["documents", "metadatas", "distances"]
    )
    if not results["ids"] or not results["ids"][0]:
        return []
    
    items = []
    for i in range(len(results["ids"][0])):
        score = max(0.0, 1.0 - results["distances"][0][i])
        items.append({
            "meta": results["metadatas"][0][i],
            "document": results["documents"][0][i],
            "score": score
        })
    return items

# ============================================================
# 7. 히스토리 -> Gemini contents 변환 헬퍼
# ============================================================
def _safe_text(content) -> str:
    """Gradio 6 Chatbot의 content를 안전하게 문자열로 변환 (str 또는 list 대응)"""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, str):
                parts.append(part)
            elif isinstance(part, dict):
                parts.append(part.get("text", part.get("value", str(part))))
            else:
                parts.append(str(part))
        return "".join(parts)
    return str(content) if content else ""

def build_history_contents(history: list) -> list[types.Content]:
    """
    Gradio 6 히스토리 [{'role': 'user'|'assistant', 'content': str}, ...]
    -> Gemini SDK types.Content 리스트로 변환 (최근 MAX_HISTORY_TURN 턴만)
    user/assistant 메시지 쌍이 각 1턴이므로 최근 MAX_HISTORY_TURN*2 항목을 사용
    """
    recent = history[-(MAX_HISTORY_TURN * 2):] if len(history) > MAX_HISTORY_TURN * 2 else history
    contents = []
    for msg in recent:
        role = msg.get("role", "") if isinstance(msg, dict) else ""
        content = _safe_text(msg.get("content", "") if isinstance(msg, dict) else "")
        if not content:
            continue
        gemini_role = "model" if role == "assistant" else "user"
        contents.append(types.Content(
            role=gemini_role,
            parts=[types.Part(text=content)]
        ))
    return contents

# ============================================================
# 8. 의도 파악 함수 (1단계 LLM 호출) — 비스트리밍 (빠른 JSON 응답)
# ============================================================
def classify_intent(user_query: str, history: list) -> dict:
    """
    query-process.md 프롬프트를 사용하여 사용자 질문의 의도(카테고리)를 파악하고
    최적화된 검색 쿼리를 추출합니다.
    반환: {"category": str, "search_query": str, "general_msg": str}
    ※ 의도 파악은 JSON 파싱이 필요하므로 스트리밍하지 않음
    """
    history_text = ""
    recent = history[-(MAX_HISTORY_TURN * 2):] if len(history) > MAX_HISTORY_TURN * 2 else history
    if recent:
        lines = []
        for msg in recent:
            role = msg.get("role", "") if isinstance(msg, dict) else ""
            content = _safe_text(msg.get("content", "") if isinstance(msg, dict) else "")
            if role == "user" and content:
                lines.append(f"User: {content}")
            elif role == "assistant" and content:
                lines.append(f"Assistant: {content}")
        history_text = "\n".join(lines)
    
    user_content = f"conversation_history:\n{history_text}\n\ncurrent_query: {user_query}" if history_text else f"current_query: {user_query}"
    
    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            config=types.GenerateContentConfig(
                system_instruction=QUERY_PROCESS_PROMPT,
                temperature=0.1,
                response_mime_type="application/json",
            ),
            contents=user_content
        )
        raw_text = response.text.strip()
        # JSON 추출 (마크다운 코드블록이 있으면 제거)
        cleaned = re.sub(r"```json|```", "", raw_text).strip()
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"⚠️ 의도 파악 JSON 파싱 오류: {e}\n원문: {raw_text}")
        return {"category": "general", "search_query": user_query, "general_msg": "⚠️ 의도 파악 중 오류가 발생했습니다."}
    except Exception as e:
        print(f"⚠️ 의도 파악 LLM 호출 오류: {e}")
        return {"category": "general", "search_query": user_query, "general_msg": f"⚠️ 오류가 발생했습니다: {e}"}

# ============================================================
# 9. 상품 검색 답변 생성 (2단계 LLM 호출 - product) ★ 스트리밍
# ============================================================
def generate_product_answer_stream(user_query: str, search_query: str, history: list):
    """
    ChromaDB에서 검색된 상품 데이터를 바탕으로 LLM 스트리밍 답변을 생성합니다.
    yield: 누적 텍스트 (토큰이 추가될 때마다)
    """
    products = vector_search_products(search_query)
    
    if not products:
        yield "죄송합니다, 해당 질문과 관련된 상품 정보를 찾지 못했습니다. 다른 키워드로 다시 검색해 주세요. 🙏"
        return
    
    # 검색 결과를 LLM에 전달할 컨텍스트 문자열로 포맷팅
    product_context_parts = []
    for i, item in enumerate(products, 1):
        meta = item["meta"]
        doc  = item["document"]
        score = item["score"]
        context = f"""
--- 상품 {i} (유사도: {score:.4f}) ---
상품코드(PRODUCT_ID): {meta.get('PRODUCT_ID', 'N/A')}
상품명(PRODUCT_NAME): {meta.get('PRODUCT_NAME', 'N/A')}
카테고리(CATEGORIES): {meta.get('CATEGORIES', 'N/A')}
가격(PRICE): {int(meta.get('PRICE', 0)):,} 원
PV(PV_PRICE): {int(meta.get('PV_PRICE', 0)):,} PV
태그(TAGS): {meta.get('TAGS', 'N/A')}
이미지(Image): {meta.get('Image', '')}
요약(SUMMARY): {meta.get('SUMMARY', 'N/A')}
상세설명(DESC_MD):
{doc}
""".strip()
        product_context_parts.append(context)
    
    product_context = "\n\n".join(product_context_parts)
    
    # LLM에 보낼 최종 사용자 메시지
    user_message_for_llm = f"""
[검색된 상품 데이터]
{product_context}

[사용자 질문]
{user_query}
""".strip()

    # 히스토리 기반 대화 컨텍스트 구성
    history_contents = build_history_contents(history)
    history_contents.append(types.Content(
        role="user",
        parts=[types.Part(text=user_message_for_llm)]
    ))
    
    try:
        # ★ 스트리밍: generate_content_stream 사용
        accumulated = ""
        for chunk in gemini_client.models.generate_content_stream(
            model=GEMINI_MODEL,
            config=types.GenerateContentConfig(
                system_instruction=PRODUCT_PROMPT,
                temperature=0.7,
            ),
            contents=history_contents
        ):
            if chunk.text:
                accumulated += chunk.text
                yield accumulated
    except Exception as e:
        print(f"⚠️ 상품 답변 스트리밍 오류: {e}")
        yield f"⚠️ 답변 생성 중 오류가 발생했습니다: {e}"

# ============================================================
# 10. 마케팅 플랜 답변 생성 (2단계 LLM 호출 - marketing) ★ 스트리밍
# ============================================================
def generate_marketing_answer_stream(user_query: str, search_query: str, history: list):
    """
    marketing-plan.md 컨텍스트를 시스템 프롬프트로 사용하여 LLM 스트리밍 답변을 생성합니다.
    yield: 누적 텍스트 (토큰이 추가될 때마다)
    """
    user_message_for_llm = f"검색어: {search_query}\n\n질문: {user_query}"
    
    history_contents = build_history_contents(history)
    history_contents.append(types.Content(
        role="user",
        parts=[types.Part(text=user_message_for_llm)]
    ))
    
    try:
        # ★ 스트리밍: generate_content_stream 사용
        accumulated = ""
        for chunk in gemini_client.models.generate_content_stream(
            model=GEMINI_MODEL,
            config=types.GenerateContentConfig(
                system_instruction=MARKETING_PROMPT,
                temperature=0.5,
            ),
            contents=history_contents
        ):
            if chunk.text:
                accumulated += chunk.text
                yield accumulated
    except Exception as e:
        print(f"⚠️ 마케팅 플랜 답변 스트리밍 오류: {e}")
        yield f"⚠️ 답변 생성 중 오류가 발생했습니다: {e}"

# ============================================================
# 11. Gradio UI
# ============================================================
CSS = """
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800;900&display=swap');

body, .gradio-container {
    font-family: 'Noto Sans KR', sans-serif !important;
    background: #f0f4f8 !important;
}

/* ── 헤더 ── */
#app-header {
    background: linear-gradient(135deg, #0f2957 0%, #1d4ed8 55%, #3b82f6 100%);
    border-radius: 18px;
    padding: 30px 40px;
    margin-bottom: 16px;
    text-align: center;
    box-shadow: 0 6px 30px rgba(29,78,216,0.35);
    position: relative;
    overflow: hidden;
}
#app-header::before {
    content: '';
    position: absolute;
    top: -40%; left: -10%;
    width: 60%; height: 200%;
    background: rgba(255,255,255,0.05);
    transform: rotate(-20deg);
    border-radius: 50%;
}
#app-header h1 {
    color: #ffffff !important;
    font-size: 2rem;
    font-weight: 900;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
}
#app-header p {
    color: #bfdbfe !important;
    font-size: 0.92rem;
    margin: 0;
}
#app-header .badge-row {
    margin-top: 12px;
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
}
#app-header .badge {
    display: inline-block;
    background: rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.4);
    color: #e0f2fe !important;
    border-radius: 20px;
    padding: 3px 14px;
    font-size: 0.78rem;
    font-weight: 600;
}

/* ── 챗봇 컨테이너 ── */
.chat-container {
    background: #ffffff;
    border: 1px solid #dbeafe;
    border-radius: 16px;
    padding: 0;
    box-shadow: 0 2px 16px rgba(37,99,235,0.08);
    overflow: hidden;
}

/* ── Chatbot 메시지 스타일 ── */
.chatbot-box {
    background: #f8faff !important;
}
.chatbot-box .message.user {
    background: linear-gradient(135deg, #1d4ed8, #3b82f6) !important;
    color: #ffffff !important;
    border-radius: 18px 18px 4px 18px !important;
    box-shadow: 0 2px 8px rgba(29,78,216,0.25) !important;
}
.chatbot-box .message.bot {
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 18px 18px 18px 4px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
    color: #111827 !important;
}
/* 봇 메시지 내부 텍스트 색상 */
.chatbot-box .message.bot *,
.chatbot-box .message.bot p,
.chatbot-box .message.bot span {
    color: #111827 !important;
}
/* 마크다운 이미지 */
.chatbot-box .message.bot img {
    max-width: 180px;
    border-radius: 10px;
    margin: 6px 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.12);
}
/* 마크다운 테이블 */
.chatbot-box .message.bot table {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
    font-size: 0.88rem;
}
.chatbot-box .message.bot th {
    background: #dbeafe;
    color: #1e3a8a !important;
    padding: 8px 12px;
    border-bottom: 2px solid #93c5fd;
    font-weight: 700;
}
.chatbot-box .message.bot td {
    padding: 7px 12px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
    color: #111827 !important;
}
.chatbot-box .message.bot tr:hover td {
    background: #eff6ff;
}

/* ── 입력 영역 ── */
#chat-input-area {
    background: #ffffff;
    border-top: 1px solid #e2e8f0;
    padding: 12px 16px;
    border-radius: 0 0 16px 16px;
}
#chat-input textarea {
    border: 1.5px solid #93c5fd !important;
    border-radius: 12px !important;
    padding: 12px 16px !important;
    font-size: 0.95rem !important;
    color: #111827 !important;
    resize: none;
    transition: border-color 0.2s;
}
#chat-input textarea:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important;
}

/* ── 버튼 ── */
#send-btn {
    background: linear-gradient(135deg, #1d4ed8, #3b82f6) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    font-size: 0.95rem !important;
    padding: 0 24px !important;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(29,78,216,0.3) !important;
}
#send-btn:hover {
    background: linear-gradient(135deg, #1e40af, #2563eb) !important;
    box-shadow: 0 4px 16px rgba(29,78,216,0.4) !important;
    transform: translateY(-1px);
}
#clear-btn {
    border: 1.5px solid #93c5fd !important;
    color: #1d4ed8 !important;
    border-radius: 12px !important;
    font-weight: 600 !important;
    background: #eff6ff !important;
    transition: all 0.2s;
}
#clear-btn:hover {
    background: #dbeafe !important;
}

/* ── 예시 질문 버튼 ── */
.example-group {
    background: #f8faff;
    border: 1px solid #dbeafe;
    border-radius: 12px;
    padding: 14px 16px;
    margin-top: 12px;
}
.example-label {
    color: #1e3a8a !important;
    font-size: 0.82rem;
    font-weight: 700;
    margin-bottom: 8px;
}

/* ── 스트리밍 표시 애니메이션 ── */
@keyframes pulse-dot {
    0%, 80%, 100% { opacity: 0.3; }
    40% { opacity: 1; }
}
.streaming-indicator {
    display: inline-block;
    color: #3b82f6;
    font-size: 0.8rem;
    font-weight: 600;
}
"""

# 예시 질문 목록
EXAMPLE_QUESTIONS = [
    "건조한 피부에 좋은 보습 제품 추천해줘",
    "헤모힘이 뭐에 좋아?",
    "세일즈 마스터 되려면 어떻게 해야 해?",
    "다이아몬드 마스터 승급 조건 알려줘",
    "면역력에 도움이 되는 건강식품 있어?",
    "후원수당은 어떻게 계산해?",
]

with gr.Blocks(title="애터미 쇼핑몰 어시스턴트 (Streaming)") as demo:
    
    # ── 헤더 ──────────────────────────────────────────────────
    gr.HTML("""
    <div id="app-header">
        <h1>🤖 애터미 쇼핑몰 어시스턴트</h1>
        <p>상품 추천부터 마케팅 플랜까지, 무엇이든 자유롭게 물어보세요!</p>
        <div class="badge-row">
            <span class="badge">✨ Gemini AI</span>
            <span class="badge">🔍 RAG 벡터 검색</span>
            <span class="badge">⚡ 실시간 스트리밍</span>
        </div>
    </div>
    """)
    
    # ── 대화 히스토리 상태 ────────────────────────────────────
    chat_history = gr.State([])
    
    # ── 챗봇 UI ───────────────────────────────────────────────
    with gr.Column(elem_classes=["chat-container"]):
        chatbot = gr.Chatbot(
            value=[],
            label="대화창",
            show_label=False,
            height=520,
            elem_classes=["chatbot-box"],
        )
        
        # ── 입력 영역 ──────────────────────────────────────
        with gr.Row(elem_id="chat-input-area"):
            user_input = gr.Textbox(
                placeholder="상품이나 마케팅 플랜에 대해 질문하세요... (Enter: 전송 / Shift+Enter: 줄바꿈)",
                show_label=False,
                lines=1,
                max_lines=1,
                scale=8,
                elem_id="chat-input",
            )
            with gr.Column(scale=1, min_width=90):
                send_btn  = gr.Button("전송 ▶", variant="primary", elem_id="send-btn")
                clear_btn = gr.Button("초기화", elem_id="clear-btn")
    
    # ── 예시 질문 ─────────────────────────────────────────────
    with gr.Column(elem_classes=["example-group"]):
        gr.HTML('<div class="example-label">💡 이런 질문을 해보세요</div>')
        with gr.Row():
            for q in EXAMPLE_QUESTIONS[:3]:
                gr.Button(q, size="sm").click(
                    fn=lambda x=q: x,
                    inputs=None,
                    outputs=user_input
                )
        with gr.Row():
            for q in EXAMPLE_QUESTIONS[3:]:
                gr.Button(q, size="sm").click(
                    fn=lambda x=q: x,
                    inputs=None,
                    outputs=user_input
                )
    
    # ============================================================
    # 12. 이벤트 핸들러 (스트리밍 패턴: user → bot 분리)
    # ============================================================
    
    def _extract_text(content) -> str:
        """
        Gradio 6 Chatbot은 content를 str 또는 list 형태로 반환할 수 있음.
        어떤 형태든 안전하게 문자열로 변환하는 헬퍼.
        """
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            # [{"type": "text", "text": "..."}, ...] 또는 [str, ...] 형태
            parts = []
            for part in content:
                if isinstance(part, str):
                    parts.append(part)
                elif isinstance(part, dict):
                    parts.append(part.get("text", part.get("value", str(part))))
                else:
                    parts.append(str(part))
            return "".join(parts)
        return str(content) if content else ""
    
    def user_send(message: str, history: list):
        """
        사용자 메시지를 즉시 채팅에 추가하고, 입력창을 비움.
        봇 응답용 빈 메시지도 함께 추가하여 스트리밍 준비.
        """
        if not message.strip():
            return history, history, ""
        updated = history + [
            {"role": "user",      "content": message},
            {"role": "assistant", "content": ""}       # ← 봇 응답 플레이스홀더
        ]
        return updated, updated, ""
    
    def bot_respond(chatbot_msgs: list, history: list):
        """
        마지막 사용자 메시지를 가져와 의도 파악 → 스트리밍 답변 생성.
        yield로 chatbot_msgs[-1]의 assistant content를 실시간 갱신.
        """
        if not chatbot_msgs:
            yield chatbot_msgs, history
            return
        
        # 마지막 사용자 메시지 추출 (Gradio가 content를 list로 래핑할 수 있으므로 안전 변환)
        user_message = ""
        for msg in reversed(chatbot_msgs):
            role = msg.get("role", "") if isinstance(msg, dict) else ""
            if role == "user":
                user_message = _extract_text(msg.get("content", ""))
                break
        
        if not user_message.strip():
            yield chatbot_msgs, history
            return
        
        if not GEMINI_API_KEY:
            error_msg = "⚠️ **GEMINI_API_KEY** 환경 변수가 설정되지 않았습니다. 환경 변수를 설정한 후 다시 시작해 주세요."
            chatbot_msgs[-1]["content"] = error_msg
            yield chatbot_msgs, chatbot_msgs
            return
        
        # 봇 이전까지의 히스토리 (플레이스홀더 제외)
        prev_history = chatbot_msgs[:-2] if len(chatbot_msgs) >= 2 else []
        
        # ── 1단계: 의도 파악 (비스트리밍) ──────────────────────
        print(f"\n[사용자 입력] {user_message}")
        intent = classify_intent(user_message, prev_history)
        category     = intent.get("category", "general")
        search_query = intent.get("search_query", user_message)
        general_msg  = intent.get("general_msg", "none")
        print(f"[의도 분류] category={category}, search_query={search_query}")
        
        # ── 2단계: 카테고리별 분기 + 스트리밍 ─────────────────
        if category == "product":
            # ★ 스트리밍 응답
            for partial_text in generate_product_answer_stream(user_message, search_query, prev_history):
                chatbot_msgs[-1]["content"] = partial_text
                yield list(chatbot_msgs), list(chatbot_msgs)
        
        elif category == "marketing":
            # ★ 스트리밍 응답
            for partial_text in generate_marketing_answer_stream(user_message, search_query, prev_history):
                chatbot_msgs[-1]["content"] = partial_text
                yield list(chatbot_msgs), list(chatbot_msgs)
        
        else:
            # general 카테고리: 짧은 응답이므로 스트리밍 불필요
            if general_msg and general_msg.lower() != "none":
                answer = general_msg
            else:
                answer = "안녕하세요! 😊 저는 **애터미 쇼핑몰 어시스턴트**입니다.\n\n상품 추천이나 **마케팅 플랜**에 대해 궁금한 점을 자유롭게 물어봐 주세요!"
            chatbot_msgs[-1]["content"] = answer
            yield list(chatbot_msgs), list(chatbot_msgs)
    
    def on_clear():
        return [], [], ""
    
    # ── 이벤트 체이닝: user_send (즉시) → bot_respond (스트리밍) ──
    send_btn.click(
        fn=user_send,
        inputs=[user_input, chat_history],
        outputs=[chatbot, chat_history, user_input],
        queue=False     # user 메시지 추가는 즉시 실행
    ).then(
        fn=bot_respond,
        inputs=[chatbot, chat_history],
        outputs=[chatbot, chat_history]
    )
    
    user_input.submit(
        fn=user_send,
        inputs=[user_input, chat_history],
        outputs=[chatbot, chat_history, user_input],
        queue=False
    ).then(
        fn=bot_respond,
        inputs=[chatbot, chat_history],
        outputs=[chatbot, chat_history]
    )
    
    clear_btn.click(
        fn=on_clear,
        inputs=None,
        outputs=[chatbot, chat_history, user_input]
    )

# ============================================================
# 13. 앱 실행
# 일반 실행 : python shop-assistant-stream.py
# 디버그 모드 (hot-reload): gradio shop-assistant-stream.py
# 또는  : python shop-assistant-stream.py --debug
# ============================================================
import sys

DEBUG_MODE = "--debug" in sys.argv

if __name__ == "__main__":
    demo.launch(
        inbrowser=True,
        css=CSS,
        debug=DEBUG_MODE,   # --debug 시 그라디오 내장 로그 활성화
    )

```