/* ═══════════════════════════════════════════════
   八字排盘 · 纯算法计算引擎
   不依赖任何外部库，纯数学计算
   移植自 api/bazi.py (319行 Python → JS)
   ═══════════════════════════════════════════════ */

// ── 天干五行 ──────────────────────────────────
var TIANGAN_WUXING = {
  "甲":"木","乙":"木","丙":"火","丁":"火",
  "戊":"土","己":"土","庚":"金","辛":"金","壬":"水","癸":"水"
};
var TIANGAN_YINYANG = {
  "甲":"阳","乙":"阴","丙":"阳","丁":"阴",
  "戊":"阳","己":"阴","庚":"阳","辛":"阴","壬":"阳","癸":"阴"
};

// ── 地支藏干 ──────────────────────────────────
var DIZHI_CANGGAN = {
  "子":["癸"],"丑":["己","癸","辛"],"寅":["甲","丙","戊"],
  "卯":["乙"],"辰":["戊","乙","癸"],"巳":["丙","庚","戊"],
  "午":["丁","己"],"未":["己","丁","乙"],"申":["庚","壬","戊"],
  "酉":["辛"],"戌":["戊","辛","丁"],"亥":["壬","甲"]
};

// ── 纳音表（年柱纳音，60甲子对应） ──────────────
var NAYIN_60 = [
  "海中金","炉中火","大林木","路旁土","剑锋金","山头火",
  "涧下水","城头土","白蜡金","杨柳木","泉中水","屋上土",
  "霹雳火","松柏木","长流水","砂石金","山下火","平地木",
  "壁上土","金箔金","覆灯火","天河水","大驿土","钗钏金",
  "桑柘木","大溪水","沙中土","天上火","石榴木","大海水"
];
function getNayin(gan, zhi){
  // 60甲子: 甲子0,乙丑1,... 取纳音
  /* 纳音规则: 甲子乙丑海中金, 丙寅丁卯炉中火, ...
     每组两个干支共享一个纳音, 每30组循环 */
  var idx = ganIndex(gan) * 6 + Math.floor(zhiIndex(zhi) / 2);
  idx = idx % 30;
  idx = Math.floor(idx / 2) * 2; // 每组两个干支
  // Using a lookup table for 60甲子 → 纳音
  return NAYIN_60[Math.floor(idx / 2) % 30];
}

var WUXING = ["木","火","土","金","水"];
var GAN_LIST = "甲乙丙丁戊己庚辛壬癸";
var ZHI_LIST = "子丑寅卯辰巳午未申酉戌亥";

function wuxingIndex(wx){ return WUXING.indexOf(wx); }
function ganIndex(g){ return GAN_LIST.indexOf(g); }
function zhiIndex(z){ return ZHI_LIST.indexOf(z); }

function getShiShen(dayGan, otherGan){
  var dayWx = TIANGAN_WUXING[dayGan];
  var otherWx = TIANGAN_WUXING[otherGan];
  var dayYy = TIANGAN_YINYANG[dayGan];
  var otherYy = TIANGAN_YINYANG[otherGan];

  if(dayWx === otherWx) return dayYy === otherYy ? "比肩" : "劫财";

  var di = wuxingIndex(dayWx), oi = wuxingIndex(otherWx);

  // 日主生其他 (我生)
  if((di+1)%5===oi) return dayYy!==otherYy ? "伤官" : "食神";
  if((di+2)%5===oi) return dayYy!==otherYy ? "食神" : "伤官";

  // 其他生日主 (生我)
  if((oi+1)%5===di) return dayYy!==otherYy ? "正印" : "偏印";
  if((oi+2)%5===di) return dayYy!==otherYy ? "偏印" : "正印";

  // 日主克其他 (我克)
  if((di+4)%5===oi) return dayYy!==otherYy ? "正财" : "偏财";
  if((di+3)%5===oi) return dayYy!==otherYy ? "偏财" : "正财";

  // 其他克日主 (克我)
  if((oi+4)%5===di) return dayYy!==otherYy ? "正官" : "七杀";
  if((oi+3)%5===di) return dayYy!==otherYy ? "七杀" : "正官";

  return "?";
}

