import { getResultPalette } from "./palette";
import type { AppConfig, TeaResult } from "./types";

type StoryImageInput = {
  config: AppConfig;
  result: TeaResult;
  resultUrl: string;
};

export async function createStoryBlob(input: StoryImageInput) {
  const canvas = document.createElement("canvas");
  canvas.width = input.config.sharing.storyImage.size.width;
  canvas.height = input.config.sharing.storyImage.size.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("스토리 이미지를 생성할 수 없어요.");
  }

  drawStoryCard(ctx, input);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("스토리 이미지를 생성할 수 없어요."));
        return;
      }
      resolve(blob);
    }, "image/png", 0.95);
  });
}

function drawStoryCard(ctx: CanvasRenderingContext2D, input: StoryImageInput) {
  const { config, result, resultUrl } = input;
  const width = config.sharing.storyImage.size.width;
  const height = config.sharing.storyImage.size.height;
  const palette = getResultPalette(result.id);

  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = palette.soft;
  ctx.beginPath();
  ctx.arc(890, 260, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.accent;
  ctx.globalAlpha = 0.13;
  for (let i = 0; i < 22; i += 1) {
    const x = 70 + ((i * 139) % 940);
    const y = 130 + ((i * 211) % 1640);
    ctx.beginPath();
    ctx.ellipse(x, y, 18, 46, -0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.textAlign = "center";
  ctx.fillStyle = "#2b241c";
  ctx.font = "700 58px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  ctx.fillText(config.appTitle, width / 2, 178);

  ctx.font = "500 32px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  ctx.fillStyle = "#706357";
  ctx.fillText(config.appSubtitle, width / 2, 235);

  ctx.fillStyle = palette.accent;
  roundedRect(ctx, 240, 360, 600, 600, 300);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.58)";
  roundedRect(ctx, 340, 490, 400, 250, 125);
  ctx.fill();

  ctx.fillStyle = "#2b241c";
  ctx.font = "800 86px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  ctx.fillText(result.teaName, width / 2, 690);

  ctx.fillStyle = "#2b241c";
  ctx.font = "800 70px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  wrapText(ctx, result.resultTitle, width / 2, 1110, 820, 92);

  ctx.font = "500 42px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  ctx.fillStyle = "#4f463d";
  ctx.fillText(result.storyDescription[0], width / 2, 1320);
  ctx.fillText(result.storyDescription[1], width / 2, 1385);

  ctx.font = "700 38px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  ctx.fillStyle = palette.dark;
  ctx.fillText(result.tags.map((tag) => `#${tag}`).join("   "), width / 2, 1515);

  ctx.font = "500 30px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  ctx.fillStyle = "#7b6b5f";
  ctx.fillText("나도 테스트하기", width / 2, 1732);
  ctx.fillText(stripProtocol(resultUrl), width / 2, 1780);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let lineIndex = 0;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y + lineIndex * lineHeight);
      line = word;
      lineIndex += 1;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, y + lineIndex * lineHeight);
  }
}

function stripProtocol(url: string) {
  return url.replace(/^https?:\/\//, "");
}
