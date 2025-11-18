import time
from typing import Dict, Optional

class SimpleMemoryCache:
    def __init__(self):
        self._cache: Dict[str, dict] = {}
        self._timestamps: Dict[str, float] = {}

    def get(self, key: str) -> Optional[dict]:
        if key in self._cache and (time.time() - self._timestamps[key]) < 900:
            return self._cache[key]
        self._cache.pop(key, None)
        self._timestamps.pop(key, None)
        return None

    def set(self, key: str, data: dict):
        self._cache[key] = data
        self._timestamps[key] = time.time()

ocr_memory_cache = SimpleMemoryCache()