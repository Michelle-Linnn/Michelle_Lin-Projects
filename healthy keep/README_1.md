# 燃迹 BurnTrack

一个减脂增肌记录网页 App：拍照识别热量、AI 教练排每日安排、语音口令训练、达标热力图。
单文件、无依赖、无后端，数据存在浏览器本地。

---

## 一、填 API Key

打开 `index.html`，最上面 `<script>` 里第一行就是：

```js
var GEMINI_API_KEY = "";          // ← 把 key 粘贴在这两个引号中间
```

**但先读完下面这一节再决定要不要填在这里。**

### key 填哪里更好

| 方式 | key 会不会泄露 | 适合谁 |
|---|---|---|
| **留空，在 App 设置页里填**（推荐） | 不会。只存你自己浏览器，不进代码、不进 GitHub | 所有人 |
| 写死在文件里 + 仓库 Private + key 加域名限制 | 基本安全 | 想省事又懂配置的 |
| 写死在文件里 + 仓库 Public | **会泄露，key 大概率被 Google 自动作废** | 别这么干 |

留空的话，打开网页 → 「我的」→ 拉到最下面「Gemini API Key」→ 粘贴 → 点「测试连接」。
只用填一次，浏览器会记住。

---

## 二、在 VSCode 里跑起来

> `index.html` 是一个完整的独立网页（含 doctype、手机适配声明、主屏图标），
> 不依赖任何外部文件和网络资源。三个文件放同一个文件夹即可。


**不能直接双击 `index.html` 打开。** 用 `file://` 打开的网页向 Google 发请求会被浏览器拦掉（CORS），
你会看到"连不上 Google"。必须用一个本地服务器。

最简单的办法：

1. VSCode 里装扩展 **Live Server**（作者 Ritwick Dey）
2. 右键 `index.html` → **Open with Live Server**
3. 浏览器自动打开 `http://127.0.0.1:5500/index.html`，这样就能正常调 API 了

不想装扩展的话，在项目文件夹里跑任意一个：

```bash
python3 -m http.server 5500      # 然后开 http://localhost:5500
npx serve .                      # 需要 Node
```

---

## 三、传 GitHub + 部署

```bash
git init
git add .
git commit -m "燃迹 v1"
git branch -M main
git remote add origin https://github.com/你的用户名/burntrack.git
git push -u origin main
```

### 部署成网址（手机上就能用）

**GitHub Pages**（免费）：仓库 → Settings → Pages → Source 选 `main` 分支 `/ (root)` → Save。
一两分钟后给你一个 `https://你的用户名.github.io/burntrack/` 的网址。

> ⚠️ GitHub Pages **要求仓库是 Public**（免费版）。所以如果你走 Pages，
> **key 一定要留空、在 App 设置页里填**，否则源码里的 key 全世界可见。

**想用 Private 仓库**：改用 Netlify 或 Vercel，都支持从私有仓库免费部署。
或者最省事——直接把 `index.html` 拖到 [netlify.com/drop](https://app.netlify.com/drop)，不用注册不用 Git。

### 装到 iPhone 主屏

拿到网址后，iPhone 用 Safari 打开 → 底部「分享」→「添加到主屏幕」。
之后就有独立图标、全屏运行，跟原生 App 差不多。

---

## 四、给 key 加限制（强烈建议做）

即使 key 没泄露，加了限制也能防止被盗刷。

1. 打开 [Google AI Studio](https://aistudio.google.com/apikey) 或 Google Cloud Console 的凭据页面
2. 找到你的 API key → 编辑
3. **应用限制** → 选「HTTP 引荐来源网址（网站）」
4. 添加你的域名，例如：
   ```
   https://你的用户名.github.io/*
   http://127.0.0.1:5500/*
   ```
5. **API 限制** → 只勾选 `Generative Language API`
6. 保存

这样这个 key 只有从你自己的网页发出的请求才有效，别人拿到也用不了。

---

## 五、能用和不能用的

**能用：**
- 拍照识别热量（Gemini 看图估算食物、克数、热量、蛋白质）
- AI 按你的作息排今日时间轴（上班 / 训练窗口 / 三餐窗口）
- 跟教练对话调整当天安排（「今晚加班」「我现在不饿」）
- AI 教练读你最近 7 天数据做点评
- 训练模式：语音念要点 → 倒数 → 跟节拍报数 → 休息时预告下一个动作
- 一键喝水、水瓶滑动调量、记体重、手动记运动
- 体重趋势图（7 日均线）、热量柱状图、GitHub 式达标热力图
- 每日目标自动计算（Mifflin-St Jeor 公式 + 安全下限校验）

**不能用（需要 iOS 原生版）：**
- 读 Apple Watch / HealthKit 数据 —— 运动分钟要手动记
- 系统推送提醒 —— 网页版没有可靠的定时通知

---

## 六、数据存在哪

全部在浏览器的 `localStorage` 里，key 前缀 `bt_`：

- `bt_profile` — 体质档案和作息
- `bt_days` — 每天的记录
- `bt_gemini_key` / `bt_gemini_model` — 你的 key 和模型选择

**清浏览器数据 / 换设备 = 数据没了。** 想长期用建议偶尔备份：
浏览器开发者工具 → Console 里跑

```js
copy(JSON.stringify({p:localStorage.bt_profile, d:localStorage.bt_days}))
```

粘到一个文本文件存着。要恢复就反着写回去。

---

## 七、出问题了

App 里的报错会说人话，对照着看：

| 报错 | 什么原因 | 怎么办 |
|---|---|---|
| 连不上 Google | 用 `file://` 直接打开了，或网络不通 | 用 Live Server / 本地服务器打开 |
| API key 无效或没有权限 | key 复制错了、被删了、或域名限制拦住了 | 检查 key；检查引荐来源限制里有没有当前域名 |
| 超出配额或调用太频繁 | 免费额度用完了 | 等一会儿，或换 flash-lite 模型 |
| 接口报错：...模型名不对 | 模型 ID 变了 | 去设置里换一个，或改文件顶部的 `GEMINI_MODEL` |
| 模型返回的格式看不懂 | 偶发 | 再试一次；一直这样就换 pro 模型 |

代码里对 Gemini 的两种接口格式做了自动切换（新版 `/interactions` 和旧版 `:generateContent`），
哪个能用走哪个。接口以后再变的话，改 `geminiCall()` 这一个函数就行。

---

## 八、注意

本 App 的热量、训练和饮食建议是一般性健康信息，**不构成医疗意见**。
有基础疾病、正在服药或关节有旧伤，开始前请咨询医生。

热量计算用 Mifflin-St Jeor 公式，内置三道安全校验：不低于基础代谢、
男 1500 / 女 1200 kcal 绝对下限、每周减重超过体重 1% 会警告。
