# 齿轮工坊

单文件网页应用：设计渐开线齿轮、搭建传动并演示转动、导出可 3D 打印的 STL（打包为 zip）。

## 运行

只有一个 `index.html`，不需要安装依赖或构建。three.js 从 CDN 加载，所以第一次打开需要联网。

- **VS Code**：安装扩展 **Live Server**，右键 `index.html` → *Open with Live Server*。
- 或者直接双击 `index.html`，用浏览器打开。
- 或者在命令行运行 `npx serve .` / `python -m http.server`，然后访问 http://localhost:8000 。

## 想离线用

把 three.js 下载到本地，再把 `index.html` 里的两个 `<script src>` 改成本地路径：

- https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
- https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js

## 代码结构（都在 index.html 的 `<script>` 里）

- `gearProfile()`：生成渐开线齿廓、轴孔和减重孔
- `gearLayers()`：直齿、斜齿、人字齿的扭转分层
- `extrude()`：把齿廓拉伸成闭合三角网格
- `layout()`、`speeds()`、`angles()`：装配位置、转速和啮合相位
- `plateParts()`：底板和分层垫高的轴销
- `stl()`、`zip()`：二进制 STL 写入和 zip 打包
