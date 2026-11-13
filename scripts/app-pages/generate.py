#!/usr/bin/env python3
"""生成 public/apps/<slug>/{,zh-hant/,en/}index.html、sitemap.xml、llms.txt。
文案来自各 App 的 fastlane/metadata/<语言>/description.txt，不改写；用法：python3 scripts/app-pages/generate.py"""
import html, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from sources import APPS
import store
import reviews
from data import SHORT, PLATFORM, DEFAULT_PLATFORM, PRIVACY_PATH, RELATED, ALT, FAQ

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public"
SITE = "https://corotata.com"
LANGS = {  # key: (fastlane 目录, 页面路径后缀, html lang, hreflang, 清单里的截图键)
    "hans": ("zh-Hans", "", "zh-Hans", "zh-Hans", "zh-Hans"),
    "hant": ("zh-Hant", "zh-hant/", "zh-Hant", "zh-Hant", "zh-Hant"),
    "en": ("en-US", "en/", "en", "en", "en-US"),
}
MANIFEST = json.load(open(Path(__file__).parent / "manifest.json"))
E = html.escape

UI = {
    "hans": dict(dl="在 App Store 下载", iap="含 App 内购买", faq="常见问题", related="相关 App", all="全部 App",
                 support="技术支持", privacy="隐私政策", store="cn", plat="适用设备", privlang="zh", sep="、",
                 more="同一开发者的其他 App", home="首页"),
    "hant": dict(dl="在 App Store 下載", iap="含 App 內購買項目", faq="常見問題", related="相關 App", all="全部 App",
                 support="技術支援", privacy="隱私權政策", store="tw", plat="適用裝置", privlang="zh-TW", sep="、",
                 more="同一開發者的其他 App", home="首頁"),
    "en": dict(dl="Download on the App Store", iap="Includes in-app purchases", faq="FAQ", related="Related apps",
               all="All apps", support="Support", privacy="Privacy Policy", store="us", plat="Works on", privlang="en",
               sep=", ", more="More from the same developer", home="Home"),
}

# ---------------- 解析 description.txt ----------------
LEGAL = re.compile(r"^(隐私|隱私|服务条款|服務條款|使用条款|使用條款|使用者協議|用户协议|隐私协议|隱私協議|Privacy|Terms)[^:：]*[:：]\s*https?://", re.I)
BUL = re.compile(r"^\s*[•*\-·]\s+")
NUM = re.compile(r"^\d+[.、]\s*")
CORE = re.compile(r"核心功能|主要功能|Core Features|Key Features|^Features$", re.I)
FAQT = re.compile(r"常见问题|常見問題|FAQ|Frequently", re.I)


def is_heading(first, nxt):
    m = re.match(r"^【(.+)】$", first)
    if m:
        return m.group(1)
    if re.match(r"^[A-Z][A-Z0-9 ,&'’?!.\-]+$", first) and len(first) < 60 and len(first) > 2:
        return first
    if len(first) <= 12 and not re.search(r"[。，,：:！!？?.]", first) and nxt and (BUL.match(nxt) or NUM.match(nxt)):
        return first
    return None


def parse(text):
    lines = [l.rstrip() for l in text.strip().split("\n") if not LEGAL.match(l.strip())]
    chunks, cur = [], []
    for l in lines:
        if l.strip():
            cur.append(l.strip())
        elif cur:
            chunks.append(cur); cur = []
    if cur:
        chunks.append(cur)
    # 分段：sections = [[title, [chunk...]]]
    secs = [[None, []]]
    for ch in chunks:
        h = is_heading(ch[0], ch[1] if len(ch) > 1 else "")
        if h:
            if len(secs) == 1 and not secs[0][1] and re.match(r"^【", ch[0]) and len(ch) == 1 and False:
                pass
            secs.append([h, [ch[1:]] if len(ch) > 1 else []])
        else:
            secs[-1][1].append(ch)
    # 开头就是方括号标题（如 Tanko）：当作标语，不当小节
    if not secs[0][1] and len(secs) > 1 and not secs[1][1] == [] and len(secs[1][1]) >= 1 and secs[1][0] and \
            re.search(r"私人書庫|私人书库|Personal Library", secs[1][0]):
        tag = secs[1][0]
        secs[0][1] = [[tag]] + secs[1][1]
        del secs[1]
    return secs


def autolink(s):
    s = E(s)
    return re.sub(r"(https?://[^\s<]+)", r'<a href="\1" rel="noopener">\1</a>', s)


