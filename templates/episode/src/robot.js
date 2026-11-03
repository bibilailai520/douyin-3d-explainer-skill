// Latest supplied robot geometry and 13 material styles; preferred seven-skin video wardrobe.
// V5 action adapter retained; procedural particles use deterministic video-time sampling.
export function createUserRobot(canvas,THREE){
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(440, 560, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(28, 440 / 560, 0.1, 120);

/* ------------------------------------------------ 环境反射（纯代码生成） */
let particleSeed=0x4f2a91b7;
const rigRandom=()=>{particleSeed^=particleSeed<<13;particleSeed^=particleSeed>>>17;particleSeed^=particleSeed<<5;return(particleSeed>>>0)/4294967296};
function buildEnvTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0.00, '#ffffff');
  grd.addColorStop(0.40, '#f5f9fd');
  grd.addColorStop(0.58, '#dde8f2');
  grd.addColorStop(1.00, '#a4b4c5');
  g.fillStyle = grd; g.fillRect(0, 0, 1024, 512);

  const blob = (x, y, r, col) => {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  blob(280, 120, 300, 'rgba(255,255,255,1)');        // 主柔光箱
  blob(540, 60, 210, 'rgba(255,255,255,0.95)');      // 顶光
  blob(800, 170, 220, 'rgba(205,233,255,0.92)');     // 冷补光
  blob(110, 340, 270, 'rgba(118,156,194,0.42)');     // 地面反光
  blob(660, 410, 300, 'rgba(148,178,208,0.32)');

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  tex.dispose(); pmrem.dispose();
  return env;
}
scene.environment = buildEnvTexture();

/* ------------------------------------------------------------------ 灯光 */
scene.add(new THREE.HemisphereLight(0xffffff, 0xd2dfea, 0.50));

const key = new THREE.DirectionalLight(0xffffff, 2.20);
key.position.set(-2.8, 7.6, 4.2);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5; key.shadow.camera.far = 26;
key.shadow.camera.left = -3; key.shadow.camera.right = 3;
key.shadow.camera.top = 5; key.shadow.camera.bottom = -1.5;
key.shadow.bias = -0.0012; key.shadow.normalBias = 0.02; key.shadow.radius = 3.2;
scene.add(key);

const fill = new THREE.DirectionalLight(0xdcefff, 0.80);
fill.position.set(6, 3.4, 4.6);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xc4e9ff, 1.85);
rim.position.set(2.5, 4.6, -6.5);
scene.add(rim);

/* -------------------------------------------------------------- 材质 */
const M = {
  silver: new THREE.MeshPhysicalMaterial({
    color: 0xe7edf4, metalness: 0.66, roughness: 0.26,
    clearcoat: 0.85, clearcoatRoughness: 0.13, envMapIntensity: 1.10
  }),
  chrome: new THREE.MeshPhysicalMaterial({
    color: 0xf2f6fa, metalness: 0.95, roughness: 0.10,
    clearcoat: 1.0, clearcoatRoughness: 0.04, envMapIntensity: 1.35
  }),
  dark: new THREE.MeshPhysicalMaterial({
    color: 0x131d2c, metalness: 0.60, roughness: 0.34,
    clearcoat: 0.75, clearcoatRoughness: 0.18, envMapIntensity: 1.0
  }),
  finger: new THREE.MeshPhysicalMaterial({
    color: 0x0a1422, metalness: 0.45, roughness: 0.24,
    clearcoat: 1.0, clearcoatRoughness: 0.08, envMapIntensity: 1.45,
    specularColor: new THREE.Color(0x2ED6F2), specularIntensity: 0.85
  }),
  screen: new THREE.MeshPhysicalMaterial({
    color: 0x03060b, metalness: 0.0, roughness: 0.16,
    clearcoat: 0.70, clearcoatRoughness: 0.07, envMapIntensity: 0.42
  }),
  gasket: new THREE.MeshPhysicalMaterial({
    color: 0x070b12, metalness: 0.35, roughness: 0.42, envMapIntensity: 0.5
  }),
  earIn: new THREE.MeshPhysicalMaterial({
    color: 0x05090f, metalness: 0.15, roughness: 0.40,
    clearcoat: 0.7, clearcoatRoughness: 0.14, envMapIntensity: 0.20
  }),
  cyan: new THREE.MeshBasicMaterial({
    color: 0x2ED6F2, toneMapped: false
  }),
  /* 灯笼芯：比发光色更亮一档，压在橙色瓜皮上才看得出来（颜色随皮肤走） */
  lamp: new THREE.MeshBasicMaterial({
    color: 0xFFD9A0, toneMapped: false
  }),
  amber: new THREE.MeshPhysicalMaterial({
    color: 0xFF8C35, metalness: 0.95, roughness: 0.12,
    clearcoat: 1.0, clearcoatRoughness: 0.05, envMapIntensity: 1.25
  }),
  /* 布料：给围巾 / 披风用，低金属高粗糙，带一点绒感 */
  cloth: new THREE.MeshPhysicalMaterial({
    color: 0xff8c35, metalness: 0.04, roughness: 0.84, side: THREE.DoubleSide,
    clearcoat: 0.0, sheen: 0.55, sheenRoughness: 0.72, envMapIntensity: 0.5
  }),
  /* 服装件主体（护肩等），颜色由皮肤单独给，不和机身撞 */
  accent: new THREE.MeshPhysicalMaterial({
    color: 0x5c6c88, metalness: 0.32, roughness: 0.36,
    clearcoat: 0.55, clearcoatRoughness: 0.22, envMapIntensity: 0.95
  }),
  /* 布料内衬：兜帽 / 披风 / 裙摆的里面，比外表深一档 */
  lining: new THREE.MeshPhysicalMaterial({
    color: 0x2a2230, metalness: 0.04, roughness: 0.92, side: THREE.DoubleSide,
    sheen: 0.45, sheenRoughness: 0.80, envMapIntensity: 0.30
  }),
  /* 哑光深件：装甲包边、束带、机械底座 */
  matte: new THREE.MeshPhysicalMaterial({
    color: 0x2b3240, metalness: 0.35, roughness: 0.62, envMapIntensity: 0.8
  }),
  /* 硬壳件：南瓜壳。低金属 + 中高粗糙，像上过蜡的瓜皮，不是塑料 */
  shell: new THREE.MeshPhysicalMaterial({
    color: 0xf5711a, metalness: 0.10, roughness: 0.50,
    clearcoat: 0.55, clearcoatRoughness: 0.30, envMapIntensity: 0.90
  }),
  /* 瓜肉：雕开之后露出来的内壁，比瓜皮浅一大截，才有「切开的生瓜」那股水汽感。
     双面：内壁是一圈喇叭口，正反面都可能被看到 */
  flesh: new THREE.MeshPhysicalMaterial({
    color: 0xf2b96e, metalness: 0.02, roughness: 0.74, side: THREE.DoubleSide,
    clearcoat: 0.22, clearcoatRoughness: 0.60, envMapIntensity: 0.50
  }),
  /* 洞里那点烛光：顶点色中间亮边缘暗，材质色当调光旋钮用（每帧闪） */
  pumpkinGlow: new THREE.MeshBasicMaterial({
    color: 0xffffff, vertexColors: true, toneMapped: false, side: THREE.DoubleSide
  }),
  /* 毡料：巫师帽。几乎无金属，强绒感，帽檐要双面 */
  felt: new THREE.MeshPhysicalMaterial({
    color: 0x241b2f, metalness: 0.03, roughness: 0.88, side: THREE.DoubleSide,
    sheen: 0.42, sheenRoughness: 0.86, envMapIntensity: 0.32
  }),
  /* 织带：帽带 / 斗篷下摆滚边 */
  ribbon: new THREE.MeshPhysicalMaterial({
    color: 0xff7a1e, metalness: 0.05, roughness: 0.74, side: THREE.DoubleSide,
    sheen: 0.52, sheenRoughness: 0.70, envMapIntensity: 0.45
  }),
  /* 雪白绒：圣诞帽的白绒口 / 绒球 / 袖口。刻意不跟皮肤配色走 ——
     这套皮肤里 silver 是暖白（0xf7f0ea），做绒边会跟机身糊在一起，
     绒边必须是全场最亮的一块白，才有「毛茸茸」的对比 */
  snow: new THREE.MeshPhysicalMaterial({
    color: 0xfdfcfa, metalness: 0.0, roughness: 0.94,
    clearcoat: 0.0, sheen: 0.92, sheenRoughness: 0.58,
    sheenColor: new THREE.Color(0xffffff), envMapIntensity: 0.55
  }),
  joint: new THREE.MeshBasicMaterial({ color: 0x21B4D0, transparent: true, opacity: 0.9, depthTest: false })
};

/* 当前皮肤的发光色。耳圈的亮度每帧都在变，颜色必须从这里取 ——
   以前 updateExpr 里硬编码了青色，换任何皮肤耳圈都是青的 */
const SKIN_GLOW = new THREE.Color(0x2ED6F2);

/* ------------------------------------------------------- 表面语言 */
/* 13 套皮肤如果只换颜色，永远只是「同一个系列里的 13 个配色」。
   真正把风格拉开的是「料」—— 金属度 m、粗糙度 r、清漆 c、绒感 sh。
   同一套几何：全哑光就是黏土手办，强清漆就是仪器外壳，强绒感就是毛线衫。
   所以每套皮肤除了配色，还必须指定一种 surface。参数一律用短名，读起来像配方。 */
const SURF = {
  /* ① 精密工业 —— 冷、硬、像仪器。高金属、低粗糙、强清漆 */
  precision: {
    silver: { m: 0.72, r: 0.20, c: 0.90, cr: 0.10, e: 1.15 },
    chrome: { m: 0.96, r: 0.08, c: 1.00, cr: 0.03, e: 1.40 },
    accent: { m: 0.55, r: 0.26, c: 0.80, cr: 0.12, e: 1.00 },
    cloth:  { m: 0.04, r: 0.80, c: 0.00, sh: 0.45, sr: 0.75, e: 0.45 },
    lining: { m: 0.04, r: 0.90, c: 0.00, sh: 0.40, sr: 0.82, e: 0.28 }
  },
  /* ② 复古未来 —— 70 年代航天器：奶油注塑塑料 + 橙色铬。中金属、弱清漆 */
  retro: {
    silver: { m: 0.28, r: 0.50, c: 0.50, cr: 0.30, e: 0.80 },
    chrome: { m: 0.86, r: 0.20, c: 0.92, cr: 0.12, e: 1.15 },
    accent: { m: 0.70, r: 0.26, c: 0.85, cr: 0.12, e: 1.05 },
    cloth:  { m: 0.03, r: 0.86, c: 0.00, sh: 0.60, sr: 0.70, e: 0.35 },
    lining: { m: 0.03, r: 0.92, c: 0.00, sh: 0.50, sr: 0.80, e: 0.25 }
  },
  /* ③ 青花瓷 —— 陶瓷不是金属：金属度必须是 0，全靠「极低粗糙 + 满清漆」出釉光。
     这是全场唯一一个零金属的亮面 —— 金属件再怎么抛光也做不出釉那种「湿润」的高光 */
  porcelain: {
    silver: { m: 0.00, r: 0.085, c: 1.00, cr: 0.030, e: 1.34 },
    chrome: { m: 0.00, r: 0.065, c: 1.00, cr: 0.020, e: 1.48 },
    accent: { m: 0.00, r: 0.110, c: 0.98, cr: 0.040, e: 1.24 },
    cloth:  { m: 0.00, r: 0.130, c: 0.92, cr: 0.050, e: 1.10 },
    lining: { m: 0.00, r: 0.200, c: 0.80, cr: 0.090, e: 0.90 }
  },
  /* ④ 瑞士平面 —— 平光乳白，几乎不出高光。靠色块分区和刻度说话，不靠材质 */
  swiss: {
    silver: { m: 0.04, r: 0.64, c: 0.20, cr: 0.55, e: 0.50 },
    chrome: { m: 0.52, r: 0.36, c: 0.55, cr: 0.26, e: 0.80 },
    accent: { m: 0.08, r: 0.72, c: 0.12, cr: 0.62, e: 0.45 },
    cloth:  { m: 0.02, r: 0.90, c: 0.00, sh: 0.30, sr: 0.85, e: 0.22 },
    lining: { m: 0.02, r: 0.92, c: 0.00, sh: 0.25, sr: 0.88, e: 0.20 }
  },
  /* ⑤ 机能 Techwear —— 尼龙哑光机身 + 硬质扣件。机身哑、扣件亮，两档硬拉开 */
  techwear: {
    silver: { m: 0.10, r: 0.76, c: 0.06, cr: 0.85, e: 0.42 },
    chrome: { m: 0.92, r: 0.14, c: 1.00, cr: 0.06, e: 1.30 },
    accent: { m: 0.06, r: 0.86, c: 0.00, cr: 1.00, e: 0.28 },
    cloth:  { m: 0.05, r: 0.88, c: 0.00, sh: 0.66, sr: 0.72, e: 0.28 },
    lining: { m: 0.04, r: 0.93, c: 0.00, sh: 0.45, sr: 0.85, e: 0.22 }
  },
  /* ⑥ 赛博朋克 —— 机身近乎黑镜，配件自己发亮。金属顶格、清漆顶格 */
  cyber: {
    silver: { m: 0.86, r: 0.15, c: 0.96, cr: 0.07, e: 1.38 },
    chrome: { m: 0.98, r: 0.06, c: 1.00, cr: 0.02, e: 1.60 },
    accent: { m: 0.62, r: 0.20, c: 0.92, cr: 0.09, e: 1.20 },
    cloth:  { m: 0.22, r: 0.58, c: 0.32, cr: 0.42, sh: 0.40, sr: 0.60, e: 0.65 },
    lining: { m: 0.16, r: 0.70, c: 0.22, cr: 0.52, sh: 0.30, sr: 0.70, e: 0.50 }
  },
  /* ⑦ 丝绸高定 —— 低金属但强光泽，缎面那种会流动的高光。布料是全套皮肤里最滑的 */
  silk: {
    silver: { m: 0.08, r: 0.30, c: 0.58, cr: 0.16, e: 0.72 },
    chrome: { m: 0.94, r: 0.11, c: 1.00, cr: 0.05, e: 1.30 },
    accent: { m: 0.08, r: 0.20, c: 0.86, cr: 0.09, e: 0.90 },
    cloth:  { m: 0.02, r: 0.28, c: 0.36, cr: 0.20, sh: 0.88, sr: 0.28, e: 0.80 },
    lining: { m: 0.02, r: 0.40, c: 0.26, cr: 0.28, sh: 0.78, sr: 0.38, e: 0.62 }
  },
  /* ⑧ 亚麻 —— 干爽的哑，强绒、零清漆。夏天衣服晒过太阳那种手感 */
  linen: {
    silver: { m: 0.03, r: 0.80, c: 0.08, cr: 0.70, e: 0.36 },
    chrome: { m: 0.40, r: 0.48, c: 0.30, cr: 0.42, e: 0.65 },
    accent: { m: 0.02, r: 0.92, c: 0.00, sh: 0.60, sr: 0.90, e: 0.24 },
    cloth:  { m: 0.00, r: 0.97, c: 0.00, sh: 0.82, sr: 0.93, e: 0.18 },
    lining: { m: 0.00, r: 0.96, c: 0.00, sh: 0.70, sr: 0.94, e: 0.16 }
  },
  /* ⑨ 织锦 —— 低金属微光，经纬线各自反光，像云锦 */
  brocade: {
    silver: { m: 0.20, r: 0.44, c: 0.42, cr: 0.30, e: 0.72 },
    chrome: { m: 0.90, r: 0.15, c: 0.95, cr: 0.08, e: 1.25 },
    accent: { m: 0.58, r: 0.28, c: 0.62, cr: 0.20, e: 1.02 },
    cloth:  { m: 0.18, r: 0.56, c: 0.18, cr: 0.48, sh: 0.78, sr: 0.54, e: 0.58 },
    lining: { m: 0.12, r: 0.64, c: 0.12, cr: 0.54, sh: 0.62, sr: 0.64, e: 0.42 }
  },
  /* ⑩ 哥特 —— 哑光黑漆吃光，靠轮廓和一点烛光立住，不给高光 */
  gothic: {
    silver: { m: 0.26, r: 0.54, c: 0.36, cr: 0.38, e: 0.58 },
    chrome: { m: 0.78, r: 0.26, c: 0.82, cr: 0.16, e: 0.95 },
    accent: { m: 0.14, r: 0.74, c: 0.08, cr: 0.88, e: 0.32 },
    cloth:  { m: 0.02, r: 0.94, c: 0.00, sh: 0.55, sr: 0.90, e: 0.18 },
    lining: { m: 0.02, r: 0.95, c: 0.00, sh: 0.40, sr: 0.92, e: 0.15 }
  },
  /* ⑪ 废土 —— 锈铁 + 粗麻。清漆全无，粗糙顶格，一点脏光都不留 */
  wasteland: {
    silver: { m: 0.32, r: 0.74, c: 0.04, cr: 0.94, e: 0.40 },
    chrome: { m: 0.68, r: 0.58, c: 0.08, cr: 0.84, e: 0.60 },
    accent: { m: 0.18, r: 0.88, c: 0.00, cr: 1.00, e: 0.26 },
    cloth:  { m: 0.00, r: 0.97, c: 0.00, sh: 0.32, sr: 0.96, e: 0.14 },
    lining: { m: 0.00, r: 0.97, c: 0.00, sh: 0.24, sr: 0.97, e: 0.12 }
  },
  /* ⑫ 羊毛针织 —— 粗糙度与绒感都顶到 1.0。整套皮肤里最「软」的一种料 */
  wool: {
    silver: { m: 0.02, r: 0.90, c: 0.00, cr: 1.00, e: 0.24 },
    chrome: { m: 0.48, r: 0.42, c: 0.42, cr: 0.36, e: 0.70 },
    accent: { m: 0.00, r: 0.96, c: 0.00, sh: 0.88, sr: 0.95, e: 0.17 },
    cloth:  { m: 0.00, r: 0.98, c: 0.00, sh: 0.96, sr: 0.96, e: 0.15 },
    lining: { m: 0.00, r: 0.98, c: 0.00, sh: 0.82, sr: 0.97, e: 0.13 }
  },
  /* ⑬ 大漆金箔 —— 漆器：又亮又沉。机身像刷过一遍生漆，金件是贴上去的箔 */
  lacquer: {
    /* 大漆的关键是「沉」：清漆层要薄（0.40 而不是 0.95），环境反射要低。
       之前给到 0.95/1.22，ACES 一压，朱红直接变成粉红塑料 */
    silver: { m: 0.16, r: 0.40, c: 0.38, cr: 0.24, e: 0.52 },
    chrome: { m: 0.88, r: 0.26, c: 0.68, cr: 0.18, e: 0.86 },
    accent: { m: 0.84, r: 0.30, c: 0.60, cr: 0.22, e: 0.92 },
    cloth:  { m: 0.04, r: 0.74, c: 0.08, cr: 0.58, sh: 0.62, sr: 0.64, e: 0.38 },
    lining: { m: 0.03, r: 0.82, c: 0.05, cr: 0.66, sh: 0.48, sr: 0.72, e: 0.30 }
  }
};

/**
 * 把某套表面语言写进共享材质。只改参数、不建新材质 —— 换皮肤依然是零开销。
 * 用 `in` 判断而不是真值判断：c:0 是合法值（黏土就是要零清漆）。
 */
function applySurface(key) {
  const p = SURF[key] || SURF.precision;
  for (const name in p) {
    const mat = M[name], v = p[name];
    if (!mat || !v) continue;
    if ('m'  in v) mat.metalness = v.m;
    if ('r'  in v) mat.roughness = v.r;
    if ('c'  in v) mat.clearcoat = v.c;
    if ('cr' in v) mat.clearcoatRoughness = v.cr;
    if ('e'  in v) mat.envMapIntensity = v.e;
    // A wool accent must not carry its sheen into the next matte outfit.
    // Unspecified sheen on the hard-shell profiles means zero, independent of seek history.
    if (mat.sheen !== undefined) mat.sheen = 'sh' in v ? v.sh : 0;
    if ('sr' in v && mat.sheenRoughness !== undefined) mat.sheenRoughness = v.sr;
    mat.needsUpdate = true;
  }
  /* 面屏永远保持玻璃，不跟着机身一起变哑 —— 眼睛是这张脸的全部 */
  M.screen.metalness = 0.0;
  M.screen.roughness = 0.14;
  M.screen.clearcoat = 0.70;
  M.screen.needsUpdate = true;
}


/* ---------------------------------------------------------- 皮肤 / 造型 */
/* 一套皮肤 = 一组配色 + 一组「改变剪影」的实体造型件。
   造型件按槽位分类，同一槽位只能装一件，所以每套的轮廓都不一样：
     head     兜帽 / 护目镜箍 / 大耳机 / 头顶鳍
     shoulder 宽肩甲 / 圆肩盖
     back     披风 / 背包 / 翼板 / 围巾
     hip      腰带 / 裙摆
     leg      护胫
     arm      袖口
     mark     胸甲涂装（发光缝 / 十字 / 徽章 / 色带） */
const SKINS = [
  /* ================= 常驻六套 =================
     每套不只是「一组配色」，而是一种设计语言：
       ① 极简主义   ② 复古未来   ③ 青花瓷     ④ 瑞士平面   ⑤ 机能风     ⑥ 赛博朋克
     后面七套是四季与节日，各配一种流派：
       丝绸 / 亚麻 / 织锦 / 哥特 / 废土 / 羊毛 / 大漆
     配色也按流派走 —— 极简用无彩色、机能用枪灰配荧光、
     废土用灰褐配锈、大漆用朱红配金。机身主色本身就是风格的一部分。 */

  /* ① 极简主义 —— 无彩色。全身只留一条极细的青线，其余全白，靠留白说话 */
  { id: 'classic', surf: 'precision', n: '经典银白', tag: '极简', note: '铬领圈 + 细腰带 + 胸口细缝',
    title: ['银白', '青蓝'],
    mat: { silver: 0xf2f5f9, chrome: 0xfbfdff, dark: 0x151c26, finger: 0x0a1422, amber: 0xb9c8d8 },
    cloth: 0xb9c8d8, accent: 0xdbe4ee, glow: 0x2ed6f2, lining: 0x2a3340,
    gear: { shoulder: 'collar', hip: 'waist', mark: 'chestline' } },

  /* ② 复古未来 —— 70 年代航天器：奶油注塑外壳 + 黄铜件 + 橙色仪表 */
  { id: 'midnight', surf: 'retro', n: '深空夜航', tag: '复古未来', note: '奶油外壳 + 橙色舱带 + 球形舷窗',
    title: ['奶油', '暖橙'],
    mat: { silver: 0xd8c196, chrome: 0xc9962f, dark: 0x3a2a1c, finger: 0x241a11, amber: 0xd9772e },
    cloth: 0xd9772e, accent: 0xc9932f, glow: 0xffb347, lining: 0x4a3524,
    gear: { head: 'visor', shoulder: 'pauldron', back: 'cape', mark: 'lines' } },

  /* ③ 青花瓷 —— 蓝地白花。
     陶瓷的辨识度不在剪影，在「纹样」和「釉」。所以这一套不戴帽子、不加挂件，
     而是把整个机身当成一只梅瓶：口沿（面屏白釉描边）、颈（三道弦纹）、
     腹（宝相花绕着呼吸灯开）、胫（一圈莲瓣裙）。
     颜色只有两个：釉下钴蓝 + 白釉。一点金都不给 —— 青花从来不上金 */
  { id: 'porcelain', surf: 'porcelain', n: '青花瓷', tag: '青花', note: '釉下钴蓝 + 白瓷弦纹 + 莲瓣裙 + 宝相花',
    title: ['钴蓝', '釉白'],
    mat: { silver: 0x1b3d8e, chrome: 0xf8f5ec, dark: 0x0a1832, finger: 0x061024, amber: 0xf1ece0 },
    cloth: 0x2a58b4, accent: 0xf2eee1, glow: 0xa9d6ff, lining: 0x152a5e,
    gear: { head: 'porcRim', shoulder: 'porcCollar', hip: 'lotus', mark: 'scroll' } },

  /* ④ 瑞士平面 —— 纯白底 + 大面积薄荷色块 + 精确的刻度线，不靠材质靠分区 */
  { id: 'mint', surf: 'swiss', n: '薄荷实验室', tag: '瑞士', note: '白色块 + 宽护目镜 + 肩载灯臂 + 试管腰带',
    title: ['纯白', '薄荷'],
    mat: { silver: 0xfbfdfc, chrome: 0xd8ece4, dark: 0x123028, finger: 0x0c1e1a, amber: 0x1f9e78 },
    cloth: 0x1f9e78, accent: 0xdcf0e8, glow: 0x2fe3a6, lining: 0x123028,
    gear: { head: 'goggles', shoulder: 'lampArm', back: 'harness', hip: 'toolbelt', leg: 'shin', mark: 'cross' } },

  /* ⑤ 机能风 —— 枪灰尼龙机身 + 荧光黄绿的安全色。机身全哑，扣件全亮 */
  { id: 'orbit', surf: 'techwear', n: '轨道航天', tag: '机能', note: '枪灰机身 + 荧光安全带 + 生命维持包',
    title: ['枪灰', '荧光绿'],
    mat: { silver: 0x2e343c, chrome: 0xb9c2cc, dark: 0x0e1216, finger: 0x080b0e, amber: 0x9be02a },
    cloth: 0x9be02a, accent: 0x3a424c, glow: 0x9be02a, lining: 0x161c22,
    gear: { head: 'cans', back: 'pack', mark: 'badge' } },

  /* ⑥ 赛博朋克 —— 黑镜机身 + 品红霓虹。机身越黑，光条越亮 */
  { id: 'neon', surf: 'cyber', n: '赛博霓虹', tag: '赛博', note: '黑镜机身 + 双角 + 背部翼板 + 霓虹条',
    title: ['黑镜', '品红'],
    mat: { silver: 0x1a1026, chrome: 0x7a52a8, dark: 0x07040c, finger: 0x050308, amber: 0xc05cff },
    cloth: 0x4a2c6e, accent: 0x5b3a92, glow: 0xff3d8b, lining: 0x120a1c,
    gear: { head: 'horns', back: 'wing', mark: 'stripe' } },

  /* ============ 四季与节日 · 按一年的顺序排 ============ */
  /* ⑦ 丝绸高定 —— 樱粉白机身，缎面那种会流动的高光，布料是全套最滑的一档 */
  { id: 'sakura', surf: 'silk', n: '樱花初绽', tag: '丝绸', note: '春季 · 花冠 + 缎面披肩 + 樱花枝',
    title: ['樱粉', '玫瑰'],
    mat: { silver: 0xf3c9da, chrome: 0xecabc2, dark: 0x3a2530, finger: 0x2a1a22, amber: 0xe86a94 },
    cloth: 0xe86a94, accent: 0xf6c2d4, glow: 0xff7fae, lining: 0x9c4a68,
    gear: { head: 'blossom', back: 'shawl', mark: 'petal' } },

  /* ⑧ 亚麻 —— 米白机身 + 干爽的哑 + 强绒。夏天晒过太阳的衬衫那种手感 */
  { id: 'summer', surf: 'linen', n: '盛夏海风', tag: '亚麻', note: '夏季 · 草编遮阳帽 + 亚麻领巾',
    title: ['米白', '海蓝'],
    mat: { silver: 0xfff7e8, chrome: 0xf0e3c8, dark: 0x1c3a44, finger: 0x12262e, amber: 0x1f9fb8 },
    cloth: 0x1f9fb8, accent: 0xdcc49a, glow: 0x45dbe4, lining: 0x14505c,
    gear: { head: 'straw', back: 'scarf' } },

  /* ⑨ 织锦 —— 月白机身 + 靛蓝锦缎 + 金线。低金属微光，像云锦 */
  { id: 'moon', surf: 'brocade', n: '月兔中秋', tag: '织锦', note: '中秋 · 长兔耳 + 脑后月环 + 金月牙',
    title: ['月白', '鎏金'],
    mat: { silver: 0xf4f5ff, chrome: 0xf7e6bd, dark: 0x1b2440, finger: 0x121a30, amber: 0xd9b35c },
    cloth: 0x2b3a66, accent: 0xd9b35c, glow: 0xffe6a0, lining: 0x141d36,
    gear: { head: 'bunny', back: 'shawl', mark: 'moon' } },

  /* ⑩ 哥特 —— 近黑紫机身，吃光；只靠南瓜的烛光和一点点轮廓立住 */
  { id: 'pumpkin', surf: 'gothic', n: '南瓜灯使', tag: '哥特', note: '万圣节 · 南瓜头盔 + 腰挂南瓜灯 + 瓜棱',
    title: ['黑紫', '烛橙'],
    mat: { silver: 0x2a2334, chrome: 0x9d8ab0, dark: 0x08050c, finger: 0x050308, amber: 0x6f9c3e,
           shell: 0xf5711a, felt: 0x1f1826 },
    cloth: 0xf5711a, accent: 0x7a3410, glow: 0xffa733, lining: 0x140e1c,
    gear: { head: 'pumpkin', hip: 'lantern', mark: 'ribs' } },

  /* ⑪ 废土 —— 灰褐做旧机身 + 粗麻 + 锈铁。清漆全无，粗糙顶格 */
  { id: 'witch', surf: 'wasteland', n: '夜行巫师', tag: '废土', note: '万圣节 · 做旧机身 + 尖顶帽 + 破布斗篷',
    title: ['灰褐', '幽灵紫'],
    mat: { silver: 0x6b6259, chrome: 0x8a7d6d, dark: 0x241f1a, finger: 0x14100c, amber: 0x8c6a3f,
           shell: 0x4a4038, felt: 0x3a332c },
    cloth: 0x4a4038, accent: 0x8c6a3f, glow: 0xa878ff, lining: 0x241f1a,
    gear: { head: 'witch', back: 'tatter', mark: 'bat' } },

  /* ⑫ 羊毛针织 —— 暖白机身 + 最强绒感。整套皮肤里最「软」的一种料 */
  { id: 'santa', surf: 'wool', n: '雪夜礼颂', tag: '羊毛', note: '圣诞 · 绒边帽 + 金扣腰带 + 礼物背包',
    title: ['暖白', '正红'],
    mat: { silver: 0xf7f0ea, chrome: 0xf0d8c8, dark: 0x2b1416, finger: 0x1c0d0e, amber: 0xc8102e },
    cloth: 0xc8102e, accent: 0xd9a521, glow: 0xffd9a0, lining: 0x6b0d1c,
    gear: { head: 'santa', back: 'gift', hip: 'santaBelt', arm: 'furcuff' } },

  /* ⑬ 大漆金箔 —— 朱红漆器机身 + 金箔件。又亮又沉，像刚上过一遍生漆 */
  { id: 'lion', surf: 'lacquer', n: '醒狮贺岁', tag: '大漆', note: '春节 · 醒狮金绒口 + 大凸眼 + 鎏金绶带',
    title: ['朱红', '鎏金'],
    mat: { silver: 0x8e1014, chrome: 0xcf9a1c, dark: 0x2a0809, finger: 0x150607, amber: 0xd9a521 },
    cloth: 0xc42026, accent: 0xd9a521, glow: 0xffb43a, lining: 0x40090c,
    gear: { head: 'lion', back: 'sash', mark: 'coin' } },
];

/* ------------------------------------------------------- 几何工具 */
/**
 * 超椭球：p=2 是椭球，p 越大越接近方盒。
 * 法线用解析梯度，避免球面接缝硬边。
 */
