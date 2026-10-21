"""교사 대시보드 — 학생 결과물 수합과 분석."""
import html
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path

import altair as alt
import pandas as pd
import streamlit as st

from core.demo import demo_records
from core.storage import get_store

ROOT = Path(__file__).resolve().parents[1]
QDATA = json.loads((ROOT / "worksheet" / "frontend" / "questions.json").read_text(encoding="utf-8"))
CHAPTERS = QDATA["chapters"]
QUESTIONS = QDATA["questions"]
QMAP = {q["id"]: q for q in QUESTIONS}
KST = timezone(timedelta(hours=9))

st.markdown(
    """<style>
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
    @import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap');
    html, body, .stApp, .stMarkdown, p, label, input, textarea, button, summary {font-family: "Pretendard Variable", Pretendard, sans-serif;}
    [data-testid="stIconMaterial"], .material-symbols-rounded {font-family: "Material Symbols Rounded" !important;}
    .block-container {max-width: 1200px; padding-top: 5rem;}
    h1, h2, h3 {letter-spacing: -0.02em;}
    .hero {background:#5ec8f2;border:2.5px solid #15151a;border-radius:24px;box-shadow:7px 7px 0 #15151a;padding:26px 30px;margin-bottom:22px;}
    .hero h1 {font-family:"Black Han Sans",sans-serif;font-weight:400;font-size:42px;margin:0;padding:0;}
    .hero p {margin:6px 0 0;font-size:16px;}
    .kpi {background:#fff;border:2.5px solid #15151a;border-radius:18px;box-shadow:4px 4px 0 #15151a;padding:14px 18px;}
    .kpi .k {font-weight:800;font-size:14px;color:#4a4a55;}
    .kpi .v {font-family:"Black Han Sans",sans-serif;font-size:38px;line-height:1.2;}
    .ans {background:#fff;border:2px solid #15151a;border-radius:16px;box-shadow:3px 3px 0 #15151a;padding:14px 16px;margin-bottom:12px;}
    .ans .who {font-weight:900;font-size:15px;margin-bottom:6px;display:flex;justify-content:space-between;gap:8px;}
    .ans .who span {font-weight:700;color:#7c7c88;font-size:12.5px;}
    .ans .txt {white-space:pre-wrap;font-size:16px;line-height:1.7;}
    .ans.empty {opacity:.5;box-shadow:none;border-style:dashed;}
    .essay {border-radius:18px;border:2.5px solid #15151a;box-shadow:5px 5px 0 #15151a;padding:18px 20px;margin-bottom:16px;background:#fff;}
    .essay h4 {margin:0 0 10px;font-size:19px;}
    .essay .col {border:2px solid #15151a;border-radius:14px;padding:12px 14px;white-space:pre-wrap;line-height:1.75;font-size:15.5px;height:100%;}
    .stTabs [data-baseweb="tab-list"] {gap:6px;flex-wrap:wrap;}
    .stTabs [data-baseweb="tab"] {border:2px solid #15151a;border-radius:999px;padding:6px 14px;background:#fff;height:auto;}
    .stTabs [aria-selected="true"] {background:#ffd23f;}
    .stButton button, .stDownloadButton button {border:2.5px solid #15151a;box-shadow:3px 3px 0 #15151a;border-radius:12px;font-weight:800;}
    </style>""",
    unsafe_allow_html=True,
)

st.markdown('<div class="hero"><h1>🧑‍🏫 교사 대시보드</h1><p>학생들이 제출한 기후 탐험 학습지를 모아 보고, 수업 중 함께 나눌 답을 골라 보세요.</p></div>', unsafe_allow_html=True)

# ---------------- 로그인 ----------------
try:
    PASSWORD = st.secrets.get("TEACHER_PASSWORD", "teacher1234")
except Exception:
    PASSWORD = "teacher1234"

if not st.session_state.get("teacher_ok"):
    with st.form("tlogin"):
        pw = st.text_input("교사용 비밀번호", type="password")
        if st.form_submit_button("들어가기", type="primary"):
            if pw == PASSWORD:
                st.session_state["teacher_ok"] = True
                st.rerun()
            st.error("비밀번호가 맞지 않아요.")
    if PASSWORD == "teacher1234":
        st.info("처음 비밀번호는 `teacher1234`예요. Streamlit Secrets에 `TEACHER_PASSWORD`를 꼭 바꿔 넣어 주세요. (README 참고)")
    st.stop()