// ── 日柱计算 ──────────────────────────────────
// 基准: 1900-01-01 = 甲戌日 (gan=0, zhi=10)
var REF_DATE = new Date(1900, 0, 1); // Jan 1, 1900
// 偏移: 1 Jan 1900 的干支 甲=0, 戌=10

function calculateDayGanZhi(year, month, day){
  // 计算从1900-01-01到目标日期的天数
  var target = new Date(year, month-1, day);
  var diff = Math.round((target - REF_DATE) / 86400000);
  // 1900-01-01 是甲戌日 (gan=0, zhi=10)
  var gan = ((diff % 10) + 10) % 10;
  var zhi = ((diff + 10) % 12 + 12) % 12;
  return { gan: GAN_LIST[gan], zhi: ZHI_LIST[zhi], ganzhi: GAN_LIST[gan] + ZHI_LIST[zhi] };
}

// ── 年柱计算（以立春为界）────────────────────
// 立春通常在2月4日左右
function calculateYearGanZhi(year, month, day){
  // 立春日期（简化：2月4日）
  var lichunDate = new Date(year, 1, 4);
  var birthDate = new Date(year, month-1, day);
  var actualYear = (birthDate < lichunDate && month <= 2) ? year - 1 : year;
  var gan = (actualYear - 4) % 10;
  var zhi = (actualYear - 4) % 12;
  if(gan < 0) gan += 10;
  if(zhi < 0) zhi += 12;
  return { gan: GAN_LIST[gan], zhi: ZHI_LIST[zhi], ganzhi: GAN_LIST[gan] + ZHI_LIST[zhi], actualYear: actualYear };
}

// ── 月柱计算（以节气为界）────────────────────
// 各月节气日期（近似值，每月第一个节气）
var JIE_QI = [
  { month: 1,  day: 6,  name: "小寒", zhi: "丑" },  // 丑月
  { month: 2,  day: 4,  name: "立春", zhi: "寅" },  // 寅月
  { month: 3,  day: 6,  name: "惊蛰", zhi: "卯" },  // 卯月
  { month: 4,  day: 5,  name: "清明", zhi: "辰" },  // 辰月
  { month: 5,  day: 5,  name: "立夏", zhi: "巳" },  // 巳月
  { month: 6,  day: 6,  name: "芒种", zhi: "午" },  // 午月
  { month: 7,  day: 7,  name: "小暑", zhi: "未" },  // 未月
  { month: 8,  day: 7,  name: "立秋", zhi: "申" },  // 申月
  { month: 9,  day: 8,  name: "白露", zhi: "酉" },  // 酉月
  { month: 10, day: 8,  name: "寒露", zhi: "戌" },  // 戌月
  { month: 11, day: 7,  name: "立冬", zhi: "亥" },  // 亥月
  { month: 12, day: 7,  name: "大雪", zhi: "子" },  // 子月
];

function getMonthJieZhi(year, month, day){
  var birthDate = new Date(year, month-1, day);
  // 找对应的月节气
  var jieIdx;
  for(var i=0; i<JIE_QI.length; i++){
    var j = JIE_QI[i];
    var jieDate = new Date(year, j.month-1, j.day);
    if(birthDate >= jieDate){
      jieIdx = i;
    }
  }
  if(jieIdx === undefined){
    // 如果在小寒之前，则属于上一年丑月
    jieIdx = JIE_QI.length - 1;
  }
  return { name: JIE_QI[jieIdx].name, zhi: JIE_QI[jieIdx].zhi, index: jieIdx };
}

function calculateMonthGanZhi(yearGan, monthIndex, day, month){
  // monthIndex 是 JIE_QI 的索引 (0-11)
  // 月支
  var monthZhi = JIE_QI[monthIndex].zhi;
  // 月干: 年上起月法
  // 甲己之年丙作首, 乙庚之岁戊为头, 丙辛之年寻庚上,
  // 丁壬壬寅顺水流, 若问戊癸何处起, 甲寅之上好追求
  var yearGanIdx = ganIndex(yearGan);
  var startGanIdx = [2, 4, 6, 8, 0][yearGanIdx % 5]; // 丙/戊/庚/壬/甲
  var offset = monthIndex; // 寅月=0, 卯月=1, ...
  var ganIdx = (startGanIdx + offset) % 10;
  var zhiIdx = zhiIndex(monthZhi);
  return { gan: GAN_LIST[ganIdx], zhi: ZHI_LIST[zhiIdx], ganzhi: GAN_LIST[ganIdx] + ZHI_LIST[zhiIdx] };
}

