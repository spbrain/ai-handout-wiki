---
title: 09 LLM 히스토리 관리
---
# 주요 LLM별 대화 기록(History) 및 시스템 프롬프트 관리 가이드

---

### 1. 한눈에 보는 LLM별 Role(역할) 규칙 비교

LLM과 대화를 주고받을 때는 "누가" 말했는지를 명시해야 합니다. 이를 **Role(역할)**이라고 부르며, 모델마다 기대하는 역할 이름이 다릅니다.

| **LLM 종류**           | **사용자 역할**         | **AI 응답 역할**  | **시스템 프롬프트 주입 방식**                                      |
| -------------------- | ------------------ | ------------- | ------------------------------------------------------- |
| **OpenAI (GPT)**     | `"user"`           | `"assistant"` | `"system"` 역할로 `messages` 배열의 맨 앞에 추가                   |
| **Google Gemini**    | `"user"`           | **`"model"`** | `GenerateContentConfig(system_instruction=...)` 파라미터 사용 |
| **Anthropic Claude** | `"user"`           | `"assistant"` | `system=...` 별도 파라미터로 분리하여 전달                           |
| **Meta LLaMA**       | `[INST]...[/INST]` | 태그 없음         | `<<SYS>>...<</SYS>>` 태그로 감싸서 전달                         |

> 💡 **핵심 포인트:** AI의 응답을 지칭하는 단어가 모델마다 다릅니다. GPT와 Claude는 **`assistant`**를 사용하지만, Gemini는 **`model`**을 사용합니다.

---

### 2.  실무 주의보: Gemini 전환 시 발생하는 치명적 오류

가장 많은 개발자가 겪는 문제는 **Gradio나 LangChain 같은 범용 프레임워크가 기본적으로 OpenAI 스타일(`assistant`)을 사용**한다는 점입니다.

만약 화면 단(UI)에서 만들어진 대화 기록을 그대로 Gemini API에 밀어 넣으면 에러가 발생합니다. **반드시 변환 과정이 필요합니다.**

#### [잘못된 접근 & 올바른 변환 로직]

Python

```
# ❌ UI 프레임워크(예: Gradio)에서 넘어오는 기본 형식 (OpenAI 스타일)
gradio_history = {"role": "assistant", "content": "상품 추천 답변입니다..."}

# ✅ Gemini API에 보내기 전 변환 로직 (필수!)
# 'assistant'라는 역할을 발견하면 'model'로 이름을 바꿔주어야 합니다.
gemini_role = "model" if role == "assistant" else "user"

types.Content(role=gemini_role, parts=[...])
```

---

### 3. 시스템 프롬프트(System Prompt) 전달 방식의 차이

"당신은 친절한 고객 센터 상담원입니다."와 같이 AI의 페르소나와 기본 규칙을 정해주는 시스템 프롬프트 역시, 모델마다 전달하는 '위치'가 다릅니다.

#### A. 배열 안에 넣는 방식 (OpenAI GPT)

GPT는 대화 기록(`messages`) 배열 안에 시스템 프롬프트를 **하나의 대화 턴처럼** 취급하여 맨 처음에 넣습니다.

Python

```
messages = [
    {"role": "system",    "content": "당신은 전문 상담원입니다."},  # 배열 내부에 위치
    {"role": "user",      "content": "안녕하세요"},
    {"role": "assistant", "content": "안녕하세요!"},
]
client.chat.completions.create(model="gpt-4", messages=messages)
```

#### B. 완전히 분리하는 방식 (Google Gemini & Claude)

Gemini와 Claude는 "규칙"과 "실제 대화"를 엄격하게 분리합니다. 시스템 프롬프트는 대화 배열(`contents` 또는 `messages`)에 넣지 않고 **별도의 파라미터**로 전달해야 합니다.

**[Google Gemini의 경우]**

Python

```
gemini_client.models.generate_content(
    model="gemini-2.5",
    # 1. 시스템 프롬프트는 별도 Config 객체에 넣습니다.
    config=types.GenerateContentConfig(
        system_instruction="당신은 전문 상담원입니다.", 
    ),
    # 2. contents 배열에는 순수한 user와 model의 대화만 들어갑니다.
    contents=[  
        types.Content(role="user",  parts=[...]),
        types.Content(role="model", parts=[...]),
    ]
)
```

**[Anthropic Claude의 경우]**

Python

```
claude_client.messages.create(
    model="claude-3-5-sonnet",
    # 시스템 프롬프트를 API 호출의 최상단 파라미터로 분리합니다.
    system="당신은 전문 상담원입니다.",  
    messages=[
        {"role": "user",      "content": "안녕하세요"},
        {"role": "assistant", "content": "안녕하세요!"},
    ]
)
```

---

### 📝 핵심 요약 (Takeaway)

만약 여러분이 기존에 작성해 둔 **OpenAI 기반의 코드를 Google Gemini나 Claude로 마이그레이션(교체)** 해야 한다면, 딱 이 두 가지만 기억하고 수정하시면 됩니다.

1. **Role 이름 변경 점검 (특히 Gemini):** 대화 기록을 파싱할 때 `assistant`를 `model`로 바꿔주는 전처리 코드가 들어갔는가?
    
2. **시스템 프롬프트의 위치 변경:** `messages` 배열 안에 있던 `{"role": "system", ...}` 항목을 빼내서, 각 API가 요구하는 별도의 시스템 파라미터(`system_instruction` 또는 `system`)로 옮겼는가?