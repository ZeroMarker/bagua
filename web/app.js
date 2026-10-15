// 三錢法：字(陽面)記 3、背記 2，三枚相加：6 老陰(變) 7 少陽 8 少陰 9 老陽(變)
const NAMES = { 6: "老陰", 7: "少陽", 8: "少陰", 9: "老陽" };
const POS = ["初", "二", "三", "四", "五", "上"];
const $ = (id) => document.getElementById(id);

let data, byBinary = {}, throws = [];

fetch("data/yijing.json").then((r) => r.json()).then((d) => {
  data = d;
  for (const h of d.hexagrams) byBinary[h.lines_binary] = h;
}).catch(() => {
  $("progress").textContent = "無法載入卦辭資料，請用本地伺服器開啟（python3 -m http.server）";
  $("toss").disabled = $("auto").disabled = true;
});

function tossCoins() {
  const coins = Array.from({ length: 3 }, () => (crypto.getRandomValues(new Uint8Array(1))[0] & 1 ? 3 : 2));
  return { coins, value: coins.reduce((a, b) => a + b) };
}

function toss() {
  if (!data || throws.length >= 6) return;
  const t = tossCoins();
  throws.push(t.value);
  $("coins").innerHTML = t.coins.map((c) => `<div class="coin ${c === 2 ? "yin" : ""}">${c === 3 ? "字" : "背"}</div>`).join("");
  $("progress").textContent = `第 ${throws.length} 爻（${POS[throws.length - 1]}）：${NAMES[t.value]}`;
  drawBen();
  if (throws.length === 6) finish();
}

function yaoHtml(yang, moving, mark = "") {
  return `<div class="yao ${moving ? "moving" : ""}"><div class="bar ${yang ? "yang" : "yin"}"><span></span><span></span></div><span class="mark">${mark}</span></div>`;
}

function drawBen() {
  $("ben").innerHTML = throws.map((v) => yaoHtml(v % 2 === 1, v === 6 || v === 9, v === 9 ? "○" : v === 6 ? "×" : "")).join("");
}

function hexTitle(h, label) {
  return `<div class="title">${label}：${h.name}<small>${h.symbol} ${h.lower}下${h.upper}上 · 第${h.number}卦</small></div>`;
}

function finish() {
  $("toss").disabled = $("auto").disabled = true;
  $("reset").hidden = false;
  const benBin = throws.map((v) => v % 2).join("");
  const zhiBin = throws.map((v) => (v === 6 || v === 9 ? 1 - (v % 2) : v % 2)).join("");
  const moving = throws.map((v, i) => (v === 6 || v === 9 ? i : -1)).filter((i) => i >= 0);
  const ben = byBinary[benBin], zhi = byBinary[zhiBin];

  $("ben").insertAdjacentHTML("beforeend", hexTitle(ben, "本卦"));
  if (moving.length) {
    $("arrow").hidden = $("zhi").hidden = false;
    $("zhi").innerHTML = [...zhiBin].map((b) => yaoHtml(b === "1", false)).join("") + hexTitle(zhi, "之卦");
  }
  renderReading(ben, zhi, moving);
}

// 依朱熹《易學啟蒙》變爻占法
function interpret(ben, zhi, moving) {
  const n = moving.length;
  const still = [0, 1, 2, 3, 4, 5].filter((i) => !moving.includes(i));
  const line = (h, i) => ({ head: `${h.name}卦 ${h.lines[i].position}`, text: h.lines[i].text, xiang: h.lines[i].xiang });
  const gua = (h) => ({ head: `${h.name}卦 卦辭`, text: h.judgment });
  switch (n) {
    case 0: return { rule: "六爻皆不變，以本卦卦辭占。", focus: [gua(ben)] };
    case 1: return { rule: "一爻變，以本卦變爻之辭占。", focus: [line(ben, moving[0])] };
    case 2: return { rule: "二爻變，以本卦二變爻之辭占，以上爻為主。", focus: [line(ben, moving[1]), line(ben, moving[0])] };
    case 3: return { rule: "三爻變，占本卦及之卦卦辭，以本卦為主。", focus: [gua(ben), gua(zhi)] };
    case 4: return { rule: "四爻變，以之卦二不變爻之辭占，以下爻為主。", focus: [line(zhi, still[0]), line(zhi, still[1])] };
    case 5: return { rule: "五爻變，以之卦不變爻之辭占。", focus: [line(zhi, still[0])] };
    default:
      if (ben.lines.length > 6) return { rule: `六爻皆變，${ben.name}卦占「${ben.lines[6].position}」。`, focus: [line(ben, 6)] };
      return { rule: "六爻皆變，以之卦卦辭占。", focus: [gua(zhi)] };
  }
}

function hexDetail(h, label, moving = []) {
  const lines = h.lines.map((l, i) =>
    `<p${moving.includes(i) ? ' class="focus"' : ""}>${l.position}：${l.text}<br><span class="note">象曰：${l.xiang || ""}</span></p>`).join("");
  return `<details${label === "本卦" ? " open" : ""}><summary>${label} ${h.symbol} ${h.name} 全文</summary>
    <h3>卦辭</h3><p>${h.judgment}</p>
    <h3>彖曰</h3><p>${h.tuan}</p>
    <h3>象曰</h3><p>${h.xiang}</p>
    <h3>爻辭</h3>${lines}
    ${h.wenyan ? `<h3>文言</h3><p>${h.wenyan}</p>` : ""}</details>`;
}

function renderReading(ben, zhi, moving) {
  const r = interpret(ben, zhi, moving);
  const q = $("question").value.trim();
  const esc = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  $("reading").innerHTML = `
    ${q ? `<p class="q">所問：${esc(q)}</p>` : ""}
    <h2>${ben.name}${moving.length ? ` 之 ${zhi.name}` : ""}</h2>
    <p class="rule">${r.rule}</p>
    ${r.focus.map((f) => `<div class="focus"><b>${f.head}</b>：${f.text}${f.xiang ? `<br><span class="note">象曰：${f.xiang}</span>` : ""}</div>`).join("")}
    ${hexDetail(ben, "本卦", moving)}
    ${moving.length ? hexDetail(zhi, "之卦") : ""}`;
  $("reading").hidden = false;
  $("reading").scrollIntoView({ behavior: "smooth", block: "start" });
}

function reset() {
  throws = [];
  ["ben", "zhi", "coins", "progress", "reading"].forEach((id) => ($(id).innerHTML = ""));
  $("zhi").hidden = $("arrow").hidden = $("reading").hidden = true;
  $("toss").disabled = $("auto").disabled = false;
  $("reset").hidden = true;
}

$("toss").onclick = toss;
$("auto").onclick = () => { while (throws.length < 6) toss(); };
$("reset").onclick = reset;
