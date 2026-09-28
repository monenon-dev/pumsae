"""uvicorn 로그 정리.

- 주소에 붙은 token=... 값을 *** 로 가린다(예전 앱 빌드는 아직 쿼리로 보낸다).
- uvicorn은 INFO까지 모두 stderr로 내보내서 Railway가 정상 기록도 빨간 에러로
  표시한다. INFO 이하는 stdout, WARNING 이상은 stderr로 나눈다.
"""

from __future__ import annotations

import logging
import re
import sys

_TOKEN_RE = re.compile(r"(token=)[^&\s\"']+")
_UVICORN_LOGGERS = ("uvicorn", "uvicorn.error", "uvicorn.access")


def redact_tokens(text: str) -> str:
    return _TOKEN_RE.sub(r"\1***", text)


class RedactTokenFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        # uvicorn의 AccessFormatter는 record.args 튜플 모양에 의존하므로
        # 메시지를 합치지 않고 문자열 인자와 msg만 각각 가린다.
        if isinstance(record.msg, str):
            record.msg = redact_tokens(record.msg)
        if isinstance(record.args, tuple):
            record.args = tuple(
                redact_tokens(arg) if isinstance(arg, str) else arg for arg in record.args
            )
        return True


class _LevelSplitStreamHandler(logging.StreamHandler):
    def emit(self, record: logging.LogRecord) -> None:
        self.stream = sys.stderr if record.levelno >= logging.WARNING else sys.stdout
        super().emit(record)


_REDACT = RedactTokenFilter()


def configure_logging() -> None:
    redact = _REDACT
    for name in _UVICORN_LOGGERS:
        logger = logging.getLogger(name)
        for index, handler in enumerate(list(logger.handlers)):
            if type(handler) is logging.StreamHandler:
                replacement = _LevelSplitStreamHandler()
                replacement.setLevel(handler.level)
                replacement.setFormatter(handler.formatter)
                for existing in handler.filters:
                    replacement.addFilter(existing)
                logger.handlers[index] = replacement
                handler = replacement
            if redact not in handler.filters:
                handler.addFilter(redact)