function squircle(w, h, d, p = 2.8, seg = 72) {
  const g = new THREE.SphereGeometry(1, seg, Math.max(24, Math.round(seg * 0.55)));
  const pos = g.attributes.position, nrm = g.attributes.normal;
  const A = w / 2, B = h / 2, C = d / 2;
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const ax = Math.abs(v.x), ay = Math.abs(v.y), az = Math.abs(v.z);
    const L = Math.pow(Math.pow(ax, p) + Math.pow(ay, p) + Math.pow(az, p), 1 / p) || 1;
    const px = v.x / L * A, py = v.y / L * B, pz = v.z / L * C;
    pos.setXYZ(i, px, py, pz);
    n.set(
      (px < 0 ? -1 : 1) * Math.pow(Math.abs(px) / A, p - 1) / A,
      (py < 0 ? -1 : 1) * Math.pow(Math.abs(py) / B, p - 1) / B,
      (pz < 0 ? -1 : 1) * Math.pow(Math.abs(pz) / C, p - 1) / C
    ).normalize();
    nrm.setXYZ(i, n.x, n.y, n.z);
  }
  return g;
}

/** 沿 Y 轴上下缩放（做"上窄下宽"的胫甲） */
function taperY(geo, sTop, sBot) {
  geo.computeBoundingBox();
  const { min, max } = geo.boundingBox;
  const h = max.y - min.y || 1;
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) - min.y) / h;
    const s = sBot + (sTop - sBot) * t;
    pos.setX(i, pos.getX(i) * s);
    pos.setZ(i, pos.getZ(i) * s);
  }
  geo.computeVertexNormals();
  return geo;
}

/** 把超椭球底部压平（做靴底），避免圆底"踩不稳" */
function flattenBottom(geo, yMin) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) < yMin) pos.setY(i, yMin);
  geo.computeVertexNormals();
  return geo;
}
/** 找到 ≤ target 的最接近的一条纬线圈高度 */
function ringCutY(geo, target) {
  const pos = geo.attributes.position;
  const map = new Map();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const k = Math.round(y * 1e5);
    if (!map.has(k)) map.set(k, y);
  }
  let best = -Infinity;
  for (const y of map.values()) if (y <= target && y > best) best = y;
  return best;
}
/** 按三角形平均高度把网格拆成两个材质组：0=深色底，1=银色壳 */
function splitByY(geo, yCut) {
  const pos = geo.attributes.position;
  const src = geo.index.array;
  const lo = [], hi = [];
  for (let i = 0; i < src.length; i += 3) {
    const a = src[i], b = src[i + 1], c = src[i + 2];
    const ymin = Math.min(pos.getY(a), pos.getY(b), pos.getY(c));
    (ymin < yCut - 1e-6 ? lo : hi).push(a, b, c);
  }
  const arr = new Uint32Array(lo.length + hi.length);
  arr.set(lo, 0); arr.set(hi, lo.length);
  geo.setIndex(new THREE.BufferAttribute(arr, 1));
  geo.clearGroups();
  geo.addGroup(0, lo.length, 0);
  geo.addGroup(lo.length, hi.length, 1);
  return geo;
}

function add(parent, geo, mat, pos, rot, shadow = true) {
  const m = new THREE.Mesh(geo, mat);
  if (pos) m.position.set(pos[0], pos[1], pos[2]);
  if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = shadow; m.receiveShadow = shadow;
  parent.add(m);
  return m;
}

/* =========================================================================
   装配
   ========================================================================= */
const robot = new THREE.Group();
scene.add(robot);

const joints = [];
const J = {};

function jointDot(parent, y = 0, r = 0.048) {
  const d = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), M.joint);
  d.position.y = y; d.visible = false; d.renderOrder = 999;
  parent.add(d); joints.push(d);
  return d;
}

/* ------------------------------------------------------------------
   比例：大头小身 · 短颈 · 短粗四肢 · 紧凑玩具
   世界坐标：鞋底 y=0，髋 0.70，肩 1.20，头心 1.96，头顶 2.56
   ------------------------------------------------------------------ */
const HIP_Y = 0.76;
const L1 = 0.300;         // 大腿
const L2 = 0.250;         // 小腿
const ANKLE_Y = 0.22;
const SHOULDER_Y = 0.50;  // 相对 spine → 世界 1.26
const HEAD_Y = 1.22;      // 相对 spine → 世界 1.98

const root = new THREE.Group(); robot.add(root); J.root = root;
const hips = new THREE.Group(); hips.position.y = HIP_Y; root.add(hips); J.hips = hips;
const spine = new THREE.Group(); hips.add(spine); J.spine = spine;
jointDot(spine, 0, 0.062);
jointDot(hips, 0, 0.058);

/* ---------------- 躯干：一整块银白胸甲 + 内收腹甲 ---------------- */
const torso = new THREE.Group();
torso.position.y = 0.31;                 // → 世界 1.07
spine.add(torso);

add(torso, squircle(0.84, 0.54, 0.58, 3.0), M.dark, [0, -0.020, 0]);         // 深色内构
add(torso, squircle(1.00, 0.56, 0.72, 3.4), M.silver, [0, 0.000, 0.004]);    // 主胸甲

/* 腰胯深色内构（腿根的机械基座） */
add(hips, squircle(0.34, 0.30, 0.42, 3.0), M.dark, [0, -0.100, 0]);

/* 胸甲装饰：贴合超椭球表面的「缝 / 棱」带子（方案可切换） */
const CH_A = 0.50, CH_B = 0.29, CH_C = 0.36, CH_P = 3.4;

/** 胸甲表面点 + 解析法线 */
function chestSurf(x, y, outP, outN) {
  const s = Math.pow(Math.abs(x) / CH_A, CH_P) + Math.pow(Math.abs(y) / CH_B, CH_P);
  const z = s >= 1 ? 0 : CH_C * Math.pow(1 - s, 1 / CH_P);
  outP.set(x, y, z);
  const e = CH_P - 1;
  outN.set(
    Math.sign(x) * Math.pow(Math.abs(x) / CH_A, e) / CH_A,
    Math.sign(y) * Math.pow(Math.abs(y) / CH_B, e) / CH_B,
    Math.sign(z || 1) * Math.pow(Math.abs(z) / CH_C, e) / CH_C
  ).normalize();
}

/** 沿 path(t)->[x,y] 铺一条贴面带子；halfW 可为常数或 t 的函数 */
function chestRibbon(path, halfW, segs, lift, mat) {
  const pos = [], nrm = [], idx = [], pts = [];
  const P = new THREE.Vector3(), N = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const xy = path(i / segs);
    chestSurf(xy[0], xy[1], P, N);
    pts.push({ p: P.clone(), n: N.clone() });
  }
  const T = new THREE.Vector3(), S = new THREE.Vector3(), C = new THREE.Vector3();
  const L = new THREE.Vector3(), R = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(segs, i + 1)];
    T.subVectors(b.p, a.p).normalize();
    S.crossVectors(pts[i].n, T).normalize();
    const w = typeof halfW === 'function' ? halfW(i / segs) : halfW;
    C.copy(pts[i].p).addScaledVector(pts[i].n, lift);
    L.copy(C).addScaledVector(S, w);
    R.copy(C).addScaledVector(S, -w);
    pos.push(L.x, L.y, L.z, R.x, R.y, R.z);
    nrm.push(pts[i].n.x, pts[i].n.y, pts[i].n.z, pts[i].n.x, pts[i].n.y, pts[i].n.z);
  }
  for (let i = 0; i < segs; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setIndex(idx);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = false;
  m.position.set(0, 0, 0.004);
  return m;
}

const chestDeco = new THREE.Group();
torso.add(chestDeco);

/* 方案：
   A 现状    两条等宽竖缝 + 高位横棱
   B 脊线    一条居中渐细竖缝，止于横棱之下
   C 检修盖  圆角矩形轮廓缝，像一块可拆的胸甲
   D 双弧    两条括号形弧缝，像两片胸肌甲
   E 呼吸灯  无分缝，低位横棱 + 中央青蓝环形灯
   F 盖+灯   检修盖轮廓 + 盖内环形灯（默认） */
const CHEST_STYLE = 'E';

/* 环形灯用的柔光贴图：白色径向渐变（只留亮度与透明度），
   实际颜色由 glowMat.color 染，这样换肤时灯的光晕能跟着发光色走 */
const LIGHT_TEX = (() => {
  const S = 128, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d');
  const rg = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  rg.addColorStop(0.00, 'rgba(255,255,255,0.95)');
  rg.addColorStop(0.22, 'rgba(255,255,255,0.62)');
  rg.addColorStop(0.52, 'rgba(255,255,255,0.20)');
  rg.addColorStop(1.00, 'rgba(255,255,255,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

let chestLight = null;
const LIGHT_DIM = new THREE.Color(0x1ba2b8);   // 最暗时也留一点青光，像真的 LED
const LIGHT_HOT = new THREE.Color(0xa8fbff);

/** 在胸甲表面 (0, cy) 处造一盏呼吸灯；k 为整体缩放 */
function buildChestLight(cy, k) {
  const P = new THREE.Vector3(), N = new THREE.Vector3();
  chestSurf(0, cy, P, N);
  const g = new THREE.Group();
  g.position.set(0, cy, P.z + 0.004);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), N);
  chestDeco.add(g);

  const socket = new THREE.Mesh(new THREE.CircleGeometry(0.106 * k, 56), M.dark);
  socket.position.z = 0.0015; socket.castShadow = false;
  g.add(socket);

  const glowMat = new THREE.MeshBasicMaterial({
    map: LIGHT_TEX, color: 0x2ed6f2, transparent: true, blending: THREE.AdditiveBlending,
    depthWrite: false, toneMapped: false, opacity: 0.85
  });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.220 * k, 0.220 * k), glowMat);
  glow.position.z = 0.0035;
  g.add(glow);

  const ringMat = new THREE.MeshBasicMaterial({ color: 0x2ed6f2, toneMapped: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.080 * k, 0.0105 * k, 16, 72), ringMat);
  ring.position.z = 0.0055; ring.castShadow = false;
  g.add(ring);

  const dotMat = new THREE.MeshBasicMaterial({ color: 0x9bf3ff, toneMapped: false });
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.020 * k, 28), dotMat);
  dot.position.z = 0.0055; dot.castShadow = false;
  g.add(dot);

  chestLight = { ring, ringMat, dot, dotMat, glow, glowMat };
}

/** 呼吸：3.4s 一个周期，环体胀缩 + 亮度由暗到亮，光晕同步扩散 */
const LIGHT_PERIOD = 3.4;
function updateChestLight(t) {
  if (!chestLight) return;
  const p = 0.5 - 0.5 * Math.cos(t * Math.PI * 2 / LIGHT_PERIOD);   // 0 → 1 → 0
  const ease = p * p * (3 - 2 * p);
  chestLight.ring.scale.setScalar(1 + 0.140 * ease);
  chestLight.ringMat.color.copy(LIGHT_DIM).lerp(LIGHT_HOT, ease);
  chestLight.dot.scale.setScalar(1 + 0.30 * ease);
  chestLight.dotMat.color.copy(LIGHT_DIM).lerp(LIGHT_HOT, 0.55 + 0.45 * ease);
  chestLight.glow.scale.setScalar(0.90 + 0.22 * ease);
  chestLight.glowMat.color.copy(LIGHT_DIM).lerp(LIGHT_HOT, ease);
  chestLight.glowMat.opacity = 0.20 + 0.45 * ease;
}
let lightT = 0;
/* 南瓜灯里那根蜡烛的时钟：自己走，跟动作、呼吸灯都不相干 */
let glowT = 0;

function buildChest(style) {
  for (let i = chestDeco.children.length - 1; i >= 0; i--) {
    const c = chestDeco.children[i];
    chestDeco.remove(c);
    if (c.geometry) c.geometry.dispose();
  }
  chestLight = null;
  const put = (path, w, segs, lift, mat) => chestDeco.add(chestRibbon(path, w, segs, lift, mat));
  const vline = (x, y0, y1) => t => [x, y0 + (y1 - y0) * t];
  const hline = (x0, x1, y) => t => [x0 + (x1 - x0) * t, y];

  if (style === 'A') {
    [-0.170, 0.170].forEach(x => put(vline(x, -0.235, 0.250), 0.014, 24, 0.0035, M.dark));
    put(hline(-0.300, 0.300, 0.223), 0.011, 24, 0.0045, M.chrome);
    return;
  }

  /* 只有 E 保留一条很淡的横棱，其余方案不画横线，避免「线套线」 */
  if (style === 'E') put(hline(-0.280, 0.280, 0.190), 0.009, 26, 0.0045, M.chrome);

  if (style === 'B') {
    put(t => [0, -0.245 + 0.430 * t],
      t => 0.0035 + 0.0075 * Math.pow(Math.sin(Math.PI * t), 0.55), 32, 0.0040, M.dark);
  } else if (style === 'C' || style === 'F') {
    const n = 3.3, hw = 0.265, hh = 0.152, cy = -0.005;
    put(t => {
      const a = t * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      const k = 1 / Math.pow(Math.pow(Math.abs(c), n) + Math.pow(Math.abs(s), n), 1 / n);
      return [hw * c * k, cy + hh * s * k];
    }, style === 'F' ? 0.0060 : 0.0075, 96, 0.0040, M.dark);
    if (style === 'F') buildChestLight(cy, 1.22);
  } else if (style === 'D') {
    [-1, 1].forEach(sg => {
      put(t => [sg * (0.300 - 0.240 * Math.sin(Math.PI * t * 0.5)), 0.175 - 0.425 * t],
        t => 0.0040 + 0.0090 * Math.sin(Math.PI * t), 32, 0.0040, M.dark);
    });
  } else if (style === 'E') {
    buildChestLight(-0.020, 1.36);
  }
  updateChestLight(lightT);
}
buildChest(CHEST_STYLE);

/* ---------------- 颈：只露很短一截深色 ---------------- */
add(spine, new THREE.CylinderGeometry(0.150, 0.168, 0.24, 24), M.dark, [0, 0.64, 0]);
jointDot(spine, 0.64, 0.055);

/* ---------------- 头 ---------------- */
const head = new THREE.Group();
head.position.y = HEAD_Y;
spine.add(head);
J.head = head;
jointDot(head, 0, 0.070);

const HEAD_W = 1.58, HEAD_H = 1.16, HEAD_D = 1.14, HEAD_P = 2.20;
add(head, squircle(HEAD_W, HEAD_H, HEAD_D, HEAD_P, 104), M.silver, [0, 0, 0]);

/* ------------------------------------------------------------------
   面屏：一整片贴着超椭球头壳的黑色弧面玻璃。
   参数网格的顶点按隐式方程反解到球面上（z 由 x,y 求出），法线解析求导，
   边界是超椭圆（圆角矩形），整片沿法线抬起 10mm。
   与头壳永不发生面片相交 —— 边缘就是它自己的实心轮廓，不会有锯齿。
   ------------------------------------------------------------------ */
const HEAD_A = HEAD_W / 2, HEAD_B = HEAD_H / 2, HEAD_C = HEAD_D / 2;
const SCR = { rx: 0.550, ry: 0.395, n: 3.00, lift: 0.010, segU: 128, segV: 30 };

function headZ(x, y) {
  const s = Math.pow(Math.abs(x) / HEAD_A, HEAD_P) + Math.pow(Math.abs(y) / HEAD_B, HEAD_P);
  if (s >= 1) return 0;
  return HEAD_C * Math.pow(1 - s, 1 / HEAD_P);
}
const _hn = new THREE.Vector3();
function headN(x, y, z, out = _hn) {
  const e = HEAD_P - 1;
  return out.set(
    Math.sign(x) * Math.pow(Math.abs(x) / HEAD_A, e) / HEAD_A,
    Math.sign(y) * Math.pow(Math.abs(y) / HEAD_B, e) / HEAD_B,
    Math.sign(z || 1) * Math.pow(Math.abs(z) / HEAD_C, e) / HEAD_C
  ).normalize();
}

function faceplateGeo() {
  const { rx, ry, n, lift, segU, segV } = SCR;
  const pos = [], nrm = [], idx = [], uv = [];
  const nv = new THREE.Vector3();
  for (let j = 0; j <= segV; j++) {
    const t = j / segV;                               // 0 中心 → 1 边界
    for (let i = 0; i <= segU; i++) {
      const th = (i / segU) * Math.PI * 2;
      const c = Math.cos(th), s = Math.sin(th);
      // 该角度上的超椭圆边界半径（n=2 是椭圆，n 越大越方）
      const R = Math.pow(Math.pow(Math.abs(c), n) + Math.pow(Math.abs(s), n), -1 / n);
      const x = rx * t * R * c, y = ry * t * R * s;
      const z = headZ(x, y);
      headN(x, y, z, nv);
      pos.push(x + nv.x * lift, y + nv.y * lift, z + nv.z * lift);
      nrm.push(nv.x, nv.y, nv.z);
      uv.push(i / segU, t);
    }
  }
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * (segU + 1) + i, b = a + 1, c2 = a + segU + 1, d = c2 + 1;
      idx.push(a, c2, b, b, c2, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return g;
}

const face = new THREE.Mesh(faceplateGeo(), M.screen);
face.castShadow = false;
face.receiveShadow = true;
head.add(face);
J.face = face;

/* 面屏四周一圈极窄的深色密封槽：玻璃与银壳之间留一条干净的分界线 */
(function faceGasket() {
  const { rx, ry, n } = SCR, segs = 288;
  const pts = [];
  for (let i = 0; i < segs; i++) {
    const th = (i / segs) * Math.PI * 2;
    const c = Math.cos(th), s = Math.sin(th);
    const R = Math.pow(Math.pow(Math.abs(c), n) + Math.pow(Math.abs(s), n), -1 / n);
    const x = rx * R * c, y = ry * R * s;
    const z = headZ(x, y);
    headN(x, y, z, _hn);
    pts.push(new THREE.Vector3(
      x + _hn.x * SCR.lift * 0.35,
      y + _hn.y * SCR.lift * 0.35,
      z + _hn.z * SCR.lift * 0.35
    ));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
  const tube = new THREE.TubeGeometry(curve, 360, 0.011, 8, true);
  const m = new THREE.Mesh(tube, M.gasket);
  m.castShadow = false; m.receiveShadow = false;
  head.add(m);
})();

/* =========================================================================
   表情 · 眼型图形（贴合面屏的发光片）+ 头顶符号
   ========================================================================= */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = u => u * u * (3 - 2 * u);

const EYE_CX = 0.238, EYE_Y = -0.018, EYE_UP = SCR.lift + 0.012;

/* 眼睛是贴在面屏上的「贴花」：几何几乎和屏幕共面，远处看深度精度不够就会
   被屏幕吃掉（大笑/爱心这类放大的眼型尤其明显 —— 拉远整张脸就变全黑）。
   polygonOffset 把眼睛的深度往镜头方向偏一点，比把几何整体往前推更保险：
   往前推会让眼睛边缘离开屏幕，侧看时飘在半空 */
M.eye = new THREE.MeshBasicMaterial({
  color: 0x2ED6F2, toneMapped: false, side: THREE.DoubleSide,
  polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6
});
M.ring = new THREE.MeshBasicMaterial({ color: 0x2ED6F2, toneMapped: false });

/* ---------------- 2D 图元 ---------------- */
function ribbonGeo(pts, w) {
  const pos = [], idx = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L * w / 2, ny = dx / L * w / 2;
    pos.push(pts[i][0] + nx, pts[i][1] + ny, 0, pts[i][0] - nx, pts[i][1] - ny, 0);
    if (i < n - 1) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

function fanGeo(pts, rings = 4) {
  const n = pts.length;
  let cx = 0, cy = 0;
  for (const p of pts) { cx += p[0]; cy += p[1]; }
  cx /= n; cy /= n;
  const pos = [cx, cy, 0], idx = [];
  for (let r = 1; r <= rings; r++) {
    const k = r / rings;
    for (let i = 0; i < n; i++) pos.push(cx + (pts[i][0] - cx) * k, cy + (pts[i][1] - cy) * k, 0);
  }
  for (let i = 0; i < n; i++) idx.push(0, 1 + i, 1 + (i + 1) % n);
  for (let r = 1; r < rings; r++) {
    const a0 = 1 + (r - 1) * n, b0 = 1 + r * n;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      idx.push(a0 + i, b0 + i, a0 + j, a0 + j, b0 + i, b0 + j);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

function discGeo(cx, cy, r, seg = 18) {
  const pts = [];
  for (let i = 0; i < seg; i++) { const a = i / seg * TAU; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return fanGeo(pts, 2);
}

function mergeGeo(list) {
  const arrs = list.map(g => (g.index ? g.toNonIndexed() : g).attributes.position.array);
  let total = 0; arrs.forEach(a => total += a.length);
  const out = new Float32Array(total);
  let o = 0; arrs.forEach(a => { out.set(a, o); o += a.length; });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(out, 3));
  return g;
}

function scaleGeo(g, sx, sy) {
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { p.setX(i, p.getX(i) * sx); p.setY(i, p.getY(i) * (sy ?? sx)); }
  return g;
}

function heartPts(size, n = 64) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / n * TAU;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    out.push([x / 17 * size, y / 17 * size - size * 0.03]);
  }
  return out;
}

function starPts(size, points = 5, inner = 0.44, rot = -Math.PI / 2) {
  const out = [];
  for (let i = 0; i < points * 2; i++) {
    const a = rot + i * Math.PI / points;
    const r = i % 2 ? size * inner : size;
    out.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return out;
}

/* ---------------- 眼型库 ---------------- */
const SHAPE = {
  arch() {
    const R = 0.150, w = 0.092, arc = Math.PI * 0.84;
    const a0 = (Math.PI - arc) / 2, a1 = Math.PI - a0, pts = [];
    for (let i = 0; i <= 26; i++) {
      const a = a0 + (a1 - a0) * i / 26;
      pts.push([R * Math.cos(a), R * Math.sin(a)]);
    }
    let y0 = Infinity, y1 = -Infinity;
    pts.forEach(p => { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    const dy = (y0 + y1) / 2;
    pts.forEach(p => p[1] -= dy);
    return mergeGeo([
      ribbonGeo(pts, w),
      discGeo(pts[0][0], pts[0][1], w / 2, 16),
      discGeo(pts[pts.length - 1][0], pts[pts.length - 1][1], w / 2, 16)
    ]);
  },
  arch2() { return scaleGeo(SHAPE.arch(), 1.08, 1.12); },
  line() {
    const L = 0.072, w = 0.090;
    return mergeGeo([
      ribbonGeo([[-L, 0], [L, 0]], w),
      discGeo(-L, 0, w / 2, 16),
      discGeo(L, 0, w / 2, 16)
    ]);
  },
  heart() { return fanGeo(heartPts(0.142), 5); },
  star() { return fanGeo(starPts(0.152, 5, 0.46), 4); },
  spark() { return fanGeo(starPts(0.168, 4, 0.22, -Math.PI / 2), 4); },
  ring() { return new THREE.RingGeometry(0.064, 0.118, 52, 1); },
  ring2() { return new THREE.RingGeometry(0.050, 0.094, 48, 1); },
  spiral() {
    const pts = [], N = 84;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const a = u * 2.1 * TAU;
      const r = 0.145 * u;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return mergeGeo([ribbonGeo(pts, 0.050), discGeo(pts[N][0], pts[N][1], 0.025, 12)]);
  }
};

/* 把 2D 图形贴到面屏弧面上（z 由头壳隐式方程反解） */
function projectLocal(geo, cx) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, headZ(cx + pos.getX(i), EYE_Y + pos.getY(i)) + EYE_UP);
  }
  geo.computeVertexNormals();
  return geo;
}

const EYE_CACHE = {};
function eyeGeo(key, cx) {
  const id = key + '@' + cx.toFixed(3);
  if (!EYE_CACHE[id]) EYE_CACHE[id] = projectLocal(SHAPE[key](), cx);
  return EYE_CACHE[id];
}

function makeEyeGroup(cx) {
  const g = new THREE.Group();
  g.position.set(cx, EYE_Y, 0);
  head.add(g);
  return g;
}
J.eyeL = makeEyeGroup(-EYE_CX);
J.eyeR = makeEyeGroup(EYE_CX);

/* ---------------- 头顶符号 ---------------- */
const SM = {
  warm: new THREE.MeshStandardMaterial({ color: 0xF0A03A, emissive: 0xB85A12, emissiveIntensity: 0.55, roughness: 0.38, metalness: 0.18 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xE9C88E, metalness: 0.92, roughness: 0.26 }),
  cyan: new THREE.MeshStandardMaterial({ color: 0x25BBD6, emissive: 0x0B7E96, emissiveIntensity: 0.55, roughness: 0.42, metalness: 0.05 })
};

function zShape(w, h, t) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, h / 2); s.lineTo(w / 2, h / 2); s.lineTo(w / 2, h / 2 - t);
  s.lineTo(-w / 2 + t * 1.3, -h / 2 + t); s.lineTo(w / 2, -h / 2 + t);
  s.lineTo(w / 2, -h / 2); s.lineTo(-w / 2, -h / 2); s.lineTo(-w / 2, -h / 2 + t);
  s.lineTo(w / 2 - t * 1.3, h / 2 - t); s.lineTo(-w / 2, h / 2 - t);
  s.closePath();
  return s;
}

const SYM_BUILD = {
  bulb() {
    const g = new THREE.Group();
    const glass = new THREE.Mesh(new THREE.SphereGeometry(0.104, 26, 20), SM.warm);
    glass.position.y = 0.052; g.add(glass);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.050, 0.062, 0.052, 20), SM.metal);
    neck.position.y = -0.048; g.add(neck);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.040, 0.040, 20), SM.metal);
    base.position.y = -0.093; g.add(base);
    const fil = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.007, 8, 16), SM.warm);
    fil.position.y = 0.040; fil.rotation.x = 1.25; g.add(fil);
    for (let i = 0; i < 3; i++) {
      const a = -0.78 + i * 0.78;
      const r = new THREE.Mesh(new THREE.CapsuleGeometry(0.0075, 0.048, 3, 8), SM.metal);
      r.position.set(Math.sin(a) * 0.165, 0.052 + Math.cos(a) * 0.165, 0);
      r.rotation.z = -a;
      g.add(r);
    }
    return g;
  },
  bang() {
    const g = new THREE.Group();
    const bar = new THREE.Mesh(new THREE.CapsuleGeometry(0.030, 0.150, 6, 16), SM.warm);
    bar.position.y = 0.058; g.add(bar);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.031, 16, 12), SM.warm);
    dot.position.y = -0.092; g.add(dot);
    return g;
  },
  q() {
    const g = new THREE.Group();
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.070, 0.023, 10, 30, Math.PI * 1.5), SM.cyan);
    hook.position.set(-0.005, 0.088, 0);
    hook.rotation.z = -Math.PI * 0.75;
    g.add(hook);
    const stem = new THREE.Mesh(new THREE.CapsuleGeometry(0.023, 0.042, 5, 12), SM.cyan);
    stem.position.set(0.012, 0.010, 0);
    g.add(stem);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 10), SM.cyan);
    dot.position.set(0, -0.076, 0);
    g.add(dot);
    return g;
  },
  heart() {
    const s = new THREE.Shape();
    const P = heartPts(0.108, 44);
    s.moveTo(P[0][0], P[0][1]);
    for (let i = 1; i < P.length; i++) s.lineTo(P[i][0], P[i][1]);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.038, bevelEnabled: true, bevelSize: 0.011, bevelThickness: 0.011,
      bevelSegments: 3, curveSegments: 2
    });
    g.center();
    return new THREE.Mesh(g, SM.warm);
  },
  zzz() {
    const g = new THREE.Group();
    [[0.075, 0.085, 0.018, 0.055, 0.085, 0], [0.058, 0.066, 0.015, -0.045, 0.005, 0.01], [0.042, 0.048, 0.012, -0.115, -0.055, 0.02]]
      .forEach(([w, h, t, x, y, z]) => {
        const gg = new THREE.ExtrudeGeometry(zShape(w, h, t), { depth: 0.018, bevelEnabled: false });
        gg.center();
        const m = new THREE.Mesh(gg, SM.cyan);
        m.position.set(x, y, z);
        g.add(m);
      });
    return g;
  },
  spark() {
    const s = new THREE.Shape();
    const P = starPts(0.098, 4, 0.20, -Math.PI / 2);
    s.moveTo(P[0][0], P[0][1]);
    for (let i = 1; i < P.length; i++) s.lineTo(P[i][0], P[i][1]);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.032, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008,
      bevelSegments: 2, curveSegments: 1
    });
    g.center();
    return new THREE.Mesh(g, SM.cyan);
  }
};

const SYM = {};
const symRoot = new THREE.Group();
symRoot.position.set(-0.82, HEAD_Y + 0.58, 0.10);
symRoot.scale.setScalar(1.10);
spine.add(symRoot);

function symGet(name) {
  if (!SYM[name]) {
    const o = SYM_BUILD[name]();
    o.visible = false;
    o.scale.setScalar(0.001);
    symRoot.add(o);
    SYM[name] = o;
  }
  return SYM[name];
}

const symState = { cur: null, t: 0 };
function setSymbol(name) {
  if (name === symState.cur) return;
  symState.cur = name || null;
  symState.t = 0;
  if (name) { const o = symGet(name); o.visible = true; o.scale.setScalar(0.001); }
}

function updateSymbol(dt, t) {
  for (const k in SYM) if (SYM[k] !== SYM[symState.cur]) SYM[k].visible = false;
  const o = SYM[symState.cur];
  if (!o) return;
  symState.t = Math.min(1, symState.t + dt * 4.6);
  const u = symState.t;
  const pop = u < 0.72 ? smooth(u / 0.72) * 1.18 : 1.18 - 0.18 * smooth((u - 0.72) / 0.28);
  o.scale.setScalar(Math.max(0.001, pop));
  o.position.y = Math.sin(t * 2.3) * 0.022;
  o.rotation.y = Math.sin(t * 1.1) * 0.42;
  o.rotation.z = Math.sin(t * 1.7 + 0.6) * 0.07;
}

/* ---------------- 表情表 ---------------- */
const EXPR = {
  smile:  { name: '微笑', icon: 'arch',   l: 'arch',   r: 'arch' },
  laugh:  { name: '大笑', icon: 'arch2',  l: 'arch2',  r: 'arch2' },
  love:   { name: '喜欢', icon: 'heart',  l: 'heart',  r: 'heart',  sym: 'heart' },
  idea:   { name: '灵感', icon: 'spark',  l: 'spark',  r: 'spark',  sym: 'bulb' },
  wow:    { name: '惊喜', icon: 'star',   l: 'star',   r: 'star',   sym: 'bang' },
  think:  { name: '疑惑', icon: 'ring',   l: 'ring',   r: 'ring',   sym: 'q' },
  wink:   { name: '眨眼', icon: 'line',   l: 'arch',   r: 'line' },
  sleepy: { name: '困倦', icon: 'line',   l: 'line',   r: 'line',   sym: 'zzz' },
  focus:  { name: '专注', icon: 'ring2',  l: 'ring2',  r: 'ring2' },
  dizzy:  { name: '晕',   icon: 'spiral', l: 'spiral', r: 'spiral' }
};

const exprState = { cur: null, k: 1 };

function setExpr(name) {
  if (!EXPR[name] || name === exprState.cur) return;
  exprState.cur = name;
  exprState.k = 0;
  const e = EXPR[name];
  [[J.eyeL, -EYE_CX, e.l], [J.eyeR, EYE_CX, e.r]].forEach(([grp, cx, key]) => {
    grp.clear();
    const m = new THREE.Mesh(eyeGeo(key, cx), M.eye);
    m.castShadow = false; m.receiveShadow = false;
    grp.add(m);
  });
  setSymbol(e.sym || null);
}

