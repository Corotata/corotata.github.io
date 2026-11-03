# 怎么发一篇开发周记

1. 新建文件 `src/posts/zh/<英文短名>.md`，例如 `week-01.md`。英文短名会成为链接 `/blog/week-01`。
2. 文件开头写 frontmatter，格式和之前的文章一致：

   ```
   ---
   title: "开发周记 第 1 期"
   date: "2026-11-03"
   description: "一句话摘要"
   tags: ["开发周记"]
   ---
   ```

3. 只写中文就行：`src/posts/en`、`src/posts/tw` 不用放同名文件。英文、繁体界面没有对应翻译时会显示中文版（有同名文件时优先显示该语言的版本）。
4. 本地预览：`npm run dev`，打开 http://localhost:5173/blog 。
5. 提交并推送到 `main`，GitHub Actions 会自动构建并部署到 corotata.com。
6. 旧文章存放在 `archived-posts/`，不会被打包；想恢复就移回 `src/posts/`。
