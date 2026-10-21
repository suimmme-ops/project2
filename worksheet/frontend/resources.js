/* 질문별 '더 알아보기' 자료 — 학생이 스스로 보고 공부한 뒤 학습지에 정리하도록
   종류: v 영상 · a 기사 · s 사이트 · q 검색(직접 찾아보기) */
(function () {
  const yt = q => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
  window.RESOURCES = {
    /* ---------- 1차시 · 재난 사례 카드 ---------- */
    case0: [
      ["v", "이재민만 3천만 명! 파키스탄 대홍수", "KBS 2022.09.03", "https://www.youtube.com/watch?v=A3A7uVvpgkM"],
      ["v", "파키스탄 대홍수로 1천 명 사망", "MBC 뉴스투데이 2022.08.30", "https://www.youtube.com/watch?v=1AgCqfFMIxQ"],
      ["a", "국가의 1/3이 잠긴 파키스탄, 올해 홍수 피해가 유독 큰 이유", "사이언스타임즈", "https://www.sciencetimes.co.kr/news/%EA%B5%AD%EA%B0%80%EC%9D%98-1-3%EC%9D%B4-%EC%9E%A0%EA%B8%B4-%ED%8C%8C%ED%82%A4%EC%8A%A4%ED%83%84-%EC%98%AC%ED%95%B4-%ED%99%8D%EC%88%98-%ED%94%BC%ED%95%B4%EA%B0%80-%EC%9C%A0%EB%8F%85-%ED%81%B0"],
      ["s", "위성사진으로 보는 파키스탄 홍수 전후(영어)", "NASA Earth Observatory", "https://science.nasa.gov/earth/earth-observatory/devastating-floods-in-pakistan-150279/"],
    ],
    case1: [
      ["a", "2022년 유럽 여름 폭염과 관련된 사망 6만 1천여 명(영어)", "Earth.com", "https://earth.com/news/deadly-summer-more-than-61000-deaths-linked-to-europes-2022-heatwaves"],
      ["q", "'유럽 폭염 2022' 뉴스 영상 찾아보기", "YouTube 검색", yt("유럽 폭염 2022 뉴스")],
    ],
    case2: [
      ["v", "'역대급 산불' 신음하는 캐나다…새빨갛게 변한 북서부", "KBS 2023.08.17", "https://www.youtube.com/watch?v=YgG98AFZbs4"],
      ["v", "캐나다 산불 확산에 '초비상'…연기가 뉴욕 하늘까지", "KBS 2023.06.07", "https://www.youtube.com/watch?v=ca0WxFWNw7s"],
      ["a", "작년 캐나다 산불 피해면적 1천500만㏊…온난화가 피해 키워", "연합뉴스 2024.08.21", "https://v.daum.net/v/20240821050008708"],
    ],
    case3: [
      ["v", "(기상청 공식발표) 올여름 역대 가장 더웠다!", "YouTube", "https://www.youtube.com/watch?v=MMsI2_w3IhM"],
      ["s", "2024년 여름철 기후 분석 보도자료", "기상청 2024.09.05", "https://www.kma.go.kr/kma/flexer/html/press/2024/09/05/ATC202409051216232_55db3886-6a11-4c3b-b2a3-d2d22c9ed6ff.hwp.files/Sections1.html"],
      ["a", "2025년 여름 평균기온 25.7℃, 역대 1위 경신", "한국경제 2025.09", "https://www.hankyung.com/article/202509042128i"],
    ],
    /* ---------- 1차시 · 질문 ---------- */
    c1_flood: [
      ["v", "폭우에 1천 명 숨진 파키스탄…\"성서에나 나올 법한 홍수\"", "MBC 뉴스데스크 2022.08.29", "https://www.youtube.com/watch?v=Hl5T-2pn1fc"],
      ["a", "국가의 1/3이 잠긴 파키스탄, 홍수 피해가 유독 큰 이유", "사이언스타임즈", "https://www.sciencetimes.co.kr/news/%EA%B5%AD%EA%B0%80%EC%9D%98-1-3%EC%9D%B4-%EC%9E%A0%EA%B8%B4-%ED%8C%8C%ED%82%A4%EC%8A%A4%ED%83%84-%EC%98%AC%ED%95%B4-%ED%99%8D%EC%88%98-%ED%94%BC%ED%95%B4%EA%B0%80-%EC%9C%A0%EB%8F%85-%ED%81%B0"],
    ],
    c1_heat: [
      ["v", "1994년·2018년·2024년…'지독한 폭염' 과거와 또 다르다", "YTN", "https://www.youtube.com/watch?v=CWO2uP77IhQ"],
      ["v", "폭염 2배·열대야 4배…113년 기후 변화의 경고", "연합뉴스TV", "https://www.youtube.com/watch?v=QfZBwbAbgZg"],
    ],
    c1_fire: [
      ["v", "'역대급 산불' 신음하는 캐나다…새빨갛게 변한 북서부", "KBS 2023.08.17", "https://www.youtube.com/watch?v=YgG98AFZbs4"],
      ["a", "캐나다 산불, 온난화가 피해 키워", "연합뉴스 2024.08.21", "https://v.daum.net/v/20240821050008708"],
    ],
    c1_tuvalu: [
      ["v", "사라지는 섬나라 '투발루'…\"채소 키울 땅도 없어요\"", "KBS 2023.05.16", "https://www.youtube.com/watch?v=qeJIGGd4lco"],
      ["v", "바다로 들어가 수중 연설…잠기는 투발루의 기후재앙 호소", "연합뉴스", "https://www.youtube.com/watch?v=09geJT-ZAm4"],
    ],
    c1_bear: [
      ["v", "해빙 녹고, 북극곰 멸종 위기…기후 변화에 위협받는 북극", "KBS 2023.06.11", "https://www.youtube.com/watch?v=G2ZedDbM9PQ"],
      ["v", "\"북극곰 굶는 날 11배 늘어…온실가스로 생존율↓\"", "KBS 2023.09.04", "https://www.youtube.com/watch?v=uRDs3ZQ9RaU"],
      ["v", "[다른 시각] 빙하 녹는데 더 살찐 북극곰? 새로운 먹이 찾아", "YTN 사이언스", "https://www.youtube.com/watch?v=wdwVoTJbMGI"],
    ],
    c1_bee: [
      ["v", "꿀벌이 사라졌다…실종 원인 분석해 보니", "SBS", "https://www.youtube.com/watch?v=4syvagj21R8"],
      ["v", "'꿀벌 집단 실종' 또 속출…\"이상 기온 탓\"", "KBS 2024.02.05", "https://www.youtube.com/watch?v=c07GxKrE1ks"],
      ["a", "꿀벌 실종, 무엇이 문제일까? 쉽게 알아보기", "그린피스", "https://www.greenpeace.org/korea/update/25543/blog-ce-honeybee-disappearance-101/"],
    ],
    c1_others: [
      ["v", "해수 온도↑…동남아까지 번진 '산호 백화'", "KBS 2024.06.26", "https://www.youtube.com/watch?v=PrGFjEEfIkk"],
      ["q", "'기후변화 멸종위기 동물' 영상 찾아보기", "YouTube 검색", yt("기후변화 멸종위기 동물")],
    ],
    /* ---------- 2차시 ---------- */
    s1_year: [
      ["v", "이산화탄소가 올린 지구의 온도! (인류의 한계 온도 1.5도씨 2부)", "KBS 2019.10.25", "https://www.youtube.com/watch?v=Od8E8k1IKb8"],
    ],
    s1_life: [
      ["q", "'1970년대 생활 모습' 영상 찾아보기", "YouTube 검색", yt("1970년대 생활 모습")],
      ["q", "'산업혁명 쉽게' 영상 찾아보기", "YouTube 검색", yt("산업혁명 쉽게 설명 초등")],
    ],
    s1_word: [
      ["q", "'산업혁명 쉽게' 영상 찾아보기", "YouTube 검색", yt("산업혁명 쉽게 설명 초등")],
      ["v", "이산화탄소가 올린 지구의 온도! (인류의 한계 온도 1.5도씨 2부)", "KBS 2019.10.25", "https://www.youtube.com/watch?v=Od8E8k1IKb8"],
    ],
    read_greenhouse: [
      ["v", "온실효과란 무엇일까? 그림으로 알기 쉽게 설명해 드려요", "YouTube", "https://www.youtube.com/watch?v=DBvGQvFedCA"],
      ["v", "지구의 온실 효과에 대해 알아볼까?", "YouTube", "https://www.youtube.com/watch?v=xelqBZE6GiM"],
      ["a", "지구의 기후 시스템은 어떻게 작동하는가 (달과 지구 비교)", "한국경제 생글생글", "https://sgsg.hankyung.com/article/2022020408181"],
    ],
    s2_nogas: [
      ["a", "대기가 없는 달은 왜 낮과 밤의 온도 차이가 클까?", "한국경제 생글생글", "https://sgsg.hankyung.com/article/2022020408181"],
    ],
    s2_acts: [
      ["v", "탄소중립, 이상기후의 원인? 온실가스인 이산화탄소를 줄이자", "YouTube", "https://www.youtube.com/watch?v=hZ7gjAcjg9g"],
      ["q", "'화석연료 사용하는 활동' 찾아보기", "YouTube 검색", yt("화석연료 사용 활동 이산화탄소 초등")],
    ],
    s2_why: [
      ["v", "온실효과란 무엇일까? 그림으로 알기 쉽게 설명해 드려요", "YouTube", "https://www.youtube.com/watch?v=DBvGQvFedCA"],
    ],
    s3_think: [
      ["v", "\"탄소 배출 불량 국가\" 오명 벗어야…한국 실태는?", "KBS", "https://www.youtube.com/watch?v=jMGgKX4Qs4U"],
      ["s", "1인당 CO₂ 배출량 원문 그래프", "Our World in Data", "https://ourworldindata.org/grapher/co-emissions-per-capita?time=1750..2024&facet=none&country=KOR~GBR"],
    ],
    s4_effort: [
      ["a", "IRA(인플레이션 감축법)가 무엇인지 쉽게 알아보아요 — 미국", "토스뱅크", "https://tossbank.com/articles/ira"],
      ["a", "영국, 마지막 석탄발전소 문 닫아 — 142년 석탄 발전 끝(영어)", "CS Monitor 2024.09.30", "https://csmonitor.com/World/Europe/2024/0930/UK-coal-powered-renewable-energy-Britain"],
      ["q", "'○○ 온실가스 감축 노력' 뉴스 찾아보기", "YouTube 검색", yt("온실가스 감축 노력 나라")],
    ],
    /* ---------- 3차시 ---------- */
    read_1c: [
      ["v", "지구온난화가 무서운 진짜 이유 | 궤도가 알려 주는 날씨와 기후", "EBS 나의 두 번째 교과서", "https://www.youtube.com/watch?v=K5oSwRspGSE"],
    ],
    read_15: [
      ["v", "지구 기온 상승 1.5도로 막는다…IPCC 특별보고서 채택", "연합뉴스TV", "https://www.youtube.com/watch?v=oblSd6dHWBI"],
      ["v", "1.5도 넘으면 우린 다 멸망하나요?", "YouTube", "https://www.youtube.com/watch?v=RF52CUFh4M0"],
      ["a", "\"1.5도 안 넘으면 3800만 아동, 평생 폭염 피할 수 있다\"", "더나은미래(조선일보)", "https://futurechosun.com/?p=122658"],
      ["s", "지구온난화 1.5℃ 특별보고서(영어)", "IPCC", "https://www.ipcc.ch/sr15/"],
    ],
    c3_long: [
      ["v", "기후 마지노선 1.5도 일시 돌파…역대 가장 더운 해", "연합뉴스TV", "https://www.youtube.com/watch?v=Bq87EUt_bw8"],
    ],
    c3_season: [
      ["v", "요즘 한국 계절 특! \"중간이 없음\" | 과학독파민 EP.18 계절의 변화", "YouTube", "https://www.youtube.com/watch?v=d1bU_2Jt-98"],
      ["v", "여름 다음 겨울?…한반도 사계절 사라지나", "YouTube", "https://www.youtube.com/watch?v=keOA9ECpbYg"],
    ],
    c3_why15: [
      ["v", "지구 기온 상승 1.5도로 막는다…IPCC 특별보고서 채택", "연합뉴스TV", "https://www.youtube.com/watch?v=oblSd6dHWBI"],
      ["v", "해수 온도↑…동남아까지 번진 '산호 백화'", "KBS 2024.06.26", "https://www.youtube.com/watch?v=PrGFjEEfIkk"],
    ],
    c3_clock_feel: [
      ["v", "'지구 방어선 1.5℃' 붕괴까지 3년…기술 구원 가능한가", "YTN", "https://www.youtube.com/watch?v=sWLy6yNCCSw"],
      ["s", "실시간 기후 시계", "Climate Clock", "https://climateclock.world/"],
    ],
    /* ---------- 4차시 ---------- */
    c4_safe: [
      ["v", "\"8년 뒤 한국 실화냐\"…믿기 힘든 한국의 기후변화 시나리오", "SBS 딥빽", "https://www.youtube.com/watch?v=5Ua6AcyBXJg"],
      ["v", "2100년 한반도는 어떻게 변할까? #기후변화시나리오", "YouTube 쇼츠", "https://www.youtube.com/shorts/7s7aHoAp8sQ"],
      ["s", "우리나라 기후변화 시나리오", "기상청 기후정보포털", "http://www.climate.go.kr/"],
    ],
    c4_fruit: [
      ["v", "기후가 바꾸는 '한반도 먹거리' 지도", "KBS 2024.08.27", "https://www.youtube.com/watch?v=5v62ifquIuM"],
      ["v", "'사과'가 연천군 특산물?…북상하는 사과 재배 적지", "KBS 2023.10.27", "https://www.youtube.com/watch?v=2KN0Wo-Gz8Q"],
      ["a", "2070년엔 사과는 수입, 파파야는 국산?", "뉴닉", "https://newneek.co/@before_spring/article/14185"],
    ],
    c4_change: [
      ["v", "녹아내리는 빙하…\"2050년 우리 해안선 모습 바뀐다\"", "YTN", "https://www.youtube.com/watch?v=DYuerxdVb-4"],
      ["v", "'구글 어스'로 본 해수면 상승 시나리오, 인천공항이 물에 잠길 거라고?", "YouTube", "https://www.youtube.com/watch?v=htpzz-EZfKk"],
      ["a", "이대로면 서울 목동까지… 2050년 바다에 잠긴다", "국민일보 2023.04.26", "https://v.daum.net/v/20230426183010114"],
    ],
  };
  window.RESOURCES.c4_danger = window.RESOURCES.c4_safe;
  window.RESOURCES.s2_fuel = window.RESOURCES.s2_acts;

  const ICON = { v: "▶ 영상", a: "📰 기사", s: "🌐 자료", q: "🔍 검색" };
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  window.resHTML = function (key, title) {
    const list = window.RESOURCES[key];
    if (!list || !list.length) return "";
    return `<div class="res"><div class="res-h">📚 ${esc(title || "더 알아보기 · 자료를 보고 스스로 공부한 뒤 정리해 보세요")}</div>
      <div class="res-list">${list.map(([t, name, src, url]) => `<a class="res-item res-${t}" href="${esc(url)}" target="_blank" rel="noopener"><span class="res-t">${ICON[t]}</span><span class="res-n">${esc(name)}</span><span class="res-src">${esc(src)}</span></a>`).join("")}</div></div>`;
  };
})();
