# 스코어링 명세

## 입력 데이터

- 결과 데이터: `data/tea-results.json`
- 질문 데이터: `data/questions.json`

각 결과 차는 여러 개의 `groups`를 가진다. 각 선지는 `scores.groups`와 `scores.teas`를 가진다.

```json
{
  "scores": {
    "groups": {
      "greenTeas": 2,
      "grassy": 3
    },
    "teas": {
      "greenTea": 1
    }
  }
}
```

## 계산 규칙

사용자가 선택한 선지들을 순회하면서 두 종류의 점수를 누적한다.

- 그룹 점수: `groupScores[groupId] += value`
- 개별 차 보정 점수: `teaBonusScores[teaId] += value`

각 결과 차의 최종 점수는 아래처럼 계산한다.

```txt
finalScore(tea) = sum(groupScores[group] for group in tea.groups)
                + teaBonusScores[tea.id]
```

## 동점 처리

최종 점수가 같은 결과가 여러 개라면 아래 순서로 결정한다.

```txt
1. 개별 차 보정 점수가 더 높은 차 우선
2. priority 값이 더 낮은 차 우선
```

`priority`는 `data/tea-results.json`에 들어 있다. 현재 임시 우선순위는 캐릭터가 선명한 결과를 조금 더 우선하도록 잡았다.

## TypeScript 의사 코드

```ts
type ScoreMap = Record<string, number>;

function addScore(map: ScoreMap, key: string, value: number) {
  map[key] = (map[key] ?? 0) + value;
}

function calculateResult(results: TeaResult[], selectedAnswers: Answer[]) {
  const groupScores: ScoreMap = {};
  const teaBonusScores: ScoreMap = {};

  for (const answer of selectedAnswers) {
    for (const [groupId, value] of Object.entries(answer.scores.groups ?? {})) {
      addScore(groupScores, groupId, value);
    }

    for (const [teaId, value] of Object.entries(answer.scores.teas ?? {})) {
      addScore(teaBonusScores, teaId, value);
    }
  }

  const scoredResults = results.map((result) => {
    const groupScore = result.groups.reduce(
      (sum, groupId) => sum + (groupScores[groupId] ?? 0),
      0
    );
    const bonusScore = teaBonusScores[result.id] ?? 0;

    return {
      result,
      groupScore,
      bonusScore,
      finalScore: groupScore + bonusScore
    };
  });

  return scoredResults.sort((a, b) => {
    if (b.finalScore !== a.finalScore) {
      return b.finalScore - a.finalScore;
    }

    if (b.bonusScore !== a.bonusScore) {
      return b.bonusScore - a.bonusScore;
    }

    return a.result.priority - b.result.priority;
  })[0];
}
```

## 구현 시 주의점

- 같은 답변 조합은 항상 같은 결과를 반환해야 한다.
- 랜덤 요소는 넣지 않는다.
- `scores.teas`가 비어 있어도 정상 처리해야 한다.
- 결과 차와 질문 선지에서 사용하는 차 ID는 반드시 `tea-results.json`의 `id`와 일치해야 한다.
- `similarTeaIds`도 존재하는 결과 ID만 참조해야 한다.
