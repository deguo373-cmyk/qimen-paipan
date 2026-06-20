#!/usr/bin/env python3
"""
八字排盘 API — Vercel Serverless Function
"""
from http.server import BaseHTTPRequestHandler
import json
import sys
import os

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_scripts_dir = os.path.join(_project_root, 'qimen-dunjia', 'scripts')
sys.path.insert(0, _scripts_dir)

from qimen_cli import normalize_input, build_solar_and_lunar, get_timezone, ZoneInfoNotFoundError


# ── 天干五行 ──────────────────────────────────
TIANGAN_WUXING = {
    "甲": "木", "乙": "木",
    "丙": "火", "丁": "火",
    "戊": "土", "己": "土",
    "庚": "金", "辛": "金",
    "壬": "水", "癸": "水",
}

TIANGAN_YINYANG = {
    "甲": "阳", "乙": "阴",
    "丙": "阳", "丁": "阴",
    "戊": "阳", "己": "阴",
    "庚": "阳", "辛": "阴",
    "壬": "阳", "癸": "阴",
}

# ── 地支藏干 ──────────────────────────────────
DIZHI_CANGGAN = {
    "子": ["癸"],
    "丑": ["己", "癸", "辛"],
    "寅": ["甲", "丙", "戊"],
    "卯": ["乙"],
    "辰": ["戊", "乙", "癸"],
    "巳": ["丙", "庚", "戊"],
    "午": ["丁", "己"],
    "未": ["己", "丁", "乙"],
    "申": ["庚", "壬", "戊"],
    "酉": ["辛"],
    "戌": ["戊", "辛", "丁"],
    "亥": ["壬", "甲"],
}

# ── 十神规则 ──────────────────────────────────
# Key: (日主五行, 其他干五行, 阴阳关系)
# Same element: 比肩(同阴阳) / 劫财(异阴阳)
# Generate 日主: 正印(异) / 偏印(同)
# 日主 generates: 伤官(异) / 食神(同)
# 日主 controls: 正财(异) / 偏财(同)
# Controls 日主: 正官(异) / 七杀(同)

WUXING_CYCLE = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"]
# Actually let's use a simple lookup
WUXING = ["木", "火", "土", "金", "水"]

def wuxing_index(wx):
    return WUXING.index(wx)

def get_shi_shen(day_gan, other_gan):
    """Calculate 十神 relationship between 日主 and another stem."""
    day_wx = TIANGAN_WUXING[day_gan]
    other_wx = TIANGAN_WUXING[other_gan]
    day_yy = TIANGAN_YINYANG[day_gan]
    other_yy = TIANGAN_YINYANG[other_gan]

    if day_wx == other_wx:
        return "比肩" if day_yy == other_yy else "劫财"

    di = wuxing_index(day_wx)
    oi = wuxing_index(other_wx)

    # 日主生其他 (我生)
    if (di + 1) % 5 == oi:
        return "伤官" if day_yy != other_yy else "食神"
    if (di + 2) % 5 == oi:
        return "食神" if day_yy != other_yy else "伤官"

    # 其他生日主 (生我)
    if (oi + 1) % 5 == di:
        return "正印" if day_yy != other_yy else "偏印"
    if (oi + 2) % 5 == di:
        return "偏印" if day_yy != other_yy else "正印"

    # 日主克其他 (我克)
    if (di + 4) % 5 == oi:
        return "正财" if day_yy != other_yy else "偏财"
    if (di + 3) % 5 == oi:
        return "偏财" if day_yy != other_yy else "正财"

    # 其他克日主 (克我)
    if (oi + 4) % 5 == di:
        return "正官" if day_yy != other_yy else "七杀"
    if (oi + 3) % 5 == di:
        return "七杀" if day_yy != other_yy else "正官"

    return "?"


