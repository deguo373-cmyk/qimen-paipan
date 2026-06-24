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
      lunar: {
        year: year,
        month: month,
        day: day,
        month_text: String(month) + '月',
        day_text: String(day) + '日',
        is_leap_month: false
      },
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

// 导出到全局作用域
if (typeof window !== 'undefined') {
  window.computeQimenChart = computeQimenChart;
  window.analyzeYongshen = analyzeYongshen;
  window.analyzeGeju = analyzeGeju;
}
if (typeof module !== 'undefined') {
  module.exports = {
    computeQimenChart: computeQimenChart,
    analyzeYongshen: analyzeYongshen,
    analyzeGeju: analyzeGeju
  };
}
