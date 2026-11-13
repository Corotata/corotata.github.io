"""各 App 的数据来源（本机路径）与基础信息。文案以 fastlane/metadata 为准。"""
from pathlib import Path
import glob

H = Path.home() / "Documents"
LANGS = ["zh-Hans", "zh-Hant", "en-US"]

def fl(project, lang, n=5):
    """fastlane/screenshots 里的 iPhone 上架图，取前 n 张。"""
    return sorted(glob.glob(str(project / "fastlane/screenshots" / lang / f"{lang}-iphone-*.png")))[:n]

def shots(project, n=5):
    return {l: fl(project, l, n) for l in LANGS}

def tanko():
    base = H / "应用截图/Tanko/上架图"
    pick = [1, 3, 5, 6, 7]
    return {
        "zh-Hans": [str(base / f"中文/iPhone/Tanko/iPhone_6.5_zh-Hans_{i}.png") for i in pick],
        "zh-Hant": [str(base / f"繁体/Tanko/iPhone_6.5_zh-Hant_{i}.png") for i in pick],
        "en-US": [str(base / f"英文/Tanko/iPhone_6.5_en-US_{i}.png") for i in pick],
    }

def fjt():
    base = H / "应用截图/Epub繁简通上架图"
    s = sorted(glob.glob(str(base / "简体/*iPhone*")))
    t = sorted(glob.glob(str(base / "繁体/*iPhone*")))
    return {"zh-Hans": s, "zh-Hant": t}

NP = H / "MyNewProject"
APPS = {
    "epub-omg":        {"id": 6824231150, "project": NP / "EPUBStudio",      "shots": shots(NP / "EPUBStudio")},
    "epub-converter":  {"id": 6799873889, "project": NP / "EPUB Converter",  "shots": shots(NP / "EPUB Converter")},
    "txt-to-epub":     {"id": 6751633451, "project": NP / "TxtToEpub",       "shots": shots(NP / "TxtToEpub")},
    "epub-translator": {"id": 6748774714, "project": NP / "EPUBTranslator",  "shots": shots(NP / "EPUBTranslator")},
    "epub-cover-maker":{"id": 6759366987, "project": NP / "EPUBCoverMaker",  "shots": shots(NP / "EPUBCoverMaker")},
    "fan-jian-tong":   {"id": 6746181003, "project": H / "MyProject/FanJianTong", "shots": fjt()},
    "booksend":        {"id": 6825868252, "project": NP / "BookSend",        "shots": shots(NP / "BookSend")},
    "tanko":           {"id": 6755611046, "project": NP / "Tanko",           "shots": tanko()},
    # 以下没有 fastlane 文案，用 apps.json 里的 App Store 商店文案（store=True）
    "daodejing":       {"id": 6739570522, "store": True},
    "images-extractor": {"id": 6670189381, "store": True},
    "dsearch":         {"id": 6746525636, "store": True},
    "voicesmith":      {"id": 6754076767, "store": True},
    "subtitle-translator": {"id": 6504551887, "store": True},
    "schulte-table":   {"id": 6755658248, "store": True},
    "localization-master": {"id": 6504154553, "store": True},
    "tinydrawer":      {"id": 6758496623, "store": True},
    "kiddoworld":      {"id": 6760543478, "store": True},
    "shotfit":         {"id": 6749874426, "store": True},
    "gridsplit":       {"id": 6741735460, "store": True},
    "scanwifi":        {"id": 6746719522, "store": True},
    "pichd-plus":      {"id": 1370721516, "store": True},
    "wasabi-50":       {"id": 6742366538, "store": True},
}
