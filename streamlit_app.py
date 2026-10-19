"""기후 탐험 학습지 — 데이터로 읽는 기후변화, 2050년을 예측하다

초등 6학년 사회·과학 융합 '온라인 학습지' 웹앱
- 학생용 학습지  : 챕터 1~4 + 마무리 (HTML/JS 화면을 Streamlit 컴포넌트로 탑재)
- 교사 대시보드  : 학생 결과물 수합 · 문항별 모아보기 · 2050 예측 글 갤러리 · 내려받기
"""
import streamlit as st

st.set_page_config(
    page_title="기후 탐험 학습지",
    page_icon="🌏",
    layout="wide",
    initial_sidebar_state="collapsed",
)

pages = [
    st.Page("app_pages/student.py", title="학습지", icon="📘", default=True),
    st.Page("app_pages/teacher.py", title="교사 대시보드", icon="🧑‍🏫", url_path="teacher"),
]
st.navigation(pages, position="top").run()
