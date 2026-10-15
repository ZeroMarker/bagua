// 起卦結果統一為 throws：六個數，自初爻起，6 老陰(變) 7 少陽 8 少陰 9 老陽(變)
const POS = ["初", "二", "三", "四", "五", "上"];
const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";
// 先天八卦數 1~8 對應的三爻（自下而上，1=陽）
const XIANTIAN = ["111", "110", "101", "100", "011", "010", "001", "000"];
const HISTORY_KEY = "history";
const HISTORY_MAX = 100;

const T = {
  hant: {
    title: "周易占卜", sub: "文王六十四卦", ask: "心中默念所問之事（可不填）",
    auto: "一次起卦", reset: "重新起卦", switchTo: "简",
    m_coins: "三錢法", m_yarrow: "蓍草法", m_meihua: "梅花易數",
    act: { coins: "擲錢", yarrow: "揲蓍", meihua: "以此刻起卦" },
    desc: {
      coins: "三枚銅錢擲六次，字為陽記三、背為陰記二，自下而上成卦。",
      yarrow: "大衍之數五十，其用四十有九。分二、掛一、揲四、歸奇，三變成一爻，十八變成卦。",
      meihua: "以農曆年、月、日、時起卦：年月日之和得上卦，加時數得下卦，總數除六得動爻。",
    },
    names: { 6: "老陰", 7: "少陽", 8: "少陰", 9: "老陽" }, heads: "字", tails: "背",
    progress: (n, name) => `第 ${n} 爻（${POS[n - 1]}）：${name}`,
    yarrow: (counts, v) => `${counts.join(" → ")} 策，${counts.at(-1)} ÷ 4 = ${v}`,
    meihua: (m) => `農曆${m.leap ? "閏" : ""}${m.month}月${m.day}日，${BRANCHES[m.y - 1]}年(${m.y}) ${BRANCHES[m.h - 1]}時(${m.h})<br>` +
      `上卦：${m.y}+${m.month}+${m.day} = ${m.y + m.month + m.day}，除八餘 <b>${m.up}</b>　` +
      `下卦：加時 ${m.y + m.month + m.day + m.h}，除八餘 <b>${m.lo}</b>　動爻：除六餘 <b>${m.mv}</b>`,
    loadFail: "無法載入卦辭資料，請用本地伺服器開啟（python3 -m http.server）",
    ben: "本卦", zhi: "之卦", gua: "卦", nth: (n) => `第${n}卦`, judgment: "卦辭", tuan: "彖曰", xiang: "象曰",
    lines: "爻辭", wenyan: "文言", full: "全文", asked: "所問", of: "之",
    history: "起卦記錄", clear: "清空", historyEmpty: "尚無記錄", confirmClear: "確定清空全部起卦記錄？", del: "刪除",
    rules: [
      "六爻皆不變，以本卦卦辭占。", "一爻變，以本卦變爻之辭占。", "二爻變，以本卦二變爻之辭占，以上爻為主。",
      "三爻變，占本卦及之卦卦辭，以本卦為主。", "四爻變，以之卦二不變爻之辭占，以下爻為主。",
      "五爻變，以之卦不變爻之辭占。", "六爻皆變，以之卦卦辭占。",
    ],
    allYong: (name, pos) => `六爻皆變，${name}卦占「${pos}」。`,
  },
  hans: {
    title: "周易占卜", sub: "文王六十四卦", ask: "心中默念所问之事（可不填）",
    auto: "一次起卦", reset: "重新起卦", switchTo: "繁",
    m_coins: "三钱法", m_yarrow: "蓍草法", m_meihua: "梅花易数",
    act: { coins: "掷钱", yarrow: "揲蓍", meihua: "以此刻起卦" },
    desc: {
      coins: "三枚铜钱掷六次，字为阳记三、背为阴记二，自下而上成卦。",
      yarrow: "大衍之数五十，其用四十有九。分二、挂一、揲四、归奇，三变成一爻，十八变成卦。",
      meihua: "以农历年、月、日、时起卦：年月日之和得上卦，加时数得下卦，总数除六得动爻。",
    },
    names: { 6: "老阴", 7: "少阳", 8: "少阴", 9: "老阳" }, heads: "字", tails: "背",
    progress: (n, name) => `第 ${n} 爻（${POS[n - 1]}）：${name}`,
    yarrow: (counts, v) => `${counts.join(" → ")} 策，${counts.at(-1)} ÷ 4 = ${v}`,
    meihua: (m) => `农历${m.leap ? "闰" : ""}${m.month}月${m.day}日，${BRANCHES[m.y - 1]}年(${m.y}) ${BRANCHES[m.h - 1]}时(${m.h})<br>` +
      `上卦：${m.y}+${m.month}+${m.day} = ${m.y + m.month + m.day}，除八余 <b>${m.up}</b>　` +
      `下卦：加时 ${m.y + m.month + m.day + m.h}，除八余 <b>${m.lo}</b>　动爻：除六余 <b>${m.mv}</b>`,
    loadFail: "无法载入卦辞资料，请用本地服务器打开（python3 -m http.server）",
    ben: "本卦", zhi: "之卦", gua: "卦", nth: (n) => `第${n}卦`, judgment: "卦辞", tuan: "彖曰", xiang: "象曰",
    lines: "爻辞", wenyan: "文言", full: "全文", asked: "所问", of: "之",
    history: "起卦记录", clear: "清空", historyEmpty: "尚无记录", confirmClear: "确定清空全部起卦记录？", del: "删除",
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
const esc = (x) => x.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

let lang = localStorage.getItem("lang") || (/^zh-(CN|SG|Hans)/i.test(navigator.language) ? "hans" : "hant");
let method = localStorage.getItem("method") || "coins";
// 當前一卦：throws 為六爻數值，last 為最後一步的過程（錢面、策數或梅花算式）
let cast = { throws: [], last: null, meihua: null };
let byBinary = {};
const cache = {};
const t = () => T[lang];

// ---------- 起卦方法 ----------

function randInt(n) {
  return crypto.getRandomValues(new Uint32Array(1))[0] % n;
}

function castCoin() {
  const coins = Array.from({ length: 3 }, () => (randInt(2) ? 3 : 2));
  return { value: coins.reduce((a, b) => a + b), last: { coins } };
}

// 一變：分二（左右皆不空，右須能掛一）、掛一、揲四、歸奇
function yarrowChange(n) {
  const left = 1 + randInt(n - 2);
  const right = n - left - 1;
  return n - 1 - (left % 4 || 4) - (right % 4 || 4);
}

function castYarrow() {
  const counts = [49];
  for (let i = 0; i < 3; i++) counts.push(yarrowChange(counts.at(-1)));
  return { value: counts.at(-1) / 4, last: { counts } };
}

// 梅花易數年月日時起卦（年、時取地支序數，月日取農曆）
function meihuaNumbers(date) {
  // 23 時起為次日子時，農曆日期按次日計
  const day0 = date.getHours() === 23 ? new Date(date.getTime() + 3600e3) : date;
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-u-ca-chinese", { year: "numeric", month: "numeric", day: "numeric" })
    .formatToParts(day0).map((p) => [p.type, p.value]));
  const y = (((+parts.relatedYear - 4) % 12) + 12) % 12 + 1;
  const h = (Math.floor((date.getHours() + 1) / 2) % 12) + 1;
  const month = parseInt(parts.month, 10), day = +parts.day;
  const sum = y + month + day;
  return { y, h, month, day, leap: /bis/.test(parts.month), up: sum % 8 || 8, lo: (sum + h) % 8 || 8, mv: (sum + h) % 6 || 6 };
}

function meihuaThrows(m) {
  const bits = XIANTIAN[m.lo - 1] + XIANTIAN[m.up - 1];
  return [...bits].map((b, i) => (i === m.mv - 1 ? (b === "1" ? 9 : 6) : b === "1" ? 7 : 8));
}

// ---------- 狀態 ----------

function step() {
  if (!Object.keys(byBinary).length || cast.throws.length >= 6) return;
  if (method === "meihua") {
    cast.meihua = meihuaNumbers(new Date());
    cast.throws = meihuaThrows(cast.meihua);
  } else {
    const r = method === "coins" ? castCoin() : castYarrow();
    cast.throws.push(r.value);
    cast.last = r.last;
  }
  if (cast.throws.length === 6) saveHistory();
  render();
}

function reset() {
  cast = { throws: [], last: null, meihua: null };
  $("reading").hidden = true;
  render();
}

function setMethod(m) {
  method = m;
  localStorage.setItem("method", m);
  reset();
}

// ---------- 記錄 ----------

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory() {
  const list = loadHistory();
  list.unshift({ ts: Date.now(), method, question: $("question").value.trim(), throws: cast.throws, meihua: cast.meihua });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX)));
  renderHistory();
}

