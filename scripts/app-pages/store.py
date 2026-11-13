"""没有 fastlane 文案的 App：直接用 src/data/apps.json（App Store 商店文案、截图、图标）。
不改写文案；某语言的描述如果其实是别的语言（例如繁体栏里放的是英文），该语言不出页面。"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
_DATA = {a["id"]: a for a in json.load(open(ROOT / "src/data/apps.json"))["apps"]}
KEY = {"hans": "cn", "hant": "tw", "en": "us"}
SIMP = set("这们个说为来对会国开与学体时动发现门见观设计后经还点从两样应该运种实热")
TRAD = set("這們個說為來對會國開與學體時動發現門見觀設計後經還點從兩樣應該運種實熱")


def app(i):
    return _DATA[i]


def _cjk(s):
    return sum(1 for c in s if "一" <= c <= "鿿") / max(len(s), 1)


def meta(i, lk):
    loc = (_DATA[i].get("locales") or {}).get(KEY[lk])
    if not loc or not loc.get("description"):
        return None
    desc, title = loc["description"], loc["title"]
    r = _cjk(desc)
    if lk == "en":
        if r > 0.05:
            return None
    else:
        if r < 0.15:
            return None
        s, t = sum(c in SIMP for c in desc), sum(c in TRAD for c in desc)
        if lk == "hans" and t > s:
            return None
        if lk == "hant" and s >= t:
            return None
    return dict(name=title, sub="", desc=desc)


def shots(i, lk, n=5):
    loc = (_DATA[i].get("locales") or {}).get(KEY[lk]) or {}
    return list((loc.get("screenshots") or {}).get("iphone") or [])[:n]


def icon_url(i):
    return _DATA[i]["icon"]


def device(i):
    return _DATA[i].get("device")


def short(i, lk):
    t = meta(i, lk)["name"]
    return re.split(r"\s*[-–—:：]\s*", t, maxsplit=1)[0].strip() or t


def _sized(u, w):
    """Apple CDN 可按尺寸和格式取图；宽高按原始地址里的比例算。"""
    m = re.search(r"/(\d+)x(\d+)bb\.\w+$", u)
    ow, oh = (int(m.group(1)), int(m.group(2))) if m else (1, 2)
    return (u.rsplit("/", 1)[0] + f"/{w}x0w.webp", w, round(w * oh / ow))


def shots_sized(i, lk, n=5):
    return [_sized(u, 540) for u in shots(i, lk, n)]


def icon_sized(i):
    return (icon_url(i).rsplit("/", 1)[0] + "/256x256bb.webp", 256, 256)
