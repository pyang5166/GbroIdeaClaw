"""狗哥自定义路由（非上游文件）：GbroIdeaClaw「我的关注」页的本地配置读写。

雷达话题真源是 ~/.config/gbro-viral-radar/topics.txt（每日爆款雷达脚本读它）。
recipe 驱动发现上游尚未实现（Phase 2+），故话题管理走这个本地文件通道。
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

TOPICS_FILE = Path.home() / ".config/gbro-viral-radar/topics.txt"
TOPICS_HEADER = "# 每日爆款雷达扫描话题（一行一个，# 开头为注释，改这里即可增删赛道）\n"


def register(app: Any) -> None:
    @app.get("/api/custom/radar-topics")
    def radar_topics_get() -> dict[str, Any]:
        topics: list[str] = []
        if TOPICS_FILE.is_file():
            for line in TOPICS_FILE.read_text().splitlines():
                s = line.strip()
                if s and not s.startswith("#"):
                    topics.append(s)
        return {"topics": topics, "file": str(TOPICS_FILE)}

    @app.post("/api/custom/radar-topics")
    def radar_topics_set(payload: dict[str, Any]) -> dict[str, Any]:
        raw = payload.get("topics")
        if not isinstance(raw, list):
            from fastapi import HTTPException

            raise HTTPException(status_code=422, detail="topics must be a list of strings")
        topics = []
        for t in raw:
            s = str(t).strip().replace("\n", " ")
            if s and not s.startswith("#") and s not in topics:
                topics.append(s)
        TOPICS_FILE.parent.mkdir(parents=True, exist_ok=True)
        TOPICS_FILE.write_text(TOPICS_HEADER + "\n".join(topics) + "\n")
        return {"ok": True, "topics": topics}
