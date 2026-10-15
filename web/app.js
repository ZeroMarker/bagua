// 三錢法：字(陽面)記 3、背記 2，三枚相加：6 老陰(變) 7 少陽 8 少陰 9 老陽(變)
const POS = ["初", "二", "三", "四", "五", "上"];
const T = {
  hant: {
    title: "周易占卜", sub: "三錢法起卦 · 文王六十四卦", ask: "心中默念所問之事（可不填）",
    toss: "擲錢", auto: "一次起卦", reset: "重新起卦", switchTo: "简",
    names: { 6: "老陰", 7: "少陽", 8: "少陰", 9: "老陽" }, heads: "字", tails: "背",
    progress: (n, pos, name) => `第 ${n} 爻（${pos}）：${name}`,
    loadFail: "無法載入卦辭資料，請用本地伺服器開啟（python3 -m http.server）",
    ben: "本卦", zhi: "之卦", gua: "卦", nth: (n) => `第${n}卦`, judgment: "卦辭", tuan: "彖曰", xiang: "象曰",
    lines: "爻辭", wenyan: "文言", full: "全文", asked: "所問", of: "之",
    rules: [
      "六爻皆不變，以本卦卦辭占。", "一爻變，以本卦變爻之辭占。", "二爻變，以本卦二變爻之辭占，以上爻為主。",
      "三爻變，占本卦及之卦卦辭，以本卦為主。", "四爻變，以之卦二不變爻之辭占，以下爻為主。",
      "五爻變，以之卦不變爻之辭占。", "六爻皆變，以之卦卦辭占。",
    ],
    allYong: (name, pos) => `六爻皆變，${name}卦占「${pos}」。`,
  },
  hans: {
    title: "周易占卜", sub: "三钱法起卦 · 文王六十四卦", ask: "心中默念所问之事（可不填）",
    toss: "掷钱", auto: "一次起卦", reset: "重新起卦", switchTo: "繁",
    names: { 6: "老阴", 7: "少阳", 8: "少阴", 9: "老阳" }, heads: "字", tails: "背",
    progress: (n, pos, name) => `第 ${n} 爻（${pos}）：${name}`,
    loadFail: "无法载入卦辞资料，请用本地服务器打开（python3 -m http.server）",
    ben: "本卦", zhi: "之卦", gua: "卦", nth: (n) => `第${n}卦`, judgment: "卦辞", tuan: "彖曰", xiang: "象曰",
    lines: "爻辞", wenyan: "文言", full: "全文", asked: "所问", of: "之",
    rules: [
      "六爻皆不变，以本卦卦辞占。", "一爻变，以本卦变爻之辞占。", "二爻变，以本卦二变爻之辞占，以上爻为主。",
      "三爻变，占本卦及之卦卦辞，以本卦为主。", "四爻变，以之卦二不变爻之辞占，以下爻为主。",
      "五爻变，以之卦不变爻之辞占。", "六爻皆变，以之卦卦辞占。",
    ],
    allYong: (name, pos) => `六爻皆变，${name}卦占「${pos}」。`,
  },
};
const FILES = { hant: "data/yijing.json", hans: "data/yijing.zh-Hans.json" };
const $ = (id) => document.getElementById(id);

let lang = localStorage.getItem("lang") || (/^zh-(CN|SG|Hans)/i.test(navigator.language) ? "hans" : "hant");
let byBinary = {}, throws = [], lastCoins = null;
const cache = {};
const t = () => T[lang];

async function loadData() {
  if (!cache[lang]) cache[lang] = await fetch(FILES[lang]).then((r) => r.json());
  byBinary = {};
  for (const h of cache[lang].hexagrams) byBinary[h.lines_binary] = h;
}

function applyLang() {
  document.documentElement.lang = lang === "hans" ? "zh-Hans" : "zh-Hant";
  document.querySelectorAll("[data-t]").forEach((el) => (el.textContent = t()[el.dataset.t]));
  document.querySelectorAll("[data-t-placeholder]").forEach((el) => (el.placeholder = t()[el.dataset.tPlaceholder]));
  $("lang").textContent = t().switchTo;
}

async function setLang(l) {
  lang = l;
  localStorage.setItem("lang", l);
  try {
    await loadData();
  } catch {
    $("progress").textContent = t().loadFail;
    $("toss").disabled = $("auto").disabled = true;
    return;
  }
  applyLang();
  render();
}

function tossCoins() {
  const coins = Array.from({ length: 3 }, () => (crypto.getRandomValues(new Uint8Array(1))[0] & 1 ? 3 : 2));
  return { coins, value: coins.reduce((a, b) => a + b) };
}

function toss() {
  if (!Object.keys(byBinary).length || throws.length >= 6) return;
  const r = tossCoins();
  throws.push(r.value);
  lastCoins = r.coins;
  render();
}

const isMoving = (v) => v === 6 || v === 9;

function yaoHtml(yang, moving, mark = "") {
  return `<div class="yao ${moving ? "moving" : ""}"><div class="bar ${yang ? "yang" : "yin"}"><span></span><span></span></div><span class="mark">${mark}</span></div>`;
}