def compute_bazi(payload):
    """Main Ba Zi calculation."""
    normalized = normalize_input(payload)
    solar, lunar = build_solar_and_lunar(normalized)

    day_gan = lunar.getDayGan()

    # 四柱
    pillars = {
        "year":  {"gan": lunar.getYearGan(), "zhi": lunar.getYearZhi(), "ganzhi": lunar.getYearInGanZhiExact(), "nayin": lunar.getYearNaYin()},
        "month": {"gan": lunar.getMonthGan(), "zhi": lunar.getMonthZhi(), "ganzhi": lunar.getMonthInGanZhiExact(), "nayin": lunar.getMonthNaYin()},
        "day":   {"gan": lunar.getDayGan(), "zhi": lunar.getDayZhiExact(), "ganzhi": lunar.getDayInGanZhiExact(), "nayin": lunar.getDayNaYin()},
        "hour":  {"gan": lunar.getTimeGan(), "zhi": lunar.getTimeZhi(), "ganzhi": lunar.getTimeInGanZhi(), "nayin": lunar.getTimeNaYin()},
    }

    # 十神 — 天干
    shishen = {
        "year_gan": get_shi_shen(day_gan, pillars["year"]["gan"]),
        "month_gan": get_shi_shen(day_gan, pillars["month"]["gan"]),
        "day_gan": "日主",
        "hour_gan": get_shi_shen(day_gan, pillars["hour"]["gan"]),
    }

    # 地支藏干 + 十神
    canggan = {}
    for pos, zhi in [("year", pillars["year"]["zhi"]), ("month", pillars["month"]["zhi"]), ("day", pillars["day"]["zhi"]), ("hour", pillars["hour"]["zhi"])]:
        hidden = DIZHI_CANGGAN.get(zhi, [])
        canggan[pos] = [{"gan": g, "shishen": get_shi_shen(day_gan, g)} for g in hidden]

    # 地支十神（取本气为主）
    zhishi = {}
    for pos in ["year", "month", "day", "hour"]:
        zhi = pillars[pos]["zhi"]
        hidden = DIZHI_CANGGAN.get(zhi, [])
        zhishi[pos] = get_shi_shen(day_gan, hidden[0]) if hidden else ""

    # 大运
    gender = str(payload.get("gender", "男")).strip()
    birth_year_gan = pillars["year"]["gan"]
    is_yang_year = TIANGAN_YINYANG[birth_year_gan] == "阳"
    is_male = gender == "男"

    # 阳男阴女 → 顺排；阴男阳女 → 逆排
    forward = (is_yang_year and is_male) or (not is_yang_year and not is_male)

    # 计算起运年龄 and 大运干支列表
    day_ganzhi = pillars["day"]["ganzhi"]
    day_gan_idx = _gan_index(pillars["day"]["gan"])
    day_zhi_idx = _zhi_index(pillars["day"]["zhi"])

    # 大运每个运10年，从出生日到下一个(顺)或上一个(逆)节气
    # 月柱决定大运起始
    month_gan_idx = _gan_index(pillars["month"]["gan"])
    month_zhi_idx = _zhi_index(pillars["month"]["zhi"])

    # 用 lunar_python 获取节气信息
    prev_jie, next_jie = _get_jie_info(lunar)

    # 距离出生日的天数 (以节气为界)
    if forward:
        # 顺排：到下一个换月节气
        target_jie_date = next_jie
        label = "顺排"
    else:
        # 逆排：到上一个换月节气
        target_jie_date = prev_jie
        label = "逆排"

    if target_jie_date:
        from datetime import datetime
        jie_dt = datetime.strptime(target_jie_date.getSolar().toYmd(), "%Y-%m-%d")
        birth_dt = datetime(normalized.solar_dt.year, normalized.solar_dt.month, normalized.solar_dt.day)
        days_between = abs((jie_dt - birth_dt).days)
    else:
        days_between = 3  # fallback

    # 起运年龄 = 距离节气的天数 / 3 (3天=1岁)
    start_age = max(1, round(days_between / 3))

    # 大运干支
    dayun = []
    if forward:
        for i in range(8):
            g_idx = (month_gan_idx + 1 + i) % 10
            z_idx = (month_zhi_idx + 1 + i) % 12
            dayun.append({"ganzhi": GAN_LIST[g_idx] + ZHI_LIST[z_idx], "age_start": start_age + i * 10, "age_end": start_age + (i + 1) * 10 - 1})
    else:
        for i in range(8):
            g_idx = (month_gan_idx - 1 - i) % 10
            z_idx = (month_zhi_idx - 1 - i) % 12
            dayun.append({"ganzhi": GAN_LIST[g_idx] + ZHI_LIST[z_idx], "age_start": start_age + i * 10, "age_end": start_age + (i + 1) * 10 - 1})

    # 流年 (当前流年)
    current_year = normalized.solar_dt.year
    year_gan_idx = current_year % 10
    year_zhi_idx = (current_year - 4) % 12
    current_year_ganzhi = GAN_LIST[year_gan_idx] + ZHI_LIST[year_zhi_idx]

    return {
        "solar": solar.toYmdHms(),
        "lunar": f"{lunar.getYearInChinese()}年{lunar.getMonthInChinese()}月{lunar.getDayInChinese()}",
        "day_master": day_gan,
        "day_master_wuxing": TIANGAN_WUXING[day_gan],
        "day_master_yinyang": TIANGAN_YINYANG[day_gan],
        "wuxing_stat": _wuxing_stat(lunar),
        "four_pillars": pillars,
        "shishen": shishen,
        "zhishi": zhishi,
        "canggan": canggan,
        "dayun": {
            "direction": label,
            "start_age": start_age,
            "pills": dayun,
        },
        "current_year": {
            "year": current_year,
            "ganzhi": current_year_ganzhi,
            "shishen": get_shi_shen(day_gan, GAN_LIST[year_gan_idx]),
        },
        "genders": {"birth_gender": gender, "is_yang_year": is_yang_year},
        "xunkong": {
            "year": lunar.getYearXunKong(),
            "month": lunar.getMonthXunKongExact(),
            "day": lunar.getDayXunKongExact(),
            "hour": lunar.getTimeXunKong(),
        },
        "warnings": getattr(normalized, 'warnings', []),
    }


