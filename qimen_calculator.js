/* ═══════════════════════════════════════════════
   奇门遁甲 · 纯前端计算引擎
   不依赖外部库，纯数学计算
   移植自 qimen_cli.py 算法
   ═══════════════════════════════════════════════ */

// ── 60甲子 ──────────────────────────────────
var QM_JIAZI = [
  "甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉",
  "甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未",
  "甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳",
  "甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯",
  "甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑",
  "甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"
];

var QM_GAN_LIST = "甲乙丙丁戊己庚辛壬癸";
var QM_ZHI_LIST = "子丑寅卯辰巳午未申酉戌亥";

function qmGanIndex(g){ return QM_GAN_LIST.indexOf(g); }
function qmZhiIndex(z){ return QM_ZHI_LIST.indexOf(z); }

// ── 节气（阳遁：冬至~芒种）──────────────────
var QM_YANG_TERMS = new Set([
  "冬至","小寒","大寒","立春","雨水","惊蛰",
  "春分","清明","谷雨","立夏","小满","芒种"
]);

// 24节气（按一年中顺序，从小寒开始）
var QM_24_TERMS = [
  {name:"小寒", month:1, day:6},
  {name:"大寒", month:1, day:20},
  {name:"立春", month:2, day:4},
  {name:"雨水", month:2, day:19},
  {name:"惊蛰", month:3, day:6},
  {name:"春分", month:3, day:21},
  {name:"清明", month:4, day:5},
  {name:"谷雨", month:4, day:20},
  {name:"立夏", month:5, day:6},
  {name:"小满", month:5, day:21},
  {name:"芒种", month:6, day:6},
  {name:"夏至", month:6, day:21},
  {name:"小暑", month:7, day:7},
  {name:"大暑", month:7, day:23},
  {name:"立秋", month:8, day:7},
  {name:"处暑", month:8, day:23},
  {name:"白露", month:9, day:8},
  {name:"秋分", month:9, day:23},
  {name:"寒露", month:10, day:8},
  {name:"霜降", month:10, day:23},
  {name:"立冬", month:11, day:7},
  {name:"小雪", month:11, day:22},
  {name:"大雪", month:12, day:7},
  {name:"冬至", month:12, day:22}
];

// ── 局表 ──────────────────────────────────
var QM_JU_TABLE = {
  "阳遁": {
    "冬至":  {"上元":1, "中元":7, "下元":4},
    "小寒":  {"上元":2, "中元":8, "下元":5},
    "大寒":  {"上元":3, "中元":9, "下元":6},
    "立春":  {"上元":8, "中元":5, "下元":2},
    "雨水":  {"上元":9, "中元":6, "下元":3},
    "惊蛰":  {"上元":1, "中元":7, "下元":4},
    "春分":  {"上元":3, "中元":9, "下元":6},
    "清明":  {"上元":4, "中元":1, "下元":7},
    "谷雨":  {"上元":5, "中元":2, "下元":8},
    "立夏":  {"上元":4, "中元":1, "下元":7},
    "小满":  {"上元":5, "中元":2, "下元":8},
    "芒种":  {"上元":6, "中元":3, "下元":9}
  },
  "阴遁": {
    "夏至":  {"上元":9, "中元":3, "下元":6},
    "小暑":  {"上元":8, "中元":2, "下元":5},
    "大暑":  {"上元":7, "中元":1, "下元":4},
    "立秋":  {"上元":2, "中元":5, "下元":8},
    "处暑":  {"上元":1, "中元":4, "下元":7},
    "白露":  {"上元":9, "中元":3, "下元":6},
    "秋分":  {"上元":7, "中元":1, "下元":4},
    "寒露":  {"上元":6, "中元":9, "下元":3},
    "霜降":  {"上元":5, "中元":8, "下元":2},
    "立冬":  {"上元":6, "中元":9, "下元":3},
    "小雪":  {"上元":5, "中元":8, "下元":2},
    "大雪":  {"上元":4, "中元":7, "下元":1}
  }
};

// ── 排盘常量 ──────────────────────────────────
// 阳遁地干顺序
var QM_EARTH_STEM_ORDER = {
  "阳遁": ["戊","己","庚","辛","壬","癸","丁","丙","乙"],
  "阴遁": ["戊","乙","丙","丁","癸","壬","辛","庚","己"]
};

// 旋转顺序（8宫，跳过中宫5）
var QM_ROTATION_RING = [1, 8, 3, 4, 9, 2, 7, 6];

// 九星
var QM_STAR_RING = ["天蓬","天任","天冲","天辅","天英","天芮","天柱","天心"];

// 八门
var QM_DOOR_RING = ["休门","生门","伤门","杜门","景门","死门","惊门","开门"];

// 八神（阳遁顺排）
var QM_GOD_RING_YANG = ["值符","螣蛇","太阴","六合","白虎","玄武","九地","九天"];
// 八神（阴遁逆排）
var QM_GOD_RING_YIN  = ["值符","九天","九地","玄武","白虎","六合","太阴","螣蛇"];

// 旬首→遁干
var QM_XUNSHOU_TO_HIDDEN_YI = {
  "甲子":"戊","甲戌":"己","甲申":"庚","甲午":"辛","甲辰":"壬","甲寅":"癸"
};

// 地支→宫位
var QM_BRANCH_TO_PALACE = {
  "子":1, "丑":8, "寅":8, "卯":3, "辰":4, "巳":4,
  "午":9, "未":2, "申":2, "酉":7, "戌":6, "亥":6
};

// 宫位信息
var QM_PALACE_INFO = {
  1: {name:"坎", direction:"北", trigram:"坎", element:"水"},
  2: {name:"坤", direction:"西南", trigram:"坤", element:"土"},
  3: {name:"震", direction:"东", trigram:"震", element:"木"},
  4: {name:"巽", direction:"东南", trigram:"巽", element:"木"},
  5: {name:"中", direction:"中", trigram:"", element:"土"},
  6: {name:"乾", direction:"西北", trigram:"乾", element:"金"},
  7: {name:"兑", direction:"西", trigram:"兑", element:"金"},
  8: {name:"艮", direction:"东北", trigram:"艮", element:"土"},
  9: {name:"离", direction:"南", trigram:"离", element:"火"}
};

// 九宫格显示顺序（渲染用）
var QM_GRID_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6];

// ── 辅助函数 ──────────────────────────────────

/** 计算从1900-01-01到目标日期的天数 */
function qmDaysSince1900(year, month, day) {
  var ref = new Date(1900, 0, 1);
  var target = new Date(year, month - 1, day);
  return Math.round((target - ref) / 86400000);
}

/** 计算日干支（自包含） */
function qmDayGanZhi(year, month, day) {
  // 基准: 1900-01-01 = 甲戌日 (gan=0, zhi=10)
  var diff = qmDaysSince1900(year, month, day);
  var gan = ((diff % 10) + 10) % 10;
  var zhi = ((diff + 10) % 12 + 12) % 12;
  return {
    gan: QM_GAN_LIST[gan],
    zhi: QM_ZHI_LIST[zhi],
    ganzhi: QM_GAN_LIST[gan] + QM_ZHI_LIST[zhi],
    index: ((diff + 10) % 60 + 60) % 60 // 甲子=0, 1900-01-01=甲戌=10
  };
}

/** 获取时辰的地支（23-1=子, 1-3=丑, ...） */
function qmGetHourZhi(hour) {
  if (hour >= 23 || hour < 1) return "子";
  if (hour < 3) return "丑";
  if (hour < 5) return "寅";
  if (hour < 7) return "卯";
  if (hour < 9) return "辰";
  if (hour < 11) return "巳";
  if (hour < 13) return "午";
  if (hour < 15) return "未";
  if (hour < 17) return "申";
  if (hour < 19) return "酉";
  if (hour < 21) return "戌";
  return "亥";
}

/** 计算时干支 */
function qmHourGanZhi(dayGan, hour) {
  var hourZhi = qmGetHourZhi(hour);
  var hourZhiIdx = qmZhiIndex(hourZhi);
  var dayGanIdx = qmGanIndex(dayGan);
  // 日上起时法: 甲己还加甲, 乙庚丙作初, 丙辛从戊起, 丁壬庚子居, 戊癸何处发, 壬子是真途
  var startGanIdx = [0, 2, 4, 6, 8][dayGanIdx % 5];
  var ganIdx = (startGanIdx + hourZhiIdx) % 10;
  return {
    gan: QM_GAN_LIST[ganIdx],
    zhi: hourZhi,
    ganzhi: QM_GAN_LIST[ganIdx] + hourZhi
  };
}

/** 计算年干支（以立春为界） */
function qmYearGanZhi(year, month, day) {
  var lichun = new Date(year, 1, 4);
  var birth = new Date(year, month - 1, day);
  var actualYear = (birth < lichun && month <= 2) ? year - 1 : year;
  var gan = (actualYear - 4) % 10;
  var zhi = (actualYear - 4) % 12;
  if (gan < 0) gan += 10;
  if (zhi < 0) zhi += 12;
  return QM_GAN_LIST[gan] + QM_ZHI_LIST[zhi];
}

/** 计算月干支（以节气为界） */
function qmMonthGanZhi(yearGanStr, month, day, year) {
  var jieQi = [
    {month:1, day:6, name:"小寒"},
    {month:2, day:4, name:"立春"},
    {month:3, day:6, name:"惊蛰"},
    {month:4, day:5, name:"清明"},
    {month:5, day:5, name:"立夏"},
    {month:6, day:6, name:"芒种"},
    {month:7, day:7, name:"小暑"},
    {month:8, day:7, name:"立秋"},
    {month:9, day:8, name:"白露"},
    {month:10, day:8, name:"寒露"},
    {month:11, day:7, name:"立冬"},
    {month:12, day:7, name:"大雪"}
  ];
  var birth = new Date(year, month - 1, day);
  var idx = -1;
  for (var i = 0; i < jieQi.length; i++) {
    var j = jieQi[i];
    var jDate = new Date(year, j.month - 1, j.day);
    if (birth >= jDate) idx = i;
  }
  if (idx === -1) idx = jieQi.length - 1;
  var monthZhiList = ["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"];
  var mZhi = monthZhiList[idx];
  var yearGanIdx = qmGanIndex(yearGanStr);
  var startGanIdx = [2, 4, 6, 8, 0][yearGanIdx % 5];
  var ganIdx = (startGanIdx + idx) % 10;
  return QM_GAN_LIST[ganIdx] + QM_ZHI_LIST[qmZhiIndex(mZhi)];
}

/** 获取干支在60甲子中的旬 */
function qmGetXun(ganzhi) {
  var gan = ganzhi[0], zhi = ganzhi[1];
  var gi = qmGanIndex(gan), zi = qmZhiIndex(zhi);
  // 同旬内，天干索引与地支索引的差是固定的
  var diff = (gi - zi + 10) % 10;
  // 旬首天干索引 = gi - (zi % 10) 整理后...
  // 更简单: 旬 = Math.floor(zi / 10)???
  // 实际上: 甲子0, 甲戌10, 甲申20, 甲午30, 甲辰40, 甲寅50
  // jiazi_index = zi - (gi - zi + 10) % 10, 但需要循环到 ≥ 0
  // 方法: (gi - diff) % 10 应为 0 (甲)
  // 更简单: 每旬10天干，旬首索引 = Math.floor(gi/10)*10?... 不对，因为干支是交错的
  // 正确的: xun_start_gan_index = gi - zi + 10, if <0 add 10, then xun_start_gan_index = (xun_start_gan_index % 10) 应为0
  // 旬首 = 甲 + (gi - zi + 10) % 10 / 10...
  // 更简单: 旬首的甲干索引 = (gi - zi + 10) % 10
  // 不对，让我再想想。
  // 甲子旬: zi从0开始, gi从0开始, gi与zi同差0
  // 甲戌旬: zi=10(戌), gi=0(甲)? 不对，甲戌=gi=0,zi=10, gi-zi=-10→0 diff=0
  // 实际上: 同旬内, gi - zi 是固定的
  // 如果旬首是甲, 则gi=0, zi=0/10/20/... 即zi=10*k
  // 那么旬首的地支索引: xun_zhi_start = Math.floor(zi / 10) * 10 = Math.floor((zi - diff) / 10) * 10
  // Actually: 时支和时干在同一个旬内
  // 更简单: 旬首的索引 = Math.floor((gi < zi ? gi + 10 - zi : gi - zi) / 10) * 10 + gi
  // No... 旬首 = 甲 + (gi - (gi - zi + 10) % 10)? 
  
  // Simpler: 旬首 is the first 甲 in the 10-gan cycle containing the given ganzhi
  // In the 60-cycle, every 10 entries start with 甲
  // 甲子=0, 甲戌=10, 甲申=20, 甲午=30, 甲辰=40, 甲寅=50
  // Find the index of the ganzhi in JIAZI
  var idx = QM_JIAZI.indexOf(ganzhi);
  if (idx === -1) return null;
  var xunStart = Math.floor(idx / 10) * 10;
  return {
    xunshou: QM_JIAZI[xunStart],
    xunshou_index: xunStart,
    xunkong1: QM_JIAZI[(xunStart + 10) % 60][1], // second char (earth branch) of the 11th in xun
    xunkong2: QM_JIAZI[(xunStart + 11) % 60][1]  // second char of the 12th in xun
  };
}

/** 获取旬的空亡（空亡是每旬最后两个地支） */
function qmGetXunKong(ganzhi) {
  var xun = qmGetXun(ganzhi);
  if (!xun) return "";
  return xun.xunkong1 + xun.xunkong2;
}

/** 计算日子的上/中/下元 */
function qmGetYuan(dayGanZhiIndex) {
  // 上元=0, 中元=1, 下元=2
  var yuanIdx = Math.floor(dayGanZhiIndex / 5) % 3;
  return ["上元","中元","下元"][yuanIdx];
}

// ── 节气计算 ──────────────────────────────────

/** 计算某年某月某日在一年中的第几天 */
function qmDayOfYear(year, month, day) {
  var date = new Date(year, month - 1, day);
  var start = new Date(year, 0, 0);
  return Math.round((date - start) / 86400000);
}

/**
 * 计算指定年份指定节气的日期（返回Date对象）
 * 使用固定近似日期。在格里历中，节气日期波动不超过±1天。
 */
function qmTermDate(year, termIdx) {
  var t = QM_24_TERMS[termIdx];
  // 标准日期。实际日期因闰年可能有±1天波动。
  // 使用该月第几日，格里历下节气日期非常稳定
  return new Date(year, t.month - 1, t.day);
}

/** 查找指定日期所在的活跃节气 */
function qmFindActiveTerm(year, month, day) {
  var inputDate = new Date(year, month - 1, day);
  
  // 计算今年所有节气的日期
  var termDates = [];
  for (var i = 0; i < 24; i++) {
    termDates.push(qmTermDate(year, i));
  }
  
  // 找到最近一个已经过去的节气
  var activeIdx = -1;
  for (var i = 0; i < 24; i++) {
    // 允许±0.5天容差（对于日期比较，使用整天的Date）
    if (inputDate >= termDates[i]) {
      activeIdx = i;
    }
  }
  
  // 如果年初还没到第一个节气（小寒≈1月6日），则在上一年的冬至节气中
  // 上一年冬至 ≈ 12月22日
  if (activeIdx === -1) {
    // 检查是否在冬至（12月22日）之后
    var prevDec22 = new Date(year - 1, 11, 22);
    if (inputDate >= prevDec22) {
      // 在上一年冬至节气中
      activeIdx = 23; // 冬至是第23项
      return {
        activeTerm: "冬至",
        activeTermDate: prevDec22,
        nextTerm: "小寒",
        nextTermDate: termDates[0],
        activeIdx: 23
      };
    }
    // 否则用大雪
    var prevDec7 = new Date(year - 1, 11, 7);
    if (inputDate >= prevDec7) {
      return {
        activeTerm: "大雪",
        activeTermDate: prevDec7,
        nextTerm: "冬至",
        nextTermDate: new Date(year - 1, 11, 22),
        activeIdx: 22
      };
    }
    // 回退到小雪
    activeIdx = 21;
  }

  var activeTerm = QM_24_TERMS[activeIdx];
  var nextIdx = (activeIdx + 1) % 24;
  var nextTerm = QM_24_TERMS[nextIdx];

  // 计算节气的具体日期
  var actDate = termDates[activeIdx];
  var nextYear = year;
  var nextMonth = nextTerm.month;
  var nextDay = nextTerm.day;
  if (nextIdx === 0 && activeIdx === 23) {
    // 冬至→小寒跨年
    nextYear = year + 1;
  }
  var nxtDate = new Date(nextYear, nextMonth - 1, nextDay);

  return {
    activeTerm: activeTerm.name,
    activeTermDate: actDate,
    nextTerm: nextTerm.name,
    nextTermDate: nxtDate,
    activeIdx: activeIdx
  };
}

// ── 核心计算 ──────────────────────────────────

/**
 * 计算地盘（排宫）
 * @param {string} dunType - "阳遁" 或 "阴遁"
 * @param {number} juNumber - 局数 1-9
 * @returns {Object} { earthPalace: palaceNo -> stem, palaceEarthStem: palaceNo -> stem }
 */