function hexTitle(h, label) {
  return `<div class="title">${label}：${h.name}<small>${h.symbol} ${h.lower}下${h.upper}上 · ${t().nth(h.number)}</small></div>`;
}

function render() {
  const done = throws.length === 6;
  $("coins").innerHTML = lastCoins
    ? lastCoins.map((c) => `<div class="coin ${c === 2 ? "yin" : ""}">${c === 3 ? t().heads : t().tails}</div>`).join("")
    : "";
  const n = throws.length;
  $("progress").textContent = n ? t().progress(n, POS[n - 1], t().names[throws[n - 1]]) : "";
  $("ben").innerHTML = throws.map((v) => yaoHtml(v % 2 === 1, isMoving(v), v === 9 ? "○" : v === 6 ? "×" : "")).join("");
  $("toss").disabled = $("auto").disabled = done;
  $("reset").hidden = !done;
  if (!done) return;

  const benBin = throws.map((v) => v % 2).join("");
  const zhiBin = throws.map((v) => (isMoving(v) ? 1 - (v % 2) : v % 2)).join("");
  const moving = throws.map((v, i) => (isMoving(v) ? i : -1)).filter((i) => i >= 0);
  const ben = byBinary[benBin], zhi = byBinary[zhiBin];

  $("ben").insertAdjacentHTML("beforeend", hexTitle(ben, t().ben));
  $("arrow").hidden = $("zhi").hidden = !moving.length;
  if (moving.length) $("zhi").innerHTML = [...zhiBin].map((b) => yaoHtml(b === "1", false)).join("") + hexTitle(zhi, t().zhi);
  renderReading(ben, zhi, moving);
}

// 依朱熹《易學啟蒙》變爻占法
function interpret(ben, zhi, moving, s = t()) {
  const n = moving.length;
  const still = [0, 1, 2, 3, 4, 5].filter((i) => !moving.includes(i));
  const line = (h, i) => ({ head: `${h.name}${s.gua} ${h.lines[i].position}`, text: h.lines[i].text, xiang: h.lines[i].xiang });
  const gua = (h) => ({ head: `${h.name}${s.gua} ${s.judgment}`, text: h.judgment });
  const focus = [
    () => [gua(ben)],
    () => [line(ben, moving[0])],
    () => [line(ben, moving[1]), line(ben, moving[0])],
    () => [gua(ben), gua(zhi)],
    () => [line(zhi, still[0]), line(zhi, still[1])],
    () => [line(zhi, still[0])],
    () => [gua(zhi)],
  ][n]();
  if (n === 6 && ben.lines.length > 6) return { rule: s.allYong(ben.name, ben.lines[6].position), focus: [line(ben, 6)] };
  return { rule: s.rules[n], focus };
}

function hexDetail(h, label, moving = [], open = false) {
  const s = t();
  const lines = h.lines.map((l, i) =>
    `<p${moving.includes(i) ? ' class="focus"' : ""}>${l.position}：${l.text}<br><span class="note">${s.xiang}：${l.xiang || ""}</span></p>`).join("");
  return `<details${open ? " open" : ""}><summary>${label} ${h.symbol} ${h.name} ${s.full}</summary>
    <h3>${s.judgment}</h3><p>${h.judgment}</p>
    <h3>${s.tuan}</h3><p>${h.tuan}</p>
    <h3>${s.xiang}</h3><p>${h.xiang}</p>
    <h3>${s.lines}</h3>${lines}
    ${h.wenyan ? `<h3>${s.wenyan}</h3><p>${h.wenyan}</p>` : ""}</details>`;
}

function renderReading(ben, zhi, moving) {
  const s = t();
  const r = interpret(ben, zhi, moving);
  const q = $("question").value.trim();
  const esc = (x) => x.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const wasHidden = $("reading").hidden;
  $("reading").innerHTML = `
    ${q ? `<p class="q">${s.asked}：${esc(q)}</p>` : ""}
    <h2>${ben.name}${moving.length ? ` ${s.of} ${zhi.name}` : ""}</h2>
    <p class="rule">${r.rule}</p>
    ${r.focus.map((f) => `<div class="focus"><b>${f.head}</b>：${f.text}${f.xiang ? `<br><span class="note">${s.xiang}：${f.xiang}</span>` : ""}</div>`).join("")}
    ${hexDetail(ben, s.ben, moving, true)}
    ${moving.length ? hexDetail(zhi, s.zhi) : ""}`;
  $("reading").hidden = false;
  if (wasHidden) $("reading").scrollIntoView({ behavior: "smooth", block: "start" });
}

function reset() {
  throws = [];
  lastCoins = null;
  ["zhi", "reading"].forEach((id) => ($(id).innerHTML = ""));
  $("reading").hidden = true;
  render();
}

$("toss").onclick = toss;
$("auto").onclick = () => { while (throws.length < 6) toss(); };
$("reset").onclick = reset;
$("lang").onclick = () => setLang(lang === "hant" ? "hans" : "hant");
setLang(lang);
