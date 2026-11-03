# 技术架构与可复现接口

## 画面不是一张PPT

|层/技术|职责|实现位置|
|---|---|---|
|Remotion|frame/fps作为唯一时钟，组合音频和画面，导出1080p30|src/index.tsx、Film.tsx、render.mjs|
|HTML/React|大板/小卡/标题/章节/字幕/气泡的内容、布局、层级|Film.tsx、Scenes.tsx、Robot.tsx|
|CSS|圆角、字重、章节色、真厚边、卡片和字幕阴影、3D透视|style.css|
|SVG|图标、箭头和可描边路线，路径与前景对象处于同一坐标系|Scenes.tsx|
|Canvas 2D|有语义的扫描、流动、传递路线；背景粒子只做辅助|SemanticCanvas|
|Three.js|账号机器人几何/材质/骨骼、地面与接触投影、必要的3D物体|Robot.tsx、robot.js|
|GSAP|用parseEase驱动时间函数；可扩展暂停timeline并seek(t)|motion.ts、Scenes.tsx|
|Python/FFmpeg|本地转写对齐、音符合成、混音、响度、检查、ZIP|scripts/|

## 工程结构

`episode.json`包含 fps=30、width=1920、height=1080、duration、seed、demo、audio、chapters、shots、captions、sfx、wardrobe、motions、bubbles、keywords。

- 全部时间为秒，区间是`[start,end)`；总帧数为`ceil(duration*fps)`，渲染单帧t=frame/fps。
- shots必须连续覆盖整片且id唯一。每个shot含id/start/end/title/kicker/type、action/expr、items等。字幕/章节/事件不超过总时长。
- type只是示例路由：flow、network、keys、compare。正式片应增加与主题匹配的场景组件，不能逐镜机械换文字。
- items中的dropAt是**镜头局部秒**；SFX中的at、章节at、motions.start、wardrobe.start是**全片秒**。不能混用。
- audio是public目录内路径，如`audio/full-mix.wav`；narration是项目内原音频相对路径。不要把外部绝对路径放入浏览器staticFile。
- wardrobe和motions必须能在任意时间点独立求出状态；每次render跳到同一帧必须完全一致。

## 时间和随机性

禁止依赖墙钟、setInterval、未定位的RAF、逐帧Math.random。GSAP若用timeline，先pause，再在每帧seek绝对时间；不使用页面加载后自动播放的独立时钟。随机皮肤采用seed生成洗牌序列，不连续重复；换内容和seed时生成新一集，重渲染保持同一集一致。

初始化WebGL在useLayoutEffect，第二个useLayoutEffect按当前t重置和采样，不累积delta。缓存/加载资源必须受delayRender/continueRender保护；错误要cancelRender，不能导出透明空机器人还报完成。

## 同一轨道

当前板位置`baseX+pitch*(track-index)`。track按相邻镜头边界连续推进；index+1的卡片在左侧，推进时向右到当前板位置。预露卡也必须是这一轨道里的真实下一张，不能右侧再画一张永不移动的装饰板。开头peek延迟到近景退远后；最后一镜没有虚构的下一张。

IP跳跃与卡边过IP的同一track函数绑定。左右方向、卡片宽、IP位置或动画曲线改变后，重新计算过边时刻。不能各写一个独立setTimeout。字幕与章节为屏幕空间，IP为独立前景canvas，因此卡片永远不能遮住IP。

## 版本与缓存

依赖使用固定版本并保留package-lock.json；FFmpeg/browser版本写入QA。多段渲染时每段静音，按连续整数帧闭区间渲染`startFrame..endFrame-1`，统一video_track_timescale后拼接，完整混音只封装一次。缓存key至少包含全部src、episode.json、public素材、字体、依赖锁、渲染参数和音轨哈希；不能只凭“这段没改”复用旧视频。

起步工程先提供单路整片渲染，避免不可靠的多段缓存。只有片长/硬件需要时才引入已核对帧数的分段拼接。
