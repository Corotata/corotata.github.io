#!/usr/bin/env python3
"""把各 App 的图标和上架截图转成 webp，放到 public/apps/<slug>/。

截图来自本机各 App 项目（路径写在 sources.py）。图标从 App Store 查询接口下载。
每张图控制在 200KB 以内；输出尺寸写进 manifest.json，页面用来填 width/height。
"""
import json, subprocess, sys, urllib.request
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from sources import APPS, LANGS

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "apps"
SHOT_W = 540
LIMIT = 200 * 1024

def save_webp(img, path, w):
    img = img.convert("RGB")
    h = round(img.height * w / img.width)
    img = img.resize((w, h), Image.LANCZOS)
    for q in (82, 74, 66, 58, 50):
        img.save(path, "WEBP", quality=q, method=6)
        if path.stat().st_size <= LIMIT:
            break
    assert path.stat().st_size <= LIMIT, path
    return w, h

def main():
    manifest = {}
    for slug, a in APPS.items():
        if a.get("store"):  # 商店 App 的图直接用 Apple CDN，不下载
            continue
        d = OUT / slug / "img"
        d.mkdir(parents=True, exist_ok=True)
        m = {"shots": {}}
        # icon
        icon_path = d / "icon.webp"
        if not icon_path.exists():
            url = json.load(urllib.request.urlopen(f"https://itunes.apple.com/lookup?id={a['id']}&country=us"))["results"][0]["artworkUrl512"]
            tmp = d / "_icon.jpg"
            urllib.request.urlretrieve(url, tmp)
            save_webp(Image.open(tmp), icon_path, 256)
            tmp.unlink()
        m["icon"] = [256, 256]
        for lang in LANGS:
            files = a["shots"].get(lang)
            if not files:
                continue
            out = []
            for i, f in enumerate(files, 1):
                p = d / f"{lang}-{i}.webp"
                w, h = save_webp(Image.open(f), p, SHOT_W)
                out.append([f"{lang}-{i}.webp", w, h])
            m["shots"][lang] = out
        manifest[slug] = m
        print(slug, {k: len(v) for k, v in m["shots"].items()})
    (Path(__file__).parent / "manifest.json").write_text(json.dumps(manifest, indent=1))

main()