store = get_store()
if st.session_state.get("_store_error"):
    st.error(st.session_state["_store_error"])
if store.kind == "local":
    st.warning("지금은 **이 컴퓨터의 파일**에 저장하고 있어요. Streamlit Cloud에서는 앱이 다시 시작되면 기록이 사라지니, 수업 전에 Firebase를 연결해 주세요. (docs/FIREBASE_GUIDE.md)")

c1, c2 = st.columns([5, 1])
with c2:
    if st.button("🔄 새로고침", width="stretch"):
        st.rerun()

# ---------------- 발표·시연용 예시 데이터 ----------------
with st.expander("🎬 발표·시연용 예시 학생 10명 (가상 데이터)"):
    st.caption("가상의 학생 10명(1~10번)이 모든 문항에 답한 기록을 넣어요. 예시 기록에는 표시가 붙어 있어서, '예시 데이터 지우기'는 실제 학생 기록을 건드리지 않아요.")
    d1, d2 = st.columns(2)
    if d1.button("➕ 예시 데이터 넣기", width="stretch", type="primary"):
        for sid, rec in demo_records().items():
            store.save(sid, rec)
        st.success("예시 학생 10명을 넣었어요.")
        st.rerun()
    if d2.button("🧹 예시 데이터 지우기", width="stretch"):
        for sid, rec in store.all().items():
            if rec.get("demo"):
                store.delete(sid)
        st.success("예시 데이터를 지웠어요.")
        st.rerun()

records = store.all()
if not records:
    st.info("아직 제출한 학생이 없어요. 학생들이 학습지에서 '📮 선생님께 제출하기'를 누르면 여기에 나타나요.")
    st.stop()


def fmt(v) -> str:
    if v is None:
        return ""
    if isinstance(v, list):
        return " · ".join(str(x) for x in v if str(x or "").strip())
    if isinstance(v, dict):
        return ", ".join(f"{k}→{x}" for k, x in v.items() if x)
    return str(v).strip()


def when(iso: str) -> str:
    try:
        return datetime.fromisoformat(str(iso).replace("Z", "+00:00")).astimezone(KST).strftime("%m/%d %H:%M")
    except ValueError:
        return ""


students = sorted(records.items(), key=lambda kv: (kv[1].get("number", 0), kv[1].get("name", "")))
names = {sid: html.escape(f"{r.get('number', '')}번 {r.get('name', '')}") for sid, r in students}


def progress(r, ch):
    qs = [q for q in QUESTIONS if q["ch"] == ch]
    return sum(1 for q in qs if fmt(r.get("answers", {}).get(q["id"]))) / len(qs)


# ---------------- KPI ----------------
k = st.columns(4)
done_all = sum(1 for _, r in students if all(c["id"] in (r.get("submitted") or {}) for c in CHAPTERS))
essays = sum(1 for _, r in students if fmt(r.get("answers", {}).get("c4_low")) and fmt(r.get("answers", {}).get("c4_high")))
avg = sum(progress(r, c["id"]) for _, r in students for c in CHAPTERS) / (len(students) * len(CHAPTERS))
for col, (lab, val) in zip(k, [("참여 학생", f"{len(students)}명"), ("모든 챕터 제출", f"{done_all}명"), ("2050 예측 글 완성", f"{essays}명"), ("평균 작성률", f"{avg * 100:.0f}%")]):
    col.markdown(f'<div class="kpi"><div class="k">{lab}</div><div class="v">{val}</div></div>', unsafe_allow_html=True)
st.write("")

tabs = st.tabs(["📊 진행 현황", "🗂️ 문항별 모아보기", "✍️ 2050 예측 글", "🧑‍🎓 학생별 보기", "📈 응답 분석", "⬇️ 내려받기 · 관리"])