def label_bold(s, bold=True):
    if not bold:
        return autolink(s)
    m = re.match(r"^([A-Za-z][A-Za-z\-& /]{2,40}|[^：:。.，,]{2,14})([：:])\s+(.+)$", s)
    if m and not m.group(3).startswith("//"):
        return f"<b>{E(m.group(1))}{m.group(2)}</b> " + autolink(m.group(3))
    m = re.match(r"^([^：:。.，,]{2,14})([：:])(?!//)(.+)$", s)  # 中文全角冒号后无空格
    if m:
        return f"<b>{E(m.group(1))}{m.group(2)}</b>" + autolink(m.group(3))
    return autolink(s)


def render_chunk(ch):
    out, i = [], 0
    while i < len(ch):
        l = ch[i]
        if BUL.match(l):
            items = []
            while i < len(ch) and BUL.match(ch[i]):
                items.append(BUL.sub("", ch[i])); i += 1
            out.append("<ul>" + "".join(f"<li>{label_bold(x)}</li>" for x in items) + "</ul>")
        elif NUM.match(l):
            if i + 1 < len(ch) and BUL.match(ch[i + 1]):
                out.append(f"<h3>{E(NUM.sub('', l))}</h3>"); i += 1
            else:
                items = []
                while i < len(ch) and NUM.match(ch[i]) and not (i + 1 < len(ch) and BUL.match(ch[i + 1])):
                    items.append(NUM.sub("", ch[i])); i += 1
                out.append("<ol>" + "".join(f"<li>{autolink(x)}</li>" for x in items) + "</ol>")
        else:
            out.append(f"<p>{label_bold(l, len(ch) >= 2)}</p>"); i += 1
    return "".join(out)


def extract_faq(chunks):
    """返回 (问答列表, 其余 chunk)。支持 问：答：/ Q:A: 与“问句行+答句行”两种。"""
    qas, rest = [], []
    for ch in chunks:
        joined = ch
        if re.match(r"^(问|Q)[:：]", joined[0]):
            q = re.sub(r"^(问|Q)[:：]\s*", "", joined[0])
            a = " ".join(re.sub(r"^(答|A)[:：]\s*", "", x) for x in joined[1:])
            qas.append((q, a))
        elif len(joined) == 2 and re.search(r"[？?]$", joined[0]):
            qas.append((joined[0], joined[1]))
        else:
            rest.append(ch)
    return qas, rest


def first_sentence_split(s):
    m = re.search(r"(?<=[。！!])|(?<=[.!?])\s", s)
    if m and m.end() <= 90:
        return s[:m.end()].strip(), s[m.end():].strip()
    return None, s


def summarize(secs):
    paras = [" ".join(c) for sec in secs for c in sec[1]]
    if not paras:
        return ""
    text = paras[0]
    if len(text) < 30 and len(paras) > 1:
        text = text + " " + paras[1]
    text = re.sub(r"^【(.+)】", r"\1 ", text)
    if len(text) > 160:
        cut = max(text.rfind(x, 0, 160) for x in "。.!！")
        text = text[:cut + 1] if cut > 60 else text[:157] + "…"
    return text.strip()