// ── 时柱计算 ──────────────────────────────────
function getHourZhi(hour){
  // 23-1子,1-3丑,3-5寅,5-7卯,7-9辰,9-11巳,
  // 11-13午,13-15未,15-17申,17-19酉,19-21戌,21-23亥
  if(hour >= 23 || hour < 1) return "子";
  if(hour < 3) return "丑";
  if(hour < 5) return "寅";
  if(hour < 7) return "卯";
  if(hour < 9) return "辰";
  if(hour < 11) return "巳";
  if(hour < 13) return "午";
  if(hour < 15) return "未";
  if(hour < 17) return "申";
  if(hour < 19) return "酉";
  if(hour < 21) return "戌";
  return "亥";
}

function getHourZhiIndex(hourZhi){
  var map = {"子":0,"丑":1,"寅":2,"卯":3,"辰":4,"巳":5,"午":6,"未":7,"申":8,"酉":9,"戌":10,"亥":11};
  return map[hourZhi] || 0;
}

function calculateHourGanZhi(dayGan, hour){
  var hourZhi = getHourZhi(hour);
  var hourZhiIdx = getHourZhiIndex(hourZhi);
  // 日上起时法: 甲己还加甲, 乙庚丙作初, 丙辛从戊起,
  // 丁壬庚子居, 戊癸何处发, 壬子是真途
  var dayGanIdx = ganIndex(dayGan);
  var startGanIdx = [0, 2, 4, 6, 8][dayGanIdx % 5]; // 甲/丙/戊/庚/壬
  var ganIdx = (startGanIdx + hourZhiIdx) % 10;
  return { gan: GAN_LIST[ganIdx], zhi: hourZhi, ganzhi: GAN_LIST[ganIdx] + hourZhi };
}

// ── 空亡 ──────────────────────────────────
function getXunKong(ganzhi){
  // 每旬10天干, 余2地支为空亡
  // 甲子旬: 戌亥, 甲戌旬: 申酉, 甲申旬: 午未, 甲午旬: 辰巳, 甲辰旬: 寅卯, 甲寅旬: 子丑
  var gan = ganzhi[0], zhi = ganzhi[1];
  var ganIdx = ganIndex(gan);
  var zhiIdx = zhiIndex(zhi);
  var xunStart = ganIdx - zhiIdx;
  if(xunStart < 0) xunStart += 10;
  // xunStart 为该旬第一个天干索引 (甲/0)
  var emptyZhi1 = (xunStart + 10) % 12;
  var emptyZhi2 = (xunStart + 11) % 12;
  return ZHI_LIST[emptyZhi1] + ZHI_LIST[emptyZhi2];
}

// ── 阴历日期（简化）─────────────────────────
// 1900-2100年农历数据（每月大小月+闰月）
// 简化为用日柱和月柱推算农历描述
function lunarDescription(year, month, day){
  // 返回农历年月日的中文描述
  // 农历年: 基于立春
  var lYear = (month < 2 || (month === 2 && day < 4)) ? year - 1 : year;
  var lunarYearGan = (lYear - 4) % 10;
  var lunarYearZhi = (lYear - 4) % 12;
  if(lunarYearGan < 0) lunarYearGan += 10;
  if(lunarYearZhi < 0) lunarYearZhi += 12;
  var ganName = GAN_LIST[lunarYearGan];
  var zhiName = ZHI_LIST[lunarYearZhi];
  // 农历月份和日期的简化计算
  // 基于节气估算农历月份
  var lMonth = month;
  var lDay = day;
  return GAN_LIST[lunarYearGan] + ZHI_LIST[lunarYearZhi] + '年' + lMonth + '月' + lDay + '日';
}