# ---------------- 진행 현황 ----------------
with tabs[0]:
    rows = []
    for sid, r in students:
        row = {"번호": r.get("number"), "이름": r.get("name")}
        for c in CHAPTERS:
            row[f"{c['no']}. {c['title']}"] = round(progress(r, c["id"]) * 100)
        row["제출한 챕터"] = " ".join(f"{c['no']}" for c in CHAPTERS if c["id"] in (r.get("submitted") or {})) or "-"
        row["마지막 저장"] = when(r.get("updated_at", ""))
        rows.append(row)
    df = pd.DataFrame(rows)
    st.dataframe(
        df, hide_index=True, width="stretch",
        column_config={f"{c['no']}. {c['title']}": st.column_config.ProgressColumn(f"{c['no']}. {c['title']}", min_value=0, max_value=100, format="%d%%") for c in CHAPTERS},
    )
    st.caption("막대는 문항 작성률이에요. '제출한 챕터'는 학생이 '선생님께 제출하기'를 누른 챕터예요. 챕터를 옮길 때도 자동으로 임시 저장돼요.")

# ---------------- 문항별 ----------------
with tabs[1]:
    a, b = st.columns([1, 2])
    ch = a.selectbox("챕터", CHAPTERS, format_func=lambda c: f"{c['no']}. {c['title']}")
    qs = [q for q in QUESTIONS if q["ch"] == ch["id"]]
    q = b.selectbox("문항", qs, format_func=lambda q: q["label"])
    hide_empty = st.toggle("빈 답 숨기기", value=True)
    cols = st.columns(3)
    i = 0
    for sid, r in students:
        v = fmt(r.get("answers", {}).get(q["id"]))
        if hide_empty and not v:
            continue
        with cols[i % 3]:
            st.markdown(f'<div class="ans {"" if v else "empty"}"><div class="who">{names[sid]}<span>{when(r.get("updated_at", ""))}</span></div><div class="txt">{html.escape(v) or "(아직 쓰지 않음)"}</div></div>', unsafe_allow_html=True)
        i += 1
    if i == 0:
        st.info("이 문항에 답한 학생이 아직 없어요.")

# ---------------- 2050 예측 글 ----------------
with tabs[2]:
    st.markdown("#### 🌱 매우 낮은 배출 vs 🔥 매우 높은 배출 — 2050년 우리 사회 예측")
    only_done = st.toggle("두 글을 모두 쓴 학생만", value=False)
    for sid, r in students:
        ans = r.get("answers", {})
        low, high = fmt(ans.get("c4_low")), fmt(ans.get("c4_high"))
        if not (low or high) or (only_done and not (low and high)):
            continue
        e = lambda s: html.escape(s) if s else "<i style='color:#999'>(아직 쓰지 않음)</i>"
        st.markdown(f"""<div class="essay"><h4>✍️ {names[sid]}</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="col" style="background:#e0f6e3"><b>🌱 SSP1-1.9 · 매우 낮은 배출</b><br>{e(low)}</div>
            <div class="col" style="background:#ffe1e1"><b>🔥 SSP5-8.5 · 매우 높은 배출</b><br>{e(high)}</div>
          </div>
          <div style="margin-top:10px;font-size:14.5px"><b>📊 근거 데이터</b> {e(fmt(ans.get('c4_evidence')))}</div>
          <div style="margin-top:6px;font-size:14.5px"><b>🌏 만들고 싶은 미래</b> {e(fmt(ans.get('c4_choice')))}</div></div>""", unsafe_allow_html=True)

# ---------------- 학생별 ----------------
with tabs[3]:
    sid = st.selectbox("학생", [s for s, _ in students], format_func=lambda s: names[s])
    r = records[sid]
    st.caption(f"마지막 저장: {when(r.get('updated_at', ''))}")
    for c in CHAPTERS:
        sub = (r.get("submitted") or {}).get(c["id"])
        with st.expander(f"{c['no']}. {c['title']} — 작성 {progress(r, c['id']) * 100:.0f}% {'· ✅ ' + when(sub) + ' 제출' if sub else ''}", expanded=c["id"] == "ch4"):
            for q in [q for q in QUESTIONS if q["ch"] == c["id"]]:
                v = fmt(r.get("answers", {}).get(q["id"]))
                st.markdown(f"**{q['label']}**")
                st.write(v if v else "—")

