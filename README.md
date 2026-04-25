# 차오름 차BTI

차 동아리 차오름의 문답형 차 추천 테스트입니다.

## 현재 상태

- Vite + React + TypeScript MVP 구현
- 질문 8개 진행
- 그룹 점수 + 개별 차 보정 점수 기반 결과 계산
- 결과 페이지 직접 링크 지원: `?result=greenTea`
- Kakao JavaScript SDK 기반 결과 공유
- 1080x1920 스토리 이미지 저장/공유

## 로컬 실행

```powershell
npm install --cache .npm-cache --ignore-scripts
npm run dev
```

브라우저에서 `http://127.0.0.1:5173`을 열면 됩니다.

현재 Windows 환경에서 npm script가 PATH의 다른 Node shim을 집는 문제를 피하기 위해, `package.json` scripts는 `C:\Progra~1\nodejs\node.exe`를 직접 사용합니다.

## 빌드

```powershell
npm run build
```

## 데이터

- `data/app-config.json`: 앱 제목, 공유 설정
- `data/questions.json`: 질문과 점수
- `data/tea-results.json`: 결과 차 데이터
- `docs/scoring.md`: 계산 명세

## 카카오톡 공유 설정

`data/app-config.json`의 `sharing.kakaoTalk` 값을 설정하면 됩니다.

```json
{
  "javascriptKey": "카카오 JavaScript 키",
  "shareMode": "default",
  "customTemplateId": null
}
```

카카오 Developers에서 웹 플랫폼 도메인에 배포 URL을 등록해야 실제 공유가 동작합니다. 커스텀 템플릿을 쓰려면 `shareMode`를 `custom`으로 바꾸고 `customTemplateId`를 템플릿 ID 숫자로 설정하세요.

커스텀 템플릿에서 사용할 수 있는 변수:

```txt
${app_title}
${app_subtitle}
${result_id}
${result_title}
${tea_name}
${description}
${tag_1}
${tag_2}
${tags}
${recommended_style}
${result_url}
${image_url}
```