# ---------------- 页面 ----------------
CSS = """:root{--bg:#faf8f4;--fg:#1d1b18;--muted:#6b665e;--line:#e6e1d8;--card:#fff;--accent:#b4532a;--accent-fg:#fff}
@media(prefers-color-scheme:dark){:root{--bg:#171512;--fg:#f1ede6;--muted:#a39d92;--line:#2e2a24;--card:#1f1c18;--accent:#e08a5f;--accent-fg:#1a0e07}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.75 -apple-system,BlinkMacSystemFont,"PingFang SC","PingFang TC","Noto Sans SC","Noto Sans TC","Segoe UI",system-ui,sans-serif;-webkit-text-size-adjust:100%}
.wrap{max-width:760px;margin:0 auto;padding:0 20px}
nav{border-bottom:1px solid var(--line);padding:14px 0;font-size:14px;color:var(--muted)}
nav a{color:var(--muted);text-decoration:none;margin-right:16px}nav a.brand{color:var(--fg);font-weight:700;margin-right:20px}
header{display:flex;gap:20px;align-items:center;padding:48px 0 24px}
header img{width:96px;height:96px;border-radius:22px;border:1px solid var(--line);flex:none}
h1{font-size:30px;line-height:1.25;margin:0 0 4px}
.sub{color:var(--muted);margin:0;font-size:16px;line-height:1.5}
.plat{color:var(--muted);font-size:14px;margin:6px 0 0}
.lead{font-size:19px;margin:8px 0 24px}
.btn{display:inline-block;background:#6366f1;color:#fff;padding:12px 22px;border-radius:12px;font-weight:600;text-decoration:none}
.meta{color:var(--muted);font-size:14px;margin-left:14px}
.shots{display:flex;gap:12px;overflow-x:auto;padding:36px 0 8px;scroll-snap-type:x mandatory}
.shots img{height:360px;width:auto;border-radius:14px;border:1px solid var(--line);scroll-snap-align:start;flex:none}
h2{font-size:21px;margin:44px 0 10px;padding-top:24px;border-top:1px solid var(--line)}
h3{font-size:17px;margin:22px 0 4px}
p{margin:10px 0}ul,ol{padding-left:1.2em}li{margin:6px 0}
a{color:var(--accent)}
.faq h3{margin:20px 0 2px}.faq p{margin:0 0 6px;color:var(--muted)}
.reviews ul{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:12px}
.reviews li{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin:0}
.reviews .note{color:var(--muted);font-size:14px;margin:0}
.reviews .stars{color:var(--accent);letter-spacing:2px;font-size:15px;line-height:1.4}
.reviews blockquote{margin:6px 0 0;padding:0}.reviews blockquote b{display:block;font-size:16px;line-height:1.5}
.reviews blockquote p{margin:4px 0 0;font-size:16px;line-height:1.7}
.reviews .by{color:var(--muted);font-size:13px;margin:10px 0 0;line-height:1.5}
.rel{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.rel a{display:block;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;text-decoration:none;color:var(--fg)}
.rel img{width:48px;height:48px;border-radius:11px;border:1px solid var(--line);display:block;margin-bottom:8px}
.rel b{display:block;font-size:15px;line-height:1.4}.rel span{display:block;color:var(--muted);font-size:13px;line-height:1.5;margin-top:2px}
footer{border-top:1px solid var(--line);margin-top:56px;padding:24px 0 48px;color:var(--muted);font-size:14px}
footer a{color:var(--muted);margin-right:16px}footer .lang{margin-bottom:10px}footer .lang b{color:var(--fg);margin-right:16px}
@media(max-width:560px){.rel{grid-template-columns:1fr}header{flex-direction:column;align-items:flex-start}.shots img{height:300px}h1{font-size:26px}}"""


def is_store(slug):
    return bool(APPS[slug].get("store"))


def short_of(slug, lk):
    return store.short(APPS[slug]["id"], lk) if is_store(slug) else SHORT[slug][lk]


def platform_of(slug):
    if is_store(slug):
        return "iPhone / iPad / Mac" if store.device(APPS[slug]["id"]) == "mac" else DEFAULT_PLATFORM
    return PLATFORM.get(slug, DEFAULT_PLATFORM)


def icon_of(slug):
    """(src, w, h)：EPUB 系列自托管，商店文案 App 用 Apple CDN。"""
    if is_store(slug):
        return store.icon_sized(APPS[slug]["id"])
    iw, ih = MANIFEST[slug]["icon"]
    return f"/apps/{slug}/img/icon.webp", iw, ih


def shots_of(slug, lk):
    if is_store(slug):
        return store.shots_sized(APPS[slug]["id"], lk)
    return [(f"/apps/{slug}/img/{f}", w, h) for f, w, h in MANIFEST[slug]["shots"][LANGS[lk][4]]]


def alts_of(slug, lk, n):
    if slug in ALT:
        a = [x[["hans", "hant", "en"].index(lk)] for x in ALT[slug]]
        assert len(a) == n, (slug, lk, len(a), n)
        return a
    nm = short_of(slug, lk)
    return [f"{nm} 截图 {i}" if lk == "hans" else f"{nm} 截圖 {i}" if lk == "hant" else f"{nm} screenshot {i}" for i in range(1, n + 1)]


def blurb(slug, lk, m):
    if not is_store(slug):
        return m["sub"]
    t = summarize(parse_lead(m["desc"]))
    return t if len(t) <= 60 else t[:58] + "…"


def meta_of(slug, lk):
    if is_store(slug):
        return store.meta(APPS[slug]["id"], lk)
    fl = LANGS[lk][0]
    d = APPS[slug]["project"] / "fastlane/metadata" / fl
    if not d.exists():
        return None
    rd = lambda n: " ".join((d / n).read_text().split()) if (d / n).exists() else ""
    return dict(name=rd("name.txt"), sub=rd("subtitle.txt"), desc=(d / "description.txt").read_text())


def url(slug, lk):
    return f"{SITE}/apps/{slug}/{LANGS[lk][1]}"


def available(slug):
    return [k for k in LANGS if meta_of(slug, k)]


