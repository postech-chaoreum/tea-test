import fs from "node:fs";
import path from "node:path";

const siteBaseUrl = "https://postech-chaoreum.github.io/tea-test/";
const kakaoScrapVersion = "20260430-site-name";
const appConfig = JSON.parse(fs.readFileSync(path.resolve("data/app-config.json"), "utf8"));
const results = JSON.parse(fs.readFileSync(path.resolve("data/tea-results.json"), "utf8"));
const outputDir = path.resolve("public/share");

fs.rmSync(outputDir, { recursive: true, force: true });

for (const result of results) {
  const description = result.storyDescription.join(" ");
  const homeUrl = new URL(siteBaseUrl).toString();
  const imageUrl = new URL(`story-images/${encodeURIComponent(result.id)}.png`, siteBaseUrl).toString();
  const sharePaths = [
    `${encodeURIComponent(result.id)}/`,
    `${kakaoScrapVersion}/${encodeURIComponent(result.id)}/`,
  ];

  for (const sharePath of sharePaths) {
    const resultDir = path.join(outputDir, sharePath);
    fs.mkdirSync(resultDir, { recursive: true });

    fs.writeFileSync(
      path.join(resultDir, "index.html"),
      buildSharePage({
        appTitle: appConfig.appTitle,
        description,
        homeUrl,
        imageUrl,
        resultTitle: result.resultTitle,
        shareUrl: new URL(`share/${sharePath}`, siteBaseUrl).toString(),
        teaName: result.teaName,
      }),
    );
  }
}

console.log(`Generated ${results.length * 2} Kakao scrap pages.`);

function buildSharePage({
  appTitle,
  description,
  homeUrl,
  imageUrl,
  resultTitle,
  shareUrl,
  teaName,
}) {
  const title = `${resultTitle} | ${appTitle}`;
  const escapedHomeUrl = JSON.stringify(homeUrl);

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${escapeAttribute(homeUrl)}" />
    <meta name="description" content="${escapeAttribute(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeAttribute(appTitle)}" />
    <meta property="og:title" content="${escapeAttribute(title)}" />
    <meta property="og:description" content="${escapeAttribute(description)}" />
    <meta property="og:image" content="${escapeAttribute(imageUrl)}" />
    <meta property="og:image:width" content="1080" />
    <meta property="og:image:height" content="1920" />
    <meta property="og:url" content="${escapeAttribute(shareUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttribute(title)}" />
    <meta name="twitter:description" content="${escapeAttribute(description)}" />
    <meta name="twitter:image" content="${escapeAttribute(imageUrl)}" />
    <meta http-equiv="refresh" content="0; url=${escapeAttribute(homeUrl)}" />
    <script>
      window.location.replace(${escapedHomeUrl});
    </script>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(resultTitle)}</h1>
      <p>${escapeHtml(description)}</p>
      <p>${escapeHtml(teaName)} 결과를 확인하고 차BTI를 시작합니다.</p>
      <a href="${escapeAttribute(homeUrl)}">${escapeHtml(appTitle)}</a>
    </main>
  </body>
</html>
`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