# ---------------- 응답 분석 ----------------
with tabs[4]:
    a, b = st.columns(2)
    years = []
    for _, r in students:
        try:
            years.append(int(str(r.get("answers", {}).get("s1_year", "")).strip()[:4]))
        except ValueError:
            pass
    with a:
        st.markdown("##### 📍 STEP1 · 기온이 급격히 오르기 시작한 해")
        if years:
            yd = pd.DataFrame({"연도": years})
            st.altair_chart(alt.Chart(yd).mark_bar(color="#e34948", cornerRadiusTopLeft=4, cornerRadiusTopRight=4).encode(
                x=alt.X("연도:Q", bin=alt.Bin(step=10), title="학생이 고른 연도(10년 단위)"), y=alt.Y("count():Q", title="학생 수")).properties(height=260), width="stretch")
            st.caption(f"중앙값 {int(pd.Series(years).median())}년 · 수업에서 '왜 서로 다르게 골랐을까?'를 이야기해 보세요.")
        else:
            st.info("아직 답이 없어요.")
    with b:
        st.markdown("##### 😨 1.5℃에서 가장 무섭게 느껴지는 변화")
        sc = pd.Series([fmt(r.get("answers", {}).get("c3_scary")) for _, r in students]).replace("", pd.NA).dropna()
        if len(sc):
            cd = sc.value_counts().rename_axis("변화").reset_index(name="학생 수")
            st.altair_chart(alt.Chart(cd).mark_bar(color="#2a78d6", cornerRadiusTopRight=4, cornerRadiusBottomRight=4).encode(
                y=alt.Y("변화:N", sort="-x", title=None), x=alt.X("학생 수:Q")).properties(height=260), width="stretch")
        else:
            st.info("아직 답이 없어요.")
    a, b = st.columns(2)
    with a:
        st.markdown("##### ⚖️ '한 해가 1.5℃를 넘으면 온난화도 1.5℃를 넘은 걸까?'")
        lg = pd.Series([fmt(r.get("answers", {}).get("c3_long")) for _, r in students]).replace("", pd.NA).dropna()
        if len(lg):
            st.altair_chart(alt.Chart(lg.value_counts().rename_axis("응답").reset_index(name="학생 수")).mark_bar(color="#ffd23f", stroke="#15151a").encode(
                y=alt.Y("응답:N", title=None), x="학생 수:Q").properties(height=140), width="stretch")
        else:
            st.info("아직 답이 없어요.")
    with b:
        st.markdown("##### ✍️ 2050 예측 글 길이(글자 수)")
        ld = pd.DataFrame([{"학생": names[s], "시나리오": lab, "글자 수": len(fmt(r.get("answers", {}).get(qid)).replace(" ", ""))}
                           for s, r in students for qid, lab in [("c4_low", "🌱 낮은 배출"), ("c4_high", "🔥 높은 배출")]])
        if ld["글자 수"].sum():
            st.altair_chart(alt.Chart(ld).mark_bar().encode(
                x=alt.X("학생:N", title=None, sort=None), xOffset="시나리오:N", y="글자 수:Q",
                color=alt.Color("시나리오:N", scale=alt.Scale(range=["#1baf7a", "#e34948"]))).properties(height=220), width="stretch")
        else:
            st.info("아직 답이 없어요.")

# ---------------- 내려받기 · 관리 ----------------
with tabs[5]:
    flat = []
    for sid, r in students:
        row = {"번호": r.get("number"), "이름": r.get("name"), "마지막 저장": when(r.get("updated_at", ""))}
        for q in QUESTIONS:
            row[q["label"]] = fmt(r.get("answers", {}).get(q["id"]))
        flat.append(row)
    fdf = pd.DataFrame(flat)
    st.download_button("⬇️ 전체 답안 내려받기 (엑셀용 CSV)", fdf.to_csv(index=False).encode("utf-8-sig"),
                       file_name=f"기후탐험학습지_{datetime.now(KST):%Y%m%d}.csv", mime="text/csv", type="primary")
    st.download_button("⬇️ 원본 데이터 (JSON)", json.dumps(records, ensure_ascii=False, indent=1).encode("utf-8"),
                       file_name="climate_worksheet_backup.json", mime="application/json")
    st.divider()
    st.markdown("##### 🗑️ 학생 기록 지우기")
    target = st.selectbox("지울 학생", [s for s, _ in students], format_func=lambda s: names[s], key="del")
    sure = st.checkbox(f"{names[target]} 학생의 기록을 지우는 것에 동의합니다. (되돌릴 수 없어요)")
    if st.button("기록 지우기", disabled=not sure):
        store.delete(target)
        st.success("지웠어요.")
        st.rerun()
