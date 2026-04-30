import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { appConfig, questions, teaResults } from "./data";
import { shareToKakao } from "./kakao";
import { calculateResult } from "./scoring";
import { createStoryBlob } from "./storyImage";
import type { Answer, ScoredResult, TeaResult } from "./types";
import "./styles.css";

type Step = "start" | "question" | "result";

type ResultCharacterAsset = {
  src: string;
  position: string;
};

const resultCharacterAssets: Record<string, ResultCharacterAsset> = {
  green_tea_ujeon: {
    src: `${import.meta.env.BASE_URL}characters/green_tea_ujeon.jpg`,
    position: "50% 70%",
  },
  white_tea_baihao_yinzhen: {
    src: `${import.meta.env.BASE_URL}characters/white_tea_baihao_yinzhen.jpg`,
    position: "50% 68%",
  },
  oolong_tea_dahongpao: {
    src: `${import.meta.env.BASE_URL}characters/oolong_tea_dahongpao.jpg`,
    position: "50% 50%",
  },
  oolong_tea_oriental_beauty: {
    src: `${import.meta.env.BASE_URL}characters/oolong_tea_oriental_beauty.jpg`,
    position: "50% 50%",
  },
  black_tea_darjeeling: {
    src: `${import.meta.env.BASE_URL}characters/black_tea_darjeeling.jpg`,
    position: "50% 48%",
  },
  dark_tea_ripe_puer: {
    src: `${import.meta.env.BASE_URL}characters/dark_tea_ripe_puer.jpg`,
    position: "50% 58%",
  },
  herbal_tea_peppermint: {
    src: `${import.meta.env.BASE_URL}characters/herbal_tea_peppermint.jpg`,
    position: "50% 66%",
  },
  powdered_tea_matcha: {
    src: `${import.meta.env.BASE_URL}characters/powdered_tea_matcha.jpg`,
    position: "50% 66%",
  },
};

function getInitialResult() {
  const resultId = new URLSearchParams(window.location.search).get("result");
  return teaResults.find((result) => result.id === resultId) ?? null;
}

function getResultUrl(resultId: string) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("result", resultId);
  return url.toString();
}

function setResultUrl(resultId: string) {
  window.history.pushState({}, "", `?result=${encodeURIComponent(resultId)}`);
}

function clearResultUrl() {
  window.history.pushState({}, "", window.location.pathname);
}