function updateExpr(dt) {
  exprState.k = Math.min(1, exprState.k + dt * 7.5);
  const k = exprState.k;
  const s = 0.62 + 0.38 * smooth(k) + 0.09 * Math.sin(k * Math.PI);
  J.eyeL.scale.setScalar(s);
  J.eyeR.scale.setScalar(s);
  const g = 0.55 + 0.45 * smooth(k);
  /* 只调亮度，色相跟着皮肤走 */
  M.ring.color.copy(SKIN_GLOW).multiplyScalar(g);
}

/* 初始化：先建出默认表情 */
setExpr('smile');
exprState.k = 1;
J.eyeL.scale.setScalar(1);
J.eyeR.scale.setScalar(1);

/* 耳罩：银色圆罩 + 青蓝发光环 + 深色内圈（局部 +Y 朝外） */
[-1, 1].forEach(s => {
  const ear = new THREE.Group();
  ear.position.set(s * 0.812, -0.022, 0.0);
  ear.rotation.z = s * -Math.PI / 2;
  head.add(ear);

  add(ear, new THREE.CylinderGeometry(0.186, 0.176, 0.175, 44), M.silver, [0, 0, 0]);
  add(ear, new THREE.CylinderGeometry(0.180, 0.180, 0.028, 44), M.chrome, [0, 0.083, 0], null, false);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.152, 0.024, 12, 60), M.ring);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.090;
  ring.castShadow = false;
  ear.add(ring);

  add(ear, new THREE.CylinderGeometry(0.130, 0.130, 0.090, 44), M.earIn, [0, 0.064, 0]);
  add(ear, new THREE.SphereGeometry(0.130, 44, 18), M.earIn, [0, 0.064, 0]).scale.set(1, 0.28, 1);
});

/* 天线：短深色杆 + 暖橙金属球 #FF8C35 */
const antenna = new THREE.Group();
antenna.position.y = 0.555;
head.add(antenna);
J.antenna = antenna;
jointDot(antenna, 0, 0.045);
add(antenna, new THREE.CylinderGeometry(0.026, 0.033, 0.155, 16), M.dark, [0, 0.078, 0]);
add(antenna, new THREE.SphereGeometry(0.108, 32, 24), M.amber, [0, 0.200, 0]);

/* ---------------- 手臂：短粗 ---------------- */
function buildArm(side) {
  const arm = new THREE.Group();
  arm.position.set(side * 0.560, SHOULDER_Y, 0);
  spine.add(arm);

  add(arm, new THREE.SphereGeometry(0.126, 22, 18), M.dark, [0, 0, 0]);        // 肩关节
  add(arm, squircle(0.268, 0.235, 0.268, 3.2), M.silver, [0, -0.118, 0]);      // 上臂甲
  add(arm, new THREE.SphereGeometry(0.098, 20, 16), M.dark, [0, -0.272, 0]);   // 肘关节

  const fore = new THREE.Group();
  fore.position.y = -0.272;
  arm.add(fore);
  jointDot(arm, 0, 0.050);
  jointDot(arm, -0.272, 0.045);

  add(fore, squircle(0.252, 0.200, 0.252, 3.2), M.silver, [0, -0.098, 0]);     // 小臂甲
  add(fore, new THREE.CylinderGeometry(0.076, 0.076, 0.048, 24), M.dark, [0, -0.208, 0]);

  const hand = new THREE.Group();
  hand.position.y = -0.230;
  fore.add(hand);
  jointDot(fore, -0.230, 0.042);

  /* 掌心朝 local +Z（aimEx 之后即朝镜头），拇指在 local +X —— 这样 side=+1 才是右手 */
  add(hand, squircle(0.206, 0.146, 0.132, 2.9), M.finger, [0, -0.068, 0.012]); // 掌

  const fingers = [];
  [-0.063, 0, 0.063].forEach(x => {
    const g1 = new THREE.Group();
    g1.position.set(x, -0.150, 0.026);
    hand.add(g1);
    add(g1, new THREE.CapsuleGeometry(0.035, 0.040, 5, 12), M.finger, [0, -0.035, 0]);
    const g2 = new THREE.Group();
    g2.position.y = -0.070;
    g1.add(g2);
    add(g2, new THREE.CapsuleGeometry(0.029, 0.032, 5, 12), M.finger, [0, -0.030, 0]);
    fingers.push({ g1, g2 });
  });

  const thumb = new THREE.Group();
  thumb.position.set(side * 0.086, -0.030, 0.050);
  thumb.rotation.z = side * 1.22;
  hand.add(thumb);
  add(thumb, new THREE.CapsuleGeometry(0.040, 0.020, 5, 12), M.finger, [0, -0.028, 0]);
  const thumb2 = new THREE.Group();
  thumb2.position.y = -0.052;
  thumb.add(thumb2);
  add(thumb2, new THREE.CapsuleGeometry(0.033, 0.014, 5, 12), M.finger, [0, -0.022, 0]);

  return { arm, fore, hand, fingers, thumb, thumb2, side };
}
const armL = buildArm(-1);
const armR = buildArm(1);
J.armL = armL.arm; J.armR = armR.arm;
J.foreL = armL.fore; J.foreR = armR.fore;
J.handL = armL.hand; J.handR = armR.hand;

/* ---------------- 腿：短粗 · 关节分明 · 厚靴 ---------------- */
function buildLeg(side) {
  const leg = new THREE.Group();
  leg.position.set(side * 0.256, 0, 0);
  hips.add(leg);

  add(leg, new THREE.SphereGeometry(0.136, 24, 18), M.dark, [0, 0, 0]);          // 髋关节
  add(leg, taperY(squircle(0.336, 0.255, 0.346, 3.0), 1.06, 0.94),
      M.silver, [0, -0.115, 0.004]);                                             // 大腿护甲
  add(leg, new THREE.SphereGeometry(0.106, 22, 16), M.dark, [0, -L1, 0]);        // 膝关节

  const shin = new THREE.Group();
  shin.position.y = -L1;
  leg.add(shin);
  jointDot(leg, 0, 0.050);
  jointDot(leg, -L1, 0.045);

  add(shin, taperY(squircle(0.336, 0.210, 0.336, 3.0), 0.80, 1.06),
      M.silver, [0, -0.155, 0.010]);                                             // 上窄下宽胫甲
  add(shin, new THREE.CylinderGeometry(0.090, 0.096, 0.11, 24), M.dark, [0, -0.240, 0]);

  const foot = new THREE.Group();
  foot.position.y = -L2;
  shin.add(foot);
  jointDot(shin, -L2, 0.042);

  add(foot, new THREE.SphereGeometry(0.098, 20, 14), M.dark, [0, 0, 0]);          // 踝关节
  const bootGeo = flattenBottom(squircle(0.406, 0.340, 0.600, 3.3, 128), -0.130);
  splitByY(bootGeo, ringCutY(bootGeo, -0.050));
  const boot = new THREE.Mesh(bootGeo, [M.dark, M.silver]);
  boot.position.set(0, -0.090, 0.062);
  boot.castShadow = true; boot.receiveShadow = true;
  foot.add(boot);

  return { leg, shin, foot };
}
const legL = buildLeg(-1);
const legR = buildLeg(1);
J.legL = legL.leg; J.legR = legR.leg;
J.shinL = legL.shin; J.shinR = legR.shin;
J.footL = legL.foot; J.footR = legR.foot;

/* =========================================================================
   造型层（GEAR）
   一套皮肤 = 配色 + 若干「改变剪影」的实体件。
   每个件都由 3~5 个分件叠成（主体 + 盖板 + 包边 + 高光条 + 铆钉），
   远看有轮廓、近看有结构 —— 不是贴在表面上的薄片。
   挂载点：
     head     → head（头心为原点，头半轴 0.79 / 0.58 / 0.57）
     arm      → 前臂（foreL / foreR）
     leg      → 小腿（shinL / shinR）
     其余     → spine / torso（torso 局部坐标与 chestSurf 一致）
   ========================================================================= */
const outfitSpine = new THREE.Group(); spine.add(outfitSpine);
const outfitTorso = new THREE.Group(); torso.add(outfitTorso);
const outfitHead = new THREE.Group(); head.add(outfitHead);

const GEAR = { head: {}, shoulder: {}, back: {}, hip: {}, leg: {}, arm: {}, mark: {} };

/* ---------------------------------------------------------------- 通用工具 */

/** 贴着头壳的一块球面片，按方位角 / 极角裁剪；rx ry rz 为半轴 */
function headShell(rx, ry, rz, phiStart, phiLen, thetaStart, thetaLen, mat, seg = 64) {
  const g = new THREE.SphereGeometry(1, seg, Math.max(16, seg >> 1),
    phiStart, phiLen, thetaStart, thetaLen);
  const pos = g.attributes.position, nrm = g.attributes.normal;
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  const p = HEAD_P;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const L = Math.pow(Math.pow(Math.abs(v.x), p) + Math.pow(Math.abs(v.y), p) + Math.pow(Math.abs(v.z), p), 1 / p) || 1;
    const px = v.x / L * rx, py = v.y / L * ry, pz = v.z / L * rz;
    pos.setXYZ(i, px, py, pz);
    headN(px, py, pz, n);
    nrm.setXYZ(i, n.x, n.y, n.z);
  }
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** 水平椭圆环（可只取一段弧）：兜帽边 / 腰带 / 袖口 */
function ringArc(rx, rz, tube, arc, y, mat, seg = 64) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(1, tube, 12, seg, arc), mat);
  m.scale.set(rx, rz, 1);          // 先缩放（几何在 XY 平面）再旋转
  m.rotation.x = Math.PI / 2;
  m.position.y = y;
  m.castShadow = true;
  return m;
}

/** 给球面片叠竖向罗纹（绕 Y 轴）。针织帽的「一条条」全靠它 ——
    平滑的球冠看着像泳帽，加了罗纹才是毛线 */
function knitRib(mesh, k, amp) {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const s = 1 + amp * Math.cos(k * Math.atan2(z, x));
    pos.setX(i, x * s);
    pos.setZ(i, z * s);
  }
  mesh.geometry.computeVertexNormals();
  return mesh;
}

/** 弯头圆锥：帽尖软塌塌地朝一侧倒。bend 越大倒得越狠 */
function bentCone(rBot, rTop, h, bend, mat, seg = 44, rings = 16) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, seg, rings, true);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = (y + h / 2) / h;                 // 0 底 → 1 顶
    const k = t * t;
    pos.setX(i, pos.getX(i) + bend * k);
    pos.setZ(i, pos.getZ(i) - bend * 0.30 * k);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/* ---------------------------------------------------------- 南瓜 / 瓜棱 */
/** 瓜棱球：按方位角做 ribs 道竖向凸棱（+Z 处正好一条棱，正面看对称） */
function ribBall(rx, ry, rz, ribs, amp, mat, seg = 64) {
  const g = new THREE.SphereGeometry(1, seg, Math.max(16, seg >> 1));
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const a = Math.atan2(z, x) - Math.PI / 2;
    const k = 1 + amp * Math.cos(ribs * a);       // 只缩放径向，竖向不变形
    pos.setXYZ(i, x * rx * k, y * ry, z * rz * k);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** 瓜棱壳：球面片按超椭球映射后再叠同样的径向凸棱，用来做南瓜头盔 */
function ribShell(rx, ry, rz, phiStart, phiLen, thetaStart, thetaLen, ribs, amp, mat, seg = 96) {
  const g = new THREE.SphereGeometry(1, seg, Math.max(16, seg >> 1),
    phiStart, phiLen, thetaStart, thetaLen);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  const p = HEAD_P;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const L = Math.pow(Math.pow(Math.abs(v.x), p) + Math.pow(Math.abs(v.y), p) + Math.pow(Math.abs(v.z), p), 1 / p) || 1;
    const a = Math.atan2(v.z, v.x) - Math.PI / 2;
    const k = 1 + amp * Math.cos(ribs * a);
    pos.setXYZ(i, v.x / L * rx * k, v.y / L * ry, v.z / L * rz * k);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/* ------------------------------------------------------------- 头部造型 */

/* 青花瓷 · 头部：瓷器不戴帽子。梅瓶的口是一圈白釉厚唇、颈上几道弦纹，
   把这两件事搬到头上，比扣任何一顶帽子都更像瓷。
   注意 ringArc 的 tube 是「相对半径」——真正的粗细要乘上 rx，
   所以这里写 0.028 出来只有 0.015，刚好是一道凸起的釉线 */
GEAR.head.porcRim = (() => {
  const g = new THREE.Group(); outfitHead.add(g);
  /* 口沿：沿面屏超椭圆边界走一圈白釉厚唇。管径 0.032 是「实」尺寸
     （走 TubeGeometry 而不是 ringArc，不受缩放影响） */
  const pts = [];
  const RN = 104;
  for (let i = 0; i < RN; i++) {
    const t = i / RN * Math.PI * 2, ct = Math.cos(t), st = Math.sin(t);
    const x = SCR.rx * 1.012 * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / SCR.n);
    const y = SCR.ry * 1.012 * Math.sign(st) * Math.pow(Math.abs(st), 2 / SCR.n);
    pts.push(new THREE.Vector3(x, y, headZ(x, y) + 0.014));
  }
  const rim = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 160, 0.032, 10, true), M.chrome);
  rim.castShadow = true;
  g.add(rim);

  /* 颈上三道细弦纹：半径按头壳在各自高度处的半宽算，环才会贴着壳走。
     五道、管径 0.030 的时候出来是「叠了几只盘子」；收成三道细线（0.016）
     才像瓷瓶的颈线，而不是一顶千层饼帽子 */
  [[0.502, 0.438], [0.530, 0.360], [0.556, 0.254]].forEach(([y, rx]) => {
    g.add(ringArc(rx, rx * (HEAD_C / HEAD_A), 0.016, Math.PI * 2, y, M.chrome, 88));
  });
  g.visible = false;
  return g;
})();

/* 青花瓷 · 云肩：肩上一圈白釉厚领 + 领下一圈如意云头。
   领圈半径要压到 0.50 / 0.37 —— 比躯干（0.50 / 0.36）刚好大一圈，
   落在肩头才不会整个陷进胸甲里 */
/* 青花瓷 · 领圈：肩上一圈白釉厚领 + 两道青花弦纹。
   领圈半径要压到 0.50 / 0.37 —— 比躯干（0.50 / 0.36）刚好大一圈，
   落在肩头才不会整个陷进胸甲里。
   注意 ringArc 的管径是「垂直半厚」，水平半厚还要乘 rx：
   所以带子外缘在 0.505 + 0.505×0.078 = 0.544，青花线必须画到 0.548 才露得出来 */
GEAR.shoulder.porcCollar = (() => {
  const g = new THREE.Group(); outfitSpine.add(g);
  const band = ringArc(0.505, 0.372, 0.078, Math.PI * 2, 0.556, M.chrome, 88);
  g.add(band);
  [[0.578], [0.534]].forEach(([y]) => {
    g.add(ringArc(0.548, 0.404, 0.013, Math.PI * 2, y, M.cloth, 84));
  });
  g.visible = false;
  return g;
})();

/* 青花瓷 · 莲瓣裙：腰下一圈白釉仰莲瓣，瓣尖朝下、向外翻开。
   梅瓶的胫部就是一圈莲瓣，把它搬过来，下半身立刻有了「器」的收束 */
GEAR.hip.lotus = (() => {
  const g = new THREE.Group();
  g.position.set(0, -0.052, 0);
  outfitSpine.add(g);
  const N = 10;
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 2;
    const h = new THREE.Group();
    h.position.set(Math.sin(a) * 0.318, 0.010, Math.cos(a) * 0.246);
    h.rotation.y = a;
    g.add(h);
    const petal = new THREE.Mesh(squircle(0.244, 0.360, 0.074, 2.1, 30), M.chrome);
    petal.position.set(0, -0.156, 0.012);
    petal.rotation.x = -0.30;
    petal.castShadow = true;
    h.add(petal);
    /* 瓣尖一片青花：白瓣上加一小段钴蓝，整圈才不会糊成一条白裙 */
    const tip = new THREE.Mesh(squircle(0.104, 0.116, 0.034, 2.0, 22), M.cloth);
    tip.position.set(0, -0.284, 0.056);
    tip.rotation.x = -0.30;
    h.add(tip);
  }
  g.visible = false;
  return g;
})();

/* 青花瓷 · 宝相花：绕着呼吸灯开的一朵八瓣莲。
   不用贴片几何 —— 胸甲是超椭球，平的贴片到外圈会翘起来 0.1 悬空。
   用 chestRibbon 沿曲面铺，半宽按 sin 收成两头尖的叶子，才是「画」上去的 */
GEAR.mark.scroll = (() => {
  const g = new THREE.Group(); outfitTorso.add(g);
  const leaf = (a, r0, r1, w, lift, mat) => {
    const path = k => {
      const r = r0 + (r1 - r0) * k;
      return [Math.cos(a) * r, -0.020 + Math.sin(a) * r * 0.78];
    };
    const hw = k => w * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, k))), 0.45);
    g.add(chestRibbon(path, hw, 22, lift, mat));
  };
  /* 外圈八片 + 内圈八片。每片先铺一条更宽、更低的钴蓝带做「描边」，
     再压一条白瓣 —— 白瓣带蓝边，才是青花，不然就是一坨白色塑料花 */
  const petal = (a, r0, r1, w, l) => {
    leaf(a, r0 - 0.006, r1 + 0.006, w * 1.30, l - 0.005, M.cloth);
    leaf(a, r0, r1, w, l, M.chrome);
  };
  for (let i = 0; i < 8; i++) petal(i / 8 * Math.PI * 2 + Math.PI / 8, 0.150, 0.300, 0.058, 0.014);
  for (let i = 0; i < 8; i++) petal(i / 8 * Math.PI * 2, 0.138, 0.238, 0.034, 0.018);
  g.visible = false;
  return g;
})();
/* 护目镜（薄荷实验室）—— 推到额头上的两片大圆镜 + 一圈薄荷冠带 + 侧铰链。
   上一版镜片只有 r=0.10，又几乎正对前方，读出来是「额头上的两颗小眼睛」。
   这一版把镜片放大到 0.135、整体上仰 40°：正面看到的是两个压扁的椭圆，
   一眼就是「掀到额头上去了」的护目镜，而不是第三只眼 */
GEAR.head.goggles = (() => {
  const g = new THREE.Group(); outfitHead.add(g);
  /* 冠带：用球面片做，不用水平圆环 —— 头壳在 y=0.42→0.51 之间半宽从 0.60
     收到 0.46，圆环做出来的「带」上沿会整圈翘起来 */
  g.add(headShell(0.804, 0.592, 0.582, 0, Math.PI * 2, 0.512, 0.300, M.cloth, 104));
  /* 带上的白色刻度：一圈小方块，一眼读出「这是台测量仪器」 */
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    const th = 0.662, st = Math.sin(th), ct = Math.cos(th);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.058, 0.014), M.chrome);
    b.position.set(-0.808 * Math.cos(a) * st, 0.596 * ct, 0.586 * Math.sin(a) * st);
    b.rotation.y = a - Math.PI / 2;
    g.add(b);
  }
  /* 两片镜片 */
  [-1, 1].forEach(sg => {
    const lx = sg * 0.196, ly = 0.470;
    const lz = 0.57 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(lx) / 0.79, 2.2)
      - Math.pow(Math.abs(ly) / 0.58, 2.2)), 1 / 2.2);
    const c = new THREE.Group();
    c.position.set(lx, ly, lz + 0.020);
    c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0.62, 0.78).normalize());
    g.add(c);
    add(c, new THREE.CylinderGeometry(0.136, 0.132, 0.056, 34), M.accent, [0, 0, 0], [Math.PI / 2, 0, 0]);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.138, 0.022, 10, 36), M.chrome);
    rim.position.z = 0.028; rim.castShadow = true; c.add(rim);
    add(c, new THREE.CircleGeometry(0.126, 36), M.matte, [0, 0, 0.030]);
    add(c, new THREE.TorusGeometry(0.092, 0.010, 8, 30), M.cyan, [0, 0, 0.034], null, false);
  });
  /* 两侧铰链：护目镜能掀起来，总得有个轴 */
  [-1, 1].forEach(sg => {
    add(g, new THREE.CylinderGeometry(0.052, 0.052, 0.070, 22), M.chrome,
      [sg * 0.468, 0.492, 0.006], [0, 0, Math.PI / 2]);
  });
  g.visible = false;
  return g;
})();

/* 大耳机：跨头顶的头梁 + 两侧大耳罩（外壳 / 包边 / 发光圈 / 中心灯） */
GEAR.head.cans = (() => {
  const g = new THREE.Group(); outfitHead.add(g);
  const beam = new THREE.Mesh(new THREE.TorusGeometry(1, 0.042, 12, 64, Math.PI), M.accent);
  beam.scale.set(0.812, 0.672, 1);
  beam.castShadow = true;
  g.add(beam);
  [-1, 1].forEach(sg => {
    const c = new THREE.Group();
    c.position.set(sg * 0.812, -0.035, 0);
    g.add(c);
    add(c, new THREE.CylinderGeometry(0.248, 0.248, 0.155, 40), M.accent, [0, 0, 0], [0, 0, Math.PI / 2]);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.248, 0.028, 10, 48), M.matte);
    rim.rotation.y = Math.PI / 2; c.add(rim);
    const glow = new THREE.Mesh(new THREE.TorusGeometry(0.172, 0.011, 8, 48), M.cyan);
    glow.rotation.y = Math.PI / 2; glow.position.x = sg * 0.080; c.add(glow);
    add(c, new THREE.CircleGeometry(0.104, 36), M.cyan, [sg * 0.082, 0, 0], [0, sg * Math.PI / 2, 0]);
    /* 内侧软垫 */
    add(c, new THREE.CylinderGeometry(0.232, 0.232, 0.040, 36), M.matte, [-sg * 0.098, 0, 0], [0, 0, Math.PI / 2]);
  });
  g.visible = false;
  return g;
})();

/* 双角：头顶左右各一支向后掠的锥角，根环 + 尖端灯 */
GEAR.head.horns = (() => {
  const g = new THREE.Group(); outfitHead.add(g);
  [-1, 1].forEach(sg => {
    const h = new THREE.Group();
    h.position.set(sg * 0.352, 0.372, -0.058);
    h.rotation.set(0.32, 0, -sg * 0.56);
    g.add(h);
    add(h, new THREE.CylinderGeometry(0.024, 0.104, 0.470, 22), M.accent, [0, 0.235, 0]);
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.108, 0.026, 8, 30), M.matte);
    r.rotation.x = Math.PI / 2; r.position.y = 0.016;
    r.castShadow = true; h.add(r);
    add(h, new THREE.SphereGeometry(0.034, 16, 12), M.cyan, [0, 0.474, 0]);
  });
  g.visible = false;
  return g;
})();

/* ------------------------------------------------------------- 肩部造型 */

/* 宽肩甲：主体 + 上层盖板 + 哑光包边 + 发光下沿 + 铆钉 */
GEAR.shoulder.wide = (() => {
  const g = new THREE.Group(); outfitSpine.add(g);
  [-1, 1].forEach(sg => {
    const p = new THREE.Group();
    p.position.set(sg * 0.560, 0.518, 0);
    p.rotation.z = -sg * 0.26;
    g.add(p);
    add(p, squircle(0.512, 0.158, 0.486, 3.8, 56), M.accent, [0, 0.016, 0]);
    add(p, squircle(0.470, 0.108, 0.446, 3.8, 48), M.matte, [0, -0.078, 0]);
    add(p, squircle(0.376, 0.078, 0.356, 3.6, 48), M.chrome, [sg * 0.022, 0.088, 0]);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.238, 0.032, 10, 52), M.matte);
    rim.rotation.x = Math.PI / 2; rim.scale.set(1, 1.04, 1); rim.position.y = -0.130;
    rim.castShadow = true; p.add(rim);
    const gl = new THREE.Mesh(new THREE.TorusGeometry(0.200, 0.010, 8, 52), M.cyan);
    gl.rotation.x = Math.PI / 2; gl.scale.set(1, 1.04, 1); gl.position.y = -0.144;
    p.add(gl);
    [-1, 1].forEach(k => add(p, new THREE.SphereGeometry(0.026, 14, 10), M.matte, [k * 0.146, 0.070, 0.176]));
  });
  g.visible = false;
  return g;
})();

/* 圆肩盖：半球壳扣在肩顶，下沿一圈发光 */
GEAR.shoulder.round = (() => {
  const g = new THREE.Group(); outfitSpine.add(g);
  [-1, 1].forEach(sg => {
    const p = new THREE.Group();
    p.position.set(sg * 0.548, 0.498, 0);
    p.rotation.z = -sg * 0.30;
    g.add(p);
    add(p, squircle(0.398, 0.286, 0.436, 2.3, 52), M.accent, [0, 0.010, 0]);
    add(p, squircle(0.272, 0.132, 0.300, 2.2, 40), M.chrome, [sg * 0.012, 0.148, 0]);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.212, 0.024, 8, 48), M.cyan);
    rim.rotation.x = Math.PI / 2; rim.scale.set(1, 1.12, 1); rim.position.y = -0.124;
    p.add(rim);
  });
  g.visible = false;
  return g;
})();

/* ------------------------------------------------------------- 背部造型 */

/* 披风：弧面布，下摆做波浪并分片，双肩金属扣，下沿一圈发光滚边。
   长度一路垂到小腿，站起来才有「一整片」的气势 —— 上一版只到腰，看着像个小书包 */
GEAR.back.cape = (() => {
  const g = new THREE.Group(); outfitSpine.add(g);
  const NU = 30, NV = 26;
  const LEN = 1.180;
  const build = (mul, zOff, mat) => {
    const pos = [], idx = [];
    for (let j = 0; j <= NV; j++) {
      const v = j / NV;
      const halfW = (0.372 + 0.352 * v * v) * mul;
      const zBack = -0.258 - 0.170 * v + zOff;
      for (let i = 0; i <= NU; i++) {
        const u = i / NU * 2 - 1;
        /* 下摆波浪：越靠下越明显，做出 5 个垂片 */
        const saw = 0.070 * Math.abs(Math.sin(Math.PI * u * 2.5)) * v * v;
        const y = 0.566 - LEN * v + 0.118 * v * v * u * u - saw;
        pos.push(u * halfW, y, zBack + 0.250 * u * u);
      }
    }
    for (let j = 0; j < NV; j++) {
      for (let i = 0; i < NU; i++) {
        const a = j * (NU + 1) + i, b = a + 1, c = a + NU + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    return m;
  };
  g.add(build(1.000, 0.000, M.cloth));
  /* 内衬用金色。正面看到的是披风内侧，用深棕的话整套就变成
     「奶油机器人穿了一件深棕西装斗篷」，跟航天器没半点关系 */
  g.add(build(0.952, 0.030, M.accent));

  /* 下摆滚边：沿最下一排点铺一根细管，发光色，夜里像一道边光 */
  const hem = [];
  for (let i = 0; i <= NU; i++) {
    const u = i / NU * 2 - 1;
    const halfW = 0.372 + 0.352;
    const saw = 0.070 * Math.abs(Math.sin(Math.PI * u * 2.5));
    hem.push(new THREE.Vector3(u * halfW * 1.004, 0.566 - LEN + 0.118 * u * u - saw, -0.258 - 0.170 + 0.250 * u * u + 0.004));
  }
  const hemCurve = new THREE.CatmullRomCurve3(hem);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(hemCurve, 90, 0.0075, 6, false), M.cyan));

  /* 双肩扣 */
  [-1, 1].forEach(sg => {
    add(g, squircle(0.118, 0.108, 0.082, 2.6, 24), M.matte, [sg * 0.292, 0.552, -0.176]);
    add(g, new THREE.SphereGeometry(0.034, 16, 12), M.cyan, [sg * 0.292, 0.552, -0.222]);
  });
  g.visible = false;
  return g;
})();

/* 生命维持背包：舱体 + 顶盖 + 前面板 + 提手 + 双推进筒 + 贴胸肩带与扣具 */
GEAR.back.pack = (() => {
  const body = new THREE.Group();
  body.position.set(0, 0.330, -0.472);
  outfitSpine.add(body);
  add(body, squircle(0.600, 0.520, 0.270, 3.2, 56), M.accent, [0, 0, 0]);
  add(body, squircle(0.520, 0.185, 0.300, 3.0, 48), M.matte, [0, 0.192, 0]);
  add(body, squircle(0.430, 0.300, 0.070, 3.0, 44), M.chrome, [0, -0.045, -0.148]);
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.092, 0.024, 8, 32, Math.PI), M.matte);
  h.position.set(0, 0.278, -0.036); h.castShadow = true;
  body.add(h);
  [-1, 1].forEach(sg => {
    add(body, new THREE.CylinderGeometry(0.058, 0.068, 0.185, 22), M.chrome, [sg * 0.192, -0.242, -0.012]);
    add(body, new THREE.CircleGeometry(0.048, 22), M.cyan, [sg * 0.192, -0.336, -0.012], [Math.PI / 2, 0, 0]);
    add(body, new THREE.TorusGeometry(0.062, 0.012, 8, 24), M.matte, [sg * 0.192, -0.155, -0.012], [Math.PI / 2, 0, 0]);
  });

  const straps = new THREE.Group();
  outfitTorso.add(straps);
  const P = new THREE.Vector3(), N = new THREE.Vector3();
  [-1, 1].forEach(sg => {
    straps.add(chestRibbon(k => [sg * (0.322 - 0.196 * k), 0.252 - 0.486 * k], 0.054, 44, 0.020, M.matte));
    chestSurf(sg * 0.300, -0.120, P, N);
    /* 快拆扣：圆角金属底座 + 中间一道深色压缝。
       原来是一个亮铬立方体，贴在枪灰机身上就是两块白胶布 —— 扣件必须看得出「有结构」 */
    const bk = new THREE.Group();
    bk.position.copy(P).addScaledVector(N, 0.024);
    bk.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), N);
    straps.add(bk);
    add(bk, squircle(0.100, 0.080, 0.034, 3.4, 26), M.chrome);
    add(bk, new THREE.BoxGeometry(0.076, 0.015, 0.040), M.dark, [0, 0, 0.003], null, false);
  });
  body.visible = false; straps.visible = false;
  return [body, straps];
})();

/* 翼板：挤出成型的薄刀翼，外缘一圈发光描边 + 翼根机械接头 */
GEAR.back.wing = (() => {
  const g = new THREE.Group(); outfitSpine.add(g);
  /* 轮廓（x 向外、y 向上）：根部窄、中段最宽、尖端收成斜角 */
  const sh = new THREE.Shape();
  sh.moveTo(0.000, -0.120);
  sh.bezierCurveTo(0.205, -0.060, 0.296, 0.196, 0.266, 0.442);
  sh.bezierCurveTo(0.248, 0.618, 0.156, 0.720, 0.044, 0.738);
  sh.bezierCurveTo(-0.017, 0.600, -0.039, 0.355, -0.054, 0.150);
  sh.bezierCurveTo(-0.065, 0.029, -0.044, -0.048, 0.000, -0.120);
  const mk = (depth, mat, grow) => {
    const geo = new THREE.ExtrudeGeometry(sh, {
      depth, bevelEnabled: true, bevelSize: 0.010, bevelThickness: 0.008,
      bevelSegments: 2, curveSegments: 18
    });
    geo.translate(0, 0, -depth / 2);
    const m = new THREE.Mesh(geo, mat);
    m.scale.setScalar(grow);
    m.castShadow = true;
    return m;
  };
  [-1, 1].forEach(sg => {
    const w = new THREE.Group();
    w.position.set(sg * 0.282, 0.368, -0.318);
    w.rotation.set(0.10, sg * 0.70, -sg * 1.06);
    g.add(w);
    w.add(mk(0.052, M.accent, 1.000));   // 主体
    w.add(mk(0.034, M.cyan, 1.045));     // 略大一圈 → 只在外缘露出一道发光描边
    /* 翼根接头：把翼片"接"到背上，不是凭空插着 */
    add(w, squircle(0.170, 0.200, 0.220, 3.0, 32), M.matte, [-sg * 0.020, -0.108, 0]);
    add(w, new THREE.SphereGeometry(0.036, 16, 12), M.chrome, [-sg * 0.020, -0.108, 0.068]);
  });
  g.visible = false;
  return g;
})();