function openHistory(i) {
  const e = loadHistory()[i];
  method = e.method;
  cast = { throws: e.throws, last: null, meihua: e.meihua };
  $("question").value = e.question || "";
  $("reading").hidden = true;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteHistory(i) {
  const list = loadHistory();
  list.splice(i, 1);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  renderHistory();
}

function renderHistory() {
  const list = loadHistory();
  const s = t();
  $("history-empty").hidden = list.length > 0;
  $("clear-history").hidden = !list.length;
  $("history-list").innerHTML = list.map((e, i) => {
    const { ben, zhi, moving } = hexes(e.throws);
    const time = new Date(e.ts).toLocaleString(lang === "hans" ? "zh-CN" : "zh-TW", { dateStyle: "short", timeStyle: "short" });
    return `<li data-i="${i}"><span class="sym">${ben.symbol}</span>
      <span>${ben.name}${moving.length ? ` ${s.of} ${zhi.name}` : ""}</span>
      <span class="hq">${esc(e.question || "")}</span>
      <span class="meta">${s["m_" + e.method]} · ${time}</span>
      <button class="link del" data-del="${i}" aria-label="${s.del}">×</button></li>`;
  }).join("");
}

// ---------- 繪製 ----------

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
  renderHistory();
}

const isMoving = (v) => v === 6 || v === 9;

