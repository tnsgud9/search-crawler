import { CrawlerCoordinator } from "./libs/crawlerCoordinator";
const text = `<body>
<a href="https://naver.com">hello</a>
<div>sdfaasdf</div>
<a href="https://kakao.com"> hello world</a>
</body>
`;
const matched = text.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1>/i);
console.log(matched);
const multipleMatched = text.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1>/g);
console.log(multipleMatched);

(async () => {
  const coodinator = new CrawlerCoordinator();
  coodinator.reportUrl("https://naver.com");
  await coodinator.start();
})();
