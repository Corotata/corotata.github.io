#!/usr/bin/env python3
"""App Store 真实用户评论：拉取、选取、渲染、注入静态详情页。只用标准库。
数据：src/data/app-reviews.json（按 slug 存，累积，不会被 fetch-data.js 覆盖）。
用法：
  python3 scripts/app-pages/reviews.py fetch    # 拉 Apple 评论 RSS，与已有数据合并
  python3 scripts/app-pages/reviews.py inject   # 只替换 public/apps/**/index.html 里 <!--reviews--> 标记之间的内容
  python3 scripts/app-pages/reviews.py update   # fetch + inject（CI 每周用；任何失败都不报错退出）
generate.py 整页重生成时也调用 section()，保证本机重生成不丢评论。"""
import html, json, re, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "src/data/app-reviews.json"
E = html.escape
MAX_SHOW = 3   # 默认展开的条数
MAX_ALL = 50   # 含折叠部分的总条数上限
MIN_STARS = 4
# 拉取的国家（2026-11-14 实测 42 国后收窄）：
COUNTRIES = "cn tw hk us gb ca au nz ie fr de it es br mx ru tr".split()  # 实测有评论的国家 + 翻译官下载靠前的国家
PAGE_LANG = {"hans": "zh-Hans", "hant": "zh-Hant", "en": "en"}

TXT = {
    "hans": dict(h="部分用户评价", note="以下评价来自 App Store 用户，原文照录，未翻译。", view="在 App Store 查看评价", sep="，", more="展开更多评价（{n} 条）"),
    "hant": dict(h="部分用戶評價", note="以下評價來自 App Store 用戶，原文照錄，未翻譯。", view="在 App Store 查看評價", sep="，", more="展開更多評價（{n} 則）"),
    "en": dict(h="What some users say", note="Reviews from App Store users, quoted as written and not translated.",
               view="See reviews on the App Store", sep=", ", more="Show more reviews ({n})"),
}
COUNTRY = {  # 代码: (简体, 繁体, 英文)
    "cn": ("中国大陆", "中國大陸", "China mainland"), "tw": ("台湾", "台灣", "Taiwan"), "hk": ("香港", "香港", "Hong Kong"),
    "us": ("美国", "美國", "United States"), "gb": ("英国", "英國", "United Kingdom"), "ca": ("加拿大", "加拿大", "Canada"),
    "au": ("澳大利亚", "澳洲", "Australia"), "nz": ("新西兰", "紐西蘭", "New Zealand"), "ie": ("爱尔兰", "愛爾蘭", "Ireland"),
    "sg": ("新加坡", "新加坡", "Singapore"), "my": ("马来西亚", "馬來西亞", "Malaysia"), "jp": ("日本", "日本", "Japan"),
    "kr": ("韩国", "韓國", "South Korea"), "fr": ("法国", "法國", "France"), "de": ("德国", "德國", "Germany"),
    "it": ("意大利", "義大利", "Italy"), "es": ("西班牙", "西班牙", "Spain"), "pt": ("葡萄牙", "葡萄牙", "Portugal"),
    "br": ("巴西", "巴西", "Brazil"), "mx": ("墨西哥", "墨西哥", "Mexico"), "ru": ("俄罗斯", "俄羅斯", "Russia"),
    "ua": ("乌克兰", "烏克蘭", "Ukraine"), "tr": ("土耳其", "土耳其", "Türkiye"), "pl": ("波兰", "波蘭", "Poland"),
    "cz": ("捷克", "捷克", "Czechia"), "hu": ("匈牙利", "匈牙利", "Hungary"), "ro": ("罗马尼亚", "羅馬尼亞", "Romania"),
    "bg": ("保加利亚", "保加利亞", "Bulgaria"), "gr": ("希腊", "希臘", "Greece"), "nl": ("荷兰", "荷蘭", "Netherlands"),
    "se": ("瑞典", "瑞典", "Sweden"), "no": ("挪威", "挪威", "Norway"), "dk": ("丹麦", "丹麥", "Denmark"),
    "fi": ("芬兰", "芬蘭", "Finland"), "ch": ("瑞士", "瑞士", "Switzerland"), "at": ("奥地利", "奧地利", "Austria"),
    "be": ("比利时", "比利時", "Belgium"), "il": ("以色列", "以色列", "Israel"), "sa": ("沙特阿拉伯", "沙烏地阿拉伯", "Saudi Arabia"),
    "ae": ("阿联酋", "阿聯酋", "UAE"), "th": ("泰国", "泰國", "Thailand"), "vn": ("越南", "越南", "Vietnam"),
    "id": ("印度尼西亚", "印尼", "Indonesia"), "ph": ("菲律宾", "菲律賓", "Philippines"), "in": ("印度", "印度", "India"),
    "za": ("南非", "南非", "South Africa"), "cl": ("智利", "智利", "Chile"), "ar": ("阿根廷", "阿根廷", "Argentina"),
    "ci": ("科特迪瓦", "象牙海岸", "Côte d'Ivoire"), "bf": ("布基纳法索", "布吉納法索", "Burkina Faso"),
    "co": ("哥伦比亚", "哥倫比亞", "Colombia"), "do": ("多米尼加", "多明尼加", "Dominican Republic"),
}
LANG_BY_COUNTRY = {"us": "en", "gb": "en", "ca": "en", "au": "en", "nz": "en", "ie": "en", "sg": "en", "ph": "en", "in": "en",
                   "za": "en", "fr": "fr", "de": "de", "it": "it", "es": "es", "mx": "es", "cl": "es", "ar": "es", "co": "es",
                   "do": "es", "pt": "pt", "br": "pt", "ru": "ru", "ua": "uk", "tr": "tr", "pl": "pl", "cz": "cs", "hu": "hu",
                   "ro": "ro", "bg": "bg", "gr": "el", "nl": "nl", "se": "sv", "no": "no", "dk": "da", "fi": "fi", "jp": "ja",
                   "kr": "ko", "th": "th", "vn": "vi", "id": "id", "my": "ms", "il": "he", "sa": "ar", "ae": "ar"}