function App() {
  const initialResult = getInitialResult();
  const isStoryCapture = new URLSearchParams(window.location.search).get("capture") === "story";
  const [step, setStep] = useState<Step>(initialResult ? "result" : "start");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<TeaResult | null>(initialResult);
  const [scoredResults, setScoredResults] = useState<ScoredResult[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const onPopState = () => {
      const nextResult = getInitialResult();
      if (nextResult) {
        setResult(nextResult);
        setScoredResults([]);
        setStep("result");
      } else {
        setResult(null);
        setStep("start");
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const startTest = () => {
    setStep("question");
    setQuestionIndex(0);
    setSelectedAnswers([]);
    setResult(null);
    setScoredResults([]);
    clearResultUrl();
  };

  const goToStart = () => {
    setStep("start");
    setQuestionIndex(0);
    setSelectedAnswers([]);
    setResult(null);
    setScoredResults([]);
    clearResultUrl();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseAnswer = (answer: Answer) => {
    const nextAnswers = [...selectedAnswers];
    nextAnswers[questionIndex] = answer;
    setSelectedAnswers(nextAnswers);

    const nextIndex = questionIndex + 1;
    if (nextIndex < questions.length) {
      setQuestionIndex(nextIndex);
      return;
    }

    const calculation = calculateResult(teaResults, nextAnswers);
    setResult(calculation.winner);
    setScoredResults(calculation.scoredResults);
    setStep("result");
    setResultUrl(calculation.winner.id);
  };

  const goBack = () => {
    if (questionIndex === 0) {
      setStep("start");
      return;
    }

    const previousIndex = questionIndex - 1;
    setQuestionIndex(previousIndex);
    setSelectedAnswers((answers) => answers.slice(0, previousIndex + 1));
  };

  const openSimilarResult = (resultId: string) => {
    const nextResult = teaResults.find((item) => item.id === resultId);
    if (!nextResult) return;
    setResult(nextResult);
    setScoredResults([]);
    setResultUrl(nextResult.id);
  };

  const showToast = (message: string) => setToast(message);

  const copyResultLink = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(getResultUrl(result.id));
    showToast("결과 링크를 복사했어요.");
  };

  const shareResult = async () => {
    if (!result) return;
    try {
      await shareToKakao({
        config: appConfig,
        result,
        resultUrl: getResultUrl(result.id),
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "카카오톡 공유에 실패했어요.");
    }
  };

  const createCurrentStoryBlob = async () => {
    if (!result) throw new Error("결과가 없습니다.");
    return createStoryBlob({
      config: appConfig,
      result,
      resultUrl: getResultUrl(result.id),
    });
  };

  const downloadStoryImage = async () => {
    if (!result) return;
    const blob = await createCurrentStoryBlob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cha-bti-${result.id}.png`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("스토리 이미지를 저장했어요.");
  };

  const shareStoryImage = async () => {
    if (!result) return;
    const blob = await createCurrentStoryBlob();
    const file = new File([blob], `cha-bti-${result.id}.png`, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: result.resultTitle,
        text: `${appConfig.appTitle} 결과`,
      });
      return;
    }

    await downloadStoryImage();
  };

  if (isStoryCapture && initialResult) {
    return <StoryCaptureScreen result={initialResult} />;
  }

  return (
    <>
      {step === "start" && <StartScreen onStart={startTest} />}
      {step === "question" && (
        <QuestionScreen
          questionIndex={questionIndex}
          onBack={goBack}
          onChooseAnswer={chooseAnswer}
        />
      )}
      {step === "result" && result && (
        <ResultScreen
          result={result}
          scoredResults={scoredResults}
          onCopyResultLink={copyResultLink}
          onDownloadStoryImage={downloadStoryImage}
          onOpenSimilarResult={openSimilarResult}
          onRestart={goToStart}
          onShareKakaoResult={shareResult}
          onShareStoryImage={shareStoryImage}
        />
      )}
      {toast && <div className="toast is-visible">{toast}</div>}
    </>
  );
}

function StoryCaptureScreen({ result }: { result: TeaResult }) {
  const qrSrc = `${import.meta.env.BASE_URL}qr/${result.id}.svg`;

  return (
    <main className={`story-capture-shell ${result.id}`}>
      <div className="story-lattice" aria-hidden="true" />
      <header className="story-header">
        <span>{appConfig.appTitle}</span>
        <small>{appConfig.appSubtitle}</small>
      </header>
      <section className="story-result-card">
        <StoryCharacter result={result} />
        <div className="story-copy">
          <TeaSymbol teaName={result.teaName} />
          <h1>{result.resultTitle}</h1>
          <p>
            {result.storyDescription.map((line) => (
              <React.Fragment key={line}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
          <div className="tag-row">
            {result.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>
      </section>
      <footer className="story-footer">
        <div>
          <strong>나도 테스트하기</strong>
          <span>QR로 결과 보고 바로 참여하기</span>
        </div>
        <img src={qrSrc} alt="차BTI 결과 링크 QR" />
      </footer>
    </main>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="app-shell start-screen">
      <section className="hero">
        <div className="lattice-window" aria-hidden="true" />
        <div className="brand-mark">茶</div>
        <p className="eyebrow">ChaoReum Tea Club</p>
        <h1>{appConfig.appTitle}</h1>
        <p className="subtitle">{appConfig.appSubtitle}</p>
        <p className="intro">{questions.length}개의 선택으로 지금 취향에 맞는 차를 찾아보세요.</p>
        <button className="primary-button" type="button" onClick={onStart}>
          시작하기
        </button>
      </section>
    </main>
  );
}

function QuestionScreen({
  questionIndex,
  onBack,
  onChooseAnswer,
}: {
  questionIndex: number;
  onBack: () => void;
  onChooseAnswer: (answer: Answer) => void;
}) {
  const question = questions[questionIndex];
  const progress = ((questionIndex + 1) / questions.length) * 100;

  return (
    <main className="app-shell question-screen">
      <section className="question-panel">
        <div className="topbar">
          <button className="ghost-button" type="button" onClick={onBack}>
            이전
          </button>
          <span>
            {questionIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="question-kicker">Tea preference note</p>
        <h2>{question.text}</h2>
        <div className="answer-list">
          {question.answers.map((answer, index) => (
            <button
              className="answer-button"
              key={answer.id}
              type="button"
              onClick={() => onChooseAnswer(answer)}
            >
              <span className="answer-index">{index + 1}</span>
              <span>{answer.text}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function ResultScreen({
  result,
  scoredResults,
  onCopyResultLink,
  onDownloadStoryImage,
  onOpenSimilarResult,
  onRestart,
  onShareKakaoResult,
  onShareStoryImage,
}: {
  result: TeaResult;
  scoredResults: ScoredResult[];
  onCopyResultLink: () => void;
  onDownloadStoryImage: () => void;
  onOpenSimilarResult: (resultId: string) => void;
  onRestart: () => void;
  onShareKakaoResult: () => void;
  onShareStoryImage: () => void;
}) {
  const similarResults = useMemo(
    () =>
      result.similarTeaIds
        .map((id) => teaResults.find((item) => item.id === id))
        .filter((item): item is TeaResult => Boolean(item)),
    [result.similarTeaIds],
  );
  const topScores = scoredResults.slice(0, 3);

  return (
    <main className="app-shell result-screen">
      <section className={`result-hero ${result.id}`}>
        <div className="result-hero-copy">
          <p className="eyebrow">{appConfig.appTitle}</p>
          <TeaSymbol teaName={result.teaName} />
          <h1>{result.resultTitle}</h1>
          <p className="result-copy">{result.resultDescription}</p>
          <div className="tag-row">
            {result.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>
        <ResultCharacter result={result} />
      </section>

      <section className="result-details">
        <article>
          <h2>추천 음용 방식</h2>
          <p>{result.recommendedStyle}</p>
        </article>
        <article>
          <h2>추천 차/제품</h2>
          <ul className="product-list">
            {result.productRecommendations.map((product) => (
              <li key={product.name}>
                <strong>{product.name}</strong>
                <span>{product.note}</span>
              </li>
            ))}
          </ul>
        </article>
        <article>
          <h2>잘 맞는 순간</h2>
          <p>{result.bestMoment}</p>
        </article>
        <article>
          <h2>비슷한 차</h2>
          <div className="similar-list">
            {similarResults.map((similar) => (
              <button
                className="similar-button"
                key={similar.id}
                type="button"
                onClick={() => onOpenSimilarResult(similar.id)}
              >
                {similar.teaName}
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="share-panel">
        <h2>결과 공유</h2>
        <div className="share-grid">
          <button className="secondary-button" type="button" onClick={onShareKakaoResult}>
            결과 카카오톡 공유
          </button>
          <button className="secondary-button" type="button" onClick={onCopyResultLink}>
            결과 링크 복사
          </button>
          <button className="secondary-button" type="button" onClick={onShareStoryImage}>
            이미지 공유
          </button>
          <button className="secondary-button" type="button" onClick={onDownloadStoryImage}>
            이미지 저장
          </button>
        </div>
        <button className="primary-button wide" type="button" onClick={onRestart}>
          나도 검사하기
        </button>
      </section>

      {topScores.length > 0 && <ScoreDetails topScores={topScores} />}
    </main>
  );
}

function StoryCharacter({ result }: { result: TeaResult }) {
  const character = resultCharacterAssets[result.id];
  if (!character) return null;

  return (
    <figure
      className="story-character"
      style={{ "--character-position": character.position } as React.CSSProperties}
    >
      <img src={character.src} alt={`${result.teaName} 캐릭터`} />
    </figure>
  );
}

function ResultCharacter({ result }: { result: TeaResult }) {
  const character = resultCharacterAssets[result.id];
  if (!character) return null;

  return (
    <figure
      className="result-character"
      style={{ "--character-position": character.position } as React.CSSProperties}
    >
      <img src={character.src} alt={`${result.teaName} 캐릭터`} />
    </figure>
  );
}

function TeaSymbol({ teaName }: { teaName: string }) {
  const lines = getTeaSymbolLines(teaName);

  return (
    <div className="tea-symbol">
      <span className={`tea-symbol-text ${lines.length > 1 ? "multi-line" : ""}`}>
        {lines.map((line) => (
          <React.Fragment key={line}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </span>
    </div>
  );
}

function getTeaSymbolLines(teaName: string) {
  const overrides: Record<string, string[]> = {
    "과일 블렌딩 티": ["과일", "블렌딩 티"],
  };

  if (overrides[teaName]) {
    return overrides[teaName];
  }

  if (teaName.includes("/")) {
    return teaName.split("/");
  }

  return [teaName];
}

function ScoreDetails({ topScores }: { topScores: ScoredResult[] }) {
  return (
    <details className="score-details">
      <summary>상위 결과 점수</summary>
      <ol>
        {topScores.map((item) => (
          <li key={item.result.id}>
            {item.result.teaName}
            <span>{item.finalScore}점</span>
          </li>
        ))}
      </ol>
    </details>
  );
}

createRoot(document.querySelector("#app")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
