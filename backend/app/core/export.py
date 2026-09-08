from __future__ import annotations

import asyncio
import logging

from fastapi import HTTPException, status
from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright

logger = logging.getLogger(__name__)

_LAUNCH_ARGS = [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--font-render-hinting=medium",
]


def _screenshot_sync(html: str) -> bytes:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            args=_LAUNCH_ARGS,
        )
        try:
            page = browser.new_page(
                viewport={"width": 1080, "height": 1080},
                device_scale_factor=2,
            )
            page.set_content(html, wait_until="load", timeout=20_000)
            page.evaluate("document.fonts.ready")
            return page.locator("#card").screenshot(type="png")
        finally:
            browser.close()


async def screenshot_promo_png(html: str) -> bytes:
    # Sync Playwright in a worker thread so Windows uvicorn
    # (SelectorEventLoop) can still spawn Chromium.
    try:
        png = await asyncio.to_thread(_screenshot_sync, html)
    except PlaywrightTimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="고화질 이미지를 만드는 데 시간이 너무 오래 걸렸습니다.",
        ) from exc
    except PlaywrightError as exc:
        logger.exception("Playwright failed to export PNG")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="고화질 변환 엔진이 준비되지 않았습니다. Chromium 설치를 확인해 주세요.",
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected PNG export failure")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="고화질 PNG를 만들지 못했습니다.",
        ) from exc

    if not png:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="고화질 PNG를 만들지 못했습니다.",
        )
    return png