function qmComputeEarthPlate(dunType, juNumber) {
  var earthStems = QM_EARTH_STEM_ORDER[dunType].slice(); // copy [戊,己,庚,辛,壬,癸,丁,丙,乙]
  // 阳遁: 从juNumber开始, 按ROTATION_RING顺序排戊己庚辛壬癸丁丙乙
  // 阴遁: 从juNumber开始, 按ROTATION_RING顺序排戊乙丙丁癸壬辛庚己
  var rotation = QM_ROTATION_RING; // [1,8,3,4,9,2,7,6]
  var palaceEarthStem = {};
  var palaceEarthMap = {}; // stem -> palace (for lookup)

  // 找到juNumber在rotation中的起始位置
  var startIdx = rotation.indexOf(juNumber);
  if (startIdx === -1) {
    // 如果juNumber不在rotation中（比如5），则用中宫
    // 中宫5是特殊的，它的地盘天干单独处理
    // 但juNumber 1-9都可能，实际juNumber不会是5
    startIdx = 0;
  }

  // 阳遁: 从起始位置正序分配
  // 阴遁: 从起始位置正序分配（但stem order不同）
  for (var i = 0; i < 8; i++) {
    var palaceNo = rotation[(startIdx + i) % 8];
    palaceEarthStem[palaceNo] = earthStems[i];
    palaceEarthMap[earthStems[i]] = palaceNo;
  }
  // 中宫5: 分配最后一个stem (己)
  palaceEarthStem[5] = earthStems[8];
  palaceEarthMap[earthStems[8]] = 5;

  return { palaceEarthStem: palaceEarthStem, palaceEarthMap: palaceEarthMap };
}

/**
 * 计算天盘（排星）
 * @param {string} dunType
 * @param {number} timePalace - 时干所在的地盘宫位
 * @param {string} xunshou - 旬首干支字符串
 * @returns {Object} { starPalace: palaceNo -> starName, zhifu: {star, palace}, zhishi: {door, palace} }
 */
function qmComputeStarsDoors(dunType, timePalace, xunshou, palaceEarthStem) {
  // Step 1: 确定值符星
  var xunshouBranch = xunshou[1]; // 旬首的地支
  var xunshouPalace = QM_BRANCH_TO_PALACE[xunshouBranch]; // 旬首地支配宫
  
  // 阳遁: 值符星 = STAR_RING[rotation中xunshouPalace的位置]
  // 阴遁: 值符星从旋转环逆向取
  var rotation = QM_ROTATION_RING; // [1,8,3,4,9,2,7,6]
  var xunshouPos = rotation.indexOf(xunshouPalace);
  if (xunshouPos === -1) xunshouPos = 0;
  
  var zhifuStar;
  if (dunType === "阳遁") {
    zhifuStar = QM_STAR_RING[xunshouPos];
  } else {
    // 阴遁: 逆向
    zhifuStar = QM_STAR_RING[(8 - xunshouPos) % 8];
  }

  // Step 2: 确定值使门
  var zhishiDoor;
  if (dunType === "阳遁") {
    zhishiDoor = QM_DOOR_RING[xunshouPos];
  } else {
    zhishiDoor = QM_DOOR_RING[(8 - xunshouPos) % 8];
  }

  // Step 3: 排天盘九星
  // 值符星落在时干所在的地盘宫位
  // 其他星按照ROTATION_RING顺序排列
  var starPalace = {};
  
  if (dunType === "阳遁") {
    // 阳遁: 值符星在timePalace, 其他星按旋转顺序
    // 值符星在STAR_RING中的位置
    var zfStarIdx = QM_STAR_RING.indexOf(zhifuStar);
    // timePalace在rotation中的位置
    var tpPos = rotation.indexOf(timePalace);
    if (tpPos === -1) tpPos = 0;
    
    for (var i = 0; i < 8; i++) {
      var starIdx = (zfStarIdx + i) % 8;
      var palaceNo = rotation[(tpPos + i) % 8];
      starPalace[palaceNo] = QM_STAR_RING[starIdx];
    }
  } else {
    // 阴遁: 逆向
    var zfStarIdx = QM_STAR_RING.indexOf(zhifuStar);
    var tpPos = rotation.indexOf(timePalace);
    if (tpPos === -1) tpPos = 0;
    
    for (var i = 0; i < 8; i++) {
      var starIdx = (zfStarIdx + i) % 8;
      var palaceNo = rotation[(tpPos - i + 8) % 8];
      starPalace[palaceNo] = QM_STAR_RING[starIdx];
    }
  }
  // 中宫: 天禽星
  starPalace[5] = "天禽";

  return {
    starPalace: starPalace,
    zhifu: { star: zhifuStar, palace: timePalace },
    zhishi: { door: zhishiDoor, palace: timePalace } // 值使宫位后续修正
  };
}

/**
 * 计算八门（值使门排法）
 * 值使门从旬首宫位开始，根据时支与旬首支的差值移动
 */
function qmComputeDoors(dunType, zhishiDoor, timeZhi, xunshou, palaceEarthStem) {
  var xunshouBranch = xunshou[1];
  var xunshouBranchIdx = qmZhiIndex(xunshouBranch);
  var timeBranchIdx = qmZhiIndex(timeZhi);
  
  // 值使门起始宫: 旬首地支配宫
  var startPalace = QM_BRANCH_TO_PALACE[xunshouBranch];
  // 移动步数: (时支索引 - 旬首支索引) 
  var steps = (timeBranchIdx - xunshouBranchIdx + 12) % 12;
  
  var rotation = QM_ROTATION_RING; // [1,8,3,4,9,2,7,6]
  var startPos = rotation.indexOf(startPalace);
  if (startPos === -1) startPos = 0;
  
  var doorPalace = {};
  var zsPalace;
  
  if (dunType === "阳遁") {
    // 阳遁顺行
    // 值使门落在移动后的宫位
    var finalPos = (startPos + steps) % 8;
    zsPalace = rotation[finalPos];
    
    // 其他门: 从值使门位置开始，按旋转顺序分配
    var zsDoorIdx = QM_DOOR_RING.indexOf(zhishiDoor);
    for (var i = 0; i < 8; i++) {
      var doorIdx = (zsDoorIdx + i) % 8;
      var palaceNo = rotation[(finalPos + i) % 8];
      doorPalace[palaceNo] = QM_DOOR_RING[doorIdx];
    }
  } else {
    // 阴遁逆行
    var finalPos = (startPos - steps + 8 * 12) % 8;
    zsPalace = rotation[finalPos];
    
    var zsDoorIdx = QM_DOOR_RING.indexOf(zhishiDoor);
    for (var i = 0; i < 8; i++) {
      var doorIdx = (zsDoorIdx + i) % 8;
      var palaceNo = rotation[(finalPos - i + 8) % 8];
      doorPalace[palaceNo] = QM_DOOR_RING[doorIdx];
    }
  }
  
  return { doorPalace: doorPalace, zhishiPalace: zsPalace };
}

/**
 * 排八神
 */
function qmComputeGods(dunType, timePalace, palaceEarthStem) {
  var rotation = QM_ROTATION_RING; // [1,8,3,4,9,2,7,6]
  var tpPos = rotation.indexOf(timePalace);
  if (tpPos === -1) tpPos = 0;
  
  var godRing = (dunType === "阳遁") ? QM_GOD_RING_YANG : QM_GOD_RING_YIN;
  var godPalace = {};
  
  // 值符神落在时干宫（值符宫），其他神顺排/逆排
  // 实际上八神从值符宫开始排，值符神=值符
  // 阳遁: 值符在timePalace, 然后按ROTATION_RING顺排
  // 阴遁: 值符在timePalace, 然后按ROTATION_RING逆排
  
  if (dunType === "阳遁") {
    for (var i = 0; i < 8; i++) {
      var palaceNo = rotation[(tpPos + i) % 8];
      godPalace[palaceNo] = godRing[i];
    }
  } else {
    for (var i = 0; i < 8; i++) {
      var palaceNo = rotation[(tpPos - i + 8) % 8];
      godPalace[palaceNo] = godRing[i];
    }
  }
  
  // 中宫5: 无八神
  return godPalace;
}

/**
 * 计算空亡宫位
 */
function qmKongwangPalaces(kongwangStr) {
  // kongwangStr like "戌亥" → extract branches
  if (!kongwangStr || kongwangStr.length < 2) return [];
  var b1 = kongwangStr[0];
  var b2 = kongwangStr[1];
  var p1 = QM_BRANCH_TO_PALACE[b1] || -1;
  var p2 = QM_BRANCH_TO_PALACE[b2] || -1;
  var result = [];
  if (p1 > 0 && result.indexOf(p1) === -1) result.push(p1);
  if (p2 > 0 && result.indexOf(p2) === -1) result.push(p2);
  return result;
}

// ── 公历转农历（1900-2100）─────────────────────
// 农历数据：bit0-3=闰月(0=无闰), bit4-15=每月大小(1=30天,0=29天), bit16=闰月大小
var LUNAR_INFO=[
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
  0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
  0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
  0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
  0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
  0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
  0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
  0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
  0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
  0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
  0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
  0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
  0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
  0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
  0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06aa0,0x1a6c4,0x0aae0,
  0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
  0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
  0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
  0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a4d0,0x0d150,0x0f252,
  0x0d520];
function solar2lunar(year,month,day){
  var base=new Date(1900,0,31); // 1900年农历正月初一
  var target=new Date(year,month-1,day);
  var offset=Math.floor((target-base)/86400000);
  var lunarYear,lunarMonth,lunarDay,leapMonth,leap=0;
  for(lunarYear=1900;lunarYear<2101&&offset>0;lunarYear++){
    var yearData=LUNAR_INFO[lunarYear-1900];
    leapMonth=yearData&0xf;
    var daysInYear=0;
    for(var i=1;i<=12;i++){daysInYear+=((yearData>>(i+3))&1)?30:29;}
    if(leapMonth){daysInYear+=((yearData>>16)&1)?30:29;}
    if(offset<daysInYear)break;
    offset-=daysInYear;
  }
  if(lunarYear>2100)lunarYear=2100;
  var yearData=LUNAR_INFO[lunarYear-1900];
  leapMonth=yearData&0xf;
  for(lunarMonth=1;lunarMonth<=12;lunarMonth++){
    var monthDays=((yearData>>(lunarMonth+3))&1)?30:29;
    if(offset<monthDays)break;
    offset-=monthDays;
    if(leapMonth===lunarMonth&&leap===0){
      var leapDays=((yearData>>16)&1)?30:29;
      if(offset<leapDays){leap=1;break;}
      offset-=leapDays;leap=1;
    }
  }
  if(leapMonth===0||leap===0||lunarMonth>leapMonth){lunarMonth++;if(lunarMonth>12)lunarMonth=1;}
  lunarDay=offset+1;
  return {year:lunarYear,month:lunarMonth,day:lunarDay,month_text:String(lunarMonth),day_text:String(lunarDay),is_leap:!!leap};
}
// ── 主计算函数 ──────────────────────────────────

/**
 * computeQimenChart(input)
 * @param {Object} input - {year, month, day, hour, minute, gender, question_type}
 * @returns {Object} 匹配renderQimenAll所需的数据格式
 */
function computeQimenChart(input) {
  var warnings = [];
  
  var year = input.year;
  var month = input.month;
  var day = input.day;
  var hour = (input.hour !== undefined) ? input.hour : 12;
  var minute = (input.minute !== undefined) ? input.minute : 0;
  var gender = input.gender || "男";
  var question_type = input.question_type || "";

  // ── 1. 干支计算 ──
  var dayGZ = qmDayGanZhi(year, month, day);
  var hourGZ = qmHourGanZhi(dayGZ.gan, hour);
  var yearGZ = qmYearGanZhi(year, month, day);
  var monthGZ = qmMonthGanZhi(yearGZ[0], month, day, year);

  // 日旬空亡
  var dayXun = qmGetXun(dayGZ.ganzhi);
  var dayXunKong = dayXun ? dayXun.xunkong1 + dayXun.xunkong2 : "";
  
  // 时旬空亡
  var timeXun = qmGetXun(hourGZ.ganzhi);
  var timeXunKong = timeXun ? timeXun.xunkong1 + timeXun.xunkong2 : "";
  var timeXunshou = timeXun ? timeXun.xunshou : "";

  // ── 2. 节气 ──
  var termInfo = qmFindActiveTerm(year, month, day);
  var activeJie = termInfo.activeTerm;
  var nextJie = termInfo.nextTerm;
  var activeJieDate = termInfo.activeTermDate;
  var nextJieDate = termInfo.nextTermDate;

  function fmtDate(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0') + ' 00:00:00';
  }

  // ── 3. 遁类 ──
  var dunType = QM_YANG_TERMS.has(activeJie) ? "阳遁" : "阴遁";

  // ── 4. 元 ──
  var yuan = qmGetYuan(dayGZ.index);

  // ── 5. 局数 ──
  var juTable = QM_JU_TABLE[dunType];
  if (!juTable || !juTable[activeJie]) {
    warnings.push("节气" + activeJie + "在" + dunType + "局表中未找到，使用默认局数(1)");
    var juNumber = 1;
  } else {
    var juNumber = juTable[activeJie][yuan];
    if (!juNumber) {
      warnings.push(yuan + "在" + activeJie + "中未找到，使用默认局数(1)");
      juNumber = 1;
    }
  }

  // ── 6. 地盘 ──
  var earth = qmComputeEarthPlate(dunType, juNumber);
  var palaceEarthStem = earth.palaceEarthStem; // palaceNo -> stem
  var palaceEarthMap = earth.palaceEarthMap;   // stem -> palaceNo

  // ── 7. 时干在地盘中的宫位 ──
  var timeStem = hourGZ.gan;
  var timeStemPalace = palaceEarthMap[timeStem];
  if (!timeStemPalace) {
    warnings.push("时干" + timeStem + "未在地盘中找到，尝试使用宫位1");
    timeStemPalace = 1;
  }

  // ── 8. 旬首信息 ──
  var xunshou = timeXunshou;
  var hiddenYi = QM_XUNSHOU_TO_HIDDEN_YI[xunshou] || "";
  
  // 旬首遁干在地盘中的宫位 = 值符宫
  var xunshouStemPalace = palaceEarthMap[hiddenYi];
  if (!xunshouStemPalace) {
    warnings.push("遁干" + hiddenYi + "未在地盘中找到");
    xunshouStemPalace = timeStemPalace;
  }

  // ── 9. 值符星、值使门 ──
  var starDoorInfo = qmComputeStarsDoors(dunType, xunshouStemPalace, xunshou, palaceEarthStem);
  // 注意：值符星在旬首遁干宫位，但天盘排布从时干宫开始
  // 重新计算天盘：时干宫作为值符的落宫，其他星按旋转顺序
  // 修正：值符星落在时干宫（timeStemPalace），不是旬首遁干宫
  // 实际算法：值符星 = 根据旬首确定，值符星落在时干宫
  
  // 重新计算天盘，使用正确的值符落宫
  var starDoorInfo2 = qmComputeStarsDoors(dunType, timeStemPalace, xunshou, palaceEarthStem);
  
  // ── 10. 八门（值使门排法） ──
  var doorInfo = qmComputeDoors(dunType, starDoorInfo2.zhishi.door, hourGZ.zhi, xunshou, palaceEarthStem);

  // ── 11. 八神 ──
  var godPalace = qmComputeGods(dunType, timeStemPalace, palaceEarthStem);

  // ── 12. 空亡 ──
  var kongwang = timeXunKong ? timeXunKong.split("") : [];
  var kongwangPalaces = qmKongwangPalaces(timeXunKong);

  // ── 13. 组装九宫 ──
  var palaces = [];
  var allPalaces = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  for (var pi = 0; pi < allPalaces.length; pi++) {
    var no = allPalaces[pi];
    var info = QM_PALACE_INFO[no];
    var p = {
      palace: no,
      name: info.name,
      direction: info.direction,
      trigram: info.trigram,
      element: info.element,
      earth_stem: palaceEarthStem[no] || "",
      sky_stem: "",       // 天盘天干（暂时为空，或从星/门推断）
      star: starDoorInfo2.starPalace[no] || "",
      door: doorInfo.doorPalace[no] || "",
      god: godPalace[no] || "",
      is_center: (no === 5),
      hosts_center: false,
      hosting_note: ""
    };
    
    // 中宫特殊处理：天禽星在中宫，但需要寄宫（通常寄坤2宫）
    if (no === 5) {
      p.is_center = true;
      p.star = "天禽";
      p.door = "";
      p.god = "";
      p.hosting_note = "寄坤";
    }
    
    // 天盘天干：对于奇门转盘，天盘天干是从星/门的排布中衍生的
    // 实际上，天盘天干 = 地盘天干在星旋转后的映射
    // 在转盘奇门中，天盘每个宫的星对应一个天干（该星原始位置的地盘天干）
    // 简化：对于纯转盘计算，天盘天干 = 星所对应的原始地盘天干
    // 这需要复杂的映射，暂时用星名对应的原始天干简化
    // 更准确地说，天干在天盘是通过星旋转带来的
    // 每个星在原始位置（地盘）有对应的天干，星旋转后把那个天干带到新位置
    // 这在简化版中可以省略，或者从地盘读取
    
    // 为满足渲染需求，为每个宫设置sky_stem
    // 提取星对应的原始宫位的地盘天干
    var starName = p.star;
    if (starName && starName !== "天禽") {
      // 星的原始位置在STAR_RING中的索引对应ROTATION_RING中的宫位
      var starIdx = QM_STAR_RING.indexOf(starName);
      if (starIdx !== -1) {
        if (dunType === "阳遁") {
          // 阳遁: 星的原始宫 = ROTATION_RING[starIdx]
          var starOrigPalace = QM_ROTATION_RING[starIdx];
          p.sky_stem = palaceEarthStem[starOrigPalace] || "";
        } else {
          // 阴遁: 星的原始宫 = ROTATION_RING[7-starIdx]
          var starOrigPalace2 = QM_ROTATION_RING[(7 - starIdx) % 8];
          p.sky_stem = palaceEarthStem[starOrigPalace2] || "";
        }
      }
    } else if (starName === "天禽") {
      // 天禽在中宫，原始在5宫
      p.sky_stem = palaceEarthStem[5] || "己";
      p.hosting_note = "寄坤";
      p.hosts_center = false;
    }
    
    // 如果该宫在空亡列表中，标记
    p.is_kong = kongwangPalaces.indexOf(no) !== -1;
    
    palaces.push(p);
  }

  // ── 14. 组装最终结果 ──
  var result = {
    chart: {
      dun_type: dunType,
      yuan: yuan,
      ju_number: juNumber,
      xunshou: xunshou,
      hidden_yi: hiddenYi,
      kongwang: kongwang,
      kongwang_palaces: kongwangPalaces,
      time_stem_visible: timeStem,
      zhifu: starDoorInfo2.zhifu,
      zhishi: {
        door: starDoorInfo2.zhishi.door,
        palace: doorInfo.zhishiPalace
      },
      active_jie: activeJie,
      active_jie_started_at: fmtDate(activeJieDate),
      next_jie: nextJie,
      next_jie_at: fmtDate(nextJieDate),
      grid_order: QM_GRID_ORDER,
      palaces: palaces,
      warnings: warnings
    },
    calendar: {
      solar: {
        ymd_hms: year + '-' + String(month).padStart(2,'0') + '-' + String(day).padStart(2,'0') + ' ' + String(hour).padStart(2,'0') + ':' + String(minute).padStart(2,'0') + ':00',
        timezone: 'Asia/Shanghai'
      },
      lunar: (function(){
        var l=solar2lunar(year,month,day);
        return {year:l.year,month:l.month,day:l.day,month_text:l.month_text,day_text:l.day_text,is_leap_month:l.is_leap};
      })(),
      jieqi: {
        active_jie: activeJie,
        active_jie_started_at: fmtDate(activeJieDate),
        next_jie: nextJie,
        next_jie_at: fmtDate(nextJieDate)
      }
    },
    ganzhi: {
      year: yearGZ,
      month: monthGZ,
      day: dayGZ.ganzhi,
      time: hourGZ.ganzhi,
      day_xun_exact: dayXun ? dayXun.xunshou : "",
      day_xunkong_exact: dayXunKong,
      time_xun: timeXun ? timeXun.xunshou : "",
      time_xunkong: timeXunKong
    },
    warnings: warnings,
    normalized_input: {
      question_type: question_type,
      calendar_type: 'solar',
      timezone: 'Asia/Shanghai'
    }
  };

  // ── 值符 & 值使 ──
  // 值符: 星名由旬首确定，落宫为时干在地盘中的宫位
  result.chart.zhifu = {
    star: starDoorInfo2.zhifu.star,
    palace: timeStemPalace
  };
  // 值使: 门名由旬首确定，落宫由旬首宫+时支推算
  result.chart.zhishi = {
    door: starDoorInfo2.zhishi.door,
    palace: doorInfo.zhishiPalace
  };

  // ── 修正天盘天干 ──
  // 在传统的转盘奇门中，天盘天干的确定：
  // 天盘每个宫的天干 = 该宫星所对应的原始地盘天干
  // 每个星有原始宫位，把原始宫位的地盘天干带到天盘新位置
  for (var pi2 = 0; pi2 < palaces.length; pi2++) {
    var p2 = palaces[pi2];
    if (p2.is_center) {
      p2.sky_stem = palaceEarthStem[5] || "己";
      continue;
    }
    var starName2 = p2.star;
    if (!starName2 || starName2 === "天禽") {
      p2.sky_stem = "";
      continue;
    }
    // 找该星在STAR_RING中的索引
    var sIdx = QM_STAR_RING.indexOf(starName2);
    if (sIdx === -1) {
      p2.sky_stem = "";
      continue;
    }
    // 该星的原始（地盘）宫位
    var origPalace;
    if (dunType === "阳遁") {
      origPalace = QM_ROTATION_RING[sIdx];
    } else {
      origPalace = QM_ROTATION_RING[(7 - sIdx) % 8];
    }
    // 该原始宫位的地盘天干
    var origStem = palaceEarthStem[origPalace] || "";
    p2.sky_stem = origStem;
  }

  // 移除辅助字段
  delete result.chart.zhishi_door_display;
  delete result.chart.zhishi_palace;

  // 确保zhifu的palace和zhishi的palace都是数字
  if (result.chart.zhifu) {
    result.chart.zhifu.palace = parseInt(result.chart.zhifu.palace) || result.chart.zhifu.palace;
  }
  if (result.chart.zhishi) {
    result.chart.zhishi.palace = parseInt(result.chart.zhishi.palace) || result.chart.zhishi.palace;
  }

  return result;
}