def app_ids():
    from sources import APPS
    return {slug: a["id"] for slug, a in APPS.items()}


def guess_lang(text, country):
    """尽量给出评论正文的语言；没把握的返回 None（不写 lang 属性）。"""
    if re.search(r"[぀-ヿ]", text):
        return "ja"
    if re.search(r"[가-힯]", text):
        return "ko"
    if re.search(r"[一-鿿]", text):
        return "zh-Hans" if country == "cn" else "zh-Hant"
    if re.search(r"[Ѐ-ӿ]", text):
        return "uk" if country == "ua" else "ru"
    if re.search(r"[฀-๿]", text):
        return "th"
    if len(re.findall(r"\b(the|and|is|this|it|with|for|that)\b", text, re.I)) >= 2:
        return "en"
    lang = LANG_BY_COUNTRY.get(country)
    return None if lang == "en" else lang  # 英语国家的拉丁文评论没有明显英文词时不确定，不标语言


# ---------------- 拉取 ----------------
class Blocked(Exception):
    pass


def _get(app_id, country):
    """None=失败；[]=该国没有评论。HTTP 403/429 是被 Apple 限流，直接抛 Blocked，不重试、不覆盖已有数据。"""
    url = f"https://itunes.apple.com/{country}/rss/customerreviews/id={app_id}/sortby=mostrecent/json"
    time.sleep(0.4)
    r = subprocess.run(["/usr/bin/curl", "-sL", "--max-time", "30", "-w", "\n%{http_code}", url], capture_output=True, text=True)
    body, _, code = r.stdout.rpartition("\n")
    if code in ("403", "429"):
        raise Blocked(code)
    try:
        entry = json.loads(body).get("feed", {}).get("entry", [])
        return [entry] if isinstance(entry, dict) else entry
    except Exception:
        return []


