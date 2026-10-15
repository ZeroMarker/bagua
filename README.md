# 周易占卜

纯静态网页：三钱法起卦，显示本卦、之卦，并按朱熹《易学启蒙》变爻规则给出占辞。

本地运行（需要通过 HTTP 加载 `data/yijing.json`）：

```sh
python3 -m http.server 8000
# 打开 http://localhost:8000
```

支持繁简切换（右上角按钮，选择保存在 localStorage）。

数据：`data/yijing.json` 由 `scripts/fetch_yijing.py` 从维基文库《周易》抓取（CC BY-SA 4.0）。
简体版 `data/yijing.zh-Hans.json` 由 `scripts/to_simplified.py` 用 OpenCC 转换（需 `pip install opencc-python-reimplemented`），「乾」字做了保护，不会误转为「干」。
