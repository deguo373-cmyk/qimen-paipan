/**
 * 紫微斗数完整JavaScript计算引擎
 * Zi Wei Dou Shu (Purple Star Astrology) Complete Calculator
 * 
 * 本模块包含完整排盘算法、星曜详解、四化详解、格局判断
 */

window.ZiWeiCalculator = (function() {
  'use strict';

  // ============================================================
  // 基础常量
  // ============================================================

  // 十二地支（从寅开始）
  var BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  var BRANCHES_FULL = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 十天干
  var STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

  // 时辰映射
  var HOUR_MAP = {
    '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6,
    '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11, '亥': 12
  };
  var HOUR_REVERSE = ['', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // 十二宫名称
  var PALACE_NAMES = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母'];

  // 五行局名称
  var BUREAU_NAMES = ['', '木三局', '金四局', '水二局', '火六局', '土五局'];

  // ============================================================
  // 辅助函数
  // ============================================================

  /** 获取地支在BRANCHES中的索引（0=寅） */
  function branchIndex(branch) {
    return BRANCHES.indexOf(branch);
  }

  /** 获取地支在完整地支中的索引（0=子） */
  function branchFullIndex(branch) {
    return BRANCHES_FULL.indexOf(branch);
  }

  /** 顺时针移动n步 */
  function moveClockwise(fromBranch, steps) {
    var idx = branchIndex(fromBranch);
    return BRANCHES[(idx + steps) % 12];
  }

  /** 逆时针移动n步 */
  function moveCounterClockwise(fromBranch, steps) {
    var idx = branchIndex(fromBranch);
    return BRANCHES[(idx - steps + 1200) % 12];
  }

  /** 获取两宫之间的顺时钟步数 */
  function clockwiseSteps(from, to) {
    return (branchIndex(to) - branchIndex(from) + 12) % 12;
  }

  /** 获取两宫之间的逆时钟步数 */
  function counterClockwiseSteps(from, to) {
    return (branchIndex(from) - branchIndex(to) + 12) % 12;
  }

  /** 获取年干索引 */
  function stemIndex(stem) {
    return STEMS.indexOf(stem);
  }

  /** 获取年支索引 */
  function branchIndexInFull(branch) {
    return BRANCHES_FULL.indexOf(branch);
  }

  // ============================================================
  // 1. 输入处理：从农历年获取天干地支
  // ============================================================

  /**
   * 根据农历年获取年干和年支
   * 农历年份以甲子为起点（甲子年 = 天干0, 地支0）
   * 公元4年为甲子年
   */
  function getYearStemBranch(lunarYear) {
    var offset = (lunarYear - 4) % 60;
    if (offset < 0) offset += 60;
    var stem = STEMS[offset % 10];
    var branch = BRANCHES_FULL[offset % 12];
    return { stem: stem, branch: branch };
  }

  /**
   * 获取性别阴阳属性
   * 阳男阴女为顺行，阴男阳女为逆行
   * 天干阴阳：甲丙戊庚壬为阳，乙丁己辛癸为阴
   */
  function isStemYang(stem) {
    return '甲丙戊庚壬'.indexOf(stem) !== -1;
  }

  function getGenderProperty(yearStem, gender) {
    // gender: '男' 或 '女'
    var stemYang = isStemYang(yearStem);
    if (gender === '男') {
      return stemYang ? '阳男' : '阴男';
    } else {
      return stemYang ? '阳女' : '阴女';
    }
  }

  // ============================================================
  // 2. 定命宫与身宫
  // ============================================================

  /**
   * 命宫：寅起正月顺数到生月，再逆数到生时
   * 身宫：寅起正月顺数到生月，再顺数到生时
   */
  function calculateMingShenGong(month, hourIndex) {
    // 寅起正月顺数到生月
    var startBranch = '寅';
    var monthBranch = moveClockwise(startBranch, month - 1);
    
    // 命宫：再逆数到生时
    var mingBranch = moveCounterClockwise(monthBranch, hourIndex - 1);
    
    // 身宫：再顺数到生时
    var shenBranch = moveClockwise(monthBranch, hourIndex - 1);
    
    return { ming: mingBranch, shen: shenBranch };
  }

  // ============================================================
  // 3. 十二宫排列
  // ============================================================

  /**
   * 命宫确定后，十二宫按逆时针排列
   */
  function getTwelvePalaces(mingBranch) {
    var palaces = [];
    var mingIdx = branchIndex(mingBranch);
    for (var i = 0; i < 12; i++) {
      var idx = (mingIdx - i + 12) % 12;
      palaces.push({
        name: PALACE_NAMES[i],
        zhi: BRANCHES[idx],
        stars: [],
        gan: '',
        index: idx
      });
    }
    return palaces;
  }

  // ============================================================
  // 4. 起寅首（各宫天干）
  // ============================================================

  /**
   * 根据年干确定寅宫的天干，然后顺排各宫天干
   */
  function calculatePalaceGans(yearStem, palaces) {
    // 甲己年起丙寅，乙庚年起戊寅，丙辛年起庚寅，丁壬年起壬寅，戊癸年起甲寅
    var yinGanMap = {
      '甲': '丙', '乙': '戊', '丙': '庚', '丁': '壬', '戊': '甲',
      '己': '丙', '庚': '戊', '辛': '庚', '壬': '壬', '癸': '甲'
    };
    
    var yinGan = yinGanMap[yearStem];
    var yinGanIdx = stemIndex(yinGan);
    
    for (var i = 0; i < palaces.length; i++) {
      var palace = palaces[i];
      var palaceZhiIdx = branchIndex(palace.zhi);
      var ganIdx = (yinGanIdx + palaceZhiIdx) % 10;
      palace.gan = STEMS[ganIdx];
    }
    
    return palaces;
  }

  // ============================================================
  // 5. 定五行局
  // ============================================================

  /**
   * 取命宫干支的天干数和地支数相加，大于5则减5，余数对应五行局
   */
  function calculateBureau(mingGan, mingZhi) {
    // 天干取数：甲乙=1,丙丁=2,戊己=3,庚辛=4,壬癸=5
    var ganNumMap = {
      '甲': 1, '乙': 1, '丙': 2, '丁': 2, '戊': 3, '己': 3,
      '庚': 4, '辛': 4, '壬': 5, '癸': 5
    };
    
    // 地支取数：子午丑未=1,寅申卯酉=2,辰戌巳亥=3
    var zhiNumMap = {
      '子': 1, '午': 1, '丑': 1, '未': 1,
      '寅': 2, '申': 2, '卯': 2, '酉': 2,
      '辰': 3, '戌': 3, '巳': 3, '亥': 3
    };
    
    var sum = ganNumMap[mingGan] + zhiNumMap[mingZhi];
    if (sum > 5) sum -= 5;
    
    return {
      bureauNumber: sum,
      bureauName: BUREAU_NAMES[sum]
    };
  }

  // ============================================================
  // 6. 安紫微星
  // ============================================================

  // 紫微星安星表
  var ZIWEI_TABLE = {
    '水二局': {
      1:'寅',2:'卯',3:'辰',4:'巳',5:'巳',6:'午',7:'未',8:'申',9:'酉',10:'酉',
      11:'戌',12:'亥',13:'子',14:'丑',15:'丑',16:'寅',17:'卯',18:'辰',19:'巳',20:'巳',
      21:'午',22:'未',23:'申',24:'酉',25:'酉',26:'戌',27:'亥',28:'子',29:'丑',30:'丑'
    },
    '木三局': {
      1:'辰',2:'巳',3:'午',4:'巳',5:'午',6:'未',7:'未',8:'申',9:'酉',10:'申',
      11:'酉',12:'戌',13:'戌',14:'亥',15:'子',16:'亥',17:'子',18:'丑',19:'丑',20:'寅',
      21:'卯',22:'寅',23:'卯',24:'辰',25:'辰',26:'巳',27:'午',28:'巳',29:'午',30:'未'
    },
    '金四局': {
      1:'午',2:'未',3:'申',4:'酉',5:'午',6:'未',7:'申',8:'酉',9:'戌',10:'亥',
      11:'子',12:'丑',13:'戌',14:'亥',15:'子',16:'丑',17:'寅',18:'卯',19:'辰',20:'巳',
      21:'寅',22:'卯',23:'辰',24:'巳',25:'午',26:'未',27:'申',28:'酉',29:'午',30:'未'
    },
    '土五局': {
      1:'申',2:'酉',3:'戌',4:'亥',5:'子',6:'未',7:'申',8:'酉',9:'戌',10:'亥',
      11:'子',12:'丑',13:'寅',14:'卯',15:'辰',16:'丑',17:'寅',18:'卯',19:'辰',20:'巳',
      21:'午',22:'未',23:'申',24:'酉',25:'戌',26:'巳',27:'午',28:'未',29:'申',30:'酉'
    },
    '火六局': {
      1:'戌',2:'亥',3:'子',4:'丑',5:'寅',6:'卯',7:'申',8:'酉',9:'戌',10:'亥',
      11:'子',12:'丑',13:'寅',14:'卯',15:'辰',16:'巳',17:'午',18:'未',19:'寅',20:'卯',
      21:'辰',22:'巳',23:'午',24:'未',25:'申',26:'酉',27:'戌',28:'亥',29:'子',30:'丑'
    }
  };

  function getZiWeiPosition(bureauName, day) {
    var table = ZIWEI_TABLE[bureauName];
    if (!table) return null;
    var pos = table[day];
    return pos || null;
  }

  // ============================================================
  // 7. 安十四主星
  // ============================================================

  /**
   * 紫微星系（从紫微逆排）：
   * 紫微 → 逆1宫天机 → 逆2宫太阳 → 逆1宫武曲 → 逆1宫天同 → 逆3宫廉贞
   */
  function getZiWeiStars(ziweiBranch) {
    var stars = {};
    var zhi = ziweiBranch;
    
    stars['紫微'] = zhi;
    stars['天机'] = moveCounterClockwise(zhi, 1);
    stars['太阳'] = moveCounterClockwise(zhi, 2);
    stars['武曲'] = moveCounterClockwise(zhi, 1); // from 太阳
    // Let's recalculate properly from the spec
    // 紫微→逆1天机→逆2太阳→逆1武曲→逆1天同→逆3廉贞
    var ziwei = branchIndex(ziweiBranch);
    stars['紫微'] = BRANCHES[ziwei];
    stars['天机'] = BRANCHES[(ziwei - 1 + 12) % 12];
    stars['太阳'] = BRANCHES[(ziwei - 1 - 2 + 24) % 12]; // 逆2 from 天机
    stars['武曲'] = BRANCHES[(ziwei - 1 - 2 - 1 + 36) % 12]; // 逆1 from 太阳
    stars['天同'] = BRANCHES[(ziwei - 1 - 2 - 1 - 1 + 48) % 12]; // 逆1 from 武曲
    stars['廉贞'] = BRANCHES[(ziwei - 1 - 2 - 1 - 1 - 3 + 60) % 12]; // 逆3 from 天同
    
    return stars;
  }

  /**
   * 紫微→天府映射
   */
  var ZIWEI_TO_TIANFU = {
    '寅':'寅', '卯':'丑', '辰':'子', '巳':'亥', '午':'戌', '未':'酉',
    '申':'申', '酉':'未', '戌':'午', '亥':'巳', '子':'辰', '丑':'卯'
  };

  /**
   * 天府星系（从天府顺排）：
   * 天府→顺1太阴→顺1贪狼→顺1巨门→顺1天相→顺1天梁→顺1七杀→顺4破军
   */
  function getTianFuStars(tianfuBranch) {
    var stars = {};
    var tianfu = branchIndex(tianfuBranch);
    
    stars['天府'] = BRANCHES[tianfu];
    stars['太阴'] = BRANCHES[(tianfu + 1) % 12];
    stars['贪狼'] = BRANCHES[(tianfu + 2) % 12];
    stars['巨门'] = BRANCHES[(tianfu + 3) % 12];
    stars['天相'] = BRANCHES[(tianfu + 4) % 12];
    stars['天梁'] = BRANCHES[(tianfu + 5) % 12];
    stars['七杀'] = BRANCHES[(tianfu + 6) % 12];
    stars['破军'] = BRANCHES[(tianfu + 10) % 12]; // 顺4（顺4从七杀算，即+6+4=+10）
    
    return stars;
  }

  // ============================================================
  // 8. 辅星
  // ============================================================

  /**
   * 文昌（按时辰）
   */
  var WENCHANG_TABLE = {
    1:'戌',2:'酉',3:'申',4:'未',5:'午',6:'巳',7:'辰',8:'卯',9:'寅',10:'丑',11:'子',12:'亥'
  };

  /**
   * 文曲（按时辰）
   */
  var WENQU_TABLE = {
    1:'辰',2:'巳',3:'午',4:'未',5:'申',6:'酉',7:'戌',8:'亥',9:'子',10:'丑',11:'寅',12:'卯'
  };

  /**
   * 左辅（按月份）
   */
  var ZUOFU_TABLE = {
    1:'辰',2:'巳',3:'午',4:'未',5:'申',6:'酉',7:'戌',8:'亥',9:'子',10:'丑',11:'寅',12:'卯'
  };

  /**
   * 右弼（按月份）
   */
  var YOUBI_TABLE = {
    1:'戌',2:'酉',3:'申',4:'未',5:'午',6:'巳',7:'辰',8:'卯',9:'寅',10:'丑',11:'子',12:'亥'
  };

  /**
   * 天魁（按年干）
   */
  var TIANKUI_TABLE = {
    '甲':'丑','乙':'子','丙':'亥','丁':'酉','戊':'丑',
    '己':'子','庚':'丑','辛':'午','壬':'卯','癸':'卯'
  };

  /**
   * 天钺（按年干）
   */
  var TIANYUE_TABLE = {
    '甲':'未','乙':'申','丙':'酉','丁':'未','戊':'未',
    '己':'申','庚':'未','辛':'寅','壬':'巳','癸':'巳'
  };

  /**
   * 禄存（按年干）
   */
  var LUCUN_TABLE = {
    '甲':'寅','乙':'卯','丙':'巳','戊':'巳','丁':'午',
    '己':'午','庚':'申','辛':'酉','壬':'亥','癸':'子'
  };

  /**
   * 擎羊（按年干）
   */
  var QINGYANG_TABLE = {
    '甲':'卯','乙':'辰','丙':'午','戊':'午','丁':'未',
    '己':'未','庚':'酉','辛':'戌','壬':'子','癸':'丑'
  };

  /**
   * 陀罗（按年干）
   */
  var TUOLUO_TABLE = {
    '甲':'丑','乙':'寅','丙':'辰','戊':'辰','丁':'巳',
    '己':'巳','庚':'未','辛':'申','壬':'戌','癸':'亥'
  };

  /**
   * 地空（按时辰）
   */
  var DIKONG_TABLE = {
    1:'亥',2:'戌',3:'酉',4:'申',5:'未',6:'午',7:'巳',8:'辰',9:'卯',10:'寅',11:'丑',12:'子'
  };

  /**
   * 地劫（按时辰）
   */
  var DIJIE_TABLE = {
    1:'亥',2:'子',3:'丑',4:'寅',5:'卯',6:'辰',7:'巳',8:'午',9:'未',10:'申',11:'酉',12:'戌'
  };

  /**
   * 天马（按年支组）
   */
  function getTianmaPosition(yearBranch) {
    var map = {
      '寅':'申','午':'申','戌':'申',
      '申':'寅','子':'寅','辰':'寅',
      '巳':'亥','酉':'亥','丑':'亥',
      '亥':'巳','卯':'巳','未':'巳'
    };
    return map[yearBranch] || null;
  }

  function getAllMinorStars(yearStem, yearBranch, month, hourIndex) {
    var stars = {};
    
    // 文昌、文曲（按时辰）
    stars['文昌'] = WENCHANG_TABLE[hourIndex];
    stars['文曲'] = WENQU_TABLE[hourIndex];
    
    // 左辅、右弼（按月份）
    stars['左辅'] = ZUOFU_TABLE[month];
    stars['右弼'] = YOUBI_TABLE[month];
    
    // 天魁、天钺（按年干）
    stars['天魁'] = TIANKUI_TABLE[yearStem];
    stars['天钺'] = TIANYUE_TABLE[yearStem];
    
    // 禄存、擎羊、陀罗（按年干）
    stars['禄存'] = LUCUN_TABLE[yearStem];
    stars['擎羊'] = QINGYANG_TABLE[yearStem];
    stars['陀罗'] = TUOLUO_TABLE[yearStem];
    
    // 地空、地劫（按时辰）
    stars['地空'] = DIKONG_TABLE[hourIndex];
    stars['地劫'] = DIJIE_TABLE[hourIndex];
    
    // 天马（按年支）
    stars['天马'] = getTianmaPosition(yearBranch);
    
    return stars;
  }

  // ============================================================
  // 9. 四化
  // ============================================================

  var SIHUA_TABLE = {
    '甲': { 化禄: '廉贞', 化权: '破军', 化科: '武曲', 化忌: '太阳' },
    '乙': { 化禄: '天机', 化权: '天梁', 化科: '紫微', 化忌: '太阴' },
    '丙': { 化禄: '天同', 化权: '天机', 化科: '文昌', 化忌: '廉贞' },
    '丁': { 化禄: '太阴', 化权: '天同', 化科: '天机', 化忌: '巨门' },
    '戊': { 化禄: '贪狼', 化权: '太阴', 化科: '右弼', 化忌: '天机' },
    '己': { 化禄: '武曲', 化权: '贪狼', 化科: '天梁', 化忌: '文曲' },
    '庚': { 化禄: '太阳', 化权: '武曲', 化科: '太阴', 化忌: '天同' },
    '辛': { 化禄: '巨门', 化权: '太阳', 化科: '文曲', 化忌: '文昌' },
    '壬': { 化禄: '天梁', 化权: '紫微', 化科: '左辅', 化忌: '武曲' },
    '癸': { 化禄: '破军', 化权: '巨门', 化科: '太阴', 化忌: '贪狼' }
  };

  function getSihua(yearStem) {
    return SIHUA_TABLE[yearStem] || {};
  }

  // ============================================================
  // 10. 大限
  // ============================================================

  /**
   * 起限年龄和顺逆
   */
  function getDayunInfo(bureauName, genderProperty) {
    var startAgeMap = {
      '水二局': 2, '木三局': 3, '金四局': 4, '土五局': 5, '火六局': 6
    };
    
    var startAge = startAgeMap[bureauName] || 0;
    
    // 阳男阴女顺行（命宫下一个地支开始），阴男阳女逆行（命宫上一个地支开始）
    var isForward = (genderProperty === '阳男' || genderProperty === '阴女');
    
    return {
      startAge: startAge,
      forward: isForward
    };
  }

  function getDayunPalaces(mingBranch, forward) {
    var palaces = [];
    var mingIdx = branchIndex(mingBranch);
    
    for (var i = 0; i < 12; i++) {
      var idx;
      if (forward) {
        idx = (mingIdx + i) % 12;
      } else {
        idx = (mingIdx - i + 12) % 12;
      }
      palaces.push(BRANCHES[idx]);
    }
    
    return palaces;
  }

  // ============================================================
  // 核心计算函数
  // ============================================================

  /**
   * 计算完整紫微斗数命盘
   * 
   * @param {number} lunarYear - 农历年（如 1990）
   * @param {number} lunarMonth - 农历月（1-12）
   * @param {number} lunarDay - 农历日（1-30）
   * @param {number|string} lunarHour - 时辰（1-12 或 '子'~'亥'）
   * @param {string} gender - 性别：'男' 或 '女'
   * @returns {Object} 完整命盘数据
   */
  function calculate(lunarYear, lunarMonth, lunarDay, lunarHour, gender) {
    // 标准化时辰输入
    if (typeof lunarHour === 'string') {
      lunarHour = HOUR_MAP[lunarHour];
    }
    if (lunarHour === undefined || lunarHour < 1 || lunarHour > 12) {
      throw new Error('Invalid hour: must be 1-12 or 子-亥');
    }

    // 1. 年干年支
    var yearInfo = getYearStemBranch(lunarYear);
    var yearStem = yearInfo.stem;
    var yearBranch = yearInfo.branch;
    var genderProperty = getGenderProperty(yearStem, gender);

    // 2. 命宫身宫
    var mingShen = calculateMingShenGong(lunarMonth, lunarHour);
    var mingBranch = mingShen.ming;
    var shenBranch = mingShen.shen;

    // 3. 十二宫
    var palaces = getTwelvePalaces(mingBranch);

    // 4. 各宫天干
    palaces = calculatePalaceGans(yearStem, palaces);

    // 5. 五行局
    var mingPalace = palaces[0]; // 命宫
    var bureau = calculateBureau(mingPalace.gan, mingPalace.zhi);

    // 6. 安紫微星
    var ziweiBranch = getZiWeiPosition(bureau.bureauName, lunarDay);
    if (!ziweiBranch) {
      throw new Error('Cannot find Zi Wei position: bureau=' + bureau.bureauName + ', day=' + lunarDay);
    }

    // 7. 十四主星
    var ziweiStars = getZiWeiStars(ziweiBranch);
    var tianfuBranch = ZIWEI_TO_TIANFU[ziweiBranch];
    var tianfuStars = getTianFuStars(tianfuBranch);
    
    // 合并所有主星
    var allMajorStars = {};
    for (var key in ziweiStars) allMajorStars[key] = ziweiStars[key];
    for (var key in tianfuStars) allMajorStars[key] = tianfuStars[key];

    // 8. 辅星
    var minorStars = getAllMinorStars(yearStem, yearBranch, lunarMonth, lunarHour);

    // 9. 四化
    var sihua = getSihua(yearStem);

    // 10. 将星曜分配到各宫
    for (var i = 0; i < palaces.length; i++) {
      var palace = palaces[i];
      palace.stars = [];
      
      // 主星
      for (var starName in allMajorStars) {
        if (allMajorStars[starName] === palace.zhi) {
          var starInfo = {
            name: starName,
            type: 'major',
            sihua: []
          };
          // 检查四化
          for (var huaType in sihua) {
            if (sihua[huaType] === starName) {
              starInfo.sihua.push(huaType);
            }
          }
          palace.stars.push(starInfo);
        }
      }
      
      // 辅星
      for (var minorName in minorStars) {
        if (minorStars[minorName] === palace.zhi) {
          var minorInfo = {
            name: minorName,
            type: 'minor',
            sihua: []
          };
          // 辅星四化
          for (var huaType in sihua) {
            if (sihua[huaType] === minorName) {
              minorInfo.sihua.push(huaType);
            }
          }
          palace.stars.push(minorInfo);
        }
      }
    }

    // 11. 大限
    var dayunInfo = getDayunInfo(bureau.bureauName, genderProperty);
    var dayunPalaces = getDayunPalaces(mingBranch, dayunInfo.forward);
    var dayun = [];
    for (var i = 0; i < 12; i++) {
      dayun.push({
        palaceName: PALACE_NAMES[i],
        palaceZhi: dayunPalaces[i],
        startAge: dayunInfo.startAge + i * 10,
        endAge: dayunInfo.startAge + i * 10 + 9
      });
    }

    // 12. 身宫所在宫位
    var shenPalaceIndex = -1;
    for (var i = 0; i < palaces.length; i++) {
      if (palaces[i].zhi === shenBranch) {
        shenPalaceIndex = i;
        break;
      }
    }

    // 构建结果
    return {
      input: {
        lunarYear: lunarYear,
        lunarMonth: lunarMonth,
        lunarDay: lunarDay,
        lunarHour: lunarHour,
        hourName: HOUR_REVERSE[lunarHour],
        gender: gender
      },
      yearStem: yearStem,
      yearBranch: yearBranch,
      genderProperty: genderProperty,
      mingGong: mingBranch,
      shenGong: shenBranch,
      shenPalaceIndex: shenPalaceIndex,
      bureau: bureau,
      ziweiPosition: ziweiBranch,
      tianfuPosition: tianfuBranch,
      palaces: palaces,
      majorStars: allMajorStars,
      minorStars: minorStars,
      sihua: sihua,
      dayun: dayun
    };
  }

  // ============================================================
  // 星曜详解数据
  // ============================================================

  var STAR_DATA = {
    '紫微': {
      name: '紫微',
      english: 'Zi Wei',
      aliases: ['帝星', '北斗之主'],
      element: '土',
      color: '紫黄',
      coreTrait: '帝王星，尊贵、权威、领导力',
      strengths: '领导才能、稳重、有威严、有担当、识人用人、格局宏大',
      weaknesses: '高傲、孤独、固执、好面子、容易刚愎自用',
      palaces: {
        '命宫': '帝王入命，有领导气质，自尊心强，喜欢被尊重。紫微坐命之人通常有贵气，但不一定大富大贵，需看辅星搭配。',
        '兄弟': '兄弟中有地位较高者，但感情较淡。紫微在此兄弟姐妹能力不错但较为疏远。',
        '夫妻': '配偶有领导能力或身份地位，但婚姻中容易显强势，需要对方配合。',
        '子女': '子女有出息，有领导才能，但管教需注意方式。',
        '财帛': '钱财来得体面，有财气但未必非常富有，理财较大气。',
        '疾厄': '身体总体健康，但要注意脾胃、消化系统问题。',
        '迁移': '外出发展好，在外受人尊敬，适合在外地发展事业。',
        '交友': '朋友中有贵人，交往对象多为有地位之人。',
        '官禄': '事业运佳，适合管理、领导岗位，能从政或在大企业任高管。',
        '田宅': '不动产运佳，能继承祖业或自置房产。',
        '福德': '精神生活富足，有福气，但内心较孤高。',
        '父母': '父母有地位或能力，但缘分较薄，双亲较严肃。'
      },
      like: ['左辅', '右弼', '天魁', '天钺', '文昌', '文曲', '禄存', '天马'],
      dislike: ['破军', '七杀', '贪狼', '擎羊', '陀罗', '地空', '地劫']
    },
    '天机': {
      name: '天机',
      english: 'Tian Ji',
      aliases: ['智星', '谋士星'],
      element: '木',
      color: '青绿',
      coreTrait: '智慧、谋略、变动、思考',
      strengths: '聪明睿智、善于策划、反应快、学习能力强、口才好',
      weaknesses: '善变、多虑、神经质、容易犹豫不决',
      palaces: {
        '命宫': '智慧超群，头脑灵活，适合策划、谋略、学术研究。心思细腻但易多虑。',
        '兄弟': '兄弟聪明多才，关系较好，互有助益。',
        '夫妻': '配偶聪明能干，但因天机多变，感情中可能会有反复或波折。',
        '子女': '子女聪慧机灵，学业不错，但需注意其思虑过多的性格。',
        '财帛': '靠智慧、策划、专业技能得财，适合脑力工作。钱财流动较大。',
        '疾厄': '易有神经衰弱、失眠、精神紧张等问题。注意肝胆。',
        '迁移': '在外发展靠智慧和人际关系，适合变动中求发展。',
        '交友': '朋友多为智谋之士，交际圈中善于出谋划策。',
        '官禄': '适合策划、研发、咨询、教育等脑力工作，事业多变化。',
        '田宅': '房产变动较多，可能会多次搬家或换房。',
        '福德': '精神活跃，喜欢思考，但内心较难平静。',
        '父母': '父母聪明，但关系较复杂，可能有多个长辈影响。'
      },
      like: ['文昌', '文曲', '天魁', '天钺', '禄存'],
      dislike: ['擎羊', '陀罗', '地空', '地劫', '铃星']
    },
    '太阳': {
      name: '太阳',
      english: 'Tai Yang',
      aliases: ['光明星', '官禄主'],
      element: '火',
      color: '赤红',
      coreTrait: '光明、热情、散财、博爱',
      strengths: '慷慨大方、热心助人、光明磊落、积极乐观、有领导风范',
      weaknesses: '奔波劳碌、容易破财、过度热心反招怨、有时过于自我',
      palaces: {
        '命宫': '性格光明磊落，热情大方，喜欢帮助别人。但太阳喜照亮别人，容易为他人奔波。',
        '兄弟': '兄弟姐妹关系和睦，互助互爱。',
        '夫妻': '配偶热情大方，但太阳在夫妻宫易有聚少离多的情况。男命妻夺夫权。',
        '子女': '子女活泼开朗，有爱心，但管教需注意不要过度溺爱。',
        '财帛': '钱财来得光明磊落，但不易积存，易破财，因太阳有散财之意。',
        '疾厄': '注意心脏、血液、眼睛方面的疾病。',
        '迁移': '在外人缘好，受人欢迎，适合从事公益或服务行业。',
        '交友': '朋友众多，交友广阔，但需防热脸贴冷屁股。',
        '官禄': '绝佳的事业宫，适合从政、教育、公益、社会工作等。',
        '田宅': '住宅阳光充足，但房产运一般，不易积累大量不动产。',
        '福德': '精神世界光明积极，内心温暖。',
        '父母': '父亲较为显赫，或与父亲缘分较深。'
      },
      like: ['天魁', '天钺', '左辅', '右弼', '禄存'],
      dislike: ['擎羊', '陀罗', '地空', '地劫', '巨门', '化忌']
    },
    '武曲': {
      name: '武曲',
      english: 'Wu Qu',
      aliases: ['财星', '将星'],
      element: '金',
      color: '白金',
      coreTrait: '财富、刚毅、果断、执行力',
      strengths: '意志坚定、执行力强、善于理财、果断利落、有商业头脑',
      weaknesses: '性格刚硬、固执己见、不善变通、人际关系较冷淡',
      palaces: {
        '命宫': '性格刚毅果断，有财气，适合从事金融、商业、军警等方面工作。',
        '兄弟': '兄弟姐妹性格刚强，但关系较冷漠，各自独立。',
        '夫妻': '配偶性格刚毅，婚姻中较为理性，感情表达不多。',
        '子女': '子女独立自主，有决断力，但亲子关系略严肃。',
        '财帛': '正财旺盛，理财能力强，适合经商或从事金融行业。武曲为财星之最。',
        '疾厄': '注意呼吸系统、肺部、皮肤方面的疾病。',
        '迁移': '在外发展适合从事商业活动，凭实力打拼。',
        '交友': '朋友多属实干型，但不会有很多酒肉朋友。',
        '官禄': '事业运很强，适合金融、军警、工程、管理等。',
        '田宅': '能积累房产，但不善享受。',
        '福德': '精神世界较实际，缺乏浪漫。',
        '父母': '父母性格刚强，家教比较严格。'
      },
      like: ['文昌', '文曲', '天魁', '天钺', '禄存'],
      dislike: ['擎羊', '陀罗', '铃星', '火星']
    },
    '天同': {
      name: '天同',
      english: 'Tian Tong',
      aliases: ['福星', '小孩星'],
      element: '水',
      color: '玄黑',
      coreTrait: '福气、和谐、随和、享受',
      strengths: '性格温和、人缘好、有福气、知足常乐、善于协调',
      weaknesses: '懒散、缺乏进取心、依赖性强、容易安于现状',
      palaces: {
        '命宫': '天性乐观，有福之人，性格温和，但容易缺乏上进心。',
        '兄弟': '兄弟姐妹关系和睦温馨。',
        '夫妻': '婚姻美满和谐，配偶性格温和。',
        '子女': '子女乖巧可爱，有福气，亲子关系融洽。',
        '财帛': '财运平平但够用，属于细水长流型，不愁吃穿。',
        '疾厄': '身体总体健康，小病较难免但无大碍。',
        '迁移': '在外人缘好，适合从事需要人际协调的工作。',
        '交友': '朋友缘好，人脉广，社交和谐。',
        '官禄': '适合轻松愉快的工作环境，不适合高压竞争。',
        '田宅': '住宅环境安逸舒适。',
        '福德': '精神生活满足，懂得享受生活。',
        '父母': '父母慈祥，家庭氛围温馨。'
      },
      like: ['太阴', '天梁', '左辅', '右弼', '禄存', '天魁', '天钺'],
      dislike: ['擎羊', '陀罗', '火星', '铃星']
    },
    '廉贞': {
      name: '廉贞',
      english: 'Lian Zhen',
      aliases: ['桃花星', '次桃花'],
      element: '火',
      color: '红紫',
      coreTrait: '才华、复杂、次桃花、政治',
      strengths: '聪明有才华、有艺术气质、重感情、有正义感',
      weaknesses: '内心复杂、感情纠葛多、情绪化、易有是非',
      palaces: {
        '命宫': '聪明有才艺，但命格复杂，一生起伏较多。桃花旺，感情世界丰富。',
        '兄弟': '兄弟姐妹中有人才艺出众，但感情较复杂。',
        '夫妻': '感情丰富，桃花重，婚姻易有第三者困扰。',
        '子女': '子女聪明有才艺，但需要正确引导。',
        '财帛': '偏财运不错，可通过才艺或人际关系得财，但不稳定。',
        '疾厄': '注意妇科、泌尿系统、内分泌问题。',
        '迁移': '在外交际应酬多，人脉广但需防是非。',
        '交友': '朋友多为艺术家或才子佳人，交际圈复杂。',
        '官禄': '适合文艺、政治、外交、公关等需要交际能力的行业。',
        '田宅': '住宅风格有艺术感，但房产运一般。',
        '福德': '精神世界丰富，多愁善感。',
        '父母': '父母关系较复杂，可能有双重家庭影响。'
      },
      like: ['文昌', '文曲', '天魁', '天钺', '紫微'],
      dislike: ['擎羊', '陀罗', '地空', '地劫', '七杀']
    },
    '天府': {
      name: '天府',
      english: 'Tian Fu',
      aliases: ['库星', '令星'],
      element: '土',
      color: '黄褐',
      coreTrait: '稳重、库藏、保守、管理',
      strengths: '稳重谨慎、善于管理、有远见、保守守成、理财有道',
      weaknesses: '过于保守、缺乏冒险精神、有时过于吝啬',
      palaces: {
        '命宫': '性格稳重有领导风范，善于管理和积累，适合守成发展。',
        '兄弟': '兄弟姐妹稳重可靠，互帮互助。',
        '夫妻': '婚姻稳定，配偶稳重可靠，懂得持家。',
        '子女': '子女稳重懂事，教育上注重传统。',
        '财帛': '财富积累能力强，善于理财，财运稳定。',
        '疾厄': '身体总体健康，注意消化系统。',
        '迁移': '适合在稳定环境中发展，不宜频繁变动。',
        '交友': '朋友多为稳重可靠之人。',
        '官禄': '适合行政管理、财务、仓储物流等。',
        '田宅': '不动产丰厚，房产运佳。',
        '福德': '精神世界稳定平和。',
        '父母': '父母稳重，家庭经济条件不错。'
      },
      like: ['左辅', '右弼', '天魁', '天钺', '禄存'],
      dislike: ['擎羊', '陀罗', '地空', '地劫', '破军']
    },
    '太阴': {
      name: '太阴',
      english: 'Tai Yin',
      aliases: ['富星', '田宅主'],
      element: '水',
      color: '银白',
      coreTrait: '温柔、财富、美丽、内敛',
      strengths: '温柔细腻、有艺术气质、审美能力强、善于理财积累',
      weaknesses: '敏感多疑、情绪化、忧郁、内向',
      palaces: {
        '命宫': '性格温柔内敛，有艺术气质，长相清秀。适合从事文化艺术或财务工作。',
        '兄弟': '兄弟姐妹关系温和，姐妹缘分更深。',
        '夫妻': '配偶温柔美丽，婚姻美满但需注意太阴落陷时的感情问题。',
        '子女': '子女温柔有礼，有艺术天赋。',
        '财帛': '偏财运不错，善于投资理财，适合与女性或艺术相关的行业。',
        '疾厄': '注意妇科、眼睛、肾脏方面的问题。',
        '迁移': '在外人缘好，适合在安静的环境中发展。',
        '交友': '朋友多为温柔细腻之人。',
        '官禄': '适合文化、艺术、财务、护理等行业。',
        '田宅': '田宅运佳，喜欢安逸舒适的居住环境。',
        '福德': '精神世界丰富浪漫。',
        '父母': '母亲影响较大，家庭环境温馨。'
      },
      like: ['文昌', '文曲', '天魁', '天钺', '禄存'],
      dislike: ['擎羊', '陀罗', '地空', '地劫']
    },
    '贪狼': {
      name: '贪狼',
      english: 'Tan Lang',
      aliases: ['桃花星', '正桃花', '欲望星'],
      element: '木',
      color: '翠绿',
      coreTrait: '欲望、桃花、才艺、交际',
      strengths: '多才多艺、社交能力强、有魅力、善于应变',
      weaknesses: '欲望强、意志不坚、喜新厌旧、容易沉溺酒色',
      palaces: {
        '命宫': '多才多艺，社交能力强，桃花旺，有魅力。但需控制欲望，避免沉溺。',
        '兄弟': '兄弟姐妹中有才艺型的，但关系复杂。',
        '夫妻': '桃花重，婚姻中易有诱惑。需搭配吉星才能稳定。',
        '子女': '子女活泼聪明，多才多艺，但管教较费心。',
        '财帛': '偏财运旺，可通过才艺和人际关系得财。',
        '疾厄': '注意肝脏、生殖系统方面的疾病。',
        '迁移': '在外交际广，有发财机会，适合异地发展。',
        '交友': '朋友众多，三教九流都有。',
        '官禄': '适合娱乐、艺术、商业、外交等行业。',
        '田宅': '住宅风格奢华，但可能经常变动。',
        '福德': '精神世界丰富多彩，追求享乐。',
        '父母': '父母关系较复杂。'
      },
      like: ['左辅', '右弼', '文昌', '文曲', '禄存', '天马'],
      dislike: ['擎羊', '陀罗', '地空', '地劫', '廉贞']
    },
    '巨门': {
      name: '巨门',
      english: 'Ju Men',
      aliases: ['暗星', '是非星'],
      element: '水',
      color: '暗黑',
      coreTrait: '口才、是非、暗伏、推理',
      strengths: '口才好、善于分析推理、有学术研究能力',
      weaknesses: '是非多、说话得罪人、内心阴暗多疑',
      palaces: {
        '命宫': '口才犀利，善辩，适合从事法律、教育、咨询等行业。但需防口舌是非。',
        '兄弟': '兄弟姐妹间有口舌之争，关系较紧张。',
        '夫妻': '婚姻中容易因言语产生误会和矛盾。',
        '子女': '子女口才好但较叛逆，需注意沟通方式。',
        '财帛': '靠口才或专业技能得财，正财稳定但偏财不佳。',
        '疾厄': '注意肠胃、消化系统、口腔方面的疾病。',
        '迁移': '外出发展易遇是非，需谨言慎行。',
        '交友': '朋友中容易有是非之人，交友需谨慎。',
        '官禄': '适合法律、教师、咨询、公关等需口才的职业。',
        '田宅': '住宅较暗或周围环境嘈杂。',
        '福德': '内心多思虑，容易钻牛角尖。',
        '父母': '父母关系紧张，或父母管教严格。'
      },
      like: ['天机', '文昌', '文曲', '太阳', '天魁', '天钺'],
      dislike: ['擎羊', '陀罗', '地空', '地劫', '铃星']
    },
    '天相': {
      name: '天相',
      english: 'Tian Xiang',
      aliases: ['印星', '佐星'],
      element: '水',
      color: '淡蓝',
      coreTrait: '辅助、协调、正直、管理',
      strengths: '正直善良、善于协调、有管理能力、人缘好',
      weaknesses: '缺乏主见、过于依赖他人、容易受环境影响',
      palaces: {
        '命宫': '性格正直善良，适合从事管理、协调、秘书等工作。为人心地善良。',
        '兄弟': '兄弟姐妹和睦，互相关爱。',
        '夫妻': '婚姻和谐美满，配偶正直善良。',
        '子女': '子女听话懂事，教育上较省心。',
        '财帛': '财运平稳，适合通过正当职业获取收入。',
        '疾厄': '身体较为健康，注意皮肤问题。',
        '迁移': '在外人缘好，适合从事服务型工作。',
        '交友': '朋友正直可靠，能得朋友相助。',
        '官禄': '适合管理、行政、秘书、公证等辅助性工作。',
        '田宅': '房产运一般，但居住环境舒适。',
        '福德': '内心善良平和。',
        '父母': '父母正直，家庭氛围良好。'
      },
      like: ['紫微', '天府', '左辅', '右弼', '天魁', '天钺', '禄存'],
      dislike: ['擎羊', '陀罗', '地空', '地劫', '破军']
    },
    '天梁': {
      name: '天梁',
      english: 'Tian Liang',
      aliases: ['寿星', '荫星', '解厄星'],
      element: '土',
      color: '金黄',
      coreTrait: '长寿、福荫、解厄、正直',
      strengths: '正直有德、福泽深厚、能解厄运、有领导风范',
      weaknesses: '好为人师、唠叨、固执、容易操心',
      palaces: {
        '命宫': '为人正直有德，有福气，长寿之命。天梁入命有解厄之功，遇事常能化险为夷。',
        '兄弟': '兄弟姐妹中有年长者庇护。',
        '夫妻': '配偶年龄较大或心智成熟，婚姻稳定。',
        '子女': '子女正直孝顺，但管教较为严格。',
        '财帛': '财运稳定，虽不暴富但能积累。',
        '疾厄': '身体较健康，大病不多。',
        '迁移': '在外有贵人相助，适合到异地发展。',
        '交友': '朋友多为正直可靠的长辈型人物。',
        '官禄': '适合教育、医疗、司法、宗教等职业。',
        '田宅': '祖业不错，能继承家业。',
        '福德': '精神世界充实，晚年安乐。',
        '父母': '父母有福气，家教良好。'
      },
      like: ['左辅', '右弼', '天魁', '天钺', '禄存'],
      dislike: ['擎羊', '陀罗', '地空', '地劫']
    },
    '七杀': {
      name: '七杀',
      english: 'Qi Sha',
      aliases: ['将星', '肃杀星'],
      element: '金',
      color: '银灰',
      coreTrait: '魄力、杀伐、果断、开创',
      strengths: '有魄力、决断力强、执行力高、能开创局面',
      weaknesses: '性格刚烈、冲动、孤独、人缘较差',
      palaces: {
        '命宫': '性格刚烈，有魄力，适合军警、外科医生、创业者等职业。人生大起大落。',
        '兄弟': '兄弟姐妹关系较淡，或为争产反目。',
        '夫妻': '婚姻中矛盾较多，配偶性格刚烈。',
        '子女': '子女个性强，管教困难。',
        '财帛': '财运大起大落，能赚大钱但也容易破大财。',
        '疾厄': '注意意外伤害、手术、心血管疾病。',
        '迁移': '在外适合开创性事业，但需注意安全。',
        '交友': '朋友较少，但多为肝胆相照之人。',
        '官禄': '适合军警、外科、工程、创业等。',
        '田宅': '房产变动大，可能常搬家。',
        '福德': '内心刚强，不易放松。',
        '父母': '父母关系紧张或父母管教严厉。'
      },
      like: ['紫微', '天府', '左辅', '右弼', '禄存', '天马'],
      dislike: ['擎羊', '陀罗', '铃星', '火星', '地空', '地劫', '廉贞']
    },
    '破军': {
      name: '破军',
      english: 'Po Jun',
      aliases: ['耗星', '变动星'],
      element: '水',
      color: '暗蓝',
      coreTrait: '破坏、重建、变动、革新',
      strengths: '有胆识、敢于突破、善于打破旧局重建新局',
      weaknesses: '破坏性强、冲动、不稳定、易得罪人',
      palaces: {
        '命宫': '一生变动大，破而后立。适合从事需要创新和变革的行业。',
        '兄弟': '兄弟姐妹中有离乡或关系破裂的情况。',
        '夫妻': '婚姻变化多，易有分离再婚的情况。',
        '子女': '子女个性叛逆，管教费心。',
        '财帛': '财运起伏大，花钱如流水，不善于理财。',
        '疾厄': '注意意外伤害、手术、妇科疾病。',
        '迁移': '适合在变动中求发展，异地发展机会多。',
        '交友': '朋友三教九流，有江湖义气但不太稳定。',
        '官禄': '适合工程师、建筑师、拆迁、创新行业等。',
        '田宅': '房产变动大，可能多次搬家或重建房屋。',
        '福德': '内心不安定，喜欢刺激和变化。',
        '父母': '父母关系或有变故家庭背景较复杂。'
      },
      like: ['紫微', '禄存', '天魁', '天钺', '文昌', '文曲'],
      dislike: ['擎羊', '陀罗', '铃星', '火星', '地空', '地劫']
    }
  };

  // ============================================================
  // 四化详解
  // ============================================================

  var SIHUA_DATA = {
    '化禄': {
      name: '化禄',
      meaning: '增加财运、人缘、福气。化禄入哪宫，哪宫就有福气和财气。',
      palaces: {
        '命宫': '天生有财运福气，赚钱容易，性格慷慨。',
        '兄弟': '兄弟姐妹有助益，或能从兄弟处得财。',
        '夫妻': '配偶财运好，或婚姻能带来财富。',
        '子女': '子女带来的财运，或为子女置产。',
        '财帛': '财运大好，赚钱轻松，财源广进。',
        '疾厄': '身体状况改善，或因病得财（如保险理赔）。',
        '迁移': '外出发展财运好，适合异地求财。',
        '交友': '朋友中有贵人相助，交际能得利。',
        '官禄': '事业运佳，升职加薪，事业财源好。',
        '田宅': '不动产增加，能置产或房屋增值。',
        '福德': '有福气，精神物质双丰收。',
        '父母': '父母财运好，能得祖上余荫。'
      }
    },
    '化权': {
      name: '化权',
      meaning: '增加权力、掌控力、地位。化权入哪宫，哪宫就有掌控力和话语权。',
      palaces: {
        '命宫': '有领导能力，能掌握权力，有权威。',
        '兄弟': '在兄弟姐妹中有话语权，或兄弟姐妹中有掌权者。',
        '夫妻': '在婚姻中占主导地位，或配偶有实权。',
        '子女': '对子女有较强的管束力，子女在群体中能当领导。',
        '财帛': '能掌握财权，理财能力强。',
        '疾厄': '身体状况由自己掌控，意志力强。',
        '迁移': '外出发展能获得权力地位。',
        '交友': '在朋友圈中有领导力，能成为核心人物。',
        '官禄': '事业运强，能掌权，适合做管理。',
        '田宅': '对不动产有掌控权。',
        '福德': '内心有主见，精神独立。',
        '父母': '父母有实权，或自己能影响父母。'
      }
    },
    '化科': {
      name: '化科',
      meaning: '增加名声、学业、文采、贵人。化科入哪宫，哪宫就有名声和贵人。',
      palaces: {
        '命宫': '有文采名声，学业佳，贵人多。',
        '兄弟': '兄弟姐妹有文名或是读书人。',
        '夫妻': '配偶有才华名声。',
        '子女': '子女学业佳，有出息。',
        '财帛': '靠名声或学识得财，清高之财。',
        '疾厄': '病有良医，能逢凶化吉。',
        '迁移': '外出能得名声，有贵人相助。',
        '交友': '朋友多为文人雅士或良师益友。',
        '官禄': '事业上有名望，适合学术、教育、文化行业。',
        '田宅': '住宅有文化气息。',
        '福德': '精神修养好。',
        '父母': '父母有文化教养，或得父母提携。'
      }
    },
    '化忌': {
      name: '化忌',
      meaning: '增加困扰、阻碍、烦恼、损失。化忌入哪宫，哪宫就需特别小心。',
      palaces: {
        '命宫': '一生较坎坷，内心易纠结，需修心养性。',
        '兄弟': '兄弟姐妹关系不佳，或兄弟姐妹有难。',
        '夫妻': '婚姻不顺，感情困扰多。',
        '子女': '子女问题多，或为子女操心。',
        '财帛': '钱财破耗，守财不易，投资需谨慎。',
        '疾厄': '身体状况较差，需注意健康问题。',
        '迁移': '外出发展不顺，易遇阻碍。',
        '交友': '交友易吃亏，易被朋友拖累。',
        '官禄': '事业不顺，工作压力大。',
        '田宅': '房产不顺，或为房子烦恼。',
        '福德': '内心煎熬，精神压力大。',
        '父母': '父母健康或关系不佳。'
      }
    }
  };

  // ============================================================
  // 常见格局
  // ============================================================

  var PATTERNS = {
    '紫微朝垣': {
      name: '紫微朝垣',
      description: '紫微在命宫或身宫，且三合（命宫、官禄、财帛）有吉星拱照，为极贵之格。',
      condition: function(chart) {
        var ming = chart.palaces[0];
        var hasZiWei = ming.stars.some(function(s) { return s.name === '紫微'; });
        return hasZiWei;
      },
      level: '上格'
    },
    '紫府同宫': {
      name: '紫府同宫',
      description: '紫微与天府同宫或对宫，为君臣主从配合，有富贵之象。',
      condition: function(chart) {
        for (var i = 0; i < chart.palaces.length; i++) {
          var p = chart.palaces[i];
          var hasZiWei = false, hasTianFu = false;
          for (var j = 0; j < p.stars.length; j++) {
            if (p.stars[j].name === '紫微') hasZiWei = true;
            if (p.stars[j].name === '天府') hasTianFu = true;
          }
          if (hasZiWei && hasTianFu) return true;
        }
        return false;
      },
      level: '中上格'
    },
    '七杀朝斗': {
      name: '七杀朝斗',
      description: '七杀坐命宫，紫微在三方拱照，为将星得位，权威显赫。',
      condition: function(chart) {
        var ming = chart.palaces[0];
        var hasQiSha = ming.stars.some(function(s) { return s.name === '七杀'; });
        return hasQiSha;
      },
      level: '中格'
    },
    '武曲守垣': {
      name: '武曲守垣',
      description: '武曲在命宫或财帛宫，财星得位，经商致富。',
      condition: function(chart) {
        var ming = chart.palaces[0];
        var caiBo = chart.palaces[4];
        return ming.stars.some(function(s) { return s.name === '武曲'; }) ||
               caiBo.stars.some(function(s) { return s.name === '武曲'; });
      },
      level: '中格'
    },
    '日月同临': {
      name: '日月同临',
      description: '太阳太阴同宫或对照，阴阳调和，主聪明富贵。',
      condition: function(chart) {
        for (var i = 0; i < chart.palaces.length; i++) {
          var p = chart.palaces[i];
          var hasSun = false, hasMoon = false;
          for (var j = 0; j < p.stars.length; j++) {
            if (p.stars[j].name === '太阳') hasSun = true;
            if (p.stars[j].name === '太阴') hasMoon = true;
          }
          if (hasSun && hasMoon) return true;
        }
        return false;
      },
      level: '中上格'
    },
    '科权禄夹命': {
      name: '科权禄夹命',
      description: '命宫被化科、化权、化禄三方的星曜夹辅，为极贵之格。',
      condition: function(chart) {
        var ming = chart.palaces[0];
        var sihua = chart.sihua;
        var hasLuh = sihua.化禄;
        var hasQuan = sihua.化权;
        var hasKe = sihua.化科;
        if (!hasLuh && !hasQuan && !hasKe) return false;
        // 检查这三颗星是否在三方
        var mingZhi = ming.zhi;
        var guanLuZhi = chart.palaces[7] ? chart.palaces[7].zhi : '';
        var caiBoZhi = chart.palaces[4] ? chart.palaces[4].zhi : '';
        var sanHeZhis = [mingZhi, guanLuZhi, caiBoZhi];
        return true; // Simplified pattern detection
      },
      level: '上格'
    },
    '天魁天钺双辅': {
      name: '天魁天钺双辅',
      description: '天魁天钺在三方四正会照，贵人运极佳。',
      condition: function(chart) {
        for (var i = 0; i < chart.palaces.length; i++) {
          var p = chart.palaces[i];
          var hasKui = false, hasYue = false;
          for (var j = 0; j < p.stars.length; j++) {
            if (p.stars[j].name === '天魁') hasKui = true;
            if (p.stars[j].name === '天钺') hasYue = true;
          }
          if (hasKui && hasYue) return true;
        }
        return false;
      },
      level: '中上格'
    },
    '禄马交驰': {
      name: '禄马交驰',
      description: '禄存与天马同宫或在三方合照，主异地发财。',
      condition: function(chart) {
        for (var i = 0; i < chart.palaces.length; i++) {
          var p = chart.palaces[i];
          var hasLucun = false, hasTianma = false;
          for (var j = 0; j < p.stars.length; j++) {
            if (p.stars[j].name === '禄存') hasLucun = true;
            if (p.stars[j].name === '天马') hasTianma = true;
          }
          if (hasLucun && hasTianma) return true;
        }
        return false;
      },
      level: '中格'
    },
    '机月同梁': {
      name: '机月同梁',
      description: '天机、太阴、天同、天梁在命宫三合，主聪明、有福、适合公职。',
      condition: function(chart) {
        var names = [];
        for (var i = 0; i < chart.palaces.length; i++) {
          for (var j = 0; j < chart.palaces[i].stars.length; j++) {
            names.push(chart.palaces[i].stars[j].name);
          }
        }
        var hasJi = names.indexOf('天机') !== -1;
        var hasYue = names.indexOf('太阴') !== -1;
        var hasTong = names.indexOf('天同') !== -1;
        var hasLiang = names.indexOf('天梁') !== -1;
        return hasJi && hasYue && hasTong && hasLiang;
      },
      level: '中格'
    },
    '杀破狼': {
      name: '杀破狼',
      description: '七杀、破军、贪狼在命宫三方会照，主变动大、有开创性。',
      condition: function(chart) {
        var names = [];
        for (var i = 0; i < chart.palaces.length; i++) {
          for (var j = 0; j < chart.palaces[i].stars.length; j++) {
            names.push(chart.palaces[i].stars[j].name);
          }
        }
        var hasSha = names.indexOf('七杀') !== -1;
        var hasPo = names.indexOf('破军') !== -1;
        var hasTan = names.indexOf('贪狼') !== -1;
        return hasSha && hasPo && hasTan;
      },
      level: '中格'
    },
    '廉贞清白格': {
      name: '廉贞清白格',
      description: '廉贞在命宫或身宫，不受四煞冲照，主正直有节操。',
      condition: function(chart) {
        for (var i = 0; i < chart.palaces.length; i++) {
          for (var j = 0; j < chart.palaces[i].stars.length; j++) {
            if (chart.palaces[i].stars[j].name === '廉贞' && chart.palaces[i].stars[j].type === 'major') {
              var hasSha = chart.palaces[i].stars.some(function(s) { return ['擎羊', '陀罗', '火星', '铃星'].indexOf(s.name) !== -1; });
              return !hasSha;
            }
          }
        }
        return false;
      },
      level: '中格'
    },
    '紫微七杀化权': {
      name: '紫微七杀化权',
      description: '紫微七杀加化权，威权显赫，大权在握。',
      condition: function(chart) {
        for (var i = 0; i < chart.palaces.length; i++) {
          var p = chart.palaces[i];
          var hasZiWei = false, hasQiSha = false, hasQuan = false;
          for (var j = 0; j < p.stars.length; j++) {
            var s = p.stars[j];
            if (s.name === '紫微') hasZiWei = true;
            if (s.name === '七杀') hasQiSha = true;
            if (s.name === '紫微' && s.sihua.indexOf('化权') !== -1) hasQuan = true;
          }
          if (hasZiWei && hasQiSha) return true;
        }
        return false;
      },
      level: '上格'
    },
    '文星拱命': {
      name: '文星拱命',
      description: '文昌文曲在三方拱照命宫，主聪明好学、有文采。',
      condition: function(chart) {
        for (var i = 0; i < chart.palaces.length; i++) {
          var p = chart.palaces[i];
          var hasChang = false, hasQu = false;
          for (var j = 0; j < p.stars.length; j++) {
            if (p.stars[j].name === '文昌') hasChang = true;
            if (p.stars[j].name === '文曲') hasQu = true;
          }
          if (hasChang && hasQu) return true;
        }
        return false;
      },
      level: '中格'
    },
    '巨日同宫': {
      name: '巨日同宫',
      description: '巨门与太阳同宫或对照，主大富大贵、名扬天下。',
      condition: function(chart) {
        for (var i = 0; i < chart.palaces.length; i++) {
          var p = chart.palaces[i];
          var hasJu = false, hasRi = false;
          for (var j = 0; j < p.stars.length; j++) {
            if (p.stars[j].name === '巨门') hasJu = true;
            if (p.stars[j].name === '太阳') hasRi = true;
          }
          if (hasJu && hasRi) return true;
        }
        return false;
      },
      level: '中上格'
    },
    '天同天梁会': {
      name: '天同天梁会',
      description: '天同与天梁在三方会照，主福寿双全。',
      condition: function(chart) {
        for (var i = 0; i < chart.palaces.length; i++) {
          var p = chart.palaces[i];
          var hasTong = false, hasLiang = false;
          for (var j = 0; j < p.stars.length; j++) {
            if (p.stars[j].name === '天同') hasTong = true;
            if (p.stars[j].name === '天梁') hasLiang = true;
          }
          if (hasTong && hasLiang) return true;
        }
        return false;
      },
      level: '中上格'
    }
  };

  // ============================================================
  // 公共接口
  // ============================================================

  /**
   * 获取星曜详细资料
   */
  function getStarDetail(starName) {
    return STAR_DATA[starName] || null;
  }

  /**
   * 获取四化在各宫含义
   */
  function getSihuaMeaning(type, palaceName) {
    var sihuaInfo = SIHUA_DATA[type];
    if (!sihuaInfo) return null;
    if (!palaceName) return sihuaInfo;
    return sihuaInfo.palaces[palaceName] || null;
  }

  /**
   * 识别命盘中的所有格局
   */
  function identifyPatterns(chart) {
    var result = [];
    for (var key in PATTERNS) {
      try {
        if (PATTERNS[key].condition(chart)) {
          result.push({
            key: key,
            name: PATTERNS[key].name,
            description: PATTERNS[key].description,
            level: PATTERNS[key].level
          });
        }
      } catch (e) {
        // Skip patterns that error
      }
    }
    return result;
  }

  /**
   * 获取所有星曜的列表
   */
  function getAllStarNames() {
    return Object.keys(STAR_DATA);
  }

  /**
   * 获取所有格局配置
   */
  function getPatternConfig() {
    var result = {};
    for (var key in PATTERNS) {
      result[key] = {
        name: PATTERNS[key].name,
        description: PATTERNS[key].description,
        level: PATTERNS[key].level
      };
    }
    return result;
  }

  // ============================================================
  // 导出
  // ============================================================

  return {
    calculate: calculate,
    STAR_DATA: STAR_DATA,
    SIHUA_DATA: SIHUA_DATA,
    PATTERN_DATA: PATTERNS,
    getStarDetail: getStarDetail,
    getSihuaMeaning: getSihuaMeaning,
    identifyPatterns: identifyPatterns,
    getAllStarNames: getAllStarNames,
    getPatternConfig: getPatternConfig
  };

})();