def parse_lead(desc):
    """开头只有【标语】、没有正文时，把标语和下一节正文并成导语。"""
    secs = parse(desc)
    if not secs[0][1] and len(secs) > 1:
        t, ch = secs[1]
        secs = [(secs[0][0], [[t]] + ch)] + secs[2:]
    return secs


def page(slug, lk):
    app = APPS[slug]
    m = meta_of(slug, lk)
    ui = UI[lk]
    langs = available(slug)
    short = short_of(slug, lk)
    secs = parse_lead(m["desc"])
    desc = summarize(secs)
    shots = shots_of(slug, lk)
    alts = alts_of(slug, lk, len(shots))
    store = f"https://apps.apple.com/{ui['store']}/app/id{app['id']}"
    plat = platform_of(slug)
    canon = url(slug, lk)
    icon, iw, ih = icon_of(slug)
    icon_abs = icon if icon.startswith("http") else SITE + icon
    title = f"{m['name']} | Corotata"
    xdef = url(slug, "en" if "en" in langs else "hans")

    # 正文
    body, faq_items, faq_done = [], [], False
    lead_chunks = secs[0][1]
    first = " ".join(lead_chunks[0])
    rest_chunks = lead_chunks[1:]
    if len(first) < 40 and rest_chunks:  # 标语 + 下一段合成导语
        tag = re.sub(r"^【(.+)】$", lambda mm: mm.group(1), first)
        lead = f'<p class="lead"><b>{E(tag)}</b> {E(" ".join(rest_chunks[0]))}</p>'
        rest_chunks = rest_chunks[1:]
    else:
        sent, restp = first_sentence_split(first)
        lead = f'<p class="lead"><b>{E(sent)}</b> {E(restp)}</p>' if sent and restp else f'<p class="lead">{E(first)}</p>'
    lead_rest = "".join(render_chunk(c) for c in rest_chunks)

    def faq_html(items):
        return (f"<section class=\"faq\"><h2>{ui['faq']}</h2>" +
                "".join(f"<h3>{E(q)}</h3><p>{E(a)}</p>" for q, a in items) + "</section>")

    own = []  # 商店文案自带问答
    sec_html = []
    for title_s, chunks in secs[1:]:
        if FAQT.search(title_s):
            qas, rest = extract_faq(chunks)
            own = qas
            sec_html.append(("faq", faq_html(qas) + "".join(render_chunk(c) for c in rest)))
        else:
            sec_html.append(("core" if CORE.search(title_s) else "sec",
                             f"<h2>{E(title_s)}</h2>" + "".join(render_chunk(c) for c in chunks)))
    items = own or FAQ.get(slug, {}).get(lk)
    assert is_store(slug) or (items and len(items) >= 3), (slug, lk, "FAQ 缺")
    faq_items = items or []
    parts = []
    placed = bool(own)
    for kind, h in sec_html:
        parts.append(h)
        if kind == "core" and not placed and items:
            parts.append(faq_html(items)); placed = True
    if not placed and items:
        parts.append(faq_html(items))
    body_html = lead_rest + "".join(parts)

    # 相关 App
    rel = []
    order = RELATED[slug] + [a for a in APPS if a != slug and a not in RELATED[slug] and not is_store(a)]  # 先放最相关的，再放其余全部
    if is_store(slug):
        order = RELATED[slug]
    for r in order:
        if lk not in available(r):
            continue
        rm = meta_of(r, lk)
        ri = icon_of(r)[0]
        rel.append(f'<a href="/apps/{r}/{LANGS[lk][1]}"><img src="{ri}" width="48" height="48" alt="{E(short_of(r, lk))}" loading="lazy">'
                   f'<b>{E(short_of(r, lk))}</b><span>{E(blurb(r, lk, rm))}</span></a>')
    rel_html = f'<h2>{ui["related"]}</h2><div class="rel">{"".join(rel)}</div>' if rel else ""

    # 截图
    imgs = "".join(
        f'<img src="{f}" width="{w}" height="{h}" alt="{E(a)}"{"" if i == 0 else " loading=\"lazy\""} decoding="async">'
        for i, ((f, w, h), a) in enumerate(zip(shots, alts)))

    # 页脚
    sw = []
    for k, label in (("hans", "简体"), ("hant", "繁體"), ("en", "English")):
        if k not in langs:
            continue
        sw.append(f"<b>{label}</b>" if k == lk else f'<a href="/apps/{slug}/{LANGS[k][1]}" hreflang="{LANGS[k][3]}" lang="{LANGS[k][2]}">{label}</a>')
    pp = PRIVACY_PATH.get(slug, "/privacy")
    pv = f"{pp}?lang={ui['privlang']}" if pp else None
    nav_pv = f'<a href="{pv}">{ui["privacy"]}</a>' if pv else ""
    foot_pv = nav_pv

    hreflinks = "".join(f'<link rel="alternate" hreflang="{LANGS[k][3]}" href="{url(slug, k)}">\n' for k in langs)
    ld_app = {
        "@context": "https://schema.org", "@type": "SoftwareApplication", "name": short,
        "alternateName": m["name"], "description": desc, "url": canon, "image": icon_abs,
        "operatingSystem": "iOS, iPadOS" + (", macOS" if "Mac" in plat else ""),
        "applicationCategory": "UtilitiesApplication", "inLanguage": LANGS[lk][2],
        "downloadUrl": store, "installUrl": store,
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD", **({} if is_store(slug) else {"description": ui["iap"]})},
        "author": {"@type": "Organization", "name": "Corotata", "url": SITE},
    }
    ld_faq = {"@context": "https://schema.org", "@type": "FAQPage", "inLanguage": LANGS[lk][2],
              "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq_items]}
    dump = lambda o: json.dumps(o, ensure_ascii=False).replace("</", "<\\/")

    return f"""<!doctype html>
<html lang="{LANGS[lk][2]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<link rel="canonical" href="{canon}">
{hreflinks}<link rel="alternate" hreflang="x-default" href="{xdef}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Corotata">
<meta property="og:title" content="{E(title)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{icon_abs}">
<meta name="twitter:card" content="summary">
<script type="application/ld+json">{dump(ld_app)}</script>
{f'<script type="application/ld+json">{dump(ld_faq)}</script>' if faq_items else ''}
<style>
{CSS}
</style>
</head>
<body>
<div class="wrap">
<nav><a class="brand" href="/">Corotata</a><a href="/">{ui['all']}</a><a href="/support">{ui['support']}</a>{nav_pv}</nav>
<header>
<img src="{icon}" width="96" height="96" alt="{E(short)}" fetchpriority="high">
<div><h1>{E(short)}</h1>{f'<p class="sub">{E(m["sub"])}</p>' if m['sub'] else ''}<p class="plat">{ui['plat']}：{plat}</p></div>
</header>
<main>
{lead}
<a class="btn" href="{store}">{ui['dl']}</a>{'' if is_store(slug) else f'<span class="meta">{ui["iap"]}</span>'}
<div class="shots">{imgs}</div>
{body_html}
<!--reviews-->{reviews.section(slug, lk, app['id'])}<!--/reviews-->
{rel_html}
</main>
<footer>
<div class="lang">{' '.join(sw)}</div>
{foot_pv}<a href="/support">{ui['support']}</a><br>© Corotata
</footer>
</div>
</body>
</html>
"""


def main():
    urls = []
    for slug in APPS:
        for lk in available(slug):
            d = OUT / "apps" / slug / LANGS[lk][1]
            d.mkdir(parents=True, exist_ok=True)
            (d / "index.html").write_text(page(slug, lk), encoding="utf-8")
            urls.append((slug, lk))
    # sitemap（含 hreflang 互指）
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for slug, lk in urls:
        sm.append(f"<url><loc>{url(slug, lk)}</loc>")
        for k in available(slug):
            sm.append(f'<xhtml:link rel="alternate" hreflang="{LANGS[k][3]}" href="{url(slug, k)}"/>')
        sm.append("</url>")
    sm.append("</urlset>")
    (OUT / "sitemap.xml").write_text("\n".join(sm) + "\n", encoding="utf-8")
    # llms.txt
    L = ["# Corotata", "",
         "> Corotata 是独立开发者的 App 作品集：EPUB 电子书的编辑、转换、翻译与传输工具，以及其他效率与创意 App。以下是各 App 的介绍页（简体中文、繁体中文、英文，视 App 而定）。", ""]
    LN = {'hans': '简体', 'hant': '繁體', 'en': 'English'}
    for title, grp in (("EPUB 系列", [x for x in APPS if not is_store(x)]), ("其他 App", [x for x in APPS if is_store(x)])):
        L += [f"## {title}", ""]
        for slug in grp:
            for lk in available(slug):
                m = meta_of(slug, lk)
                L.append(f"- [{short_of(slug, lk)}（{LN[lk]}）]({url(slug, lk)}): {blurb(slug, lk, m)}")
        L.append("")
    (OUT / "llms.txt").write_text("\n".join(L) + "\n", encoding="utf-8")
    print(len(urls), "pages")


if __name__ == "__main__":
    main()
