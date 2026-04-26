import type { AppConfig, TeaResult } from "./types";

type StoryImageInput = {
  config: AppConfig;
  result: TeaResult;
  resultUrl: string;
};

export async function createStoryBlob(input: StoryImageInput) {
  const response = await fetch(getStoryImageUrl(input.result.id), {
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error("공유 이미지를 불러오지 못했어요.");
  }

  return response.blob();
}

export function getStoryImageUrl(resultId: string) {
  const normalizedPath = `story-images/${resultId}.png`;
  return new URL(`${import.meta.env.BASE_URL}${normalizedPath}`, window.location.href).toString();
}
