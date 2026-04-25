import type { AppConfig, TeaResult } from "./types";

type KakaoSharePayload = Record<string, unknown>;

type KakaoSdk = {
  init: (javascriptKey: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (payload: KakaoSharePayload) => void;
    sendCustom: (payload: KakaoSharePayload) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

type KakaoShareInput = {
  config: AppConfig;
  result: TeaResult;
  resultUrl: string;
};

let sdkLoadPromise: Promise<KakaoSdk> | null = null;

export async function shareToKakao({ config, result, resultUrl }: KakaoShareInput) {
  const kakaoConfig = config.sharing.kakaoTalk;

  if (!kakaoConfig.enabled) {
    throw new Error("카카오톡 공유가 비활성화되어 있어요.");
  }

  if (!kakaoConfig.javascriptKey.trim()) {
    throw new Error("카카오 JavaScript 키를 data/app-config.json에 설정해야 해요.");
  }

  const Kakao = await loadKakaoSdk(kakaoConfig.sdkUrl);
  if (!Kakao.isInitialized()) {
    Kakao.init(kakaoConfig.javascriptKey);
  }

  if (kakaoConfig.shareMode === "custom" && kakaoConfig.customTemplateId) {
    Kakao.Share.sendCustom({
      templateId: kakaoConfig.customTemplateId,
      templateArgs: buildCustomTemplateArgs({ config, result, resultUrl }),
      serverCallbackArgs: {
        result_id: result.id,
      },
    });
    return;
  }

  Kakao.Share.sendDefault(buildDefaultTemplate({ config, result, resultUrl }));
}

function loadKakaoSdk(sdkUrl: string) {
  if (window.Kakao) {
    return Promise.resolve(window.Kakao);
  }

  if (sdkLoadPromise) {
    return sdkLoadPromise;
  }

  sdkLoadPromise = new Promise<KakaoSdk>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = sdkUrl;
    script.async = true;
    script.onload = () => {
      if (!window.Kakao) {
        reject(new Error("Kakao SDK를 불러오지 못했어요."));
        return;
      }
      resolve(window.Kakao);
    };
    script.onerror = () => reject(new Error("Kakao SDK 로딩에 실패했어요."));
    document.head.appendChild(script);
  });

  return sdkLoadPromise;
}

function buildDefaultTemplate({ config, result, resultUrl }: KakaoShareInput) {
  const imageUrl = getKakaoShareImageUrl(config);
  const description = result.storyDescription.join(" ");
  const firstProduct = result.productRecommendations[0]?.name ?? result.teaName;

  return {
    objectType: "feed",
    content: {
      title: result.resultTitle,
      description,
      imageUrl,
      imageWidth: 800,
      imageHeight: 800,
      link: buildLink(resultUrl),
    },
    itemContent: {
      profileText: config.appTitle,
      profileImageUrl: imageUrl,
      titleImageUrl: imageUrl,
      titleImageText: result.teaName,
      titleImageCategory: "차BTI",
      items: [
        {
          item: "추천 차",
          itemOp: result.teaName,
        },
        {
          item: "추천 제품",
          itemOp: firstProduct,
        },
        {
          item: "포인트",
          itemOp: result.tags.map((tag) => `#${tag}`).join(" "),
        },
      ],
    },
    social: {
      likeCount: 286,
      commentCount: 45,
      sharedCount: 845,
    },
    buttons: [
      {
        title: "결과 자세히 보기",
        link: buildLink(resultUrl),
      },
      {
        title: "나도 검사하러 가기",
        link: buildLink(getTestHomeUrl()),
      },
    ],
    serverCallbackArgs: {
      result_id: result.id,
    },
  };
}

function buildCustomTemplateArgs({ config, result, resultUrl }: KakaoShareInput) {
  return {
    app_title: config.appTitle,
    app_subtitle: config.appSubtitle,
    result_id: result.id,
    result_title: result.resultTitle,
    tea_name: result.teaName,
    description: result.storyDescription.join(" "),
    tag_1: `#${result.tags[0] ?? "차BTI"}`,
    tag_2: `#${result.tags[1] ?? "차오름"}`,
    tags: result.tags.map((tag) => `#${tag}`).join(" "),
    recommended_style: result.recommendedStyle,
    result_url: resultUrl,
    test_url: getTestHomeUrl(),
    image_url: getKakaoShareImageUrl(config),
  };
}

function buildLink(url: string) {
  return {
    mobileWebUrl: url,
    webUrl: url,
  };
}

function getTestHomeUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  return url.toString();
}

function getKakaoShareImageUrl(config: AppConfig) {
  const imagePath = config.sharing.kakaoTalk.defaultImagePath;
  if (/^https?:\/\//.test(imagePath)) {
    return imagePath;
  }

  const normalizedPath = imagePath.replace(/^\//, "");
  return new URL(`${import.meta.env.BASE_URL}${normalizedPath}`, window.location.href).toString();
}
