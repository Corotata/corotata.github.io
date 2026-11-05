# 隐私政策与技术支持页：App 怎么接

给开发 App 的 Agent 看。官网已经提供好以下页面，新 App 上架时直接选一个链接填上，不要自己写隐私政策，也不要再用 Notion。

## 链接

域名 `https://corotata.com`。页面按浏览器语言显示中文简体、繁体或英文；App 里可加 `?lang=zh`、`?lang=zh-TW`、`?lang=en` 指定语言。

### 技术支持（所有 App 共用）

`https://corotata.com/support`

### 隐私政策（按 App 的数据去向选一个）

| 类型 | 链接 | 选它的条件 | 现有 App |
|---|---|---|---|
| 本地型 | `/privacy` | 核心文件和内容在本机处理；可选 iCloud 同步需由用户开启 | TXT转EPUB、EPUB转文档、EPUB繁简通（Pro 和旧版）、EPUB封面制作、心流方格、ShotFit、GridSplit、PicHD Plus、兜兜世界、Wasabi 50、DSearch、ScanWifi、找快递、OMG相机、BookSend、EPUB OMG |
| 翻译类 | `/privacy/translation` | 把用户的文字发给 Google / Microsoft 翻译，或用户自己填 API Key 调 AI 服务 | EPUB翻译官、字幕翻译助手、本地化大师 |
| 网页导入 | `/privacy/web-import` | 按用户输入的网址导入内容；TinyDrawer 同时说明在线翻译、快捷指令 AI 和可选 iCloud | Tanko、TinyDrawer |
| 微软语音 | `/privacy/voice` | 用微软在线语音生成声音 | VoiceSmith |
| 微信读书 | `/privacy/weread` | 数据只存本机，开启后只存用户自己的 iCloud | BookLines |

### 使用条款

用苹果标准 EULA：`https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`。有订阅的 App 在 App Store Connect 的 EULA 里选“苹果标准”，App 内的条款链接也指向上面这个地址。

## 要填的位置

- App Store Connect：App 信息里的“隐私政策网址”填上表对应链接，“技术支持网址”填 `https://corotata.com/support`。
- `fastlane/metadata/<语言>/privacy_url.txt` 和 `support_url.txt`：同上。
- App 内设置页的隐私政策、技术支持入口：同上。
- 已上线的旧版本继续用旧 Notion 链接，不用改；新版本再换。

## 新 App 怎么接

1. 先判断数据去向，从上表选类型。拿不准就按源码核对：有没有把用户内容发给第三方、有没有抓取网页、有没有账号或自己的服务器。
2. 现有类型能覆盖：直接用对应链接。不用改官网。
3. 需要新类型（例如调用了表里没写的第三方服务）：在官网仓库改 `src/data/legal.ts`，在 `PRIVACY_PAGES` 加一项，在 `PRIVACY` 的三种语言里补文案；改完要同步更新本文件，再提交推送，GitHub Actions 会自动上线。
4. 页面底部的 App 图标来自 `src/data/apps.json`（每周从 App Store 同步）。新 App 上架后，在 `PRIVACY_PAGES` 里把它的 App Store ID 加进对应类型的 `appIds`；上架前可先用 `titleKeywords`（商店标题关键字）。

## 约定

- 隐私政策只写数据去向，不为每个 App 单独写。
- 联系邮箱目前是个人 Gmail，常量在 `legal.ts` 的 `CONTACT_EMAIL`；换成公司邮箱只改这一处。
- 政策里的说法必须和 App 实际行为一致。App 行为变了（比如新增联网功能），要改选类型或改页面，同时检查 App Store Connect 的隐私标签。
- 不做：道德经赏析、图片提取（已无法更新）。
