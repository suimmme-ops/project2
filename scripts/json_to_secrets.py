"""Firebase에서 내려받은 서비스 계정 키(JSON)를 Streamlit Secrets 형식(TOML)으로 바꿔 줍니다.

사용법
    python scripts/json_to_secrets.py 내려받은키.json 교사비밀번호

화면에 나온 내용을 통째로 복사해 Streamlit Cloud → Settings → Secrets 칸에 붙여 넣으면 끝!
"""
import json
import sys


def main(path: str, password: str) -> None:
    with open(path, encoding="utf-8") as f:
        key = json.load(f)
    print(f'TEACHER_PASSWORD = {json.dumps(password, ensure_ascii=False)}\n')
    print("[firebase]")
    for k, v in key.items():
        # json.dumps 는 줄바꿈을 \n 으로 바꿔 주므로 TOML 한 줄 문자열로 안전합니다.
        print(f"{k} = {json.dumps(v, ensure_ascii=False)}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "teacher1234")
