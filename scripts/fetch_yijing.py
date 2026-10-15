"""从维基文库抓取《周易》六十四卦原文（经文 + 彖传、象传），输出 data/yijing.json。

用法: python3 scripts/fetch_yijing.py [--refresh]
原始 wikitext 缓存在 data/raw/，加 --refresh 重新下载。
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "data" / "yijing.json"
BASE = "https://zh.wikisource.org/w/index.php?action=raw&title="

# 八卦：名称 -> (符号, 自然象, 三爻自下而上，1=阳 0=阴)
TRIGRAMS = {
    "乾": ("☰", "天", "111"), "兌": ("☱", "澤", "110"),
    "離": ("☲", "火", "101"), "震": ("☳", "雷", "100"),
    "巽": ("☴", "風", "011"), "坎": ("☵", "水", "010"),
    "艮": ("☶", "山", "001"), "坤": ("☷", "地", "000"),
}


def fetch(title, refresh=False):
    cache = RAW / (title.replace("/", "_") + ".wiki")
    if cache.exists() and not refresh:
        return cache.read_text(encoding="utf-8")
    url = BASE + urllib.parse.quote(title)
    req = urllib.request.Request(url, headers={"User-Agent": "bagua-project/0.1"})
    with urllib.request.urlopen(req, timeout=30) as r:
        text = r.read().decode("utf-8")
    cache.write_text(text, encoding="utf-8")
    time.sleep(0.5)
    return text


def clean(s):
    s = re.sub(r"-\{(.*?)\}-", r"\1", s)                  # 繁简转换标记
    s = re.sub(r"\{\{\*\|[^}]*\}\}", "", s)                 # 小注
    s = re.sub(r"\{\{另\|([^|}]*)\|[^}]*\}\}", r"\1", s)    # 异文取原字
    s = re.sub(r"\{\{[^}]*\}\}", "", s)
    s = re.sub(r"<[^>]+>", "", s)
    s = s.replace("'''", "")
    return re.sub(r"\s+", "", s)


def hexagram_order(index_text):
    sec = index_text.split("== 上下經卦名次序 ==", 1)[1]
    return re.findall(r"^#(?:<li[^>]*>)?\s*\[\[/([^|\]]+)", sec, re.M)


def trigram_table(index_text):
    """速查表：行為下卦，列為上卦。返回 卦名 -> (下卦, 上卦, 符號)。"""
    sec = index_text.split("== 六十四卦速查表 ==", 1)[1].split("|}", 1)[0]
    cols = re.findall(r"[☰-☷] (?:-\{)?(\S)(?:\}-)?", re.search(r"^!§.*$", sec, re.M).group(0))
    table = {}
    for row in re.split(r"\n\|-\n", sec)[1:]:
        lower = re.search(r"^! [☰-☷] (?:-\{)?(\S)", row).group(1)
        cells = re.findall(r"(\S) \[\[/([^|\]]+)", row)
        for upper, (sym, name) in zip(cols, cells):
            table[name] = (lower, upper, sym)
    return table


def sections(body):
    """按 *'''xxx曰：''' 等标题切分。"""
    body = re.sub(r"<span\s*\n", "<span ", body)
    parts, cur, name = {}, [], None
    for line in body.splitlines():
        m = re.match(r"^\*([^*#:].*?)[：:]\s*$", clean(line))
        if m and "'''" in line:
            if name:
                parts[name] = cur
            name, cur = m.group(1).rstrip("：:"), []
        elif name:
            cur.append(line)
    if name:
        parts[name] = cur
    return parts


def parse(num, title, text, lower, upper, sym):
    secs = sections(text)

    jing = secs["易經"]
    judgment, lines = "", []
    for l in jing:
        if l.startswith("***"):
            judgment += clean(l.lstrip("*"))
        elif l.startswith("**"):
            # 多數為「卦名：辭」；履、否、同人、艮等卦名即為卦辭開頭
            j = clean(l.lstrip("*"))
            judgment = j[len(title) + 1:] if j.startswith(title + "：") else j
        elif l.startswith("*#"):
            pos, txt = re.match(r"([初上用][六九]|[六九][二三四五])[：，:]?(.*)", clean(l[2:])).groups()
            lines.append({"position": pos, "text": txt})

    def plain(key):
        return "".join(clean(l.lstrip("*#:")) for l in secs.get(key, []) if l.strip("*#: "))

    xiang = secs.get("象曰", [])
    big = next((clean(l.lstrip("*")) for l in xiang if l.startswith("**")), "")
    small = [clean(l[2:]) for l in xiang if l.startswith("*#")]

    for i, ln in enumerate(lines):
        if i < len(small):
            ln["xiang"] = small[i]

    binary = TRIGRAMS[lower][2] + TRIGRAMS[upper][2]
    return {
        "number": num,
        "name": title,
        "symbol": sym,
        "lower": lower,
        "upper": upper,
        "lines_binary": binary,  # 自下而上，1=阳爻
        "judgment": judgment,     # 卦辭
        "lines": lines,           # 爻辭 + 小象
        "tuan": plain("彖曰"),    # 彖傳
        "xiang": big,             # 大象
        "wenyan": plain("文言曰") or None,
    }


def main():
    refresh = "--refresh" in sys.argv
    RAW.mkdir(parents=True, exist_ok=True)
    index = fetch("周易", refresh)
    order, table = hexagram_order(index), trigram_table(index)
    assert len(order) == 64 and len(table) == 64, (len(order), len(table))
    data = {
        "source": "維基文庫《周易》 https://zh.wikisource.org/wiki/周易 (CC BY-SA 4.0)",
        "trigrams": {k: {"symbol": v[0], "nature": v[1], "lines_binary": v[2]} for k, v in TRIGRAMS.items()},
        "hexagrams": [],
    }
    for i, t in enumerate(order, 1):
        h = parse(i, t, fetch("周易/" + t, refresh), *table[t])
        data["hexagrams"].append(h)
        print(i, t, h["symbol"], len(h["lines"]))
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