// ═══════════════════════════════════════════════
//  用神分析
// ═══════════════════════════════════════════════

// 八门五行
var QM_DOOR_WUXING = {
  "休门":"水", "生门":"土", "伤门":"木", "杜门":"木",
  "景门":"火", "死门":"土", "惊门":"金", "开门":"金"
};

// 九星五行
var QM_STAR_WUXING = {
  "天蓬":"水", "天任":"土", "天冲":"木", "天辅":"木",
  "天英":"火", "天芮":"土", "天柱":"金", "天心":"金", "天禽":"土"
};

// 八神凶吉（仅定义明显凶神和吉神）
var QM_GOD_LUCK = {
  "值符":"吉", "九天":"吉", "九地":"吉",
  "太阴":"吉", "六合":"吉",
  "螣蛇":"凶", "白虎":"凶", "玄武":"凶"
};

// 五行生克
var QM_WUXING_CYCLE = ["木","火","土","金","水"];

function qmWuxingIndex(wx) { return QM_WUXING_CYCLE.indexOf(wx); }

/** 判断五行关系: "生我","我生","克我","我克","同" */
function qmWuxingRelation(me, other) {
  if (me === other) return "同";
  var mi = qmWuxingIndex(me);
  var oi = qmWuxingIndex(other);
  if (mi === -1 || oi === -1) return "?";
  if ((mi + 1) % 5 === oi) return "我生";
  if ((mi + 4) % 5 === oi) return "生我";
  if ((mi + 2) % 5 === oi) return "我克";
  if ((mi + 3) % 5 === oi) return "克我";
  return "?";
}

/**
 * 判断"门受制"：宫克门（宫位五行克门的五行）
 * 生门/开门受宫克时，视为条件不顺
 */
function qmDoorRestricted(doorName, palaceElement) {
  var doorWx = QM_DOOR_WUXING[doorName];
  if (!doorWx || !palaceElement) return false;
  // 宫克门 → 门受制
  return qmWuxingRelation(palaceElement, doorWx) === "克我";
}

/**
 * 从盘数据中查找指定名称所在宫
 */
function qmFindPalaceByItem(panData, type, name) {
  // type: "star", "door", "god"
  var keyMap = { star: "star", door: "door", god: "god" };
  var key = keyMap[type];
  if (!key) return null;
  for (var i = 0; i < panData.palaces.length; i++) {
    var p = panData.palaces[i];
    if (p[key] === name) return p;
  }
  return null;
}

/**
 * 根据问题类型确定用神
 * 
 * @param {Object} panData - computeQimenChart 返回的 chart 对象
 * @param {string} question - 问题描述或问题类型关键字
 * @returns {Object} {
 *   primary: { type, name, palace, detail },
 *   assistants: [...],
 *   analysis: string
 * }
 */
function analyzeYongshen(panData, question) {
  if (!panData || !panData.palaces) {
    return { primary: null, assistants: [], analysis: "缺少盘数据" };
  }

  // 标准化问题文本
  var q = (question || "").trim();

  // ── 关键字匹配，确定主用神 ──
  var primary = null;
  var assistants = [];

  function setPrimary(type, name, desc) {
    var palace = null;
    if (type === "door") {
      palace = qmFindPalaceByItem(panData, "door", name);
    } else if (type === "star") {
      palace = qmFindPalaceByItem(panData, "star", name);
    } else if (type === "god") {
      palace = qmFindPalaceByItem(panData, "god", name);
    } else if (type === "stem" || type === "earth_stem") {
      // 按天干查找
      for (var i = 0; i < panData.palaces.length; i++) {
        if (panData.palaces[i].earth_stem === name || panData.palaces[i].sky_stem === name) {
          palace = panData.palaces[i];
          break;
        }
      }
    } else if (type === "zhifu") {
      // 值符星落宫
      if (panData.zhifu && panData.zhifu.palace) {
        for (var i = 0; i < panData.palaces.length; i++) {
          if (panData.palaces[i].palace === panData.zhifu.palace) {
            palace = panData.palaces[i];
            break;
          }
        }
      }
    }

    primary = {
      type: type,
      name: name,
      palace: palace,
      description: desc
    };
  }

  function addAssistant(type, name, desc) {
    var palace = null;
    if (type === "door") {
      palace = qmFindPalaceByItem(panData, "door", name);
    } else if (type === "star") {
      palace = qmFindPalaceByItem(panData, "star", name);
    } else if (type === "zhifu") {
      if (panData.zhifu && panData.zhifu.palace) {
        for (var i = 0; i < panData.palaces.length; i++) {
          if (panData.palaces[i].palace === panData.zhifu.palace) {
            palace = panData.palaces[i];
            break;
          }
        }
      }
    }
    assistants.push({ type: type, name: name, palace: palace, description: desc });
  }

  // 匹配问题类型 — 按优先级匹配
  var matched = false;

  // 健康/疾病
  if (/(?:健康|疾病|生病|病|身体|体检|看病|天芮|死门)/.test(q) && !matched) {
    setPrimary("star", "天芮", "疾病健康主用神");
    addAssistant("door", "死门", "健康辅助参考");
    addAssistant("stem", panData.time_stem_visible || "", "日干/求测者自身");
    matched = true;
  }

  // 感情/婚姻/恋爱
  if (/(?:感情|婚姻|恋爱|结婚|对象|女友|男友|配偶|婚|六合)/.test(q) && !matched) {
    setPrimary("god", "六合", "感情婚姻主用神");
    addAssistant("stem", panData.time_stem_visible || "", "日干/求测者");
    // 乙庚作为辅助
    addAssistant("earth_stem", "乙", "乙奇(女方/柔方参考)");
    addAssistant("earth_stem", "庚", "庚(男方/刚方参考)");
    matched = true;
  }

  // 财运/投资/交易
  if (/(?:财|财运|投资|交易|生意|赚钱|生门|戊)/.test(q) && !matched) {
    setPrimary("door", "生门", "财运投资主用神");
    addAssistant("stem", panData.time_stem_visible || "", "日干/求测者自身");
    addAssistant("earth_stem", "戊", "戊/正财参考");
    matched = true;
  }

  // 事业/工作/项目
  if (/(?:事业|工作|项目|职场|升职|跳槽|求职|开门|值符)/.test(q) && !matched) {
    setPrimary("door", "开门", "事业工作主用神");
    addAssistant("zhifu", "值符", "主导权和上级支持");
    addAssistant("stem", panData.time_stem_visible || "", "日干/求测者");
    matched = true;
  }

  // 考试/学习/证书
  if (/(?:考试|学习|学业|证书|教育|学校|文昌|天辅|景门)/.test(q) && !matched) {
    setPrimary("door", "景门", "考试学业主用神");
    addAssistant("star", "天辅", "文昌/学业辅助");
    addAssistant("earth_stem", "丁", "丁奇/文书辅助");
    matched = true;
  }

  // 出行/方位
  if (/(?:出行|出差|旅行|旅游|方位|方向|休门)/.test(q) && !matched) {
    setPrimary("door", "休门", "出行主用神");
    addAssistant("door", "开门", "出行顺利参考");
    addAssistant("zhifu", "值符", "出行安全辅助");
    matched = true;
  }

  // 诉讼/合同/争议
  if (/(?:诉讼|合同|争议|官司|打官司|惊门|开门)/.test(q) && !matched) {
    setPrimary("door", "惊门", "诉讼争议主用神");
    addAssistant("door", "开门", "合同公开性参考");
    addAssistant("zhifu", "值符", "公正裁决辅助");
    matched = true;
  }

  // 寻人/寻物
  if (/(?:寻人|寻物|找|找人|找东西|丢失|遗失|玄武)/.test(q) && !matched) {
    setPrimary("door", "杜门", "遮掩/失物主用神");
    addAssistant("zhifu", "值符", "主导辅助");
    matched = true;
  }

  // 默认: 用日干+时干
  if (!matched) {
    setPrimary("stem", panData.time_stem_visible || "", "时干/所问之事");
    addAssistant("zhifu", "值符", "全局主导参考");
  }

  // ── 用神分析 ──
  var analysis = "";

  if (primary && primary.palace) {
    var pp = primary.palace;
    analysis += "主用神【" + primary.name + "(" + primary.description + ")】落" +
                pp.name + "宫(" + pp.direction + ")。";

    // 门的状态
    if (pp.door) {
      analysis += "该宫门为【" + pp.door + "】";
      if (qmDoorRestricted(pp.door, pp.element)) {
        analysis += "（门受宫克，条件不顺）";
      }
      analysis += "。";
    }

    // 星的状态
    if (pp.star) {
      var starLuck = QM_GOD_LUCK[pp.god] || "平";
      analysis += "星为【" + pp.star + "】，";
    }

    // 神的状态
    if (pp.god) {
      var godLuck = QM_GOD_LUCK[pp.god] || "平";
      if (godLuck === "凶") {
        analysis += "神临【" + pp.god + "】（凶神干扰）";
      } else if (godLuck === "吉") {
        analysis += "神临【" + pp.god + "】（吉神相助）";
      } else {
        analysis += "神临【" + pp.god + "】";
      }
      analysis += "。";
    }

    // 空亡
    if (pp.is_kong) {
      analysis += "⚠ 此宫逢空亡，力量虚浮，易拖延或落空。";
    }

    // 值符是否落到同一宫
    if (panData.zhifu && panData.zhifu.palace === pp.palace) {
      analysis += "值符同宫，得主导权加持。";
    }
    if (panData.zhishi && panData.zhishi.palace === pp.palace) {
      analysis += "值使同宫，事有执行动力。";
    }
  } else {
    analysis += "用神未找到明确落宫。";
  }

  return {
    primary: primary,
    assistants: assistants,
    analysis: analysis
  };
}

// ═══════════════════════════════════════════════
//  格局分析
// ═══════════════════════════════════════════════

/**
 * 分析奇门盘格局
 * 判断顺序: 先用神落宫→值符值使→门星神组合→特殊格局
 * 
 * @param {Object} panData - computeQimenChart 返回的 chart 对象
 * @param {Object} [yongshenResult] - 可选的 analyzeYongshen 结果，用于增强分析
 * @returns {Object} {
 *   patterns: [...],    // 格局列表
 *   summary: string,    // 整体判断
 *   lucky: string[],    // 吉象列表
 *   unlucky: string[],  // 凶象列表
 * }
 */