def fetch():
    old = json.loads(DATA.read_text(encoding="utf-8")) if DATA.exists() else {}
    ids = app_ids()
    jobs = [(s, i, c) for s, i in ids.items() for c in COUNTRIES]
    new, failed = {}, 0
    with ThreadPoolExecutor(2) as ex:
        for (slug, _, country), entries in zip(jobs, ex.map(lambda j: _get(j[1], j[2]), jobs)):
            if entries is None:
                failed += 1
                continue
            for e in entries:
                if "im:rating" not in e:  # 第一条是 App 自身信息
                    continue
                rating = int(e["im:rating"]["label"])
                body = (e.get("content", {}).get("label") or "").strip()
                if rating < MIN_STARS or len(body) < 4:
                    continue
                new.setdefault(slug, []).append({
                    "id": e["id"]["label"], "rating": rating,
                    "title": (e.get("title", {}).get("label") or "").strip(), "body": body,
                    "author": e.get("author", {}).get("name", {}).get("label", "").strip(),
                    "date": (e.get("updated", {}).get("label") or "")[:10], "country": country,
                    "version": e.get("im:version", {}).get("label", ""),
                })
    merged = {}
    for slug in ids:
        seen, items = set(), []
        for r in new.get(slug, []) + old.get(slug, []):  # 新数据优先；旧评论保留（RSS 只给最近约 50 条）
            key = (r["author"], r["body"][:30])  # 不同来源（RSS / AppSales）的 id 不通用，用作者+开头去重
            if key not in seen:
                seen.add(key); items.append(r)
        if items:
            merged[slug] = sorted(items, key=lambda r: r["date"], reverse=True)
    DATA.write_text(json.dumps(merged, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"reviews: {sum(map(len, merged.values()))} items, {len(merged)} apps, {failed}/{len(jobs)} requests failed")


# ---------------- 渲染 ----------------
def load():
    return json.loads(DATA.read_text(encoding="utf-8")) if DATA.exists() else {}


def pick(items, lk):
    """同一 App 三个语言页共用一个池子：本页语言优先，其次内容不太短的优先，再按日期新到旧。"""
    want = PAGE_LANG[lk]
    ranked = sorted(items, key=lambda r: (guess_lang(r["body"], r["country"]) != want, len(r["body"]) < 30, "".join(chr(255 - ord(c)) for c in r["date"])))
    return ranked[:MAX_ALL]


def section(slug, lk, app_id, items=None):
    items = (load() if items is None else items).get(slug, [])
    if not items:
        return ""
    t, idx = TXT[lk], ["hans", "hant", "en"].index(lk)
    lis = []
    for r in pick(items, lk):
        body = r["body"] if len(r["body"]) <= 400 else r["body"][:397].rstrip() + "…"
        lang = guess_lang(r["body"], r["country"])
        la = f' lang="{lang}"' if lang else ""
        cname = COUNTRY.get(r["country"], (r["country"].upper(),) * 3)[idx]
        link = f"https://apps.apple.com/{r['country']}/app/id{app_id}?see-all=reviews"
        title = f'<b{la}>{E(r["title"])}</b>' if r["title"] and r["title"] != r["body"] else ""
        lis.append(
            f'<li><div class="stars" role="img" aria-label="{r["rating"]}/5">{"★" * r["rating"]}{"☆" * (5 - r["rating"])}</div>'
            f'<blockquote>{title}<p{la}>{E(body).replace(chr(10), "<br>")}</p></blockquote>'
            f'<p class="by">— {E(r["author"] or "App Store")}{t["sep"]}{E(cname)}{t["sep"]}<time datetime="{r["date"]}">{r["date"]}</time>'
            f' · <a href="{link}" rel="noopener">{t["view"]}</a></p></li>')
    top = f'<ul>{"".join(lis[:MAX_SHOW])}</ul>'
    rest = lis[MAX_SHOW:]
    more = (f'<details><summary>{t["more"].format(n=len(rest))}</summary><ul>{"".join(rest)}</ul></details>' if rest else "")
    return f'<section class="reviews"><h2>{t["h"]}</h2><p class="note">{t["note"]}</p>{top}{more}</section>'


MARK = re.compile(r"<!--reviews-->.*?<!--/reviews-->", re.S)


def inject():
    ids, data, n = app_ids(), load(), 0
    for p in (ROOT / "public/apps").glob("*/**/index.html"):
        rel = p.relative_to(ROOT / "public/apps").parts
        slug = rel[0]
        lk = "hant" if "zh-hant" in rel else "en" if "en" in rel else "hans"
        if slug not in ids:
            continue
        s = p.read_text(encoding="utf-8")
        new = MARK.sub(lambda _: f"<!--reviews-->{section(slug, lk, ids[slug], data)}<!--/reviews-->", s)
        if new != s:
            p.write_text(new, encoding="utf-8"); n += 1
    print("injected into", n, "pages")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    try:
        if cmd in ("fetch", "update"):
            fetch()
        if cmd in ("inject", "update"):
            inject()
        if cmd not in ("fetch", "inject", "update"):
            sys.exit(__doc__)
    except Exception as ex:  # CI：评论拉取失败不能阻断部署
        print("reviews: failed, keeping committed data:", ex)
        if cmd != "update":
            raise
