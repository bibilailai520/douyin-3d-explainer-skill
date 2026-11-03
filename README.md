# 抖音3D机器人科普视频 Skill

将当前账号的亮色立体卡片、Three.js机器人、七套变装、语义动效、字幕、音效与封面流程交给 WorkBuddy 或其他能执行本地代码的模型。输入是定稿和配音；不是仅靠提示词复刻画面。

## 在 WorkBuddy 中使用

1. 下载仓库 `dist/douyin-3d-explainer-workbuddy.zip`。
2. WorkBuddy → **专家·技能·连接器 → 技能 → 添加技能 → 上传技能**，选择该ZIP。不要把整个GitHub仓库下载ZIP当作技能ZIP；后者有额外外层目录。
3. 在新任务调用：“使用抖音3D机器人科普视频技能。定稿是……，配音是……，输出到D盘。先按语义制作分镜和开场，然后完成全片。保留我的机器人与封面模板。”

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
npm run stills
npm run opening
```

演示工程约24秒，没有真人配音，有演示字幕及音效；它是环境和动作验证用例。正式稿请使用`--script`、`--voice`新建，并按SKILL.md替换全部演示镜头、时序和台词。

可配置 `FFMPEG_PATH`、`FFPROBE_PATH`、`CHROME_PATH`。首次npm安装、浏览器/字体下载需要网络；本地ASR使用自备模型。没有识别条件时可用配音稿结合听检手动标时，不得声称逐字精确。SFX合成不调用付费API。

## 包内有什么

- `SKILL.md`：工作入口和账号约定。
- `references/`：完整流程、技术架构、视觉与机器人、音频对齐、质检、封面规则。
- `templates/episode/`：可运行Remotion/React/HTML/CSS/SVG/Canvas/Three.js/GSAP工程；含原机器人渲染器。
- `assets/`：当前封面模板与经典机器人参考。
- `scripts/`：新建工程、环境检查、本地对齐、音轨处理、成片检查、技能打包。

没有原始真人配音、发布成片、浏览器登录信息、Token、API密钥或作者电脑的依赖目录。

## 可复现性与实际限制

Skill指导模型按语义创作，不能保证不同模型逐像素生成相同镜头。包中的机器人与基础轨道可复用；新主题需要制作自己的图解。ASR时间戳和脚本匹配不能替代听检，编码/响度检查不能证明主观听感。自动脚本输出的`humanListening:false`和`continuousPlayback:false`保持原意。

本仓库未给账号模板/IP添加开放商用授权。第三方依赖按其各自许可使用，Remotion商用适用条件须由使用者确认。详见[THIRD_PARTY.md](THIRD_PARTY.md)。

官方格式依据（2026-11-03核对）：[WorkBuddy技能结构](https://open.workbuddy.cn/docs/skill)、[技能上传](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Skills-Market)。