function analyzeGeju(panData, yongshenResult) {
  if (!panData || !panData.palaces) {
    return { patterns: [], summary: "缺少盘数据", lucky: [], unlucky: [] };
  }

  var lucky = [];
  var unlucky = [];
  var patterns = [];
  var detailLines = [];

  // ── 1. 三奇配吉门 ──
  // 三奇：乙、丙、丁；吉门：开门、休门、生门
  var sanqi = ["乙", "丙", "丁"];
  var luckyDoors = ["开门", "休门", "生门"];

  for (var i = 0; i < panData.palaces.length; i++) {
    var p = panData.palaces[i];
    if (p.is_center) continue;

    // 检查天盘天干是否为三奇，且门是否为吉门
    var isSanqi = sanqi.indexOf(p.sky_stem) !== -1;
    var isLuckyDoor = luckyDoors.indexOf(p.door) !== -1;

    if (isSanqi && isLuckyDoor) {
      var patName = p.sky_stem + "奇配" + p.door;
      patterns.push({
        name: patName,
        type: "吉",
        palace: p.palace,
        detail: p.name + "宫：" + p.sky_stem + "（" + p.sky_stem + "奇）与" + p.door + "同宫，"
              + "利于行动、沟通、资源调动。"
      });
      lucky.push("【" + patName + "】在" + p.name + "宫—事情有转机，推进更顺。");
    }
  }

  // 如果没配到三奇配吉门，标记
  if (patterns.filter(function(x){ return x.name.indexOf("奇配") > 0; }).length === 0) {
    // 简单记载
  }

  // ── 2. 值符得位分析 ──
  if (panData.zhifu) {
    var zfPalace = null;
    for (var i = 0; i < panData.palaces.length; i++) {
      if (panData.palaces[i].palace === panData.zhifu.palace) {
        zfPalace = panData.palaces[i];
        break;
      }
    }
    if (zfPalace) {
      // 值符得位简评：值符宫的门星神状况
      var zfAnalysis = "值符【" + panData.zhifu.star + "】落" + zfPalace.name + "宫";
      var zfGood = true;

      if (zfPalace.god === "白虎" || zfPalace.god === "玄武" || zfPalace.god === "螣蛇") {
        zfGood = false;
        zfAnalysis += "，临" + zfPalace.god + "（凶神干扰）";
        unlucky.push("值符落" + zfPalace.name + "宫，临" + zfPalace.god + "，主导权有干扰。");
      } else if (zfPalace.god && QM_GOD_LUCK[zfPalace.god] === "吉") {
        zfAnalysis += "，临" + zfPalace.god + "（吉神配合）";
        lucky.push("值符落" + zfPalace.name + "宫得" + zfPalace.god + "相助，主导权稳固。");
      }

      if (zfPalace.is_kong) {
        zfGood = false;
        zfAnalysis += "，但逢空亡，力量虚浮";
        unlucky.push("值符落宫逢空亡，主导力量虚，需等时机。");
      }

      if (zfPalace.door && qmDoorRestricted(zfPalace.door, zfPalace.element)) {
        zfGood = false;
        zfAnalysis += "，门" + zfPalace.door + "受制";
        unlucky.push("值符所在宫的门" + zfPalace.door + "受宫克，主导权执行不顺。");
      }

      patterns.push({
        name: "值符落宫分析",
        type: zfGood ? "吉" : "凶",
        palace: panData.zhifu.palace,
        detail: zfAnalysis + "。"
      });
    }
  }

  // ── 3. 值使门分析 ──
  if (panData.zhishi) {
    var zsPalace = null;
    for (var i = 0; i < panData.palaces.length; i++) {
      if (panData.palaces[i].palace === panData.zhishi.palace) {
        zsPalace = panData.palaces[i];
        break;
      }
    }
    if (zsPalace) {
      var zsAnalysis = "值使【" + panData.zhishi.door + "】落" + zsPalace.name + "宫";
      var zsGood = true;

      if (zsPalace.is_kong) {
        zsGood = false;
        zsAnalysis += "，逢空亡";
        unlucky.push("值使" + panData.zhishi.door + "落空亡宫，执行力虚浮。");
      }

      if (qmDoorRestricted(panData.zhishi.door, zsPalace.element)) {
        zsGood = false;
        zsAnalysis += "，门受宫克";
        unlucky.push("值使" + panData.zhishi.door + "受" + zsPalace.name + "宫所克，执行受阻。");
      } else {
        // 门克宫为吉
        var doorWx = QM_DOOR_WUXING[panData.zhishi.door];
        if (doorWx && zsPalace.element) {
          var rel = qmWuxingRelation(doorWx, zsPalace.element);
          if (rel === "我克") {
            zsGood = true;
            zsAnalysis += "，门克宫（得力）";
            lucky.push("值使" + panData.zhishi.door + "克" + zsPalace.name + "宫，执行有力。");
          }
        }
      }

      patterns.push({
        name: "值使门分析",
        type: zsGood ? "吉" : "凶",
        palace: panData.zhishi.palace,
        detail: zsAnalysis + "。"
      });
    }
  }

  // ── 4. 门+星+神组合检查 ──
  var checkDoors = ["生门", "开门", "休门"];
  for (var di = 0; di < checkDoors.length; di++) {
    var doorName = checkDoors[di];
    var pDoor = qmFindPalaceByItem(panData, "door", doorName);
    if (!pDoor) continue;

    var doorAnalysis = doorName + "落" + pDoor.name + "宫";
    var doorOk = true;

    // 门受制检查
    if (qmDoorRestricted(doorName, pDoor.element)) {
      doorOk = false;
      unlucky.push(doorName + "落" + pDoor.name + "宫，门受宫克—条件不顺，硬推成本高。");
      doorAnalysis += "（门受宫克）";
    } else {
      var doorWx = QM_DOOR_WUXING[doorName];
      var rel = qmWuxingRelation(doorWx, pDoor.element);
      if (rel === "我克") {
        doorAnalysis += "（门克宫，得力）";
      } else if (rel === "同") {
        doorAnalysis += "（门宫比和，平稳）";
      } else if (rel === "生我") {
        doorAnalysis += "（宫生门，得地）";
      } else if (rel === "我生") {
        doorAnalysis += "（门生宫，泄气）";
      }
    }

    // 白虎/玄武检查
    if (pDoor.god === "白虎") {
      doorAnalysis += "，临白虎（冲突/伤损风险）";
      if (doorName !== "惊门" && doorName !== "死门") {
        unlucky.push(doorName + "临白虎，提醒避免冲突和硬碰硬。");
      }
    }
    if (pDoor.god === "玄武") {
      doorAnalysis += "，临玄武（信息失真/隐情）";
      unlucky.push(doorName + "临玄武，注意信息误差或小人。");
    }
    if (pDoor.god === "九天") {
      doorAnalysis += "，临九天（高远/宜主动）";
    }

    // 空亡
    if (pDoor.is_kong) {
      doorOk = false;
      doorAnalysis += "，逢空亡（力量虚）";
      unlucky.push(doorName + "落空亡宫，事易拖延或落空。");
    }

    patterns.push({
      name: doorName + "分析",
      type: doorOk ? "吉" : "凶",
      palace: pDoor.palace,
      detail: doorAnalysis + "。"
    });
  }

  // ── 5. 凶门检查 ──
  var badDoorCheck = ["死门", "惊门"];
  for (var di = 0; di < badDoorCheck.length; di++) {
    var doorName = badDoorCheck[di];
    var pDoor = qmFindPalaceByItem(panData, "door", doorName);
    if (!pDoor) continue;
    if (pDoor.god === "白虎" || pDoor.god === "玄武") {
      unlucky.push(doorName + "与" + pDoor.god + "同宫—凶上加凶，需格外警惕。");
    }
  }

  // ── 6. 白虎/玄武整体检查 ──
  var baihuFound = false;
  var xuanwuFound = false;
  for (var i = 0; i < panData.palaces.length; i++) {
    var p = panData.palaces[i];
    if (p.is_center) continue;
    if (p.god === "白虎" && !baihuFound) {
      baihuFound = true;
      // 白虎所在宫的门
      if (p.door && (p.door === "惊门" || p.door === "伤门")) {
        unlucky.push("白虎临" + p.door + "落" + p.name + "宫—冲突、争斗风险高。");
      }
    }
    if (p.god === "玄武" && !xuanwuFound) {
      xuanwuFound = true;
    }
  }

  // ── 7. 用神分析交叉参考 ──
  if (yongshenResult && yongshenResult.primary && yongshenResult.primary.palace) {
    var ysPalace = yongshenResult.primary.palace;
    // 检查是否与值符同宫
    if (panData.zhifu && panData.zhifu.palace === ysPalace.palace) {
      lucky.push("用神与值符同宫，有主导权和支持。");
    }
    // 检查用神所在宫是否临白虎/玄武
    if (ysPalace.god === "白虎") {
      unlucky.push("用神临白虎，主冲突或障碍。");
    }
    if (ysPalace.god === "玄武") {
      unlucky.push("用神临玄武，主信息不明或有隐情。");
    }
    if (ysPalace.is_kong) {
      unlucky.push("用神落空亡宫，主事虚不实。");
    }
  }

  // ── 生成整体总结 ──
  var summary = "";
  if (lucky.length === 0 && unlucky.length === 0) {
    summary = "此盘格局特征不突出，建议结合实际宫位信息综合判断。";
  } else {
    var hasStrongLucky = lucky.length >= 2;
    var hasStrongUnlucky = unlucky.length >= 2;
    if (hasStrongLucky && !hasStrongUnlucky) {
      summary = "整体格局偏吉。";
    } else if (hasStrongUnlucky && !hasStrongLucky) {
      summary = "整体格局偏凶，需注意风险。";
    } else if (hasStrongLucky && hasStrongUnlucky) {
      summary = "吉凶互现，需区别对待：吉处可推进，凶处先规避。";
    } else {
      summary = "格局一般，建议结合具体宫位分析判断。";
    }
  }

  return {
    patterns: patterns,
    summary: summary,
    lucky: lucky,
    unlucky: unlucky
  };
}

// ═══════════════════════════════════════════════
//  经典格局详解 — 天盘+地盘格局 / 九遁 / 三诈五假
// ═══════════════════════════════════════════════

/**
* 天盘+地盘奇仪组合 → 格局映射表
* key = 天盘+地盘, value = {name, type, desc}
* 吉格: 青龙返首, 飞鸟跌穴, 青龙转光
* 凶格: 青龙逃走, 白虎猖狂, 朱雀投江, 腾蛇夭矫,
*       荧入太白, 太白入荧, 伏宫格, 飞宫格,
*       大格, 小格, 刑格, 奇格, 天网四张
*/
var QM_STEM_PATTERNS = {
  "戊丙": {name:"青龙返首", type:"吉", desc:"戊+丙，木生火，母顾子，大吉大利。利求财、求职、婚姻、建造。"},
  "丙戊": {name:"飞鸟跌穴", type:"吉", desc:"丙+戊，朱雀归巢，木火相生，百事皆吉。利就职、求财、诉讼、迁移。"},
  "戊丁": {name:"青龙转光", type:"吉", desc:"戊+丁，木火相生，得富贵荣耀。宜见贵、求名、进取。"},
  "乙辛": {name:"青龙逃走", type:"凶", desc:"乙+辛，龙逃虎追，金克木，奴仆拐带，失财破败，百事皆凶。"},
  "辛乙": {name:"白虎猖狂", type:"凶", desc:"辛+乙，虎在龙上，反客为主，主客两伤，出入有惊恐，远行多灾。"},
  "丁癸": {name:"朱雀投江", type:"凶", desc:"丁+癸，火入水乡，水克火，文书口舌，音信沉溺，百事凶。"},
  "癸丁": {name:"腾蛇夭矫", type:"凶", desc:"癸+丁，蛇入火中，虚惊不宁，百事不利，文书官司。"},
  "丙庚": {name:"荧入太白", type:"凶", desc:"丙+庚，火入金乡，贼去，利主不利客，宜退避不宜进攻。"},
  "庚丙": {name:"太白入荧", type:"凶", desc:"庚+丙，金入火乡，贼来，利客不利主，须防贼偷营。"},
  "庚戊": {name:"伏宫格", type:"凶", desc:"庚+戊，庚克甲，主客皆不利，求人不在，等人不来。"},
  "戊庚": {name:"飞宫格", type:"凶", desc:"戊+庚，甲遇庚克，大凶，尤不利客，经商破财，行有灾。"},
  "庚癸": {name:"大格", type:"凶", desc:"庚+癸，大格反吟，行人不至，官司破财，求人不在。"},
  "庚壬": {name:"小格", type:"凶", desc:"庚+壬，上格，远行失迷道路，求谋破财得病。"},
  "庚己": {name:"刑格", type:"凶", desc:"庚+己，刑格，官司受刑，求谋破财。"},
  "癸癸": {name:"天网四张", type:"凶", desc:"癸+癸，天网四张，不可当，强出者必有血光。"},
  "戊戊": {name:"伏吟格", type:"warn", desc:"戊+戊，甲子遁于戊，伏吟局，宜静不宜动。"},
  "壬癸": {name:"天网低张", type:"凶", desc:"壬+癸，天网低落，事易败露，不宜举事。"}
};

/** 三奇得使 — 乙得使/丙得使/丁得使 */
var QM_SANQI_DEYUN = {
  "乙己": "乙得使（乙+己，甲戌时）",
  "乙辛": "乙得使（乙+辛，甲午时）",
  "丙戊": "丙得使（丙+戊，甲子时）",
  "丙庚": "丙得使（丙+庚，甲申时）",
  "丁壬": "丁得使（丁+壬，甲辰时）",
  "丁癸": "丁得使（丁+癸，甲寅时）"
};

/**
* 检测天盘+地盘指定组合是否存在于宫中
*/
function qmFindStemCombination(palaces, skyStem, earthStem) {
  for (var i = 0; i < palaces.length; i++) {
    var p = palaces[i];
    if (p.is_center) continue;
    if (p.sky_stem === skyStem && p.earth_stem === earthStem) {
      return p;
    }
  }
  return null;
}

/**
* 全盘扫描天盘+地盘奇仪格局
* @param {Array} palaces - 宫位数组
* @param {Object} chart - 完整chart对象（用于玉女守门等判断）
* @returns {Array} [{name, type, palace, detail}]
*/
function qmFindAllStemPatterns(palaces, chart) {
  var results = [];
  var checked = {};

  // 扫描每个宫的天盘+地盘组合
  for (var i = 0; i < palaces.length; i++) {
    var p = palaces[i];
    if (p.is_center || !p.sky_stem || !p.earth_stem) continue;

    var key = p.sky_stem + p.earth_stem;
    var pattern = QM_STEM_PATTERNS[key];
    if (pattern) {
      var det = pattern.desc;
      // 特殊处理：遇墓迫击刑则吉格打折
      if (pattern.type === "吉" && p.is_kong) det += " (但逢空亡，吉力打折)";
      results.push({
        name: pattern.name,
        type: pattern.type,
        palace: p.palace,
        palaceName: p.name,
        sky_stem: p.sky_stem,
        earth_stem: p.earth_stem,
        door: p.door,
        detail: det
      });
      checked[key] = true;
    }

    // 三奇得使
    var deyKey = p.sky_stem + p.earth_stem;
    if (QM_SANQI_DEYUN[deyKey] && p.door) {
      // 需值使门在该宫
      if (chart.zhishi && chart.zhishi.palace === p.palace) {
        results.push({
          name: "三奇得使",
          type: "吉",
          palace: p.palace,
          palaceName: p.name,
          detail: QM_SANQI_DEYUN[deyKey] + "，值使门至其位。"
        });
      }
    }
  }

  // 玉女守门：值使门+地盘丁奇
  if (chart.zhishi) {
    var zsPalace = chart.zhishi.palace;
    for (var j = 0; j < palaces.length; j++) {
      var pp = palaces[j];
      if (pp.is_center || pp.palace !== zsPalace) continue;
      if (pp.earth_stem === "丁") {
        results.push({
          name: "玉女守门",
          type: "吉",
          palace: zsPalace,
          palaceName: pp.name,
          detail: "值使门" + (chart.zhishi.door || "") + "落" + pp.name + "宫遇地盘丁奇(玉女)，利宴会、婚姻。"
        });
      }
    }
  }

  // 三奇升殿
  // 乙到震宫（卯）
  var bPalace = qmFindStemCombination(palaces, "乙", null);
  if (bPalace && !bPalace.is_center && bPalace.sky_stem === "乙" && bPalace.palace === 3) {
    results.push({name:"三奇升殿(乙)", type:"吉", palace:3, palaceName:"震", detail:"乙奇到震宫(卯位)，日出扶桑，有禄之乡，为上吉。"});
  }
  // 丙到离宫（午）
  var cPalace = qmFindStemCombination(palaces, "丙", null);
  if (cPalace && cPalace.sky_stem === "丙" && cPalace.palace === 9) {
    results.push({name:"三奇升殿(丙)", type:"吉", palace:9, palaceName:"离", detail:"丙奇到离宫(午位)，月照端门，火旺之地，为上吉。"});
  }
  // 丁到兑宫（酉）
  var dPalace = qmFindStemCombination(palaces, "丁", null);
  if (dPalace && dPalace.sky_stem === "丁" && dPalace.palace === 7) {
    results.push({name:"三奇升殿(丁)", type:"吉", palace:7, palaceName:"兑", detail:"丁奇到兑宫(酉位)，星见西方，天之神位，为上吉。"});
  }

  return results;
}

// ─────────────────────────────────────────────
//  九遁检测
// ─────────────────────────────────────────────

