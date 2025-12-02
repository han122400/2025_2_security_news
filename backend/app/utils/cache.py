import json
from typing import Optional
from datetime import datetime, timedelta
from collections import OrderedDict

# 메모리 캐시
_memory_cache = OrderedDict()
_cache_timestamps = {}
MAX_CACHE_SIZE = 200  # 최대 캐시 항목 수 증가 (100 -> 200)


async def get_cached_data(key: str) -> Optional[dict]:
    """
    메모리 캐시에서 데이터를 가져옵니다.
    
    Args:
        key: 캐시 키
    
    Returns:
        캐시된 데이터 또는 None
    """
    if key in _memory_cache:
        # 만료 시간 확인
        if key in _cache_timestamps:
            if datetime.now() < _cache_timestamps[key]:
                # 캐시가 유효함
                _memory_cache.move_to_end(key)  # LRU: 최근 사용으로 이동
                return _memory_cache[key]
            else:
                # 만료됨
                del _memory_cache[key]
                del _cache_timestamps[key]
    
    return None


async def set_cached_data(key: str, data: dict, expire_seconds: int = 600):
    """
    메모리 캐시에 데이터를 저장합니다.
    
    Args:
        key: 캐시 키
        data: 저장할 데이터
        expire_seconds: 만료 시간 (초), 기본값 10분
    """
    # 캐시 크기 제한 (LRU)
    if len(_memory_cache) >= MAX_CACHE_SIZE:
        # 가장 오래된 항목 제거
        oldest_key = next(iter(_memory_cache))
        del _memory_cache[oldest_key]
        if oldest_key in _cache_timestamps:
            del _cache_timestamps[oldest_key]
    
    _memory_cache[key] = data
    _cache_timestamps[key] = datetime.now() + timedelta(seconds=expire_seconds)
    _memory_cache.move_to_end(key)  # 최근 항목으로 이동


async def close_redis():
    """호환성을 위한 빈 함수"""
    pass
