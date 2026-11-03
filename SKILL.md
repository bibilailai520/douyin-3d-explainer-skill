---
name: douyin-3d-explainer
description: 将中文定稿和现成配音制作成横版科普视频，沿用账号的亮色立体卡片、3D机器人变装、语义动画、配音字幕与音效，并按指定封面模板交付发布素材。适合“按上一期风格生成视频”“给配音配画面”“修改机器人、卡片或音效”；不自动生成新配音或发布视频。
metadata:
  version: "1.0.0"
  author: bibilailai520
  display_name: 抖音3D机器人科普视频
  display_name_en: Douyin 3D Explainer
  description_zh: 文案与配音转亮色立体卡片科普视频，保留账号机器人及封面风格。
  description_en: Produce narrated landscape explainers with a reusable 3D robot, semantic motion, captions and publishing assets.
---

# 抖音3D机器人科普视频

把用户定稿和成品配音转成可发布的1920×1080、30fps视频。先检查素材、时长和语义是否一致；不擅自改稿、换音色、变速或把主观修辞画成统计事实。缺配音时可先做画面预演，但要明确没有完成配音同步。

这是一套已实际使用的制作方法和可运行起步工程，**不是把任意文章自动套进四种卡片的成片器**。示例镜头用于验证环境；正式制作必须按新稿语义改写 `Scenes.tsx`、镜头和事件时间。

## 开始工作

1. 读取 [references/workflow.md](references/workflow.md)，确认定稿、音频、参考、输出目录和交付范围。路径均相对于本技能根目录，不依赖原作者电脑。
2. 运行 `python scripts/doctor.py`。需要 Node.js 20+、Python 3.10+、FFmpeg/FFprobe；本地转写另需 `requirements-asr.txt` 和已下载的 faster-whisper 模型。不要为可选转写阻断已能做的画面工作。
3. 新建工程：`python scripts/new_episode.py --out "D:/Videos/my-episode" --title "本期标题" --script "定稿.md" --voice "配音.mp3"`。目标目录必须不存在；不会覆盖用户旧片。已知已有工程时在其版本副本上修改。
4. 在工程目录执行 `npm install`；`npm run browser:ensure` 安装渲染浏览器；`node scripts/fetch-font.mjs` 安装开源中文字体。支持 `CHROME_PATH`、`FFMPEG_PATH`、`FFPROBE_PATH` 环境变量。
5. 参照 [references/timing-audio.md](references/timing-audio.md) 生成并核对字幕时间；把镜头、章节、字幕、落点、音效、变装与小动作写进 `episode.json`。必须把脚手架的 `demo:true` 改为 `false`，并删除演示台词、镜头和事件。
6. 按 [references/visual-system.md](references/visual-system.md)、[references/robot-motion.md](references/robot-motion.md) 制作语义画面；结构/接口见 [references/architecture.md](references/architecture.md)。优先保留成熟轨道和机器人渲染器，不回退成整页文字加淡入淡出的PPT。
7. 先渲染开头及关键帧检查，再合成配音、音效，完成全片：`python "<技能根>/scripts/mix_audio.py" --project .` → `npm run stills` → `npm run opening` → `npm run render`。首次环境验证可用 `npm run demo:audio`，该命令只给 `demo:true` 工程造演示音效，不生成真人配音。
8. 执行 `python "<技能根>/scripts/qa_episode.py" --project . --decode`，再按 [references/quality-gates.md](references/quality-gates.md) 检查实际编码视频。按实际发生情况记录播放、听检和审片，不能把元数据检查写成整片验收。

## 必须保留的账号约定

- HTML/React定位置和层级；CSS定字体、配色、厚度和阴影；SVG画图标和关系；Canvas画路线与流动；Three.js负责机器人及真正3D物件；GSAP负责可按时间定位的缓动。Remotion控制每帧时间、字幕、音频和导出。
- 亮色背景随章节柔和变化。大卡片有圆角厚边、右下投影、小卡片有接触阴影；开头近景明显退远，下一张卡片从**左侧向右**滑入。左侧预露下一张卡片应在退远后才显现。
- IP在左侧安全区，第0帧不在画面中央；从画外走入。前景层级高于全部大卡片。机器人朝向匹配大卡片的平面，切卡时跳过来卡片边沿；保留皮肤展示、胸灯呼吸、表情和头顶气泡。
- 默认在用户指定七套皮肤中按本期固定随机种子抽取，不连续重复。池为2深空夜航、5轨道航天、6赛博霓虹、9月兔中秋、11夜行巫师、12雪夜礼颂、13醒狮贺岁。封面默认经典银白，除非本期另有要求。
- 字幕以**实际配音**为准；1920×1080默认52px，灰色底**70%不透明**、圆角、较明显软影，重点词黄。用户新指定字号覆盖此默认。章节进度置顶。
- 第0秒不加突兀音效；下落卡片落地才响Do/Re/Mi等短音，跳起/落地/翻页有对应音效，不用持续爆音代替动效。增大音效要重新核对人声可懂度与真峰值。
- 不强制“前30秒每3–4.2秒换构图”：用户后来取消了这个固定频率。按语义触发内部动作与画面变化；同画面没有信息推进时再拆镜头。

## 发布素材（用户要求时）

保留用户指定标题；标题20字内（用户另定除外），简介给出本期收获并留一个具体互动问题，话题不伪称实时热榜。按 [references/cover.md](references/cover.md) 使用 `assets/cover-template.png` 和 `assets/robot-classic.png` 生成1080×1440 RGB封面。保存完整提示词和生成方式；没有图像生成能力时说明限制，不拿默认字体拼图冒充模板字体。

## 能力和权限边界

全部核心生产可本地完成。不要要求用户提供账号密码；不会自动上传配音、付费合成、登录平台、发送消息或发布。用户明确授权的外部动作按当前授权执行，不重复索要同一许可。保留源文件；输出新版本。事实不确定时留证据和说明，不替用户编出处。封面和机器人资产属于账号素材，勿因为仓库可访问就宣称第三方可商用。

## 交付

完整MP4、SRT、可编辑工程、`SHOTBOOK.md`、音效事件表、版本与检查记录；请求发布素材时另附标题/简介/话题、封面、提示词。最后报告**实际绝对输出路径**及尚未完成的人工检查。
