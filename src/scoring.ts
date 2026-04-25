import type { Answer, ScoredResult, ScoreMap, TeaResult } from "./types";

function addScore(map: ScoreMap, key: string, value: number) {
  map[key] = (map[key] ?? 0) + value;
}

export function calculateResult(results: TeaResult[], selectedAnswers: Answer[]) {
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

  const scoredResults: ScoredResult[] = results.map((result) => {
    const groupScore = result.groups.reduce(
      (sum, groupId) => sum + (groupScores[groupId] ?? 0),
      0,
    );
    const bonusScore = teaBonusScores[result.id] ?? 0;

    return {
      result,
      groupScore,
      bonusScore,
      finalScore: groupScore + bonusScore,
    };
  });

  scoredResults.sort((a, b) => {
    if (b.finalScore !== a.finalScore) {
      return b.finalScore - a.finalScore;
    }

    if (b.bonusScore !== a.bonusScore) {
      return b.bonusScore - a.bonusScore;
    }

    return a.result.priority - b.result.priority;
  });

  return {
    winner: scoredResults[0].result,
    scoredResults,
  };
}
