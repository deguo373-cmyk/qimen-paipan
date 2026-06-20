#!/usr/bin/env python3
"""
Vercel Serverless Function — 奇门遁甲在线排盘 API

Deploys as a Python serverless function on Vercel.
Access via POST /api/qimen
"""

from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Make qimen_cli.py importable — works on Vercel & local
_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_scripts_dir = os.path.join(_project_root, 'qimen-dunjia', 'scripts')
sys.path.insert(0, _scripts_dir)

from qimen_cli import build_output  # noqa: E402


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self._cors_headers()
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        self._respond(200, {
            "name": "奇门遁甲在线排盘 API",
            "version": "1.0",
            "usage": "POST /api/qimen with JSON body",
            "example": {
                "time_input": "2026-06-20 15:30:00",
                "calendar_type": "solar"
            }
        })

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length else b'{}'

        try:
            payload = json.loads(body)
            result = build_output(payload)
            self._respond(200, result)
        except Exception as exc:
            self._respond(400, {
                "error": str(exc),
                "note": "请确保 time_input 和 calendar_type 字段正确。"
            })

    # ── helpers ──────────────────────────────────────────

    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _respond(self, status: int, data):
        self.send_response(status)
        self._cors_headers()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
