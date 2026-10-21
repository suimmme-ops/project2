/* 챕터별 화면 내용과 상호작용 */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const D = () => window.S.data;
  const C = window.Charts;
  const sign = (v, d = 2) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(d);
  const PAL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#6250d6"];

  function hero(ch, kicker, title, text, goals) {
    const c = window.S.chapters.find(x => x.id === ch);
    return `<section class="chapter-hero"><div class="bigno">${c.no}</div><div>
      <div class="kicker">${kicker}</div><h1>${title}</h1><p>${text}</p>
      <div class="goals">${goals.map(g => `<span class="pill">${g}</span>`).join("")}</div></div></section>`;
  }
  function step(badge, title, sub) {
    return `<div class="step-head"><span class="step-badge">${badge}</span><h2>${title}</h2>${sub ? `<div class="sub">${sub}</div>` : ""}</div>`;
  }
  function tableView(head, rows, hl) {
    return `<details class="table-view"><summary>📋 표로 보기</summary><div class="tbl-wrap"><table class="data"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr class="${hl && hl(r) ? "hl" : ""}">${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`;
  }
  // 데이터 도우미
  const tempPts = () => D().temp.years.map((y, i) => [y, D().temp.anomaly[i]]);
  function movingAvg(pts, n) {
    return pts.map((p, i) => i < n - 1 ? null : [p[0], pts.slice(i - n + 1, i + 1).reduce((a, q) => a + q[1], 0) / n]).filter(Boolean);
  }
  const pcAt = (iso, y) => { const s = D().pc.series[iso]; return s ? s[y - D().pc.start] : null; };
  const totAt = (iso, y) => { const s = D().tot.series[iso]; return s ? s[y - D().tot.start] : null; };
  const nameOf = iso => D().ctry.names[iso] || iso;
  const isoOf = name => Object.keys(D().ctry.names).find(k => D().ctry.names[k] === name.trim());
  const norm = s => String(s || "").replace(/\s+/g, "").toLowerCase();

  window.CHECKERS = {};

  /* ================================================================
     CHAPTER 1 · 기후변화, 얼마나 심각할까?
     ================================================================ */
  const CASES = [
    { e: "🌊", where: "PAKISTAN · 2022", t: "물에 잠긴 나라", body: "2022년 여름, 평소보다 훨씬 많은 비(몬순 폭우)가 쏟아져 <b>국토의 약 3분의 1</b>이 물에 잠겼어요. 약 <b>3,300만 명</b>이 집과 농경지를 잃는 등 피해를 입었어요.", src: "NASA Earth Observatory(2022), UN OCHA(2022)" },
    { e: "🥵", where: "EUROPE · 2022", t: "더위가 생명을 위협할 때", body: "2022년 여름 유럽에는 기록적인 폭염이 이어졌어요. 연구에 따르면 이 여름 더위와 관련해 <b>6만 명이 넘는 사람</b>이 목숨을 잃었어요. 특히 어르신과 어린이가 위험했어요.", src: "Ballester 외(2023), Nature Medicine" },
    { e: "🔥", where: "CANADA · 2023", t: "역대 최악의 산불", body: "2023년 캐나다에서는 산불로 약 <b>1,500만 헥타르</b>의 숲이 탔어요. 이는 <b>우리나라 전체 면적의 약 1.5배</b>예요. 연기는 국경을 넘어 미국 뉴욕 하늘까지 주황빛으로 물들였어요.", src: "캐나다 천연자원부·연구진 분석(2024), 연합뉴스(2024.08.21)" },
    { e: "KR", where: "KOREA · 2024–2025", t: "기록을 또 깬 여름", body: "2024년 우리나라 여름 평균기온은 <b>25.6℃</b>로 기상 관측(1973년) 이래 가장 높았어요. 그런데 바로 다음 해인 <b>2025년 여름(25.7℃)</b>이 그 기록을 또 깼어요. 2024년 서울에서는 밤에도 25℃ 아래로 내려가지 않는 <b>열대야가 39일</b>이나 이어졌어요.", src: "기상청 2024년 여름철 기후 분석(2024.09), 2025년 여름철 기후 특성(2025.09)" },
  ];

  const ch1 = {
    html() {
      return `
      ${hero("ch1", "CHAPTER 1 · SOS!", "지구가 보내는 조난 신호", "세계 곳곳에서 일어난 기후 재난을 살펴보고, 지구가 따뜻해지면 왜 홍수·폭염·산불이 심해지는지 원인을 찾아봅시다.", ["🔎 재난 사례 읽기", "🧪 원인 추론하기", "🐻‍❄️ 사라지는 것 기록하기"])}

      ${step("1-1", "기후 재난의 원인 파악하기", "카드를 눌러 실제로 일어난 기후 재난을 읽어 보세요.")}
      <div class="card">
        <div class="case-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
          ${CASES.map((c, i) => `<button class="case" data-case="${i}" aria-pressed="${i === 0}"><span class="emoji">${c.e === "KR" ? flagKR(30) : c.e}</span><span class="where">${c.where}</span><h4>${c.t}</h4></button>`).join("")}
        </div>
        <div class="case-detail reading card flat paper" id="caseDetail"></div>
      </div>

      <div class="bento">
        <div class="card span-7 viz">
          <div class="viz-head"><div><span class="tag concept">과학 원리</span><h3 style="margin-top:6px">공기가 따뜻해지면, 품을 수 있는 수증기가 늘어나요</h3>
          <p class="desc">슬라이더로 기온을 올려 보세요. 공기는 1℃ 따뜻해질 때마다 약 7% 더 많은 수증기를 품을 수 있어요.</p></div></div>
          <div id="vaporChart"></div>
          <div class="controls">${rangeHTML("vapor", "🌡️ 지구 기온이 오르면", 0, 4, 0.1, 1.5)}</div>
          <p class="src">원리: 클라우지우스-클라페이롱 관계(약 7%/℃). IPCC AR6 제1실무그룹 보고서 8장(2021).</p>
        </div>
        <div class="span-5 stack" style="gap:16px">
          <div class="tile" style="background:var(--c2-soft)"><span class="k">💧 공기 속 수증기</span><span class="v" id="vaporV">+0%</span><span class="d">비구름에 실리는 물이 많아져 <b>한꺼번에 쏟아지는 비</b>가 세져요.</span></div>
          <div class="tile" style="background:var(--c1-soft)"><span class="k">🏜️ 땅과 숲에서는</span><span class="v" id="vaporD" style="font-size:24px">더 빨리 말라요</span><span class="d">더운 공기가 땅과 나무의 물을 더 많이 빨아들여 <b>가뭄과 산불</b>이 쉽게 일어나요.</span></div>
        </div>
      </div>

      <div class="bento">
        <div class="span-4">${UI.long("c1_flood", { hint: "💡 수증기가 늘어나면 비구름은 어떻게 될까요?" })}</div>
        <div class="span-4">${UI.long("c1_heat", { hint: "💡 땅이 데워지고, 밤에도 식지 않으면?" })}</div>
        <div class="span-4">${UI.long("c1_fire", { hint: "💡 숲의 나무와 흙이 바싹 마르면?" })}</div>
      </div>

      ${step("1-2", "사라지는 것들에 대한 기록", "기후 위기로 고통받는 이들의 이야기를 읽고 정리해 봅시다.")}
      <div class="bento">
        <div class="card span-7 viz">
          <div class="viz-head"><div><span class="tag concept">개념 모형</span><h3 style="margin-top:6px">🏝️ 바다가 높아지면 투발루는?</h3>
          <p class="desc">투발루는 평균 높이가 바다보다 약 2m밖에 높지 않은 섬나라예요. 바닷물 높이를 올려 보세요.</p></div></div>
          <div class="scene" id="tuvalu"></div>
          <div class="controls row even">
            ${rangeHTML("rise", "🌊 해수면 상승", 0, 150, 5, 30)}
            <div class="ctrl"><div class="ctrl-label"><span>🌕 밀물 높이</span><output id="tideOut">평소</output></div>
              <div class="seg" id="tide"><button data-v="0" aria-pressed="true">평소</button><button data-v="1" aria-pressed="false">킹 타이드</button></div>
              <div class="ticks"><span>킹 타이드 = 1년 중 가장 높은 밀물(약 +0.9m)</span></div></div>
          </div>
          <p class="src">실제 지형이 아닌 이해를 돕는 개념 모형이에요. 투발루 평균 해발고도 약 2m, 가장 높은 곳 약 4.6m. 출처: 투발루 정부, NASA 해수면 변화 팀(2023).</p>
        </div>
        <div class="span-5 stack" style="gap:16px">
          <div class="card reading"><h3>🏝️ 투발루</h3><p>남태평양의 작은 섬나라 투발루는 바닷물이 높아지며 땅이 조금씩 잠기고, 바닷물이 땅속으로 스며들어 <b>마실 물과 농사지을 땅</b>이 줄고 있어요. 2023년에는 호주와 조약을 맺어 해마다 주민 일부가 호주로 옮겨 살 수 있게 되었어요.</p></div>
          <div class="card reading"><h3>🐻‍❄️ 북극곰</h3><p>북극곰은 <b>바다 얼음 위에서 물범을 사냥</b>해요. 9월의 북극 바다 얼음 면적은 1979년 이후 <b>10년마다 약 12%씩</b> 줄고 있어요. 얼음이 없는 기간이 길어지면 북극곰은 굶주리게 돼요.</p><p class="src">출처: 미국 국립빙설자료센터(NSIDC)</p></div>
          <div class="card reading"><h3>🐝 꿀벌</h3><p>2022년 초 우리나라에서는 약 <b>78억 마리</b>의 꿀벌이 사라졌다고 추정돼요. 원인은 한 가지가 아니에요. <b>응애 같은 해충</b>, 꿀을 얻을 <b>꽃(밀원)이 줄어든 것</b>, 그리고 <b>이상 기온</b>이 함께 영향을 주었어요. 겨울이 따뜻하면 꿀벌이 일찍 깨어나 밖으로 나갔다가 갑작스러운 추위에 돌아오지 못하고, 꽃 피는 시기도 어긋나요.</p><p class="src">출처: 한국양봉협회 추산(2022), 농촌진흥청·농림축산식품부 원인 분석(2022)</p></div>
        </div>
      </div>
      <div class="bento">
        <div class="span-6">${UI.long("c1_tuvalu")}</div>
        <div class="span-6">${UI.long("c1_bear")}</div>
        <div class="span-6">${UI.long("c1_bee")}</div>
        <div class="span-6">${UI.long("c1_others", { hint: "🔍 검색해서 찾아보기! 예) 기후변화 멸종위기 동물" })}</div>
      </div>`;
    },
    mount(v) {
      const det = $("#caseDetail", v);
      const showCase = i => {
        const c = CASES[i];
        $$(".case", v).forEach(b => b.setAttribute("aria-pressed", +b.dataset.case === i));
        det.innerHTML = `<h3>${c.e === "KR" ? flagKR(20) : c.e} ${c.t}</h3><p>${c.body}</p><p class="src">출처: ${c.src}</p>${resHTML("case" + i, "더 알아보기 · 뉴스와 영상으로 이 재난을 더 자세히 살펴봐요")}`;
      };
      $$(".case", v).forEach(b => b.addEventListener("click", () => showCase(+b.dataset.case)));
      showCase(0);

      const pts = []; for (let t = 0; t <= 4.0001; t += 0.1) pts.push([+t.toFixed(1), (Math.pow(1.07, t) - 1) * 100]);
      const vc = C.xy($("#vaporChart", v), {
        height: 300, x: { domain: [0, 4], unit: "℃ 상승" },
        y: { label: "늘어나는 수증기(%)", fmt: x => "+" + x.toFixed(0) + "%" },
        series: [{ name: "수증기 증가", color: "#2a78d6", data: pts, width: 4 }],
        tip: (x, rows) => `<div class="t-year">기온 +${x}℃</div><div class="t-row"><span>수증기</span><b>+${rows[0].v.toFixed(1)}%</b></div>`,
      });
      bindRange($("#vapor", v), t => {
        const p = (Math.pow(1.07, t) - 1) * 100;
        $("#vaporV", v).textContent = "+" + p.toFixed(0) + "%";
        vc.update({ vlines: [{ x: Math.round(t * 10) / 10, label: `+${t.toFixed(1)}℃ → 수증기 +${p.toFixed(0)}%`, fill: "#2a78d6" }] });
      }, t => "+" + t.toFixed(1) + "℃");

      let tide = 0, rise = 30;
      const draw = () => drawTuvalu($("#tuvalu", v), rise / 100 + (tide ? 0.9 : 0));
      bindRange($("#rise", v), x => { rise = x; draw(); }, x => "+" + x + "cm");
      seg($("#tide", v), x => { tide = +x; $("#tideOut", v).textContent = tide ? "+0.9m" : "평소"; draw(); });
    },
  };

  function drawTuvalu(el, water) {
    // 섬 단면 높이(m) — 개념 모형
    const prof = [-2, -0.4, 0.6, 1.3, 1.9, 2.2, 1.8, 2.5, 3.2, 4.6, 3.4, 2.6, 2.0, 2.3, 1.6, 1.1, 1.7, 1.2, 0.6, -0.4, -2];
    const W = 800, H = 330, px = 36, sea0 = 240;
    const X = i => i / (prof.length - 1) * W, Y = h => sea0 - h * px;
    const land = `M0,${H} ` + prof.map((h, i) => `L${X(i)},${Y(h)}`).join(" ") + ` L${W},${H} Z`;
    // 잠긴 비율
    let wet = 0, tot = 0;
    for (let i = 0; i < prof.length - 1; i++) {
      for (let k = 0; k < 20; k++) {
        const h = prof[i] + (prof[i + 1] - prof[i]) * (k / 20);
        if (h > 0) { tot++; if (h <= water) wet++; }
      }
    }
    const pct = Math.round(wet / tot * 100);
    const houses = [3.5, 5.5, 7.5, 11.5, 13.2, 15.5, 17.3].map(f => {
      const i = Math.floor(f), h = prof[i] + (prof[i + 1] - prof[i]) * (f - i);
      return { x: f / (prof.length - 1) * W, h };
    });
    const wy = Y(water);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="해수면 ${water.toFixed(2)}m 상승 시 섬의 ${pct}%가 잠기는 개념 모형">
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#dff4ff"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#sky)"/>
      <circle cx="700" cy="60" r="30" fill="#ffd23f" stroke="#15151a" stroke-width="3"/>
      <path d="${land}" fill="#f2d49b" stroke="#15151a" stroke-width="3"/>
      ${[8.6, 10.2, 12.4].map(f => { const i = Math.floor(f), h = prof[i] + (prof[i + 1] - prof[i]) * (f - i), x = f / (prof.length - 1) * W, y = Y(h); return `<g transform="translate(${x},${y})"><path d="M0,0 C2,-20 -2,-40 4,-58" stroke="#7a4a1f" stroke-width="5" fill="none"/><path d="M4,-58 q-26,-4 -34,10 M4,-58 q26,-6 34,8 M4,-58 q-8,-18 -26,-20 M4,-58 q12,-18 28,-16" stroke="#1f8a3a" stroke-width="7" fill="none" stroke-linecap="round"/></g>`; }).join("")}
      ${houses.map(o => { const y = Y(o.h), flooded = o.h <= water; return `<g transform="translate(${o.x - 16},${y - 30})"><rect x="2" y="12" width="28" height="18" fill="${flooded ? "#9ec5f4" : "#fff"}" stroke="#15151a" stroke-width="2.5"/><path d="M-2,13 L16,0 L34,13 Z" fill="#ff8a65" stroke="#15151a" stroke-width="2.5"/><rect x="12" y="19" width="8" height="11" fill="#15151a"/></g>`; }).join("")}
      <rect x="0" y="${wy}" width="${W}" height="${H - wy}" fill="#2a78d6" opacity=".62"/>
      <path d="M0,${wy} ${Array.from({ length: 21 }, (_, i) => `Q${i * 40 + 10},${wy - 6} ${i * 40 + 20},${wy} T${i * 40 + 40},${wy}`).join(" ")}" stroke="#fff" stroke-width="3" fill="none" opacity=".9"/>
      <line x1="0" x2="${W}" y1="${sea0}" y2="${sea0}" stroke="#15151a" stroke-width="2" stroke-dasharray="6 6"/>
      <text x="10" y="${sea0 - 6}" font-size="14" font-weight="800" fill="#15151a">지금의 바다 높이</text>
      <g transform="translate(14,14)"><rect width="250" height="66" rx="12" fill="#fff" stroke="#15151a" stroke-width="3"/>
        <text x="14" y="28" font-size="15" font-weight="800" fill="#4a4a55">물에 잠긴 땅</text>
        <text x="14" y="56" font-size="28" font-weight="900" fill="${pct > 50 ? "#c42b2b" : "#15151a"}">${pct}%</text>
        <text x="110" y="56" font-size="15" font-weight="800" fill="#4a4a55">바다 +${water.toFixed(2)}m</text></g>
    </svg>`;
  }

  /* ================================================================
     CHAPTER 2 · 데이터로 기후변화 분석하기 (STEP 1~4)
     ================================================================ */
  const ch2 = {
    html() {
      const d = D(), last = d.temp.years[d.temp.years.length - 1];
      return `
      ${hero("ch2", "CHAPTER 2 · DATA DETECTIVE", "데이터로 기후변화 분석하기", "실제 과학 데이터를 직접 움직여 보며, 지구가 얼마나 뜨거워졌는지, 왜 뜨거워지는지, 누가 얼마나 내뿜는지 찾아봅시다.", ["📈 STEP1 기온 변화", "🧣 STEP2 온실효과", "👤 STEP3 1인당 배출", "🏭 STEP4 나라별 배출"])}

      ${step("STEP 1", "점점 더 뜨거워지는 지구", "1850년부터 지금까지의 세계 기온 변화 그래프를 분석해 봅시다.")}
      <div class="card viz">
        <div class="viz-head"><div><span class="tag data">실제 관측 데이터</span><h3 style="margin-top:6px">🌡️ 세계 평균 기온은 얼마나 변했을까? (1850–${last})</h3>
          <p class="desc">막대 하나가 1년이에요. <b style="color:#c42b2b">빨간 막대</b>는 산업화 이전(1850–1900년 평균)보다 따뜻했던 해, <b style="color:#1c5cab">파란 막대</b>는 추웠던 해예요.</p></div>
          <div class="seg" id="maToggle"><button data-v="1" aria-pressed="true">10년 평균선 보기</button><button data-v="0" aria-pressed="false">숨기기</button></div></div>
        <div class="tiles" id="tTiles"></div>
        <div id="tempChart"></div>
        <div class="legend"><span><i class="sw" style="background:#c42b2b"></i>따뜻했던 해</span><span><i class="sw" style="background:#1c5cab"></i>추웠던 해</span><span><i class="sw line" style="background:#15151a;width:22px"></i>10년 이동평균</span></div>
        <div class="controls row">
          ${dualHTML("tRange", "🗓️ 살펴볼 기간", 1850, last, 1850, last)}
          ${rangeHTML("tPick", "📍 기온이 급격하게 오르기 시작한 때는?", 1860, last - 10, 1, 1940)}
        </div>
        <div class="feedback show ok" id="pickNote" style="background:#fff4c7;color:#15151a"></div>
        <div class="card flat" style="padding:18px;background:var(--paper)">
          <div class="viz-head"><div><h3 style="font-size:17px">🏭 같은 기간, 사람들이 내뿜은 이산화탄소(CO₂)</h3><p class="desc">위 그래프와 같은 기간을 보여 줘요. 단위가 달라서 그래프를 따로 그렸어요.</p></div></div>
          <div id="co2LineChart"></div>
        </div>
        ${tableView(["연도", "기온 차이(℃)"], d.temp.years.map((y, i) => [y, sign(d.temp.anomaly[i])]).reverse())}
        <p class="src">기온: Met Office Hadley Centre & UEA CRU, HadCRUT5 5.1.0.0 — 1850–1900년 평균을 0℃로 다시 계산. CO₂: Global Carbon Budget(2025), Our World in Data 가공 (<a href="https://ourworldindata.org/co2-and-greenhouse-gas-emissions" target="_blank" rel="noopener">원문 보기 ↗</a>)</p>
      </div>
      <div class="bento">
        <div class="span-5">${UI.short("s1_year", { label: "그래프 분석: 지구의 기온이 급격하게 상승하기 시작한 시기는 언제쯤인가요? (약 ○○○○년경부터)", hint: "📍 위의 슬라이더로 표시해 보면 자동으로 적혀요. 직접 고쳐 써도 돼요.", ph: "예) 1970" })}</div>
        <div class="span-7">${UI.long("s1_life", { label: "이 시기 사람들의 생활과 생산 방식에 어떤 큰 변화가 있었을지 생각하여 정리해 봅시다.", hint: "🔍 검색 예시) <b>0000년대 생산 방식</b>, 0000년대 생활 모습" })}</div>
      </div>
      ${UI.blanks("s1_word", "위의 두 그래프를 보면 기온과 CO₂ 배출량이 비슷한 시기에 함께 가파르게 올라가요. 석탄·석유를 태워 기계를 돌리고, 공장에서 물건을 대량으로 만들게 된 사회의 큰 변화를 {0}(이)라고 해요. 이 변화 이후 사람들이 내뿜는 {1}이(가) 크게 늘어났어요.", ["산업혁명|산업화|공업화", "이산화탄소|co2|co₂|탄소|온실가스"], { title: "STEP 1 정리: 기온과 CO₂ 그래프가 함께 올라가기 시작한 까닭은 무엇일까요?" })}

      ${step("STEP 2", "지구는 왜 뜨거워지고 있을까?", "온실가스 담요 모형을 움직여 보고, 세 가지 자료를 읽으며 정리해 봅시다.")}
      <div class="bento">
        <div class="card span-7 viz">
          <div class="viz-head"><div><span class="tag concept">개념 모형</span><h3 style="margin-top:6px">🧣 온실가스 담요 실험실</h3><p class="desc">슬라이더로 온실가스 담요를 두껍게 만들어 보세요. 빠져나가는 열과 다시 돌아오는 열을 살펴봐요.</p></div></div>
          <div class="scene" id="greenhouse"></div>
          <div class="controls">${rangeHTML("ghg", "🧣 온실가스 담요의 두께", 0, 4, 1, 1)}</div>
          <p class="src">온실가스가 없을 때 '평균' 약 −18℃(낮과 밤의 차이가 아주 커짐), 산업화 이전 약 14℃는 교과서·NASA 등에서 널리 쓰는 값이고, 미래 값은 IPCC AR6(2021) 시나리오별 2100년 무렵 상승폭을 더한 어림값이에요.</p>
        </div>
        <div class="card span-5 reading tint">
          <h3>📖 자료 1 · 지구의 담요, 온실가스</h3>
          <p>태양의 빛은 지구를 데워요. 데워진 지구는 열을 우주로 내보내는데, 공기 속 <b>온실가스</b>가 이 열의 일부를 붙잡아 다시 지구로 돌려보내요. 마치 <b>담요</b>처럼요!</p>
          <p>이 작용 덕분에 지구는 생물이 살기 알맞은 온도를 유지해요. 이것을 <b>온실효과</b>라고 해요. 햇볕 아래 세워 둔 <b>자동차 안</b>이 창문을 닫으면 점점 더워지는 것과 비슷해요.</p>
          <div class="facts">
            <div class="fact"><b>🫧 CO₂ · 메테인</b><span>대표적인 온실가스. 수증기, 아산화질소도 온실가스예요.</span></div>
            <div class="fact"><b>280 → 420ppm</b><span>공기 속 CO₂ 농도: 산업화 이전 → 지금(약 1.5배)</span></div>
            <div class="fact"><b>약 15℃</b><span>온실효과 덕분에 지켜지는 지구의 평균 기온</span></div>
          </div>
          <p class="src">출처: NOAA 전 지구 CO₂ 관측(2024 연평균 약 423ppm), 기상청 기후정보포털</p>
          ${resHTML("read_greenhouse", "더 알아보기 · 영상으로 온실효과 원리를 살펴봐요")}
        </div>
      </div>
      <div class="bento">
        <div class="span-6">${UI.blanks("s2_blanket", "(1) 온실가스는 지구를 덮어 주는 {0} 같은 역할을 합니다.", ["담요|이불"], { title: "자료 1을 읽고 빈칸을 채워 봅시다." })}</div>
        <div class="span-6">${UI.blanks("s2_effect", "(2) 열이 모두 빠져나가지 않도록 도와 지구의 온도를 알맞게 유지해 주는 작용을 {0}(이)라고 합니다.", ["온실효과|온실 효과"], { title: "이 작용의 이름은?" })}</div>
      </div>
      ${UI.long("s2_nogas", { label: "(3) 만약 온실가스가 전혀 없다면 지구는 어떻게 될까요?", hint: "🧣 위 실험실의 슬라이더를 맨 왼쪽(0)으로 옮겨 보세요. −18℃는 '평균'이에요. 담요가 없으면 낮과 밤에는 각각 어떻게 될지도 생각해 보세요. (힌트: 대기가 거의 없는 달)" })}

      <div class="card viz">
        <div class="viz-head"><div><span class="tag data">실제 데이터</span><h3 style="margin-top:6px">⛽ 자료 2 · 무엇을 태워서 CO₂가 나왔을까?</h3>
          <p class="desc">전 세계가 해마다 내뿜은 CO₂를 연료별로 쌓아 그렸어요. 기간을 바꿔 보며 어떤 연료가 가장 많은지 찾아보세요.</p></div></div>
        <div class="tiles" id="fuelTiles"></div>
        <div id="fuelChart"></div>
        <div class="legend"><span><i class="sw" style="background:#52514e"></i>석탄</span><span><i class="sw" style="background:#eb6834"></i>석유</span><span><i class="sw" style="background:#2a78d6"></i>천연가스</span><span><i class="sw" style="background:#eda100"></i>시멘트·기타</span></div>
        <div class="controls">${dualHTML("fRange", "🗓️ 살펴볼 기간", 1850, d.world.years[d.world.years.length - 1], 1900, d.world.years[d.world.years.length - 1])}</div>
        <p class="src">출처: Global Carbon Budget(2025) — Our World in Data 가공. 단위: 억 톤(1억 톤 = 1백만 톤 × 100). 땅 이용 변화(숲 파괴)로 인한 배출은 제외.</p>
      </div>
      ${UI.blanks("s2_fuel", "사람들은 에너지를 만들기 위해 {0}, {1} 같은 '화석연료'를 사용합니다. 이 연료를 태우면 숨어 있던 {2}가 공기 중 산소와 만나 {3}가 됩니다. 우리가 에너지를 많이 쓸수록 공기 중에는 이산화탄소가 꽉 차게 되고, 지구를 덮고 있는 담요가 점점 더 두꺼워지게 됩니다.", ["석탄|석유|천연가스|가스", "석유|석탄|천연가스|가스", "탄소|c", "이산화탄소|co2"], { title: "자료 2를 읽고 빈칸을 채워 봅시다." })}
      ${UI.list("s2_acts", ["활동 ①", "활동 ②", "활동 ③"], { label: "사람들이 하는 활동 중, 이산화탄소를 많이 만들어 내는 활동을 조사해 3가지 이상 정리해 봅시다.", hint: "🔍 검색 예시) <b>화석연료 사용하는 활동</b> — 위 그래프에서 가장 큰 연료가 무엇에 쓰이는지 떠올려 보세요.", area: true })}
      <div class="card reading tint">
        <h3>📖 자료 3 · 열이 빠져나가지 못하는 지구</h3>
        <p>이산화탄소가 많아지면 담요가 두꺼워진 것처럼, 지구가 내보내려던 열이 우주로 잘 빠져나가지 못하고 지구 안에 계속 쌓여요. 그래서 지구의 평균 기온이 점점 올라가요. 이것을 <b>지구 온난화</b>라고 해요. 요즘은 그 심각성을 강조해 <b>'지구 가열'</b>이라고 부르기도 해요.</p>
      </div>
      ${UI.long("s2_why", { label: "자료 3을 읽고, 이산화탄소가 많아질수록 왜 지구가 더워지는지 정리해 적어 보세요." })}

      ${step("STEP 3", "우리는 얼마나 많은 CO₂를 배출하고 있을까?", "한 사람이 1년 동안 내뿜는 CO₂(1인당 배출량)를 나라별로 비교해 봅시다.")}
      <div class="card viz">
        <div class="viz-head"><div><span class="tag data">실제 데이터</span><h3 style="margin-top:6px">👤 1인당 CO₂ 배출량: 대한민국 vs 영국</h3>
          <p class="desc">그래프에 마우스를 올리거나(태블릿은 손가락으로 눌러) 연도별 값을 확인해 보세요. 나라를 더 추가할 수도 있어요.</p></div></div>
        <div class="chips" id="pcChips"></div>
        <div class="tiles" id="pcTiles"></div>
        <div id="pcChart"></div>
        <div class="controls row">
          ${dualHTML("pcRange", "🗓️ 살펴볼 기간", 1800, d.ctry.latest, 1900, d.ctry.latest)}
          ${rangeHTML("pcYear", "📍 기준 연도", 1900, d.ctry.latest, 1, d.ctry.latest)}
        </div>
        <p class="src">출처: Global Carbon Budget(2025); 인구 자료 UN WPP 등 — Our World in Data 가공 (<a href="https://ourworldindata.org/grapher/co-emissions-per-capita?time=1750..2024&facet=none&country=KOR~GBR" target="_blank" rel="noopener">원문 그래프 ↗</a>). 화석연료·산업 배출 기준.</p>
      </div>
      <div class="card viz">
        <div class="viz-head"><div><h3>🏆 1인당 배출량 순위</h3><p class="desc">대한민국보다 1인당 배출량이 많은 나라를 찾아보세요. 연도를 옮기면 순위가 바뀌어요.</p></div>
          <div class="seg" id="rkSmall"><button data-v="0" aria-pressed="true">모든 나라</button><button data-v="1" aria-pressed="false">인구 100만 명 이상만</button></div></div>
        <div class="controls">${rangeHTML("rkYear", "📍 순위를 볼 연도", 1960, d.ctry.latest, 1, d.ctry.latest)}</div>
        <div id="rkChart"></div>
      </div>
      <div class="bento">
        <div class="span-6">${UI.short("s3_kor", { label: `(1) ${d.ctry.latest}년 기준, 대한민국의 1인당 배출량은 약 몇 톤인가요?`, ph: "예) 0.0", check: true })}</div>
        <div class="span-6">${UI.short("s3_gbr", { label: `(1) ${d.ctry.latest}년 기준, 영국의 1인당 배출량은 약 몇 톤인가요?`, ph: "예) 0.0", check: true })}</div>
      </div>
      ${UI.list("s3_top3", ["나라 ①", "나라 ②", "나라 ③"], { label: `(2) ${d.ctry.latest}년 기준, 대한민국의 1인당 CO₂ 배출량보다 더 많은 양을 배출하고 있는 나라 3개를 찾아 적어 보세요.`, hint: `📍 위 순위 그래프의 연도를 <b>${d.ctry.latest}년</b>에 두고, 대한민국보다 위에 있는 나라를 찾아보세요.`, check: true })}
      ${UI.long("s3_think", { label: "(3) 그래프를 보면 영국은 1인당 CO₂ 배출량이 줄어드는 모습이고, 대한민국은 과거보다 크게 늘어난 모습입니다. 이 데이터를 보고 어떤 생각이 들었나요? 까닭과 함께 써 봅시다." })}

      ${step("STEP 4", "누가 누가 더 많이 내뿜을까?", "나라 전체의 배출량 순위와, 배출량을 줄인 나라를 데이터로 찾아봅시다.")}
      <div class="card viz">
        <div class="viz-head"><div><span class="tag data">실제 데이터</span><h3 style="margin-top:6px">🏭 나라별 CO₂ 총배출량 순위</h3><p class="desc">연도를 옮기며 순위가 어떻게 변하는지 살펴보세요.</p></div>
          <div class="pill" id="korRankPill" style="font-size:15px"></div></div>
        <div class="controls">${rangeHTML("totYear", "📍 연도", 1990, d.ctry.latest, 1, 2020)}</div>
        <div id="totChart"></div>
      </div>
      <div class="card viz">
        <div class="viz-head"><div><h3>📉 배출량을 가장 많이 줄인(늘린) 나라는?</h3><p class="desc">두 연도 사이에 배출량이 얼마나 변했는지 비교해요. 파란 막대는 줄인 양, 빨간 막대는 늘어난 양이에요.</p></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><div class="seg" id="chDir"><button data-v="down" aria-pressed="true">줄인 나라</button><button data-v="up" aria-pressed="false">늘린 나라</button></div>
          <div class="seg" id="chMode"><button data-v="abs" aria-pressed="true">양(백만 톤)</button><button data-v="pct" aria-pressed="false">비율(%)</button></div></div></div>
        <div class="controls">${dualHTML("chRange", "🗓️ 비교할 두 연도", 1990, d.ctry.latest, 2010, 2023)}</div>
        <div id="chChart"></div>
        <p class="src">출처: Global Carbon Budget(2025) — Our World in Data 가공. 비율(%)은 처음 연도에 5천만 톤 이상 배출한 나라만 비교해요.<br>📌 패들렛 ④번 자료(<a href="https://tips.energy.or.kr/statistics/statistics_view0909.do" target="_blank" rel="noopener">한국에너지공단 통계 ↗</a>)는 IEA의 '연료 연소' 기준이라 순위가 조금 다를 수 있어요.</p>
      </div>
      ${UI.list("s4_top3", ["1위", "2위", "3위"], { label: "(1) 2020년 기준, 전 세계에서 CO₂를 가장 많이 배출하는 나라 1, 2, 3위는 어디인가요?", check: true })}
      <div class="bento">
        <div class="span-6">${UI.short("s4_korrank", { label: "(2) 대한민국의 배출량은 전 세계 몇 위인가요? (2020년)", ph: "예) ○위", check: true })}</div>
        <div class="span-6">${UI.short("s4_reduce", { label: "(3) 2010~2023년 사이 배출량을 가장 많이 줄인 나라는 어디인가요?", check: true })}</div>
      </div>
      ${UI.long("s4_effort", { label: "(4) (3)번의 나라가 온실가스 배출량을 줄이기 위해 한 노력을 찾아 정리해 봅시다.", hint: "🔍 검색 예시) <b>○○○(나라 이름) 온실가스 감축 노력</b>" })}`;
    },
    mount(v) {
      const d = D(), tp = tempPts(), ma = movingAvg(tp, 10);
      /* ----- STEP1 기온 ----- */
      let showMA = true, range = [1850, d.temp.years.at(-1)], pick = 1940;
      const tempChart = C.xy($("#tempChart", v), { height: 360, x: { domain: range }, y: { label: "1850–1900년 평균과의 차이(℃)", fmt: x => sign(x) + "℃", tick: x => (x > 0 ? "+" : "") + x.toFixed(1) }, bars: { name: "그해 기온 차이", data: tp, color: x => C.diverge(x, -0.4, 1.4) }, series: [] });
      const wp = d.world.years.map((y, i) => [y, d.world.total[i]]);
      const co2Chart = C.xy($("#co2LineChart", v), { height: 230, x: { domain: range }, y: { label: "세계 CO₂ 배출량(억 톤)", fmt: x => x.toFixed(0) + "억 톤" }, series: [{ name: "세계 CO₂ 배출량", color: "#52514e", data: wp, width: 3.5 }] });
      const avgOf = (a, b) => { const s = tp.filter(p => p[0] >= a && p[0] <= b); return s.reduce((x, p) => x + p[1], 0) / s.length; };
      function redrawT() {
        const vl = [{ x: pick, label: `📍 ${pick}년`, fill: "#ffd23f", textColor: "#15151a" }];
        tempChart.update({ x: { domain: range }, series: showMA ? [{ name: "10년 이동평균", color: "#15151a", data: ma, width: 3.5 }] : [], vlines: vl });
        co2Chart.update({ x: { domain: range }, vlines: vl });
        const a = tp.find(p => p[0] === range[0]), b = tp.find(p => p[0] === range[1]);
        $("#tTiles", v).innerHTML = `
          <div class="tile"><span class="k">${range[0]}년</span><span class="v">${sign(a[1])}<small>℃</small></span></div>
          <div class="tile"><span class="k">${range[1]}년</span><span class="v" style="color:#c42b2b">${sign(b[1])}<small>℃</small></span></div>
          <div class="tile" style="background:var(--c3-soft)"><span class="k">📍 ${pick}년 앞뒤 30년의 변화</span><span class="v" style="font-size:22px;line-height:1.5">앞 ${sign(avgOf(pick - 5, pick + 4) - avgOf(pick - 35, pick - 26))}℃ → 뒤 ${sign(avgOf(Math.min(pick + 25, 2016), Math.min(pick + 34, 2025)) - avgOf(pick - 5, pick + 4))}℃</span><span class="d">10년 평균끼리 비교했어요.</span></div>`;
        const before = avgOf(pick - 5, pick + 4) - avgOf(pick - 35, pick - 26);
        const after = avgOf(Math.min(pick + 25, 2016), Math.min(pick + 34, 2025)) - avgOf(pick - 5, pick + 4);
        $("#pickNote", v).textContent = after > before * 2 && after > 0.3
          ? `🔎 ${pick}년 이후 30년 동안 오른 기온(${sign(after)}℃)이 그 전 30년(${sign(before)}℃)보다 훨씬 커요. 이때부터 급격히 오르기 시작했다고 말할 수 있을까요?`
          : `🔎 ${pick}년 앞뒤의 기온 변화가 비슷해요(앞 ${sign(before)}℃, 뒤 ${sign(after)}℃). 막대가 빨갛게 변하며 가파르게 오르기 시작하는 곳을 더 찾아보세요.`;
      }
      bindDual($("#tRange", v), (a, b) => { range = [a, b]; redrawT(); });
      const pr = $("#tPick", v);
      if (/^\d{4}$/.test(String(window.S.answers.s1_year || "").trim())) pr.value = window.S.answers.s1_year;
      let first = true;
      bindRange(pr, x => {
        pick = x; redrawT();
        if (!first) { const inp = $('[data-q="s1_year"]', v); inp.value = x; window.setAnswer("s1_year", String(x)); }
        first = false;
      }, x => x + "년");
      seg($("#maToggle", v), x => { showMA = x === "1"; redrawT(); });

      /* ----- STEP2 온실가스 담요 ----- */
      bindRange($("#ghg", v), lv => drawGreenhouse($("#greenhouse", v), lv), lv => ["없음", "산업화 이전", "지금", "더 두껍게", "아주 두껍게"][lv]);

      const fuels = [["석탄", "coal", "#52514e"], ["석유", "oil", "#eb6834"], ["천연가스", "gas", "#2a78d6"], ["시멘트·기타", "other", "#eda100"]];
      const fuelChart = C.xy($("#fuelChart", v), {
        height: 330, stack: true, endLabels: true, x: { domain: [1900, d.world.years.at(-1)] }, y: { label: "세계 CO₂ 배출량(억 톤)", fmt: x => x.toFixed(1) + "억 톤", tick: x => x.toFixed(0) },
        series: fuels.map(([n, k, c]) => ({ name: n, color: c, data: d.world.years.map((y, i) => [y, d.world[k][i]]) })),
      });
      bindDual($("#fRange", v), (a, b) => {
        fuelChart.update({ x: { domain: [a, b] } });
        const i = d.world.years.indexOf(b), tot = fuels.reduce((s, f) => s + d.world[f[1]][i], 0);
        const ia = d.world.years.indexOf(a);
        $("#fuelTiles", v).innerHTML = `<div class="tile"><span class="k">${a}년 → ${b}년 전체 배출량</span><span class="v" style="font-size:26px">${d.world.total[ia].toFixed(0)}<small>억 톤</small> → ${d.world.total[i].toFixed(0)}<small>억 톤</small></span><span class="d">약 ${(d.world.total[i] / Math.max(0.1, d.world.total[ia])).toFixed(1)}배</span></div>` +
          fuels.slice(0, 3).map(([n, k, c]) => `<div class="tile"><span class="k"><i class="sw" style="background:${c}"></i>${b}년 ${n}</span><span class="v">${Math.round(d.world[k][i] / tot * 100)}<small>%</small></span></div>`).join("");
      }, 10);

      /* ----- STEP3 1인당 ----- */
      const ans = window.S.answers;
      let sel = [["KOR", PAL[0]], ["GBR", PAL[1]]], pcRange = [1900, d.ctry.latest], pcYear = d.ctry.latest;
      const pcChart = C.xy($("#pcChart", v), { height: 360, endLabels: true, x: { domain: pcRange }, y: { label: "1인당 CO₂ 배출량(톤)", fmt: x => x.toFixed(2) + "톤", tick: x => x.toFixed(0) }, series: [] });
      const dl = `<datalist id="ctryList">${Object.keys(d.pc.series).map(k => `<option value="${esc(nameOf(k))}">`).join("")}</datalist>`;
      function drawChips() {
        $("#pcChips", v).innerHTML = sel.map(([iso, c]) => `<span class="chip"><i class="sw" style="background:${c}"></i>${esc(nameOf(iso))}${sel.length > 1 ? `<button data-rm="${iso}" aria-label="${esc(nameOf(iso))} 빼기">×</button>` : ""}</span>`).join("") +
          (sel.length < 6 ? `<span class="add-country">${dl}<input list="ctryList" id="addC" placeholder="➕ 나라 추가 (예: 미국)"/><button class="btn small" id="addBtn">추가</button></span>` : "");
        $$("[data-rm]", v).forEach(b => b.addEventListener("click", () => { sel = sel.filter(s => s[0] !== b.dataset.rm); drawChips(); redrawPC(); }));
        const add = () => {
          const iso = isoOf($("#addC", v).value || "");
          if (!iso) { toast("🤔 목록에 있는 나라 이름을 골라 주세요.", "err"); return; }
          if (sel.some(s => s[0] === iso)) return;
          const used = sel.map(s => s[1]);
          sel.push([iso, PAL.find(c => !used.includes(c))]); drawChips(); redrawPC();
        };
        const ab = $("#addBtn", v); if (ab) { ab.addEventListener("click", add); $("#addC", v).addEventListener("keydown", e => { if (e.key === "Enter") add(); }); }
      }
      function redrawPC() {
        pcChart.update({
          x: { domain: pcRange },
          series: sel.map(([iso, c]) => ({ name: nameOf(iso), color: c, width: iso === "KOR" ? 4 : 3, data: d.pc.series[iso].map((val, i) => [d.pc.start + i, val]).filter(p => p[1] != null) })),
          vlines: [{ x: pcYear, label: `📍 ${pcYear}년`, fill: "#ffd23f", textColor: "#15151a" }],
        });
        $("#pcTiles", v).innerHTML = sel.map(([iso, c]) => {
          const val = pcAt(iso, pcYear);
          return `<div class="tile"><span class="k"><i class="sw" style="background:${c}"></i>${esc(nameOf(iso))} · ${pcYear}년</span><span class="v">${val == null ? "—" : val.toFixed(2)}<small>톤</small></span></div>`;
        }).join("");
      }
      drawChips();
      bindDual($("#pcRange", v), (a, b) => { pcRange = [a, b]; redrawPC(); }, 10);
      bindRange($("#pcYear", v), y => { pcYear = y; redrawPC(); }, y => y + "년");

      let rkYear = d.ctry.latest, rkBig = false;
      const rkChart = C.hbar($("#rkChart", v), { rows: [], rank: true, fmt: x => x.toFixed(2) + "톤", tip: r => `<div class="t-year">${esc(r.label)}</div><div class="t-row"><span>1인당 배출량</span><b>${r.value.toFixed(2)}톤</b></div>` });
      function redrawRK() {
        const pop = d.ctry.population;
        const all = Object.keys(d.pc.series).map(iso => ({ iso, v: pcAt(iso, rkYear) }))
          .filter(o => o.v != null && (!rkBig || (pop[o.iso] || 0) >= 1e6)).sort((a, b) => b.v - a.v);
        const ki = all.findIndex(o => o.iso === "KOR");
        const n = Math.max(15, Math.min(all.length, ki + 1));
        let rows = all.slice(0, Math.min(n, 30));
        if (ki >= 30) rows = rows.slice(0, 29).concat(all[ki]);
        rkChart.update({
          aria: `${rkYear}년 1인당 CO2 배출량 순위`,
          rows: rows.map(o => ({ label: nameOf(o.iso) + (ki >= 30 && o.iso === "KOR" ? ` (${ki + 1}위)` : ""), flag: o.iso === "KOR" ? "KR" : "", value: o.v, color: o.iso === "KOR" ? "#e34948" : "#2a78d6", highlight: o.iso === "KOR" })),
        });
      }
      bindRange($("#rkYear", v), y => { rkYear = y; redrawRK(); }, y => y + "년");
      seg($("#rkSmall", v), x => { rkBig = x === "1"; redrawRK(); });

      const L = d.ctry.latest;
      const numCheck = (iso, nm) => val => {
        const x = parseFloat(String(val || "").replace(/[^\d.]/g, "")), real = pcAt(iso, L);
        if (isNaN(x)) return { ok: false, msg: "숫자로 적어 주세요." };
        return Math.abs(x - real) <= 0.2 ? { ok: true, msg: `🎉 맞아요! 데이터의 값은 ${real.toFixed(2)}톤이에요.` } : { ok: false, msg: `🤔 다시 확인해 보세요. 기준 연도 슬라이더를 ${L}년에 두고 ${nm}의 값을 읽어 보세요.` };
      };
      CHECKERS.s3_kor = numCheck("KOR", "대한민국");
      CHECKERS.s3_gbr = numCheck("GBR", "영국");
      CHECKERS.s3_top3 = list => {
        const kv = pcAt("KOR", L);
        const xs = (list || []).filter(x => String(x || "").trim());
        if (!xs.length) return { ok: false, msg: "나라 이름을 적어 주세요." };
        const res = xs.map(n => { const iso = isoOf(n) || Object.keys(d.ctry.names).find(k => norm(d.ctry.names[k]) === norm(n)); return { n, iso, ok: iso && pcAt(iso, L) > kv }; });
        const bad = res.filter(r => !r.ok);
        return bad.length ? { ok: false, msg: `🤔 '${bad.map(b => b.n).join(", ")}'은(는) 확인이 필요해요. 순위 그래프에서 대한민국보다 위에 있는 나라인지 보세요. (이름은 그래프와 똑같이)` } : { ok: true, msg: `🎉 모두 ${L}년 대한민국(${kv.toFixed(2)}톤)보다 많이 배출하는 나라예요!` };
      };

      /* ----- STEP4 총배출량 ----- */
      const totChart = C.hbar($("#totChart", v), { rows: [], rank: true, fmt: x => Math.round(x).toLocaleString("ko-KR") + "백만 톤", tip: r => `<div class="t-year">${esc(r.label)}</div><div class="t-row"><span>배출량</span><b>${Math.round(r.value).toLocaleString("ko-KR")}백만 톤</b></div><div class="t-row"><span>세계 전체 중</span><b>${r.share}%</b></div>` });
      const rankTot = y => Object.keys(d.tot.series).map(iso => ({ iso, v: totAt(iso, y) })).filter(o => o.v != null).sort((a, b) => b.v - a.v);
      bindRange($("#totYear", v), y => {
        const all = rankTot(y), ki = all.findIndex(o => o.iso === "KOR");
        const wt = d.world.total[d.world.years.indexOf(y)] * 100;
        let rows = all.slice(0, 10);
        if (ki >= 10) rows = rows.concat(all[ki]);
        totChart.update({ aria: `${y}년 CO2 총배출량 순위`, rows: rows.map(o => ({ label: nameOf(o.iso) + (o.iso === "KOR" && ki >= 10 ? ` (${ki + 1}위)` : ""), flag: o.iso === "KOR" ? "KR" : "", value: o.v, share: (o.v / wt * 100).toFixed(1), color: o.iso === "KOR" ? "#e34948" : "#52514e", highlight: o.iso === "KOR" })) });
        $("#korRankPill", v).innerHTML = `${flagKR(16)} ${y}년 대한민국: ${ki + 1}위`;
      }, y => y + "년");

      let chA = 2010, chB = 2023, chMode = "abs", chDir = "down";
      const chChart = C.hbar($("#chChart", v), { rows: [], rank: true, fmt: x => chMode === "abs" ? (x > 0 ? "+" : "") + Math.round(x).toLocaleString("ko-KR") : (x > 0 ? "+" : "") + x.toFixed(1) + "%", tip: r => `<div class="t-year">${esc(r.label)}</div><div class="t-row"><span>${chA}년</span><b>${Math.round(r.a).toLocaleString("ko-KR")}백만 톤</b></div><div class="t-row"><span>${chB}년</span><b>${Math.round(r.b).toLocaleString("ko-KR")}백만 톤</b></div>` });
      function changes(a, b, mode) {
        return Object.keys(d.tot.series).map(iso => { const x = totAt(iso, a), y = totAt(iso, b); return { iso, a: x, b: y }; })
          .filter(o => o.a != null && o.b != null && (mode === "abs" || o.a >= 50))
          .map(o => Object.assign(o, { v: mode === "abs" ? o.b - o.a : (o.b - o.a) / o.a * 100 }));
      }
      function redrawCH() {
        const list = changes(chA, chB, chMode).sort((p, q) => chDir === "down" ? p.v - q.v : q.v - p.v).slice(0, 10);
        chChart.update({ aria: `${chA}년에서 ${chB}년 사이 배출량 변화`, rows: list.map(o => ({ label: nameOf(o.iso), flag: o.iso === "KOR" ? "KR" : "", value: o.v, a: o.a, b: o.b, color: o.v < 0 ? "#2a78d6" : "#e34948", highlight: o.iso === "KOR" })) });
      }
      bindDual($("#chRange", v), (a, b) => { chA = a; chB = b; redrawCH(); }, 1);
      seg($("#chMode", v), x => { chMode = x; redrawCH(); });
      seg($("#chDir", v), x => { chDir = x; redrawCH(); });

      const top2020 = rankTot(2020);
      CHECKERS.s4_top3 = list => {
        const xs = list || [];
        const res = [0, 1, 2].map(i => { const iso = isoOf(xs[i] || "") || Object.keys(d.ctry.names).find(k => norm(d.ctry.names[k]) === norm(xs[i])); return iso === top2020[i].iso; });
        const n = res.filter(Boolean).length;
        return n === 3 ? { ok: true, msg: "🎉 정확해요! 순위 그래프를 2020년에 두면 확인할 수 있어요." } : { ok: false, msg: `🤔 3개 중 ${n}개가 맞아요. 연도 슬라이더를 2020년에 두고 순위를 다시 보세요.` };
      };
      CHECKERS.s4_korrank = val => {
        const n = parseInt(String(val || "").replace(/\D/g, ""), 10), real = top2020.findIndex(o => o.iso === "KOR") + 1;
        if (isNaN(n)) return { ok: false, msg: "숫자로 적어 주세요. 예) 5위" };
        if (n === real) return { ok: true, msg: `🎉 맞아요! 이 앱의 자료(OWID)에서 2020년 대한민국은 ${real}위예요.` };
        if (n === 8) return { ok: true, msg: `👍 한국에너지공단 표(IEA 연료 연소 기준)에서는 8위예요. 이 앱의 자료(OWID)에서는 ${real}위예요. 자료마다 계산 기준이 달라서 순위가 다를 수 있어요!` };
        return { ok: false, msg: "🤔 순위 그래프를 2020년에 두고 대한민국을 찾아보세요." };
      };
      const ch = changes(2010, 2023, "abs").sort((p, q) => p.v - q.v), chp = changes(2010, 2023, "pct").sort((p, q) => p.v - q.v);
      CHECKERS.s4_reduce = val => {
        const iso = isoOf(val || "") || Object.keys(d.ctry.names).find(k => norm(d.ctry.names[k]) === norm(val));
        if (iso === ch[0].iso) return { ok: true, msg: `🎉 맞아요! 줄인 '양'으로는 ${nameOf(ch[0].iso)}가 1위예요(${Math.round(ch[0].v)}백만 톤). 참고로 줄인 '비율'로는 ${nameOf(chp[0].iso)}가 1위예요.` };
        if (iso === chp[0].iso) return { ok: true, msg: `👍 줄인 '비율'로는 ${nameOf(iso)}가 1위예요! 줄인 '양'으로는 ${nameOf(ch[0].iso)}가 1위예요. 무엇을 기준으로 했는지 함께 적어 보세요.` };
        return { ok: false, msg: "🤔 비교할 두 연도를 2010–2023으로 두고 '줄인 나라' 그래프의 1위를 확인해 보세요." };
      };
    },
  };

  function drawGreenhouse(el, lv) {
    const T = [-18, 14, 15, 17, 18][lv];
    const names = ["온실가스가 없어요 (평균 −18℃, 낮·밤 차이가 아주 큼)", "산업화 이전", "지금", "온실가스가 더 많아지면 (2100년 중간 배출)", "온실가스가 아주 많아지면 (2100년 매우 높은 배출)"];
    const back = [0, 2, 3, 4, 5][lv], out = 6 - back;
    const earth = ["#dfeefe", "#3fa66b", "#58a65a", "#c2a03b", "#d9772e"][lv];
    const W = 800, H = 360, cx = 330, cy = 460, R = 230;
    const atmR = R + 30 + lv * 14;
    let arrows = "";
    for (let i = 0; i < 6; i++) {
      const ang = (-150 + i * 24) * Math.PI / 180;
      const x1 = cx + Math.cos(ang) * (R + 4), y1 = cy + Math.sin(ang) * (R + 4);
      if (i < out) {
        const x2 = cx + Math.cos(ang) * (atmR + 70), y2 = cy + Math.sin(ang) * (atmR + 70);
        arrows += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ff8a65" stroke-width="5" marker-end="url(#ah)" stroke-linecap="round"/>`;
      } else {
        const xm = cx + Math.cos(ang) * (atmR - 4), ym = cy + Math.sin(ang) * (atmR - 4);
        const ang2 = ang + 0.16, x3 = cx + Math.cos(ang2) * (R + 10), y3 = cy + Math.sin(ang2) * (R + 10);
        arrows += `<path d="M${x1},${y1} L${xm},${ym} L${x3},${y3}" fill="none" stroke="#e34948" stroke-width="5" marker-end="url(#ah2)" stroke-linejoin="round" stroke-linecap="round"/>`;
      }
    }
    const tH = 190, tY = 70, tMin = -20, tMax = 20, level = tY + tH - (T - tMin) / (tMax - tMin) * tH;
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${names[lv]}: 지구 평균 기온 약 ${T}℃">
      <defs>
        <marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#ff8a65"/></marker>
        <marker id="ah2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#e34948"/></marker>
        <marker id="ah3" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#ffd23f"/></marker>
      </defs>
      <rect width="${W}" height="${H}" fill="#0f1b33"/>
      ${Array.from({ length: 28 }, (_, i) => `<circle cx="${(i * 137) % W}" cy="${(i * 61) % 170}" r="${i % 3 ? 1.2 : 2}" fill="#fff" opacity=".7"/>`).join("")}
      <circle cx="${cx}" cy="${cy}" r="${atmR}" fill="#9fb7ff" opacity="${0.06 + lv * 0.09}" stroke="#b9a6f5" stroke-width="${lv ? 3 + lv * 2.5 : 0}" stroke-dasharray="${lv ? "2 8" : "0"}"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="${earth}" stroke="#15151a" stroke-width="4"/>
      ${lv === 0 ? `<text x="${cx}" y="${cy - R + 62}" text-anchor="middle" font-size="34">☀️🥵 · 🌙🧊</text><text x="${cx}" y="${cy - R + 96}" text-anchor="middle" font-size="17" font-weight="900" fill="#15151a">낮엔 뜨겁고, 밤엔 꽁꽁!</text>` : `<text x="${cx}" y="${cy - R + 70}" text-anchor="middle" font-size="40">${lv >= 3 ? "🔥🏜️🔥" : "🌳🏘️🌊"}</text>`}
      <circle cx="40" cy="40" r="56" fill="#ffd23f" stroke="#15151a" stroke-width="4"/>
      ${[0, 1, 2].map(i => `<line x1="${90 + i * 18}" y1="${70 + i * 8}" x2="${cx - 150 + i * 60}" y2="${cy - R - 6 + i * 2}" stroke="#ffd23f" stroke-width="5" marker-end="url(#ah3)" stroke-linecap="round"/>`).join("")}
      ${arrows}
      <g transform="translate(640,0)">
        <rect x="-8" y="${tY - 18}" width="44" height="${tH + 36}" rx="22" fill="#fff" stroke="#15151a" stroke-width="3"/>
        <rect x="6" y="${level}" width="16" height="${tY + tH - level + 6}" rx="8" fill="${T < 0 ? "#2a78d6" : T > 16 ? "#e34948" : "#ff8a65"}"/>
        <circle cx="14" cy="${tY + tH + 20}" r="20" fill="${T < 0 ? "#2a78d6" : T > 16 ? "#e34948" : "#ff8a65"}" stroke="#15151a" stroke-width="3"/>
        <text x="58" y="${level - 18}" font-size="14" font-weight="800" fill="#c9d4ff">평균</text><text x="58" y="${level + 10}" font-size="34" font-weight="900" fill="#fff">${T}℃</text>
      </g>
      <g transform="translate(16,${H - 64})"><rect width="${Math.max(220, names[lv].length * 15 + 30)}" height="48" rx="12" fill="#fff" stroke="#15151a" stroke-width="3"/>
        <text x="16" y="31" font-size="18" font-weight="900" fill="#15151a">${names[lv]}</text></g>
      <g transform="translate(470,26)" font-size="14" font-weight="800">
        <text fill="#ffb59e">↗ 우주로 나가는 열: ${out}</text>
        <text y="22" fill="#ff8b8b">↩ 담요가 돌려보낸 열: ${back}</text>
        ${lv === 0 ? `<text y="48" fill="#fff">🌕 달(대기 거의 없음)</text><text y="68" fill="#fff">낮 100℃↑ 밤 −100℃↓</text>` : ""}</g>
    </svg>`;
  }

  /* ================================================================
     CHAPTER 3 · 1.5℃, 생존의 마지노선
     ================================================================ */
  const SR15 = [
    { k: "5년에 한 번 이상 극심한 폭염을 겪는 세계 인구", v: [14, 37], f: x => x + "%", max: 40 },
    { k: "사라지는 산호초", v: [80, 99], f: (x, i) => i ? "99% 이상" : "70~90%", max: 100 },
    { k: "여름에 북극 바다 얼음이 모두 녹는 해", s: "100년 동안", v: [1, 10], f: x => x + "번", max: 10 },
    { k: "서식지 절반 이상을 잃는 곤충", s: "조사한 종 가운데", v: [6, 18], f: x => x + "%", max: 20 },
    { k: "서식지 절반 이상을 잃는 식물", s: "조사한 종 가운데", v: [8, 16], f: x => x + "%", max: 20 },
    { k: "서식지 절반 이상을 잃는 척추동물", s: "조사한 종 가운데", v: [4, 8], f: x => x + "%", max: 20 },
  ];
  const BUDGET = { gt: 130, from: Date.UTC(2025, 0, 1), perYear: 42 };

  const ch3 = {
    html() {
      return `
      ${hero("ch3", "CHAPTER 3 · THE LINE", "1.5℃, 생존의 마지노선", "고작 1.5℃가 왜 그렇게 중요할까요? 평균 기온의 진짜 의미를 알고, 1.5℃와 2℃의 차이를 데이터로 비교해 봅시다.", ["🌡️ 평균 기온의 의미", "⚖️ 1.5℃ vs 2℃", "⏰ 기후 시계"])}

      ${step("3-1", "'연평균 기온이 1℃ 올랐다'의 진짜 의미", "우리가 흔히 하는 오해를 바로잡아 봅시다.")}
      <div class="bento">
        <div class="card span-5 reading tint"><h3>🤔 1℃쯤이야, 별것 아니지 않나요?</h3>
          <p>오늘이 어제보다 1℃ 더운 것은 거의 느껴지지 않아요. 하지만 '지구 평균 기온'은 <b>지구 전체의 바다, 육지, 공기</b>의 온도를 1년 내내 모두 합쳐 평균을 낸 값이에요.</p>
          <p>바다는 원래 쉽게 뜨거워지지 않고, 겨울에는 추운 날도 많아요. 그런데도 1년 평균이 1℃ 올랐다는 것은 지구 전체가 <b>어마어마하게 많은 열</b>을 품게 되었다는 뜻이에요.</p>
          <div class="facts">
            <div class="fact"><b>❄️ 약 6℃</b><span>약 2만 년 전 빙하기는 지금보다 평균 6℃쯤 낮았을 뿐인데, 북아메리카와 북유럽이 두꺼운 얼음으로 덮였어요.</span></div>
            <div class="fact"><b>🌊 91%</b><span>늘어난 열의 대부분은 바다가 품어요. 그래서 바닷물이 따뜻해지고 부피가 커져요.</span></div>
            <div class="fact"><b>🤒 36.5 → 37.5℃</b><span>내 몸도 평균 체온이 1℃만 올라도 '열이 난다'고 해요.</span></div>
          </div>
          <p class="src">출처: IPCC AR6 제1실무그룹 보고서(2021) — 마지막 빙하기 최성기 약 5~7℃ 낮음, 1971–2018년 늘어난 열의 91%를 바다가 흡수</p>
          ${resHTML("read_1c", "더 알아보기 · 1℃가 왜 무서운지 영상으로 확인해요")}</div>
        <div class="span-7 stack" style="gap:16px">
          ${UI.blanks("c3_avg", "지구 전체의 {0}, {1}, {2} 온도를 모두 합쳐 평균을 냈더니 1℃가 높아졌다는 뜻이다.", ["바다|해양", "육지|땅", "공기|대기"], { title: "빈칸에 알맞은 단어를 채워 보세요.", anyOrder: true })}
          ${UI.long("c3_meaning", { label: "바다는 원래 쉽게 뜨거워지지 않고, 겨울에는 추운 날도 많습니다. 그런데도 1년 전체 평균 기온이 1℃나 올랐다는 것은 지구가 어떻게 변했다는 뜻인가요?", rows: 3 })}
        </div>
      </div>

      ${step("3-2", "왜 하필 1.5℃가 '마지노선'일까?", "'마지노선'은 더 이상 물러설 수 없는 마지막 방어선이라는 뜻이에요. 세계가 1.5℃를 그 선으로 정한 까닭을 알아봐요.")}
      <div class="why15">
        <div class="card" style="background:var(--c2-soft)"><span class="num">1</span><h3>🤝 전 세계의 약속, 파리협정</h3>
          <p>2015년 프랑스 파리에 모인 195개 나라는 지구 기온 상승을 산업화 이전보다 <b>2℃보다 훨씬 낮게</b> 유지하고, <b>1.5℃까지로 막도록 노력</b>하자고 약속했어요.</p></div>
        <div class="card" style="background:var(--c3-soft)"><span class="num">2</span><h3>📑 과학자들의 경고, IPCC 보고서</h3>
          <p>2018년 전 세계 과학자들은 1.5℃와 2℃의 피해가 <b>생각보다 훨씬 크게 차이 난다</b>고 발표했어요. 1.5℃를 지키려면 2030년까지 CO₂를 2010년보다 약 <b>45% 줄이고</b>, 2050년 무렵 <b>'순배출 0(탄소중립)'</b>에 도달해야 해요.</p></div>
        <div class="card" style="background:var(--c1-soft)"><span class="num">3</span><h3>🪑 되돌릴 수 없는 '티핑 포인트'</h3>
          <p>의자를 뒤로 기울이다 어느 순간 넘어지면 되돌릴 수 없지요? 기온이 오를수록 <b>빙하가 무너지고 산호초가 사라지는 것</b>처럼 한번 시작되면 멈추기 어려운 변화가 일어날 위험이 커져요. 과학자들은 1.5℃를 넘으면 이 위험이 크게 높아진다고 경고해요.</p></div>
      </div>
      <div class="card flat" style="padding:16px 18px">${resHTML("read_15", "더 알아보기 · 1.5℃가 왜 중요한지 뉴스와 자료로 확인해요")}
        <p class="src" style="margin-top:8px">출처: 파리협정 제2조(2015), IPCC 「지구온난화 1.5℃ 특별보고서」(2018) 정책결정자를 위한 요약 C.1, Armstrong McKay 외(2022) Science</p></div>

      <div class="card viz">
        <div class="viz-head"><div><span class="tag data">실제 관측 데이터</span><h3 style="margin-top:6px">🚧 우리는 1.5℃ 선에 얼마나 가까워졌을까?</h3>
          <p class="desc">한 해의 값은 오르락내리락해요. 과학자들은 <b>20년 평균</b>으로 지구 온난화 수준을 판단해요. 두 가지를 바꿔 보며 비교해 보세요.</p></div>
          <div class="seg" id="avgMode"><button data-v="1" aria-pressed="true">한 해 값</button><button data-v="20" aria-pressed="false">20년 평균</button></div></div>
        <div class="tiles" id="lineTiles"></div>
        <div id="lineChart"></div>
        <div class="legend"><span><i class="sw line" style="background:#e34948;width:22px"></i>한 해 값</span><span><i class="sw line" style="background:#15151a;width:22px"></i>20년 평균 (한 해 값 화면에서는 회색)</span><span><i class="sw line" style="background:#c42b2b;width:22px"></i>1.5℃ · 2℃ 선</span></div>
        <div class="controls">${rangeHTML("lineYear", "📍 살펴볼 연도", 1870, D().temp.years.at(-1), 1, D().temp.years.at(-1))}</div>
        <p class="src">출처: HadCRUT5 5.1.0.0 (1850–1900년 평균 = 0℃). 20년 평균은 선택한 해까지 20년의 평균이에요.</p>
      </div>
      ${UI.choice("c3_long", ["그렇다", "아니다, 오랜 기간의 평균을 더 확인해야 한다"], { label: "2024년 한 해의 기온이 1.5℃를 넘었어요. 그렇다면 지구 온난화도 1.5℃를 넘은 걸까요?" })}

      ${step("3-3", "1℃가 바꾸는 사계절", "기온이 1℃ 오르면 사계절의 모습은 어떻게 달라질까요?")}
      <div class="bento">
        <div class="q span-7" data-qid="c3_season">
          <div class="q-title"><span class="qi">Q</span><span>기온이 1℃ 오르면 사계절의 모습은 어떻게 달라질까요? 알맞게 연결해 보세요.</span></div>
          <div class="q-hint">㉠ 폭염이 더 자주, 더 오래, 더 심하게 나타나요. ㉡ 추운 날이 줄고, 이상하게 따뜻한 날이 늘어요. ㉢ 선선해야 할 날도 더워져요. ㉣ 시원해야 할 때도 늦게까지 더워요.</div>
          <div class="match">${[["봄", "#c7f0d0"], ["여름", "#ffd0c2"], ["가을", "#ffe6a8"], ["겨울", "#d6e9ff"]].map(([s, c]) => `<div class="match-row"><span class="season" style="background:${c}">${s}</span>
            <select data-q="c3_season" data-key="${s}"><option value="">— 골라 주세요 —</option><option value="㉠">㉠ 폭염이 더 자주, 더 오래, 더 심하게</option><option value="㉡">㉡ 추운 날이 줄고, 이상하게 따뜻한 날이 늘어</option><option value="㉢">㉢ 선선해야 할 날도 더워져</option><option value="㉣">㉣ 시원해야 할 때도 늦게까지 더워</option></select></div>`).join("")}</div>
          ${resHTML("c3_season")}
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn small" data-check="c3_season">정답 확인</button><div class="feedback" data-fb="c3_season"></div></div>
        </div>
        <div class="span-5 stack" style="gap:16px">
          ${UI.blanks("c3_define", "기온 1℃ 상승은 단순히 날씨가 조금 더워진 정도가 아니라, {0}의 모습까지 달라질 만큼 큰 변화입니다.", ["계절|사계절"], { title: "지구의 평균 기온 1℃ 상승을 한마디로 정의한다면?" })}
        </div>
      </div>
      <div class="bento">
        <div class="span-6">${UI.long("c3_fever", { label: "감기에 걸려 체온이 평소보다 1℃ 정도 높았던 적이 있나요? 그때 내 몸이 어떻게 느껴졌는지 떠올려 봅시다.", hint: "예) 머리가 띵함, 입맛이 없음, 금방 지침 등 구체적인 기분" })}</div>
        <div class="span-6">${UI.long("c3_earthbody", { label: "지구의 온도가 1℃ 올랐을 때, 지구가 느낄 '몸 상태'를 상상해서 써 보세요." })}</div>
      </div>

      ${step("3-4", "1.5℃와 2℃, 고작 0.5℃의 차이?", "슬라이더를 움직여 1.5℃와 2℃일 때의 세상을 비교해 보세요.")}
      <div class="card viz">
        <div class="viz-head"><div><span class="tag data">IPCC 보고서 데이터</span><h3 style="margin-top:6px">⚖️ 0.5℃가 만드는 차이</h3></div>
          <div class="pill" id="cmpPill" style="font-size:18px;padding:6px 16px"></div></div>
        <div class="controls">${rangeHTML("cmpT", "🌡️ 지구 온난화 수준", 1.5, 2, 0.5, 1.5)}</div>
        <div class="cmp" id="cmp"></div>
        <p class="src">출처: IPCC 「지구온난화 1.5℃ 특별보고서」(2018) 정책결정자를 위한 요약 B.3–B.4 및 3장. 산호초는 70~90%(1.5℃), 99% 이상(2℃) 감소 전망이에요.</p>
      </div>
      ${UI.long("c3_why15", { label: "과학자들이 지구 기온 상승을 '1.5℃ 이내'로 막아야 한다고 말하는 이유는 무엇인가요?" })}
      ${UI.choice("c3_scary", ["폭염이 더 심해짐", "폭우와 가뭄", "산불 발생", "해수면 상승", "계절의 변화", "공기 정체"], { label: "지구의 평균 기온이 1.5℃ 상승했을 때 일어나는 변화 중, 가장 무섭게 느껴지는 것은 무엇인가요?" })}
      ${UI.long("c3_scary_why", { label: "그 변화가 가장 무섭게 느껴지는 이유를 적어 봅시다.", rows: 3 })}

      ${step("3-5", "기후 시계 확인하기", "지금처럼 온실가스를 내뿜으면, 1.5℃ 선을 넘기까지 남은 시간은?")}
      <div class="bento">
        <div class="span-7 stack" style="gap:16px">
          <div class="clock" id="clock"></div>
          <div class="controls">${rangeHTML("cut", "✂️ 지금부터 해마다 배출량을 줄인다면?", 0, 15, 1, 0)}</div>
        </div>
        <div class="card span-5 reading tint"><h3>⏰ 기후 시계는 어떻게 계산할까?</h3>
          <p>과학자들은 1.5℃를 넘지 않으려면(50% 확률) 2025년부터 인류가 내뿜을 수 있는 CO₂가 약 <b>1,300억 톤</b>밖에 남지 않았다고 계산했어요. 이것을 <b>'남은 탄소 예산'</b>이라고 해요.</p>
          <p>그런데 인류는 해마다 약 <b>420억 톤</b>을 내뿜고 있어요. 남은 예산을 지금 속도로 쓰면 얼마나 버틸 수 있을지 계산한 것이 기후 시계예요.</p>
          <p>📌 뉴스에서는 '1.5℃까지 몇 년 남았다'는 숫자가 조금씩 달라요. 어떤 자료와 계산 방법을 썼는지에 따라 달라지기 때문이에요.</p>
          <p class="src">출처: Forster 외(2025), Indicators of Global Climate Change 2024 — 남은 탄소 예산 130 GtCO₂(2025년 1월 기준), Global Carbon Budget(2025). 계산을 단순화한 교육용 모형이에요. <a href="https://climateclock.world/" target="_blank" rel="noopener">Climate Clock ↗</a></p>
        </div>
      </div>
      <div class="bento">
        <div class="span-5">${UI.short("c3_clock", { label: "기후 시계가 보여 주는, 1.5℃까지 남은 시간을 기록해 보세요.", hint: "⏺ 아래 단추를 누르면 지금 시계의 시간이 기록돼요.", after: `<button class="btn small" id="clockRec" style="align-self:flex-start">⏺ 지금 시간 기록하기</button>` })}</div>
        <div class="span-7">${UI.long("c3_clock_feel", { label: "지금도 계속 숫자가 줄어들고 있는 기후 시계를 보며 느낀 점을 적어 보세요." })}</div>
      </div>`;
    },
    mount(v) {
      const d = D(), tp = tempPts();
      let mode = 1, year = d.temp.years.at(-1);
      const avg20 = movingAvg(tp, 20);
      const lc = C.xy($("#lineChart", v), { height: 340, x: { domain: [1850, d.temp.years.at(-1)] }, y: { label: "1850–1900년 평균과의 차이(℃)", max: 2.2, fmt: x => sign(x) + "℃", tick: x => (x > 0 ? "+" : "") + x.toFixed(1) }, series: [],
        hlines: [{ y: 1.5, label: "1.5℃ 마지노선", color: "#c42b2b", fill: "#ffe1e1" }, { y: 2, label: "2℃", color: "#7a1010", fill: "#fff" }] });
      function redraw() {
        const data = mode === 1 ? tp : avg20;
        lc.update({ series: [{ name: mode === 1 ? "한 해 값" : "20년 평균", color: mode === 1 ? "#e34948" : "#15151a", width: mode === 1 ? 2.5 : 4.5, data }, ...(mode === 1 ? [{ name: "20년 평균", color: "#cfcac0", width: 3, data: avg20, noTip: false }] : [])], vlines: [{ x: year, label: `📍 ${year}년`, fill: "#ffd23f", textColor: "#15151a" }] });
        const one = tp.find(p => p[0] === year)[1], a20 = (avg20.find(p => p[0] === year) || [0, NaN])[1];
        $("#lineTiles", v).innerHTML = `<div class="tile"><span class="k">${year}년 한 해 값</span><span class="v" style="color:${one >= 1.5 ? "#c42b2b" : "inherit"}">${sign(one)}<small>℃</small></span></div>
          <div class="tile"><span class="k">${year}년까지 20년 평균</span><span class="v">${isNaN(a20) ? "—" : sign(a20)}<small>℃</small></span></div>
          <div class="tile" style="background:var(--c3-soft)"><span class="k">20년 평균 기준, 1.5℃까지</span><span class="v">${isNaN(a20) ? "—" : (1.5 - a20).toFixed(2)}<small>℃ 남음</small></span></div>`;
      }
      seg($("#avgMode", v), x => { mode = +x; redraw(); });
      bindRange($("#lineYear", v), y => { year = y; redraw(); }, y => y + "년");
      window.ON_ANSWER = id => {
        if (id === "c3_long") {
          const a = window.S.answers.c3_long;
          window.showFeedback("c3_long", a !== "그렇다", a === "그렇다" ? "🤔 한 해의 값은 엘니뇨 같은 자연 현상 때문에 오르내려요. '20년 평균' 버튼을 눌러 비교해 보세요." : "🎉 맞아요! 한 해의 변동과 여러 해의 장기 평균은 구분해야 해요. 20년 평균은 아직 1.5℃ 아래예요.");
        }
      };
      if (window.S.answers.c3_long) window.ON_ANSWER("c3_long");
      CHECKERS.c3_season = o => {
        const right = { 봄: "㉢", 여름: "㉠", 가을: "㉣", 겨울: "㉡" };
        o = o || {};
        const n = Object.keys(right).filter(k => o[k] === right[k]).length;
        return n === 4 ? { ok: true, msg: "🎉 모두 맞았어요! 1℃는 사계절의 모습까지 바꿔요." } : { ok: false, msg: `🤔 4개 중 ${n}개가 맞아요. 각 계절이 원래 어떤 날씨여야 하는지 떠올려 보세요.` };
      };

      bindRange($("#cmpT", v), t => {
        const i = t >= 2 ? 1 : 0;
        $("#cmpPill", v).textContent = i ? "🔥 2℃ 상승한 세상" : "🌡️ 1.5℃ 상승한 세상";
        $("#cmp", v).innerHTML = SR15.map(r => `<div class="cmp-row"><div class="lab">${r.k}${r.s ? `<small>${r.s}</small>` : ""}</div>
          <div class="cmp-bar"><i style="width:${r.v[i] / r.max * 100}%;background:${i ? "#c42b2b" : "#ff8a65"}"></i><span>${r.f(r.v[i], i)}${i ? ` <small style="font-weight:700">(1.5℃: ${r.f(r.v[0], 0)})</small>` : ""}</span></div></div>`).join("");
      }, t => t.toFixed(1) + "℃");

      let cut = 0, timer;
      const clock = $("#clock", v);
      function remain(now) {
        const yrs = (now - BUDGET.from) / (365.25 * 864e5);
        const left = BUDGET.gt - BUDGET.perYear * yrs;
        if (cut === 0) return { t: left / BUDGET.perYear * 365.25 * 864e5, left };
        const k = -Math.log(1 - cut / 100), z = k * left / BUDGET.perYear;
        if (z >= 1) return { t: Infinity, left };
        return { t: -Math.log(1 - z) / k * 365.25 * 864e5, left };
      }
      function tick() {
        const now = Date.now(), r = remain(now);
        if (!isFinite(r.t)) {
          clock.className = "clock safe";
          clock.innerHTML = `<div class="lbl">🎉 1.5℃를 지킬 수 있어요!</div><div class="digits"><div class="unit"><b>∞</b><span>남은 예산 안에서 멈춤</span></div></div><div class="note">해마다 ${cut}%씩 줄이면 남은 탄소 예산(약 ${(r.left * 10).toFixed(0)}억 톤)을 다 쓰기 전에 배출이 충분히 줄어들어요. 실제로는 해마다 이만큼 줄이는 것이 아주 어려워요.</div>`;
          return;
        }
        clock.className = "clock";
        let s = Math.max(0, r.t / 1000);
        const Y = Math.floor(s / (365.25 * 86400)); s -= Y * 365.25 * 86400;
        const Dd = Math.floor(s / 86400); s -= Dd * 86400;
        const h = Math.floor(s / 3600); s -= h * 3600;
        const m = Math.floor(s / 60); s = Math.floor(s - m * 60);
        const end = new Date(now + r.t);
        clock._txt = `${Y}년 ${Dd}일 ${h}시간 ${m}분 ${s}초`;
        clock.innerHTML = `<div class="lbl">⏰ ${cut ? `해마다 ${cut}%씩 줄이면` : "지금 속도로 내뿜으면"}, 1.5℃까지 남은 시간</div>
          <div class="digits">${[[Y, "년"], [Dd, "일"], [h, "시간"], [m, "분"], [s, "초"]].map(([n, u]) => `<div class="unit"><b>${String(n).padStart(2, "0")}</b><span>${u}</span></div>`).join("")}</div>
          <div class="note">남은 탄소 예산 약 <b style="color:#fff">${Math.max(0, r.left * 10).toFixed(0)}억 톤</b> · 예상 시점 <b style="color:#fff">${end.getFullYear()}년 ${end.getMonth() + 1}월</b>${cut ? " · 줄이지 않을 때보다 시간이 늘어났어요!" : ""}</div>`;
      }
      bindRange($("#cut", v), x => { cut = x; tick(); }, x => x ? `−${x}%/년` : "그대로");
      timer = setInterval(() => { if (!document.body.contains(clock)) { clearInterval(timer); return; } tick(); }, 1000);
      $("#clockRec", v).addEventListener("click", () => {
        const inp = $('[data-q="c3_clock"]', v);
        inp.value = (cut ? `(매년 ${cut}% 감축 시) ` : "") + (clock._txt || "1.5℃를 지킬 수 있음");
        window.setAnswer("c3_clock", inp.value);
        toast("⏺ 지금 시간을 기록했어요.");
      });
    },
  };

  /* ================================================================
     CHAPTER 4 · 2050년, 미래 예측하기
     ================================================================ */
  // IPCC AR6 WGI SPM 표 SPM.1 — [중심값, 하한, 상한] (2021–2040, 2041–2060, 2081–2100)
  const SSP = [
    { id: "SSP1-1.9", e: "🌱", n: "매우 낮은 배출", c: "#00a3c4", v: [[1.5, 1.2, 1.7], [1.6, 1.2, 2.0], [1.4, 1.0, 1.8]], d: "전 세계가 지금 당장 힘을 모아 2050년 무렵 CO₂ 순배출을 0으로 만드는 길. 기온은 1.5℃ 근처에서 멈추고 이번 세기 말에는 조금 내려가요." },
    { id: "SSP1-2.6", e: "🌿", n: "낮은 배출", c: "#173c66", v: [[1.5, 1.2, 1.8], [1.7, 1.3, 2.2], [1.8, 1.3, 2.4]], d: "재생에너지로 빠르게 바꾸고 2070년 무렵 순배출 0에 도달하는 길. 2℃ 아래로 지킬 수 있어요." },
    { id: "SSP2-4.5", e: "⚖️", n: "중간 배출", c: "#f79420", v: [[1.5, 1.2, 1.8], [2.0, 1.6, 2.5], [2.7, 2.1, 3.5]], d: "지금과 비슷하게 조금씩만 줄이는 길. 배출이 이번 세기 중반까지 비슷하게 이어져요." },
    { id: "SSP3-7.0", e: "🏭", n: "높은 배출", c: "#e71d25", v: [[1.5, 1.2, 1.8], [2.1, 1.7, 2.6], [3.6, 2.8, 4.6]], d: "나라마다 자기 나라만 생각하며 협력하지 않는 길. 배출이 계속 늘어나요." },
    { id: "SSP5-8.5", e: "🔥", n: "매우 높은 배출", c: "#951b1e", v: [[1.6, 1.3, 1.9], [2.4, 1.9, 3.0], [4.4, 3.3, 5.7]], d: "화석연료를 마음껏 쓰며 빠르게 성장하는 길. 2050년까지 배출이 두 배 가까이 늘어나요." },
  ];
  const YRS = [2015, 2030, 2050, 2090];
  const at = (s, y, k = 0) => { const pts = [1.1, ...s.v.map(x => x[k])]; for (let i = 0; i < 3; i++) if (y <= YRS[i + 1]) { const t = (y - YRS[i]) / (YRS[i + 1] - YRS[i]); const a = i === 0 && k ? 1.1 : pts[i], b = pts[i + 1]; return a + (b - a) * t; } return pts[3]; };
  // IPCC AR6 SPM 그림 SPM.6 — 1850–1900년 대비 발생 빈도 배수 (지구 온난화 1, 1.5, 2, 4℃)
  const IMPACT = [
    { k: "50년에 한 번 오던 극한 폭염", ic: "🥵", lv: [4.8, 8.6, 13.9, 39.2], base: 50, unit: "50년 동안" },
    { k: "10년에 한 번 오던 극한 폭염", ic: "☀️", lv: [2.8, 4.1, 5.6, 9.4], base: 10, unit: "10년 동안" },
    { k: "10년에 한 번 오던 극한 폭우", ic: "🌧️", lv: [1.3, 1.5, 1.7, 2.7], base: 10, unit: "10년 동안" },
    { k: "10년에 한 번 오던 농업 가뭄", ic: "🏜️", lv: [1.7, 2.0, 2.4, 4.1], base: 10, unit: "10년 동안" },
  ];
  const mult = (lv, T) => { const L = [1, 1.5, 2, 4]; if (T <= 1) return lv[0]; for (let i = 0; i < 3; i++) if (T <= L[i + 1]) return lv[i] + (lv[i + 1] - lv[i]) * (T - L[i]) / (L[i + 1] - L[i]); return lv[3]; };

  const ch4 = {
    html() {
      return `
      ${hero("ch4", "CHAPTER 4 · FUTURE", "2050년, 우리가 살게 될 세상", "온실가스를 얼마나 내뿜느냐에 따라 미래는 달라져요. 시나리오별 데이터를 분석하고, 2050년 우리 사회의 모습을 예측하는 글을 써 봅시다.", ["🛣️ 시나리오 비교", "🌪️ 극한 기후 예측", "✍️ 미래 사회 예측 글쓰기"])}

      ${step("4-1", "온실가스 배출 시나리오 탐구하기", "시나리오를 고르고 연도를 움직여 보세요. 시나리오는 '예언'이 아니라 '우리가 선택하는 길'에 따른 전망이에요.")}
      <div class="scen-grid" id="scenBtns">${SSP.map((s, i) => `<button class="scen" data-s="${i}" style="--sc:${s.c}22" aria-pressed="false"><span class="e">${s.e}</span><b>${s.n}</b><small>${s.id}</small></button>`).join("")}</div>
      <div class="card viz">
        <div class="viz-head"><div><span class="tag data">IPCC 보고서 데이터</span><h3 style="margin-top:6px" id="scenTitle"></h3><p class="desc" id="scenDesc"></p></div></div>
        <div class="tiles" id="scenTiles"></div>
        <div id="scenChart"></div>
        <div class="legend">${SSP.map(s => `<span><i class="sw line" style="background:${s.c};width:22px"></i>${s.e} ${s.n}</span>`).join("")}</div>
        <div class="controls">${rangeHTML("scenYear", "📍 미래의 어느 해?", 2025, 2090, 1, 2050)}</div>
        <p class="src">출처: IPCC AR6 제1실무그룹 정책결정자를 위한 요약(2021) 표 SPM.1. 점은 20년 평균(2021–2040, 2041–2060, 2081–2100)을 가운데 연도에 놓은 값이고, 사이를 잇는 선과 띠(매우 가능성 높은 범위)는 교육용으로 연결한 것이에요.</p>
      </div>
      <div class="card viz">
        <div class="viz-head"><div><span class="tag data">IPCC 보고서 데이터</span><h3 style="margin-top:6px">🌪️ 그해에는 극한 기후가 얼마나 자주 찾아올까?</h3>
          <p class="desc" id="impDesc"></p></div></div>
        <div class="mult-grid" id="impact"></div>
        <p class="src">출처: IPCC AR6 제1실무그룹 정책결정자를 위한 요약(2021) 그림 SPM.6 — 1850–1900년 기후에서의 빈도 대비 배수(중앙값). 1, 1.5, 2, 4℃ 사이 값은 교육용으로 이어서 계산했어요.</p>
      </div>
      <div class="bento">
        <div class="span-6">${UI.long("c4_safe", { label: "시나리오 중 가장 안전한 미래에 가까운 것은 무엇인지 쓰고, 어떤 특징을 가진 미래인지 정리해 보세요." })}</div>
        <div class="span-6">${UI.long("c4_danger", { label: "시나리오 중 가장 위험한 미래에 가까운 것은 무엇인지 쓰고, 어떤 특징을 가진 미래인지 정리해 보세요." })}</div>
      </div>

      ${step("4-2", "우리 식탁과 동네의 미래", "기후변화는 우리가 먹는 과일과 사는 동네도 바꿔요.")}
      <div class="bento">
        <div class="card span-6 reading tint"><h3>🍎 미래 과일 지도</h3>
          <p>사과·배·복숭아는 서늘한 기후를 좋아하는 과일이에요. 농촌진흥청은 온실가스를 지금처럼 많이 내뿜으면 <b>사과를 재배하기 좋은 땅이 빠르게 줄어, 2070년대에는 강원도 일부 산간 지역에서만</b> 재배할 수 있을 것이라고 예측했어요.</p>
          <p>배와 복숭아도 재배하기 좋은 땅이 크게 줄어들고, 반대로 단감·감귤처럼 따뜻한 곳에서 자라는 과일은 재배 지역이 북쪽으로 넓어질 것으로 예측돼요.</p>
          <p class="src">출처: 농촌진흥청 국립원예특작과학원, 기후변화에 따른 주요 과일 재배지 변동 예측(2022)</p></div>
        <div class="span-6 stack" style="gap:16px">
          ${UI.long("c4_fruit", { label: "사과, 배, 복숭아를 점점 재배하기 어려워지는 이유는 무엇인가요?", rows: 3 })}
          ${UI.short("c4_fruit2", { label: "사과, 배, 복숭아처럼 미래 과일 지도에서 곧 사라질 수도 있는 과일에는 또 어떤 것들이 있을까요?", hint: "🔍 검색해서 찾아보기!" })}
        </div>
      </div>
      <div class="card">
        <a class="linkcard" href="https://coastal.climatecentral.org/" target="_blank" rel="noopener"><span class="ico">🗺️</span><span><b>해수면 상승 & 침수 예측 지도 열기 ↗</b><br><span class="muted">Climate Central 'Coastal Risk Screening Tool' — 연도를 조정하며 우리 동네와 자주 가는 장소를 찾아보세요.</span></span></a>
        <div class="q-hint" style="margin-top:12px">🧭 <b>지도 보는 방법</b> ① 지도를 열고 연도(Year)를 <b>2050</b>으로 맞춰요. ② 인천·부산·서해안처럼 바다와 가까운 곳을 확대해요. ③ <b>빨간색</b>으로 칠해진 땅은 바닷물이 높아져 <b>해마다 한 번쯤 물에 잠길 위험</b>이 있는 곳이에요. ④ 연도를 2100으로 바꾸면 어떻게 달라지는지도 비교해 봐요.</div>
      </div>
      <div class="bento">
        <div class="span-5">${UI.blanks("c4_sea", "지구가 뜨거워져 남극과 북극의 얼음이 녹으면 {0}이(가) 높아져요.", ["해수면|바다높이|바닷물높이|해수면높이"], { title: "무엇이 높아질까요?" })}</div>
        <div class="span-7">${UI.short("c4_place", { label: "침수 예측 지도에서 2050년에 빨간색(물에 잠길 위험)으로 표시된 장소를 하나 찾아 이름을 적어 보세요.", ph: "예) 인천국제공항" })}</div>
        <div class="span-12">${UI.long("c4_change", { label: "해수면이 높아지면 그 장소는 어떻게 될까요? 어느 부분이 물에 잠기는지, 그곳을 이용하는 사람들의 생활은 어떻게 달라질지 써 보세요.", hint: "💡 2050년과 2100년 지도를 비교해 보세요. 예) 활주로가 잠기면 비행기는? 집이 잠기면 사람들은?", ph: "예) 2050년에는 ○○의 바닷가 쪽이 빨갛게 표시되었다. 물에 잠기면 …" })}</div>
      </div>

      ${step("4-3", "✍️ 2050년, 미래 사회 예측하기", "데이터를 근거로, 두 시나리오의 2050년 우리 사회 모습을 예측하는 글을 써 봅시다. 이 글은 선생님께 제출돼요.")}
      <div class="bento">
        ${[["c4_low", 0, "#e0f6e3"], ["c4_high", 4, "#ffe1e1"]].map(([id, si, bg]) => {
          const s = SSP[si], T = at(s, 2050);
          return `<div class="card span-6 writer" style="background:${bg}">
            <div class="viz-head"><div><span class="pill">${s.e} ${s.id} · ${s.n}</span><h3 style="margin-top:8px">2050년 우리 사회는?</h3></div>
              <div class="tile" style="padding:8px 14px"><span class="k">2050년 기온</span><span class="v" style="font-size:28px">+${T.toFixed(1)}<small>℃</small></span></div></div>
            <div class="q-hint">📊 이 길에서 2050년에는 50년에 한 번 오던 폭염이 약 <b>${mult(IMPACT[0].lv, T).toFixed(0)}번</b>, 10년에 한 번 오던 폭우가 약 <b>${mult(IMPACT[2].lv, T).toFixed(1)}번</b> 찾아와요.</div>
            <div class="prompts">${["🏫 학교생활은", "🍎 우리 식탁에는", "🌡️ 여름 날씨는", "🐝 동물과 자연은", "🏥 사람들의 건강은", "🏠 우리 동네는", "💼 사람들의 직업은"].map(p => `<button data-prompt="${p}" data-target="${id}">${p}…</button>`).join("")}</div>
            <textarea data-q="${id}" placeholder="2050년, 나는 ○○살이 되었다. …"></textarea>
            <div class="q-foot"><span>문장 시작 단추를 눌러 써도 좋아요.</span><span class="count" data-count="${id}">0자</span></div>
          </div>`;
        }).join("")}
      </div>
      ${UI.long("c4_evidence", { label: "내 예측의 근거가 된 데이터는 무엇인가요? (그래프·숫자를 들어 써 보세요)", ph: "예) 매우 높은 배출 시나리오에서는 2050년 기온이 +2.4℃로, 50년에 한 번 오던 폭염이 약 20번 찾아온다." })}
      ${UI.long("c4_choice", { label: "우리가 만들고 싶은 2050년은 어떤 모습인가요? 그 미래를 위해 지금 우리가 할 수 있는 일을 써 봅시다." })}`;
    },
    mount(v) {
      let si = 0, year = 2050;
      const series = SSP.map(s => ({ name: s.id, color: s.c, width: 3, data: [2015, ...range(2016, 2090)].map(y => [y, +at(s, y).toFixed(3)]), dots: YRS.slice(1).map((y, i) => [y, s.v[i][0]]) }));
      function range(a, b) { const o = []; for (let y = a; y <= b; y++) o.push(y); return o; }
      const chart = C.xy($("#scenChart", v), { height: 380, endLabels: true, top: 30, x: { domain: [2015, 2090] }, y: { min: 0.8, max: 5.0, label: "1850–1900년 대비 지구 기온 상승(℃)", fmt: x => "+" + x.toFixed(1) + "℃", tick: x => "+" + x.toFixed(1) }, series,
        hlines: [{ y: 1.5, label: "1.5℃", color: "#c42b2b", fill: "#ffe1e1" }, { y: 2, label: "2℃", color: "#7a1010" }] });
      function redraw() {
        const s = SSP[si], T = at(s, year), lo = at(s, year, 1), hi = at(s, year, 2);
        $$(".scen", v).forEach(b => b.setAttribute("aria-pressed", +b.dataset.s === si));
        $("#scenTitle", v).textContent = `${s.e} ${s.n} (${s.id})의 길`;
        $("#scenDesc", v).textContent = s.d;
        chart.update({
          series: series.map((x, i) => Object.assign({}, x, { dim: i !== si, width: i === si ? 5 : 2.5, dots: i === si ? x.dots : [] })).sort((a, b) => (a.dim ? 0 : 1) - (b.dim ? 0 : 1)),
          bands: [{ color: s.c, opacity: 0.18, lo: [2015, ...range(2016, 2090)].map(y => [y, at(s, y, 1)]), hi: [2015, ...range(2016, 2090)].map(y => [y, at(s, y, 2)]) }],
          vlines: [{ x: year, label: `📍 ${year}년`, fill: "#ffd23f", textColor: "#15151a" }],
        });
        $("#scenTiles", v).innerHTML = `<div class="tile" style="background:${s.c}22"><span class="k">${s.e} ${year}년 기온 상승(중심값)</span><span class="v">+${T.toFixed(1)}<small>℃</small></span><span class="d">가능성 높은 범위 +${lo.toFixed(1)} ~ +${hi.toFixed(1)}℃</span></div>
          <div class="tile"><span class="k">🌱 매우 낮은 배출과의 차이</span><span class="v">${sign(T - at(SSP[0], year), 1)}<small>℃</small></span></div>
          <div class="tile"><span class="k">🚧 1.5℃ 선과 비교</span><span class="v" style="font-size:26px">${T > 1.5 ? `${(T - 1.5).toFixed(1)}℃ 넘음` : "1.5℃ 이하"}</span></div>`;
        $("#impDesc", v).innerHTML = `<b>${s.e} ${s.n}</b>의 길에서 <b>${year}년</b>(약 +${T.toFixed(1)}℃)에는, 산업화 이전에 드물었던 극한 기후가 이만큼 자주 찾아와요.`;
        $("#impact", v).innerHTML = IMPACT.map(m => {
          const x = mult(m.lv, T), n = Math.round(x * 10) / 10, full = Math.floor(x);
          const cap = m.base === 50 ? 40 : 10;
          const icons = Array.from({ length: Math.min(cap, Math.ceil(x)) }, (_, i) => `<span>${m.ic}</span>`).join("") + (x > cap ? ` <b>…</b>` : "");
          return `<div class="mult"><div class="top"><h4>${m.ic} ${m.k}</h4><span class="x">${n}번</span></div>
            <div class="icons" aria-hidden="true">${icons}</div>
            <p>${m.unit} 원래 <b>1번</b> → 약 <b>${n}번</b> (${n.toFixed(1)}배)</p></div>`;
        }).join("");
      }
      $$(".scen", v).forEach(b => b.addEventListener("click", () => { si = +b.dataset.s; redraw(); }));
      bindRange($("#scenYear", v), y => { year = y; redraw(); }, y => y + "년");
    },
  };

  /* ================================================================
     마무리
     ================================================================ */
  const end = {
    html() {
      const S = window.S;
      const items = Object.values(S.Q).filter(q => q.ch !== "end");
      const fmt = v => Array.isArray(v) ? v.filter(Boolean).join(" · ") : (v && typeof v === "object") ? Object.entries(v).map(([k, x]) => `${k}→${x}`).join(", ") : (v || "");
      return `
      ${hero("end", "FINAL · REFLECTION", "오늘의 탐구를 돌아봐요", "기후변화의 심각성부터 2050년의 미래까지, 데이터로 탐구한 내용을 정리하고 나의 생각을 기록해 봅시다.", ["💡 알게 된 점", "💗 느낀 점", "📮 최종 제출"])}
      <div class="bento">
        <div class="span-6">${UI.long("e_learned", { label: "오늘 활동을 통해 새롭게 알게 된 점을 기록해 봅시다.", rows: 6 })}</div>
        <div class="span-6">${UI.long("e_felt", { label: "오늘 활동을 통해 느낀 점을 기록해 봅시다.", rows: 6 })}</div>
      </div>
      <div class="card">
        <div class="viz-head"><div><h3>📒 나의 탐구 기록 한눈에 보기</h3><p class="desc">빈 문항이 있으면 눌러서 해당 챕터로 가 보세요.</p></div></div>
        <div style="display:grid;gap:10px;margin-top:12px">
          ${S.chapters.filter(c => c.id !== "end").map(c => {
            const p = window.progressOf(c.id);
            return `<details ${p.n < p.total ? "open" : ""} style="border:2px solid var(--ink);border-radius:14px;padding:10px 14px;background:${c.soft}">
              <summary style="cursor:pointer;font-weight:900">${c.no}. ${esc(c.title)} — ${p.n}/${p.total} ${S.submitted[c.id] ? "✅ 제출함" : ""}</summary>
              <div style="display:grid;gap:8px;margin-top:10px">${items.filter(q => q.ch === c.id).map(q => {
                const a = fmt(S.answers[q.id]);
                return `<div style="background:#fff;border-radius:10px;padding:8px 12px;border:1.5px solid var(--line)"><div style="font-size:13.5px;font-weight:800;color:var(--ink-2)">${esc(q.label)}</div>
                  <div style="white-space:pre-wrap">${a ? esc(a) : `<button class="btn small" data-go="${c.id}">✏️ 아직 안 썼어요</button>`}</div></div>`;
              }).join("")}</div></details>`;
          }).join("")}
        </div>
      </div>`;
    },
  };

  window.CHAPTERS = { ch1, ch2, ch3, ch4, end };
})();
