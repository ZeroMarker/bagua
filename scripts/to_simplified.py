"""把 data/yijing.json 转为简体，输出 data/yijing.zh-Hans.json。

依赖: pip install opencc-python-reimplemented
"""
import json
from pathlib import Path

from opencc import OpenCC

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "yijing.json"
OUT = ROOT / "data" / "yijing.zh-Hans.json"

# 《周易》中「乾」皆读 qián，OpenCC 会误转为「干」
PROTECT = {"乾": ""}


def convert(s, cc=OpenCC("t2s")):
    for k, v in PROTECT.items():
        s = s.replace(k, v)
    s = cc.convert(s)
    for k, v in PROTECT.items():
        s = s.replace(v, k)
    return s


def main():
    text = SRC.read_text(encoding="utf-8")
    data = json.loads(convert(text))
    data["source"] += "；简体由 OpenCC 转换"
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