function hexes(throws) {
  return {
    ben: byBinary[throws.map((v) => v % 2).join("")],
    zhi: byBinary[throws.map((v) => (isMoving(v) ? 1 - (v % 2) : v % 2)).join("")],
    moving: throws.map((v, i) => (isMoving(v) ? i : -1)).filter((i) => i >= 0),
  };
}

function yaoHtml(yang, moving, mark = "") {
  return `<div class="yao ${moving ? "moving" : ""}"><div class="bar ${yang ? "yang" : "yin"}"><span></span><span></span></div><span class="mark">${mark}</span></div>`;
}

function hexTitle(h, label) {
  return `<div class="title">${label}：${h.name}<small>${h.symbol} ${h.lower}下${h.upper}上 · ${t().nth(h.number)}</small></div>`;
}

function processHtml() {
  const s = t(), n = cast.throws.length;
  if (cast.meihua) return `<div class="calc">${s.meihua(cast.meihua)}</div>`;
  if (!cast.last) return "";
  if (cast.last.coins) return cast.last.coins.map((c) => `<div class="coin ${c === 2 ? "yin" : ""}">${c === 3 ? s.heads : s.tails}</div>`).join("");
  return `<div class="stalks">${s.yarrow(cast.last.counts, cast.throws[n - 1]).replace(/(\d+)(?= →| 策)/g, "<span>$1</span>")}</div>`;
}

function render() {
  const s = t(), throws = cast.throws, n = throws.length, done = n === 6;
  document.querySelectorAll("#methods button").forEach((b) => b.classList.toggle("active", b.dataset.method === method));
  $("method-desc").textContent = s.desc[method];
  $("toss").textContent = s.act[method];
  $("auto").hidden = method === "meihua" || done;
  $("toss").disabled = done;
  $("auto").disabled = done;
  $("reset").hidden = !done;

  $("process").innerHTML = processHtml();
  $("progress").textContent = n && !cast.meihua ? s.progress(n, s.names[throws[n - 1]]) : "";
  $("ben").innerHTML = throws.map((v) => yaoHtml(v % 2 === 1, isMoving(v), v === 9 ? "○" : v === 6 ? "×" : "")).join("");
  $("zhi").innerHTML = "";
  $("arrow").hidden = $("zhi").hidden = true;
  if (!done) {
    $("reading").hidden = true;
    return;
  }

  const { ben, zhi, moving } = hexes(throws);
  $("ben").insertAdjacentHTML("beforeend", hexTitle(ben, s.ben));
  $("arrow").hidden = $("zhi").hidden = !moving.length;
  if (moving.length) $("zhi").innerHTML = [...zhi.lines_binary].map((b) => yaoHtml(b === "1", false)).join("") + hexTitle(zhi, s.zhi);
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

// ---------- 事件 ----------

$("toss").onclick = step;
$("auto").onclick = () => { while (cast.throws.length < 6) step(); };
$("reset").onclick = reset;
$("lang").onclick = () => setLang(lang === "hant" ? "hans" : "hant");
document.querySelectorAll("#methods button").forEach((b) => (b.onclick = () => setMethod(b.dataset.method)));
$("history-list").onclick = (e) => {
  const del = e.target.closest("[data-del]");
  if (del) return deleteHistory(+del.dataset.del);
  const li = e.target.closest("li");
  if (li) openHistory(+li.dataset.i);
};
$("clear-history").onclick = () => {
  if (confirm(t().confirmClear)) {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  }
};
setLang(lang);
