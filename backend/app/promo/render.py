from __future__ import annotations

from dataclasses import dataclass
from html import escape
from json import dumps
from typing import Any

CARD_SIZE = 1080
FONT = '"Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif'

TYPE_LABELS = {
    "AWARD": "대회 수상",
    "BELT_UP": "띠 승급",
    "RECRUIT": "신규 모집",
    "EVENT": "행사",
}

LAYOUT_ACCENTS = {
    "award-podium": "#d4af37",
    "award-ribbon": "#f5d76e",
    "award-split": "#b91c1c",
    "award-stamp": "#eab308",
    "belt-stripe": "#dc2626",
    "belt-column": "#f59e0b",
    "belt-seal": "#f8fafc",
    "belt-stage": "#ef4444",
    "recruit-poster": "#ffffff",
    "recruit-info": "#9a3412",
    "recruit-slash": "#dc2626",
    "recruit-grid": "#991b1b",
    "event-fest": "#fbbf24",
    "event-invite": "#92400e",
    "event-bold": "#f8fafc",
    "event-ticket": "#f59e0b",
}

BELT_COLORS = ["#f8fafc", "#facc15", "#22c55e", "#2563eb", "#dc2626", "#111111"]


@dataclass
class Card:
    layout_id: str
    type: str
    title: str
    subtitle: str
    body: str
    background: str
    title_size: int
    subtitle_size: int
    body_size: int
    title_weight: int
    subtitle_weight: int
    body_weight: int
    dojang_name: str
    image_url: str | None


def _hex(value: Any, fallback: str) -> str:
    raw = str(value or "").strip()
    if len(raw) == 7 and raw.startswith("#"):
        try:
            int(raw[1:], 16)
            return raw.lower()
        except ValueError:
            return fallback
    return fallback


