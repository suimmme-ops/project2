"""학생용 학습지 페이지."""
import streamlit as st

from core.storage import get_store, now_iso, student_id
from worksheet import worksheet

# 학습지가 화면을 꽉 채우도록 Streamlit 기본 여백을 없앱니다.
st.markdown(
    """<style>
    .block-container {padding: 0 !important; max-width: 100% !important;}
    [data-testid="stMainBlockContainer"] {padding: 3.75rem 0 0 !important;}
    [data-testid="stVerticalBlock"] {gap: 0 !important;}
    iframe {display: block; border: 0;}
    footer {display: none;}
    </style>""",
    unsafe_allow_html=True,
)

store = get_store()


def handle(req: dict) -> dict:
    """학생 화면에서 온 요청을 처리하고, 결과를 같은 nonce와 함께 돌려줍니다."""
    stu = req.get("student") or {}
    sid = student_id(stu.get("number", ""), stu.get("name", ""))
    try:
        if req.get("action") == "login":
            return {"ok": True, "record": store.get(sid)}
        if req.get("action") == "submit":
            store.save(sid, {
                "number": int(stu.get("number") or 0),
                "name": stu.get("name", ""),
                "answers": req.get("answers") or {},
                "submitted": req.get("submitted") or {},
                "updated_at": now_iso(),
            })
            return {"ok": True}
        return {"ok": False, "error": "알 수 없는 요청"}
    except Exception as e:  # 저장 실패를 학생 화면에 알려 줍니다
        return {"ok": False, "error": str(e)[:200]}


# 이전 실행에서 처리한 요청의 응답을 다시 화면에 넘겨 줍니다.
req = worksheet(reply=st.session_state.get("reply"), mode=store.kind)
if req and req.get("nonce") != st.session_state.get("handled"):
    st.session_state["handled"] = req["nonce"]
    st.session_state["reply"] = {"nonce": req["nonce"], **handle(req)}
    st.rerun()