/* 围脖：脖子上绕的一圈厚针织领，上下各收一道边，中间四道横织纹。
   试过两次「长尾子」：一条斜挂到腰侧像书包背带，一条加宽后像块护胸板 ——
   围巾的体积本来就该在脖子附近，垂到胸口怎么摆都不对 */
GEAR.back.scarf = (() => {
  const g = new THREE.Group(); outfitSpine.add(g);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.252, 0.298, 0.206, 64, 1, true), M.cloth);
  body.position.set(0, 0.578, 0.004);
  body.scale.set(1, 1, 0.90);
  body.castShadow = true;
  g.add(body);
  /* 横织纹：围脖是绕圈织的，纹路横向。竖罗纹套在开口圆筒上还会削出锯齿 */
  [0.508, 0.548, 0.588, 0.628].forEach(y => {
    const t = (y - 0.475) / 0.206;
    const r = 0.298 + (0.252 - 0.298) * t;
    g.add(ringArc(r + 0.007, (r + 0.007) * 0.90, 0.0085, Math.PI * 2, y, M.cloth, 60));
  });
  /* 上下收边，把针织领的两端收住 */
  g.add(ringArc(0.254, 0.229, 0.012, Math.PI * 2, 0.681, M.lining, 64));
  g.add(ringArc(0.301, 0.271, 0.013, Math.PI * 2, 0.475, M.lining, 64));
  g.visible = false;
  return g;
})();

/* ------------------------------------------------------------- 腰胯造型 */

/* 工具腰带：环带 + 带扣 + 两个工具包 + 侧挂环 */
GEAR.hip.belt = (() => {
  const g = new THREE.Group();
  g.position.set(0, -0.055, 0);
  outfitSpine.add(g);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.252, 0.038, 14, 52), M.accent);
  ring.rotation.x = Math.PI / 2; ring.scale.set(1, 1.12, 1);
  ring.castShadow = true;
  g.add(ring);
  add(g, squircle(0.140, 0.115, 0.070, 3.0, 28), M.chrome, [0, 0, 0.268]);
  [-1, 1].forEach(sg => {
    add(g, squircle(0.155, 0.180, 0.120, 3.2, 34), M.matte, [sg * 0.172, -0.062, 0.208]);
    add(g, squircle(0.155, 0.038, 0.126, 3.0, 24), M.chrome, [sg * 0.172, 0.038, 0.208]);
  });
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.050, 0.015, 8, 24), M.matte);
  loop.rotation.y = Math.PI / 2; loop.position.set(0.268, -0.024, 0);
  g.add(loop);
  g.visible = false;
  return g;
})();

/* 短裙摆：锥台布 + 波浪下摆 + 深色内衬 + 腰部束带 */
GEAR.hip.skirt = (() => {
  const g = new THREE.Group();
  g.position.set(0, -0.038, 0);
  outfitSpine.add(g);
  const geo = new THREE.CylinderGeometry(0.296, 0.448, 0.352, 44, 4, true);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const t = (0.176 - y) / 0.352;
    const a = Math.atan2(z, x);
    const wv = Math.cos(a * 6);
    pos.setY(i, y - 0.034 * wv * t * t);
    const k = 1 + 0.048 * t * t * wv;
    pos.setX(i, x * k); pos.setZ(i, z * k);
  }
  geo.computeVertexNormals();
  const outer = new THREE.Mesh(geo, M.accent);
  outer.castShadow = true;
  g.add(outer);
  const inner = new THREE.Mesh(geo.clone(), M.lining);
  inner.scale.set(0.962, 1, 0.962);
  inner.position.y = -0.008;
  g.add(inner);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.306, 0.032, 10, 44), M.matte);
  band.rotation.x = Math.PI / 2; band.position.y = 0.166;
  band.castShadow = true;
  g.add(band);
  g.visible = false;
  return g;
})();

/* ------------------------------------------------------------- 四肢造型 */

/* 护胫：包住小腿甲的外壳（上宽下窄）+ 前面竖棱 + 下沿包边 */
GEAR.leg.shin = (() => {
  const out = [];
  [J.shinL, J.shinR].forEach(sh => {
    const g = new THREE.Group();
    g.position.y = -0.098;
    sh.add(g);
    const geo = squircle(0.312, 0.335, 0.312, 3.0, 48);
    taperY(geo, 1.0, 0.80);
    add(g, geo, M.accent, [0, 0, 0]);
    add(g, squircle(0.082, 0.300, 0.078, 2.6, 26), M.chrome, [0, 0.014, 0.146]);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.138, 0.024, 8, 32), M.matte);
    rim.rotation.x = Math.PI / 2; rim.position.y = -0.152;
    g.add(rim);
    g.visible = false;
    out.push(g);
  });
  return out;
})();

/* 袖口：前臂末端一段毛线袖筒，下口外扩成喇叭 */
GEAR.arm.cuff = (() => {
  const out = [];
  [J.foreL, J.foreR].forEach(f => {
    const g = new THREE.Group();
    g.position.y = -0.176;
    f.add(g);
    /* 毛线袖口：一段带竖罗纹的布筒，下口比上口宽（喇叭口）。
       原来半径 0.150 比前臂粗一半、只有 0.118 高，正面就是一个橙色方块 */
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.134, 0.160, 0.176, 48, 1, true), M.cloth);
    sleeve.castShadow = true;
    g.add(sleeve);
    /* 横织纹：袖筒绕着手臂织，纹路横向。
       竖罗纹（knitRib）套在开口圆筒上，下沿会被推成一圈锯齿 */
    [-0.056, -0.006, 0.044].forEach(y => {
      const t = (0.088 - y) / 0.176;
      const r = 0.134 + (0.160 - 0.134) * t;
      g.add(ringArc(r + 0.006, r + 0.006, 0.0075, Math.PI * 2, y, M.cloth, 40));
    });
    /* 下口一道深色收边，把喇叭口的厚度交代清楚 */
    g.add(ringArc(0.163, 0.163, 0.012, Math.PI * 2, -0.086, M.lining, 44));
    g.visible = false;
    out.push(g);
  });
  return out;
})();

/* --------------------------------------------------------------- 胸甲涂装 */

/* 两条发光竖缝 */
GEAR.mark.lines = (() => {
  const g = new THREE.Group(); outfitTorso.add(g);
  [-1, 1].forEach(sg => g.add(chestRibbon(k => [sg * 0.172, 0.206 - 0.432 * k], 0.0105, 40, 0.009, M.cyan)));
  g.visible = false; return g;
})();

/* 右胸十字（实验室标记） */
GEAR.mark.cross = (() => {
  const g = new THREE.Group(); outfitTorso.add(g);
  g.add(chestRibbon(k => [0.202, 0.108 - 0.142 * k], 0.0145, 14, 0.010, M.cloth));
  g.add(chestRibbon(k => [0.131 + 0.142 * k, 0.037], 0.0145, 14, 0.010, M.cloth));
  g.visible = false; return g;
})();

/* 左胸圆徽章 */
GEAR.mark.badge = (() => {
  const g = new THREE.Group(); outfitTorso.add(g);
  const P = new THREE.Vector3(), N = new THREE.Vector3();
  chestSurf(-0.146, 0.104, P, N);
  g.position.copy(P);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), N);
  const a = new THREE.Mesh(new THREE.CircleGeometry(0.056, 34), M.amber);
  a.position.z = 0.008; g.add(a);
  const b = new THREE.Mesh(new THREE.CircleGeometry(0.033, 28), M.cloth);
  b.position.z = 0.010; g.add(b);
  g.visible = false; return g;
})();

/* 一道斜向发光条（霓虹） */
GEAR.mark.stripe = (() => {
  const g = new THREE.Group(); outfitTorso.add(g);
  g.add(chestRibbon(k => [-0.332 + 0.664 * k, 0.172 - 0.302 * k], 0.0180, 44, 0.011, M.cyan));
  g.visible = false; return g;
})();

/* =========================================================================
   经典银白 / 深空夜航 / 薄荷实验室 的新配件
   ========================================================================= */

/* 铬领圈：颈根一圈亮环 + 两侧小肩盖 —— 把「头」和「身体」接上，
   比光秃秃一段脖子讲究，又不改变剪影 */
GEAR.shoulder.collar = (() => {
  const g = new THREE.Group(); outfitSpine.add(g);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.198, 0.040, 14, 56), M.chrome);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.598;
  ring.scale.set(1, 0.92, 1);
  ring.castShadow = true;
  g.add(ring);
  g.add(ringArc(0.208, 0.192, 0.014, Math.PI * 2, 0.556, M.matte, 56));
  [-1, 1].forEach(sg => {
    const p = new THREE.Group();
    p.position.set(sg * 0.468, 0.508, 0);
    p.rotation.z = -sg * 0.34;
    g.add(p);
    add(p, squircle(0.336, 0.100, 0.362, 3.6, 44), M.chrome, [0, 0, 0]);
    add(p, squircle(0.256, 0.058, 0.282, 3.4, 36), M.matte, [0, -0.058, 0]);
  });
  g.visible = false;
  return g;
})();

/* 细腰带：一道窄环 + 小方扣 + 扣上一颗灯 */
GEAR.hip.waist = (() => {
  const g = new THREE.Group();
  g.position.set(0, -0.048, 0);
  outfitSpine.add(g);
  /* 用关节的深色而不是 accent —— accent 在银白／米白皮肤上跟机身几乎同色，
     细腰带看着就是一根白色的塑料提手 */
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.250, 0.034, 12, 52), M.dark);
  ring.rotation.x = Math.PI / 2;
  ring.scale.set(1, 1.10, 1);
  ring.castShadow = true;
  g.add(ring);
  add(g, squircle(0.112, 0.090, 0.050, 3.0, 26), M.chrome, [0, 0, 0.266]);
  add(g, new THREE.CircleGeometry(0.021, 18), M.cyan, [0, 0, 0.294], null, false);
  g.visible = false;
  return g;
})();

/* 胸口两道细光缝：绕开中间的呼吸灯，左右各一段 */
GEAR.mark.chestline = (() => {
  const g = new THREE.Group(); outfitTorso.add(g);
  [-1, 1].forEach(sg => {
    /* 内端必须离开呼吸灯（灯座半径 0.144）。原来从 0.112 起，正好贴着灯环，
       两道缝在正面接成一条横线，像给灯划了一道删除线 */
    g.add(chestRibbon(k => [sg * (0.205 + 0.190 * k), -0.030], 0.0072, 20, 0.006, M.cyan));
  });
  g.visible = false; return g;
})();

/* 头盔光带：额上一条环带 + 两侧太阳穴的小舱 + 后脑一片护板。
   必须整体压在面屏上沿（y=0.395）之上，否则会横穿眼睛 */
GEAR.head.visor = (() => {
  const g = new THREE.Group(); outfitHead.add(g);
  /* 主带用橙色，不用 matte —— 深灰压在奶油机身上像一条「护额」，
     70 年代航天器的配色语言就是「米白 + 大块橙」 */
  g.add(ringArc(0.566, 0.418, 0.054, Math.PI * 2, 0.440, M.amber, 72));
  g.add(ringArc(0.572, 0.424, 0.010, Math.PI * 2, 0.494, M.cyan, 72));
  /* 两侧太阳穴的圆舱 */
  [-1, 1].forEach(sg => {
    const c = new THREE.Group();
    c.position.set(sg * 0.556, 0.398, 0.052);
    c.rotation.y = sg * 0.30;
    g.add(c);
    add(c, new THREE.CylinderGeometry(0.108, 0.108, 0.076, 28), M.accent, [0, 0, 0], [0, 0, Math.PI / 2]);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.108, 0.016, 8, 28), M.chrome);
    rim.rotation.y = Math.PI / 2; c.add(rim);
    add(c, new THREE.CircleGeometry(0.058, 24), M.cyan, [sg * 0.042, 0, 0], [0, sg * Math.PI / 2, 0], false);
  });
  /* 后脑护板 */
  g.add(headShell(0.812, 0.606, 0.596, Math.PI * 0.94, Math.PI * 1.12, Math.PI * 0.30, Math.PI * 0.30, M.accent, 64));
  g.visible = false;
  return g;
})();

/* 层叠肩甲：三层圆壳依次内缩下压 —— 靠"层次"做体积。
   上一版用 p=4.4 的方壳，出来是两块横着的砖 */
GEAR.shoulder.pauldron = (() => {
  const g = new THREE.Group(); outfitSpine.add(g);
  [-1, 1].forEach(sg => {
    const p = new THREE.Group();
    p.position.set(sg * 0.492, 0.486, 0);
    p.rotation.z = -sg * 0.30;
    g.add(p);
    /* 舱体：一颗压扁的球。三层叠壳像汉堡，一颗完整的球才像「航天器的一段」。
       外壳跟机身同色（奶油），只有接缝和窗框是黄铜 —— 整颗做成金色就是一颗金球 */
    add(p, squircle(0.556, 0.510, 0.542, 2.05, 58), M.silver, [0, 0, 0]);
    /* 赤道一道黄铜接缝，把球分成上下两段 —— 这是「舱段」最省事的视觉记号 */
    const seam = new THREE.Mesh(new THREE.TorusGeometry(0.274, 0.016, 8, 50), M.chrome);
    seam.rotation.x = Math.PI / 2;
    seam.castShadow = false;
    p.add(seam);
    /* 舷窗：朝前外侧的一颗深色玻璃圆窗 + 黄铜框。
       原来摆在球的侧面（x 接近半径），被球面自己挡掉了，正面根本看不见 */
    const port = new THREE.Group();
    port.position.set(sg * 0.052, 0.052, 0.272);
    port.rotation.y = sg * 0.13;
    port.rotation.x = -0.10;
    p.add(port);
    add(port, new THREE.TorusGeometry(0.102, 0.023, 12, 36), M.chrome);
    /* 舷窗里亮着灯，不用黑玻璃 —— M.screen 是 0x03060b，在奶油机身上
       就是两个黑洞，看着像被挖空了 */
    add(port, new THREE.CircleGeometry(0.095, 32), M.cyan, [0, 0, 0.004], null, false);
    add(port, new THREE.TorusGeometry(0.060, 0.008, 8, 30), M.chrome, [0, 0, 0.006], null, false);
    /* 顶部一颗小天线球 */
    add(p, new THREE.SphereGeometry(0.025, 14, 10), M.chrome, [sg * 0.052, 0.228, 0]);
  });
  g.visible = false;
  return g;
})();

/* 工具背带：两条从肩斜到腰的织带 + 胸前一个仪表盒。
   原本想做白大褂，但这个身子的手臂紧贴着躯干，外套的侧片一定会穿模，
   而且会鼓成一件斗篷 —— 背带贴身穿，反而更像"实验室里的人" */
GEAR.back.harness = (() => {
  const g = new THREE.Group(); outfitTorso.add(g);
  /* 两条主背带：颜色用布色（薄荷绿），不用 accent。
     accent 是 0xdcf0e8 的近白，压在纯白机身上整条带子会「消失」——
     上一版只剩中间那道深色缝，远看是两条莫名其妙的细黑线 */
  [-1, 1].forEach(sg => {
    g.add(chestRibbon(k => [sg * (0.270 - 0.086 * k), 0.300 - 0.566 * k], 0.058, 44, 0.016, M.cloth));
    g.add(chestRibbon(k => [sg * (0.270 - 0.086 * k), 0.300 - 0.566 * k], 0.012, 44, 0.024, M.lining));
  });
  /* 横向胸带：把两条竖带连起来，背带才有「装具」的结构，而不是两条斜纹 */
  g.add(chestRibbon(k => [-0.300 + 0.600 * k, -0.212 + 0.024 * Math.sin(Math.PI * k)], 0.040, 44, 0.016, M.cloth));
  g.add(chestRibbon(k => [-0.300 + 0.600 * k, -0.212 + 0.024 * Math.sin(Math.PI * k)], 0.010, 44, 0.024, M.lining));
  /* 肩上的两个金属扣 */
  [-1, 1].forEach(sg => {
    add(g, squircle(0.104, 0.086, 0.048, 3.0, 22), M.matte, [sg * 0.286, 0.286, 0.146], [0, sg * 0.30, 0]);
  });
  /* 胸前的仪表盒 */
  const P = new THREE.Vector3(), N = new THREE.Vector3();
  chestSurf(0.214, -0.090, P, N);
  const box = new THREE.Group();
  box.position.copy(P).addScaledVector(N, 0.018);
  box.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), N);
  g.add(box);
  add(box, squircle(0.176, 0.146, 0.072, 3.2, 30), M.matte, [0, 0, 0]);
  add(box, new THREE.CircleGeometry(0.030, 20), M.cyan, [0, 0.022, 0.040], null, false);
  add(box, squircle(0.076, 0.022, 0.032, 2.4, 16), M.chrome, [0, -0.040, 0.038]);
  /* 背后的气罐：一台「实验室机器」得有东西在背上背氧气 */
  const can = new THREE.Group();
  can.position.set(0, 0.120, -0.352);
  g.add(can);
  add(can, new THREE.CylinderGeometry(0.108, 0.108, 0.330, 28), M.accent, [0, 0, 0]);
  add(can, new THREE.SphereGeometry(0.108, 28, 16), M.accent, [0, 0.165, 0]);
  add(can, new THREE.CylinderGeometry(0.042, 0.042, 0.070, 18), M.chrome, [0, 0.268, 0]);
  can.add(ringArc(0.112, 0.112, 0.016, Math.PI * 2, 0.062, M.cloth, 40));
  can.add(ringArc(0.112, 0.112, 0.016, Math.PI * 2, -0.062, M.cloth, 40));
  /* 肩上一支试剂管 */
  const vial = new THREE.Group();
  vial.position.set(-0.318, 0.430, 0.140);
  vial.rotation.z = 0.28;
  g.add(vial);
  add(vial, new THREE.CylinderGeometry(0.036, 0.036, 0.150, 18), M.chrome, [0, 0, 0]);
  add(vial, new THREE.CylinderGeometry(0.028, 0.028, 0.104, 16), M.cyan, [0, -0.012, 0], null, false);
  add(vial, new THREE.CylinderGeometry(0.040, 0.040, 0.026, 18), M.matte, [0, 0.084, 0]);
  g.visible = false;
  return g;
})();

/* 试管腰带（薄荷实验室）—— 一条真正「装着东西」的腰带。
   素腰带在这台机器身上读不出来；挂上试剂管，职业信息就写在腰上了 */
GEAR.hip.toolbelt = (() => {
  const g = new THREE.Group();
  g.position.set(0, -0.055, 0);
  outfitSpine.add(g);
  /* 腰带本身用布色（薄荷绿）—— accent 是近白，压在白机身上等于没系腰带 */
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.256, 0.050, 14, 56), M.cloth);
  ring.rotation.x = Math.PI / 2; ring.scale.set(1, 1.10, 1);
  ring.castShadow = true;
  g.add(ring);
  /* 试管架必须摆到**正面**：原来挂在左右两侧，正好被垂下来的手臂整个挡住，
     正面只剩一条黑带。正面这一小段是唯一不会被手臂遮住的腰带 */
  add(g, squircle(0.384, 0.092, 0.078, 3.0, 34), M.matte, [0, -0.018, 0.246]);
  add(g, squircle(0.098, 0.098, 0.042, 2.6, 24), M.chrome, [0, -0.014, 0.290]);
  add(g, new THREE.CircleGeometry(0.030, 20), M.cyan, [0, -0.014, 0.314], null, false);
  [-1, 0, 1].forEach(k => {
    const t = new THREE.Group();
    t.position.set(k * 0.126, -0.058, 0.254);
    t.rotation.z = -k * 0.20;
    g.add(t);
    /* 管身直接发光：chrome 是近白色，包着发光液的时候整支管子只剩一根白棍 */
    add(t, new THREE.CylinderGeometry(0.038, 0.038, 0.158, 16), M.cyan, [0, -0.078, 0], null, false);
    add(t, new THREE.CylinderGeometry(0.042, 0.042, 0.030, 16), M.matte, [0, 0.006, 0]);
    add(t, new THREE.CylinderGeometry(0.041, 0.041, 0.020, 16), M.chrome, [0, -0.150, 0]);
  });
  g.visible = false;
  return g;
})();

/* 肩载无影灯（薄荷实验室）—— 背后伸出两节关节臂，末端一只环形灯。
   摆位要同时避开三样：头壳（y=0.72 处半宽只剩 0.39）、上臂（肩点在 0.50，
   手臂往下挂）、以及胸口的呼吸灯。灯头因此架在「肩线之上、头的侧前方」 */
GEAR.shoulder.lampArm = (() => {
  const g = new THREE.Group(); outfitSpine.add(g);
  const rod = (a, b, r, mat) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 16), mat);
    m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    m.castShadow = true;
    g.add(m);
    return m;
  };
  /* 底座 */
  add(g, squircle(0.180, 0.220, 0.076, 3.0, 26), M.matte, [0.310, 0.450, -0.296], [0, 0.28, 0]);
  /* 臂杆用薄荷绿 —— 白色杆压在白机身上看不见，深色杆衬在深色背景上又看不见，
     只有这套皮肤的布色两头都压得住。
     灯头必须架到 x=0.70：y=0.74 处头壳还有 0.48 宽，摆近一点整条臂就缩进头后面了 */
  rod([0.316, 0.478, -0.286], [0.500, 0.660, -0.040], 0.034, M.cloth);
  add(g, new THREE.SphereGeometry(0.056, 20, 14), M.matte, [0.500, 0.660, -0.040]);
  rod([0.500, 0.660, -0.040], [0.700, 0.740, 0.220], 0.030, M.cloth);
  /* 灯头：环形灯罩 + 发光面 + 中心透镜 + 后壳 */
  const hd = new THREE.Group();
  hd.position.set(0.706, 0.744, 0.238);
  hd.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1), new THREE.Vector3(-0.58, -0.46, 0.67).normalize());
  g.add(hd);
  add(hd, new THREE.TorusGeometry(0.128, 0.042, 12, 40), M.accent);
  add(hd, new THREE.CircleGeometry(0.100, 34), M.cyan, [0, 0, 0.008], null, false);
  add(hd, new THREE.TorusGeometry(0.060, 0.014, 8, 28), M.chrome, [0, 0, 0.026], null, false);
  add(hd, new THREE.CylinderGeometry(0.102, 0.064, 0.128, 26), M.matte, [0, 0, -0.076], [Math.PI / 2, 0, 0]);
  g.visible = false;
  return g;
})();

/* =========================================================================
   四季与节日
   ========================================================================= */

/* ---------------- 圣诞 · 雪夜礼颂 ---------------- */

/* 圣诞帽：软塌塌朝一边倒的锥体 + 一圈白绒边 + 尖端绒球。
   锥体用 bentCone 弯，直锥看着像生日帽 */
/* 圣诞帽：红绒锥体 + 一圈厚白绒口 + 帽尖白绒球。
   上一版锥体 0.470 底径 × 0.660 高，又细又长，是一顶派对尖帽；
   白绒口只是一根 0.094 的细环，几乎看不见。圣诞帽的辨识度全在「粗 + 白毛边」 */
GEAR.head.santa = (() => {
  const g = new THREE.Group(); outfitHead.add(g);
  /* 锥体：底径加宽到 0.560、高度压到 0.560，才是圣诞帽的胖锥。
     bentCone 的 position 是锥体中心，底面要落在 y=0.400（面屏上沿之上） */
  /* 帽底抬到 0.440、bend 收到 0.16 —— 天线球在 y=0.755 半径 0.108，
     锥体弯得太厉害，球顶就从帽子的左后侧顶出来，变成一颗莫名其妙的红珠子 */
  const cone = bentCone(0.585, 0.048, 0.560, 0.160, M.cloth, 48, 18);
  cone.position.set(0, 0.720, 0);
  /* 锥体要跟着头壳压扁 —— 头是椭圆（宽 0.79 / 深 0.57），
     锥体是圆的，不压的话前后会鼓出绒环，白绒边就从两侧「断开」了 */
  cone.scale.z = 0.74;
  g.add(cone);
  /* 白绒口：一圈厚毛边。用闭合圆环而不是开口圆筒 ——
     knitRib 在开口圆筒的下沿会削出一圈锯齿，圆环没有边缘，随便揉。
     内径必须大过锥体底面（0.585×0.74=0.433）和头壳（0.557 / 0.396） */
  const fur = ringArc(0.650, 0.500, 0.082, Math.PI * 2, 0.412, M.snow, 76);
  knitRib(fur, 26, 0.030);
  g.add(fur);
  /* 帽尖白绒球：锥尖在 (0.260, 0.960, -0.078)，绒球必须挂在这个点上 */
  add(g, new THREE.SphereGeometry(0.104, 24, 18), M.snow, [0.160, 1.000, -0.048]);
  g.visible = false;
  return g;
})();

/* 圣诞腰带：深色宽腰带 + 金方扣。红衣服配黑腰带金扣，是圣诞老人最硬的记号 ——
   之前这套只有一顶帽子和一个背包，身上干干净净，跟圣诞没半点关系 */
GEAR.hip.santaBelt = (() => {
  const g = new THREE.Group();
  g.position.set(0, -0.048, 0);
  outfitSpine.add(g);
  /* 用近黑的 dark，不用 lining —— lining 是 0x6b0d1c 暗红，
     压在暖白机身上就是一条「深红棕色的带子」，看不出是黑腰带 */
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.254, 0.062, 14, 56), M.dark);
  ring.rotation.x = Math.PI / 2;
  ring.scale.set(1, 1.08, 1);
  ring.castShadow = true;
  g.add(ring);
  /* 金方扣：外框 + 深色内芯，才看得出是「扣」，而不是贴了块金片 */
  /* 扣子必须贴在腰带前缘（z = 0.254×1.08 + 0.062 = 0.336）之外，
     摆在 0.252 会被腰带整个吞掉，正面只剩一条光板 */
  add(g, squircle(0.178, 0.150, 0.062, 3.2, 30), M.accent, [0, 0, 0.330]);
  add(g, squircle(0.100, 0.080, 0.036, 3.0, 24), M.dark, [0, 0, 0.362]);
  g.visible = false;
  return g;
})();

/* 白绒袖口：红袖筒 + 下口一圈白毛边 */
GEAR.arm.furcuff = (() => {
  const out = [];
  [J.foreL, J.foreR].forEach(f => {
    const g = new THREE.Group();
    g.position.y = -0.176;
    f.add(g);
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.134, 0.160, 0.176, 48, 1, true), M.cloth);
    sleeve.castShadow = true;
    g.add(sleeve);
    /* 毛边用闭合圆环：开口圆筒加 knitRib 会在下沿削出一圈锯齿 */
    const fur = ringArc(0.166, 0.166, 0.036, Math.PI * 2, -0.086, M.snow, 48);
    knitRib(fur, 22, 0.026);
    g.add(fur);
    g.visible = false;
    out.push(g);
  });
  return out;
})();

/* 礼物背包：方盒 + 十字缎带 + 蝴蝶结 */
GEAR.back.gift = (() => {
  const g = new THREE.Group();
  /* 盒子必须比躯干窄、也不能顶到脖子 —— 之前 0.50 宽、顶到 0.467，
     正面从脖子右边露出一块红漆和金缎带，像肩后卡了张卡片 */
  g.position.set(0, 0.130, -0.520);
  outfitSpine.add(g);
  add(g, squircle(0.420, 0.400, 0.240, 3.6, 44), M.cloth, [0, 0, 0]);
  add(g, squircle(0.432, 0.078, 0.252, 3.4, 40), M.amber, [0, 0.166, 0]);
  /* 缎带：竖一道、横一道 */
  add(g, new THREE.BoxGeometry(0.074, 0.410, 0.256), M.amber, [0, 0, 0]);
  add(g, new THREE.BoxGeometry(0.424, 0.074, 0.256), M.amber, [0, 0.016, 0]);
  /* 蝴蝶结 */
  [-1, 1].forEach(sg => {
    const b = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.024, 10, 24), M.amber);
    b.position.set(sg * 0.082, 0.204, 0);
    b.rotation.set(0, 0, sg * 0.55);
    b.castShadow = true;
    g.add(b);
  });
  add(g, new THREE.SphereGeometry(0.038, 18, 14), M.chrome, [0, 0.204, 0]);
  /* 两条背带：往里收，否则会从肩后戳到正面 */
  [-1, 1].forEach(sg => {
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.290, 0.056), M.lining);
    st.position.set(sg * 0.118, 0.260, 0.170);
    st.rotation.x = -0.30;
    g.add(st);
  });
  g.visible = false;
  return g;
})();

/* ---------------- 春节 · 醒狮贺岁 ---------------- */

/* 醒狮头：红绒头套 + 一圈白绒口 + 带毛圈的凸眼 + 金鼻球 + 短粗独角 + 满额绒球。
   上一版不像狮子，根子不在头套大小，而在「一根毛都没有」——
   醒狮的辨识度有一半在那一圈圈白绒球上：口鼻的毛边、眼睛的毛圈、额顶的绒球。
   另外把金绒口改成白绒口：醒狮的口鼻边是白毛，金边只会读成「面罩边框」。
   机器人没有嘴，就让白绒口把面屏整个包成狮子的口鼻部 */