// ── 五行统计 ──────────────────────────────────
function wuxingStat(fourPillars){
  var chars = [];
  ["year","month","day","hour"].forEach(function(pos){
    chars.push(fourPillars[pos]["gan"]);
    chars.push(fourPillars[pos]["zhi"]);
  });
  var branchElements = {"子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火","午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水"};
  var counts = {"木":0,"火":0,"土":0,"金":0,"水":0};
  chars.forEach(function(ch){
    if(TIANGAN_WUXING[ch]) counts[TIANGAN_WUXING[ch]]++;
    else if(branchElements[ch]) counts[branchElements[ch]]++;
  });
  return counts;
}

// ── 主计算函数 ──────────────────────────────────
function computeBaziLocal(params){
  var year = params.year, month = params.month, day = params.day;
  var hour = params.hour || 12, minute = params.minute || 0;
  var gender = params.gender || "男";

  // 1. 年柱
  var yearPillar = calculateYearGanZhi(year, month, day);
  // 2. 日柱
  var dayPillar = calculateDayGanZhi(year, month, day);
  var dayGan = dayPillar.gan;

  // 3. 月柱
  var monthJie = getMonthJieZhi(year, month, day);
  var monthPillar = calculateMonthGanZhi(yearPillar.gan, monthJie.index, day, month);

  // 4. 时柱
  var hourPillar = calculateHourGanZhi(dayGan, hour);

  // 组装四柱
  var pillars = {
    "year":  { "gan": yearPillar.gan, "zhi": yearPillar.zhi, "ganzhi": yearPillar.ganzhi, "nayin": getNayin(yearPillar.gan, yearPillar.zhi) },
    "month": { "gan": monthPillar.gan, "zhi": monthPillar.zhi, "ganzhi": monthPillar.ganzhi, "nayin": getNayin(monthPillar.gan, monthPillar.zhi) },
    "day":   { "gan": dayPillar.gan, "zhi": dayPillar.zhi, "ganzhi": dayPillar.ganzhi, "nayin": getNayin(dayPillar.gan, dayPillar.zhi) },
    "hour":  { "gan": hourPillar.gan, "zhi": hourPillar.zhi, "ganzhi": hourPillar.ganzhi, "nayin": getNayin(hourPillar.gan, hourPillar.zhi) }
  };

  // 十神
  var shishen = {
    "year_gan": getShiShen(dayGan, pillars["year"]["gan"]),
    "month_gan": getShiShen(dayGan, pillars["month"]["gan"]),
    "day_gan": "日主",
    "hour_gan": getShiShen(dayGan, pillars["hour"]["gan"])
  };

  // 地支藏干
  var canggan = {};
  ["year","month","day","hour"].forEach(function(pos){
    var zhi = pillars[pos]["zhi"];
    var hidden = DIZHI_CANGGAN[zhi] || [];
    canggan[pos] = hidden.map(function(g){ return {"gan": g, "shishen": getShiShen(dayGan, g)}; });
  });

  // 地支十神（本气）
  var zhishi = {};
  ["year","month","day","hour"].forEach(function(pos){
    var zhi = pillars[pos]["zhi"];
    var hidden = DIZHI_CANGGAN[zhi] || [];
    zhishi[pos] = hidden.length ? getShiShen(dayGan, hidden[0]) : "";
  });

  // 大运
  var isYangYear = TIANGAN_YINYANG[yearPillar.gan] === "阳";
  var isMale = gender === "男";
  var forward = (isYangYear && isMale) || (!isYangYear && !isMale);
  var label = forward ? "顺排" : "逆排";

  // 起运年龄（简化：按节气差值估算3天一岁）
  var birthTs = new Date(year, month-1, day).getTime();
  var jieIdx = monthJie.index;
  var jie = JIE_QI[jieIdx];
  var jieTs = new Date(year, jie.month-1, jie.day).getTime();
  var nextJieIdx = (jieIdx + 1) % 12;
  var nextJie = JIE_QI[nextJieIdx];
  var nextJieTs = new Date(nextJie.month > jie.month ? year : year + 1, nextJie.month-1, nextJie.day).getTime();
  var targetTs = forward ? nextJieTs : jieTs;
  var daysBetween = Math.max(0, Math.round(Math.abs(targetTs - birthTs) / 86400000));
  var startAge = Math.max(1, Math.round(daysBetween / 3));

  // 大运干支
  var monthGanIdx = ganIndex(monthPillar.gan);
  var monthZhiIdx = zhiIndex(monthPillar.zhi);
  var dayun = [];
  for(var i=0; i<8; i++){
    var gIdx, zIdx;
    if(forward){
      gIdx = (monthGanIdx + 1 + i) % 10;
      zIdx = (monthZhiIdx + 1 + i) % 12;
    } else {
      gIdx = (monthGanIdx - 1 - i + 10) % 10;
      zIdx = (monthZhiIdx - 1 - i + 12) % 12;
    }
    dayun.push({
      "ganzhi": GAN_LIST[gIdx] + ZHI_LIST[zIdx],
      "age_start": startAge + i * 10,
      "age_end": startAge + (i + 1) * 10 - 1
    });
  }

  // 流年
  var currentYear = year;
  var yearGanIdx = currentYear % 10;
  var yearZhiIdx = (currentYear - 4 + 12) % 12;
  var currentYearGanZhi = GAN_LIST[yearGanIdx] + ZHI_LIST[yearZhiIdx];

  // 空亡
  var xunkong = {
    "year": getXunKong(pillars["year"]["ganzhi"]),
    "month": getXunKong(pillars["month"]["ganzhi"]),
    "day": getXunKong(pillars["day"]["ganzhi"]),
    "hour": getXunKong(pillars["hour"]["ganzhi"])
  };

  // 阴历
  var lunarStr = lunarDescription(year, month, day);
  var solarStr = year + '-' + String(month).padStart(2,'0') + '-' + String(day).padStart(2,'0') + ' ' + String(hour).padStart(2,'0') + ':' + String(minute).padStart(2,'0') + ':00';

  return {
    "solar": solarStr,
    "lunar": lunarStr,
    "day_master": dayGan,
    "day_master_wuxing": TIANGAN_WUXING[dayGan],
    "day_master_yinyang": TIANGAN_YINYANG[dayGan],
    "wuxing_stat": wuxingStat(pillars),
    "four_pillars": pillars,
    "shishen": shishen,
    "zhishi": zhishi,
    "canggan": canggan,
    "dayun": { "direction": label, "start_age": startAge, "pills": dayun },
    "current_year": { "year": currentYear, "ganzhi": currentYearGanZhi, "shishen": getShiShen(dayGan, GAN_LIST[yearGanIdx]) },
    "genders": { "birth_gender": gender, "is_yang_year": isYangYear },
    "xunkong": xunkong,
    "warnings": []
  };
}

