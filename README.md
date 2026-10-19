# 🌏 기후 탐험 학습지 — 데이터로 읽는 기후변화, 2050년을 예측하다

초등학교 6학년 학생들이 **실제 기후 데이터를 직접 조작하며 탐구**하고, 온실가스 배출 시나리오별 **2050년 미래 사회를 예측하는 글**을 써서 제출하는 **온라인 학습지 웹앱**입니다.
(숙명여자대학교 2026-2 「AI융합교육 동향과 이슈」 중간 프로젝트)

- **학생용 학습지**: 종이 학습지 2종(「자료로 확인하는 기후변화」, 「기후변화 데이터 분석하기」)의 흐름을 4개 챕터로 재구성
- **교사 대시보드**: 학생 결과물 실시간 수합, 문항별 모아보기, 2050 예측 글 갤러리, 응답 분석, 엑셀(CSV) 내려받기

## 📚 수업 흐름

| 챕터 | 주제 | 학생이 조작하는 데이터·모형 (모두 슬라이더) |
|---|---|---|
| 1 | 기후변화, 얼마나 심각할까? | 기온↑에 따른 수증기 증가(7%/℃) · 투발루 해수면 상승 개념 모형 |
| 2 | 데이터로 기후변화 분석하기 (STEP 1~4) | HadCRUT5 기온 1850–2025 · 세계 CO₂(연료별) · 1인당 CO₂(나라 추가 가능) · 나라별 순위·증감 |
| 3 | 1.5℃, 생존의 마지노선 | 한 해 값 vs 20년 평균 · 1.5℃ vs 2℃ 영향 비교 · 탄소예산 기반 기후 시계 |
| 4 | 2050년, 미래 예측하기 | IPCC SSP 5개 시나리오 · 극한 기후 빈도 배수 · **시나리오별 미래 사회 예측 글쓰기(제출)** |
| ★ | 마무리 성찰 | 알게 된 점 · 느낀 점 · 나의 탐구 기록 한눈에 보기 |

## 🧱 구조

```
streamlit_app.py           # 진입점 (상단 메뉴: 학습지 / 교사 대시보드)
app_pages/student.py       # 학습지 컴포넌트 탑재 + 로그인·제출 요청 처리
app_pages/teacher.py       # 교사 대시보드 (비밀번호 보호)
core/storage.py            # Firebase Firestore 저장 (미설정 시 로컬 JSON 파일)
worksheet/                 # Streamlit 양방향 컴포넌트
  frontend/index.html      #   학생 화면 (HTML/CSS/JS, 외부 차트 라이브러리 없이 SVG로 그림)
  frontend/charts.js       #   그래프 엔진 (툴팁·크로스헤어·슬라이더 연동)
  frontend/chapters.js     #   챕터 내용
  frontend/questions.json  #   문항 목록 (학생 화면과 교사 대시보드가 함께 사용)
  frontend/data/*.json     #   그래프 데이터
scripts/build_data.py      # 원자료 → JSON 데이터 생성
scripts/json_to_secrets.py # Firebase 키 → Streamlit Secrets 형식 변환
docs/                      # 배포·Firebase 안내서, 프로젝트 계획안 초안
```

## ▶️ 내 컴퓨터에서 실행

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```
교사 대시보드 기본 비밀번호는 `teacher1234`예요. 배포할 때는 반드시 Secrets에서 바꾸세요.

## ☁️ 배포 · 백엔드
- [Streamlit Cloud 배포 안내](docs/DEPLOY_GUIDE.md)
- [Firebase 연결 안내 (아주 쉽게)](docs/FIREBASE_GUIDE.md)

## 📊 데이터 출처
- **기온**: Met Office Hadley Centre & UEA CRU, HadCRUT5 5.1.0.0 — 1850–1900년 평균을 0℃로 재계산
- **CO₂ 배출량**: Global Carbon Budget(2025), Our World in Data 가공 — https://github.com/owid/co2-data (CC BY 4.0)
- **미래 시나리오**: IPCC AR6 WGI SPM(2021) 표 SPM.1, 그림 SPM.6
- **1.5℃ vs 2℃**: IPCC 지구온난화 1.5℃ 특별보고서(2018) SPM
- **기후 시계**: Forster 외(2025) Indicators of Global Climate Change 2024 — 남은 탄소예산 130 GtCO₂(2025년 초, 50% 확률)
- 사례·읽기 자료의 출처는 앱 화면 각 카드 아래에 표기했습니다.

개념 모형(투발루 단면, 온실가스 담요 실험실)은 이해를 돕기 위한 그림이며 실제 측정값이 아님을 화면에 표시했습니다.