GEAR.head.lion = (() => {
  const g = new THREE.Group(); outfitHead.add(g);
  g.add(headShell(0.820, 0.700, 0.660, 0, Math.PI * 2, 0, Math.PI * 0.3125, M.cloth, 96));
  g.add(headShell(0.820, 0.700, 0.660, Math.PI * 1.00, Math.PI * 1.00, Math.PI * 0.3125, Math.PI * 0.34, M.cloth, 80));

  /* ---- 白绒口 ----
     底下一根实心白管填缝，上面 38 颗大小交替的绒球压在管子上。
     面屏是超椭圆（|x/0.55|³ + |y/0.395|³ = 1），球心压在边界外 5.5% 处才咬得住 */
  const rimPts = [];
  const RN = 96;
  for (let i = 0; i < RN; i++) {
    const t = i / RN * Math.PI * 2, ct = Math.cos(t), st = Math.sin(t);
    const x = SCR.rx * 1.055 * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / SCR.n);
    const y = SCR.ry * 1.055 * Math.sign(st) * Math.pow(Math.abs(st), 2 / SCR.n);
    rimPts.push(new THREE.Vector3(x, y, headZ(x, y) + 0.020));
  }
  const rimTube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPts, true), 132, 0.050, 10, true), M.snow);
  rimTube.castShadow = true;
  g.add(rimTube);
  for (let i = 0; i < 38; i++) {
    const p = rimPts[Math.round(i / 38 * RN) % RN];
    add(g, new THREE.SphereGeometry(0.058 + 0.012 * Math.sin(i * 2.7), 14, 11), M.snow,
      [p.x, p.y, p.z + 0.004]);
  }

  /* ---- 两只凸眼：金环 + 白眼球 + 黑瞳 + 一圈睫毛绒球 ---- */
  [-1, 1].forEach(sg => {
    const ex = sg * 0.352, ey = 0.496;
    const sz = 0.66 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(ex) / 0.82, 2.2)
      - Math.pow(Math.abs(ey) / 0.70, 2.2)), 1 / 2.2);
    const c = new THREE.Group();
    c.position.set(ex, ey, sz + 0.004);
    /* 法线取头套椭球的，再和正前方混一半 —— 纯按法线摆，眼睛会朝天翻；
       纯按正前方摆，眼睛又会从太阳穴戳出来 */
    const nrm = new THREE.Vector3(ex / 0.82, ey / 0.70, sz / 0.66).normalize();
    const face = nrm.multiplyScalar(0.52).add(new THREE.Vector3(0, 0, 0.62)).normalize();
    c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), face);
    g.add(c);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.152, 0.034, 10, 40), M.accent);
    rim.position.z = -0.012;
    rim.castShadow = true;
    c.add(rim);
    add(c, new THREE.SphereGeometry(0.150, 26, 20), M.snow, [0, 0, 0.020]);
    add(c, new THREE.SphereGeometry(0.074, 20, 16), M.dark, [0, 0, 0.126]);
    add(c, new THREE.SphereGeometry(0.026, 12, 10), M.chrome, [0.040, 0.044, 0.176], null, false);
    /* 睫毛：14 颗白绒球围一圈。周长 1.19，14 颗直径 0.080 刚好接住 */
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2;
      add(c, new THREE.SphereGeometry(0.040, 12, 9), M.snow,
        [Math.cos(a) * 0.190, Math.sin(a) * 0.190, -0.022]);
    }
  });

  /* ---- 金鼻球：搁在面屏上沿正中 ----
     机器人没有嘴，面屏就是口鼻部；鼻球压在「口」的上沿，位置正好 */
  const nz = 0.66 * Math.pow(1 - Math.pow(0.425 / 0.70, 2.2), 1 / 2.2);
  const nose = new THREE.Group();
  nose.position.set(0, 0.425, nz - 0.072);
  g.add(nose);
  add(nose, new THREE.SphereGeometry(0.118, 24, 18), M.accent);
  [-1, 1].forEach(sg => {
    add(nose, new THREE.SphereGeometry(0.028, 12, 10), M.dark, [sg * 0.048, -0.052, 0.080], null, false);
  });

  /* ---- 独角：短、粗、向前上方挑。上一版 0.176 底径 × 0.31 高，细长得像生日帽尖 ---- */
  const horn = bentCone(0.200, 0.058, 0.215, 0, M.accent, 34, 14);
  horn.position.set(0, 0.800, 0.014);
  horn.rotation.x = 0.14;
  g.add(horn);
  const hb = new THREE.Mesh(new THREE.TorusGeometry(0.202, 0.026, 10, 32), M.chrome);
  hb.rotation.x = Math.PI / 2;
  hb.position.set(0, 0.690, -0.020);
  g.add(hb);
  /* 角尖红绒球 */
  add(g, new THREE.SphereGeometry(0.082, 18, 14), M.cloth, [0, 0.902, 0.031]);

  /* ---- 额珠：额心一颗大红绒球，醒狮最标志的一颗 ---- */
  const bz = 0.66 * Math.pow(1 - Math.pow(0.588 / 0.70, 2.2), 1 / 2.2);
  add(g, new THREE.SphereGeometry(0.112, 20, 16), M.cloth, [0, 0.588, bz + 0.042]);
  add(g, new THREE.TorusGeometry(0.114, 0.020, 8, 28), M.accent, [0, 0.588, bz + 0.014], [1.34, 0, 0]);

  /* ---- 狮耳：红绒耳片 + 金边 + 一圈白绒球，长在两侧偏上。
     耳片必须半埋进头套：摆在 x=0.652 的时候整片浮在头壳外面，
     正面看是两枚「挂着的红金币」 ---- */
  [-1, 1].forEach(sg => {
    const e = new THREE.Group();
    e.position.set(sg * 0.588, 0.394, 0.212);
    e.rotation.y = sg * 1.02;
    e.rotation.z = -sg * 0.16;
    g.add(e);
    add(e, squircle(0.206, 0.238, 0.094, 2.1, 30), M.cloth, [0, 0, 0.040]);
    const er = new THREE.Mesh(new THREE.TorusGeometry(0.106, 0.018, 8, 26), M.accent);
    er.position.z = 0.088; er.scale.set(1.0, 1.14, 1);
    e.add(er);
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      add(e, new THREE.SphereGeometry(0.036, 12, 9), M.snow,
        [Math.cos(a) * 0.118, Math.sin(a) * 0.136, 0.072]);
    }
  });

  /* ---- 腮毛：沿下颌一小排白绒，狮子的腮帮子。摆在脸的侧面会被凸眼压住，
     所以压到面屏下沿两侧、绒口之外一点点的位置 ---- */
  [-1, 1].forEach(sg => {
    for (let i = 0; i < 3; i++) {
      add(g, new THREE.SphereGeometry(0.052, 12, 9), M.snow,
        [sg * (0.632 - i * 0.028), -0.318 - i * 0.044, 0.236 - i * 0.034]);
    }
  });

  /* ---- 后披下缘一排白绒球，把「毛」绕到脑后 ---- */
  const TH = Math.PI * 0.6525;
  for (let i = 0; i < 9; i++) {
    const phi = Math.PI * 1.06 + i * (Math.PI * 0.88 / 8);
    add(g, new THREE.SphereGeometry(0.070, 14, 11), M.snow, [
      -0.82 * Math.cos(phi) * Math.sin(TH),
      0.70 * Math.cos(TH),
      0.66 * Math.sin(phi) * Math.sin(TH)
    ]);
  }
  g.visible = false;
  return g;
})();

/* 金绶带：从右肩斜挂到左胯，末端一颗流苏。
   注意胸口正中有呼吸灯（圆心 y=-0.020，半径 0.15），直线绶带会正好压在灯上，
   所以走一条 Catmull-Rom 曲线，从灯的下方兜过去 */
GEAR.back.sash = (() => {
  const g = new THREE.Group(); outfitTorso.add(g);
  const CP = [[0.372, 0.246], [0.262, 0.040], [0.126, -0.158], [-0.086, -0.250], [-0.330, -0.212]];
  const sashPath = k => {
    const n = CP.length - 1;
    const f = Math.min(0.99999, Math.max(0, k)) * n;
    const i = Math.floor(f), t = f - i, t2 = t * t, t3 = t2 * t;
    const p0 = CP[Math.max(0, i - 1)], p1 = CP[i];
    const p2 = CP[Math.min(n, i + 1)], p3 = CP[Math.min(n, i + 2)];
    const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t
      + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])];
  };
  g.add(chestRibbon(sashPath, 0.074, 60, 0.020, M.accent));
  g.add(chestRibbon(sashPath, 0.020, 60, 0.028, M.lining));
  const P = new THREE.Vector3(), N = new THREE.Vector3();
  chestSurf(-0.330, -0.212, P, N);
  const t = new THREE.Group();
  t.position.copy(P).addScaledVector(N, 0.030);
  g.add(t);
  add(t, new THREE.SphereGeometry(0.038, 16, 12), M.chrome);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.120, 6), M.cloth);
    s.position.set(Math.cos(a) * 0.026, -0.086, Math.sin(a) * 0.010);
    s.rotation.z = Math.cos(a) * 0.20;
    t.add(s);
  }
  g.visible = false;
  return g;
})();

/* 铜钱徽记：金圆片 + 方孔 + 一圈齿 */
GEAR.mark.coin = (() => {
  const g = new THREE.Group(); outfitTorso.add(g);
  const P = new THREE.Vector3(), N = new THREE.Vector3();
  /* 铜钱不能压在绶带上：绶带从左肩斜到右胯，左胸上角是唯一空位 */
  chestSurf(-0.300, 0.176, P, N);
  g.position.copy(P);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), N);
  add(g, new THREE.CylinderGeometry(0.072, 0.072, 0.016, 32), M.accent, [0, 0, 0.008], [Math.PI / 2, 0, 0]);
  add(g, new THREE.BoxGeometry(0.038, 0.038, 0.024), M.dark, [0, 0, 0.012]);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    add(g, new THREE.SphereGeometry(0.009, 8, 6), M.chrome,
      [Math.cos(a) * 0.062, Math.sin(a) * 0.062, 0.016], null, false);
  }
  g.visible = false;
  return g;
})();

/* ---------------- 春 · 樱花初绽 ---------------- */

/** 一朵五瓣花：五片压扁的球围成一圈 + 花心。
    花瓣默认用 cloth（皮肤里那支真正的粉色），用 accent 会淡到发白 */
function blossom(parent, x, y, z, r, rot, petalMat = M.cloth, coreMat = M.chrome) {
  const f = new THREE.Group();
  f.position.set(x, y, z);
  if (rot) f.rotation.set(rot[0], rot[1], rot[2]);
  parent.add(f);
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2;
    const p = new THREE.Mesh(new THREE.SphereGeometry(r * 0.64, 12, 10), petalMat);
    p.position.set(Math.cos(a) * r * 0.68, Math.sin(a) * r * 0.68, 0);
    p.scale.set(1, 0.74, 0.36);
    p.rotation.z = a;
    p.castShadow = true;
    f.add(p);
  }
  const c = new THREE.Mesh(new THREE.SphereGeometry(r * 0.32, 10, 8), coreMat);
  c.position.z = r * 0.16;
  f.add(c);
  return f;
}

/* 花冠：沿额上贴着脑袋戴一圈花，大小和高低都错开 ——
   等大等距会像一圈螺丝帽。位置直接取头壳在该高度的椭圆半径，花才贴得住 */
GEAR.head.blossom = (() => {
  const g = new THREE.Group(); outfitHead.add(g);
  const N = 11;
  for (let i = 0; i < N; i++) {
    const a = -Math.PI * 0.96 + (i / (N - 1)) * Math.PI * 1.92;
    const y = 0.452 + 0.046 * Math.sin(i * 1.9);
    const rx = 0.556, rz = 0.404;
    const x = Math.sin(a) * rx, z = Math.cos(a) * rz;
    const sz = i % 3 === 0 ? 0.126 : (i % 3 === 1 ? 0.102 : 0.086);
    blossom(g, x, y, z, sz, [0, a, 0]);
  }
  /* 两片叶子 */
  [-1, 1].forEach(sg => {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.078, 12, 10), M.accent);
    l.position.set(sg * 0.512, 0.432, -0.268);
    l.scale.set(1, 0.34, 0.62);
    l.rotation.set(0.2, sg * 0.6, sg * 0.4);
    l.castShadow = true;
    g.add(l);
  });
  g.visible = false;
  return g;
})();

/* 花瓣披肩：一道横跨胸口的「披肩拱」—— 两端搭在肩上，中间拱过锁骨。
   试过三种：① 绕身体一圈的锥面（半径比胸甲小，整块埋进去，只剩一条竖布舌头）；
   ② V 形领（两片往下散开，看着像系了个粉色十字带）；③ 收窄成 V 又会压到呼吸灯。
   拱形是最稳的：最低点 y=0.150，正好在呼吸灯（顶边 y≈0.130）之上 */
GEAR.back.shawl = (() => {
  const g = new THREE.Group(); outfitTorso.add(g);
  /* 拱顶只能到 0.22。原来给到 0.30，正好撞上胸甲顶部边缘 ——
     那里 chestSurf 的 s 趋近 1、z 归零、法线退化成水平，
     带子的副法线跟着崩，中间那段几何整个塌进去，正面看就是断成两截 */
  const arch = (drop, lift) => k => [
    -0.375 + 0.750 * k,
    0.148 + 0.072 * Math.sin(Math.PI * k) - drop,
  ];
  /* 两端收窄 —— 宽度恒定的话，带子在肩头被斜切一刀，像一条剪断的布 */
  g.add(chestRibbon(arch(0, 0),
    k => 0.126 - 0.046 * Math.pow(Math.abs(k - 0.5) * 2, 3), 56, 0.020, M.cloth));
  /* 下沿那道包边最后全删了：深色版成了横在胸前的暗红飘带，浅色版在月兔身上
     又变成一根金线，两头都比领子抢眼。素面一块布反而最干净 */
  /* 颈根一圈小珠扣 —— 必须挂在 spine 上才贴得住脖子，和躯干坐标系差一个身位 */
  const n = new THREE.Group(); outfitSpine.add(n);
  for (let i = 0; i < 8; i++) {
    const a = -1.25 + i * 0.36;
    add(n, new THREE.SphereGeometry(0.028, 12, 10), M.chrome,
      [Math.sin(a) * 0.306, 0.598, Math.cos(a) * 0.282], null, false);
  }
  g.visible = false; n.visible = false;
  return [g, n];
})();

/* 樱花徽记：别在披肩左襟上的一小枝花 —— 三朵花 + 一段细枝。
   原来是两块压扁的粉球，远看像蹭脏了；位置也得抬到披肩之上，
   压在领子底下就只剩半片花瓣露出来 */
GEAR.mark.petal = (() => {
  const g = new THREE.Group(); outfitTorso.add(g);
  const P = new THREE.Vector3(), N = new THREE.Vector3();
  /* 枝干：顺着披肩左襟的斜度走，抬到领子面上 */
  g.add(chestRibbon(k => [-0.148 - 0.190 * k, 0.250 - 0.076 * k], 0.011, 24, 0.028, M.lining));
  const spots = [[-0.170, 0.246, 0.058, -0.28], [-0.258, 0.212, 0.044, 0.52], [-0.334, 0.178, 0.032, -0.86]];
  spots.forEach(([x, y, r, rot]) => {
    chestSurf(x, y, P, N);
    const c = new THREE.Group();
    c.position.copy(P).addScaledVector(N, 0.036);
    c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), N);
    c.rotateZ(rot);
    g.add(c);
    /* 花瓣用深玫瑰的 lining、花心用浅 chrome ——
       cloth 压 cloth 会糊成一片，accent 又淡到几乎看不见 */
    blossom(c, 0, 0, 0, r, null, M.lining, M.chrome);
  });
  g.visible = false;
  return g;
})();

/* ---------------- 夏 · 盛夏海风 ---------------- */

/* 草编遮阳帽：宽平帽檐 + 桶形帽冠 + 一条海蓝缎带。
   帽檐做成向下斜的锥台（不是压扁的圆环）—— 圆环是平的，正面看像飞碟边 */
GEAR.head.straw = (() => {
  const g = new THREE.Group(); outfitHead.add(g);
  /* 帽檐：向下斜的锥台，坡度要够 —— 薄圆盘正面看就是一片飞碟。
     原来半径 0.968 又只斜 0.09，整个盖在脸上，头变成了蘑菇 */
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.540, 0.860, 0.120, 64, 1), M.accent);
  brim.position.y = 0.452;
  brim.castShadow = true; brim.receiveShadow = true;
  g.add(brim);
  /* 外缘一圈滚边，用草色 —— 蓝色那圈看着像塑料飞碟边 */
  const edge = ringArc(0.864, 0.864, 0.026, Math.PI * 2, 0.396, M.accent, 64);
  edge.scale.z = 0.92;
  g.add(edge);
  /* 帽冠：桶形，上小下大 */
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.400, 0.520, 0.260, 52, 3, true), M.accent);
  crown.position.y = 0.600;
  crown.castShadow = true;
  g.add(crown);
  add(g, new THREE.CylinderGeometry(0.400, 0.400, 0.026, 52), M.accent, [0, 0.730, 0]);
  /* 缎带：贴住帽冠的锥度，飘在外面就成了悬空的一圈 */
  g.add(ringArc(0.514, 0.514, 0.032, Math.PI * 2, 0.498, M.cloth, 56));
  add(g, squircle(0.086, 0.068, 0.038, 3.0, 20), M.chrome, [0.512, 0.498, 0.018]);
  g.visible = false;
  return g;
})();

/* ---------------- 秋 · 月兔中秋 ---------------- */

/* 兔耳：两根长耳朵，外白内金。内耳必须**凸出外耳表面** ——
   之前用 CapsuleGeometry 缩小后往 z 推 0.058，可外耳半径 0.106、
   内耳前表面只到 0.089，整片埋在里头，正面看就是两根光板白棍子 */
GEAR.head.bunny = (() => {
  const g = new THREE.Group(); outfitHead.add(g);
  [-1, 1].forEach(sg => {
    const e = new THREE.Group();
    e.position.set(sg * 0.236, 0.548, -0.030);
    e.rotation.set(-0.14, 0, -sg * 0.22);
    g.add(e);
    /* 外耳：上端收窄，才不像两根管子 */
    const outer = new THREE.Mesh(new THREE.CapsuleGeometry(0.104, 0.400, 10, 22), M.silver);
    outer.position.y = 0.286;
    outer.scale.set(1, 1, 0.62);
    taperY(outer.geometry, 1.0, 0.86);
    outer.castShadow = true;
    e.add(outer);
    /* 内耳：一片压扁的椭球贴在耳前面上，前表面到 0.112 > 外耳 0.064 */
    const inner = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), M.accent);
    inner.scale.set(0.058, 0.212, 0.024);
    inner.position.set(0, 0.286, 0.082);
    e.add(inner);
    /* 耳根一圈绒毛 */
    e.add(ringArc(0.110, 0.070, 0.026, Math.PI * 2, 0.056, M.accent, 26));
  });
  /* 脑后月环：一轮发光的满月边光。中秋最直接的符号就是月亮，
     之前全身上下只有胸口一枚小月牙，怎么看都不像中秋 */
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.845, 0.019, 8, 76), M.cyan);
  halo.position.set(0, 0.180, -0.492);
  halo.rotation.x = 0.06;
  g.add(halo);
  g.visible = false;
  return g;
})();

/* 月牙徽记：一段粗圆弧 + 两颗小星 */
GEAR.mark.moon = (() => {
  const g = new THREE.Group(); outfitTorso.add(g);
  const P = new THREE.Vector3(), N = new THREE.Vector3();
  /* 别在披肩右襟上 —— 放在胸口正中会同时压到呼吸灯和领子，两头不讨好 */
  chestSurf(0.250, 0.228, P, N);
  g.position.copy(P).addScaledVector(N, 0.040);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), N);
  g.scale.setScalar(1.18);
  /* 真月牙：两条圆弧围成的「两尖中间宽」的闭合形。
     用 TorusGeometry 截一段永远是等粗的钩子，看着像字母 C 或 e，
     月牙的辨识度全在「尖」上 */
  const R = 0.096, r = 0.086, dx = 0.042;
  const mShape = new THREE.Shape();
  mShape.absarc(0, 0, R, Math.PI * 0.34, Math.PI * 1.66, false);
  mShape.absarc(dx, 0, r, Math.PI * 1.66, Math.PI * 0.34, true);
  const m = new THREE.Mesh(
    new THREE.ExtrudeGeometry(mShape, { depth: 0.020, bevelEnabled: false, curveSegments: 40 }),
    M.accent
  );
  m.rotation.z = -0.42;
  m.position.z = 0.006;
  m.castShadow = true;
  g.add(m);
  const s = new THREE.Mesh(new THREE.CircleGeometry(0.014, 4), M.chrome);
  s.position.set(0.058, 0.062, 0.016);
  s.rotation.z = 0.4;
  g.add(s);
  g.visible = false;
  return g;
})();

/* =========================================================================
   万圣节 · 南瓜灯使
   头盔不是「罩子」：后包壳 + 前顶盖是两片独立的壳，开口处压了实心包边，
   顶上再压蒂座、瓜蒂、卷须 —— 远看是瓜，近看有分件和厚度。
   ========================================================================= */
/** 壳沿：沿球面一条经线弧铺一根圆管，给零厚度的壳片做出「壳沿」的厚度
    注意 SphereGeometry 的 x = −cos(phi)·sin(theta)，phi 从 −X 起算 */
function shellEdgeTube(rx, ry, rz, phi, thetaMax, tube, mat, ribs = 0, amp = 0, thetaStart = 0) {
  const pts = [];
  for (let i = 0; i <= 26; i++) {
    const th = thetaStart + (thetaMax - thetaStart) * i / 26;
    const st = Math.sin(th), ct = Math.cos(th);
    const dx = -st * Math.cos(phi), dy = ct, dz = st * Math.sin(phi);
    const L = Math.pow(Math.pow(Math.abs(dx), HEAD_P) + Math.pow(Math.abs(dy), HEAD_P) + Math.pow(Math.abs(dz), HEAD_P), 1 / HEAD_P) || 1;
    /* 必须跟着瓜棱一起起伏，否则管子会在棱峰处浮起来、在棱谷处陷进壳里 */
    const a = Math.atan2(dz, dx) - Math.PI / 2;
    const k = ribs ? 1 + amp * Math.cos(ribs * a) : 1;
    pts.push(new THREE.Vector3(dx / L * rx * k, dy / L * ry, dz / L * rz * k));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, tube, 10, false), mat);
  m.castShadow = true;
  return m;
}

/** 纬线弧：沿固定 theta 的一圈（或一段）铺管，用来封壳片的水平切边
    phiLen 给满 2π 时自动闭合成整圈 */
function shellRingTube(rx, ry, rz, theta, phiStart, phiLen, tube, mat, ribs = 0, amp = 0, seg = 108) {
  const full = phiLen >= Math.PI * 2 - 1e-6;
  const n = full ? seg : seg + 1;
  const pts = [];
  const st = Math.sin(theta), ct = Math.cos(theta);
  for (let i = 0; i < n; i++) {
    const phi = phiStart + phiLen * i / seg;
    const dx = -st * Math.cos(phi), dy = ct, dz = st * Math.sin(phi);
    const L = Math.pow(Math.pow(Math.abs(dx), HEAD_P) + Math.pow(Math.abs(dy), HEAD_P) + Math.pow(Math.abs(dz), HEAD_P), 1 / HEAD_P) || 1;
    const a = Math.atan2(dz, dx) - Math.PI / 2;
    const k = ribs ? 1 + amp * Math.cos(ribs * a) : 1;
    pts.push(new THREE.Vector3(dx / L * rx * k, dy / L * ry, dz / L * rz * k));
  }
  const curve = new THREE.CatmullRomCurve3(pts, full, 'catmullrom', 0.4);
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, full ? 132 : 96, tube, 10, full), mat);
  m.castShadow = true;
  return m;
}

/** 瓜棱径向调制。
    早先用的是 2·|cos(ribs·a/2)|^0.72 − 1（峰宽谷窄，最像真南瓜），但 |cos|^p 在过零点
    导数是无穷大 —— 网格在沟底会折起来，出现一排碎玻璃似的白刺，切口的包边管也被折出尖刺。
    改成纯余弦：导数有界（amp·ribs = 0.875 < 1，径向收缩永远追不上切向位移，不会折），
    沟稍微宽一点，但一颗光溜溜的瓜反而更像「玩具南瓜」 */
function ribCurve(a, ribs, amp) {
  return 1 + amp * Math.cos(ribs * a);
}
/** 超椭球正面高度：给定 (x,y) 求瓜面 z（未叠瓜棱） */
function pumpZ(x, y, rx, ry, rz) {
  const q = 1 - Math.pow(Math.abs(x / rx), HEAD_P) - Math.pow(Math.abs(y / ry), HEAD_P);
  return rz * Math.pow(Math.max(q, 1e-4), 1 / HEAD_P);
}

/** 叠上瓜棱：瓜棱是绕竖轴的径向缩放，只在 xz 平面里做，y 不动 */
function pumpRibK(x, z, rx, rz, ribs, amp) {
  return ribCurve(Math.atan2(z / rz, x / rx) - Math.PI / 2, ribs, amp);
}

/** 定半径倒角：把每个顶点换成一小段圆弧，半径统一。
    不用 Chaikin —— 它每轮吃掉每条边 1/4，两轮下来半个三角形都被磨圆了，
    眼尖全糊成一团，看着像「圆角饼」而不是三角眼 */
function roundPoly(pts, r, seg = 4) {
  const n = pts.length, out = [];
  const at = i => pts[((i % n) + n) % n];
  for (let i = 0; i < n; i++) {
    const P = at(i), A = at(i - 1), C = at(i + 1);
    let ax = A[0] - P[0], ay = A[1] - P[1];
    let cx = C[0] - P[0], cy = C[1] - P[1];
    const la = Math.hypot(ax, ay) || 1e-9, lc = Math.hypot(cx, cy) || 1e-9;
    ax /= la; ay /= la; cx /= lc; cy /= lc;
    const th = Math.acos(Math.max(-1, Math.min(1, ax * cx + ay * cy)));
    if (th > Math.PI - 1e-3 || th < 1e-3) { out.push([P[0], P[1]]); continue; }
    /* 切点距离；边上不够长就缩，缩完半径跟着变小（圆心距离 = 切点距离 / cos(半角)） */
    const t = Math.min(r / Math.tan(th / 2), Math.min(la, lc) * 0.45);
    const cd = t / Math.cos(th / 2);
    const bx = ax + cx, by = ay + cy, lb = Math.hypot(bx, by) || 1e-9;
    const ox = P[0] + bx / lb * cd, oy = P[1] + by / lb * cd;
    const p1x = P[0] + ax * t, p1y = P[1] + ay * t;
    const p2x = P[0] + cx * t, p2y = P[1] + cy * t;
    const a1 = Math.atan2(p1y - oy, p1x - ox);
    let da = Math.atan2(p2y - oy, p2x - ox) - a1;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    const rr = Math.hypot(p1x - ox, p1y - oy);
    for (let k = 0; k <= seg; k++) {
      const a = a1 + da * k / seg;
      out.push([ox + Math.cos(a) * rr, oy + Math.sin(a) * rr]);
    }
  }
  return out;
}

/** 沿周长等距重采样：形状一点不变（点全落在原来的折线上），只是把三角化密度拉起来，
    内壁那条喇叭才不会看出一圈棱 */
function resamplePoly(pts, n) {
  const m = pts.length, seg = [];
  let total = 0;
  for (let i = 0; i < m; i++) {
    const a = pts[i], b = pts[(i + 1) % m];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    seg.push(L); total += L;
  }
  const out = [];
  let i = 0, acc = 0;
  for (let k = 0; k < n; k++) {
    const target = total * k / n;
    while (i < m - 1 && acc + seg[i] < target) { acc += seg[i]; i++; }
    const t = seg[i] > 1e-12 ? (target - acc) / seg[i] : 0;
    const a = pts[i], b = pts[(i + 1) % m];
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

/** 一个「雕刻特征」：控制多边形 → 定半径圆角 → 稠密闭合多边形。
    同时给出有符号距离（内负外正）和「吸附到边界」；两者共用同一份点，
    所以壳上的切口、包边管、内壁、发光片四条边天然重合，不会错位露缝 */
function carveFeature(ctrl, depth, radius) {
  const poly = roundPoly(ctrl, radius, 4);
  const dense = resamplePoly(poly, 76);
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const q of poly) {
    if (q[0] < x0) x0 = q[0];
    if (q[0] > x1) x1 = q[0];
    if (q[1] < y0) y0 = q[1];
    if (q[1] > y1) y1 = q[1];
  }
  const probe = (x, y) => {
    let best = 1e18, inside = false, bx = 0, by = 0;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const ax = poly[j][0], ay = poly[j][1], cx = poly[i][0], cy = poly[i][1];
      const ex = cx - ax, ey = cy - ay;
      const L2 = ex * ex + ey * ey || 1e-12;
      let t = ((x - ax) * ex + (y - ay) * ey) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const dx = x - (ax + ex * t), dy = y - (ay + ey * t);
      const d2 = dx * dx + dy * dy;
      if (d2 < best) { best = d2; bx = ax + ex * t; by = ay + ey * t; }
      /* 射线法判内外：多边形怎么绕、是不是凸的都不影响 */
      if ((ay > y) !== (cy > y) && x < (cx - ax) * (y - ay) / (cy - ay) + ax) inside = !inside;
    }
    return [Math.sqrt(best), inside, bx, by];
  };
  const MAR = 0.16;      // bbox 外扩：外扩之外用 bbox 距离近似，省掉九成多的逐边计算
  const sd = (x, y) => {
    if (x < x0 - MAR || x > x1 + MAR || y < y0 - MAR || y > y1 + MAR) {
      const dx = Math.max(x0 - x, 0, x - x1), dy = Math.max(y0 - y, 0, y - y1);
      return Math.hypot(dx, dy);
    }
    const r = probe(x, y);
    return r[1] ? -r[0] : r[0];
  };
  const snap = (x, y) => { const r = probe(x, y); return [r[2], r[3]]; };
  return { poly, dense, sd, snap, depth };
}

/** 一整颗瓜壳：从头顶一直包到脖子根，正面按雕刻轮廓挖出眼睛和嘴。
    每个格子先拆成 4 个「角-角-中心」小三角形，再逐个按 sd=0 的等值线裁 ——
    只按格子四角判断不够：四角都在洞外、中间却在洞里的格子会被整块留下，
    边缘就长出一排梳齿 */