def _gan_index(g):
    return "甲乙丙丁戊己庚辛壬癸".index(g)

def _zhi_index(z):
    return "子丑寅卯辰巳午未申酉戌亥".index(z)

GAN_LIST = "甲乙丙丁戊己庚辛壬癸"
ZHI_LIST = "子丑寅卯辰巳午未申酉戌亥"

def _get_jie_info(lunar):
    """Get previous and next 节气 that mark month changes in Ba Zi."""
    try:
        prev_jie = lunar.getPrevJie()
        next_jie = lunar.getNextJie()
        # In Ba Zi, month changes at 节 (not 气)
        # For 大运 calculation we need the 节 that starts the month
        # lunar_python's getPrevJie/getNextJie returns the nearest solar term
        # We need specifically the 节 that marks the month start
        # 立春, 惊蛰, 清明, 立夏, 芒种, 小暑, 立秋, 白露, 寒露, 立冬, 大雪, 小寒
        month_jies = ["立春", "惊蛰", "清明", "立夏", "芒种", "小暑", "立秋", "白露", "寒露", "立冬", "大雪", "小寒"]

        # Find the prev and next jie (节, not 气) for month change
        # lunar_python's getPrevJie/getNextJie handles this correctly
        return prev_jie, next_jie
    except:
        return None, None


def _wuxing_stat(lunar):
    """Count the frequency of each element across all 8 characters."""
    chars = [
        lunar.getYearGan(), lunar.getYearZhi(),
        lunar.getMonthGan(), lunar.getMonthZhi(),
        lunar.getDayGan(), lunar.getDayZhiExact(),
        lunar.getTimeGan(), lunar.getTimeZhi(),
    ]
    counts = {"木": 0, "火": 0, "土": 0, "金": 0, "水": 0, "其他": 0}
    # Map earthly branches to their hidden stem elements for counting
    branch_elements = {"子": "水", "丑": "土", "寅": "木", "卯": "木", "辰": "土", "巳": "火",
                       "午": "火", "未": "土", "申": "金", "酉": "金", "戌": "土", "亥": "水"}
    for ch in chars:
        if ch in TIANGAN_WUXING:
            counts[TIANGAN_WUXING[ch]] += 1
        elif ch in branch_elements:
            counts[branch_elements[ch]] += 1
    return counts


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._cors()
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        self._respond(200, {
            "name": "八字排盘 API",
            "version": "1.0",
            "usage": "POST /api/bazi with JSON body",
            "example": {"time_input": "2026-06-20 15:30:00", "calendar_type": "solar", "gender": "男"}
        })

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length else b'{}'
        try:
            payload = json.loads(body)
            if "gender" not in payload:
                payload["gender"] = "男"
            result = compute_bazi(payload)
            self._respond(200, result)
        except Exception as exc:
            self._respond(400, {"error": str(exc)})

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _respond(self, status, data):
        self.send_response(status)
        self._cors()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
