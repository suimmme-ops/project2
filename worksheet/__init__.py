"""학생용 학습지 화면(HTML/JS)을 Streamlit 양방향 컴포넌트로 불러옵니다."""
from pathlib import Path

import streamlit.components.v1 as components

FRONTEND = Path(__file__).parent / "frontend"
_component = components.declare_component("climate_worksheet", path=str(FRONTEND))


def worksheet(reply=None, mode="live", key="worksheet"):
    """학습지를 화면에 그리고, 학생 화면에서 보낸 요청(로그인·제출)을 돌려줍니다."""
    return _component(reply=reply, mode=mode, key=key, default=None)
