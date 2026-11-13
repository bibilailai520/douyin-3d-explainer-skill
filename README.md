# 抖音3D机器人科普视频 Skill

将当前账号的亮色立体卡片、Three.js机器人、七套变装、语义动效、字幕、音效与封面流程交给 WorkBuddy 或其他能执行本地代码的模型。输入是定稿和配音；不是仅靠提示词复刻画面。

当前版本 **1.2.0**。依据 Markdown 写作 V9、客服知识库 V4、AI 蒸馏章节修订 V2及Codex十句提示词工程更新，并合入此前本地1.1.0的修正。

- 第0帧开始拉远、浅色动态网格、同平面厚板与小卡接触阴影。
- 独立章节标题/章序/分段进度，按实际章节数生成；60px灰底字幕。
- 高处落地、文件传递与真正三维书页配方，去掉装饰性循环圆点。
- 稀疏音效、原AAC音轨复用；分段静音渲染后统一混音，按源码与素材指纹恢复渲染。
- 新主题封面让机器人参与道具动作；旧拼贴模板按需沿用。

详细变化见[近期制作修正](references/recent-production.md)，完整参数见[视觉规范](references/visual-system.md)，代码迁移见[语义配方](references/semantic-recipes.md)。

## 在 WorkBuddy 中使用

1. 下载[WorkBuddy技能包 v1.2.0](https://github.com/bibilailai520/douyin-3d-explainer-skill/raw/refs/heads/main/dist/douyin-3d-explainer-workbuddy-v1.2.0.zip)，或固定入口[最新技能包](https://github.com/bibilailai520/douyin-3d-explainer-skill/raw/refs/heads/main/dist/douyin-3d-explainer-workbuddy.zip)。
2. WorkBuddy → **专家·技能·连接器 → 技能 → 添加技能 → 上传技能**，选择该ZIP。不要把整个GitHub仓库下载ZIP当作技能ZIP；后者有额外外层目录。
3. 在新任务调用：“使用抖音3D机器人科普视频技能。定稿是……，配音是……，输出到D盘。按最近几期的浅色网格、厚板、机器人和章节进度风格制作，先做分镜和开场，再完成全片。封面让机器人与主题物件互动。”

技能包使用 WorkBuddy 官方的完整 frontmatter 字段。仓库根 `SKILL.md` 则保留通用 Agent Skills 格式，额外展示字段放在metadata中。用 `python scripts/package_skill.py --out dist` 可重新生成WorkBuddy ZIP和SHA256校验文件。

## 快速验证环境

```powershell
python scripts/doctor.py
python scripts/new_episode.py --out "D:/Videos/demo-explainer" --demo
cd "D:/Videos/demo-explainer"
npm install
npm run browser:ensure
node scripts/fetch-font.mjs
npm run demo:audio
npm run typecheck
npm run check:layout
npm run check:presentation
npm run check:render-plan
npm run stills
npm run opening
```

演示工程约24秒，没有真人配音，有演示字幕及音效；它是环境和动作验证用例。正式稿请使用`--script`、`--voice`新建，并按SKILL.md替换全部演示镜头、时序和台词。

可配置 `FFMPEG_PATH`、`FFPROBE_PATH`、`CHROME_PATH`。首次npm安装、浏览器/字体下载需要网络；本地ASR使用自备模型。没有识别条件时可用配音稿结合听检手动标时，不得声称逐字精确。SFX合成不调用付费API。

## 包内有什么

- `SKILL.md`：工作入口和账号约定。
- `references/`：完整流程、技术架构、视觉与机器人、音频对齐、质检、封面规则。
- `templates/episode/`：可运行Remotion/React/HTML/CSS/SVG/Canvas/Three.js/GSAP工程；含原机器人渲染器。
- `assets/recipes/`：缓存与成本、三维文档/弯曲书页/文件夹/传递路线的Three.js参考代码。
- `assets/`：当前封面模板与经典机器人参考。
- `scripts/`：新建工程、环境检查、本地对齐、音轨处理、成片检查、技能打包。

没有原始真人配音、发布成片、浏览器登录信息、Token、API密钥或作者电脑的依赖目录。

模板默认字幕60px、70%不透明灰底、bottom=28px；大板共享1.12倍阅读缩放。章节在右上、标题与分段线上下分离，左侧账号Logo。完整导出可选`npm run render`或`npm run render:segments`；后者默认两镜并行，低内存设`SEGMENT_PARALLEL=1`，用`--only=documents`先渲染单镜。操作详见[技术架构](references/architecture.md)。渲染已有输出默认停止，可通过`OUTPUT_NAME`选择新版本。只改画面按[音频说明](references/timing-audio.md)复制旧AAC并核对载荷和时间戳。

## 可复现性与实际限制

新主题需要制作自己的语义图解。包中的机器人、基础轨道和动作机制可复用。ASR时间戳保留估计与复核记录；人工连续观看、听检及独立评审按实际执行情况填写。版本验证与范围见[VALIDATION.md](VALIDATION.md)。

本仓库未给账号模板/IP添加开放商用授权。第三方依赖按其各自许可使用，Remotion商用适用条件须由使用者确认。详见[THIRD_PARTY.md](THIRD_PARTY.md)。

官方格式依据（2026-11-03核对）：[WorkBuddy技能结构](https://open.workbuddy.cn/docs/skill)、[技能上传](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Skills-Market)。

