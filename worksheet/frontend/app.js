/* 기후 탐험 학습지 — 앱 뼈대
   - Streamlit 양방향 컴포넌트 프로토콜(postMessage)로 Python과 통신
   - 답안은 이 기기(localStorage)에 즉시 저장, '제출하기'를 누르면 서버(Firebase)에 저장 */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const S = {
    student: null,          // {number, name}
    answers: {},
    submitted: {},          // {ch1: "2026-10-20T..."}
    chapter: "ch1",
    data: {},
    Q: {}, chapters: [],
    inStreamlit: window.parent !== window,
    connected: false,
  };
  window.S = S;

  /* ---------------- Streamlit 브리지 ---------------- */
  const pending = new Map();
  function post(type, extra) { window.parent.postMessage(Object.assign({ isStreamlitMessage: true, apiVersion: 1, type }, extra), "*"); }
  function request(payload, timeout = 15000) {
    if (!S.inStreamlit) return Promise.resolve({ ok: true, offline: true });
    const nonce = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    return new Promise(resolve => {
      const t = setTimeout(() => { pending.delete(nonce); resolve({ ok: false, error: "응답이 없어요. 인터넷 연결을 확인해 주세요." }); }, timeout);
      pending.set(nonce, r => { clearTimeout(t); resolve(r); });
      post("streamlit:setComponentValue", { value: Object.assign({ nonce }, payload), dataType: "json" });
    });
  }
  window.addEventListener("message", ev => {
    const d = ev.data;
    if (!d || d.type !== "streamlit:render") return;
    S.connected = true;
    const reply = d.args && d.args.reply;
    if (reply && pending.has(reply.nonce)) { const fn = pending.get(reply.nonce); pending.delete(reply.nonce); fn(reply); }
    if (d.args && d.args.mode) S.mode = d.args.mode;
    fitFrame();
  });
  function fitFrame() {
    if (!S.inStreamlit) return;
    let h = 900;
    try {
      const fe = window.frameElement;
      const top = fe ? fe.getBoundingClientRect().top : 70;
      h = window.parent.innerHeight - Math.max(0, top) - 6;
    } catch (e) { /* 다른 출처면 기본값 */ }
    post("streamlit:setFrameHeight", { height: Math.max(600, Math.round(h)) });
  }
  try { window.parent.addEventListener("resize", fitFrame); } catch (e) { }

  /* ---------------- 저장 ---------------- */
  const key = () => S.student ? `climate-ws:${S.student.number}:${S.student.name}` : null;
  let saveT;
  function saveLocal(fromServer) {
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      try { localStorage.setItem(key(), JSON.stringify({ answers: S.answers, submitted: S.submitted, t: Date.now() })); } catch (e) { }
      updateProgress();
    }, 300);
    if (!fromServer) scheduleSync();
  }

  /* 서버 자동 저장: 입력을 멈추고 2초 뒤 Firebase에 저장, 상태는 상단 단추에 표시 */
  const sync = { dirty: false, busy: false, timer: null, last: null, failed: false };
  function scheduleSync() {
    if (!S.student) return;
    sync.dirty = true; sync.failed = false;
    showSync();
    clearTimeout(sync.timer);
    sync.timer = setTimeout(syncNow, 2000);
  }
  async function syncNow() {
    clearTimeout(sync.timer);
    if (!S.student || sync.busy) return;
    if (!sync.dirty && sync.last) { showSync(); return; }
    sync.busy = true; sync.dirty = false; showSync();
    const r = await request({ action: "submit", chapter: S.chapter, student: S.student, answers: S.answers, submitted: S.submitted });
    sync.busy = false;
    if (r.ok) { sync.last = new Date(); sync.offline = !!r.offline; }
    else { sync.failed = true; sync.dirty = true; sync.timer = setTimeout(syncNow, 8000); }
    if (sync.dirty && !sync.failed) sync.timer = setTimeout(syncNow, 1000);
    showSync();
  }
  window.syncNow = syncNow;
  function showSync() {
    const b = $("#sync");
    if (!b) return;
    const hm = d => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    let txt, cls;
    if (sync.busy) { txt = "⏳ 저장 중…"; cls = "busy"; }
    else if (sync.failed) { txt = "⚠️ 저장 실패 · 다시 저장"; cls = "err"; }
    else if (sync.dirty) { txt = "✏️ 저장 대기 중"; cls = "wait"; }
    else if (sync.last) { txt = sync.offline ? `💾 이 기기에 저장 ${hm(sync.last)}` : `✅ 자동 저장됨 ${hm(sync.last)}`; cls = "ok"; }
    else { txt = "💾 저장하기"; cls = ""; }
    b.textContent = txt; b.className = "sync " + cls;
    b.title = "쓰는 내용은 2초마다 자동으로 저장돼요. 눌러서 바로 저장할 수도 있어요.";
  }
  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(key()) || "null"); } catch (e) { return null; }
  }
  function setAnswer(id, v) { S.answers[id] = v; saveLocal(); }
  window.setAnswer = setAnswer;

  function toast(msg, kind = "ok", ms = 2600) {
    const t = $("#toast");
    t.textContent = msg; t.className = "show " + kind;
    clearTimeout(t._h); t._h = setTimeout(() => t.className = "", ms);
  }
  window.toast = toast;

  /* ---------------- 문항 UI 조각 ---------------- */
  const label = id => (S.Q[id] && S.Q[id].label) || id;
  const UI = {
    long(id, o = {}) {
      return `<div class="q" data-qid="${id}">
        <div class="q-title"><span class="qi">Q</span><span>${o.label || esc(label(id))}</span></div>
        ${o.hint ? `<div class="q-hint">${o.hint}</div>` : ""}
        <textarea data-q="${id}" rows="${o.rows || 4}" placeholder="${esc(o.ph || "내 생각을 자유롭게 적어 보세요.")}"></textarea>
        <div class="q-foot"><span>${o.foot || ""}</span><span class="count" data-count="${id}">0자</span></div>
      </div>`;
    },
    short(id, o = {}) {
      return `<div class="q" data-qid="${id}">
        <div class="q-title"><span class="qi">Q</span><span>${o.label || esc(label(id))}</span></div>
        ${o.hint ? `<div class="q-hint">${o.hint}</div>` : ""}
        <input type="text" data-q="${id}" placeholder="${esc(o.ph || "")}" ${o.ans ? `data-ans="${esc(o.ans)}"` : ""}/>
        ${o.ans || o.check ? `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn small" data-check="${id}">정답 확인</button><div class="feedback" data-fb="${id}"></div></div>` : ""}
      </div>`;
    },
    // 문장 속 빈칸: tpl 안의 {0},{1}… 자리에 입력칸
    blanks(id, tpl, answers, o = {}) {
      let i = 0;
      const html = tpl.replace(/\{(\d)\}/g, (_, n) => `<input type="text" data-q="${id}" data-i="${n}" data-ans="${esc(answers[n])}" aria-label="빈칸 ${+n + 1}" ${o.anyOrder ? 'data-any="1"' : ""}/>`);
      return `<div class="q" data-qid="${id}">
        ${o.title ? `<div class="q-title"><span class="qi">Q</span><span>${o.title}</span></div>` : ""}
        <div class="blank-line">${html}</div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn small" data-check="${id}">정답 확인</button><div class="feedback" data-fb="${id}"></div></div>
      </div>`;
    },
    list(id, labels, o = {}) {
      return `<div class="q" data-qid="${id}">
        <div class="q-title"><span class="qi">Q</span><span>${o.label || esc(label(id))}</span></div>
        ${o.hint ? `<div class="q-hint">${o.hint}</div>` : ""}
        <div class="inline-list" style="${o.cols ? `grid-template-columns:repeat(${o.cols},1fr)` : ""}">${labels.map((l, n) =>
          `<label>${esc(l)}${o.area ? `<textarea data-q="${id}" data-i="${n}" rows="2" style="min-height:70px"></textarea>` : `<input type="text" data-q="${id}" data-i="${n}"/>`}</label>`).join("")}</div>
        ${o.check ? `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn small" data-check="${id}">데이터와 비교하기</button><div class="feedback" data-fb="${id}"></div></div>` : ""}
      </div>`;
    },
    choice(id, opts, o = {}) {
      return `<div class="q" data-qid="${id}">
        <div class="q-title"><span class="qi">Q</span><span>${o.label || esc(label(id))}</span></div>
        <div class="choices" data-choice="${id}" ${o.multi ? 'data-multi="1"' : ""}>${opts.map(v => `<button type="button" class="choice" aria-pressed="false" data-v="${esc(v)}">${esc(v)}</button>`).join("")}</div>
        <div class="feedback" data-fb="${id}"></div>
      </div>`;
    },
  };
  window.UI = UI;

  /* 슬라이더 꾸밈: 채워진 비율(--pct)과 출력값 */
  function paintRange(r) {
    const p = (r.value - r.min) / (r.max - r.min) * 100;
    r.style.setProperty("--pct", p + "%");
  }
  window.bindRange = function (r, fn, outFmt) {
    const out = r.closest(".ctrl") && r.closest(".ctrl").querySelector("output");
    const go = () => { paintRange(r); if (out) out.textContent = outFmt ? outFmt(+r.value) : r.value; fn && fn(+r.value); };
    r.addEventListener("input", go);
    go();
    return go;
  };
  window.rangeHTML = function (id, lab, min, max, step, value, extra = "") {
    return `<div class="ctrl"><div class="ctrl-label"><span>${lab}</span><output for="${id}"></output></div>
      <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${esc(lab)}" ${extra}/>
      <div class="ticks"><span>${min}</span><span>${max}</span></div></div>`;
  };
  /* 기간 슬라이더 (두 손잡이) */
  window.dualHTML = function (id, lab, min, max, a, b) {
    return `<div class="ctrl" id="${id}"><div class="ctrl-label"><span>${lab}</span><output></output></div>
      <div class="dual"><div class="rail"></div><div class="fill"></div>
      <input type="range" class="lo" min="${min}" max="${max}" value="${a}" aria-label="${esc(lab)} 시작"/>
      <input type="range" class="hi" min="${min}" max="${max}" value="${b}" aria-label="${esc(lab)} 끝"/></div>
      <div class="ticks"><span>${min}</span><span>${max}</span></div></div>`;
  };
  window.bindDual = function (box, fn, minGap = 5) {
    const lo = $(".lo", box), hi = $(".hi", box), fill = $(".fill", box), out = $("output", box);
    const min = +lo.min, max = +lo.max;
    const go = (src) => {
      let a = +lo.value, b = +hi.value;
      if (b - a < minGap) { if (src === lo) { a = b - minGap; lo.value = a; } else { b = a + minGap; hi.value = b; } }
      a = +lo.value; b = +hi.value;
      fill.style.left = ((a - min) / (max - min) * 100) + "%";
      fill.style.width = ((b - a) / (max - min) * 100) + "%";
      out.textContent = `${a}–${b}`;
      fn(a, b);
    };
    lo.addEventListener("input", () => go(lo));
    hi.addEventListener("input", () => go(hi));
    go();
    return { set(a, b) { lo.value = a; hi.value = b; go(); } };
  };
  window.seg = function (box, fn) {
    $$("button", box).forEach(b => b.addEventListener("click", () => {
      $$("button", box).forEach(x => x.setAttribute("aria-pressed", x === b));
      fn(b.dataset.v);
    }));
  };

  /* 답 확인 */
  const norm = s => String(s || "").replace(/\s+/g, "").replace(/[()（）.]/g, "").toLowerCase();
  function check(id) {
    const fb = $(`[data-fb="${id}"]`);
    const custom = window.CHECKERS && window.CHECKERS[id];
    if (custom) { const r = custom(S.answers[id]); show(fb, r.ok, r.msg); return; }
    const inputs = $$(`[data-q="${id}"][data-ans]`);
    if (!inputs.length) return;
    let good = 0;
    const anyOrder = inputs[0].dataset.any;
    const pool = inputs.map(i => i.dataset.ans.split("|").map(norm));
    inputs.forEach((inp, n) => {
      const v = norm(inp.value);
      const ok = v && (anyOrder ? pool.some(p => p.includes(v)) : pool[n].includes(v));
      inp.classList.toggle("ok", !!ok); inp.classList.toggle("retry", !ok);
      if (ok) good++;
    });
    const all = good === inputs.length;
    show(fb, all, all ? "🎉 모두 맞았어요!" : `🤔 ${inputs.length}개 중 ${good}개가 맞아요. 자료를 다시 읽고 고쳐 보세요.`);
  }
  function show(fb, ok, msg) { if (!fb) return; fb.className = "feedback show " + (ok ? "ok" : "retry"); fb.textContent = msg; }
  window.showFeedback = (id, ok, msg) => show($(`[data-fb="${id}"]`), ok, msg);

  /* 화면의 입력칸 ↔ 답안 연결 */
  function restore(root) {
    $$("[data-q]", root).forEach(el => {
      const id = el.dataset.q, v = S.answers[id];
      if (el.dataset.i != null) el.value = (Array.isArray(v) ? v[+el.dataset.i] : "") || "";
      else if (el.tagName === "SELECT" && el.dataset.key) el.value = (v && v[el.dataset.key]) || "";
      else el.value = v ?? "";
      count(id);
    });
    $$("[data-choice]", root).forEach(box => {
      const v = S.answers[box.dataset.choice];
      $$(".choice", box).forEach(b => b.setAttribute("aria-pressed", Array.isArray(v) ? v.includes(b.dataset.v) : v === b.dataset.v));
    });
  }
  function count(id) {
    const c = $(`[data-count="${id}"]`);
    if (c) { const v = S.answers[id]; c.textContent = (typeof v === "string" ? v.replace(/\s/g, "").length : 0) + "자"; }
  }
  function onInput(ev) {
    const el = ev.target.closest("[data-q]");
    if (!el) return;
    const id = el.dataset.q;
    if (el.dataset.i != null) {
      const arr = Array.isArray(S.answers[id]) ? S.answers[id].slice() : [];
      arr[+el.dataset.i] = el.value; setAnswer(id, arr);
    } else if (el.dataset.key) {
      const o = Object.assign({}, S.answers[id] || {}); o[el.dataset.key] = el.value; setAnswer(id, o);
    } else setAnswer(id, el.value);
    el.classList.remove("ok", "retry");
    count(id);
    if (window.ON_ANSWER) window.ON_ANSWER(id);
  }
  function onClick(ev) {
    const chk = ev.target.closest("[data-check]");
    if (chk) { check(chk.dataset.check); return; }
    const ch = ev.target.closest(".choice");
    if (ch) {
      const box = ch.closest("[data-choice]"), id = box.dataset.choice;
      if (box.dataset.multi) {
        const cur = new Set(S.answers[id] || []);
        cur.has(ch.dataset.v) ? cur.delete(ch.dataset.v) : cur.add(ch.dataset.v);
        setAnswer(id, [...cur]);
      } else setAnswer(id, ch.dataset.v);
      restore(box.parentElement);
      if (window.ON_ANSWER) window.ON_ANSWER(id);
      return;
    }
    const go = ev.target.closest("[data-go]");
    if (go) { openChapter(go.dataset.go); return; }
    const sub = ev.target.closest("[data-submit]");
    if (sub) { submit(sub.dataset.submit, sub); return; }
    const pr = ev.target.closest("[data-prompt]");
    if (pr) {
      const ta = $(`textarea[data-q="${pr.dataset.target}"]`);
      ta.value = (ta.value ? ta.value.replace(/\s*$/, "") + "\n" : "") + pr.dataset.prompt + " ";
      ta.dispatchEvent(new Event("input", { bubbles: true }));
      ta.focus(); ta.selectionStart = ta.selectionEnd = ta.value.length;
    }
  }

  /* ---------------- 진행률 · 제출 ---------------- */
  function filled(v) {
    if (v == null) return false;
    if (Array.isArray(v)) return v.some(x => String(x || "").trim());
    if (typeof v === "object") return Object.values(v).some(x => String(x || "").trim());
    return String(v).trim().length > 0;
  }
  function progressOf(ch) {
    const qs = Object.values(S.Q).filter(q => q.ch === ch);
    const n = qs.filter(q => filled(S.answers[q.id])).length;
    return { n, total: qs.length };
  }
  window.progressOf = progressOf;
  function updateProgress() {
    S.chapters.forEach(c => {
      const p = progressOf(c.id);
      const d = $(`.chapnav [data-ch="${c.id}"] .done`);
      if (d) d.textContent = S.submitted[c.id] ? "✅" : `${p.n}/${p.total}`;
    });
    const bar = $(".submit-bar .progress i");
    if (bar) { const p = progressOf(S.chapter); bar.style.width = (p.n / p.total * 100) + "%"; $(".submit-bar [data-pt]").textContent = `${p.n} / ${p.total} 문항 작성`; }
  }

  async function submit(ch, btn, silent) {
    if (!S.student) return;
    if (btn) { btn.disabled = true; btn.textContent = "보내는 중…"; }
    const r = await request({ action: "submit", chapter: ch, student: S.student, answers: S.answers, submitted: Object.assign({}, S.submitted, silent ? {} : { [ch]: new Date().toISOString() }) });
    if (btn) { btn.disabled = false; btn.textContent = "📮 선생님께 제출하기"; }
    if (silent) return;
    if (r.ok) {
      clearTimeout(sync.timer); sync.dirty = false; sync.last = new Date(); showSync();
      S.submitted[ch] = new Date().toISOString();
      saveLocal(true);
      toast(r.offline ? "💾 미리보기 모드: 이 기기에만 저장했어요." : "📮 제출 완료! 선생님께 전달되었어요.", "ok");
      updateProgress();
    } else toast("😢 제출하지 못했어요. " + (r.error || ""), "err", 5000);
  }

  /* ---------------- 화면 ---------------- */
  function topbar() {
    return `<div class="brand"><span class="logo">🌏</span><span>기후 탐험 학습지</span></div>
      <nav class="chapnav" aria-label="챕터">${S.chapters.map(c =>
        `<button data-ch="${c.id}" style="--chip:${c.color}" aria-current="${c.id === S.chapter}"><span class="no">${c.no}</span>${esc(c.short)}<span class="done"></span></button>`).join("")}</nav>
      <button class="sync" id="sync" type="button"></button>
      <div class="who">🙋 ${esc(S.student.number)}번 ${esc(S.student.name)} <button id="logout">나가기</button></div>`;
  }
  function openChapter(id) {
    const prev = S.chapter;
    S.chapter = id;
    const c = S.chapters.find(x => x.id === id);
    document.documentElement.style.setProperty("--accent", c.color);
    document.documentElement.style.setProperty("--accent-soft", c.soft);
    $$(".chapnav button").forEach(b => b.setAttribute("aria-current", b.dataset.ch === id));
    const view = $("#view");
    const mod = window.CHAPTERS[id];
    view.innerHTML = `<div class="wrap stack">${mod.html()}${submitBar(id)}</div>`;
    restore(view);
    try { mod.mount && mod.mount(view); } catch (e) { console.error(e); }
    updateProgress();
    $("#scroller").scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    const nb = $(`.chapnav [data-ch="${id}"]`); if (nb) nb.scrollIntoView({ inline: "center", block: "nearest" });
    // 챕터를 옮길 때 자동 임시 저장 (교사 화면에 진행 상황 표시)
    if (prev && prev !== id && S.student && sync.dirty) syncNow();
  }
  window.openChapter = openChapter;
  function submitBar(id) {
    const i = S.chapters.findIndex(c => c.id === id), next = S.chapters[i + 1];
    return `<div class="submit-bar">
      <div><h3>${id === "end" ? "🎓 오늘의 탐구를 마무리해요" : "✋ 이 챕터를 다 했나요?"}</h3>
      <p data-pt></p><div class="progress"><i></i></div></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn primary big" data-submit="${id}">📮 선생님께 제출하기</button>
        ${next ? `<button class="btn big" data-go="${next.id}" style="background:#fff">다음: ${esc(next.short)} →</button>` : `<button class="btn big" onclick="window.print()" style="background:#fff">🖨️ 인쇄 / PDF</button>`}
      </div></div>`;
  }

  function loginView() {
    $("#topbar").classList.add("hidden");
    $("#view").innerHTML = `<div class="login"><div class="login-card">
      <div class="login-art">
        <div><span class="pill">🌏 수임쌤과 함께하는 기후 프로젝트</span>
        <h1 style="margin-top:16px">데이터로 읽는<br>기후변화,<br>2050년을 예측하다</h1></div>
        <div class="flow">${S.chapters.map(c => `<div><span class="n" style="background:${c.color}">${c.no}</span>${esc(c.title)}</div>`).join("")}</div>
      </div>
      <form class="login-form" id="loginForm" autocomplete="off">
        <div><h2>학습지 시작하기 ✏️</h2><p class="muted" style="margin-top:6px">번호와 이름을 쓰면, 쓰던 학습지를 이어서 할 수 있어요.</p></div>
        <label>번호<input id="lgNum" type="number" min="1" max="99" inputmode="numeric" required placeholder="예) 5"/></label>
        <label>이름<input id="lgName" type="text" required maxlength="12" placeholder="예) 김지구"/></label>
        <button class="btn primary big" type="submit" style="background:var(--c2)">탐험 시작! 🚀</button>
        <p class="tiny">${S.inStreamlit ? "제출한 답은 선생님만 볼 수 있어요." : "⚠️ 미리보기 모드: 답이 이 기기에만 저장됩니다."}</p>
      </form></div></div>`;
    $("#loginForm").addEventListener("submit", async ev => {
      ev.preventDefault();
      const number = String(+$("#lgNum").value), name = $("#lgName").value.trim().replace(/\s+/g, "");
      if (!name || !+number) return;
      S.student = { number, name };
      const local = loadLocal();
      const btn = $("#loginForm button"); btn.disabled = true; btn.textContent = "불러오는 중…";
      const r = await request({ action: "login", student: S.student }, 10000);
      const server = r && r.ok && r.record;
      // 서버와 이 기기 중 더 최근에 저장된 기록을 기준으로, 빠진 답은 서로 채워 넣기
      const st = server && server.updated_at ? Date.parse(server.updated_at) : 0, lt = local ? local.t || 0 : 0;
      const [older, newer] = lt > st ? [server, local] : [local, server];
      S.answers = Object.assign({}, older ? older.answers : {}, newer ? newer.answers : {});
      S.submitted = Object.assign({}, older ? older.submitted : {}, newer ? newer.submitted : {});
      sync.last = server ? new Date(st || Date.now()) : null; sync.dirty = lt > st;
      try { localStorage.setItem("climate-ws:last", JSON.stringify(S.student)); } catch (e) { }
      start();
      if (sync.dirty) scheduleSync();
      if (server && Object.keys(server.answers || {}).length) toast("📂 지난번에 쓴 학습지를 불러왔어요!");
    });
  }

  function start() {
    $("#topbar").classList.remove("hidden");
    $("#topbar").innerHTML = topbar();
    $$(".chapnav button").forEach(b => b.addEventListener("click", () => openChapter(b.dataset.ch)));
    $("#sync").addEventListener("click", () => { sync.dirty = true; syncNow(); });
    showSync();
    $("#logout").addEventListener("click", () => { if (confirm("학습지를 닫을까요? 쓴 내용은 자동으로 저장돼요.")) { if (sync.dirty) syncNow(); S.student = null; S.answers = {}; S.submitted = {}; S.chapter = "ch1"; loginView(); } });
    const first = S.chapters.find(c => !S.submitted[c.id]) || S.chapters[0];
    S.chapter = null;
    openChapter(first.id);
  }

  /* ---------------- 시작 ---------------- */
  async function boot() {
    document.addEventListener("input", onInput);
    document.addEventListener("click", onClick);
    if (S.inStreamlit) { post("streamlit:componentReady", {}); fitFrame(); setTimeout(fitFrame, 600); }
    const get = f => fetch(f).then(r => r.json());
    const [q, temp, world, pc, tot, ctry] = await Promise.all([
      get("questions.json"), get("data/temperature.json"), get("data/world_co2.json"),
      get("data/co2_per_capita.json"), get("data/co2_total.json"), get("data/countries.json"),
    ]);
    const SOFT = { ch1: "#ffe3d8", ch2: "#dbf3fd", ch3: "#fff4c7", ch4: "#e0f6e3", end: "#ede7ff" };
    const SHORT = { ch1: "기후 위기", ch2: "데이터 분석", ch3: "1.5℃", ch4: "2050 예측", end: "마무리" };
    S.chapters = q.chapters.map(c => Object.assign({}, c, { soft: SOFT[c.id], short: SHORT[c.id] }));
    q.questions.forEach(x => S.Q[x.id] = x);
    S.data = { temp, world, pc, tot, ctry };
    $("#loading").remove();
    loginView();
  }
  window.addEventListener("DOMContentLoaded", boot);
})();
