#!/usr/bin/env python3
"""Local dev server that mimics GitHub Pages' extensionless URL behavior.

GitHub Pages serves /first-years from first-years.html; plain
`python3 -m http.server` does not. Run this instead:

    python3 serve.py [port]
"""
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
ROOT = os.path.dirname(os.path.abspath(__file__))


class PagesHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def send_head(self):
        path = self.path.split("?", 1)[0].split("#", 1)[0]
        if "." not in os.path.basename(path) and path != "/":
            candidate = os.path.join(ROOT, path.lstrip("/") + ".html")
            if os.path.isfile(candidate):
                self.path = path + ".html"
        return super().send_head()


if __name__ == "__main__":
    with http.server.ThreadingHTTPServer(("", PORT), PagesHandler) as httpd:
        print(f"Serving {ROOT} at http://localhost:{PORT} (GitHub Pages-style URLs)")
        httpd.serve_forever()
