#!/usr/bin/env python3
"""
奇门遁甲批量排盘 — 逐时辰分析（择时推荐）
"""
from http.server import BaseHTTPRequestHandler
import json
import sys
import os
from datetime import datetime, timezone as dt_timezone

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_scripts_dir = os.path.join(_project_root, 'qimen-dunjia', 'scripts')
sys.path.insert(0, _scripts_dir)

from qimen_cli import build_output, DEFAULT_TIMEZONE


# 十二时辰
SHICHEN = [
    ("子时", 23, "23:00-00:59"),
    ("丑时", 1,  "01:00-02:59"),
    ("寅时", 3,  "03:00-04:59"),
    ("卯时", 5,  "05:00-06:59"),
    ("辰时", 7,  "07:00-08:59"),
    ("巳时", 9,  "09:00-10:59"),
    ("午时", 11, "11:00-12:59"),
    ("未时", 13, "13:00-14:59"),
    ("申时", 15, "15:00-16:59"),
    ("酉时", 17, "17:00-18:59"),
    ("戌时", 19, "19:00-20:59"),
    ("亥时", 21, "21:00-22:59"),
]

# 吉凶等级（基于八门）
DOOR_JIXIONG = {
    "休门": {"level": "吉", "color": "green", "desc": "休息、求财、婚嫁"},
    "生门": {"level": "大吉", "color": "green", "desc": "生意、求财、创业"},
    "伤门": {"level": "凶", "color": "red", "desc": "争斗、出行防损"},
    "杜门": {"level": "平", "color": "yellow", "desc": "隐匿、堵塞、保密"},
    "景门": {"level": "平", "color": "yellow", "desc": "文书、考试、信息"},
    "死门": {"level": "大凶", "color": "red", "desc": "追捕、诉讼、安葬"},
    "惊门": {"level": "凶", "color": "red", "desc": "惊恐、官司、口舌"},
    "开门": {"level": "大吉", "color": "green", "desc": "开创、求职、远行"},
}

# 九星吉凶
STAR_JIXIONG = {
    "天蓬": {"level": "凶", "desc": "盗贼、破财"},
    "天任": {"level": "吉", "desc": "稳重、厚积"},
    "天冲": {"level": "平", "desc": "冲锋、变动"},
    "天辅": {"level": "大吉", "desc": "文书、教化"},
    "天英": {"level": "凶", "desc": "血光、火灾"},
    "天芮": {"level": "凶", "desc": "疾病、问题"},
    "天柱": {"level": "凶", "desc": "毁坏、口舌"},
    "天心": {"level": "大吉", "desc": "医疗、谋划"},
    "天禽": {"level": "大吉", "desc": "中正、祥和"},
}

def overall_rating(chart):
    """综合评估时辰吉凶."""
    score = 0
    # 看值使门（主要）
    zhishi_door = chart.get("zhishi", {}).get("door", "")
    if zhishi_door in ["生门", "开门"]:
        score += 2
    elif zhishi_door in ["休门"]:
        score += 1
    elif zhishi_door in ["死门"]:
        score -= 2
    elif zhishi_door in ["伤门", "惊门"]:
        score -= 1

    # 看八门分布
    for p in chart.get("palaces", []):
        door = p.get("door", "")
        if door in ["生门", "开门"]:
            score += 1
        elif door in ["死门"]:
            score -= 1

    # 看值符
    zhifu_star = chart.get("zhifu", {}).get("star", "")
    star_info = STAR_JIXIONG.get(zhifu_star, {})
    if star_info.get("level") in ("大吉", "吉"):
        score += 1
    elif star_info.get("level") == "凶":
        score -= 1

    if score >= 3:
        return {"text": "大吉", "star": "⭐⭐⭐"}
    elif score >= 1:
        return {"text": "吉", "star": "⭐⭐"}
    elif score >= -1:
        return {"text": "平", "star": "⭐"}
    elif score >= -3:
        return {"text": "凶", "star": "🌙"}
    else:
        return {"text": "大凶", "star": "🌑"}


def analyze_shichen(date_str, hour, timezone_str):
    """Analyze qimen for a specific shichen hour on a given date."""
    dt_str = f"{date_str} {hour:02d}:30:00"
    payload = {
        "time_input": dt_str,
        "calendar_type": "solar",
        "location": {"timezone": timezone_str, "country": "中国"},
    }
    result = build_output(payload)
    chart = result["chart"]

    door_name = chart.get("zhishi", {}).get("door", "")
    door_info = DOOR_JIXIONG.get(door_name, {"level": "?", "desc": ""})
    star_name = chart.get("zhifu", {}).get("star", "")
    star_info = STAR_JIXIONG.get(star_name, {"level": "?", "desc": ""})
    rating = overall_rating(chart)

    return {
        "dun_type": chart.get("dun_type", ""),
        "ju_number": chart.get("ju_number", ""),
        "time_ganzhi": result.get("ganzhi", {}).get("time", ""),
        "zhishi": {"door": door_name, "info": door_info},
        "zhifu": {"star": star_name, "info": star_info},
        "rating": rating,
        "xunkong": result.get("ganzhi", {}).get("time_xunkong", ""),
    }


def batch_analyze(payload):
    date_str = str(payload.get("date", ""))
    timezone_str = str(payload.get("timezone", DEFAULT_TIMEZONE))

    if not date_str:
        today = datetime.now(dt_timezone.utc).strftime("%Y-%m-%d")
        date_str = today

    results = []
    for name, hour, period in SHICHEN:
        try:
            r = analyze_shichen(date_str, hour, timezone_str)
            r["name"] = name
            r["period"] = period
            r["hour"] = hour
            results.append(r)
        except Exception as e:
            results.append({
                "name": name,
                "period": period,
                "hour": hour,
                "error": str(e),
            })

    return {
        "date": date_str,
        "timezone": timezone_str,
        "results": results,
    }


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._cors()
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        self._respond(200, {
            "name": "奇门遁甲择时推荐 API",
            "version": "1.0",
            "usage": "POST /api/qimen/batch with JSON body {date: 'YYYY-MM-DD', timezone: 'Asia/Shanghai'}"
        })

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length else b'{}'
        try:
            payload = json.loads(body)
            result = batch_analyze(payload)
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