/**
* 检查九遁格局
* 规则: 天盘/地盘/人盘/神盘特定组合
* @param {Array} palaces - 宫位数组
* @returns {Array} [{name, palaceName, detail, type}]
*/
function qmFindNineDun(palaces) {
  var results = [];

  for (var i = 0; i < palaces.length; i++) {
    var p = palaces[i];
    if (p.is_center) continue;

    // 天遁: 丙奇+生门+丁奇 同宫
    if (p.sky_stem === "丙" && p.door === "生门" && p.earth_stem === "丁") {
      results.push({name:"天遁", type:"吉", palace:p.palace, palaceName:p.name,
        detail:"丙奇+生门+丁奇——得天华之蔽，百事生旺，利上书、求官、行商。"});
    }

    // 地遁: 乙奇+开门+己 同宫
    if (p.sky_stem === "乙" && p.door === "开门" && p.earth_stem === "己") {
      results.push({name:"地遁", type:"吉", palace:p.palace, palaceName:p.name,
        detail:"乙奇+开门+六己——得日精之蔽，百事皆吉，宜安营、藏兵、修造。"});
    }

    // 人遁: 丁奇+休门+太阴 同宫 (需检查神盘)
    if (p.sky_stem === "丁" && p.door === "休门" && p.god === "太阴") {
      results.push({name:"人遁", type:"吉", palace:p.palace, palaceName:p.name,
        detail:"丁奇+休门+太阴——得星精之蔽，利和谈、探密、婚姻、交易。"});
    }

    // 风遁: 乙奇+三吉门(开休生)+巽宫
    if (p.sky_stem === "乙" && (p.door === "开门" || p.door === "休门" || p.door === "生门") && p.palace === 4) {
      results.push({name:"风遁", type:"吉", palace:p.palace, palaceName:"巽",
        detail:"乙奇+" + p.door + "于巽宫——得风精之蔽，宜顺风击敌、火攻。"});
    }

    // 云遁: 乙奇+三吉门+辛 同宫
    if (p.sky_stem === "乙" && (p.door === "开门" || p.door === "休门" || p.door === "生门") && p.earth_stem === "辛") {
      results.push({name:"云遁", type:"吉", palace:p.palace, palaceName:p.name,
        detail:"乙奇+" + p.door + "+六辛——得云精之蔽，宜求雨、立寨、造军械。"});
    }

    // 龙遁: 乙奇+三吉门+坎宫(1宫)或癸
    if (p.sky_stem === "乙" && (p.door === "开门" || p.door === "休门" || p.door === "生门") &&
        (p.palace === 1 || p.earth_stem === "癸")) {
      results.push({name:"龙遁", type:"吉", palace:p.palace, palaceName:p.name,
        detail:"乙奇+" + p.door + "于" + (p.palace === 1 ? "坎宫" : "六癸之地") + "——得龙精之蔽，利水战、修桥。"});
    }

    // 虎遁: 乙奇+休门+辛+艮宫 或 庚+开门+兑宫
    if ((p.sky_stem === "乙" && p.door === "休门" && p.earth_stem === "辛" && p.palace === 8) ||
        (p.sky_stem === "庚" && p.door === "开门" && p.palace === 7)) {
      results.push({name:"虎遁", type:"吉", palace:p.palace, palaceName:p.name,
        detail: (p.sky_stem === "乙" ? "乙奇+休门+六辛于艮宫" : "庚+开门于兑宫") + "——得虎威之蔽，利招安、攻险。"});
    }

    // 神遁: 丙奇+生门+九天 同宫
    if (p.sky_stem === "丙" && p.door === "生门" && p.god === "九天") {
      results.push({name:"神遁", type:"吉", palace:p.palace, palaceName:p.name,
        detail:"丙奇+生门+九天——得神助，宜驱神遣将、祭祀、攻城。"});
    }

    // 鬼遁: 丁奇+杜门+九地 同宫
    if (p.sky_stem === "丁" && p.door === "杜门" && p.god === "九地") {
      results.push({name:"鬼遁", type:"吉", palace:p.palace, palaceName:p.name,
        detail:"丁奇+杜门+九地——得鬼精之蔽，宜偷营劫寨、设伏。"});
    }
  }

  return results;
}

// ─────────────────────────────────────────────
//  三诈五假检测
// ─────────────────────────────────────────────

var QM_SANQI = ["乙","丙","丁"];
var QM_THREE_GOOD_DOORS = ["开门","休门","生门"];
var QM_THREE_YIN_GODS = ["太阴","六合","九地"];

function qmFindSanZhaWuJia(palaces) {
  var results = [];

  for (var i = 0; i < palaces.length; i++) {
    var p = palaces[i];
    if (p.is_center) continue;

    var hasQi = QM_SANQI.indexOf(p.sky_stem) !== -1;
    var hasGoodDoor = QM_THREE_GOOD_DOORS.indexOf(p.door) !== -1;

    if (!hasQi || !hasGoodDoor) continue;

    // 真诈: 三吉门+三奇+太阴
    if (p.god === "太阴") {
      results.push({name:"真诈", type:"吉", palace:p.palace, palaceName:p.name,
        detail:p.sky_stem + "奇+" + p.door + "+太阴——利密谋策划，经商远行百事吉。"});
    }
    // 休诈: 三吉门+三奇+六合
    if (p.god === "六合") {
      results.push({name:"休诈", type:"吉", palace:p.palace, palaceName:p.name,
        detail:p.sky_stem + "奇+" + p.door + "+六合——利合谋合作，百事皆吉。"});
    }
    // 重诈: 三吉门+三奇+九地
    if (p.god === "九地") {
      results.push({name:"重诈", type:"吉", palace:p.palace, palaceName:p.name,
        detail:p.sky_stem + "奇+" + p.door + "+九地——利隐藏设伏，谋藏于心。"});
    }
  }

  // 五假（不依赖三奇，依赖特定门+神）
  for (var j = 0; j < palaces.length; j++) {
    var pp = palaces[j];
    if (pp.is_center) continue;

    // 天假: 景门+三奇+九天
    if (pp.door === "景门" && pp.god === "九天" && QM_SANQI.indexOf(pp.sky_stem) !== -1) {
      results.push({name:"天假", type:"吉", palace:pp.palace, palaceName:pp.name,
        detail:"景门+" + pp.sky_stem + "奇+九天——利争战诉讼、上书献策。"});
    }
    // 地假: 杜门+丁己癸+九地/太阴/六合
    if (pp.door === "杜门" && (["九地","太阴","六合"].indexOf(pp.god) !== -1) &&
        ["丁","己","癸"].indexOf(pp.sky_stem) !== -1) {
      results.push({name:"地假", type:"吉", palace:pp.palace, palaceName:pp.name,
        detail:"杜门+" + pp.sky_stem + "+" + pp.god + "——利潜藏埋伏、逃亡躲灾。"});
    }
    // 人假: 惊门+六壬+九天
    if (pp.door === "惊门" && pp.god === "九天" && pp.sky_stem === "壬") {
      results.push({name:"人假", type:"吉", palace:pp.palace, palaceName:pp.name,
        detail:"惊门+壬+九天——利捕捉逃亡。"});
    }
    // 神假: 伤门+丁己癸+九地
    if (pp.door === "伤门" && pp.god === "九地" && ["丁","己","癸"].indexOf(pp.sky_stem) !== -1) {
      results.push({name:"神假", type:"吉", palace:pp.palace, palaceName:pp.name,
        detail:"伤门+" + pp.sky_stem + "+九地——利埋藏伏藏。"});
    }
    // 鬼假: 死门+丁己癸+九地
    if (pp.door === "死门" && pp.god === "九地" && ["丁","己","癸"].indexOf(pp.sky_stem) !== -1) {
      results.push({name:"鬼假", type:"吉", palace:pp.palace, palaceName:pp.name,
        detail:"死门+" + pp.sky_stem + "+九地——利超度亡灵、破土修茔。"});
    }
  }

  return results;
}

// ─────────────────────────────────────────────
//  五不遇时 & 天辅时
// ─────────────────────────────────────────────

/**
* 天干五行对照表
*/
var QM_GAN_WX = {"甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土","庚":"金","辛":"金","壬":"水","癸":"水"};

/**
* 判断五不遇时：时干克日干（阳克阳、阴克阴）
*/
function qmCheckFiveUnmeet(dayGZ, timeGZ) {
  if (!dayGZ || !timeGZ || dayGZ.length < 1 || timeGZ.length < 1) return null;
  var dayG = dayGZ[0];
  var timeG = timeGZ[0];
  var dWx = QM_GAN_WX[dayG];
  var tWx = QM_GAN_WX[timeG];
  if (!dWx || !tWx) return null;
  var rel = qmWuxingRelation(tWx, dWx);
  if (rel === "克我") {
    // 必须是阳克阳、阴克阴
    var isDayYang = "甲丙戊庚壬".indexOf(dayG) !== -1;
    var isTimeYang = "甲丙戊庚壬".indexOf(timeG) !== -1;
    if (isDayYang === isTimeYang) {
      return "五不遇时(时干" + timeG + "克日干" + dayG + ")，大凶，纵得三奇吉门亦不可用。";
    }
  }
  return null;
}

/**
* 判断天辅时（天显时格）
*/
function qmCheckTianFuTime(dayGZ, timeGZ) {
  if (!dayGZ || !timeGZ) return null;
  // 甲己日的甲子时、甲戌时
  // 乙庚日的甲申时
  // 丙辛日的甲午时
  // 丁壬日的甲辰时
  // 戊癸日的甲寅时
  var dayG = dayGZ[0];
  var timeG = timeGZ[0];
  if (timeG !== "甲") return null;
  var timeZ = timeGZ[1];
  var map = {"甲":["子","戌"], "己":["子","戌"], "乙":["申"], "庚":["申"], "丙":["午"], "辛":["午"], "丁":["辰"], "壬":["辰"], "戊":["寅"], "癸":["寅"]};
  var zhiList = map[dayG];
  if (zhiList && zhiList.indexOf(timeZ) !== -1) {
    return "天辅时(天显时格)：" + dayG + "日" + timeG + timeZ + "时，虽伏吟不为凶，反为吉。";
  }
  return null;
}

// ─────────────────────────────────────────────
// 	⓺ 综合增强格局分析（调用所有子检测）
// ─────────────────────────────────────────────

/**
* 增强版格局分析：在原有analyzeGeju之上追加经典格局检测
* @param {Object} chart - computeQimenChart 返回的chart
* @param {string} dayGZ - 日干支字符串
* @param {string} timeGZ - 时干支字符串
* @returns {Object} {gejuPatterns, dunPatterns, sanzhaPatterns, timePatterns:[]}
*/
function analyzeClassicPatterns(chart, dayGZ, timeGZ) {
  if (!chart || !chart.palaces) return {gejuPatterns:[], dunPatterns:[], sanzhaPatterns:[], timePatterns:[]};

  var palaces = chart.palaces;

  // 天盘+地盘格局
  var gejuPatterns = qmFindAllStemPatterns(palaces, chart);

  // 九遁
  var dunPatterns = qmFindNineDun(palaces);

  // 三诈五假
  var sanzhaPatterns = qmFindSanZhaWuJia(palaces);

  // 时间格局
  var timePatterns = [];
  var fiveUnmeet = qmCheckFiveUnmeet(dayGZ, timeGZ);
  if (fiveUnmeet) timePatterns.push({name:"五不遇时", type:"凶", detail:fiveUnmeet});
  var tianFu = qmCheckTianFuTime(dayGZ, timeGZ);
  if (tianFu) timePatterns.push({name:"天辅时", type:"吉", detail:tianFu});

  return {
    gejuPatterns: gejuPatterns,
    dunPatterns: dunPatterns,
    sanzhaPatterns: sanzhaPatterns,
    timePatterns: timePatterns
  };
}

// ═══════════════════════════════════════════════
//  方向吉凶分析
// ═══════════════════════════════════════════════

/** 吉门列表 */
var QM_DOOR_JI = ["开门","休门","生门"];
/** 凶门列表 */
var QM_DOOR_XIONG = ["死门","伤门","惊门"];
/** 吉星列表 */
var QM_STAR_JI = ["天心","天辅","天任","天禽"];
/** 凶星列表 */
var QM_STAR_XIONG = ["天蓬","天英","天芮","天柱"];
/** 吉神列表 */
var QM_GOD_JI = ["值符","太阴","六合","九天","九地"];
/** 凶神列表 */
var QM_GOD_XIONG = ["白虎","玄武","螣蛇"];
/** 马星地支（申子辰马在寅，亥卯未马在巳，寅午戌马在申，巳酉丑马在亥）*/
var QM_MA_STAR = {"申":"寅","子":"寅","辰":"寅","亥":"巳","卯":"巳","未":"巳","寅":"申","午":"申","戌":"申","巳":"亥","酉":"亥","丑":"亥"};

/**
 * 分析8个方位的吉凶
 * @param {Object} chart - computeQimenChart 返回的 chart 对象
 * @returns {Array<Object>} [{direction, palace, score, level, detail, items}]
 */
function analyzeDirection(chart) {
  if (!chart || !chart.palaces) return [];
  
  var directions = [
    {dir:"北", palaceNo:1},
    {dir:"东北", palaceNo:8},
    {dir:"东", palaceNo:3},
    {dir:"东南", palaceNo:4},
    {dir:"南", palaceNo:9},
    {dir:"西南", palaceNo:2},
    {dir:"西", palaceNo:7},
    {dir:"西北", palaceNo:6}
  ];
  
  var zhifuPalace = chart.zhifu ? chart.zhifu.palace : null;
  var kongPalaces = chart.kongwang_palaces || [];
  var timeZhi = chart.ganzhi ? chart.ganzhi.time ? chart.ganzhi.time[1] : "" : "";
  
  // 获取马星所在宫位
  var maPalace = -1;
  if (timeZhi && QM_MA_STAR[timeZhi]) {
    maPalace = QM_BRANCH_TO_PALACE[QM_MA_STAR[timeZhi]] || -1;
  }
  
  var results = [];
  
  for (var di = 0; di < directions.length; di++) {
    var d = directions[di];
    var palace = null;
    for (var pi = 0; pi < chart.palaces.length; pi++) {
      if (chart.palaces[pi].palace === d.palaceNo) {
        palace = chart.palaces[pi];
        break;
      }
    }
    
    if (!palace || palace.is_center) {
      results.push({
        direction: d.dir,
        palace: d.palaceNo,
        score: 0,
        level: "平",
        detail: "无数据",
        items: []
      });
      continue;
    }
    
    var score = 0;
    var items = [];
    
    // 1. 门吉凶判断（权重最高）
    if (palace.door) {
      if (QM_DOOR_JI.indexOf(palace.door) !== -1) {
        score += 3;
        items.push({type:"good", text:palace.door + "（吉门）"});
      } else if (QM_DOOR_XIONG.indexOf(palace.door) !== -1) {
        score -= 2;
        items.push({type:"bad", text:palace.door + "（凶门）"});
      } else {
        items.push({type:"neutral", text:palace.door + "（平门）"});
      }
      // 门受制检查
      if (palace.element && QM_DOOR_WUXING && QM_DOOR_WUXING[palace.door]) {
        var rel = qmWuxingRelation(palace.element, QM_DOOR_WUXING[palace.door]);
        if (rel === "克我") {
          score -= 1;
          items.push({type:"bad", text:"门受宫克"});
        } else if (rel === "我克") {
          score += 1;
          items.push({type:"good", text:"门克宫（得力）"});
        }
      }
    }
    
    // 2. 神吉凶判断
    if (palace.god) {
      if (QM_GOD_JI.indexOf(palace.god) !== -1) {
        score += 2;
        items.push({type:"good", text:palace.god + "（吉神）"});
      } else if (QM_GOD_XIONG.indexOf(palace.god) !== -1) {
        score -= 2;
        items.push({type:"bad", text:palace.god + "（凶神）"});
      }
    }
    
    // 3. 星吉凶判断
    if (palace.star) {
      if (QM_STAR_JI.indexOf(palace.star) !== -1) {
        score += 1.5;
        items.push({type:"good", text:palace.star + "（吉星）"});
      } else if (QM_STAR_XIONG.indexOf(palace.star) !== -1) {
        score -= 1;
        items.push({type:"bad", text:palace.star + "（凶星）"});
      }
    }
    
    // 4. 三奇加分（乙丙丁在天盘）
    if (palace.sky_stem && ["乙","丙","丁"].indexOf(palace.sky_stem) !== -1) {
      score += 2;
      items.push({type:"good", text:palace.sky_stem + "奇（三奇）"});
    }
    
    // 5. 空亡减分
    if (palace.is_kong || kongPalaces.indexOf(palace.palace) !== -1) {
      score -= 1.5;
      items.push({type:"bad", text:"逢空亡"});
    }
    
    // 6. 值符所在宫加分（最强方向）
    if (zhifuPalace === palace.palace) {
      score += 3;
      items.push({type:"good", text:"值符所在（主导）"});
    }
    
    // 7. 马星（动象）
    if (maPalace === palace.palace) {
      score += 1.5;
      items.push({type:"good", text:"马星动（变动有利）"});
    }
    
    // 综合评级
    var level = "平";
    var detail = "";
    if (score >= 5) {
      level = "大吉";
      detail = "此方位气场旺盛，诸事顺遂，优先选择。";
    } else if (score >= 2) {
      level = "吉";
      detail = "此方位偏吉，可酌情使用。";
    } else if (score >= -1) {
      level = "平";
      detail = "此方位中性，无功无过。";
    } else if (score >= -3) {
      level = "凶";
      detail = "此方位有阻，宜谨慎回避。";
    } else {
      level = "大凶";
      detail = "此方位气场恶劣，切莫使用。";
    }
    
    results.push({
      direction: d.dir,
      palace: d.palaceNo,
      score: score,
      level: level,
      detail: detail,
      items: items
    });
  }
  
  // 按分数排序
  results.sort(function(a, b) { return b.score - a.score; });
  
  return results;
}

// ═══════════════════════════════════════════════
//  四害检查：伏吟·反吟·门迫·入墓·旺相休囚死
// ═══════════════════════════════════════════════

/** 九星对应本宫（星伏吟判断用） */
var QM_STAR_HOME_PALACE = {
  "天蓬":1, "天芮":2, "天冲":3, "天辅":4,
  "天禽":5, "天心":6, "天柱":7, "天任":8, "天英":9
};

