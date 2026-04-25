export type ScoreMap = Record<string, number>;

export type Answer = {
  id: string;
  text: string;
  scores: {
    groups?: ScoreMap;
    teas?: ScoreMap;
  };
};

export type Question = {
  id: string;
  text: string;
  answers: Answer[];
};

export type ProductRecommendation = {
  name: string;
  note: string;
};

export type TeaResult = {
  id: string;
  teaName: string;
  resultTitle: string;
  groups: string[];
  storyDescription: [string, string];
  resultDescription: string;
  tags: string[];
  recommendedStyle: string;
  productRecommendations: ProductRecommendation[];
  bestMoment: string;
  similarTeaIds: string[];
  priority: number;
};

export type AppConfig = {
  appTitle: string;
  appSubtitle: string;
  questionCount: number;
  resultCount: number;
  resultTitlePattern: string;
  resultTone: string;
  visualTone: {
    campusFestival: number;
    memeTest: number;
    traditionalTea: number;
  };
  sharing: {
    kakaoTalk: {
      enabled: boolean;
      method: string;
      sdkUrl: string;
      javascriptKey: string;
      shareMode: "default" | "custom";
      customTemplateId: number | null;
      defaultImagePath: string;
      requires: string[];
    };
    nativeShare: {
      enabled: boolean;
      method: string;
      fallbacks: string[];
    };
    storyImage: {
      enabled: boolean;
      size: {
        width: number;
        height: number;
      };
      contentDensity: string;
    };
  };
};

export type ScoredResult = {
  result: TeaResult;
  groupScore: number;
  bonusScore: number;
  finalScore: number;
};
