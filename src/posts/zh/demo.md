---
title: "Markdown 样式展示：探索排版之美 (中文版)"
date: "2024-05-21"
description: "这是一篇演示文章，展示了博客对各种 Markdown 语法的支持效果，包括代码、列表、引用、表格和图片。"
tags: ["Demo", "Design"]
---

## 排版与阅读体验

好的排版应该是**透明**的。它不应该抢夺读者的注意力，而是应该引导视线，让阅读变得愉悦。

> "设计不仅仅是外观和感觉，设计是它是如何工作的。" — *Steve Jobs*

### 1. 文本样式

我们支持各种基础文本样式：
*   **加粗文本**用于强调。
*   *斜体文本*用于引用或语气变化。
*   ~~删除线~~用于表示过时的信息。
*   `行内代码`用于标记技术术语。

### 2. 代码高亮

作为一个技术博客，代码块的显示效果至关重要。

```typescript
interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

function greet(user: User) {
  console.log(`Hello, ${user.name}!`);
}
```

### 3. 列表展示

**有序列表：**
1.  第一步：思考
2.  第二步：设计
3.  第三步：编码

**无序列表：**
*   React
*   TypeScript
*   Tailwind CSS

### 4. 表格支持 (GFM)

| 功能 | 状态 | 备注 |
| :--- | :---: | :--- |
| Markdown | ✅ | 基础支持 |
| 表格 | ✅ | GFM 扩展 |
| 数学公式 | ❌ | 暂未支持 |

### 5. 图片与媒体

图片会自动适应屏幕宽度，并带有圆角和阴影处理。

![示例图片：宁静的工作台](https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80)

### 6. 链接与引用

你可以链接到 [Google](https://google.com) 或者其他文章。

如果您想分享视频，目前建议使用链接形式，或者我们可以后续添加视频嵌入组件：

[🎥 点击观看：2024 Apple 特别活动](https://www.apple.com)

---

希望这个演示能让您对博客的最终效果有更直观的感受！