/** 八门对应本宫（门伏吟判断用） */
var QM_DOOR_HOME_PALACE = {
  "休门":1, "死门":2, "伤门":3, "杜门":4,
  "景门":9, "生门":8, "惊门":7, "开门":6
};

/** 九宫对冲映射 */
var QM_OPPOSITE_PALACE = {1:9, 2:8, 3:7, 4:6, 5:5, 6:4, 7:3, 8:2, 9:1};

/** 天干入墓宫位 */
var QM_STEM_MU = {
  "乙":[6,2], "丙":[6],   "丁":[8],
  "戊":[6],   "己":[8],   "庚":[8],
  "辛":[4],   "壬":[4],   "癸":[2]
};

/** 月令地支→五行 */
var QM_MONTH_WX = {
  1:"木", 2:"木", 3:"土", 4:"火", 5:"火", 6:"土",
  7:"金", 8:"金", 9:"土", 10:"水", 11:"水", 12:"土"
};

/**
* 获取五行在月令下的旺相休囚死
* 同我者旺, 我生者相, 生我者休, 克我者囚, 我克者死
*/
function qmWxStatus(wx, monthZhiIdx) {
  if (!wx || !monthZhiIdx) return "平";
  var monthWx = QM_MONTH_WX[monthZhiIdx];
  if (!monthWx) return "平";
  if (wx === monthWx) return "旺";
  var rel = qmWuxingRelation(monthWx, wx);
  if (rel === "我生") return "相";
  if (rel === "生我") return "休";
  if (rel === "克我") return "囚";
  if (rel === "我克") return "死";
  return "平";
}

/**
* 从月干支获取月支数字索引 (1=寅..12=丑)
*/
function qmMonthZhiIndex(monthGZ) {
  if (!monthGZ || monthGZ.length < 2) return 0;
  var zhi = monthGZ[1];
  var zhiMap = {"寅":1,"卯":2,"辰":3,"巳":4,"午":5,"未":6,"申":7,"酉":8,"戌":9,"亥":10,"子":11,"丑":12};
  return zhiMap[zhi] || 0;
}

// ─────────────────────────────────────────────
//  ① 伏吟 & 反吟
// ─────────────────────────────────────────────

function qmCheckStarFY(palaces) {
  var results = [];
  for (var i = 0; i < palaces.length; i++) {
    var p = palaces[i];
    if (!p.star || p.is_center) continue;
    var home = QM_STAR_HOME_PALACE[p.star];
    if (!home) continue;
    if (p.palace === home) results.push({star:p.star, palace:p.palace, type:"伏吟"});
    else if (QM_OPPOSITE_PALACE[p.palace] === home) results.push({star:p.star, palace:p.palace, type:"反吟"});
  }
  return results;
}

function qmCheckDoorFY(palaces) {
  var results = [];
  for (var i = 0; i < palaces.length; i++) {
    var p = palaces[i];
    if (!p.door || p.is_center) continue;
    var home = QM_DOOR_HOME_PALACE[p.door];
    if (!home) continue;
    if (p.palace === home) results.push({door:p.door, palace:p.palace, type:"伏吟"});
    else if (QM_OPPOSITE_PALACE[p.palace] === home) results.push({door:p.door, palace:p.palace, type:"反吟"});
  }
  return results;
}

function qmCheckZhifuFY(zhifu) {
  if (!zhifu) return "";
  var home = QM_STAR_HOME_PALACE[zhifu.star];
  if (!home) return "";
  if (zhifu.palace === home) return "伏吟";
  if (QM_OPPOSITE_PALACE[zhifu.palace] === home) return "反吟";
  return "";
}

function qmCheckZhishiFY(zhishi) {
  if (!zhishi || !zhishi.door) return "";
  var home = QM_DOOR_HOME_PALACE[zhishi.door];
  if (!home) return "";
  if (zhishi.palace === home) return "伏吟";
  if (QM_OPPOSITE_PALACE[zhishi.palace] === home) return "反吟";
  return "";
}

/** 六仪击刑简化判断 */
function qmCheckJixing(palace) {
  if (!palace || !palace.earth_stem) return false;
  if (palace.earth_stem === "戊" && palace.palace === 3) return true;
  if (palace.earth_stem === "己" && palace.palace === 2) return true;
  if (palace.earth_stem === "庚" && palace.palace === 8) return true;
  if (palace.earth_stem === "辛" && palace.palace === 9) return true;
  if ((palace.earth_stem === "壬" || palace.earth_stem === "癸") && palace.palace === 4) return true;
  return false;
}

/** 综合伏吟反吟 */
function qmAnalyzeFY(chart) {
  if (!chart || !chart.palaces) return {starFY:[], doorFY:[], zhifuFY:"", zhishiFY:"", summary:""};
  var starFY = qmCheckStarFY(chart.palaces);
  var doorFY = qmCheckDoorFY(chart.palaces);
  var zhifuFY = qmCheckZhifuFY(chart.zhifu);
  var zhishiFY = qmCheckZhishiFY(chart.zhishi);
  var parts = [];
  if (starFY.length >= 4) parts.push("⭐ 星全局伏吟");
  else if (starFY.length > 0) {
    var fyn = starFY.filter(function(s){return s.type==="伏吟";}).length;
    var fan = starFY.filter(function(s){return s.type==="反吟";}).length;
    if (fyn > 0) parts.push("⭐ 星伏吟" + fyn + "宫");
    if (fan > 0) parts.push("⭐ 星反吟" + fan + "宫");
  }
  if (doorFY.length >= 4) parts.push("🚪 门全局伏吟");
  else if (doorFY.length > 0) {
    var dfyn = doorFY.filter(function(s){return s.type==="伏吟";}).length;
    var dfan = doorFY.filter(function(s){return s.type==="反吟";}).length;
    if (dfyn > 0) parts.push("🚪 门伏吟" + dfyn + "宫");
    if (dfan > 0) parts.push("🚪 门反吟" + dfan + "宫");
  }
  if (zhifuFY) parts.push("🎯 值符" + zhifuFY);
  if (zhishiFY) parts.push("🛠 值使" + zhishiFY);
  var summary = "";
  if (parts.length > 0) {
    if (zhifuFY === "伏吟" && zhishiFY === "伏吟") summary = "全局伏吟，宜静不宜动，事多迟滞，守成为上。";
    else if (zhifuFY === "反吟" && zhishiFY === "反吟") summary = "全局反吟，事有反复，宜主动出击，不宜固守。";
    else if (parts.join("").indexOf("伏吟") !== -1 && parts.join("").indexOf("反吟") !== -1) summary = "伏吟反吟互见，有部分阻滞也有部分波动。";
    else if (parts.join("").indexOf("伏吟") !== -1) summary = "有伏吟格局，整体偏慢，宜守不宜攻。";
    else if (parts.join("").indexOf("反吟") !== -1) summary = "有反吟格局，事有反复，宜主动应对。";
  } else summary = "星门值使均无伏吟反吟，盘局流动正常。";
  return {starFY:starFY, doorFY:doorFY, zhifuFY:zhifuFY, zhishiFY:zhishiFY, summary:summary};
}

// ─────────────────────────────────────────────
//  ② 门迫 & 宫迫
// ─────────────────────────────────────────────

function qmCheckDoorForce(palace) {
  if (!palace || !palace.door || !palace.element || palace.is_center) return {type:"",detail:""};
  var doorWx = QM_DOOR_WUXING[palace.door];
  if (!doorWx) return {type:"",detail:""};
  var rel = qmWuxingRelation(doorWx, palace.element);
  if (rel === "我克") return {type:"门迫", detail:palace.door + "(" + doorWx + ")克" + palace.name + "宫(" + palace.element + ")，门迫"};
  if (rel === "克我") return {type:"宫迫", detail:palace.name + "宫(" + palace.element + ")克" + palace.door + "(" + doorWx + ")，宫迫"};
  if (rel === "同") return {type:"和平", detail:palace.door + "与" + palace.name + "宫五行相同(" + doorWx + ")"};
  return {type:"",detail:""};
}

function qmAnalyzeDoorForce(palaces) {
  var menpo = [], gongpo = [];
  for (var i = 0; i < palaces.length; i++) {
    if (palaces[i].is_center) continue;
    var r = qmCheckDoorForce(palaces[i]);
    if (r.type === "门迫") menpo.push({palace:palaces[i].name, door:palaces[i].door, detail:r.detail});
    else if (r.type === "宫迫") gongpo.push({palace:palaces[i].name, door:palaces[i].door, detail:r.detail});
  }
  var summary = "";
  if (menpo.length === 0 && gongpo.length === 0) summary = "无门迫宫迫，八门与九宫气场相合。";
  else {
    var parts = [];
    if (menpo.length > 0) parts.push("门迫" + menpo.length + "处（吉门被克吉不就，凶门被克祸更重）");
    if (gongpo.length > 0) parts.push("宫迫" + gongpo.length + "处（宫克门，人事受环境限制）");
    summary = parts.join("，");
  }
  return {menpo:menpo, gongpo:gongpo, summary:summary};
}

// ─────────────────────────────────────────────
//  ③ 入墓
// ─────────────────────────────────────────────

function qmStemIsMu(stem, palaceNo) {
  if (!stem || !QM_STEM_MU[stem]) return false;
  return QM_STEM_MU[stem].indexOf(palaceNo) !== -1;
}

function qmAnalyzeMu(palaces, monthGZ) {
  var entries = [];
  var monthIdx = qmMonthZhiIndex(monthGZ);
  var stemWxMap = {"甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土","庚":"金","辛":"金","壬":"水","癸":"水"};
  for (var i = 0; i < palaces.length; i++) {
    var p = palaces[i];
    if (p.is_center || !p.sky_stem) continue;
    if (qmStemIsMu(p.sky_stem, p.palace)) {
      var swx = stemWxMap[p.sky_stem] || "";
      var wxs = qmWxStatus(swx, monthIdx);
      entries.push({
        stem:p.sky_stem, palace:p.palace, palaceName:p.name,
        isKong:p.is_kong,
        type:(wxs === "旺" || wxs === "相") ? "入库(旺相)" : "入墓(衰绝)",
        detail:p.sky_stem + "落" + p.name + "宫→" + (wxs === "旺" || wxs === "相" ? "旺相入库，暂时收纳" : "衰绝入墓，能量被封，仅余20%")
      });
    }
  }
  var summary = entries.length === 0 ? "无天干入墓，各天干能量正常释放。" :
    "有" + entries.length + "处天干" +
    (entries.some(function(e){return e.type === "入墓(衰绝)";}) ? "入墓，能量被封宜等待时机。" : "入库，旺相暂时收纳，不影响。");
  return {entries:entries, summary:summary};
}

// ─────────────────────────────────────────────
//  ④ 旺相休囚死
// ─────────────────────────────────────────────

function qmAnalyzeWxStatus(chart, monthGZ) {
  if (!chart || !chart.palaces) return {overall:"", details:[]};
  var monthIdx = qmMonthZhiIndex(monthGZ);
  if (!monthIdx) return {overall:"", details:[]};
  var monthWx = QM_MONTH_WX[monthIdx];
  var details = [];
  for (var i = 0; i < chart.palaces.length; i++) {
    var p = chart.palaces[i];
    if (p.is_center) continue;
    var row = {palace:p.name, items:[]};
    if (p.door && QM_DOOR_WUXING[p.door]) row.items.push({name:p.door, wx:QM_DOOR_WUXING[p.door], status:qmWxStatus(QM_DOOR_WUXING[p.door], monthIdx)});
    if (p.star && QM_STAR_WUXING[p.star]) row.items.push({name:p.star, wx:QM_STAR_WUXING[p.star], status:qmWxStatus(QM_STAR_WUXING[p.star], monthIdx)});
    details.push(row);
  }
  var monthName = ["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"][monthIdx-1];
  var overall = "月令" + monthName + "月（" + monthWx + "旺），";
  var jiWang = 0, xiongWang = 0;
  for (var j = 0; j < details.length; j++) {
    for (var k = 0; k < details[j].items.length; k++) {
      var it = details[j].items[k];
      if (QM_DOOR_JI.indexOf(it.name) !== -1 && (it.status === "旺" || it.status === "相")) jiWang++;
      if (QM_DOOR_XIONG.indexOf(it.name) !== -1 && (it.status === "旺" || it.status === "相")) xiongWang++;
    }
  }
  if (jiWang > 0) overall += "吉门" + jiWang + "处得令";
  else overall += "吉门失令，吉力打折";
  if (xiongWang > 0) overall += "，凶门" + xiongWang + "处得令（凶势加重）";
  else overall += "，凶门失令，凶力减轻";
  return {overall:overall, details:details, monthWx:monthWx};
}

// ─────────────────────────────────────────────
//  ⑤ 综合四害报告
// ─────────────────────────────────────────────

/**
* 综合分析四害
* @param {Object} chart - computeQimenChart 返回的完整 chart
* @returns {Object}
*/
function analyzeFourHarms(chart) {
  if (!chart || !chart.palaces) return {fy:{}, menpo:{}, mu:{}, wxs:{}, items:[], summary:""};
  var fy = qmAnalyzeFY(chart);
  var menpo = qmAnalyzeDoorForce(chart.palaces);
  var mu = qmAnalyzeMu(chart.palaces, chart.ganzhi ? chart.ganzhi.month : "");
  var wxs = qmAnalyzeWxStatus(chart, chart.ganzhi ? chart.ganzhi.month : "");
  var jixingCount = 0;
  for (var i = 0; i < chart.palaces.length; i++) {
    if (qmCheckJixing(chart.palaces[i])) jixingCount++;
  }
  var items = [];
  if (fy.summary && fy.summary.indexOf("流动正常") === -1) items.push({type:"伏吟反吟", detail:fy.summary});
  if (menpo.summary && menpo.summary.indexOf("无门迫宫迫") === -1) items.push({type:"门迫宫迫", detail:menpo.summary});
  if (mu.summary && mu.summary.indexOf("无天干入墓") === -1) items.push({type:"入墓", detail:mu.summary});
  if (jixingCount > 0) items.push({type:"六仪击刑", detail:"有" + jixingCount + "处击刑，能量冲突激烈。"});
  if (wxs.overall) items.push({type:"旺相休囚", detail:wxs.overall});
  var summary = items.length === 0 ? "盘面无显著四害，格局清朗。" :
    "四害分析发现" + items.length + "项异常：" + items.map(function(it){return it.detail;}).join("；");
  return {fy:fy, menpo:menpo, mu:mu, wxs:wxs, jixing:jixingCount, items:items, summary:summary};
}

// ═══════════════════════════════════════════════
//  时辰吉凶分析
// ═══════════════════════════════════════════════

/** 时辰五行 */
var QM_HOUR_WUXING = {
  "子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火",
  "午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水"
};

/** 适合做的事 by question type */
var QM_TIME_SUITABLE = {
  career: ["行动推进","拜访上级","谈判签约","提方案"],
  money: ["交易下单","谈判价格","收款进账","投资决策"],
  love: ["约会见面","表白沟通","送礼物","修复关系"],
  exam: ["集中复习","模拟测试","报班咨询"],
  health: ["休息调养","就医检查","冥想放松"],
  travel: ["出发上路","订票规划","查看攻略"],
  legal: ["提交材料","咨询律师","整理证据"]
};

/** 不适合做的事 by question type */
var QM_TIME_UNSUITABLE = {
  career: ["冲动决策","辞职跳槽","签署大合同"],
  money: ["大额投资","冲动消费","借钱给人"],
  love: ["争吵冷战","翻旧账","逼迫对方"],
  exam: ["临时抱佛脚","熬夜","机械刷题"],
  health: ["过度运动","暴饮暴食","熬夜"],
  travel: ["急于赶路","深夜出行","取消行程"],
  legal: ["直接对质","情绪决策","跳过咨询"]
};

var QM_TIME_DESC = {
  career: { good: "适合行动推进，气场偏向开拓。", bad: "不宜做重要职场决策，宜观察等待。" },
  money: { good: "财气较旺，适合交易和谈判。", bad: "财星受制，不宜大额财务动作。" },
  love: { good: "感情气场柔和，适合沟通交流。", bad: "情绪容易波动，不宜谈敏感话题。" },
  exam: { good: "文昌星得力，学习效率高。", bad: "脑力运转慢，不宜高强度学习。" },
  health: { good: "气场偏稳，适合调养。", bad: "能量偏弱，注意休息。" },
  travel: { good: "出行气场顺遂，适合动身。", bad: "途中可能有阻，宜另择时日。" },
  legal: { good: "公事气场有利，适合推进。", bad: "官非信号强，宜暂缓。" }
};

/**
 * 分析当前时辰的吉凶
 * @param {Object} chart
 * @param {string} questionType - 问事类型
 * @returns {Object} { overall, suitable, unsuitable, analysis, fiveElement }
 */