function pumpkinShell(rx, ry, rz, thetaMax, ribs, amp, feats, mat, segU = 288, segV = 168) {
  const p = HEAD_P, RAD = Math.PI * 2;
  const sdAll = (x, y) => {
    let m = 1e3;
    for (let i = 0; i < feats.length; i++) { const d = feats[i].sd(x, y); if (d < m) m = d; }
    return m;
  };
  const snapAll = (x, y) => {
    let m = 1e3, f = feats[0];
    for (let i = 0; i < feats.length; i++) {
      const d = Math.abs(feats[i].sd(x, y));
      if (d < m) { m = d; f = feats[i]; }
    }
    return f.snap(x, y);
  };
  /* 返回两套坐标：x0/y0/z0 是没叠瓜棱的（判据和插值都用它），x/y/z 是叠了瓜棱的（拿去渲染）。
     判据必须用没叠的那套 —— 拿叠过瓜棱的坐标算等值线，轮廓会顺着沟来回蛇形 */
  const mapV = (phi, th) => {
    const st = Math.sin(th), ct = Math.cos(th);
    const dx = -st * Math.cos(phi), dy = ct, dz = st * Math.sin(phi);
    const L = Math.pow(Math.pow(Math.abs(dx), p) + Math.pow(Math.abs(dy), p) + Math.pow(Math.abs(dz), p), 1 / p) || 1;
    const x0 = dx / L * rx, y0 = dy / L * ry, z0 = dz / L * rz;
    const k = pumpRibK(x0, z0, rx, rz, ribs, amp);
    return [x0 * k, y0, z0 * k, x0, y0, z0];
  };

  const NU = segU + 1, N = NU * (segV + 1), CN = segU * segV, TOTAL = N + CN;
  const V = [], V0 = [];
  const F = new Float32Array(TOTAL);

  const push = (arr, x, y, z, x0, y0, z0) => {
    arr.push(x, y, z); V0.push(x0, y0, z0);
    /* 背面（z0<=0）一律算洞外：雕刻只开在正面 */
    F[arr.length / 3 - 1] = z0 > 0.02 ? sdAll(x0, y0) : 1e3;
  };

  for (let j = 0; j <= segV; j++) {
    const th = thetaMax * j / segV;
    for (let i = 0; i <= segU; i++) push(V, ...mapV(RAD * i / segU, th));
  }
  /* 每格的中心点，索引接在网格点后面 */
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      push(V, ...mapV(RAD * (i + 0.5) / segU, thetaMax * (j + 0.5) / segV));
    }
  }

  const idx = [];
  const cache = new Map();
  /* 边上的交点：同一对点最多被两个小三角形共享，缓存一下省一半计算。
     线性插值只落在等值线附近，再吸到多边形边上 —— 轮廓就是多边形本身，
     吸一次就精确，切口和包边管天然重合 */
  const cutE = (k1, k2) => {
    const key = k1 < k2 ? k1 * TOTAL + k2 : k2 * TOTAL + k1;
    let v = cache.get(key);
    if (v !== undefined) return v;
    const t = (0 - F[k1]) / (F[k2] - F[k1] || 1e-9);
    const sx = V0[k1 * 3] + (V0[k2 * 3] - V0[k1 * 3]) * t;
    const sy = V0[k1 * 3 + 1] + (V0[k2 * 3 + 1] - V0[k1 * 3 + 1]) * t;
    const q = snapAll(sx, sy);
    const x = q[0], y = q[1];
    const z = pumpZ(x, y, rx, ry, rz);
    const kk = pumpRibK(x, z, rx, rz, ribs, amp);
    V.push(x * kk, y, z * kk); V0.push(x, y, z);
    v = V.length / 3 - 1;
    cache.set(key, v);
    return v;
  };
  /* 绕序按球面法线校正：切开之后三角形方向不固定，靠叉积兜住 */
  const tri = (i0, i1, i2, nx, ny, nz) => {
    const ax = V[i0 * 3], ay = V[i0 * 3 + 1], az = V[i0 * 3 + 2];
    const e1x = V[i1 * 3] - ax, e1y = V[i1 * 3 + 1] - ay, e1z = V[i1 * 3 + 2] - az;
    const e2x = V[i2 * 3] - ax, e2y = V[i2 * 3 + 1] - ay, e2z = V[i2 * 3 + 2] - az;
    const d = (e1y * e2z - e1z * e2y) * nx + (e1z * e2x - e1x * e2z) * ny + (e1x * e2y - e1y * e2x) * nz;
    if (d >= 0) idx.push(i0, i1, i2); else idx.push(i0, i2, i1);
  };
  /* 小三角形按等值线裁一刀 */
  const clipTri = (a, b, c) => {
    const nx = (V[a * 3] + V[b * 3] + V[c * 3]) / 3;
    const ny = (V[a * 3 + 1] + V[b * 3 + 1] + V[c * 3 + 1]) / 3;
    const nz = (V[a * 3 + 2] + V[b * 3 + 2] + V[c * 3 + 2]) / 3;
    const len = Math.hypot(nx, ny, nz) || 1;
    const ux = nx / len, uy = ny / len, uz = nz / len;

    const ids = [a, b, c];
    const ins = [F[a] < 0, F[b] < 0, F[c] < 0];
    const cnt = (ins[0] ? 1 : 0) + (ins[1] ? 1 : 0) + (ins[2] ? 1 : 0);
    if (cnt === 0) { tri(a, b, c, ux, uy, uz); return; }
    if (cnt === 3) return;

    if (cnt === 1) {
      const p0 = ins[0] ? 0 : ins[1] ? 1 : 2;          // 唯一的洞内角
      const p1 = (p0 + 1) % 3, p2 = (p0 + 2) % 3;
      const e1 = cutE(ids[p0], ids[p1]), e2 = cutE(ids[p2], ids[p0]);
      tri(e1, ids[p1], ids[p2], ux, uy, uz);
      tri(e1, ids[p2], e2, ux, uy, uz);
      return;
    }
    /* 两个角在洞里：只留洞外那一角 */
    const o = !ins[0] ? 0 : !ins[1] ? 1 : 2;
    const q1 = (o + 1) % 3, q2 = (o + 2) % 3;
    tri(ids[o], cutE(ids[o], ids[q1]), cutE(ids[o], ids[q2]), ux, uy, uz);
  };

  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      /* 格子四角：a → c → d → b 绕一圈 */
      const a = j * NU + i, c = (j + 1) * NU + i, d = (j + 1) * NU + i + 1, b = j * NU + i + 1;
      const m = N + j * segU + i;
      clipTri(a, c, m); clipTri(c, d, m); clipTri(d, b, m); clipTri(b, a, m);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(V, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

/** 一个雕刻洞的三件套：切口圆边 / 内壁瓜肉 / 洞底发光片。
    发光片不是一刀切平的亮片 —— 顶点色中间亮边缘暗，才像里面点了蜡烛 */
function carveHole(feat, rx, ry, rz, ribs, amp, fleshMat, glowMat) {
  const g = new THREE.Group();
  const poly = feat.dense, depth = feat.depth, n = poly.length;
  const outer = [], inner = [];
  for (let i = 0; i < n; i++) {
    const x = poly[i][0], y = poly[i][1];
    const z = pumpZ(x, y, rx, ry, rz);
    const k = pumpRibK(x, z, rx, rz, ribs, amp);
    const px = x * k, py = y, pz = z * k;
    outer.push([px, py, pz]);
    /* 内壁沿椭球法线往里退：退出来的那一点距离就是「瓜肉厚度」 */
    const nx = px / (rx * rx), ny = py / (ry * ry), nz = pz / (rz * rz);
    const L = Math.hypot(nx, ny, nz) || 1;
    inner.push([px - nx / L * depth, py - ny / L * depth, pz - nz / L * depth]);
  }

  /* ① 切口包边：贴在瓜面上的一根细管，把零厚度的切口包成圆边，
        顺手盖住壳和内壁两套三角化之间的发丝缝 */
  const curve = new THREE.CatmullRomCurve3(outer.map(q => new THREE.Vector3(q[0], q[1], q[2])), true, 'centripetal');
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, n * 2, 0.009, 8, true), fleshMat));

  /* ② 内壁：从切口外沿收到内壁。没有它，斜看能从洞里直接看到壳的背面
        （单面材质被剔除 → 漏空） */
  const sp = [], si = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, b = sp.length / 3;
    sp.push(outer[i][0], outer[i][1], outer[i][2], inner[i][0], inner[i][1], inner[i][2]);
    sp.push(outer[j][0], outer[j][1], outer[j][2], inner[j][0], inner[j][1], inner[j][2]);
    si.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  sg.setIndex(si);
  sg.computeVertexNormals();
  g.add(new THREE.Mesh(sg, fleshMat));

  /* ③ 洞底：把内壁多边形三角化，铺一张发光片 */
  const faces = THREE.ShapeUtils.triangulateShape(poly.map(q => new THREE.Vector2(q[0], q[1])), []);
  let cx = 0, cy = 0, cz = 0;
  for (const q of inner) { cx += q[0]; cy += q[1]; cz += q[2]; }
  cx /= n; cy /= n; cz /= n;
  let far = 1e-4;
  for (const q of inner) far = Math.max(far, Math.hypot(q[0] - cx, q[1] - cy, q[2] - cz));
  const gp = [], gc = [];
  /* 洞里是黄的：烛火本来就是暖黄，之前偏橘看着像「橙汁」 */
  const HOT = new THREE.Color(0xFFF27E), DIM = new THREE.Color(0xFFB016), tmp = new THREE.Color();
  for (const q of inner) {
    gp.push(q[0], q[1], q[2]);
    const d = Math.hypot(q[0] - cx, q[1] - cy, q[2] - cz) / far;
    const s = Math.min(1, Math.max(0, (d - 0.10) / 0.90));
    tmp.copy(HOT).lerp(DIM, s * s * 0.88);
    gc.push(tmp.r, tmp.g, tmp.b);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3));
  pg.setAttribute('color', new THREE.Float32BufferAttribute(gc, 3));
  pg.setIndex(faces.flat());
  g.add(new THREE.Mesh(pg, glowMat));
  return g;
}

/* 洞里那盏蜡烛：点光源放在瓜腔里，只照得到朝内的切口内壁 ——
   瓜皮的外表面法线朝外，照不到，所以不会把整颗瓜照亮 */
let pumpkinLight = null;

GEAR.head.pumpkin = (() => {
  const g = new THREE.Group(); outfitHead.add(g);
  /* 尺寸由耳罩反推：耳罩外沿半径约 0.905（x=0.90、z=±0.09）。瓜棱谷处壳的半径
     1.10 * 0.975 * (1 - 0.125) = 0.939，还剩 0.034 的余量，耳朵不会从沟里戳出来 */
  const RX = 1.100, RY = 0.795, RZ = 0.870;
  const RB = 7, AMP = 0.125;        // 瓜棱道数 / 沟的深度（余弦的斜率上限就是 amp*ribs，0.875 留了余量）
  const TB = 0.878 * Math.PI;       // 下沿：一路包到脖子根，正面看是个完整的瓜

  /* 三角眼：上宽下尖的倒三角（▽），顶边「外高内低」= \ / 的眉线 —— 凶相全靠这两点。
     正三角（△）看着像发呆，斜正三角看着像委屈，只有倒三角是凶的 */
  const EYE = [[0.230, 0.375], [0.700, 0.490], [0.395, 0.045]];

  /* 嘴：从左边裂到右边的大口子。上下沿共用同一条基准弧 mTop，下沿再减去一个鼓包；
     末端留 0.150 的厚度 —— 留少了两端收成薄翅、嘴角翘到嘴的中线以上，整张脸看着像蝙蝠。
     嘴角落在嘴的中段高度，才是「张开的口」 */
  const MW = 0.680, MTOP = -0.055, MH = 0.170, MEND = 0.150;
  const mTop = x => MTOP - 0.055 * Math.pow(Math.abs(x) / MW, 2.4);
  const mBot = x => {
    const t = Math.min(1, Math.abs(x) / MW);
    return mTop(x) - MH * Math.pow(Math.max(0, 1 - Math.pow(t, 2.4)), 0.62) - MEND;
  };
  const MOUTH = [];
  /* 上沿（左→右）：中间留一段平口，两侧各一颗朝下的牙 —— 上下牙交错才是「兽口」，
     只有下牙的话还是一张笑脸 */
  const TOP_U = [-1, -0.38, -0.28, -0.18, 0.18, 0.28, 0.38, 1];
  const TOP_DOWN = [0, 0, 0.105, 0, 0, 0.105, 0, 0];
  TOP_U.forEach((u, i) => {
    const x = u * MW;
    MOUTH.push([x, mTop(x) - TOP_DOWN[i]]);
  });
  /* 下沿（右→左）。两颗大尖牙：底边在 |x|/MW = 0.58 起、0.45 处冲到尖、0.32 处落回 */
  const TOOTH_X = [0.58, 0.45, 0.32, 0, -0.32, -0.45, -0.58, -1];
  const TOOTH_UP = [0, 0.170, 0, 0, 0, 0.170, 0, 0];
  TOOTH_X.forEach((u, i) => {
    const x = u * MW;
    MOUTH.push([x, mBot(x) + TOOTH_UP[i]]);
  });

  const feats = [
    carveFeature(EYE, 0.048, 0.042),
    carveFeature(EYE.map(q => [-q[0], q[1]]), 0.048, 0.042),
    carveFeature(MOUTH, 0.058, 0.018)
  ];

  /* 一整片瓜壳，只在正面雕掉眼睛和嘴 */
  g.add(pumpkinShell(RX, RY, RZ, TB, RB, AMP, feats, M.shell));
  feats.forEach(f => g.add(carveHole(f, RX, RY, RZ, RB, AMP, M.flesh, M.pumpkinGlow)));

  /* 腔里那盏灯：切口的瓜肉本来在阴影里发灰，点一盏黄的进去，
     洞口一圈立刻变成被烛火照亮的暖黄 —— 光「从里面出来」靠的就是这一下 */
  pumpkinLight = new THREE.PointLight(0xFFB60E, 0.55, 1.45, 2);
  pumpkinLight.position.set(0, -0.10, 0.48);
  g.add(pumpkinLight);

  /* 瓜蒂：六棱短柱从瓜顶斜着伸出来 —— 一颗瓜最快能被认出来的地方 */
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.062, 0.190, 6), M.amber);
  stem.position.set(0.086, 0.828, -0.074);
  stem.rotation.set(0.34, 0.55, 0.30);
  stem.castShadow = true;
  g.add(stem);
  /* 卷须：从蒂根甩出去的一段螺旋 */
  const tendril = new THREE.Mesh(new THREE.TorusGeometry(0.100, 0.015, 8, 32, 3.55), M.accent);
  tendril.position.set(0.180, 0.800, -0.118);
  tendril.rotation.set(0.46, 0.60, 0.92);
  tendril.castShadow = true;
  g.add(tendril);

  g.visible = false;
  window.__pk = { feats, RX, RY, RZ, RB, AMP };
  return g;
})();

/* 腰挂南瓜灯：8 棱小瓜 + 提手 + 挂绳 + 发光脸 */
GEAR.hip.lantern = (() => {
  const g = new THREE.Group();
  g.position.set(0.296, -0.186, 0.238);
  g.scale.setScalar(1.30);
  outfitSpine.add(g);

  g.add(ribBall(0.104, 0.080, 0.098, 8, 0.055, M.shell, 56));

  /* 提手（拱）+ 挂绳 + 顶部小盖 */
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.070, 0.013, 8, 26, Math.PI), M.accent);
  handle.position.y = 0.104; handle.castShadow = true;
  g.add(handle);
  add(g, new THREE.CylinderGeometry(0.011, 0.011, 0.070, 10), M.accent, [0, 0.196, 0]);
  add(g, new THREE.CylinderGeometry(0.034, 0.044, 0.036, 16), M.accent, [0, 0.082, 0]);
  /* 蒂 */
  add(g, new THREE.CylinderGeometry(0.014, 0.020, 0.042, 12), M.accent, [0, 0.114, 0], [0.16, 0, 0.14]);

  /* 发光脸：两只三角眼 + 一张锯齿嘴，压在瓜皮表面上（不是埋在里面） */
  const face = new THREE.Group();
  face.position.set(0, 0.004, 0.104);
  g.add(face);
  const eye = sg => {
    const s = new THREE.Shape();
    s.moveTo(sg * 0.006, -0.014);
    s.lineTo(sg * 0.052, -0.010);
    s.lineTo(sg * 0.028, 0.024);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.008, bevelEnabled: false });
    const m = new THREE.Mesh(geo, M.lamp);
    m.position.set(sg * 0.020, 0.020, -0.004);
    return m;
  };
  face.add(eye(-1), eye(1));
  const mouth = new THREE.Shape();
  mouth.moveTo(-0.046, 0.010);
  mouth.lineTo(-0.030, -0.008);
  mouth.lineTo(-0.014, 0.010);
  mouth.lineTo(0.002, -0.008);
  mouth.lineTo(0.018, 0.010);
  mouth.lineTo(0.034, -0.008);
  mouth.lineTo(0.048, 0.008);
  mouth.lineTo(0.046, -0.014);
  mouth.lineTo(-0.044, -0.012);
  mouth.closePath();
  const mm = new THREE.Mesh(new THREE.ExtrudeGeometry(mouth, { depth: 0.008, bevelEnabled: false }), M.lamp);
  mm.position.set(0, -0.026, -0.004);
  face.add(mm);

  g.visible = false;
  return g;
})();

/* 胸口瓜棱：上下两条横弧夹住呼吸灯，像瓜棱从胸口绕过去 */
GEAR.mark.ribs = (() => {
  const g = new THREE.Group(); outfitTorso.add(g);
  g.add(chestRibbon(k => [-0.306 + 0.612 * k, 0.214 + 0.044 * Math.sin(Math.PI * k)], 0.0125, 46, 0.0055, M.cyan));
  g.add(chestRibbon(k => [-0.276 + 0.552 * k, -0.212 - 0.040 * Math.sin(Math.PI * k)], 0.0110, 42, 0.0055, M.cyan));
  g.visible = false; return g;
})();

/* =========================================================================
   万圣节 · 夜行巫师
   帽子由「碗状帽檐 + 弯尖锥帽身 + 织带 + 檐口发光环」四件叠成，
   斗篷是黑布 + 锯齿下摆 + 橙色滚边，背面看有层次，侧面看有破败感。
   ========================================================================= */
GEAR.head.witch = (() => {
  const g = new THREE.Group();
  g.position.y = 0.545;
  g.rotation.set(0.030, 0, -0.062);
  outfitHead.add(g);

  /* 帽檐：闭合旋转体，中心高、外缘下垂并微微上卷 → 像一顶扣在头上的伞檐 */
  const brimPts = [
    [0.000, 0.062], [0.340, 0.054], [0.660, 0.022], [0.872, -0.028],
    [0.980, -0.050], [0.972, -0.078], [0.856, -0.062], [0.640, -0.012],
    [0.320, 0.012], [0.000, 0.016]
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const brim = new THREE.Mesh(new THREE.LatheGeometry(brimPts, 84), M.felt);
  brim.castShadow = true; brim.receiveShadow = true;
  g.add(brim);
  /* 檐口一圈发光细环 */
  g.add(ringArc(0.978, 0.978, 0.0075, Math.PI * 2, -0.052, M.cyan, 84));

  /* 帽身：旋转体 + 按高度的侧向偏移做出 S 形弯尖 */
  const H = 0.900;
  const conePts = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    conePts.push(new THREE.Vector2(0.010 + 0.500 * Math.pow(1 - t, 1.20), t * H));
  }
  const coneGeo = new THREE.LatheGeometry(conePts, 64);
  const cpos = coneGeo.attributes.position;
  for (let i = 0; i < cpos.count; i++) {
    const y = cpos.getY(i);
    const t = Math.max(0, Math.min(1, y / H));
    const bend = Math.pow(t, 2.4);
    cpos.setX(i, cpos.getX(i) + 0.300 * bend);
    cpos.setZ(i, cpos.getZ(i) - 0.215 * bend);
  }
  coneGeo.computeVertexNormals();
  const cone = new THREE.Mesh(coneGeo, M.felt);
  cone.position.y = 0.020;
  cone.castShadow = true;
  g.add(cone);

  /* 织带 + 正面小南瓜扣 */
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.438, 0.030, 12, 60), M.ribbon);
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.152;
  band.scale.set(1, 1, 0.92);
  band.castShadow = true;
  g.add(band);
  const buckle = ribBall(0.062, 0.048, 0.054, 8, 0.06, M.shell, 32);
  buckle.position.set(0, 0.150, 0.432);
  g.add(buckle);
  add(g, new THREE.CylinderGeometry(0.012, 0.017, 0.036, 10), M.dark, [0, 0.188, 0.432], [0.2, 0, 0.1]);

  g.visible = false;
  return g;
})();

/* 破布斗篷：锯齿下摆 + 橙色滚边 + 双肩扣 */
GEAR.back.tatter = (() => {
  const g = new THREE.Group(); outfitSpine.add(g);
  const NU = 30, NV = 26;

  const build = (mul, zOff, yOff, v0, v1, mat) => {
    const pos = [], idx = [];
    for (let j = 0; j <= NV; j++) {
      const v = v0 + (v1 - v0) * (j / NV);
      const halfW = (0.520 + 0.430 * Math.pow(v, 1.15)) * mul;
      const zBack = -0.408 - 0.150 * v + zOff;
      for (let i = 0; i <= NU; i++) {
        const u = i / NU * 2 - 1;
        /* 三角波锯齿：波谷处下摆被剪掉一块，越靠下越深 */
        const tri = 1 - Math.abs(((u * 3.0 + 9) % 1) * 2 - 1);
        const saw = 0.135 * tri * v * v * v;
        const y = 0.640 - 1.000 * v + 0.112 * v * v * u * u - 0.055 * u * u - saw + yOff;
        pos.push(u * halfW, y, zBack + 0.238 * u * u);
      }
    }
    for (let j = 0; j < NV; j++) {
      for (let i = 0; i < NU; i++) {
        const a = j * (NU + 1) + i, b = a + 1, c = a + NU + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    return m;
  };

  g.add(build(1.000, 0.000, 0.000, 0, 1, M.cloth));
  g.add(build(0.972, 0.022, 0.012, 0, 1, M.lining));
  /* 下摆滚边：只取最末一小段布，跟着锯齿走；再往后压一点，背面才看得见 */
  g.add(build(1.012, -0.010, -0.006, 0.950, 1, M.ribbon));

  /* 双肩扣：压在斗篷外侧（背面才看得见），布扣 + 小南瓜 */
  [-1, 1].forEach(sg => {
    add(g, squircle(0.124, 0.110, 0.086, 2.6, 24), M.accent, [sg * 0.452, 0.586, -0.392]);
    const b = ribBall(0.048, 0.038, 0.044, 8, 0.07, M.shell, 28);
    b.position.set(sg * 0.452, 0.586, -0.436);
    g.add(b);
  });

  g.visible = false;
  return g;
})();

/* 胸口蝙蝠：两片翼 + 身体，发光贴片 */
GEAR.mark.bat = (() => {
  const g = new THREE.Group(); outfitTorso.add(g);
  const P = new THREE.Vector3(), N = new THREE.Vector3();
  chestSurf(0, 0.252, P, N);
  g.position.copy(P);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), N);
  g.scale.setScalar(1.26);

  const wingPts = [
    [0.018, 0.014], [0.156, 0.074], [0.124, 0.014],
    [0.136, -0.032], [0.088, -0.020], [0.074, -0.066], [0.030, -0.024]
  ];
  const mk = sg => {
    const s = new THREE.Shape();
    const pts = wingPts.map(([x, y]) => [sg * x, y]);
    if (sg < 0) pts.reverse();          // 保持绕序，法线才不会翻
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.010, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003,
      bevelSegments: 1, curveSegments: 2
    });
    geo.translate(0, 0, -0.005);
    return new THREE.Mesh(geo, M.lamp);
  };
  g.add(mk(1), mk(-1));
  /* 身体 + 两只耳 */
  add(g, new THREE.CircleGeometry(0.020, 20), M.lamp, [0, -0.006, 0.006]);
  add(g, new THREE.CircleGeometry(0.014, 16), M.lamp, [0, 0.026, 0.006]);
  [-1, 1].forEach(sg => {
    const e = new THREE.Shape();
    e.moveTo(0, -0.006); e.lineTo(sg * 0.016, 0.022); e.lineTo(sg * 0.020, -0.004); e.closePath();
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(e, { depth: 0.008, bevelEnabled: false }), M.lamp);
    m.position.set(sg * 0.008, 0.038, 0.002);
    g.add(m);
  });
  g.visible = false; return g;
})();

/* --------------------------------------------------------------- 落雪 */

/* 只在「雪夜礼颂」这一套里下雪。用 Points + 一张画出来的柔光点贴图：
   不开阴影、不写深度，雪花之间才不会互相切出硬边。
   分布是「绕机身的一圈」而不是铺满全场 —— 半径 2.05 刚好包住 1.6 宽的机身，
   再大就变成整个场景在下雪，主角反而不突出 */
const SNOW = (() => {
  const N = 900, R = 2.05, H = 3.30, Y0 = 0.06;
  const pos = new Float32Array(N * 3);
  const spd = new Float32Array(N), ph = new Float32Array(N), amp = new Float32Array(N);
  const respawn = i => {
    const a = rigRandom() * Math.PI * 2, r = Math.sqrt(rigRandom()) * R;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 2] = Math.sin(a) * r * 0.85;
  };
  for (let i = 0; i < N; i++) {
    respawn(i);
    pos[i * 3 + 1] = Y0 + rigRandom() * H;
    spd[i] = 0.20 + rigRandom() * 0.44;
    ph[i] = rigRandom() * Math.PI * 2;
    amp[i] = 0.10 + rigRandom() * 0.24;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const tex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    const rg = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0.00, 'rgba(255,255,255,1)');
    rg.addColorStop(0.40, 'rgba(255,255,255,0.86)');
    rg.addColorStop(1.00, 'rgba(255,255,255,0)');
    x.fillStyle = rg; x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.088, map: tex, transparent: true, depthWrite: false,
    sizeAttenuation: true, color: 0xffffff, opacity: 0.94, toneMapped: false
  }));
  pts.frustumCulled = false;
  pts.visible = false;
  scene.add(pts);
  const initial = new Float32Array(pos);
  return {
    obj: pts,
    at(t) {
      if (!pts.visible) return;
      const p = geo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        const i3=i*3;
        p[i3+1]=Y0+((initial[i3+1]-Y0-spd[i]*t)%H+H)%H;
        p[i3]=initial[i3]+amp[i]*(Math.cos(ph[i])-Math.cos(t*1.10+ph[i]))/1.10;
        p[i3+2]=initial[i3+2]+amp[i]*.6*(Math.sin(t*.90+ph[i]*1.3)-Math.sin(ph[i]*1.3))/.90;
      }
      geo.attributes.position.needsUpdate = true;
    }
  };
})();

/* --------------------------------------------------------------- 换装 */

/** 把所有造型件先关掉 */
function hideAllGear() {
  Object.keys(GEAR).forEach(slot => {
    Object.values(GEAR[slot]).forEach(v => {
      (Array.isArray(v) ? v : [v]).forEach(o => { o.visible = false; });
    });
  });
}

/** 换装：改共享材质色 + 切造型件显隐 + 同步呼吸灯颜色（不重建任何几何） */
function applySkin(id) {
  const s = SKINS.find(k => k.id === id) || SKINS[0];
  state.skin = s.id;

  Object.keys(s.mat).forEach(k => { if (M[k] && M[k].color) M[k].color.setHex(s.mat[k]); });
  M.finger.specularColor.setHex(s.glow);
  SKIN_GLOW.setHex(s.glow);
  [M.eye, M.ring, M.cyan].forEach(m => m.color.setHex(s.glow));
  M.lamp.color.setHex(s.glow).lerp(new THREE.Color(0xffffff), 0.42);
  M.cloth.color.setHex(s.cloth);
  M.accent.color.setHex(s.accent);
  M.lining.color.setHex(s.lining);

  /* 表面语言：同一套几何，换成哑光／丝绸／羊毛，气质立刻不同。
     这是 13 套「风格」而不是「配色」的关键 —— 颜色只决定色相，料才决定流派 */
  applySurface(s.surf);

  /* 呼吸灯跟着发光色走：暗态是发光色的 42% 亮度 */
  LIGHT_HOT.setHex(s.glow);
  LIGHT_DIM.setHex(s.glow).multiplyScalar(0.42);
  updateChestLight(lightT);

  const ht = document.getElementById('hTitle');
  if (ht && s.title) ht.innerHTML = s.title[0] + '机身<br>' + s.title[1] + '表情';

  hideAllGear();
  Object.keys(s.gear).forEach(slot => {
    const v = GEAR[slot][s.gear[slot]];
    if (!v) return;
    (Array.isArray(v) ? v : [v]).forEach(o => { o.visible = true; });
  });
  /* 下雪只在雪夜礼颂里开 —— 别让圣诞的雪跟着换到别的皮肤上 */
  SNOW.obj.visible = s.id === 'santa';
  measureHeadTop();     // 帽子/壳一变高，气泡要跟着抬高
}


/* ---------------- 接触阴影 ---------------- */
function shadowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  rg.addColorStop(0.00, 'rgba(28,50,72,0.46)');
  rg.addColorStop(0.40, 'rgba(28,50,72,0.22)');
  rg.addColorStop(0.72, 'rgba(28,50,72,0.05)');
  rg.addColorStop(1.00, 'rgba(28,50,72,0)');
  g.fillStyle = rg; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const contact = new THREE.Mesh(
  new THREE.PlaneGeometry(2.0, 2.0),
  new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.78 })
);
contact.rotation.x = -Math.PI / 2;
contact.position.y = 0.004;
robot.add(contact);
J.contact = contact;

