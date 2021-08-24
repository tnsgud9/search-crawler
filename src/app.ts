import { parse } from "node-html-parser";
import { CrawlerCoordinator } from "./libs/crawlerCoordinator";

const text = `<body>
<a href="https://naver.com">hello</a>
<div>sdfaasdf</div>
<a href="https://kakao.com"> hello world</a>
</body>
`;

const html = parse(text);
//console.log(html.querySelector("a"));

/*const matched = text.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1>/i);
console.log(matched);
const multipleMatched = text.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1>/g);
console.log(multipleMatched);*/

(async () => {
  const coodinator = new CrawlerCoordinator();
  coodinator.reportUrl("https://news.naver.com");
  await coodinator.start();
})();