function analyzeTimeLuck(chart, questionType) {
  if (!chart) return { overall: "平", suitable: [], unsuitable: [], analysis: "缺少数据" };
  
  var qtype = questionType || "career";
  var palaces = chart.palaces || [];
  var timeGZ = chart.ganzhi ? chart.ganzhi.time : "";
  var timeStem = timeGZ ? timeGZ[0] : "";
  var timeZhi = timeGZ ? timeGZ[1] : "";
  var dunType = chart.dun_type || "";
  
  // 判断时辰五行
  var hourWx = QM_HOUR_WUXING[timeZhi] || "";
  
  // 计算时干落宫状态
  var timeStemPalace = null;
  for (var i = 0; i < palaces.length; i++) {
    if (palaces[i].earth_stem === timeStem || palaces[i].sky_stem === timeStem) {
      timeStemPalace = palaces[i];
      break;
    }
  }
  
  // 评估分数
  var score = 0;
  var analysisParts = [];
  
  // 1. 遁类判断
  if (dunType === "阳遁") {
    score += 3;
    analysisParts.push("阳遁·阳气上升，宜主动。");
  } else {
    analysisParts.push("阴遁·阴气上升，宜守成。");
  }
  
  // 2. 时干落宫状态
  if (timeStemPalace) {
    if (timeStemPalace.door && QM_DOOR_JI.indexOf(timeStemPalace.door) !== -1) {
      score += 4;
      analysisParts.push("时干落" + timeStemPalace.name + "宫配" + timeStemPalace.door + "（吉门得力）。");
    } else if (timeStemPalace.door && QM_DOOR_XIONG.indexOf(timeStemPalace.door) !== -1) {
      score -= 3;
      analysisParts.push("时干落" + timeStemPalace.name + "宫配" + timeStemPalace.door + "（凶门受制）。");
    }
    if (timeStemPalace.is_kong) {
      score -= 3;
      analysisParts.push("时干落空亡宫，事易虚。");
    }
    if (timeStemPalace.god === "白虎" || timeStemPalace.god === "玄武") {
      score -= 2;
      analysisParts.push("时干临" + timeStemPalace.god + "（有干扰）。");
    }
    if (timeStemPalace.sky_stem && ["乙","丙","丁"].indexOf(timeStemPalace.sky_stem) !== -1) {
      score += 3;
      analysisParts.push("时干临三奇（" + timeStemPalace.sky_stem + "），有转机。");
    }
  } else {
    analysisParts.push("时干" + (timeStem || "?") + "落宫未定位。");
  }
  
  // 3. 吉门/凶门整体统计
  var goodDoorCount = 0, badDoorCount = 0;
  for (var i = 0; i < palaces.length; i++) {
    if (palaces[i].is_center) continue;
    if (palaces[i].door) {
      if (QM_DOOR_JI.indexOf(palaces[i].door) !== -1) goodDoorCount++;
      if (QM_DOOR_XIONG.indexOf(palaces[i].door) !== -1) badDoorCount++;
    }
  }
  if (goodDoorCount > badDoorCount) {
    score += 2;
    analysisParts.push("盘中吉门偏多，整体气场积极。");
  } else if (badDoorCount > goodDoorCount) {
    score -= 2;
    analysisParts.push("盘中凶门偏多，气场有压力。");
  }
  
  // 综合评级
  var overall = "平";
  if (score >= 8) overall = "大吉";
  else if (score >= 3) overall = "吉";
  else if (score <= -6) overall = "大凶";
  else if (score <= -3) overall = "凶";
  // 剩余 score 在 0~1.99 之间 → 平
  
  // 适合/不适合做的事
  var suitable = QM_TIME_SUITABLE[qtype] || QM_TIME_SUITABLE.career;
  var unsuitable = QM_TIME_UNSUITABLE[qtype] || QM_TIME_UNSUITABLE.career;
  
  // 根据评分调整建议
  if (overall === "大凶" || overall === "凶") {
    suitable = ["不宜行动，宜等待观察"];
  } else if (overall === "大吉") {
    unsuitable = []; // 大吉时无忌
  }
  
  // 综合描述
  var timeDesc = QM_TIME_DESC[qtype] || QM_TIME_DESC.career;
  var finalAnalysis = (overall === "吉" || overall === "大吉" ? timeDesc.good : timeDesc.bad) + " ";
  finalAnalysis += analysisParts.join("");
  
  return {
    overall: overall,
    suitable: suitable,
    unsuitable: unsuitable,
    analysis: finalAnalysis,
    fiveElement: hourWx,
    timeGZ: timeGZ,
    score: score
  };
}

// ═══════════════════════════════════════════════
//  化解与调理方案
// ═══════════════════════════════════════════════

/** 各事类的化解调理方案 */
var QM_REMEDIES_DATA = {
  career: {
    title: "事业工作",
    directionalTips: {
      good: ["东方（震宫）","西北方（乾宫）"],
      avoid: ["西南方（坤宫）"]
    },
    timing: "选择吉门所在的时辰行动，避开白虎/玄武临宫的时辰。",
    actions: [
      { type:"do", text:"主动向上级汇报工作，展示成果" },
      { type:"do", text:"拜访重要合作伙伴，促进项目落地" },
      { type:"do", text:"整理工作计划和方案，为下一步做准备" },
      { type:"dont", text:"避免与同事发生正面冲突" },
      { type:"dont", text:"不宜在凶门方位办公或谈判" },
      { type:"dont", text:"不要冲动跳槽或递交辞职信" }
    ],
    placement: "在办公桌的吉位（开门方位）放置绿色植物或水晶，增强气场。",
    color: "宜穿白色、金色、蓝色系衣服，忌穿红色。",
    psychology: "保持积极主动的心态，但不要急于求成。好的机会需要时间和耐心。"
  },
  money: {
    title: "财运求财",
    directionalTips: {
      good: ["正西（兑宫）","西北（乾宫）"],
      avoid: ["正北（坎宫）"]
    },
    timing: "生门、开门旺相的时辰最利求财交易。",
    actions: [
      { type:"do", text:"适宜进行投资决策和交易谈判" },
      { type:"do", text:"追收欠款或确认应收款项" },
      { type:"do", text:"开拓新客户或渠道" },
      { type:"dont", text:"避免冲动消费和大额借贷" },
      { type:"dont", text:"不宜参与高风险投机" },
      { type:"dont", text:"不要借钱给不太熟的人" }
    ],
    placement: "在家中或办公室的财位（生门方位）摆放黄水晶或聚宝盆。",
    color: "宜穿黄色、金色系，忌穿黑色。",
    psychology: "财运需要把握时机，但也要有长远规划。不要因为一时的得失影响判断。"
  },
  love: {
    title: "感情姻缘",
    directionalTips: {
      good: ["东南（巽宫）","正南（离宫）"],
      avoid: ["正北（坎宫）"]
    },
    timing: "六合、太阴所在的时辰适合约会和沟通。",
    actions: [
      { type:"do", text:"主动约对方出门交流" },
      { type:"do", text:"准备小惊喜或礼物增进感情" },
      { type:"do", text:"坦诚沟通彼此的想法和需求" },
      { type:"dont", text:"避免翻旧账或指责对方" },
      { type:"dont", text:"不宜在冲动时做重大感情决定" },
      { type:"dont", text:"不要冷战，有矛盾及时沟通" }
    ],
    placement: "在家中东南方（巽宫/桃花位）摆放粉色水晶或鲜花。",
    color: "宜穿粉色、红色、浅色系，忌穿黑色。",
    psychology: "感情需要经营，不是计较得失。多站在对方角度思考，包容才能长久。"
  },
  exam: {
    title: "考试学习",
    directionalTips: {
      good: ["东南（巽宫）","正南（离宫）"],
      avoid: ["东北（艮宫）"]
    },
    timing: "天辅星或景门所在的时辰学习效率高。",
    actions: [
      { type:"do", text:"集中精力攻克重点难点" },
      { type:"do", text:"做模拟题检验学习成果" },
      { type:"do", text:"请教老师或同学讨论问题" },
      { type:"dont", text:"避免熬夜临时抱佛脚" },
      { type:"dont", text:"不宜频繁切换学习科目" },
      { type:"dont", text:"不要给自己太大压力" }
    ],
    placement: "在书桌的文昌位（天辅所落宫位方向）放置四支毛笔或文昌塔。",
    color: "宜穿绿色、蓝色系，忌穿红色。",
    psychology: "考试不仅考知识，更考心态。保持平常心，稳定发挥就是最好的结果。"
  },
  health: {
    title: "健康疾病",
    directionalTips: {
      good: ["正西（兑宫）","西北（乾宫）"],
      avoid: ["东北（艮宫）","西南（坤宫）"]
    },
    timing: "天心星或休门所在的时辰适合就医和调养。",
    actions: [
      { type:"do", text:"按时就医检查，不要拖延" },
      { type:"do", text:"适当休息，保证充足的睡眠" },
      { type:"do", text:"做一些温和的运动如散步、太极" },
      { type:"dont", text:"避免过度劳累和熬夜" },
      { type:"dont", text:"不宜暴饮暴食或极端节食" },
      { type:"dont", text:"不要忽视身体发出的警告信号" }
    ],
    placement: "在家中或办公室的西方放置白水晶或盐灯净化能量。",
    color: "宜穿白色、金色、蓝色系。",
    psychology: "身体是革命的本钱。健康问题不要拖延，早发现早治疗。保持乐观心态有助于康复。"
  },
  travel: {
    title: "出行方位",
    directionalTips: {
      good: ["正北（坎宫）","正东（震宫）"],
      avoid: ["正西（兑宫）","西南（坤宫）"]
    },
    timing: "开门、休门所在的时辰适合出发。",
    actions: [
      { type:"do", text:"提前规划路线和备份方案" },
      { type:"do", text:"选择吉时吉方出发" },
      { type:"do", text:"准备好必要的证件和物品" },
      { type:"dont", text:"避免在凶门方位远行" },
      { type:"dont", text:"不宜仓促出发、准备不足" },
      { type:"dont", text:"不要忽视当地天气和安全提示" }
    ],
    placement: "出行时随身携带一块玉石或平安符。",
    color: "宜穿蓝色、白色系。",
    psychology: "出行重在安全，不要太赶。旅途中保持开放心态，享受过程。"
  },
  legal: {
    title: "诉讼合同",
    directionalTips: {
      good: ["正西（兑宫）","西北（乾宫）"],
      avoid: ["正北（坎宫）","东北（艮宫）"]
    },
    timing: "开门所在的时辰最利处理和签署合同。",
    actions: [
      { type:"do", text:"整理好所有合同文件和证据" },
      { type:"do", text:"咨询专业律师的意见" },
      { type:"do", text:"选择吉时签署重要文件" },
      { type:"dont", text:"避免在情绪激动时做决定" },
      { type:"dont", text:"不宜跳过法律咨询自行处理" },
      { type:"dont", text:"不要签有疑问的条款" }
    ],
    placement: "在办公桌西北方（乾宫）放置金属摆件或天平摆件。",
    color: "宜穿白色、金色、黑色系。",
    psychology: "诉讼和合同需要冷静理性的处理。不要被情绪左右，一切以事实和法律为准。"
  }
};

/** 默认调理方案 */
var QM_REMEDIES_DEFAULT = {
  title: "通用调理",
  directionalTips: {
    good: ["值符所在方位","吉门所在的方位"],
    avoid: ["凶门所在的方位"]
  },
  timing: "选择吉门吉神较多的时辰行动。",
  actions: [
    { type:"do", text:"先观察盘面吉凶，再做决策" },
    { type:"do", text:"选择值符所在的方位办事" },
    { type:"dont", text:"避免在空亡宫位做重要决定" },
    { type:"dont", text:"不宜在凶神临宫的方位行动" }
  ],
  placement: "在吉位摆放绿色植物或水晶，增强能量。",
  color: "根据日主五行选择适合的颜色。",
  psychology: "凡事有定数也有变数。奇门告诉你时机和方位，但最终决定权在你手上。"
};

/**
 * 获取化解调理方案
 * @param {Object} chart
 * @param {string} questionType - 问事类型
 * @returns {Object} { title, directionalTips, timing, actions, placement, color, psychology, directionAnalysis }
 */
function getRemedies(chart, questionType) {
  if (!chart) {
    return { title: "无数据", directionalTips: {good:[],avoid:[]}, timing: "", actions: [], placement: "", color: "", psychology: "" };
  }
  
  var qtype = questionType || "career";
  var remedies = QM_REMEDIES_DATA[qtype] || QM_REMEDIES_DEFAULT;
  
  // 分析实际方向
  var dirResults = analyzeDirection(chart);
  
  // 找到最佳和最差方向
  var bestDir = dirResults.length > 0 ? dirResults[0] : null;
  var worstDir = dirResults.length > 0 ? dirResults[dirResults.length - 1] : null;
  
  // 生成实际方位建议
  var goodDirs = [];
  var avoidDirs = [];
  for (var i = 0; i < dirResults.length; i++) {
    if (dirResults[i].level === "大吉" || dirResults[i].level === "吉") {
      goodDirs.push(dirResults[i].direction);
    } else if (dirResults[i].level === "大凶" || dirResults[i].level === "凶") {
      avoidDirs.push(dirResults[i].direction);
    }
  }
  
  // 时间分析
  var timeLuck = analyzeTimeLuck(chart, qtype);
  
  // 深度整合的方位建议
  var directionalAnalysis = "";
  if (bestDir) {
    directionalAnalysis = "最佳方位为【" + bestDir.direction + "方】，评分" + bestDir.score.toFixed(1) + "分，" + bestDir.detail;
  }
  if (worstDir && worstDir.level === "大凶") {
    directionalAnalysis += " 最忌方位为【" + worstDir.direction + "方】，" + worstDir.detail;
  }
  
  // 动态调整 actions
  var actions = JSON.parse(JSON.stringify(remedies.actions));
  
  // 如果时辰大凶，添加等待建议
  if (timeLuck.overall === "大凶" || timeLuck.overall === "凶") {
    actions.unshift({ type:"dont", text:"当前时辰偏凶，建议先等待，换一个时辰再行动" });
  }
  
  // 动态生成方向建议
  var directionalTips = {
    good: goodDirs.length > 0 ? goodDirs.map(function(d){ return d + "方"; }) : remedies.directionalTips.good,
    avoid: avoidDirs.length > 0 ? avoidDirs.map(function(d){ return d + "方"; }) : remedies.directionalTips.avoid
  };
  
  return {
    title: remedies.title,
    directionalTips: directionalTips,
    timing: timeLuck.overall === "吉" || timeLuck.overall === "大吉" ? "当前时辰吉利，" + timeLuck.analysis : remedies.timing + " " + timeLuck.analysis,
    actions: actions,
    placement: remedies.placement,
    color: remedies.color,
    psychology: remedies.psychology,
    directionAnalysis: directionalAnalysis,
    timeLuck: timeLuck
  };
}

// ═══════════════════════════════════════════════
//  综合行动建议
// ═══════════════════════════════════════════════

/**
 * 获取综合行动建议
 * @param {Object} chart
 * @param {string} questionType - 问事类型
 * @returns {Object} { overall, canAct, bestDirection, bestTime, suggestedActions, avoidActions, fullAnalysis }
 */
function getActionAdvice(chart, questionType) {
  if (!chart) {
    return { overall: "缺少盘数据", canAct: false, bestDirection: "", bestTime: "", suggestedActions: [], avoidActions: [], fullAnalysis: "请先起盘" };
  }
  
  var qtype = questionType || "career";
  
  // 整合所有分析
  var dirResults = analyzeDirection(chart);
  var timeLuck = analyzeTimeLuck(chart, qtype);
  var remedies = getRemedies(chart, qtype);
  
  // 综合评分
  var totalScore = 0;
  totalScore += timeLuck.score * 1.5; // 时间权重高
  
  // 最佳/最差方向
  var bestDir = dirResults.length > 0 ? dirResults[0] : null;
  
  // 格局分析（复用已有的）
  var gejuResult = null;
  if (typeof window !== 'undefined' && typeof window.analyzeGeju === 'function') {
    gejuResult = window.analyzeGeju(chart);
  } else if (typeof analyzeGeju === 'function') {
    gejuResult = analyzeGeju(chart);
  }
  
  if (gejuResult) {
    var luckyCount = gejuResult.lucky ? gejuResult.lucky.length : 0;
    var unluckyCount = gejuResult.unlucky ? gejuResult.unlucky.length : 0;
    totalScore += (luckyCount - unluckyCount) * 0.5;
  }
  
  // 判断是否适合行动
  var canAct = totalScore >= 0;
  
  // 最佳时段
  var bestTime = "";
  if (chart.ganzhi && chart.ganzhi.time) {
    bestTime = "当前时辰【" + chart.ganzhi.time + "】";
    if (timeLuck.overall === "大吉" || timeLuck.overall === "吉") {
      bestTime += "，是吉时，适合行动。";
    } else {
      bestTime += "，偏" + timeLuck.overall + "，建议等待更好的时机。";
    }
  } else {
    bestTime = "请设定时辰后重试。";
  }
  
  // 最佳方向文字
  var bestDirection = "";
  if (bestDir) {
    bestDirection = bestDir.direction + "方（评分" + bestDir.score.toFixed(1) + "，" + bestDir.level + "）";
  } else {
    bestDirection = "未确定";
  }
  
  // 综合判断
  var overall = "";
  if (totalScore >= 5) {
    overall = "大吉 —— 当前气场非常适合行动，果断推进！";
  } else if (totalScore >= 2) {
    overall = "偏吉 —— 可以行动，注意选择有利的方位和方式。";
  } else if (totalScore >= -1) {
    overall = "平 —— 吉凶参半，建议选择性行动，规避不利因素。";
  } else if (totalScore >= -3) {
    overall = "偏凶 —— 当前不太顺利，建议等待或调整策略。";
  } else {
    overall = "大凶 —— 当前气场严重不利，强烈建议等待，不要贸然行动。";
  }
  
  // 生成建议和禁忌
  var suggestedActions = [];
  var avoidActions = [];
  
  // 从remedies获取
  if (remedies.actions) {
    for (var i = 0; i < remedies.actions.length; i++) {
      if (remedies.actions[i].type === "do") {
        suggestedActions.push(remedies.actions[i].text);
      } else {
        avoidActions.push(remedies.actions[i].text);
      }
    }
  }
  
  // 加上时辰相关的建议
  if (timeLuck.suitable) {
    for (var i = 0; i < timeLuck.suitable.length; i++) {
      if (suggestedActions.indexOf(timeLuck.suitable[i]) === -1) {
        suggestedActions.unshift(timeLuck.suitable[i]);
      }
    }
  }
  if (timeLuck.unsuitable) {
    for (var i = 0; i < timeLuck.unsuitable.length; i++) {
      if (avoidActions.indexOf(timeLuck.unsuitable[i]) === -1) {
        avoidActions.unshift(timeLuck.unsuitable[i]);
      }
    }
  }
  
  // 取前几条
  suggestedActions = suggestedActions.slice(0, 5);
  avoidActions = avoidActions.slice(0, 5);
  
  // 完整分析
  var fullAnalysis = "";
  fullAnalysis += "【整体判断】" + overall + "\n";
  fullAnalysis += "【最佳方向】" + bestDirection + "\n";
  fullAnalysis += "【最佳时段】" + bestTime + "\n";
  fullAnalysis += "【时机分析】" + timeLuck.analysis + "\n";
  if (bestDir) {
    fullAnalysis += "【方位分析】" + bestDir.detail + "\n";
  }
  if (remedies.directionAnalysis) {
    fullAnalysis += "【方位建议】" + remedies.directionAnalysis + "\n";
  }
  fullAnalysis += "【调理建议】" + remedies.psychology + "\n";
  
  return {
    overall: overall,
    canAct: canAct,
    totalScore: totalScore.toFixed(1),
    bestDirection: bestDirection,
    bestTime: bestTime,
    suggestedActions: suggestedActions,
    avoidActions: avoidActions,
    fullAnalysis: fullAnalysis,
    timeLuck: timeLuck,
    dirResults: dirResults,
    remedies: remedies
  };
}

