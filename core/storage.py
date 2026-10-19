"""학생 답안 저장소.

- Streamlit Secrets에 [firebase] 설정이 있으면 Firebase Firestore에 저장합니다.
- 없으면 이 컴퓨터의 data/submissions.json 파일에 저장합니다(미리보기·연습용).
  Streamlit Community Cloud의 파일은 앱이 다시 시작되면 사라지므로, 실제 수업에서는 Firebase를 쓰세요.
"""
from __future__ import annotations

import json
import re
import threading
from datetime import datetime, timezone
from pathlib import Path

import streamlit as st

COLLECTION = "climate_worksheet"
LOCAL_FILE = Path(__file__).resolve().parents[1] / "data" / "submissions.json"
_lock = threading.Lock()


def student_id(number: str, name: str) -> str:
    """'5', '김지구' → '05_김지구' (번호 순으로 정렬되도록)"""
    num = re.sub(r"\D", "", str(number)) or "0"
    clean = re.sub(r"[\s/\\.#$\[\]]", "", str(name))[:20]
    return f"{int(num):02d}_{clean}"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class LocalStore:
    kind = "local"
    label = "이 컴퓨터의 파일(data/submissions.json)"

    def _read(self) -> dict:
        if LOCAL_FILE.exists():
            try:
                return json.loads(LOCAL_FILE.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                return {}
        return {}

    def _write(self, data: dict) -> None:
        LOCAL_FILE.parent.mkdir(parents=True, exist_ok=True)
        tmp = LOCAL_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        tmp.replace(LOCAL_FILE)

    def get(self, sid: str) -> dict | None:
        return self._read().get(sid)

    def save(self, sid: str, record: dict) -> None:
        with _lock:
            data = self._read()
            data[sid] = {**data.get(sid, {}), **record}
            self._write(data)

    def all(self) -> dict:
        return self._read()

    def delete(self, sid: str) -> None:
        with _lock:
            data = self._read()
            data.pop(sid, None)
            self._write(data)


class FirestoreStore:
    kind = "firebase"
    label = "Firebase Firestore"

    def __init__(self, conf: dict):
        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            cred = dict(conf)
            # Secrets에 붙여 넣은 private_key의 '\n' 글자를 실제 줄바꿈으로
            cred["private_key"] = cred["private_key"].replace("\\n", "\n")
            firebase_admin.initialize_app(credentials.Certificate(cred))
        self.col = firestore.client().collection(COLLECTION)

    def get(self, sid: str) -> dict | None:
        doc = self.col.document(sid).get()
        return doc.to_dict() if doc.exists else None

    def save(self, sid: str, record: dict) -> None:
        self.col.document(sid).set(record, merge=True)

    def all(self) -> dict:
        return {d.id: d.to_dict() for d in self.col.stream()}

    def delete(self, sid: str) -> None:
        self.col.document(sid).delete()


@st.cache_resource(show_spinner=False)
def get_store():
    try:
        conf = st.secrets.get("firebase")
    except Exception:  # secrets.toml 자체가 없을 때
        conf = None
    if conf:
        try:
            return FirestoreStore(dict(conf))
        except Exception as e:  # 설정이 잘못되면 로컬로 대신 저장하고 알려 줍니다
            st.session_state["_store_error"] = f"Firebase 연결 실패: {e}"
    return LocalStore()
