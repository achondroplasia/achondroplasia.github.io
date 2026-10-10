"""Trace the CLARITY growth curves from the paper's published figures.

Hoover-Fong J, et al. Growth in achondroplasia ... from CLARITY. Orphanet J
Rare Dis 2021;16:522 (CC BY 4.0). The paper's supplementary tables give means
and SDs for Z-scores, but percentile curves drawn from them do not match the
paper's own charts (for example, boys' median length at 12 months is about
66.5 cm on Fig. 2 but 61.9 cm from the table), so the site draws the curves
the authors published instead. This script reads the red percentile lines off
the full-resolution figures and writes src/data/clarity-curves.json.

One-off, not part of the build. Needs Pillow and NumPy:
    python3 -m venv /tmp/venv && /tmp/venv/bin/pip install pillow numpy
    /tmp/venv/bin/python scripts/digitise-clarity.py <folder with FigN.png>
Figures: https://static-content.springer.com/image/art%3A10.1186%2Fs13023-021-02141-4/MediaObjects/13023_2021_2141_<Fig2|Fig3|Fig6a|Fig6b|Fig7a|Fig7b|Fig8>_HTML.png
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

PERCENTILES = [95, 75, 50, 25, 5]  # top to bottom in every panel


def panels(img):
    """Grid blocks in the image, as (top, bottom, left, right) pixel edges."""
    g = img.mean(axis=2)
    red = (img[..., 0] > 150) & (img[..., 1] < 110) & (img[..., 2] < 110)
    dark = (g < 110) & ~red
    rows = np.where(dark.mean(axis=1) > 0.6)[0]
    blocks, start = [], rows[0]
    for a, b in zip(rows, rows[1:]):
        if b - a > 180:  # gap between stacked panels (grid lines are closer)
            blocks.append((start, a))
            start = b
    blocks.append((start, rows[-1]))
    # Calibrate on the axis lines, which run exactly between the first and last
    # tick: the x axis is the panel's bottom line, the y axis its leftmost
    # full-height line. (Some panels draw the axes offset from the grid.)
    longest = lambda idx: max(np.split(idx, np.where(np.diff(idx) > 4)[0] + 1), key=len)
    out = []
    for top, bottom in blocks:
        x_axis = longest(np.where(dark[bottom])[0])
        y_col = np.where(dark[top : bottom + 1].mean(axis=0) > 0.8)[0].min()
        y_axis = top - 20 + longest(np.where(dark[top - 20 : bottom + 21, y_col])[0])
        out.append((y_axis[0], y_axis[-1], x_axis[0], x_axis[-1]))
    return out, red


def trace(red, box, xr, yr):
    """{percentile: [(x, y), ...]} for columns where all five lines are distinct."""
    top, bottom, left, right = box
    curves = {p: [] for p in PERCENTILES}
    for c in range(left + 3, right - 2):
        ys = np.where(red[top : bottom + 1, c])[0]
        if not len(ys):
            continue
        runs = np.split(ys, np.where(np.diff(ys) > 2)[0] + 1)
        if len(runs) != 5:
            continue
        x = xr[0] + (c - left) / (right - left) * (xr[1] - xr[0])
        for p, run in zip(PERCENTILES, runs):
            y = yr[1] - (top + run.mean() - top) / (bottom - top) * (yr[1] - yr[0])
            curves[p].append((x, y))
    return curves


def sample(curves, xs):
    """Interpolate each percentile at xs (skipping xs outside the traced range)."""
    out = []
    for x in xs:
        row = {"x": round(x, 3)}
        for p in PERCENTILES:
            px, py = zip(*curves[p])
            slack = 0.005 * (px[-1] - px[0])  # the first/last pixel column sits just inside the axis
            if not px[0] - slack <= x <= px[-1] + slack:
                break
            row[f"p{p}"] = round(float(np.interp(x, px, py)), 2)
        else:
            out.append(row)
    return out


def merge(*parts):
    """Join traced panels; later panels take over where they start."""
    merged = {p: [] for p in PERCENTILES}
    for i, part in enumerate(parts):
        nxt = parts[i + 1][PERCENTILES[0]][0][0] if i + 1 < len(parts) else float("inf")
        for p in PERCENTILES:
            merged[p] += [pt for pt in part[p] if pt[0] < nxt]
    return merged


def figure(folder, name, axes):
    img = np.asarray(Image.open(Path(folder) / f"{name}.png").convert("RGB")).astype(int)
    boxes, red = panels(img)
    assert len(boxes) >= len(axes), f"{name}: found {len(boxes)} panels"
    return [trace(red, box, xr, yr) for box, (xr, yr) in zip(boxes, axes)]


def main(folder):
    months = lambda a, b: [m / 12 for m in range(a, b + 1)]
    quarters = lambda a, b: [q / 4 for q in range(a * 4, b * 4 + 1)]
    data = {}
    for sex, fig in (("boys", "Fig2"), ("girls", "Fig3")):
        # Top panel: length 0-36 months (45-85 cm); bottom: height 2-18 years (50-150 cm)
        a, b = figure(folder, fig, [((0, 3), (45, 85)), ((2, 18), (50, 150))])
        data.setdefault("height", {})[sex] = sample(a, months(0, 35)) + sample(b, quarters(3, 18))
    for sex, top in (("boys", 0), ("girls", 1)):
        # Fig. 8: boys on top, girls below; 0-60 months, 30-60 cm
        panel = figure(folder, "Fig8", [((0, 5), (30, 60))] * 2)[top]
        data.setdefault("head", {})[sex] = sample(panel, months(0, 60))
    # Panels A 50-80 cm (0-16 kg), B 80-110 cm (10-45 kg), C 110-x_end cm (10-100 kg).
    # Stop where the authors switch a line to a dashed blue extension (boys'
    # 75th after 135 cm, girls' 95th after 126 cm): the data run out there.
    for sex, first, second, x_end, last in (("boys", "Fig6a", "Fig6b", 140, 135), ("girls", "Fig7a", "Fig7b", 130, 126)):
        a, b = figure(folder, first, [((50, 80), (0, 16)), ((80, 110), (10, 45))])
        (c,) = figure(folder, second, [((110, x_end), (10, 100))])
        data.setdefault("weightForHeight", {})[sex] = sample(merge(a, b, c), range(50, last + 1))
    out = Path(__file__).resolve().parent.parent / "src/data/clarity-curves.json"
    out.write_text(json.dumps(data, indent=1) + "\n")
    for k, v in data.items():
        for s, rows in v.items():
            print(k, s, len(rows), rows[0], rows[-1])


if __name__ == "__main__":
    main(sys.argv[1])