// ═══════════════════════════════════════════════
//  个人五行补益系统 — 串联八字五行缺失和奇门方向建议
// ═══════════════════════════════════════════════

/** 五行 → 方向映射 */
var WUXI_DIRECTION_MAP = {
  "金": [{dir:"西", palace:7}, {dir:"西北", palace:6}],
  "木": [{dir:"东", palace:3}, {dir:"东南", palace:4}],
  "水": [{dir:"北", palace:1}],
  "火": [{dir:"南", palace:9}],
  "土": [{dir:"东北", palace:8}, {dir:"西南", palace:2}]
};

/** 五行 → 颜色建议 */
var WUXI_COLOR_MAP = {
  "金": {colors:["白色","金色","银色","杏色"], desc:"白色、金色系，如白衬衫、金色饰品"},
  "木": {colors:["绿色","青色","翠色"], desc:"绿色、青色系，如绿植、青玉"},
  "水": {colors:["黑色","蓝色","藏青"], desc:"黑色、蓝色系，如深蓝外套、黑曜石"},
  "火": {colors:["红色","紫色","橙色","粉色"], desc:"红色、紫色系，如红绳、紫水晶"},
  "土": {colors:["黄色","棕色","米色","咖色"], desc:"黄色、棕色系，如黄玉、土黄衣物"}
};

/** 五行 → 行为建议 */
var WUXI_ACTION_MAP = {
  "金": ["多做决策性工作，培养决断力","练习演讲和表达，增强气场","整理房间，断舍离，去除杂物","规律运动，如跑步、健身"],
  "木": ["多去公园、山林等自然环境中散步","培养新技能或爱好，保持学习","做计划和规划，画思维导图","种植花草，亲近绿色植物"],
  "水": ["多喝水、泡澡、游泳等亲水活动","静坐冥想，养神安眠","阅读和写作，培养思考习惯","练习倾听，少说多听"],
  "火": ["多做让自己开心的事，培养热情","主动社交，结交新朋友","开展创意类工作，画画、写作","早晨晒太阳，吸收阳气"],
  "土": ["保持规律作息，建立稳定生活习惯","做长期积累的事，如定投、储蓄","多和家人朋友团聚，接地气","做公益或志愿服务，稳固根基"]
};

/** 五行 → 物品建议 */
var WUXI_ITEM_MAP = {
  "金": {items:["金属饰品（金/银）","白水晶","金属摆件","硬币或铜钱"], desc:"佩戴金属饰品、白水晶，办公桌放金属摆件"},
  "木": {items:["绿色植物","木质饰品","书本文具","绿玉或翡翠"], desc:"桌上放绿植，佩戴木质手串或绿色玉石"},
  "水": {items:["黑曜石","蓝色饰品","鱼缸或流水摆件","水杯常满"], desc:"佩戴黑曜石，办公桌放小型流水摆件"},
  "火": {items:["红绳或红玛瑙","紫水晶","蜡烛或香薰","暖色系饰品"], desc:"系红绳、佩戴紫水晶或红玛瑙"},
  "土": {items:["黄水晶","陶瓷摆件","玉石","黄玉"], desc:"佩戴黄水晶，家中放陶瓷或黄玉摆件"}
};

/** 五行 → 时辰建议（地支时辰，该五行能量最强之时辰） */
var WUXI_HOUR_MAP = {
  "金": {zhi:"申酉", period:"15:00-19:00（申时、酉时，金气旺盛）"},
  "木": {zhi:"寅卯", period:"03:00-07:00（寅时、卯时，木气升发）"},
  "水": {zhi:"亥子", period:"21:00-01:00（亥时、子时，水气最盛）"},
  "火": {zhi:"巳午", period:"09:00-13:00（巳时、午时，火气当令）"},
  "土": {zhi:"辰戌丑未", period:"辰(7-9)、戌(19-21)、丑(1-3)、未(13-15)——土旺于四季之交"}
};

/** 五行 → 吉祥数字 */
var WUXI_NUMBER_MAP = {
  "金": "4、9（金之生数）",
  "木": "3、8（木之生数）",
  "水": "1、6（水之生数）",
  "火": "2、7（火之生数）",
  "土": "5、10（土之生数）"
};

/** 五行 → 季节补益 */
var WUXI_SEASON_MAP = {
  "金": "秋季（秋金当令，此时节补金效果最佳）",
  "木": "春季（春木生发，此时节补木最为顺势）",
  "水": "冬季（冬水归藏，此时节补水最为适宜）",
  "火": "夏季（夏火炎上，此时节补火最为得力）",
  "土": "季末（每季最后18天，土旺之时）"
};

/**
 * 获取个人五行补益建议
 * @param {Object} chart - computeQimenChart 返回的 chart 对象
 * @param {Object} wuxiDeficiency - getWuxiDeficiency 返回的结果
 * @returns {Object} { summary, dayMasterInfo, remedies: [{wuxi, type, suggestions}] }
 */
function getPersonalAdvice(chart, wuxiDeficiency) {
  if (!wuxiDeficiency || (!wuxiDeficiency.deficiency.length && !wuxiDeficiency.weakest)) {
    return null;
  }

  // 分析奇门盘中各方向能量
  var dirResults = [];
  if (chart && typeof analyzeDirection === 'function') {
    dirResults = analyzeDirection(chart);
  }
  var dirMap = {};
  dirResults.forEach(function(r) { dirMap[r.direction] = r; });

  var remedies = [];
  var allNeeded = [];

  // 先收集缺失的五行
  wuxiDeficiency.deficiency.forEach(function(wx) {
    allNeeded.push({ wuxi: wx, type: "缺失" });
  });

  // 再收集偏弱的五行（如果还没有被缺失覆盖）
  if (wuxiDeficiency.weakest && allNeeded.every(function(n) { return n.wuxi !== wuxiDeficiency.weakest; })) {
    allNeeded.push({ wuxi: wuxiDeficiency.weakest, type: "偏弱" });
  }

  allNeeded.forEach(function(item) {
    var wx = item.wuxi;
    var type = item.type;

    // 方位建议
    var directionInfo = WUXI_DIRECTION_MAP[wx] || [];
    var dirAdvice = directionInfo.map(function(d) {
      var qmDir = dirMap[d.dir] || null;
      var qmLevel = qmDir ? qmDir.level : "未知";
      var qmScore = qmDir ? qmDir.score.toFixed(1) : "?";
      var qmTag = "";
      if (qmDir) {
        if (qmDir.level === "大吉" || qmDir.level === "吉") {
          qmTag = "（吉，当前气场有利✅）";
        } else if (qmDir.level === "凶" || qmDir.level === "大凶") {
          qmTag = "（凶，当前气场不利⚠️）";
        } else {
          qmTag = "（平，气场中性）";
        }
      }
      return {
        direction: d.dir,
        palace: d.palace,
        qimenLevel: qmLevel,
        qimenScore: qmScore,
        qimenTag: qmTag
      };
    });

    var colors = WUXI_COLOR_MAP[wx] || {colors:[], desc:""};
    var actions = WUXI_ACTION_MAP[wx] || [];
    var items = WUXI_ITEM_MAP[wx] || {items:[], desc:""};
    var hourInfo = WUXI_HOUR_MAP[wx] || {zhi:"", period:""};
    var numbers = WUXI_NUMBER_MAP[wx] || "";
    var season = WUXI_SEASON_MAP[wx] || "";

    // 综合奇门方向推荐
    var qimenRecommendation = "";
    if (dirAdvice.length > 0) {
      var bestDir = null;
      var worstDir = null;
      dirAdvice.forEach(function(d) {
        if (d.qimenLevel === "大吉" || d.qimenLevel === "吉") {
          if (!bestDir || (d.qimenScore && parseFloat(d.qimenScore) > parseFloat(bestDir.qimenScore))) {
            bestDir = d;
          }
        }
        if (d.qimenLevel === "凶" || d.qimenLevel === "大凶") {
          if (!worstDir || (d.qimenScore && parseFloat(d.qimenScore) < parseFloat(worstDir.qimenScore))) {
            worstDir = d;
          }
        }
      });
      if (bestDir) {
        qimenRecommendation = "当前奇门盘中，" + wx + "对应的【" + bestDir.direction + "方】为" + bestDir.qimenLevel + "方向（" + bestDir.qimenScore + "分），宜往此方行走或办事。";
      } else {
        var neutralDir = dirAdvice[0];
        qimenRecommendation = "当前奇门盘中，" + wx + "对应的【" + neutralDir.direction + "方】气场" + neutralDir.qimenLevel + "，可酌情使用。";
      }
      if (worstDir) {
        qimenRecommendation += " 忌往【" + worstDir.direction + "方】，当前为" + worstDir.qimenLevel + "方向。";
      }
    }

    remedies.push({
      wuxi: wx,
      type: type,
      directionAdvice: dirAdvice,
      colors: colors,
      actions: actions,
      items: items,
      hourInfo: hourInfo,
      numbers: numbers,
      season: season,
      qimenRecommendation: qimenRecommendation,
      // 综合五行生克原理的补益说明
      principle: getWuxiPrinciple(wx, wuxiDeficiency.dayMasterWuxing)
    });
  });

  // 日主信息
  var dayMasterInfo = {
    dayMaster: wuxiDeficiency.dayMaster,
    dayMasterWuxing: wuxiDeficiency.dayMasterWuxing,
    counts: wuxiDeficiency.counts
  };

  return {
    summary: generateWuxiSummary(wuxiDeficiency),
    dayMasterInfo: dayMasterInfo,
    remedies: remedies
  };
}

/**
 * 获取五行补益原理说明
 */
function getWuxiPrinciple(wx, dayMasterWx) {
  var principles = {
    "金": "金主义，主决断、肃杀、收敛。五行'金生水'，补金可以增强决策力和执行力。金对应白色和西方，与呼吸系统、皮肤相关。",
    "木": "木主仁，主生发、条达、舒展。五行'木生火'，补木可以增强成长力和创造力。木对应绿色和东方，与肝胆、神经系统相关。",
    "水": "水主智，主流动、智慧、收藏。五行'水生木'，补水可以增强智慧和适应力。水对应黑色和北方，与肾脏、泌尿系统相关。",
    "火": "火主礼，主热烈、升腾、光明。五行'火生土'，补火可以增强热情和表达力。火对应红色和南方，与心脏、血液循环相关。",
    "土": "土主信，主承载、生化、包容。五行'土生金'，补土可以增强稳定性和信任感。土对应黄色和中央，与脾胃、消化系统相关。"
  };
  var p = principles[wx] || "";
  if (dayMasterWx) {
    p += " 你的日主为" + dayMasterWx + "，";
    // 判断生克关系
    var wxCycle = ["木","火","土","金","水"];
    var mi = wxCycle.indexOf(dayMasterWx);
    var oi = wxCycle.indexOf(wx);
    if (mi !== -1 && oi !== -1) {
      if ((mi + 1) % 5 === oi) {
        p += dayMasterWx + "生" + wx + "（" + dayMasterWx + "→" + wx + "），补" + wx + "会泄耗日主之气。";
      } else if ((mi + 2) % 5 === oi) {
        p += dayMasterWx + "克" + wx + "（" + dayMasterWx + "→" + wx + "），补" + wx + "可以平衡日主过旺之势。";
      } else if ((oi + 1) % 5 === mi) {
        p += wx + "生" + dayMasterWx + "（" + wx + "→" + dayMasterWx + "），补" + wx + "可以滋养日主，最为有利。";
      } else if ((oi + 2) % 5 === mi) {
        p += wx + "克" + dayMasterWx + "（" + wx + "→" + dayMasterWx + "），补" + wx + "需适度，过量则克伤日主。";
      } else {
        p += "与日主五行相同，补" + wx + "可以增强日主自身力量。";
      }
    }
  }
  return p;
}

/**
 * 生成五行概况总结
 */
function generateWuxiSummary(wxi) {
  var parts = [];
  var counts = wxi.counts;
  if (counts) {
    var total = 0;
    ["木","火","土","金","水"].forEach(function(wx) { total += counts[wx] || 0; });
    parts.push("八字四柱中，五行共" + total + "计（天干×4+地支×4=8字）：");
    var countStrs = [];
    ["木","火","土","金","水"].forEach(function(wx) {
      var c = counts[wx] || 0;
      var extra = "";
      if (wx === wxi.dayMasterWuxing) extra = "（日主）";
      if (c === 0) extra = "⚠缺失";
      countStrs.push(wx + "×" + c + extra);
    });
    parts.push(countStrs.join("，") + "。");
  }
  if (wxi.deficiency.length > 0) {
    parts.push("缺失五行：<b style='color:var(--cinnabar)'>" + wxi.deficiency.join("、") + "</b>，需重点补益。");
  }
  if (wxi.weakest && wxi.deficiency.indexOf(wxi.weakest) === -1) {
    parts.push("偏弱五行：<b style='color:#8a6d3b'>" + wxi.weakest + "</b>，建议适当加强。");
  }
  if (wxi.dayMaster && wxi.dayMasterWuxing) {
    parts.push("日主为<b>" + wxi.dayMaster + wxi.dayMasterWuxing + "</b>，日主五行是" + wxi.dayMasterWuxing + "。");
  }
  return parts.join("");
}

// 导出到全局
if (typeof window !== 'undefined') {
  window.getPersonalAdvice = getPersonalAdvice;
  window.WUXI_DIRECTION_MAP = WUXI_DIRECTION_MAP;
  window.WUXI_COLOR_MAP = WUXI_COLOR_MAP;
  window.WUXI_ACTION_MAP = WUXI_ACTION_MAP;
  window.WUXI_ITEM_MAP = WUXI_ITEM_MAP;
  window.WUXI_HOUR_MAP = WUXI_HOUR_MAP;
  window.WUXI_NUMBER_MAP = WUXI_NUMBER_MAP;
  window.WUXI_SEASON_MAP = WUXI_SEASON_MAP;
}

// 导出到全局
if (typeof window !== 'undefined') {
  window.computeQimenChart = computeQimenChart;
  window.analyzeYongshen = analyzeYongshen;
  window.analyzeGeju = analyzeGeju;
  window.analyzeDirection = analyzeDirection;
  window.analyzeTimeLuck = analyzeTimeLuck;
  window.analyzeFourHarms = analyzeFourHarms;
  window.analyzeClassicPatterns = analyzeClassicPatterns;
  window.getRemedies = getRemedies;
  window.getActionAdvice = getActionAdvice;
}
if (typeof module !== 'undefined') {
  module.exports = {
    computeQimenChart: computeQimenChart,
    analyzeYongshen: analyzeYongshen,
    analyzeGeju: analyzeGeju,
    analyzeDirection: analyzeDirection,
    analyzeTimeLuck: analyzeTimeLuck,
    analyzeFourHarms: analyzeFourHarms,
    analyzeClassicPatterns: analyzeClassicPatterns,
    getRemedies: getRemedies,
    getActionAdvice: getActionAdvice
  };
}