// ── 神煞系统 ──────────────────────────────────
function calculateShensha(baziData){
  var fp = baziData.four_pillars;
  var yearZhi = fp.year.zhi, monthZhi = fp.month.zhi, dayZhi = fp.day.zhi, hourZhi = fp.hour.zhi;
  var yearGan = fp.year.gan, monthGan = fp.month.gan, dayGan = fp.day.gan, hourGan = fp.hour.gan;
  var dayMaster = baziData.day_master;

  var allZhi = [yearZhi, monthZhi, dayZhi, hourZhi];
  var allGan = [yearGan, monthGan, dayGan, hourGan];
  var posName = ["年柱", "月柱", "日柱", "时柱"];

  var results = [];

  // ── 天乙贵人 ──
  var tianyiMap = {
    "甲":"丑未","乙":"子申","丙":"亥酉","丁":"亥酉","戊":"丑未",
    "己":"子申","庚":"丑未","辛":"午寅","壬":"巳卯","癸":"巳卯"
  };
  var tianyiStr = tianyiMap[dayMaster] || "";
  var tianyiFound = [];
  for(var i=0; i<4; i++){
    if(tianyiStr.indexOf(allZhi[i]) !== -1){
      tianyiFound.push(posName[i] + allZhi[i]);
    }
  }
  if(tianyiFound.length > 0){
    results.push({
      name: "天乙贵人",
      dizhi: tianyiFound.join("、"),
      is_ji: "吉",
      description: "最吉之神，主贵人相助，逢凶化吉，威望显达"
    });
  }

  // ── 文昌贵人 ──
  var wenchangMap = {
    "甲":"巳","乙":"午","丙":"申","丁":"酉","戊":"申",
    "己":"酉","庚":"亥","辛":"子","壬":"寅","癸":"卯"
  };
  var wenchangZhi = wenchangMap[dayMaster] || "";
  var wenchangFound = [];
  for(var i=0; i<4; i++){
    if(allZhi[i] === wenchangZhi){
      wenchangFound.push(posName[i] + allZhi[i]);
    }
  }
  if(wenchangFound.length > 0){
    results.push({
      name: "文昌贵人",
      dizhi: wenchangFound.join("、"),
      is_ji: "吉",
      description: "主聪明文采，学业突出，才华横溢，科举高中"
    });
  }

  // ── 桃花(咸池) ──
  var taohuaMap = {"寅":"卯","午":"卯","戌":"卯","申":"酉","子":"酉","辰":"酉","亥":"子","卯":"子","未":"子","巳":"午","酉":"午","丑":"午"};
  var taohuaZhi = taohuaMap[yearZhi];
  var taohuaFound = [];
  for(var i=0; i<4; i++){
    if(allZhi[i] === taohuaZhi){
      taohuaFound.push(posName[i] + allZhi[i]);
    }
  }
  if(taohuaFound.length > 0){
    results.push({
      name: "桃花(咸池)",
      dizhi: taohuaFound.join("、"),
      is_ji: "凶",
      description: "主异性缘佳，风流多情，感情丰富，易招感情纷争"
    });
  }

  // ── 驿马 ──
  var yimaMap = {"寅":"申","午":"申","戌":"申","申":"寅","子":"寅","辰":"寅","亥":"巳","卯":"巳","未":"巳","巳":"亥","酉":"亥","丑":"亥"};
  var yimaZhi = yimaMap[yearZhi];
  var yimaFound = [];
  for(var i=0; i<4; i++){
    if(allZhi[i] === yimaZhi){
      yimaFound.push(posName[i] + allZhi[i]);
    }
  }
  if(yimaFound.length > 0){
    results.push({
      name: "驿马",
      dizhi: yimaFound.join("、"),
      is_ji: "吉",
      description: "主动荡变通，远行迁徙，奔波劳碌但能有所成"
    });
  }

  // ── 天德 ──
  var tiandeMap = {
    "寅":"丁","卯":"申","辰":"壬","巳":"辛","午":"亥","未":"甲",
    "申":"癸","酉":"寅","戌":"丙","亥":"乙","子":"巳","丑":"庚"
  };
  var tiandeVal = tiandeMap[monthZhi];
  var tiandeFound = [];
  for(var i=0; i<4; i++){
    if(allGan[i] === tiandeVal || allZhi[i] === tiandeVal){
      tiandeFound.push(posName[i] + (allGan[i] === tiandeVal ? allGan[i] : allZhi[i]));
    }
  }
  if(tiandeFound.length > 0){
    results.push({
      name: "天德",
      dizhi: tiandeFound.join("、"),
      is_ji: "吉",
      description: "主心地善良，逢凶化吉，福泽深厚，遇难成祥"
    });
  }

  // ── 月德 ──
  var yuedeMap = {
    "寅":["丙","甲"],"午":["丙","甲"],"戌":["丙","甲"],
    "亥":["甲"],"卯":["甲"],"未":["甲"],
    "申":["壬","庚"],"子":["壬","庚"],"辰":["壬","庚"],
    "巳":["庚"],"酉":["庚"],"丑":["庚"]
  };
  var yuedeGans = yuedeMap[yearZhi] || [];
  var yuedeFound = [];
  for(var i=0; i<4; i++){
    if(yuedeGans.indexOf(allGan[i]) !== -1){
      yuedeFound.push(posName[i] + allGan[i]);
    }
  }
  if(yuedeFound.length > 0){
    results.push({
      name: "月德",
      dizhi: yuedeFound.join("、"),
      is_ji: "吉",
      description: "主仁慈祥和，贵人相助，消灾解难，婚姻美满"
    });
  }

  // ── 孤辰寡宿（以年支判断）──
  var guguGroups = [
    {group:["寅","卯","辰"], gu:"巳", gua:"丑"},
    {group:["巳","午","未"], gu:"申", gua:"辰"},
    {group:["申","酉","戌"], gu:"亥", gua:"未"},
    {group:["亥","子","丑"], gu:"寅", gua:"戌"}
  ];
  var guguPair = null;
  for(var i=0; i<guguGroups.length; i++){
    if(guguGroups[i].group.indexOf(yearZhi) !== -1){
      guguPair = guguGroups[i];
      break;
    }
  }
  if(guguPair){
    var guFound = [], guaFound = [];
    for(var i=0; i<4; i++){
      if(allZhi[i] === guguPair.gu) guFound.push(posName[i] + allZhi[i]);
      if(allZhi[i] === guguPair.gua) guaFound.push(posName[i] + allZhi[i]);
    }
    if(guFound.length > 0){
      results.push({
        name: "孤辰",
        dizhi: guFound.join("、"),
        is_ji: "凶",
        description: "主孤独寂寞，性格孤僻，六亲缘分淡薄，晚婚"
      });
    }
    if(guaFound.length > 0){
      results.push({
        name: "寡宿",
        dizhi: guaFound.join("、"),
        is_ji: "凶",
        description: "主孤独寡居，婚姻不顺，配偶缘薄，独处之命"
      });
    }
  }

  // ── 华盖 ──
  var huagaiMap = {"寅":"戌","午":"戌","戌":"戌","申":"辰","子":"辰","辰":"辰","亥":"未","卯":"未","未":"未","巳":"丑","酉":"丑","丑":"丑"};
  var huagaiZhi = huagaiMap[yearZhi];
  var huagaiFound = [];
  for(var i=0; i<4; i++){
    if(allZhi[i] === huagaiZhi){
      huagaiFound.push(posName[i] + allZhi[i]);
    }
  }
  if(huagaiFound.length > 0){
    results.push({
      name: "华盖",
      dizhi: huagaiFound.join("、"),
      is_ji: "吉",
      description: "主聪明好学，有艺术天赋，宗教缘分，但易孤傲"
    });
  }

  // ── 劫煞 ──
  var jieshaMap = {"寅":"亥","午":"亥","戌":"亥","申":"巳","子":"巳","辰":"巳","亥":"申","卯":"申","未":"申","巳":"寅","酉":"寅","丑":"寅"};
  var jieshaZhi = jieshaMap[yearZhi];
  var jieshaFound = [];
  for(var i=0; i<4; i++){
    if(allZhi[i] === jieshaZhi){
      jieshaFound.push(posName[i] + allZhi[i]);
    }
  }
  if(jieshaFound.length > 0){
    results.push({
      name: "劫煞",
      dizhi: jieshaFound.join("、"),
      is_ji: "凶",
      description: "主破财败事，小人侵扰，需防意外灾祸"
    });
  }

  // ── 亡神 ──
  var wangshenMap = {"寅":"巳","午":"巳","戌":"巳","申":"亥","子":"亥","辰":"亥","亥":"寅","卯":"寅","未":"寅","巳":"申","酉":"申","丑":"申"};
  var wangshenZhi = wangshenMap[yearZhi];
  var wangshenFound = [];
  for(var i=0; i<4; i++){
    if(allZhi[i] === wangshenZhi){
      wangshenFound.push(posName[i] + allZhi[i]);
    }
  }
  if(wangshenFound.length > 0){
    results.push({
      name: "亡神",
      dizhi: wangshenFound.join("、"),
      is_ji: "凶",
      description: "主心机深沉，名誉受损，易招官非诉讼"
    });
  }

  return results;
}
if (typeof window !== 'undefined') { window.calculateShensha = calculateShensha; }