const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60),
  new THREE.ShadowMaterial({ color: 0x1b2d40, opacity: 0.15 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* =========================================================================
   动作系统 · 14 组片段
   ========================================================================= */
const V = (x, y, z) => new THREE.Vector3(x, y, z).normalize();
const DOWN = new THREE.Vector3(0, -1, 0);
const UP = new THREE.Vector3(0, 0, 1);
const _m4 = new THREE.Matrix4(), _ax = new THREE.Vector3(), _ay = new THREE.Vector3(), _az = new THREE.Vector3();

function aim(obj, dir, roll = 0) {
  obj.quaternion.setFromUnitVectors(DOWN, dir);
  if (roll) obj.rotateY(roll);
}

/** 让骨骼 local -Y 指向 dir，且 local +Z 尽量朝向 up（roll 可控） */
function aimEx(obj, dir, up = UP) {
  _ay.copy(dir).normalize().negate();
  _az.copy(up).normalize();
  _az.addScaledVector(_ay, -_az.dot(_ay));
  if (_az.lengthSq() < 1e-5) _az.set(0, 0, 1).addScaledVector(_ay, -_ay.z);
  _az.normalize();
  _ax.crossVectors(_ay, _az).normalize();
  _m4.makeBasis(_ax, _ay, _az);
  obj.quaternion.setFromRotationMatrix(_m4);
}

function setFingers(hand, curls) {
  hand.fingers.forEach((f, i) => {
    const c = curls[i] ?? 0;
    f.g1.rotation.x = -c * 0.75;   // 负号 = 朝掌心（+Z）弯
    f.g2.rotation.x = -c * 0.95;
  });
  hand.thumb.rotation.set(-0.35, 0, (hand.side ?? 1) * 1.22);
  hand.thumb2.rotation.x = -0.5;
}

/** 拇指：x 朝掌心弯，z 相对默认位的外展量 */
function setThumb(hand, o = {}) {
  const s = hand.side ?? 1;
  const z = o.up ? s * (Math.PI - 0.34) : s * 1.22 + (o.z ?? 0);
  hand.thumb.rotation.set(-(o.x ?? 0.35), o.y ?? 0, z);
  hand.thumb2.rotation.x = -(o.x2 ?? 0.5);
}

/** 手臂自然下垂时：掌心转向大腿（local +Z 指向身体内侧），拇指朝前 */
function restPalm(arm, tiltX = 0.10) {
  arm.hand.rotation.set(tiltX, -arm.side * (Math.PI / 2 + 0.20), 0);
}

/** 让骨骼在世界空间里指向 dir（忽略父级姿态） */
const _pq = new THREE.Quaternion(), _pq2 = new THREE.Quaternion();
function aimWorld(obj, dir) {
  obj.parent.getWorldQuaternion(_pq);
  _pq2.setFromUnitVectors(DOWN, dir.clone().normalize());
  obj.quaternion.copy(_pq.invert().multiply(_pq2));
}

/* ---------------- 手臂方向链 ----------------
   给「上一节指向下一节」的方向，函数自己把父子链的累积旋转换算成局部四元数。
   比「aimEx 上臂 + fore.rotation.x 掰肘」精确得多：像「手放在头后」这种
   手腕必须正好落在某个点上的动作，靠试角度是试不出来的（试出来也一碰就穿模）。 */
const _qA = new THREE.Quaternion(), _qB = new THREE.Quaternion();
const _qC = new THREE.Quaternion(), _qD = new THREE.Quaternion();

/** 把 dir 变成一个「local -Y 沿 dir、local +Z 尽量朝 up」的朝向（与 aimEx 同一套基） */
function quatDir(out, dir, up) {
  _ay.copy(dir).normalize().negate();
  _az.copy(up).normalize();
  _az.addScaledVector(_ay, -_az.dot(_ay));
  if (_az.lengthSq() < 1e-5) _az.set(0, 0, 1).addScaledVector(_ay, -_ay.z);
  _az.normalize();
  _ax.crossVectors(_ay, _az).normalize();
  _m4.makeBasis(_ax, _ay, _az);
  return out.setFromRotationMatrix(_m4);
}

/** 一条手臂的三段方向：shDir 上臂 / elDir 前臂 / handDir 手指 / palmN 掌心朝外法线 */
function armChain(a, shDir, elDir, palmN, handDir) {
  quatDir(_qA, shDir, UP);
  a.arm.quaternion.copy(_qA);
  quatDir(_qB, elDir, UP);
  _qC.copy(_qA).invert().multiply(_qB);          // 前臂相对上臂
  a.fore.quaternion.copy(_qC);
  quatDir(_qB, handDir || elDir, palmN || UP);
  _qD.copy(_qA).multiply(_qC).invert().multiply(_qB);
  a.hand.quaternion.copy(_qD);
}

/** 两骨 IK：脚可以前后放（footZ）和抬起（footY） */
function legIK2(hipY, footY, footZ = 0) {
  const h = Math.max(0.06, hipY - footY);
  const D = clamp(Math.hypot(h, footZ), 0.26, L1 + L2 - 0.004);
  const psi = Math.atan2(footZ, h);
  const A = Math.acos(clamp((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D), -1, 1));
  const B = Math.atan2((L1 / L2) * Math.sin(A), (D - L1 * Math.cos(A)) / L2);
  return { thighX: -(A + psi), shinX: B + A, footX: psi - B };
}

function stand(rootY, sy = 1) {
  const ik = legIK2(HIP_Y + rootY, ANKLE_Y / sy, 0);
  J.legL.rotation.set(ik.thighX, 0, 0); J.legR.rotation.set(ik.thighX, 0, 0);
  J.shinL.rotation.set(ik.shinX, 0, 0); J.shinR.rotation.set(ik.shinX, 0, 0);
  J.footL.rotation.set(ik.footX, 0, 0); J.footR.rotation.set(ik.footX, 0, 0);
}

function contactAt(h) {
  contact.material.opacity = 0.78 * (1 - Math.min(1, h / 0.85));
  const cs = 1 + h * 0.30;
  contact.scale.set(cs, cs, 1);
}

function resetRoot() {
  root.rotation.set(0, 0, 0);
  root.position.set(0, 0, 0);
  root.scale.set(1, 1, 1);
  /* 躺下会把影子压低、拉长，别的动作进来先归位 */
  contact.position.set(0, 0.004, 0);
  contact.material.opacity = 0.78;
}

/* ---------------- 01 自然待机 ---------------- */
/* 24s 一个大循环：模仿「站久了、慢慢挪一下」的状态。
   底层是极慢的重心左右挪动 + 呼吸（频率都取 2π/D 的整数倍，接缝天然连续），
   上面挂 4 个时间不均、幅度很小、进出极缓的小动作：
   低头 → 挪一下右脚 → 弯一下左臂 → 慢慢左右看。
   重心用了两个不成整数比的正弦叠加，避免踩出节拍感。 */
const IDLE_DUR = 24.0;

/** 时间窗内的升余弦包络：两头很慢地进出，窗外恒为 0 */
function winEnv(t, t0, t1, edge = 0.95) {
  if (t <= t0 || t >= t1) return 0;
  return Math.min(smooth(clamp((t - t0) / edge, 0, 1)), smooth(clamp((t1 - t) / edge, 0, 1)));
}

function poseIdle(t) {
  const w = TAU / IDLE_DUR;
  const sway = Math.sin(w * 3 * t) * 0.72 + Math.sin(w * 5 * t) * 0.28;   // 8s / 4.8s 叠加
  const breath = Math.sin(w * 8 * t);                                     // 3s 一次

  const gDown = winEnv(t, 2.0, 6.5, 1.10);     // 慢慢低头看一眼
  const gFootR = winEnv(t, 9.0, 12.0, 0.90);   // 挪一下右脚
  const gArmL = winEnv(t, 15.5, 18.5, 1.10);   // 左臂松松地弯一下
  const gShake = winEnv(t, 20.2, 23.6, 0.85);  // 慢慢左右看

  /* 左右看：1.85rad/s ≈ 3.4s 一个来回，正好看一眼再回正 */
  const shake = Math.sin((t - 20.2) * 1.85) * gShake;
  const lean = sway;        // >0：重心压到右脚（+X 侧）
  const leanL = gFootR;     // 抬右脚 → 重心压到左脚（−X 侧）

  resetRoot();
  root.position.x = lean * 0.016 - leanL * 0.020;
  root.position.y = breath * 0.007 - leanL * 0.004;
  root.rotation.z = -lean * 0.009 + leanL * 0.012;
  root.scale.set(1 - breath * 0.0025, 1 + breath * 0.004, 1 - breath * 0.0025);

  spine.rotation.set(
    0.012 + breath * 0.006 + gDown * 0.060 - leanL * 0.010,
    0,
    -lean * 0.020 + leanL * 0.026
  );
  head.rotation.set(
    0.030 + gDown * 0.100 - breath * 0.005,
    -0.075 + shake * 0.095,
    0.062 + lean * 0.018 - leanL * 0.016 + gDown * 0.010
  );

  /* 腿：支撑脚踩地，抬脚只是把踝关节抬一点点，脚跟先离地 */
  const hipY = HIP_Y + root.position.y;
  const ikR = legIK2(hipY, ANKLE_Y + 0.042 * gFootR, -0.012 * gFootR);
  const ikL = legIK2(hipY, ANKLE_Y, 0);
  J.legR.rotation.set(ikR.thighX, 0, 0.012);
  J.shinR.rotation.set(ikR.shinX, 0, 0);
  J.footR.rotation.set(ikR.footX - 0.16 * gFootR, 0, 0);
  J.legL.rotation.set(ikL.thighX, 0, -0.012);
  J.shinL.rotation.set(ikL.shinX, 0, 0);
  J.footL.rotation.set(ikL.footX, 0, 0);

  /* 左臂：自然下垂，弯的时候只是前臂松一下，不是刻意抬起来看 */
  aimEx(J.armL, V(-0.30 - gArmL * 0.05, -0.92 + gArmL * 0.10, 0.20 + gArmL * 0.04));
  J.foreL.rotation.set(-0.05 - gArmL * 0.58 - sway * 0.015, 0, 0.04 + gArmL * 0.07);
  restPalm(armL, 0.08 + gArmL * 0.10);
  setFingers(armL, [0.28 + gArmL * 0.12, 0.44 + gArmL * 0.08, 0.48 + gArmL * 0.06]);
  setThumb(armL, { x: 0.98 - gArmL * 0.12, z: 0.02 });

  /* 右臂 */
  aimEx(J.armR, V(0.250 + sway * 0.010, -0.955, 0.115 + breath * 0.008));
  J.foreR.rotation.set(-0.22 + sway * 0.015, 0, -0.07);
  restPalm(armR, 0.08);
  setFingers(armR, [0.55, 0.62, 0.58]);

  contactAt(0);
}

/* ---------------- 02 挥手打招呼 ---------------- */
function poseWave(t) {
  const D = 2.4;
  const u = clamp(t / D, 0, 1);
  const env = smooth(clamp(u / 0.18, 0, 1)) * (1 - smooth(clamp((u - 0.80) / 0.20, 0, 1)));
  const w = Math.sin((t - 0.30) * 10.5) * env;
  const b = Math.sin(t * 2.0);

  resetRoot();
  root.position.y = b * 0.012 * env;
  spine.rotation.set(0.01 - 0.03 * env, 0, -0.03 * env);
  head.rotation.set(0.02, -0.06, 0.09 * env + w * 0.05);
  stand(0, 1);

  aimEx(J.armR, V(0.99, 0.22, 0.18));
  J.foreR.rotation.set(0, 0, 1.00 + w * 0.24);
  J.handR.rotation.set(0, w * 0.20, w * 0.34);
  setFingers(armR, [0.18, 0.22, 0.22]);

  aimEx(J.armL, V(-0.30, -0.93, 0.16));
  J.foreL.rotation.set(-0.26, 0, 0.04);
  restPalm(armL, 0.12);
  setFingers(armL, [0.55, 0.62, 0.58]);

  contactAt(0);
}

/* ---------------- 03 双手讲解 ---------------- */
function posePresent(t) {
  const b = Math.sin(t * 1.7);
  const beat = Math.sin(t * 2.7) * 0.5 + 0.5;
  resetRoot();
  root.position.y = b * 0.008;
  spine.rotation.set(0.055 + b * 0.006, 0, 0);
  head.rotation.set(0.02, -0.03, 0.02 + b * 0.01);
  stand(b * 0.008, 1);

  aimEx(J.armL, V(-0.46, -0.56, 0.69));
  J.foreL.rotation.set(-1.05 - beat * 0.12, 0, 0.10);
  J.handL.rotation.set(-1.28, 0.10, 0);
  setFingers(armL, [0.10, 0.16, 0.16]);
  setThumb(armL, { x: 0.55, z: 0.16 });

  aimEx(J.armR, V(0.46, -0.56, 0.69));
  J.foreR.rotation.set(-1.05 - (1 - beat) * 0.12, 0, -0.10);
  J.handR.rotation.set(-1.28, -0.10, 0);
  setFingers(armR, [0.10, 0.16, 0.16]);
  setThumb(armR, { x: 0.55, z: 0.16 });

  contactAt(0);
}

/* ---------------- 04 点赞 ---------------- */
function poseThumb(t) {
  const D = 2.2;
  const u = clamp(t / D, 0, 1);
  const env = smooth(clamp(u / 0.22, 0, 1)) * (1 - smooth(clamp((u - 0.82) / 0.18, 0, 1)));
  const push = Math.sin(clamp((u - 0.30) / 0.22, 0, 1) * Math.PI) * env;
  const b = Math.sin(t * 2.2);

  resetRoot();
  root.position.y = b * 0.008;
  spine.rotation.set(0.01 - 0.05 * env, 0, -0.05 * env);
  head.rotation.set(-0.04 - 0.10 * env, -0.10, 0.05 + 0.06 * env);
  stand(0, 1);

  aimEx(J.armR, V(0.39, -0.29, 0.87));
  J.foreR.rotation.set(-0.90 - push * 0.16, 0, -0.30);
  J.handR.rotation.set(-0.10, 0.05, 0);
  setFingers(armR, [1.55, 1.62, 1.58]);
  setThumb(armR, { up: true, x: -0.12, x2: 0.05 });
  aimWorld(armR.thumb, V(0.26, 0.95, 0.14));
  armR.thumb2.rotation.x = 0;

  aimEx(J.armL, V(-0.26, -0.94, 0.20));
  J.foreL.rotation.set(-0.30, 0, 0.05);
  restPalm(armL, 0.12);
  setFingers(armL, [0.6, 0.66, 0.62]);

  contactAt(0);
}

/* ---------------- 05 思考 ---------------- */
function poseThink(t) {
  const b = Math.sin(t * 1.3);
  resetRoot();
  root.position.y = b * 0.007;
  spine.rotation.set(0.055, 0, 0.03);
  head.rotation.set(0.10 + b * 0.012, -0.16, 0.16);
  stand(b * 0.007, 1);

  aimEx(J.armL, V(-0.20, -0.23, 0.95));
  J.foreL.rotation.set(-1.50, 0.16, 0.10);
  J.handL.rotation.set(0.30, 0.20, 0.10);
  setFingers(armL, [0.85, 0.95, 0.90]);

  aimEx(J.armR, V(0.34, -0.86, 0.38));
  J.foreR.rotation.set(-0.55, 0, -0.22);
  restPalm(armR, 0.16);
  setFingers(armR, [0.7, 0.75, 0.72]);

  contactAt(0);
}

/* ---------------- 06 有灵感 ---------------- */
function poseIdea(t) {
  const D = 2.6;
  const u = clamp(t / D, 0, 1);
  const hop = Math.sin(clamp(u / 0.32, 0, 1) * Math.PI) * 0.10;
  const env = smooth(clamp(u / 0.16, 0, 1)) * (1 - smooth(clamp((u - 0.84) / 0.16, 0, 1)));
  const b = Math.sin(t * 2.0);

  resetRoot();
  root.position.y = hop;
  root.scale.set(1 - hop * 0.10, 1 + hop * 0.16, 1 - hop * 0.10);
  spine.rotation.set(-0.06 * env, 0, 0.02);
  head.rotation.set(-0.10 * env + b * 0.01, -0.06, 0.04 + 0.05 * env);
  stand(hop, 1 + hop * 0.16);

  aimEx(J.armR, V(0.82, 0.30, 0.40));
  J.foreR.rotation.set(0, 0, 1.16);
  J.handR.rotation.set(0, 0, 0.05);
  setFingers(armR, [0, 1.58, 1.64]);
  setThumb(armR, { x: 1.05, z: 0.02 });

  aimEx(J.armL, V(-0.34, -0.92, 0.20));
  J.foreL.rotation.set(-0.34, 0, 0.06);
  restPalm(armL, 0.14);
  setFingers(armL, [0.5, 0.58, 0.55]);

  contactAt(hop);
}

/* ---------------- 07 点头确认 ---------------- */
function poseNod(t) {
  const D = 1.6;
  const u = clamp(t / D, 0, 1);
  const env = smooth(clamp(u / 0.12, 0, 1)) * (1 - smooth(clamp((u - 0.86) / 0.14, 0, 1)));
  const nod = Math.sin(clamp((u - 0.16) / 0.62, 0, 1) * Math.PI * 2.2) * env;
  const b = Math.sin(t * 2.0);

  resetRoot();
  root.position.y = b * 0.006;
  spine.rotation.set(0.02, 0, 0.01);
  head.rotation.set(0.04 + nod * 0.20, -0.05, 0.03);
  stand(0, 1);

  aimEx(J.armR, V(0.40, -0.52, 0.75));
  J.foreR.rotation.set(-1.35, 0, -0.12);
  J.handR.rotation.set(-0.30, 0, 0);
  setFingers(armR, [0.15, 0.20, 0.20]);
  setThumb(armR, { x: 0.70, z: 0.04 });

  aimEx(J.armL, V(-0.26, -0.94, 0.18));
  J.foreL.rotation.set(-0.28, 0, 0.05);
  restPalm(armL, 0.12);
  setFingers(armL, [0.6, 0.66, 0.62]);

  contactAt(0);
}

/* ---------------- 08 悬浮待机 ---------------- */
function poseHover(t) {
  const b = Math.sin(t * 1.5);
  const h = 0.300 + b * 0.035;
  resetRoot();
  root.position.y = h;
  root.rotation.z = Math.sin(t * 0.9) * 0.012;
  spine.rotation.set(0.02, Math.sin(t * 0.8) * 0.03, 0.015);
  head.rotation.set(0.01, -0.06 + Math.sin(t * 0.7) * 0.04, 0.05);
  J.legL.rotation.set(-0.44 + b * 0.04, 0, 0.03);
  J.legR.rotation.set(-0.34 - b * 0.04, 0, -0.03);
  J.shinL.rotation.set(0.84 - b * 0.05, 0, 0);
  J.shinR.rotation.set(0.72 + b * 0.05, 0, 0);
  J.footL.rotation.set(0.26, 0, 0);
  J.footR.rotation.set(0.20, 0, 0);

  aimEx(J.armL, V(-0.80, -0.52, 0.30));
  J.foreL.rotation.set(-0.55, 0, 0.16);
  restPalm(armL, 0.16);
  setFingers(armL, [0.45, 0.52, 0.50]);

  aimEx(J.armR, V(0.80, -0.52, 0.30));
  J.foreR.rotation.set(-0.55, 0, -0.16);
  restPalm(armR, 0.16);
  setFingers(armR, [0.45, 0.52, 0.50]);

  contactAt(h);
}

/* ---------------- 09 惊喜发现 ---------------- */
function poseWow(t) {
  const D = 1.8;
  const u = clamp(t / D, 0, 1);
  const kick = Math.sin(clamp(u / 0.26, 0, 1) * Math.PI) * smooth(clamp(u / 0.10, 0, 1));
  const env = smooth(clamp(u / 0.10, 0, 1)) * (1 - smooth(clamp((u - 0.84) / 0.16, 0, 1)));
  const jit = Math.sin(t * 22) * 0.012 * kick;

  resetRoot();
  root.position.y = -0.02 * kick;
  root.position.z = -0.04 * kick;
  root.scale.set(1 + 0.02 * kick, 1 - 0.03 * kick, 1 + 0.02 * kick);
  spine.rotation.set(-0.16 * kick, 0, 0.02);
  head.rotation.set(-0.20 * kick + jit, -0.02, 0.03);
  stand(-0.02 * kick, 1 - 0.03 * kick);

  aimEx(J.armL, V(-0.96, 0.06, 0.28));
  J.foreL.rotation.set(0, 0, -1.02 - kick * 0.22);
  J.handL.rotation.set(0.10, 0.10, 0.24);
  setFingers(armL, [0.12, 0.18, 0.18]);

  aimEx(J.armR, V(0.96, 0.06, 0.28));
  J.foreR.rotation.set(0, 0, 1.02 + kick * 0.22);
  J.handR.rotation.set(0.10, -0.10, -0.24);
  setFingers(armR, [0.12, 0.18, 0.18]);

  contactAt(0);
}

/* ---------------- 10 转圈展示 · 绅士的转身 ----------------
   上一版是「双臂平举、匀速转一圈」，读出来是雷达扫描，不是跳舞。
   人的转身有三个东西是机器做不出来的，也是这一版全部要补的：
   ① 先屈膝下沉、反向拧一点腰（预备），转起来再升上去 —— 舞步的 down-up；
   ② 两只手不对称：一手抚胸、一手向外下方展开，才有「邀舞」的姿态；
   ③ 头先转过去，身体才跟上。跟着转的是被甩出去的陀螺，领转的才是人。 */
const SPIN_DUR = 3.9;

/* 手臂方向（身体坐标系：+Y 朝头、+Z 朝胸口、+X 朝右手边） */
const A_REST = { sh: [0.30, -0.93, 0.20], el: [0.24, -0.94, 0.16], pn: [-1, 0, 0.24], hd: [0.12, -0.97, 0.14] };
const A_BOW  = { sh: [0.368, -0.555, 0.802], el: [-0.838, 0.042, 0.541], pn: [-0.50, -0.10, -0.86], hd: [-0.30, 0.94, 0.16] };
const B_REST = { sh: [-0.30, -0.93, 0.20], el: [-0.24, -0.94, 0.16], pn: [1, 0, 0.24], hd: [-0.12, -0.97, 0.14] };
const B_OPEN = { sh: [-0.86, -0.50, 0.10], el: [-0.72, -0.42, 0.55], pn: [0.15, 0.80, 0.58], hd: [-0.80, -0.20, 0.56] };

const mixDir = (a, b, k) => V(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k));

function poseSpin(t) {
  const u = clamp(t / SPIN_DUR, 0, 1);
  const sm2 = x => x * x * x * (x * (x * 6 - 15) + 10);   // smootherstep：两端速度、加速度都为 0

  const prep = winEnv(t, 0.06, 1.12, 0.55);    // 屈膝、抚胸
  const rise = winEnv(t, 1.02, 3.04, 0.72);    // 升起来转
  const fin  = winEnv(t, 3.00, 3.86, 0.42);    // 落回、颔首收势
  const turn = winEnv(t, 0.96, 3.22, 0.55);    // 单腿支撑、另一条腿绷脚尖点地

  const spin = sm2(clamp((t - 0.86) / 2.16, 0, 1));    // 0 → 1，正好一圈
  const wind = winEnv(t, 0.14, 1.02, 0.40);            // 反向拧腰（预备）
  const bowAmt = smooth(clamp((t - 0.22) / 0.52, 0, 1)) * (1 - smooth(clamp((t - 3.02) / 0.46, 0, 1)));

  resetRoot();
  root.rotation.set(
    0,
    TAU * spin - 0.24 * wind,
    -0.030 * turn - 0.016 * prep           // 往转向里侧微微倾一点
  );
  root.position.y = -0.088 * prep + 0.034 * rise - 0.052 * fin;
  root.position.x = 0.048 * turn;

  spine.rotation.set(
    -0.050 * rise + 0.060 * prep + 0.055 * fin,   // 转的时候上身微微后仰，像被人托着
    -0.11 * prep + 0.07 * fin + 0.12 * (1 - spin) * turn,   // 拧腰：起手时胸口比胯先转
    0.055 * rise
  );
  /* 头领转：起步时先多转 0.40rad 看向要去的地方，收势时反过来落后 0.14rad，
     像回头看一眼 —— 这一正一负就是「人在转」和「东西在转」的全部差别 */
  const lead = (0.40 * (1 - spin) - 0.14 * spin) * turn;
  head.rotation.set(
    -0.03 + 0.09 * prep + 0.13 * fin,
    -0.06 + lead,
    -0.055 * turn + 0.09 * prep
  );

  const hipY = HIP_Y + root.position.y;
  /* 支撑腿：右腿，越转越直，脚跟轻轻抬起 */
  const ikR = legIK2(hipY, ANKLE_Y, 0);
  J.legR.rotation.set(ikR.thighX, 0, 0.030);
  J.shinR.rotation.set(ikR.shinX, 0, 0);
  J.footR.rotation.set(ikR.footX + 0.13 * rise, 0, 0);
  /* 点地腿：左腿抬起来、向前交叠、脚尖绷直 —— 芭蕾式的收腿，转起来才轻 */
  const ikL = legIK2(hipY, ANKLE_Y + 0.086 * turn, 0.070 * turn);
  J.legL.rotation.set(ikL.thighX, 0, -0.105 * turn);
  J.shinL.rotation.set(ikL.shinX, 0, 0);
  J.footL.rotation.set(ikL.footX - 0.44 * turn, 0, 0);

  armChain(armR,
    mixDir(A_REST.sh, A_BOW.sh, bowAmt),
    mixDir(A_REST.el, A_BOW.el, bowAmt),
    mixDir(A_REST.pn, A_BOW.pn, bowAmt),
    mixDir(A_REST.hd, A_BOW.hd, bowAmt));
  setFingers(armR, [0.30 + 0.16 * bowAmt, 0.42 + 0.10 * bowAmt, 0.40 + 0.10 * bowAmt]);
  setThumb(armR, { x: 0.55, z: 0.06 });

  armChain(armL,
    mixDir(B_REST.sh, B_OPEN.sh, bowAmt),
    mixDir(B_REST.el, B_OPEN.el, bowAmt),
    mixDir(B_REST.pn, B_OPEN.pn, bowAmt),
    mixDir(B_REST.hd, B_OPEN.hd, bowAmt));
  setFingers(armL, [0.62 - 0.50 * bowAmt, 0.70 - 0.56 * bowAmt, 0.66 - 0.52 * bowAmt]);
  setThumb(armL, { x: 0.60 - 0.35 * bowAmt, z: 0.02 });

  contactAt(0);
}

/* ---------------- 11 行走 ---------------- */
const WALK_DUR = 1.15;
function poseWalk(t) {
  const p = (t / WALK_DUR) % 1;
  const bob = -0.055 + 0.045 * Math.abs(Math.sin(Math.PI * p * 2));
  const sway = Math.sin(TAU * p);

  resetRoot();
  root.position.set(0.030 * sway, bob, 0);
  spine.rotation.set(0.085, -0.13 * sway, 0.030 * sway);
  head.rotation.set(-0.02 - 0.03 * Math.abs(Math.sin(Math.PI * p * 2)), -0.09 * sway, 0.02 * sway);

  for (let i = 0; i < 2; i++) {
    const ph = (p + i * 0.5) % 1;
    const leg = i === 0 ? J.legL : J.legR;
    const shin = i === 0 ? J.shinL : J.shinR;
    const foot = i === 0 ? J.footL : J.footR;
    let fz, fy, pitch;
    if (ph < 0.55) {
      const q = ph / 0.55;
      fz = lerp(0.200, -0.200, q);
      fy = 0;
      pitch = 0.20 - 0.55 * smooth(clamp((q - 0.55) / 0.45, 0, 1));
    } else {
      const q = (ph - 0.55) / 0.45;
      fz = lerp(-0.200, 0.200, smooth(q));
      fy = Math.sin(Math.PI * q) * 0.165;
      pitch = -0.26 * Math.sin(Math.PI * q);
    }
    const ik = legIK2(HIP_Y + bob, ANKLE_Y + fy, fz);
    leg.rotation.set(ik.thighX, 0, 0);
    shin.rotation.set(ik.shinX, 0, 0);
    foot.rotation.set(ik.footX + pitch, 0, 0);
  }

  const cs = Math.cos(TAU * p);
  aimEx(J.armL, V(-0.18, -0.94, -0.44 * cs));
  J.foreL.rotation.set(-0.32 - 0.22 * cs, 0, 0.05);
  restPalm(armL, 0.12);
  setFingers(armL, [0.62, 0.70, 0.66]);

  aimEx(J.armR, V(0.18, -0.94, 0.44 * cs));
  J.foreR.rotation.set(-0.32 + 0.22 * cs, 0, -0.05);
  restPalm(armR, 0.12);
  setFingers(armR, [0.62, 0.70, 0.66]);

  contactAt(0);
}

/* ---------------- 12 起跳 · 落地 ---------------- */
const REST = {
  rootY: 0, spineX: 0, headX: 0, thighX: 0, shinX: 0, footX: 0,
  armX: 0, armZ: 0.12, foreX: 0, sy: 1, sxz: 1, air: 0
};
const JUMP = [
  { t: 0.00, p: { ...REST } },
  { t: 0.28, p: { rootY: -0.06, spineX: 0.05, headX: 0.04, armX: 0.16, armZ: 0.14, foreX: 0.12, sy: 0.995, sxz: 1.005, air: 0 } },
  { t: 0.55, p: { rootY: -0.24, spineX: 0.16, headX: 0.13, armX: 0.62, armZ: 0.30, foreX: 0.46, sy: 0.94, sxz: 1.06, air: 0 } },
  { t: 0.72, p: { rootY: 0.10, spineX: -0.05, headX: -0.10, thighX: -0.05, shinX: 0.02, footX: 0.34, armX: -1.90, armZ: 0.34, foreX: -0.25, sy: 1.07, sxz: 0.95, air: 0.55 } },
  { t: 0.95, p: { rootY: 0.52, spineX: 0.03, headX: -0.02, thighX: -0.95, shinX: 1.50, footX: -0.28, armX: -2.35, armZ: 0.45, foreX: -0.30, sy: 1.00, sxz: 1.00, air: 1 } },
  { t: 1.22, p: { rootY: 0.32, spineX: 0.06, headX: 0.06, thighX: -0.32, shinX: 0.62, footX: -0.16, armX: -1.05, armZ: 0.62, foreX: -0.05, sy: 1.02, sxz: 0.99, air: 1 } },
  { t: 1.42, p: { rootY: -0.05, spineX: 0.10, headX: 0.10, thighX: -0.34, shinX: 0.64, footX: -0.30, armX: -0.30, armZ: 0.70, foreX: 0.10, sy: 0.99, sxz: 1.01, air: 0.18 } },
  { t: 1.58, p: { rootY: -0.30, spineX: 0.20, headX: 0.18, armX: 0.30, armZ: 0.85, foreX: 0.55, sy: 0.92, sxz: 1.08, air: 0 } },
  { t: 1.82, p: { rootY: 0.03, spineX: -0.02, headX: -0.04, armX: -0.08, armZ: 0.22, foreX: 0.02, sy: 1.025, sxz: 0.985, air: 0 } },
  { t: 2.10, p: { ...REST } }
];
const JUMP_DUR = 2.10;
JUMP.forEach(k => { k.p = { ...REST, ...k.p }; });

function samplePose(t) {
  t = ((t % JUMP_DUR) + JUMP_DUR) % JUMP_DUR;
  let i = 0;
  while (i < JUMP.length - 2 && t > JUMP[i + 1].t) i++;
  const a = JUMP[i], b = JUMP[i + 1];
  const u = smooth(clamp((t - a.t) / (b.t - a.t), 0, 1));
  const out = {};
  for (const k in a.p) out[k] = lerp(a.p[k], b.p[k], u);
  return out;
}

function poseJump(t) {
  const p = samplePose(t);
  resetRoot();
  root.position.y = p.rootY;
  root.scale.set(p.sxz, p.sy, p.sxz);
  spine.rotation.set(p.spineX, 0, 0);
  head.rotation.set(p.headX, 0, 0);

  const ik = legIK2(HIP_Y + p.rootY, ANKLE_Y / p.sy, 0);
  const air = p.air || 0;
  const th = lerp(ik.thighX, p.thighX, air);
  const sh = lerp(ik.shinX, p.shinX, air);
  const ft = lerp(ik.footX, p.footX, air);
  J.legL.rotation.set(th, 0, 0); J.legR.rotation.set(th, 0, 0);
  J.shinL.rotation.set(sh, 0, 0); J.shinR.rotation.set(sh, 0, 0);
  J.footL.rotation.set(ft, 0, 0); J.footR.rotation.set(ft, 0, 0);

  [armL, armR].forEach((a, i) => {
    const s = i === 0 ? -1 : 1;
    a.arm.quaternion.identity();
    a.arm.rotation.set(p.armX, 0, s * p.armZ);
    a.fore.rotation.set(p.foreX, 0, 0);
    a.hand.rotation.set(0.1, -s * (Math.PI / 2 + 0.20), 0);
    setFingers(a, [0.9, 0.95, 0.9]);
  });

  contactAt(Math.max(0, p.rootY));
}

/* ---------------- 14 躺下 · 双手放头下 · 看天 ----------------
   场景里没有可见地面（ground 只是一块接影子的平面），所以「躺下」全靠姿态和影子讲。
   枢轴必须放在髋部、不能放在脚底 —— 绕脚底转像一根被伐倒的树，
   绕髋部转才是「先坐下去、再仰倒」。
   另外：这个机器人的头比肩膀还宽、手臂只有 0.5 长，手其实**够不到后脑勺**。
   所以手落在头的侧后方（耳下腮边），靠「肘往外撑 + 手指向后兜」骗出「双手垫在头下」的剪影。 */
const LIE_DUR = 13.2;
const _qLie = new THREE.Quaternion();
const LIE_R = { sh: [0.721, 0.541, -0.449], el: [-0.831, 0.140, -0.543], pn: [-0.69, 0.66, 0.31], hd: [-0.50, -0.20, -0.84] };
const LIE_L = { sh: [-0.721, 0.541, -0.449], el: [0.831, 0.140, -0.543], pn: [0.69, 0.66, 0.31], hd: [0.50, -0.20, -0.84] };

function poseLie(t) {
  resetRoot();
  const inK  = smooth(clamp((t - 0.58) / 1.58, 0, 1));
  const outK = smooth(clamp((t - 10.25) / 1.72, 0, 1));
  const k    = inK * (1 - outK);

  /* 手放到头后：比身体晚半拍，躺稳了才抬；起身前先收回来 */
  const ak = smooth(clamp((t - 1.38) / 0.86, 0, 1)) * (1 - smooth(clamp((t - 9.15) / 0.78, 0, 1)));

  const br = Math.sin(t * 1.45);                       // 呼吸
  const look = Math.sin(t * 0.40) * 0.24 + Math.sin(t * 0.157) * 0.10;   // 慢慢左右看云
  const tap = Math.max(0, Math.sin(t * 2.4)) * k;      // 手指轻轻敲地

  /* ---- 整体：绕髋部仰倒 ---- */
  const ang = -Math.PI / 2 * k;
  _qLie.setFromAxisAngle(_axLie, ang);
  root.quaternion.copy(_qLie);
  const cy = Math.cos(ang), sy = Math.sin(ang);
  root.position.set(
    0,
    HIP_Y * (1 - cy) - 0.345 * k + 0.022 * Math.sin(Math.PI * clamp((t - 2.10) / 0.60, 0, 1)),
    -HIP_Y * sy
  );

  spine.rotation.set(0.030 * k + br * 0.008 * k, 0, 0.020 * k);
  head.rotation.set(
    -0.18 * k - br * 0.010 * k,          // 头往后仰，眼睛对着天
    -0.06 + look * k,
    0.030 * k
  );

  /* ---- 腿：站着是 IK 站姿，躺下是「腿伸出去、膝盖松一点、脚尖朝天」 ---- */
  const st = legIK2(HIP_Y, ANKLE_Y, 0);
  const ly = legIK2(0.46, 0, -0.12);
  const thighX = lerp(st.thighX, ly.thighX, k);
  const shinX = lerp(st.shinX, ly.shinX, k);
  /* 脚掌要一直贴地：脚的总旋转得跟着身体转 k·90°，再减一点让脚尖松下来 */
  const footX = k * Math.PI / 2 - thighX - shinX - 0.16 * k;
  const bob = Math.sin(t * 0.92) * 0.040 * k;
  /* 两条腿向外岔开一点：躺着的时候并拢的腿在俯视下会糊成一坨 */
  J.legR.rotation.set(thighX, 0, -0.022 + 0.250 * k);
  J.shinR.rotation.set(shinX + 0.07 * k, 0, 0);
  J.footR.rotation.set(footX - 0.07 * k, 0, 0);
  J.legL.rotation.set(thighX - bob, 0, 0.030 - 0.250 * k);
  J.shinL.rotation.set(shinX + bob * 1.2, 0, 0);
  J.footL.rotation.set(footX - bob * 0.7, 0, 0);

  /* ---- 手臂 ---- */
  armChain(armR,
    mixDir(A_REST.sh, LIE_R.sh, ak), mixDir(A_REST.el, LIE_R.el, ak),
    mixDir(A_REST.pn, LIE_R.pn, ak), mixDir(A_REST.hd, LIE_R.hd, ak));
  setFingers(armR, [0.50 + 0.30 * tap * ak, 0.60 + 0.28 * tap * ak, 0.56 + 0.26 * tap * ak]);
  setThumb(armR, { x: 0.50, z: 0.04 });

  armChain(armL,
    mixDir(B_REST.sh, LIE_L.sh, ak), mixDir(B_REST.el, LIE_L.el, ak),
    mixDir(B_REST.pn, LIE_L.pn, ak), mixDir(B_REST.hd, LIE_L.hd, ak));
  setFingers(armL, [0.52, 0.62, 0.58]);
  setThumb(armL, { x: 0.50, z: 0.04 });

  /* ---- 影子：躺下时是一团拉长的椭圆，而且要跟着往下沉，
         不然那块半透明平面会切在脑袋上 ---- */
  contactAt(0);
  contact.material.opacity = 0.78 - 0.24 * k;
  contact.position.set(0, 0.004 - 0.62 * k, -0.55 * k);
  contact.scale.set(1 + 0.10 * k, 1 + 0.60 * k, 1);
}
const _axLie = new THREE.Vector3(1, 0, 0);

/* =========================================================================
   变装特效（全程序化，无外部贴图）
   光点螺旋聚能 → 地面光环收束 → 爆闪冲击波 + 光柱 → 换装 → 余波消散
   所有量都是「片段内时间 t」的纯函数，拖时间轴也能正确回放
   ========================================================================= */
function dotTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  rg.addColorStop(0.00, 'rgba(255,255,255,1)');
  rg.addColorStop(0.52, 'rgba(255,255,255,1)');
  rg.addColorStop(0.78, 'rgba(255,255,255,0.42)');
  rg.addColorStop(1.00, 'rgba(255,255,255,0)');
  g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function ringTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  rg.addColorStop(0.00, 'rgba(255,255,255,0)');
  rg.addColorStop(0.44, 'rgba(255,255,255,0)');
  rg.addColorStop(0.62, 'rgba(255,255,255,0.30)');
  rg.addColorStop(0.76, 'rgba(255,255,255,1)');
  rg.addColorStop(0.88, 'rgba(255,255,255,0.55)');
  rg.addColorStop(1.00, 'rgba(255,255,255,0)');
  g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function beamTex() {
  const c = document.createElement('canvas'); c.width = 8; c.height = 128;
  const g = c.getContext('2d');
  const lg = g.createLinearGradient(0, 128, 0, 0);      // 柱底 → 柱顶
  lg.addColorStop(0.00, 'rgba(255,255,255,0.92)');
  lg.addColorStop(0.30, 'rgba(255,255,255,0.40)');
  lg.addColorStop(0.70, 'rgba(255,255,255,0.09)');
  lg.addColorStop(1.00, 'rgba(255,255,255,0)');
  g.fillStyle = lg; g.fillRect(0, 0, 8, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const FX_TEX = { dot: dotTex(), ring: ringTex(), beam: beamTex() };
const flashEl = {style:{opacity:'0',background:''}};
const morphFX = new THREE.Group();
morphFX.visible = false;
scene.add(morphFX);

/* --- 光点：前 168 颗负责聚能螺旋，后 72 颗留给爆发 --- */
const SPARK_N = 320;
const sparks = [];
for (let i = 0; i < SPARK_N; i++) {
  sparks.push({
    a: rigRandom() * TAU,
    r: 0.55 + rigRandom() * 0.35,
    y0: rigRandom() * 0.16,
    h: 1.05 + rigRandom() * 1.35,
    sw: (rigRandom() - 0.5) * 2.0,
    ph: rigRandom(),
    burst: i >= 240
  });
}
const sparkGeo = new THREE.BufferGeometry();
sparkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPARK_N * 3), 3));
/* 颜色用 4 分量：additive 在浅色背景上等于看不见，所以走正常混合，靠顶点 alpha 做逐点淡出 */
sparkGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(SPARK_N * 4), 4));
const sparkMat = new THREE.PointsMaterial({
  size: 0.125, map: FX_TEX.dot, transparent: true, depthWrite: false,
  blending: THREE.NormalBlending, vertexColors: true, sizeAttenuation: true, toneMapped: false
});
const sparkPts = new THREE.Points(sparkGeo, sparkMat);
sparkPts.frustumCulled = false;
morphFX.add(sparkPts);

