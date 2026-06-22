/* ═══════════════════════════════════════════════
   八字排盘 · 纯前端计算引擎
   基于 lunar-javascript 库
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

/* 五行统计 */
function wuxingStat(lunar){
  var chars = [
    lunar.getYearGan(), lunar.getYearZhi(),
    lunar.getMonthGan(), lunar.getMonthZhi(),
    lunar.getDayGan(), lunar.getDayZhiExact(),
    lunar.getTimeGan(), lunar.getTimeZhi()
  ];
  var branchElements = {"子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火","午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水"};
  var counts = {"木":0,"火":0,"土":0,"金":0,"水":0};
  chars.forEach(function(ch){
    if(TIANGAN_WUXING[ch]) counts[TIANGAN_WUXING[ch]]++;
    else if(branchElements[ch]) counts[branchElements[ch]]++;
  });
  return counts;
}

/* 主计算函数 */
function computeBaziLocal(params){
  // params: { year, month, day, hour, minute, gender }
  // hour/minute are 0-23/0-59
  var year = params.year, month = params.month, day = params.day;
  var hour = params.hour || 12, minute = params.minute || 0;
  var gender = params.gender || "男";

  // 使用 lunar-javascript 计算
  var solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  var lunar = solar.toLunar();

  var dayGan = lunar.getDayGan();

  // 四柱
  var pillars = {
    "year":  { "gan": lunar.getYearGan(), "zhi": lunar.getYearZhi(), "ganzhi": lunar.getYearInGanZhiExact(), "nayin": lunar.getYearNaYin() },
    "month": { "gan": lunar.getMonthGan(), "zhi": lunar.getMonthZhi(), "ganzhi": lunar.getMonthInGanZhiExact(), "nayin": lunar.getMonthNaYin() },
    "day":   { "gan": lunar.getDayGan(), "zhi": lunar.getDayZhiExact(), "ganzhi": lunar.getDayInGanZhiExact(), "nayin": lunar.getDayNaYin() },
    "hour":  { "gan": lunar.getTimeGan(), "zhi": lunar.getTimeZhi(), "ganzhi": lunar.getTimeInGanZhi(), "nayin": lunar.getTimeNaYin() }
  };

  // 十神
  var shishen = {
    "year_gan": getShiShen(dayGan, pillars["year"]["gan"]),
    "month_gan": getShiShen(dayGan, pillars["month"]["gan"]),
    "day_gan": "日主",
    "hour_gan": getShiShen(dayGan, pillars["hour"]["gan"])
  };

  // 地支藏干 + 十神
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
  var birthYearGan = pillars["year"]["gan"];
  var isYangYear = TIANGAN_YINYANG[birthYearGan] === "阳";
  var isMale = gender === "男";
  var forward = (isYangYear && isMale) || (!isYangYear && !isMale);

  // 月柱索引
  var monthGanIdx = ganIndex(pillars["month"]["gan"]);
  var monthZhiIdx = zhiIndex(pillars["month"]["zhi"]);

  // 节气
  var prevJie = lunar.getPrevJie();
  var nextJie = lunar.getNextJie();

  var targetJie = forward ? nextJie : prevJie;
  var label = forward ? "顺排" : "逆排";

  var daysBetween = 3; // fallback
  if(targetJie){
    var jieSolar = targetJie.getSolar();
    var jieDate = new Date(jieSolar.getYear(), jieSolar.getMonth()-1, jieSolar.getDay());
    var birthDate = new Date(solar.getYear(), solar.getMonth()-1, solar.getDay());
    daysBetween = Math.abs(Math.round((jieDate - birthDate) / 86400000));
  }
  var startAge = Math.max(1, Math.round(daysBetween / 3));

  // 大运干支
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
  var solarStr = solar.getYear() + '-' + String(solar.getMonth()).padStart(2,'0') + '-' + String(solar.getDay()).padStart(2,'0');
  var xunkong = {
    "year": lunar.getYearXunKong(),
    "month": lunar.getMonthXunKongExact(),
    "day": lunar.getDayXunKongExact(),
    "hour": lunar.getTimeXunKong()
  };

  return {
    "solar": solarStr + ' ' + String(hour).padStart(2,'0') + ':' + String(minute).padStart(2,'0') + ':00',
    "lunar": lunar.getYearInChinese() + '年' + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese(),
    "day_master": dayGan,
    "day_master_wuxing": TIANGAN_WUXING[dayGan],
    "day_master_yinyang": TIANGAN_YINYANG[dayGan],
    "wuxing_stat": wuxingStat(lunar),
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
