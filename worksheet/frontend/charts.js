/* 가벼운 SVG 그래프 엔진 — 꺾은선 · 누적 영역 · 연도 막대 · 가로 막대
   모든 그래프는 크로스헤어 + 툴팁(마우스·터치)을 가지며, 다시 그리기만으로 슬라이더에 반응합니다. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#15151a", INK2 = "#4a4a55", INK3 = "#7c7c88", GRID = "#eeeae1";

  function niceStep(span, count) {
    const raw = span / Math.max(1, count);
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const m = raw / p;
    return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
  }
  function ticks(min, max, count) {
    if (max === min) { max = min + 1; }
    const step = niceStep(max - min, count);
    const out = [];
    for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) out.push(+v.toFixed(10));
    return out;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  function ensureShell(el) {
    if (el._shell) return el._shell;
    el.classList.add("chart");
    el.innerHTML = "";
    const svg = document.createElementNS(NS, "svg");
    const tip = document.createElement("div");
    tip.className = "tip";
    tip.setAttribute("role", "status");
    el.append(svg, tip);
    el._shell = { svg, tip };
    // 크기가 바뀌면 다시 그리기
    if (window.ResizeObserver) {
      let w = 0;
      new ResizeObserver(() => {
        if (el.clientWidth && Math.abs(el.clientWidth - w) > 2 && el._redraw) { w = el.clientWidth; el._redraw(); }
      }).observe(el);
    }
    return el._shell;
  }

  function showTip(el, tip, html, px, py) {
    tip.innerHTML = html;
    tip.classList.add("show");
    const W = el.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
    let left = px + 16;
    if (left + tw > W) left = px - tw - 16;
    if (left < 0) left = Math.max(0, Math.min(W - tw, px - tw / 2));
    let top = Math.max(0, py - th - 12);
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }

  /* ---------------- 꺾은선 / 누적 영역 / 연도 막대 ---------------- */
  function xy(el, cfg) {
    el._cfg = cfg;
    el._redraw = () => drawXY(el);
    drawXY(el);
    return { update(next) { Object.assign(el._cfg, next); drawXY(el); } };
  }

  function drawXY(el) {
    const cfg = el._cfg;
    const { svg, tip } = ensureShell(el);
    const W = Math.max(280, el.clientWidth || 600);
    const small = W < 560;
    const H = small ? Math.min(cfg.height || 340, 290) : (cfg.height || 340);
    const endW = cfg.endLabels ? (small ? 70 : 104) : 14;
    const m = { l: small ? 44 : 56, r: endW, t: cfg.top ?? 26, b: 38 };
    const pw = W - m.l - m.r, ph = H - m.t - m.b;
    const [x0, x1] = cfg.x.domain;

    // 표시 범위 안의 데이터만 사용
    const series = (cfg.series || []).map(s => ({ ...s, pts: s.data.filter(d => d[0] >= x0 && d[0] <= x1 && d[1] != null) }));
    const bars = cfg.bars ? cfg.bars.data.filter(d => d[0] >= x0 && d[0] <= x1 && d[1] != null) : [];

    let stackTop = [];
    if (cfg.stack) {
      // 같은 x 순서를 가정(같은 years 배열에서 만든 시리즈)
      const n = series[0] ? series[0].pts.length : 0;
      const acc = new Array(n).fill(0);
      series.forEach(s => { s.base = acc.slice(); s.pts.forEach((p, i) => { acc[i] += p[1]; }); s.top = acc.slice(); });
      stackTop = acc;
    }
    let ys = [];
    series.forEach(s => s.pts.forEach(p => ys.push(p[1])));
    bars.forEach(p => ys.push(p[1]));
    if (cfg.stack) ys = ys.concat(stackTop);
    (cfg.hlines || []).forEach(h => { if (h.include !== false) ys.push(h.y); });
    (cfg.bands || []).forEach(b => { if (b.lo) b.lo.forEach(p => { if (p[0] >= x0 && p[0] <= x1) ys.push(p[1]); }); if (b.hi) b.hi.forEach(p => { if (p[0] >= x0 && p[0] <= x1) ys.push(p[1]); }); });
    let yMin = cfg.y.min ?? Math.min(...ys), yMax = cfg.y.max ?? Math.max(...ys);
    if (!isFinite(yMin)) { yMin = 0; yMax = 1; }
    if (cfg.y.zero !== false && cfg.y.min == null && yMin > 0) yMin = 0;
    const pad = (yMax - yMin) * 0.06 || 1;
    if (cfg.y.min == null && yMin < 0) yMin -= pad;
    if (cfg.y.max == null) yMax += pad;
    const yt = ticks(yMin, yMax, small ? 4 : 5);
    yMin = Math.min(yMin, yt[0]); yMax = Math.max(yMax, yt[yt.length - 1]);

    const X = v => m.l + (x1 === x0 ? pw / 2 : (v - x0) / (x1 - x0) * pw);
    const Y = v => m.t + ph - (v - yMin) / (yMax - yMin) * ph;
    const fmt = cfg.y.fmt || (v => v.toLocaleString("ko-KR"));
    let s = "";

    // 격자 · y축
    yt.forEach(v => {
      s += `<line x1="${m.l}" x2="${m.l + pw}" y1="${Y(v)}" y2="${Y(v)}" stroke="${v === 0 ? "#c9c4b6" : GRID}" stroke-width="${v === 0 ? 1.5 : 1}"/>`;
      s += `<text x="${m.l - 8}" y="${Y(v) + 4.5}" text-anchor="end" font-size="${small ? 11.5 : 13}" fill="${INK3}" font-weight="600">${esc(cfg.y.tick ? cfg.y.tick(v) : fmt(v))}</text>`;
    });
    if (cfg.y.label) s += `<text x="${m.l - 8}" y="${m.t - 12}" text-anchor="start" font-size="12.5" fill="${INK2}" font-weight="800" transform="translate(${-m.l + 10},0)">${esc(cfg.y.label)}</text>`;

    // x 눈금
    const xt = ticks(x0, x1, small ? 4 : 8).filter(v => Number.isInteger(v));
    xt.forEach(v => {
      s += `<line x1="${X(v)}" x2="${X(v)}" y1="${m.t + ph}" y2="${m.t + ph + 6}" stroke="${INK}" stroke-width="2"/>`;
      s += `<text x="${X(v)}" y="${m.t + ph + 24}" text-anchor="middle" font-size="${small ? 11.5 : 13}" fill="${INK2}" font-weight="700">${v}</text>`;
    });

    // 강조 구간
    (cfg.spans || []).forEach(b => {
      const a = Math.max(x0, b.x0), z = Math.min(x1, b.x1);
      if (z <= a) return;
      s += `<rect x="${X(a)}" y="${m.t}" width="${X(z) - X(a)}" height="${ph}" fill="${b.color || "#fff1cf"}" opacity="${b.opacity ?? 0.7}"/>`;
      if (b.label) s += `<text x="${X(a) + 6}" y="${m.t + 14}" font-size="12" font-weight="800" fill="${INK2}">${esc(b.label)}</text>`;
    });

    // 범위 띠
    (cfg.bands || []).forEach(b => {
      const lo = b.lo.filter(p => p[0] >= x0 && p[0] <= x1), hi = b.hi.filter(p => p[0] >= x0 && p[0] <= x1);
      if (!lo.length) return;
      const d = hi.map((p, i) => `${i ? "L" : "M"}${X(p[0])},${Y(p[1])}`).join("") + lo.slice().reverse().map(p => `L${X(p[0])},${Y(p[1])}`).join("") + "Z";
      s += `<path d="${d}" fill="${b.color}" opacity="${b.opacity ?? 0.22}"/>`;
    });

    // 연도 막대 (기후 줄무늬 막대)
    if (bars.length) {
      const bw = Math.max(1, pw / Math.max(1, (x1 - x0 + 1)));
      const gap = bw > 5 ? 1.5 : 0;
      const zeroY = Y(Math.max(yMin, Math.min(yMax, cfg.bars.base ?? 0)));
      bars.forEach(([x, v]) => {
        const y = Y(v), top = Math.min(y, zeroY), h = Math.max(1, Math.abs(zeroY - y));
        s += `<rect x="${X(x) - bw / 2 + gap / 2}" y="${top}" width="${Math.max(0.8, bw - gap)}" height="${h}" fill="${cfg.bars.color(v, x)}" rx="${bw > 6 ? 2 : 0}"/>`;
      });
    }

    // 누적 영역
    if (cfg.stack) {
      series.forEach(se => {
        if (!se.pts.length) return;
        const top = se.pts.map((p, i) => `${i ? "L" : "M"}${X(p[0])},${Y(se.top[i])}`).join("");
        const base = se.pts.slice().reverse().map((p, j) => { const i = se.pts.length - 1 - j; return `L${X(p[0])},${Y(se.base[i])}`; }).join("");
        s += `<path d="${top}${base}Z" fill="${se.color}" opacity="${se.dim ? 0.25 : 0.92}"/>`;
        s += `<path d="${top}" fill="none" stroke="#fff" stroke-width="1.5"/>`;
      });
    }

    // 기준선
    (cfg.hlines || []).forEach(h => {
      if (h.y < yMin || h.y > yMax) return;
      s += `<line x1="${m.l}" x2="${m.l + pw}" y1="${Y(h.y)}" y2="${Y(h.y)}" stroke="${h.color || INK}" stroke-width="${h.width || 2.5}" stroke-dasharray="${h.dash || "7 5"}"/>`;
      if (h.label) {
        const tw = h.label.length * 7.4 + 16;
        s += `<g transform="translate(${m.l + 8},${Y(h.y) - 26})"><rect width="${tw}" height="22" rx="7" fill="${h.fill || "#fff"}" stroke="${h.color || INK}" stroke-width="2"/><text x="${tw / 2}" y="15.5" text-anchor="middle" font-size="12.5" font-weight="900" fill="${INK}">${esc(h.label)}</text></g>`;
      }
    });

    // 꺾은선
    if (!cfg.stack) {
      series.forEach(se => {
        if (!se.pts.length) return;
        let d = "", pen = false, prev = null;
        se.pts.forEach(p => {
          const gapBreak = prev != null && p[0] - prev > (se.maxGap || 1.5);
          d += `${!pen || gapBreak ? "M" : "L"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`;
          pen = true; prev = p[0];
        });
        s += `<path d="${d}" fill="none" stroke="${se.color}" stroke-opacity="${se.dim ? 0.3 : 1}" stroke-width="${se.width || 3}" stroke-linejoin="round" stroke-linecap="round" ${se.dash ? `stroke-dasharray="${se.dash}"` : ""}/>`;
        (se.dots || []).forEach(p => {
          if (p[0] < x0 || p[0] > x1) return;
          s += `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="5.5" fill="${se.color}" stroke="#fff" stroke-width="2"/>`;
        });
      });
    }

    // x축 기준선
    s += `<line x1="${m.l}" x2="${m.l + pw}" y1="${m.t + ph}" y2="${m.t + ph}" stroke="${INK}" stroke-width="2"/>`;

    // 세로 표식 (내가 고른 연도 등)
    (cfg.vlines || []).forEach(v => {
      if (v.x < x0 || v.x > x1) return;
      const x = X(v.x);
      s += `<line x1="${x}" x2="${x}" y1="${m.t - 4}" y2="${m.t + ph}" stroke="${v.color || INK}" stroke-width="${v.width || 2.5}" ${v.dash ? `stroke-dasharray="${v.dash}"` : ""}/>`;
      if (v.label) {
        const tw = v.label.length * 8 + 18;
        const lx = Math.max(m.l - 6, Math.min(m.l + pw - tw + 6, x - tw / 2));
        s += `<g transform="translate(${lx},${m.t - 26})"><rect width="${tw}" height="24" rx="8" fill="${v.fill || INK}" stroke="${INK}" stroke-width="2"/><text x="${tw / 2}" y="16.5" text-anchor="middle" font-size="13" font-weight="900" fill="${v.textColor || "#fff"}">${esc(v.label)}</text></g>`;
      }
    });

    // 끝 라벨 (직접 라벨)
    if (cfg.endLabels) {
      const items = [];
      series.forEach(se => {
        if (!se.pts.length || se.noLabel) return;
        const last = se.pts[se.pts.length - 1];
        const v = cfg.stack ? se.top[se.pts.length - 1] - (se.top[se.pts.length - 1] - se.base[se.pts.length - 1]) / 2 : last[1];
        items.push({ y: Y(v), text: se.name, color: se.color, val: cfg.stack ? null : last[1] });
      });
      items.sort((a, b) => a.y - b.y);
      for (let i = 1; i < items.length; i++) if (items[i].y - items[i - 1].y < 18) items[i].y = items[i - 1].y + 18;
      items.forEach(it => {
        s += `<circle cx="${m.l + pw + 8}" cy="${it.y}" r="4.5" fill="${it.color}"/>`;
        s += `<text x="${m.l + pw + 17}" y="${it.y + 4.5}" font-size="${small ? 11.5 : 13}" font-weight="800" fill="${INK}">${esc(it.text)}</text>`;
      });
    }

    // 호버 레이어
    s += `<g class="hover" pointer-events="none"></g>`;
    s += `<rect class="hit" x="${m.l}" y="${m.t}" width="${pw}" height="${ph}" fill="transparent" style="cursor:crosshair"/>`;
    svg.setAttribute("height", H);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("role", "img");
    if (cfg.aria) svg.setAttribute("aria-label", cfg.aria);
    svg.innerHTML = s;

    const hover = svg.querySelector(".hover"), hit = svg.querySelector(".hit");
    const xsAll = new Set();
    series.forEach(se => se.pts.forEach(p => xsAll.add(p[0])));
    bars.forEach(p => xsAll.add(p[0]));
    const xs = [...xsAll].sort((a, b) => a - b);

    function at(px) {
      const v = x0 + (px - m.l) / pw * (x1 - x0);
      let best = xs[0];
      xs.forEach(x => { if (Math.abs(x - v) < Math.abs(best - v)) best = x; });
      return best;
    }
    function move(ev) {
      const r = svg.getBoundingClientRect();
      const px = (ev.clientX - r.left) * (W / r.width);
      if (!xs.length) return;
      const x = at(px);
      const rows = [];
      let g = `<line x1="${X(x)}" x2="${X(x)}" y1="${m.t}" y2="${m.t + ph}" stroke="${INK}" stroke-width="1.5"/>`;
      if (bars.length) {
        const b = bars.find(p => p[0] === x);
        if (b) rows.push({ name: cfg.bars.name || "값", color: cfg.bars.color(b[1], x), v: b[1] });
      }
      series.forEach(se => {
        const i = se.pts.findIndex(p => p[0] === x);
        if (i < 0 || se.noTip) return;
        const yv = cfg.stack ? se.top[i] : se.pts[i][1];
        if (!cfg.stack) g += `<circle cx="${X(x)}" cy="${Y(yv)}" r="6" fill="${se.color}" stroke="#fff" stroke-width="2.5"/>`;
        rows.push({ name: se.name, color: se.color, v: se.pts[i][1] });
      });
      if (cfg.stack) rows.reverse();
      hover.innerHTML = g;
      const html = cfg.tip ? cfg.tip(x, rows) :
        `<div class="t-year">${x}${cfg.x.unit || "년"}</div>` + rows.map(r =>
          `<div class="t-row"><span><i class="sw" style="background:${r.color}"></i>${esc(r.name)}</span><b>${esc(fmt(r.v))}</b></div>`).join("") +
        (cfg.stack ? `<div class="t-row" style="border-top:1px solid #ddd;margin-top:4px;padding-top:4px"><span>합계</span><b>${esc(fmt(rows.reduce((a, r) => a + r.v, 0)))}</b></div>` : "");
      const ry = r.height / H;
      showTip(el, tip, html, X(x) * (r.width / W), (m.t + 10) * ry);
      if (cfg.onHover) cfg.onHover(x);
    }
    function leave() { hover.innerHTML = ""; tip.classList.remove("show"); }
    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerdown", ev => { move(ev); if (cfg.onPick) cfg.onPick(at((ev.clientX - svg.getBoundingClientRect().left) * (W / svg.getBoundingClientRect().width))); });
    hit.addEventListener("pointerleave", leave);
  }

  /* ---------------- 가로 막대 (순위 · 증감) ---------------- */
  function hbar(el, cfg) {
    el._cfg = cfg;
    el._redraw = () => drawH(el);
    drawH(el);
    return { update(next) { Object.assign(el._cfg, next); drawH(el); } };
  }
  function drawH(el) {
    const cfg = el._cfg;
    const { svg, tip } = ensureShell(el);
    const W = Math.max(280, el.clientWidth || 600);
    const small = W < 560;
    const rows = cfg.rows;
    const rowH = cfg.rowH || (small ? 26 : 30);
    const labW = small ? 98 : 140;
    const m = { l: labW + 34, r: small ? 64 : 84, t: 8, b: 8 };
    const H = m.t + m.b + rows.length * rowH;
    const pw = W - m.l - m.r;
    const vals = rows.map(r => r.value);
    const allNeg = vals.length && vals.every(v => v <= 0);
    const mag = v => allNeg ? -v : v;
    const lo = allNeg ? 0 : Math.min(0, ...vals), hi = allNeg ? Math.max(0, ...vals.map(mag)) : Math.max(0, ...vals);
    const X = v => m.l + (hi === lo ? 0 : (mag(v) - lo) / (hi - lo) * pw);
    const fmt = cfg.fmt || (v => v.toLocaleString("ko-KR"));
    let s = "";
    if (lo < 0) s += `<line x1="${X(0)}" x2="${X(0)}" y1="${m.t - 4}" y2="${H - m.b + 4}" stroke="${INK}" stroke-width="2"/>`;
    rows.forEach((r, i) => {
      const y = m.t + i * rowH, bh = rowH - 8;
      const a = allNeg ? X(0) : X(Math.min(0, r.value)), b = allNeg ? X(r.value) : X(Math.max(0, r.value));
      if (r.highlight) s += `<rect x="0" y="${y}" width="${W}" height="${rowH}" fill="${cfg.hlFill || "#fff4c7"}" rx="6"/>`;
      s += `<text x="${labW + 26}" y="${y + rowH / 2 + 4.5}" text-anchor="end" font-size="${small ? 12.5 : 14}" font-weight="${r.highlight ? 900 : 700}" fill="${INK}">${esc(r.label)}</text>`;
      if (cfg.rank) s += `<text x="4" y="${y + rowH / 2 + 4.5}" font-size="12.5" font-weight="900" fill="${INK3}">${i + 1}</text>`;
      s += `<rect x="${a}" y="${y + 4}" width="${Math.max(2, b - a)}" height="${bh}" rx="4" fill="${r.color}" stroke="${r.highlight ? INK : "none"}" stroke-width="${r.highlight ? 2 : 0}"/>`;
      const right = r.value >= 0 || allNeg, tx = right ? b + 6 : a - 6;
      s += `<text x="${tx}" y="${y + rowH / 2 + 4.5}" text-anchor="${right ? "start" : "end"}" font-size="${small ? 12 : 13}" font-weight="800" fill="${INK}" style="font-variant-numeric:tabular-nums">${esc(fmt(r.value))}</text>`;
      s += `<rect class="hrow" data-i="${i}" x="0" y="${y}" width="${W}" height="${rowH}" fill="transparent"/>`;
    });
    svg.setAttribute("height", H);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("role", "img");
    if (cfg.aria) svg.setAttribute("aria-label", cfg.aria);
    svg.innerHTML = s;
    svg.querySelectorAll(".hrow").forEach(rc => {
      rc.addEventListener("pointermove", ev => {
        const r = rows[+rc.dataset.i];
        if (!cfg.tip) return;
        const box = svg.getBoundingClientRect();
        showTip(el, tip, cfg.tip(r), ev.clientX - box.left, ev.clientY - box.top);
      });
      rc.addEventListener("pointerleave", () => tip.classList.remove("show"));
      if (cfg.onPick) rc.addEventListener("click", () => cfg.onPick(rows[+rc.dataset.i]));
    });
  }

  /* 발산형 색: 음수 파랑 ↔ 0 회색 ↔ 양수 빨강 */
  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
  function hex(c) { return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); }
  function mix(c1, c2, t) { const a = hex(c1), b = hex(c2); return `rgb(${lerp(a[0], b[0], t)},${lerp(a[1], b[1], t)},${lerp(a[2], b[2], t)})`; }
  function diverge(v, lo, hi) {
    const COLD = "#1c5cab", MID = "#ece9e1", HOT = "#c42b2b";
    if (v < 0) return mix(MID, COLD, Math.min(1, v / lo));
    return mix(MID, HOT, Math.min(1, v / hi));
  }

  window.Charts = { xy, hbar, diverge, mix, ticks };
})();