/* --- 地面光环 ×3：0 号常驻聚能，1/2 号是爆发的冲击波 --- */
const fxRings = [];
for (let i = 0; i < 3; i++) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
    map: FX_TEX.ring, transparent: true, depthWrite: false,
    blending: THREE.NormalBlending, toneMapped: false, opacity: 0
  }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.010 + i * 0.003;
  m.visible = false;
  morphFX.add(m); fxRings.push(m);
}

/* --- 光柱 --- */
const beamMat = new THREE.MeshBasicMaterial({
  map: FX_TEX.beam, transparent: true, depthWrite: false, side: THREE.DoubleSide,
  blending: THREE.NormalBlending, toneMapped: false, opacity: 0
});
const fxBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.60, 2.90, 40, 1, true), beamMat);
fxBeam.position.y = 1.45;
fxBeam.visible = false;
morphFX.add(fxBeam);

const FX_COL = new THREE.Color(0xffa733);
const FX_WHITE = new THREE.Color(0xffffff);
const _fxc = new THREE.Color();

/** THREE.Color（线性）→ css rgba，走 getHexString 拿回 sRGB，避免整体偏暗 */
function cssRGBA(c, a) {
  const h = c.getHexString();
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

function updateMorphFX(t) {
  const swap = MORPH_SWAP;

  /* 光点 */
  const pos = sparkGeo.attributes.position.array;
  const col = sparkGeo.attributes.color.array;
  const fadeAll = 1 - smooth(clamp((t - (swap + 0.55)) / 0.55, 0, 1));

  for (let i = 0; i < SPARK_N; i++) {
    const s = sparks[i];
    let x = 0, y = -9, z = 0, a = 0;
    if (!s.burst) {
      /* 聚能：贴着身体外面螺旋往上抽，循环滚动 */
      const cyc = 0.95;
      const raw = t - 0.28 - s.ph * 0.62;
      if (raw > 0) {
        const k = (raw % cyc) / cyc;
        const ang = s.a + s.sw * k * 2.2;
        const rad = s.r * (1.34 - 0.98 * k);
        x = Math.cos(ang) * rad;
        z = Math.sin(ang) * rad;
        y = 0.02 + s.y0 + s.h * Math.pow(k, 0.8);
        /* 外侧要亮、收进身体前才淡出（用 sin 的话刚出现时最暗，全被埋没） */
        a = Math.min(1, k * 6) * (1 - smooth(clamp((k - 0.60) / 0.40, 0, 1))) * fadeAll;
      }
    } else {
      /* 爆发：从身体里炸开、越过顶点再落下 */
      const k = clamp((t - swap) / 0.85, 0, 1);
      if (k > 0 && k < 1) {
        const e = smooth(k);
        const ang = s.a + s.sw * 0.5;
        const rad = 0.10 + s.r * 2.6 * e;
        x = Math.cos(ang) * rad;
        z = Math.sin(ang) * rad;
        y = 0.30 + s.y0 + s.h * 0.80 * e - 1.40 * k * k;
        a = Math.pow(1 - k, 1.8);
      }
    }
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    col[i * 4] = FX_COL.r; col[i * 4 + 1] = FX_COL.g; col[i * 4 + 2] = FX_COL.b;
    col[i * 4 + 3] = Math.min(1, a * 1.15);
  }
  sparkGeo.attributes.position.needsUpdate = true;
  sparkGeo.attributes.color.needsUpdate = true;

  /* 聚能环：随蓄力慢慢收紧、轻微呼吸 */
  /* 蓄力包络：0.4s 起亮、1.1s 满，爆闪瞬间被切断（不能用 winEnv，它会在结尾提前 0.6s 就衰减） */
  const charge = smooth(clamp((t - 0.40) / 0.70, 0, 1)) *
                 (1 - smooth(clamp((t - (swap - 0.02)) / 0.10, 0, 1)));
  fxRings[0].visible = charge > 0.01;
  if (charge > 0.01) {
    const rs = (1.55 - 0.55 * charge + 0.045 * Math.sin(t * 9.5)) * 2;
    fxRings[0].scale.setScalar(rs);
    fxRings[0].material.opacity = 0.85 * charge;
    fxRings[0].material.color.copy(FX_COL);
  }
  /* 冲击波：两圈错开 0.11s 往外推 */
  for (let i = 1; i < 3; i++) {
    const k = clamp((t - swap - (i - 1) * 0.11) / 0.62, 0, 1);
    const on = k > 0 && k < 1;
    fxRings[i].visible = on;
    if (on) {
      const e = 1 - Math.pow(1 - k, 2.2);
      fxRings[i].scale.setScalar(0.35 + 3.4 * e);
      fxRings[i].material.opacity = (1 - k) * (1 - k) * 1.0;
      fxRings[i].material.color.copy(FX_COL).lerp(FX_WHITE, 0.22);
    }
  }

  /* 光柱：聚能期先有一层很淡的底光慢慢立起来，爆闪瞬间炸亮再收掉 */
  const flare = smooth(clamp((t - (swap - 0.26)) / 0.22, 0, 1)) *
                (1 - smooth(clamp((t - swap - 0.02) / 0.40, 0, 1)));
  const beamOp = charge * 0.15 + flare * 0.50;
  fxBeam.visible = beamOp > 0.008;
  if (fxBeam.visible) {
    beamMat.opacity = beamOp;
    beamMat.color.copy(FX_COL).lerp(FX_WHITE, 0.30 + 0.4 * flare);
    const bs = 0.72 + 0.16 * charge + 0.42 * flare;
    fxBeam.scale.set(bs, 1, bs);
  }

  /* 屏幕爆闪（DOM，压在最上层，不受 WebGL 影响） */
  const fIn = clamp((t - (swap - 0.10)) / 0.10, 0, 1);
  const fOut = 1 - smooth(clamp((t - swap) / 0.42, 0, 1));
  flashEl.style.opacity = (fIn * fOut * 0.99).toFixed(3);
}

/* ---------------- 13 万圣节变装 ---------------- */
const MORPH_DUR = 4.20;
const MORPH_SWAP = 2.12;          // 爆闪瞬间换装

const MORPH = [
  { t: 0.00, rootY:  0.000, spineX:  0.00, headX:  0.00, sy: 1.000, sxz: 1.000, armX:  0.00, armZ: 0.12, foreX: 0.00, fing: 0.35 },
  { t: 0.55, rootY: -0.065, spineX:  0.10, headX:  0.10, sy: 0.985, sxz: 1.012, armX: -0.34, armZ: 0.44, foreX: 0.62, fing: 0.55 },
  { t: 1.30, rootY: -0.130, spineX:  0.20, headX:  0.20, sy: 0.966, sxz: 1.030, armX: -0.58, armZ: 0.36, foreX: 1.16, fing: 0.78 },
  { t: 1.95, rootY: -0.190, spineX:  0.27, headX:  0.27, sy: 0.940, sxz: 1.052, armX: -0.66, armZ: 0.32, foreX: 1.32, fing: 0.90 },
  { t: 2.12, rootY: -0.205, spineX:  0.29, headX:  0.29, sy: 0.934, sxz: 1.056, armX: -0.70, armZ: 0.30, foreX: 1.36, fing: 0.92 },
  { t: 2.30, rootY:  0.235, spineX: -0.17, headX: -0.26, sy: 1.078, sxz: 0.952, armX: -2.32, armZ: 0.52, foreX: -0.34, fing: 0.08 },
  { t: 2.50, rootY:  0.175, spineX: -0.07, headX: -0.12, sy: 1.034, sxz: 0.982, armX: -2.06, armZ: 0.60, foreX: -0.22, fing: 0.14 },
  { t: 2.74, rootY: -0.115, spineX:  0.15, headX:  0.11, sy: 0.952, sxz: 1.042, armX: -0.58, armZ: 0.74, foreX: 0.58, fing: 0.46 },
  { t: 2.98, rootY:  0.028, spineX: -0.02, headX: -0.03, sy: 1.016, sxz: 0.990, armX: -0.24, armZ: 0.48, foreX: 0.26, fing: 0.34 },
  { t: 3.42, rootY: -0.008, spineX:  0.02, headX: -0.02, sy: 1.000, sxz: 1.000, armX: -0.16, armZ: 0.66, foreX: 0.86, fing: 0.28 },
  { t: 4.20, rootY:  0.000, spineX:  0.00, headX:  0.00, sy: 1.000, sxz: 1.000, armX: -0.04, armZ: 0.22, foreX: 0.14, fing: 0.30 }
];

function sampleMorph(t) {
  t = clamp(t, 0, MORPH_DUR);
  let i = 0;
  while (i < MORPH.length - 2 && t > MORPH[i + 1].t) i++;
  const a = MORPH[i], b = MORPH[i + 1];
  const u = smooth(clamp((t - a.t) / (b.t - a.t), 0, 1));
  const out = {};
  for (const k in a) if (k !== 't') out[k] = lerp(a[k], b[k], u);
  return out;
}

/* 变装阶梯：按顺序一套一套往下变，末格回到第一格。
   以后加第三套万圣节造型，只往数组里塞 id 就行，判断逻辑不用改 */
const MORPH_LADDER = ['pumpkin', 'witch'];

const morph = { target: 'pumpkin', swapped: false, pending: false, queued: false };

/** 下一次该变哪套：正在变装、还没落地时按「上一次选的目标」往下推一格
    —— 否则在聚能阶段连点两下会算出同一个目标，看起来像没反应 */
function nextMorphTarget() {
  const base = morph.pending ? morph.target : state.skin;
  const i = MORPH_LADDER.indexOf(base);
  return i >= 0 ? MORPH_LADDER[(i + 1) % MORPH_LADDER.length] : MORPH_LADDER[0];
}

/** 变装 chip 的提示：下一次会变成谁 / 已经排队 */
function morphHint() {
  const b = document.querySelector('#actRow [data-act="morph"]');
  if (!b) return;
  const nx = SKINS.find(s => s.id === nextMorphTarget());
  b.title = '万圣节变装 · ' + MORPH_DUR.toFixed(1) + 's · 单次' +
            ' · 下一次 → ' + (nx ? nx.n : '') + (morph.queued ? '（已排队）' : '');
  b.classList.toggle('queued', morph.queued);
}

function startMorph() {
  morph.target = nextMorphTarget();
  morph.swapped = false;
  morph.pending = true;
  morph.queued = false;
  const s = SKINS.find(k => k.id === morph.target);
  FX_COL.setHex(s ? s.glow : 0xffa733);
  /* 背景本来就是白的，所以爆闪的核心必须做成「纯白不透明」——
     那一瞬间角色直接被白屏吃掉，再出现时已经是新造型，比叠彩色更像闪 */
  flashEl.style.background =
    'radial-gradient(circle at 50% 46%, rgba(255,255,255,1) 0%, rgba(255,255,255,.97) 24%, ' +
    cssRGBA(FX_COL, 0.80) + ' 42%, ' + cssRGBA(FX_COL, 0.26) + ' 60%, ' + cssRGBA(FX_COL, 0) + ' 78%)';
  morphFX.visible = true;
  bubbleShut();                 // 聚能时先把话收掉，别挡住光效
  morphHint();
}

function poseMorph(t) {
  const p = sampleMorph(t);
  const shake = Math.sin(t * 41.0) * 0.0065 * winEnv(t, 0.95, 2.12, 0.30);

  resetRoot();
  root.position.set(shake, p.rootY, 0);
  root.scale.set(p.sxz, p.sy, p.sxz);
  spine.rotation.set(p.spineX, shake * 2.4, shake * 1.8);
  head.rotation.set(p.headX, shake * 3.2, shake * 1.4);

  const ik = legIK2(HIP_Y + p.rootY, ANKLE_Y / p.sy, 0);
  J.legL.rotation.set(ik.thighX, 0, 0); J.legR.rotation.set(ik.thighX, 0, 0);
  J.shinL.rotation.set(ik.shinX, 0, 0); J.shinR.rotation.set(ik.shinX, 0, 0);
  J.footL.rotation.set(ik.footX, 0, 0); J.footR.rotation.set(ik.footX, 0, 0);

  [armL, armR].forEach((a, i) => {
    const s = i === 0 ? -1 : 1;
    a.arm.quaternion.identity();
    a.arm.rotation.set(p.armX, 0, s * p.armZ);
    a.fore.rotation.set(p.foreX, 0, 0);
    a.hand.rotation.set(0.10, -s * (Math.PI / 2 + 0.20), 0);
    setFingers(a, [p.fing, p.fing * 1.04, p.fing * 0.98]);
  });

  contactAt(Math.max(0, p.rootY));

  updateMorphFX(t);
}

/* =========================================================================
   头顶对话框：跟着头部投影走，时不时说一句
   文案全部指向「关注 / 收藏 / 转发 / 评论」，四种动作轮着来，别连着劝同一件事
   ========================================================================= */
const bubbleEl = document.getElementById('bubble');
const bubbleTxt = document.getElementById('bubbleTxt');

const TALK = {
  intro: [
    '嗨，我是账号小助手，点个关注呗',
    '关注我，我天天换造型给你看'
  ],
  /* 待机时随机说，每条都带一个动作 */
  idle: [
    '点个赞吧，我给你表演了变装',
    '关注我，明天还有新造型',
    '别划走，关注一下再走嘛',
    '收藏一下，下次想找我就方便了',
    '这套造型值得收藏，你说呢',
    '先收藏，回头慢慢看',
    '转发给你那个也爱折腾的朋友',
    '这么可爱的机器人，不分享一下',
    '转发一下，我就能被更多人看见了',
    '评论区告诉我，下一套变什么',
    '留个评论，我照着你的想法变',
    '我知道你在看，评论一个字也行',
    '练了四秒的变装，就等你一个赞',
    '站着不动也挺累，点个赞鼓励下',
    '走到你面前了，点个关注再走'
  ],
  /* 变装落地那一刻 */
  morph: {
    pumpkin: [
      '南瓜灯使上线，关注我看下一套',
      '变好了，收藏这套南瓜造型吧'
    ],
    witch: [
      '夜行巫师登场，转发给胆大的朋友',
      '这套是巫师，评论区说你想要哪套'
    ]
  },
  /* 单次动作演完 */
  clip: {
    wave:  ['挥手挥半天了，关注也挥一挥'],
    thumb: ['我给自己点了个赞，你给个关注'],
    spin:  ['转完这一圈，转发的按钮在下面'],
    jump:  ['跳这么高，值一个赞吧'],
    nod:   ['点头了，你也点个关注'],
    wow:   ['发现你了，评论告诉我你是谁'],
    idea:  ['灵光一闪：这条值得收藏'],
    lie:   ['躺着看天的时候，最适合点个关注']
  }
};

/* 洗牌袋：同一组文案一轮之内不重复 */
const _bags = {};
function pickFrom(arr, key) {
  if (!arr || !arr.length) return '';
  let b = _bags[key];
  if (!b || !b.length) {
    b = _bags[key] = arr.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = (rigRandom() * (i + 1)) | 0;
      const t = b[i]; b[i] = b[j]; b[j] = t;
    }
  }
  return b.pop();
}

/* 头顶高度：换皮肤时按「当前可见配件」重新量一次（巫师帽比南瓜壳高一截）。
   注意要量在「头部局部坐标」里——变装换装正好发生在半蹲缩放的瞬间，
   直接拿世界包围盒算会被 root 的缩放带偏，帽子就贴到脸上了 */
let headTopLocal = 0.62;
const _hv = new THREE.Vector3(), _hb = new THREE.Box3(), _ht = new THREE.Box3();
const _hm = new THREE.Matrix4(), _hi = new THREE.Matrix4();
function measureHeadTop() {
  robot.updateMatrixWorld(true);
  _hi.copy(head.matrixWorld).invert();
  _hb.makeEmpty();
  head.traverseVisible(o => {
    if (!o.geometry) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    _hm.multiplyMatrices(_hi, o.matrixWorld);
    _ht.copy(o.geometry.boundingBox).applyMatrix4(_hm);
    _hb.union(_ht);
  });
  if (!_hb.isEmpty()) headTopLocal = Math.max(0.30, _hb.max.y);
}

/** 每帧把气泡摆到头顶：投影头部顶端，再往上一小段 */
function placeBubble() {
  head.localToWorld(_hv.set(0, headTopLocal, 0));
  _hv.project(camera);
  const x = (_hv.x * 0.5 + 0.5) * innerWidth;
  const y = (-_hv.y * 0.5 + 0.5) * innerHeight;
  const w = bubbleEl.offsetWidth || 200, h = bubbleEl.offsetHeight || 40;
  const half = Math.min(w / 2, innerWidth / 2 - 14);
  const cx = Math.min(innerWidth - half - 12, Math.max(half + 12, x));
  const cy = Math.max(h + 12, y - 12);          // 太靠顶就压住不越界
  bubbleEl.style.left = Math.round(cx) + 'px';
  bubbleEl.style.top = Math.round(cy) + 'px';
}

let bubbleOn = false, bubbleHideT = 0, talkT = 0;

function bubbleSay(text, hold) {
  if (!text) return;
  bubbleTxt.textContent = text;
  placeBubble();
  bubbleEl.classList.add('on');
  bubbleOn = true;
  clearTimeout(bubbleHideT);
  const ms = hold || Math.min(6400, 2000 + text.length * 140);
  bubbleHideT = setTimeout(() => {
    bubbleEl.classList.remove('on');
    bubbleOn = false;
    talkLater();                                 // 说完歇一会儿再说下一句
  }, ms);
}

function bubbleShut() {
  clearTimeout(bubbleHideT);
  bubbleEl.classList.remove('on');
  bubbleOn = false;
  talkLater(12000);      // 被强行收掉（比如开始变装）也要把说话的节奏续上，别断档
}

/** 下一句什么时候说：默认 11~18s，太密像弹幕，太稀又没存在感 */
function talkLater(delay) {
  clearTimeout(talkT);
  talkT = setTimeout(() => {
    if (bubbleOn) return;
    if (state.clip === 'morph') { talkLater(3000); return; }   // 变装中不插嘴
    bubbleSay(pickFrom(TALK.idle, 'idle'));
  }, delay == null ? 11000 + rigRandom() * 7000 : delay);
}

/** 单次动作演完：顺着这个动作说一句，隔半拍再冒出来 */
function onClipEnd(id) {
  if (id === 'morph') return;                    // 变装自己有台词
  const arr = TALK.clip[id];
  if (!arr) return;
  setTimeout(() => {
    if (!bubbleOn && state.clip === id) bubbleSay(pickFrom(arr, 'clip:' + id), 3800);
  }, 460);
}

/* ---------------- 片段表 ---------------- */
const CLIPS = {
  idle:    { n: '01', name: '自然待机', short: '待机', dur: IDLE_DUR,   loop: true,  fn: poseIdle,    expr: 'smile',
             phases: [['01', 0, 2.0, '静立'], ['02', 2.0, 6.5, '低头'], ['03', 6.5, 12.0, '挪脚'],
                      ['04', 12.0, 18.5, '弯臂'], ['05', 18.5, 24.0, '晃头']] },
  wave:    { n: '02', name: '挥手打招呼', short: '挥手', dur: 2.4,      loop: false, fn: poseWave,    expr: 'laugh' },
  present: { n: '03', name: '双手讲解', short: '讲解', dur: 3.4,        loop: true,  fn: posePresent, expr: 'smile',
             phases: [['01', 0, 1.7, '起手'], ['02', 1.7, 3.4, '强调']] },
  thumb:   { n: '04', name: '点赞', short: '点赞', dur: 2.2,            loop: false, fn: poseThumb,   expr: 'love' },
  think:   { n: '05', name: '思考', short: '思考', dur: 3.2,            loop: true,  fn: poseThink,   expr: 'think' },
  idea:    { n: '06', name: '有灵感', short: '灵感', dur: 2.6,          loop: false, fn: poseIdea,    expr: 'idea' },
  nod:     { n: '07', name: '点头确认', short: '点头', dur: 1.6,        loop: false, fn: poseNod,     expr: 'smile' },
  hover:   { n: '08', name: '悬浮待机', short: '悬浮', dur: 4.0,        loop: true,  fn: poseHover,   expr: 'smile' },
  wow:     { n: '09', name: '惊喜发现', short: '惊喜', dur: 1.8,        loop: false, fn: poseWow,     expr: 'wow' },
  spin:    { n: '10', name: '转圈展示', short: '转圈', dur: SPIN_DUR,   loop: false, fn: poseSpin,    expr: 'laugh',
             phases: [['01', 0, 0.95, '屈膝起势'], ['02', 0.95, 3.05, '转身'], ['03', 3.05, 3.90, '收势颔首']] },
  walk:    { n: '11', name: '行走', short: '行走', dur: WALK_DUR,       loop: true,  fn: poseWalk,    expr: 'smile',
             phases: [['01', 0, 0.29, '左脚支撑'], ['02', 0.29, 0.58, '右腿摆动'], ['03', 0.58, 0.86, '右脚支撑'], ['04', 0.86, 1.15, '左腿摆动']] },
  jump:    { n: '12', name: '起跳·落地', short: '起跳', dur: JUMP_DUR,  loop: false, fn: poseJump,    expr: 'laugh',
             phases: [['01', 0, 0.62, '屈膝蓄力'], ['02', 0.62, 1.40, '腾空'], ['03', 1.40, 1.72, '落地缓冲'], ['04', 1.72, 2.10, '恢复站姿']] },
  morph:   { n: '13', name: '万圣节变装', short: '变装', dur: MORPH_DUR,  loop: false, fn: poseMorph,   expr: 'wow',
             phases: [['01', 0, 0.95, '起势'], ['02', 0.95, 2.12, '聚能'], ['03', 2.12, 2.55, '爆闪·换装'],
                      ['04', 2.55, 3.15, '落地'], ['05', 3.15, 4.20, '亮相']] },
  lie:     { n: '14', name: '躺下看天', short: '躺下', dur: LIE_DUR,    loop: false, fn: poseLie,     expr: 'smile',
             phases: [['01', 0, 0.58, '起势'], ['02', 0.58, 2.30, '躺下'], ['03', 2.30, 9.15, '看天'],
                      ['04', 9.15, 11.97, '起身'], ['05', 11.97, 13.20, '站定']] }
};

const state={skin:null,gazeLift:0};
const bones=[root,spine,head,J.legL,J.shinL,J.footL,J.legR,J.shinR,J.footR,J.armL,J.foreL,J.handL,J.armR,J.foreR,J.handR];
const projectedHead=new THREE.Vector3();
const projectedCorner=new THREE.Vector3();
function render(t,clip='idle',local=t,expr='smile',prevClip='idle',prevLocal=t,blend=1,jumpScale=1,wardrobe={skin:'classic',target:'classic',phase:-1}){
 const active=wardrobe.phase>=0&&wardrobe.phase<MORPH_DUR;
 const desired=active&&wardrobe.phase>=MORPH_SWAP?wardrobe.target:wardrobe.skin;
 if(state.skin!==desired)applySkin(desired);
 // Hat silhouettes stay within the existing foreground column; fitting swaps
 // under the localized flash and does not alter the main camera or card rail.
 const fit=({midnight:.94,orbit:.93,neon:.90,moon:.80,witch:.78,santa:.90,lion:.84})[desired]||1;
 robot.scale.setScalar(fit);
 const c=CLIPS[clip]||CLIPS.idle,pc=CLIPS[prevClip]||CLIPS.idle;
 const ct=c.loop?((local%c.dur)+c.dur)%c.dur:clamp(local,0,c.dur-.0001);
 const pt=pc.loop?((prevLocal%pc.dur)+pc.dur)%pc.dur:clamp(prevLocal,0,pc.dur-.0001);
 pc.fn(pt);const prior=bones.map(o=>({p:o.position.clone(),q:o.quaternion.clone(),s:o.scale.clone()}));
 c.fn(ct);if(clip==='jump'&&root.position.y>0)root.position.y*=jumpScale;
 const u=smooth(clamp(blend,0,1));
 if(u<1)bones.forEach((o,i)=>{o.position.lerpVectors(prior[i].p,o.position,u);o.scale.lerpVectors(prior[i].s,o.scale,u);o.quaternion.slerpQuaternions(prior[i].q,o.quaternion,u)});
 contact.position.set(0,.004,0);ground.position.y=0;
 contactAt(Math.max(0,root.position.y));
 if(clip==='lie'){
  const k=smooth(clamp((ct-.58)/1.58,0,1))*(1-smooth(clamp((ct-10.25)/1.72,0,1)))*u;
  contact.material.opacity=.78-.24*k;contact.position.set(0,.004-.62*k,-.55*k);contact.scale.set(1+.10*k,1+.60*k,1);
  ground.position.y=-.62*k;
 }
 if(active){FX_COL.setHex((SKINS.find(s=>s.id===wardrobe.target)||SKINS[0]).glow);morphFX.visible=true;morphFX.scale.setScalar(fit);updateMorphFX(wardrobe.phase)}
 else{morphFX.visible=false;flashEl.style.opacity='0'}
 setExpr(expr);exprState.k=1;updateExpr(0);
 // Expression amplitude preserves the current skin's own accent colour.
 const skin=SKINS.find(s=>s.id===desired)||SKINS[0];M.ring.color.setHex(skin.glow);
 const phase=(t+1.7)%4.9,b=phase<.15?1-.88*Math.sin(Math.PI*phase/.15):1;
 J.eyeL.scale.y*=b;J.eyeR.scale.y*=b;
 symState.t=1;updateSymbol(0,t);lightT=t;updateChestLight(t);SNOW.at(t);
 const fl=.88+.10*Math.sin(t*2.3)+.05*Math.sin(t*6.1+1.7)+.03*Math.sin(t*11.3+.4);
 if(M.pumpkinGlow)M.pumpkinGlow.color.setScalar(fl);if(pumpkinLight)pumpkinLight.intensity=.62*fl;
 J.antenna.rotation.x=Math.sin(t*1.15)*.045-clamp((root.position.y-.02)*.5,-.4,.4);
 J.antenna.rotation.z=Math.sin(t*.85)*.05;
 const facing=Math.max(0,Math.cos(robot.rotation.y+root.rotation.y));
 const lift=(clip==='spin'||clip==='walk')?.25+.75*facing:1;
 head.rotation.x-=(state.gazeLift||0)*lift;
 robot.updateMatrixWorld(true);scene.updateMatrixWorld(true);
 renderer.render(scene,camera);
 projectedHead.set(0,headTopLocal+.025,0);head.localToWorld(projectedHead);projectedHead.project(camera);
 // The local top point rotates toward the camera when the rig turns its back.
 // Use the visible head silhouette for bubble placement during locomotion.
 let topY=Infinity,leftX=Infinity,rightX=-Infinity;
 head.traverseVisible(o=>{if(!o.geometry)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;if(!b)return;for(let i=0;i<8;i++){projectedCorner.set(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z).applyMatrix4(o.matrixWorld).project(camera);const x=(projectedCorner.x*.5+.5)*440,y=(-.5*projectedCorner.y+.5)*560;if(Number.isFinite(x)&&Number.isFinite(y)){topY=Math.min(topY,y);leftX=Math.min(leftX,x);rightX=Math.max(rightX,x)}}});
 return {x:(projectedHead.x*.5+.5)*440,y:(-.5*projectedHead.y+.5)*560,topX:(leftX+rightX)/2,topY,skin:desired,flash:Number(flashEl.style.opacity)};
}
render(0);
return {render,dispose(){scene.traverse(o=>{o.geometry?.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m?.dispose())});scene.environment?.dispose();renderer.dispose()},robot,camera,renderer,CLIPS,state,SKINS};

}
