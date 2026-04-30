import type { AppConfig, TeaResult } from "./types";
import { getStoryImageUrl } from "./storyImage";

type KakaoWebLink = {
  mobileWebUrl: string;
  webUrl: string;
};

type KakaoFeedTemplate = {
  objectType: "feed";
  content: {
    title: string;
    description: string;
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    link: KakaoWebLink;
  };
  buttons: Array<{
    title: string;
    link: KakaoWebLink;
  }>;
  serverCallbackArgs: {
    result_id: string;
  };
};

type KakaoSharePayload = Record<string, unknown>;
type KakaoShareButtonPayload = KakaoFeedTemplate & { container: string };

type KakaoSdk = {
  init: (javascriptKey: string) => void;
  isInitialized: () => boolean;
  Share: {
    createDefaultButton: (payload: KakaoShareButtonPayload) => void;
    sendDefault: (payload: KakaoFeedTemplate) => void;
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

type KakaoShareButtonInput = KakaoShareInput & {
  container: string;
};

const productionSiteUrl = "https://postech-chaoreum.github.io/tea-test/";

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

export async function setupKakaoShareButton({
  config,
  container,
  result,
  resultUrl,
}: KakaoShareButtonInput) {
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

  Kakao.Share.createDefaultButton({
    container,
    ...buildDefaultTemplate({ config, result, resultUrl }),
  });
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

function buildDefaultTemplate({ config, result, resultUrl }: KakaoShareInput): KakaoFeedTemplate {
  const imageUrl = getKakaoShareImageUrl(config, result);
  const canonicalResultUrl = getCanonicalSiteUrl(resultUrl);
  const canonicalHomeUrl = getCanonicalSiteUrl(getTestHomeUrl());
  const description = result.storyDescription.join(" ");

  return {
    objectType: "feed",
    content: {
      title: result.resultTitle,
      description,
      imageUrl,
      imageWidth: 800,
      imageHeight: 800,
      link: buildLink(canonicalResultUrl),
    },
    buttons: [
      {
        title: "웹으로 보기",
        link: buildLink(canonicalResultUrl),
      },
      {
        title: "나도 검사하기",
        link: buildLink(canonicalHomeUrl),
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
    image_url: getKakaoShareImageUrl(config, result),
  };
}

function buildLink(url: string): KakaoWebLink {
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

function getKakaoShareImageUrl(config: AppConfig, result: TeaResult) {
  if (config.sharing.storyImage.enabled) {
    return getCanonicalSiteUrl(getStoryImageUrl(result.id));
  }

  const imagePath = config.sharing.kakaoTalk.defaultImagePath;
  if (/^https?:\/\//.test(imagePath)) {
    return imagePath;
  }

  const normalizedPath = imagePath.replace(/^\//, "");
  return getCanonicalSiteUrl(
    new URL(`${import.meta.env.BASE_URL}${normalizedPath}`, window.location.href).toString(),
  );
}

function getCanonicalSiteUrl(url: string) {
  const sourceUrl = new URL(url, window.location.href);
  const canonicalUrl = new URL(productionSiteUrl);
  const basePath = canonicalUrl.pathname.replace(/\/$/, "");
  const sourcePath = sourceUrl.pathname.replace(/\/$/, "");
  const sourcePathWithoutBase = sourcePath.startsWith(basePath)
    ? sourcePath.slice(basePath.length)
    : sourcePath;

  const combinedPath = `${basePath}${sourcePathWithoutBase}`;
  canonicalUrl.pathname =
    combinedPath.endsWith("/") || sourcePathWithoutBase ? combinedPath : `${combinedPath}/`;
  canonicalUrl.search = sourceUrl.search;
  canonicalUrl.hash = sourceUrl.hash;
  return canonicalUrl.toString();
}
