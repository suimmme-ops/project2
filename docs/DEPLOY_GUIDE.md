# 🚀 Streamlit Community Cloud에 배포하기

> 결과: `https://내앱이름.streamlit.app` 주소가 생기고, 학생들은 이 주소(또는 QR코드)로 접속합니다.

## 준비물
- GitHub 저장소: `suimmme-ops/project2` (이 코드가 들어 있는 곳)
- GitHub 계정으로 로그인한 Streamlit Community Cloud: https://share.streamlit.io

## 1. 앱 만들기 (3분)
1. https://share.streamlit.io 접속 → 오른쪽 위 **[Create app]**
2. **"Deploy a public app from GitHub"** 선택
3. 아래처럼 입력합니다.

| 칸 | 입력값 |
|---|---|
| Repository | `suimmme-ops/project2` |
| Branch | `main` |
| Main file path | `streamlit_app.py` |
| App URL | 원하는 주소 (예: `climate-wing-6-2`) |

4. **Advanced settings**를 눌러 Python 버전은 `3.11` 또는 `3.12`를 고르고,
   **Secrets** 칸에 [Firebase 안내서](FIREBASE_GUIDE.md) 4단계의 내용을 붙여 넣습니다.
   (Firebase를 아직 안 만들었다면 `TEACHER_PASSWORD = "비밀번호"` 한 줄만 넣고 나중에 추가해도 돼요.)
5. **[Deploy]** → 2~3분 뒤 앱이 열립니다.

## 2. 수업 전 점검표 ✅
- [ ] 학생용 주소로 접속 → 번호·이름 입력 → 챕터 1~4가 모두 열리는지
- [ ] 아무 챕터에서 **📮 선생님께 제출하기** → "제출 완료!" 알림이 뜨는지
- [ ] 위쪽 **🧑‍🏫 교사 대시보드** → 비밀번호 입력 → 방금 제출한 내용이 보이는지
- [ ] 대시보드에 노란색 "이 컴퓨터의 파일에 저장" 안내가 **없는지** (있으면 Firebase 미연결)
- [ ] 테스트 기록은 대시보드 **⬇️ 내려받기 · 관리**에서 지우기

## 3. 학생에게 나눠 주기
- 주소를 패들렛에 올리거나, QR코드를 만들어 칠판에 띄웁니다.
- 학생 화면 위쪽의 **📘 학습지 / 🧑‍🏫 교사 대시보드** 메뉴 중 교사 대시보드는 비밀번호가 있어야 열립니다.

## 4. 앱이 잠들었을 때
무료 앱은 며칠 동안 아무도 접속하지 않으면 잠듭니다. 수업 10분 전에 한 번 접속해
**"Yes, get this app back up!"** 단추를 눌러 깨워 두세요. (Firebase에 저장된 학생 답은 그대로예요.)

## 5. 코드를 고친 뒤
GitHub의 `main` 브랜치에 커밋하면 1분 안에 앱이 자동으로 새 코드로 바뀝니다.

## 6. 데이터 새로 고치기 (선택)
OWID가 새 자료를 내면:
```bash
git clone --depth 1 https://github.com/owid/co2-data
python scripts/build_data.py co2-data/owid-co2-data.csv
```
`worksheet/frontend/data/*.json`이 새로 만들어지면 커밋하세요.
