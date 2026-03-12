---
title: 04 Antigravity Rule 설정
---
# 폴더 생성
프로젝트를 시작하기 위해서 post-note 라는 (프로젝트명) 폴더를 작업 디렉토리에 생성합니다.

# 프록젝트 열기
Antigravity에서 해당 폴더를 선택하면(새창 혹은 프로젝트에서 디렉토리 열기로) 다음과 같은 화면이 나타납니다. 이 때 "Yes"를 누릅니다.


![](attachments/Pasted%20image%2020260312091314.png)

이렇게 비어있는 프로젝트를 만날수 있습니다.
![](attachments/Pasted%20image%2020260312091446.png)
# GEMINI.md 파일 생성
왼쪽 창에서 "New File"를 클릭하고 룰을 만들기 위한 GEMINI.md를 생성합니다.
![](attachments/Pasted%20image%2020260312091547.png)

해당 파일에 다음 내용을 넣습니다.
```markdown
# GEMINI Project Rules

## Test Code Management
- All test codes and scripts must be managed under the `/test` directory.
- Test result files (e.g., JSON outputs, logs) should also be stored within the `/test` directory to keep the source tree clean.

## Coding Rules
1. Always use Sequential Thinking MCP except for simple corrections.
2. Always use Context7 MCP when the user attaches a link and requests development with reference to it.


## Scripts Directory
- All utility scripts, maintenance scripts, and temporary working scripts MUST be placed in the root `/scripts` directory.
- Do NOT write temporary scripts to the project root, `/tmp`, `backend/`, or any other location.
- Scripts in `/scripts` should use relative paths calculated from `os.path.dirname(os.path.abspath(__file__))` to locate project files.
- Example: `_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))` to reference the project root.

## Frontend Development
- After modifying frontend code, ALWAYS check the terminal logs for build errors.
- If errors exist, verify the fix and ensure the build passes before completing the task.

## Backend Service Python Implementation Rules
- Each backend service implementation should correspond to a single frontend menu item to minimize file size.
- Implement services by splitting them into minimal files following the pattern: `services/sales/{service_category}/{service_implementation_name}.py`.

## SQL Injection Prevention
- To prevent SQL Injection, all queries must be implemented using parameters.
- When using dynamic columns (Sort, Filter, etc.), validity must be verified through a whitelist (mapping, etc.).

## Code Documentation
- When adding or modifying source code, ALWAYS add detailed comments explaining the implementation.
- Comments should describe the purpose, logic, and any important considerations for the code being added or changed.
- **All comments must be written in Korean (한국어).**

## API Verification
- When a new API is added, verify it using CURL and test codes to ensure there are no issues.
- Continue verification until the API functions correctly.
- If the retry loop exceeds 5 attempts, notify the administrator about the issue.

## Wiki Documentation Auto-Update
- When backend source code (routers, services, models, utils) is added or modified, ALWAYS update `docs/backend-wiki.md` to reflect the changes.
- When frontend source code (pages, components, lib, hooks) is added or modified, ALWAYS update `docs/frontend-wiki.md` to reflect the changes.
- Wiki updates should include: new API endpoints, new/modified service functions, new pages/components, schema changes, and any structural changes.
- Keep the wiki documentation in sync with the actual codebase at all times.
```

# GEMINI.md 란
`GEMINI.md`는 Antigravity 환경에서 **프로젝트의 '전역 규칙(Global Rules)'과 '가이드라인'을 정의하는 설정 파일**입니다. 타 플랫폼의 `.cursorrules`나 `CLAUDE.md`와 유사한 역할을 합니다.

### 주요 기능

- **에이전트의 페르소나 설정:** 에이전트가 어떤 톤으로 답변할지, 어떤 기술 스택(예: React, Tailwind)을 우선적으로 사용할지 정의합니다.
    
- **프로젝트 컨텍스트 공유:** 에이전트가 코드를 작성할 때마다 매번 설명할 필요 없이, 이 파일에 적힌 프로젝트 구조나 코딩 컨벤션을 자동으로 참조합니다.
    
- **자동 로드:** Antigravity는 워크스페이스나 시스템 경로(`~/.gemini/GEMINI.md`)에 있는 이 파일을 **모든 LLM 호출 시 컨텍스트에 포함**시킵니다.

