# 技术架构与可复现接口

## 画面不是一张PPT

|层/技术|职责|实现位置|
|---|---|---|
|Remotion|frame/fps作为唯一时钟，组合音频和画面，导出1080p30|src/index.tsx、Film.tsx、render.mjs|
|HTML/React|大板/小卡/标题/章节/字幕/气泡的内容、布局、层级|Film.tsx、Scenes.tsx、Robot.tsx|
|CSS|圆角、字重、章节色、真厚边、卡片和字幕阴影、3D透视|style.css|
|SVG|图标、箭头和可描边路线，路径与前景对象处于同一坐标系|Scenes.tsx|
|Canvas 2D|文件沿路线完成语义传递；低对比动态网格背景|SemanticCanvas、Background.tsx|
|Three.js|账号机器人几何/材质/骨骼、地面与接触投影、必要的3D物体|Robot.tsx、robot-runtime.js|
|GSAP|用parseEase驱动时间函数；可扩展暂停timeline并seek(t)|motion.ts、Scenes.tsx|
|Python/FFmpeg|本地转写对齐、音符合成、混音、响度、检查、ZIP|scripts/|

## 工程结构

`episode.json`包含 fps=30、width=1920、height=1080、duration、seed、demo、audio、chapters、shots、captions、sfx、wardrobe、motions、bubbles、keywords。

- 全部时间为秒，区间是`[start,end)`；总帧数为`ceil(duration*fps)`，渲染单帧t=frame/fps。
- shots必须连续覆盖整片且id唯一。每个shot含id/start/end/title/kicker/type、action/expr、items等。字幕/章节/事件不超过总时长。
- type只是示例路由：flow、network、keys、compare。正式片应增加与主题匹配的场景组件，不能逐镜机械换文字。
- items中的dropAt是**镜头局部秒**；SFX中的at、章节at、motions.start、wardrobe.start是**全片秒**。不能混用。
- highlightRoles按cost/reuse/shared列关键词；caption.emphasis可按词覆盖角色或颜色。新主题重新分配语义，不沿用演示词表。visualStyle记录样式起点；实际几何以rail-geometry.ts为准，字幕字号以subtitleSize为准。
- audio是public目录内路径，如`audio/full-mix.wav`；narration是项目内原音频相对路径。不要把外部绝对路径放入浏览器staticFile。
- wardrobe和motions必须能在任意时间点独立求出状态；每次render跳到同一帧必须完全一致。

## 时间和随机性

禁止依赖墙钟、setInterval、未定位的RAF、逐帧Math.random。GSAP若用timeline，先pause，再在每帧seek绝对时间；不使用页面加载后自动播放的独立时钟。随机皮肤采用seed生成洗牌序列，不连续重复；换内容和seed时生成新一集，重渲染保持同一集一致。

初始化WebGL在useLayoutEffect，第二个useLayoutEffect按当前t重置和采样，不累积delta。缓存/加载资源必须受delayRender/continueRender保护；错误要cancelRender，不能导出透明空机器人还报完成。

## 同一轨道

`rail-geometry.ts`统一BOARD、READING_SCALE、ORBIT、IP_LAYOUT与投影矩阵。先把所有等大板排在同一平面，围绕下方远处中心旋转；track按相邻镜头边界连续推进。index+1的板在左侧，旋转向右进入阅读位；已出场的旧板退出右边界。最后一镜没有虚构的下一张。

`OpeningRail.tsx`只对已经排好的整个轨道施加一次相机差量。开头近景退远时，左板自然露出；不延迟创建它，也不给左板单独缩放。主板投影、影子与来卡边沿共用几何。当前默认READING_SCALE=1.12，其余起点与改动后检查见[visual-system.md](visual-system.md)。运行`npm run check:layout`检查阅读范围、左侧预露、旧板退出和IP过边；仍需检查实际帧中的字和对象。

IP跳跃与卡边过IP的同一track函数绑定。左右方向、卡片宽、IP位置或动画曲线改变后，重新计算过边时刻。不能各写一个独立setTimeout。字幕与章节为屏幕空间，IP为独立前景canvas，因此卡片永远不能遮住IP。

## 版本与缓存

依赖使用固定版本并保留package-lock.json；FFmpeg/browser版本写入QA。多段渲染时每段静音，按连续整数帧闭区间渲染`startFrame..endFrame-1`，统一video_track_timescale后拼接，完整混音只封装一次。缓存key至少包含全部src、episode.json、public素材、字体、依赖锁、渲染参数和音轨哈希；不能只凭“这段没改”复用旧视频。

模板同时提供`npm run render`整片渲染和`npm run render:segments`分段渲染。分段默认两镜并行，每镜Remotion并发1；内存紧张设`SEGMENT_PARALLEL=1`。支持`CHROME_PATH`、`FFMPEG_PATH`、`FFPROBE_PATH`和`OUTPUT_NAME`，已有最终文件拒绝覆盖。

`scripts/render-plan.mjs`把连续秒区间转为整数帧闭区间，按`ceil(start*fps)`到下一边界前一帧，末帧覆盖`ceil(duration*fps)-1`；先检查缺口、重叠、重复/非法镜头ID。每段静音导出并检查解码帧数；拼接后整条混音只编码一次。不要给每段音频各自添加AAC边界。

段目录按完整`src`、`public`（含混音、字体）、scripts、episode、依赖锁、渲染参数和工具版本的SHA256隔离；复用再核对段文件SHA256和帧范围。源码或素材改变后创建新缓存，不拼接旧版残段。`--only=documents`可先完成一个指定镜头，缺段时只报告PARTIAL；同一配置再次运行会补齐剩余镜头。通过环境变量指定浏览器时也纳入浏览器文件指纹；浏览器自动更新后应换缓存或完整重渲染。

只改画面仍支持`MUTED=1`，必须给新`OUTPUT_NAME`，再用`reuse_audio.py`封装旧AAC并核对包与时间戳。新增预览工作台须单独验证加载、交互与导出，不能用“构建通过”描述完整导出状态。