def _int(value: Any, fallback: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _text_color(hex_color: str) -> str:
    raw = hex_color.replace("#", "")
    if len(raw) != 6:
        return "#ffffff"
    r = int(raw[0:2], 16)
    g = int(raw[2:4], 16)
    b = int(raw[4:6], 16)
    return "#18181b" if (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 else "#ffffff"


def _rgba(hex_color: str, alpha: float) -> str:
    raw = hex_color.replace("#", "")
    r = int(raw[0:2], 16)
    g = int(raw[2:4], 16)
    b = int(raw[4:6], 16)
    return f"rgba({r}, {g}, {b}, {alpha})"


def _t(value: Any) -> str:
    return escape(str(value or ""), quote=True)


def _css_url(url: str) -> str:
    return f"url({dumps(url)})"


def parse_card(raw: dict[str, Any] | None, template_type: str) -> Card:
    data = raw if isinstance(raw, dict) else {}
    image = str(data.get("imageUrl") or "").strip() or None
    if image and not (image.startswith("http://") or image.startswith("https://")):
        image = None
    return Card(
        layout_id=str(data.get("layoutId") or "award-podium"),
        type=str(data.get("type") or template_type or "AWARD"),
        title=str(data.get("title") or "제목"),
        subtitle=str(data.get("subtitle") or ""),
        body=str(data.get("body") or ""),
        background=_hex(data.get("backgroundColor"), "#18181b"),
        title_size=_int(data.get("titleFontSize"), 88),
        subtitle_size=_int(data.get("subtitleFontSize"), 32),
        body_size=_int(data.get("bodyFontSize"), 28),
        title_weight=_int(data.get("titleFontWeight"), 800),
        subtitle_weight=_int(data.get("subtitleFontWeight"), 600),
        body_weight=_int(data.get("bodyFontWeight"), 400),
        dojang_name=str(data.get("dojangName") or ""),
        image_url=image,
    )


def _root(card: Card, inner: str) -> str:
    overlay = _rgba(card.background, 0.72)
    bg_image = ""
    if card.image_url:
        bg_image = (
            f"background-image:linear-gradient({overlay},{overlay}),{_css_url(card.image_url)};"
            "background-size:cover;background-position:center;"
        )
    return (
        f'<div style="position:relative;box-sizing:border-box;width:{CARD_SIZE}px;'
        f"height:{CARD_SIZE}px;overflow:hidden;background:{card.background};"
        f'color:{_text_color(card.background)};font-family:{FONT};{bg_image}">'
        f"{inner}</div>"
    )


def _type_label(card: Card, color: str, align: str = "left") -> str:
    label = TYPE_LABELS.get(card.type, card.type)
    return (
        f'<p style="margin:0;color:{color};font-size:22px;font-weight:700;'
        f'letter-spacing:0.28em;text-align:{align}">{_t(label)}</p>'
    )


def _title_block(card: Card, color: str, align: str = "left", subtitle: bool = True) -> str:
    sub = ""
    if subtitle and card.subtitle:
        sub = (
            f'<p style="margin:20px 0 0;color:{color};font-size:{card.subtitle_size}px;'
            f"font-weight:{card.subtitle_weight};line-height:1.4;opacity:0.92;"
            f'white-space:pre-wrap;word-break:keep-all;text-align:{align}">{_t(card.subtitle)}</p>'
        )
    return (
        f'<div style="text-align:{align}">'
        f'<h1 style="margin:0;color:{color};font-size:{card.title_size}px;'
        f"font-weight:{card.title_weight};line-height:1.15;letter-spacing:-0.03em;"
        f'white-space:pre-wrap;word-break:keep-all">{_t(card.title)}</h1>'
        f"{sub}</div>"
    )


def _body(card: Card, color: str, align: str = "left") -> str:
    if not card.body:
        return ""
    return (
        f'<p style="margin:0;color:{color};font-size:{card.body_size}px;'
        f"font-weight:{card.body_weight};line-height:1.6;text-align:{align};"
        f'white-space:pre-wrap;word-break:keep-all">{_t(card.body)}</p>'
    )


def _dojang(card: Card, color: str, align: str = "left") -> str:
    if not card.dojang_name:
        return ""
    return (
        f'<p style="margin:0;color:{color};font-size:24px;font-weight:700;'
        f'letter-spacing:0.04em;text-align:{align}">{_t(card.dojang_name)}</p>'
    )


def _award_podium(card: Card, accent: str) -> str:
    text = _text_color(card.background)
    return _root(card, f"""
      <div style="display:flex;height:100%;flex-direction:column;align-items:center;justify-content:space-between;padding:88px 96px">
        {_type_label(card, accent, "center")}
        <div style="display:grid;place-items:center;width:280px;height:280px;border:10px solid {accent};border-radius:50%;box-shadow:0 0 0 18px {card.background},0 0 0 22px {accent}">
          <span style="color:{accent};font-size:88px;font-weight:800">賞</span>
        </div>
        {_title_block(card, text, "center")}
        <div style="width:120px;height:4px;background:{accent}"></div>
        {_body(card, text, "center")}
        {_dojang(card, accent, "center")}
      </div>
    """)


def _award_ribbon(card: Card, accent: str) -> str:
    text = _text_color(card.background)
    return _root(card, f"""
      <div style="display:flex;align-items:center;justify-content:center;min-height:150px;padding:0 80px;background:{accent};color:#14120b">
        <p style="margin:0;font-size:{card.subtitle_size}px;font-weight:{card.subtitle_weight};text-align:center;white-space:pre-wrap;word-break:keep-all">{_t(card.subtitle)}</p>
      </div>
      <div style="display:flex;height:calc(100% - 370px);flex-direction:column;justify-content:center;padding:0 88px">
        {_type_label(card, accent)}
        <div style="height:28px"></div>
        <h1 style="margin:0;color:{text};font-size:{card.title_size}px;font-weight:{card.title_weight};line-height:1.15;letter-spacing:-0.03em;white-space:pre-wrap;word-break:keep-all">{_t(card.title)}</h1>
      </div>
      <div style="display:flex;height:220px;flex-direction:column;justify-content:center;gap:20px;padding:0 88px;background:#fff8e7;color:#14120b">
        {_body(card, "#14120b")}
        {_dojang(card, "#7f1d1d")}
      </div>
    """)


def _award_split(card: Card, accent: str) -> str:
    return _root(card, f"""
      <div style="display:flex;height:100%">
        <div style="display:flex;width:168px;align-items:center;justify-content:center;background:{accent}">
          <p style="margin:0;color:#fff8e7;font-size:42px;font-weight:800;letter-spacing:0.4em;writing-mode:vertical-rl">수상</p>
        </div>
        <div style="display:flex;flex:1;flex-direction:column;justify-content:space-between;padding:96px 80px;color:#1c1917">
          {_type_label(card, accent)}
          {_title_block(card, "#1c1917")}
          <div>
            <div style="width:72px;height:6px;margin-bottom:28px;background:{accent}"></div>
            {_body(card, "#44403c")}
          </div>
          {_dojang(card, accent)}
        </div>
      </div>
    """)


def _award_stamp(card: Card, accent: str) -> str:
    text = _text_color(card.background)
    corners = [
        "top:28px;left:28px;border-top-width:6px;border-left-width:6px",
        "top:28px;right:28px;border-top-width:6px;border-right-width:6px",
        "bottom:28px;left:28px;border-bottom-width:6px;border-left-width:6px",
        "bottom:28px;right:28px;border-bottom-width:6px;border-right-width:6px",
    ]
    marks = "".join(
        f'<span style="position:absolute;width:36px;height:36px;border-color:{accent};border-style:solid;border-width:0;{c}"></span>'
        for c in corners
    )
    return _root(card, f"""
      <div style="position:absolute;inset:48px;border:2px solid {accent}"></div>
      {marks}
      <div style="display:flex;height:100%;flex-direction:column;align-items:center;justify-content:center;gap:36px;padding:120px;text-align:center">
        {_type_label(card, accent, "center")}
        {_title_block(card, text, "center")}
        <div style="display:grid;place-items:center;width:160px;height:160px;border:4px solid {accent};border-radius:50%;transform:rotate(-12deg)">
          <span style="color:{accent};font-size:36px;font-weight:800">PUMSAE</span>
        </div>
        {_body(card, text, "center")}
        {_dojang(card, accent, "center")}
      </div>
    """)


def _belt_stripe(card: Card, accent: str) -> str:
    text = _text_color(card.background)
    stripes = "".join(f'<div style="flex:1;background:{c}"></div>' for c in BELT_COLORS)
    return _root(card, f"""
      <div style="display:flex;height:56px">{stripes}</div>
      <div style="display:flex;height:calc(100% - 128px);flex-direction:column;align-items:center;justify-content:center;gap:40px;padding:0 96px">
        {_type_label(card, accent, "center")}
        {_title_block(card, text, "center")}
        {_body(card, text, "center")}
        {_dojang(card, accent, "center")}
      </div>
      <div style="height:72px;background:#111111"><div style="height:14px;background:{accent}"></div></div>
    """)


def _belt_column(card: Card, accent: str) -> str:
    text = _text_color(card.background)
    stripes = "".join(f'<div style="flex:1;background:{c}"></div>' for c in BELT_COLORS)
    return _root(card, f"""
      <div style="display:flex;height:100%">
        <div style="display:flex;width:88px;flex-direction:column">{stripes}</div>
        <div style="display:flex;flex:1;flex-direction:column;justify-content:space-between;padding:96px 80px">
          {_type_label(card, accent)}
          {_title_block(card, text)}
          {_body(card, text)}
          {_dojang(card, accent)}
        </div>
      </div>
    """)


def _belt_seal(card: Card, accent: str) -> str:
    text = _text_color(card.background)
    return _root(card, f"""
      <div style="display:flex;height:100%;flex-direction:column;align-items:center;justify-content:center;gap:36px;padding:100px">
        <div style="display:grid;place-items:center;width:220px;height:220px;border:8px solid {accent};border-radius:50%">
          <span style="color:{accent};font-size:64px;font-weight:800">승급</span>
        </div>
        {_title_block(card, text, "center")}
        {_body(card, text, "center")}
        {_dojang(card, accent, "center")}
      </div>
    """)


def _belt_stage(card: Card, accent: str) -> str:
    text = _text_color(card.background)
    return _root(card, f"""
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 28%, rgba(255,255,255,0.16), transparent 42%)"></div>
      <div style="position:relative;display:flex;height:100%;flex-direction:column;justify-content:space-between;padding:100px 96px">
        {_type_label(card, accent)}
        <div>
          {_title_block(card, text)}
          <div style="width:140px;height:8px;margin-top:36px;background:{accent}"></div>
        </div>
        <div>
          {_body(card, text)}
          <div style="height:28px"></div>
          {_dojang(card, accent)}
        </div>
      </div>
    """)


def _recruit_poster(card: Card, accent: str) -> str:
    text = _text_color(card.background)
    return _root(card, f"""
      <p style="position:absolute;top:220px;left:40px;margin:0;color:{accent};font-size:280px;font-weight:800;letter-spacing:-0.06em;opacity:0.12;line-height:1">모집</p>
      <div style="position:relative;display:flex;height:100%;flex-direction:column;justify-content:space-between;padding:100px 88px">
        {_type_label(card, accent)}
        {_title_block(card, text)}
        <div>
          {_body(card, text)}
          <div style="height:28px"></div>
          {_dojang(card, accent)}
        </div>
      </div>
    """)


def _recruit_info(card: Card, accent: str) -> str:
    return _root(card, f"""
      <div style="display:flex;height:280px;flex-direction:column;justify-content:flex-end;padding:0 80px 48px;background:{accent};color:#fff7ed">
        {_type_label(card, "#fed7aa")}
        <h1 style="margin:16px 0 0;font-size:{card.title_size}px;font-weight:{card.title_weight};line-height:1.15;letter-spacing:-0.03em;white-space:pre-wrap;word-break:keep-all">{_t(card.title)}</h1>
      </div>
      <div style="padding:56px 80px 80px">
        <div style="padding:36px 40px;background:#fff;border-radius:28px;box-shadow:0 16px 40px rgba(154,52,18,0.08)">
          <p style="margin:0;color:{accent};font-size:{card.subtitle_size}px;font-weight:{card.subtitle_weight};white-space:pre-wrap;word-break:keep-all">{_t(card.subtitle)}</p>
        </div>
        <div style="height:40px"></div>
        {_body(card, "#7c2d12")}
        <div style="height:36px"></div>
        {_dojang(card, accent)}
      </div>
    """)


def _recruit_slash(card: Card, accent: str) -> str:
    text = _text_color(card.background)
    return _root(card, f"""
      <div style="position:absolute;top:-120px;right:-180px;width:620px;height:1320px;background:{accent};transform:rotate(22deg)"></div>
      <div style="position:relative;display:flex;height:100%;flex-direction:column;justify-content:space-between;padding:100px 88px">
        {_type_label(card, accent)}
        {_title_block(card, text)}
        <div>
          {_body(card, text)}
          <div style="height:28px"></div>
          {_dojang(card, accent)}
        </div>
      </div>
    """)


def _recruit_grid(card: Card, accent: str) -> str:
    return _root(card, f"""
      <div style="display:flex;height:100%;flex-direction:column;justify-content:space-between;padding:96px 88px;color:#1c1917">
        {_type_label(card, accent)}
        {_title_block(card, "#1c1917")}
        <div style="height:2px;background:{accent}"></div>
        <p style="margin:0;color:{accent};font-size:{card.subtitle_size}px;font-weight:{card.subtitle_weight};white-space:pre-wrap;word-break:keep-all">{_t(card.subtitle)}</p>
        <div style="height:2px;background:#fecaca"></div>
        {_body(card, "#44403c")}
        {_dojang(card, accent)}
      </div>
    """)


def _event_fest(card: Card, accent: str) -> str:
    text = _text_color(card.background)
    dots = ""
    for index, top in enumerate([40, 200, 860, 980]):
        side = f"left:48px" if index % 2 == 0 else "right:56px"
        dots += f'<span style="position:absolute;top:{top}px;{side};width:18px;height:18px;background:{accent};border-radius:50%"></span>'
    return _root(card, f"""
      {dots}
      <div style="display:flex;height:100%;flex-direction:column;justify-content:space-between;padding:100px 88px">
        {_type_label(card, accent)}
        {_title_block(card, text, subtitle=False)}
        <div style="padding:28px 36px;border:3px solid {accent};color:{accent};font-size:{card.subtitle_size}px;font-weight:{card.subtitle_weight};text-align:center;white-space:pre-wrap;word-break:keep-all">{_t(card.subtitle)}</div>
        {_body(card, text)}
        {_dojang(card, accent)}
      </div>
    """)


def _event_invite(card: Card, accent: str) -> str:
    return _root(card, f"""
      <div style="position:absolute;inset:40px;border:3px solid {accent}"></div>
      <div style="position:absolute;inset:52px;border:1px solid {accent}"></div>
      <div style="display:flex;height:100%;flex-direction:column;align-items:center;justify-content:center;gap:32px;padding:120px;color:#1c1917;text-align:center">
        {_type_label(card, accent, "center")}
        {_title_block(card, "#1c1917", "center")}
        <div style="width:80px;height:2px;background:{accent}"></div>
        {_body(card, "#57534e", "center")}
        {_dojang(card, accent, "center")}
      </div>
    """)


def _event_bold(card: Card, accent: str) -> str:
    text = _text_color(card.background)
    return _root(card, f"""
      <div style="display:flex;height:100%;flex-direction:column;justify-content:space-between;padding:88px 80px">
        {_type_label(card, accent)}
        <h1 style="margin:0;color:{text};font-size:{card.title_size}px;font-weight:{card.title_weight};line-height:1.05;letter-spacing:-0.04em;white-space:pre-wrap;word-break:keep-all">{_t(card.title)}</h1>
        <div>
          <p style="margin:0;color:{accent};font-size:{card.subtitle_size}px;font-weight:{card.subtitle_weight};white-space:pre-wrap;word-break:keep-all">{_t(card.subtitle)}</p>
          <div style="height:24px"></div>
          {_body(card, text)}
          <div style="height:28px"></div>
          {_dojang(card, accent)}
        </div>
      </div>
    """)


def _event_ticket(card: Card, accent: str) -> str:
    text = _text_color(card.background)
    return _root(card, f"""
      <div style="position:absolute;top:690px;left:-28px;width:56px;height:56px;background:#f4f4f5;border-radius:50%"></div>
      <div style="position:absolute;top:690px;right:-28px;width:56px;height:56px;background:#f4f4f5;border-radius:50%"></div>
      <div style="display:flex;height:720px;flex-direction:column;justify-content:space-between;padding:88px 88px 48px">
        {_type_label(card, accent)}
        {_title_block(card, text)}
      </div>
      <div style="margin:0 56px;border-top:4px dashed {accent}"></div>
      <div style="padding:40px 88px 0">
        {_body(card, text)}
        <div style="height:24px"></div>
        {_dojang(card, accent)}
      </div>
    """)


_LAYOUTS = {
    "award-podium": _award_podium,
    "award-ribbon": _award_ribbon,
    "award-split": _award_split,
    "award-stamp": _award_stamp,
    "belt-stripe": _belt_stripe,
    "belt-column": _belt_column,
    "belt-seal": _belt_seal,
    "belt-stage": _belt_stage,
    "recruit-poster": _recruit_poster,
    "recruit-info": _recruit_info,
    "recruit-slash": _recruit_slash,
    "recruit-grid": _recruit_grid,
    "event-fest": _event_fest,
    "event-invite": _event_invite,
    "event-bold": _event_bold,
    "event-ticket": _event_ticket,
}


def render_promo_html(raw: dict[str, Any] | None, template_type: str) -> str:
    card = parse_card(raw, template_type)
    accent = LAYOUT_ACCENTS.get(card.layout_id, "#d4af37")
    inner = _LAYOUTS.get(card.layout_id, _award_podium)(card, accent)
    return f"""<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    html, body {{ margin: 0; background: #ffffff; }}
    * {{ box-sizing: border-box; }}
  </style>
</head>
<body>
  <div id="card">{inner}</div>
</body>
</html>"""
