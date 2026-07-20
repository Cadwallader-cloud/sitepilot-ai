import { readFileSync } from "node:fs";

// Dynamic import of built paths via evaluating catalog isn't easy in mjs without ts.
// Instead verify demo-images.ts URLs + HTTP status of key demo routes.

const src = readFileSync("src/lib/demo-images.ts", "utf8");
const urls = [...src.matchAll(/https:\/\/images\.unsplash\.com\/[^"']+/g)].map(
  (m) => m[0],
);
const unique = [...new Set(urls)];
console.log("unique image urls", unique.length, "total refs", urls.length);

let ok = 0;
let fail = 0;
const broken = [];
for (const url of unique) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (res.ok) ok += 1;
    else {
      fail += 1;
      broken.push([url, res.status]);
    }
  } catch (e) {
    fail += 1;
    broken.push([url, String(e)]);
  }
}
console.log("images ok", ok, "fail", fail);
if (broken.length) console.log(broken.slice(0, 10));

const slugs = [...src.matchAll(/"([a-z0-9-]+)":\s*\{/g)].map((m) => m[1]);
console.log("slugs", slugs.length);

let pagesOk = 0;
let pagesFail = 0;
for (const slug of slugs) {
  const url = `https://crestis.app/demos/${slug}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (res.ok) pagesOk += 1;
    else {
      pagesFail += 1;
      console.log("page fail", slug, res.status);
    }
  } catch (e) {
    pagesFail += 1;
    console.log("page err", slug, e.message);
  }
}
console.log("pages ok", pagesOk, "fail", pagesFail);
