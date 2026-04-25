import QRCode from "qrcode";
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

  await drawStoryCard(ctx, input);

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

async function drawStoryCard(ctx: CanvasRenderingContext2D, input: StoryImageInput) {
  const { config, result, resultUrl } = input;
  const width = config.sharing.storyImage.size.width;
  const height = config.sharing.storyImage.size.height;
  const palette = getResultPalette(result.id);
  const qrImage = await createQrImage(resultUrl, palette.dark);

  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.34)";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = palette.soft;
  ctx.beginPath();
  ctx.arc(880, 235, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.accent;
  ctx.globalAlpha = 0.12;
  drawLeafPattern(ctx);
  ctx.globalAlpha = 1;

  ctx.textAlign = "center";
  ctx.fillStyle = "#2b241c";
  ctx.font = "800 62px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  ctx.fillText(config.appTitle, width / 2, 164);

  ctx.font = "500 34px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  ctx.fillStyle = "#706357";
  ctx.fillText(config.appSubtitle, width / 2, 218);

  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(width / 2, 580, 285, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
  roundedRect(ctx, 315, 490, 450, 180, 90);
  ctx.fill();

  ctx.fillStyle = "#2b241c";
  drawCenteredLines(ctx, getTeaNameLines(result.teaName), width / 2, 603, 420, {
    font: "800 86px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
    lineHeight: 86,
    fillStyle: "#2b241c",
  });

  ctx.fillStyle = "#2b241c";
  ctx.font = "800 68px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  wrapText(ctx, result.resultTitle, width / 2, 1005, 850, 88);

  ctx.font = "500 40px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  ctx.fillStyle = "#4f463d";
  ctx.fillText(result.storyDescription[0], width / 2, 1248);
  ctx.fillText(result.storyDescription[1], width / 2, 1310);

  ctx.font = "700 38px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  ctx.fillStyle = palette.dark;
  ctx.fillText(result.tags.map((tag) => `#${tag}`).join("   "), width / 2, 1428);

  ctx.fillStyle = "rgba(255, 250, 240, 0.72)";
  roundedRect(ctx, 136, 1558, 808, 230, 54);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  roundedRect(ctx, 176, 1596, 154, 154, 22);
  ctx.fill();
  ctx.drawImage(qrImage, 188, 1608, 130, 130);

  ctx.textAlign = "left";
  ctx.fillStyle = "#2b241c";
  ctx.font = "800 38px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  ctx.fillText("나도 검사하러 가기", 370, 1650);
  ctx.font = "500 30px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  ctx.fillStyle = "#6f6256";
  ctx.fillText("QR로 차오름 차BTI 열기", 370, 1700);
  ctx.font = "700 28px 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  ctx.fillStyle = palette.dark;
  ctx.fillText(config.appTitle, 370, 1748);
}

function drawLeafPattern(ctx: CanvasRenderingContext2D) {
  const leaves = [
    [78, 132, -36],
    [236, 184, -32],
    [396, 238, -28],
    [195, 356, -36],
    [376, 404, -30],
    [828, 760, -30],
    [622, 904, -26],
    [790, 1038, -28],
    [958, 1090, -26],
    [168, 1256, -32],
    [760, 1378, -30],
    [926, 1410, -32],
    [112, 1586, -33],
    [272, 1694, -35],
  ];

  for (const [x, y, rotate] of leaves) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

async function createQrImage(url: string, color: string) {
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 260,
    color: {
      dark: color,
      light: "#ffffff",
    },
  });

  return loadImage(dataUrl);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("QR 이미지를 생성하지 못했어요."));
    image.src = src;
  });
}

function drawCenteredLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  centerY: number,
  maxWidth: number,
  options: {
    font: string;
    lineHeight: number;
    fillStyle: string;
  },
) {
  ctx.font = options.font;
  ctx.fillStyle = options.fillStyle;
  ctx.textAlign = "center";

  const fontSizeMatch = options.font.match(/(\d+)px/);
  const baseFontSize = fontSizeMatch ? Number(fontSizeMatch[1]) : 80;
  let fontSize = baseFontSize;

  while (fontSize > 48 && lines.some((line) => ctx.measureText(line).width > maxWidth)) {
    fontSize -= 4;
    ctx.font = options.font.replace(/\d+px/, `${fontSize}px`);
  }

  const startY = centerY - ((lines.length - 1) * options.lineHeight) / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, x, startY + index * options.lineHeight);
  });
}

function getTeaNameLines(teaName: string) {
  if (teaName === "과일 블렌딩 티") {
    return ["과일", "블렌딩 티"];
  }
  if (teaName.includes("/")) {
    return teaName.split("/");
  }
  return [teaName];
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
