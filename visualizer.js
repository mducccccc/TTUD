(() => {
  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // =========================================================================
  // BÀI 1: Dãy con liên tục khác biệt (Sliding Window + Hash Map)
  // =========================================================================
  function buildP1Steps() {
    const a = [4, 7, 2, 8, 4, 8, 3, 2, 4, 9, 3, 6];
    const steps = [];
    const last = {};
    let left = 0;
    let best = 0;
    let bestRange = [0, -1];

    steps.push({
      title: "Khởi tạo",
      explain: "Ban đầu cửa sổ rỗng (left = 0), từ điển last = {} chưa lưu giá trị nào, best = 0.",
      a, i: -1, left: 0, conflictIdx: -1, last: {}, curLen: 0, best: 0, bestRange: [-1, -1]
    });

    for (let i = 0; i < a.length; i++) {
      const x = a[i];
      let conflictIdx = -1;
      let explain = "";
      if (x in last && last[x] >= left) {
        conflictIdx = last[x];
        const oldLeft = left;
        left = last[x] + 1;
        explain = `Xét a[${i}] = ${x}: đã xuất hiện ở chỉ số ${conflictIdx} (≥ left = ${oldLeft}) nên bị trùng trong cửa sổ! Dời left sang ${left}, cập nhật last[${x}] = ${i}.`;
      } else if (x in last) {
        explain = `Xét a[${i}] = ${x}: từng xuất hiện ở chỉ số ${last[x]} (< left = ${left}, nằm ngoài cửa sổ hiện tại) nên không bị trùng. Cập nhật last[${x}] = ${i}.`;
      } else {
        explain = `Xét a[${i}] = ${x}: chưa từng xuất hiện. Mở rộng cửa sổ sang phải, ghi last[${x}] = ${i}.`;
      }
      last[x] = i;
      const curLen = i - left + 1;
      if (curLen > best) {
        best = curLen;
        bestRange = [left, i];
        explain += ` Độ dài mới = ${curLen} → cập nhật kỷ lục best = ${best}!`;
      } else {
        explain += ` Độ dài cửa sổ [${left}..${i}] = ${curLen}, giữ nguyên best = ${best}.`;
      }

      steps.push({
        title: `i = ${i}, a[${i}] = ${x}`,
        explain,
        a, i, left, conflictIdx, last: { ...last }, curLen, best, bestRange: [...bestRange]
      });
    }
    return steps;
  }

  function renderP1(st) {
    const cells = st.a
      .map((val, idx) => {
        const inWin = st.i >= 0 && idx >= st.left && idx <= st.i;
        const isCur = idx === st.i;
        const isConflict = idx === st.conflictIdx;
        const cls = [
          "viz-cell",
          inWin ? "in-window" : "",
          isCur ? "is-current" : "",
          isConflict ? "is-conflict" : ""
        ].join(" ");
        const pointers = [];
        if (st.i >= 0 && idx === st.left) pointers.push(`<span class="ptr ptr-left">left</span>`);
        if (idx === st.i) pointers.push(`<span class="ptr ptr-i">i</span>`);
        if (isConflict) pointers.push(`<span class="ptr ptr-conflict">trùng cũ</span>`);

        return `
          <div class="viz-cell-wrap">
            <div class="viz-ptrs">${pointers.join("")}</div>
            <div class="${cls}">
              <span class="cell-val">${val}</span>
              <span class="cell-idx">${idx}</span>
            </div>
          </div>`;
      })
      .join("");

    const dictEntries = Object.entries(st.last)
      .map(([k, v]) => {
        const highlight = st.i >= 0 && Number(k) === st.a[st.i] ? "chip-accent" : "";
        return `<span class="viz-chip ${highlight}">${k} → idx ${v}</span>`;
      })
      .join("");

    return `
      <div class="viz-stats">
        <div class="viz-stat"><span>Cửa sổ hiện tại</span><strong>${st.i >= 0 ? `[${st.left} .. ${st.i}]` : "rỗng"}</strong></div>
        <div class="viz-stat"><span>Độ dài hiện tại</span><strong>${st.curLen}</strong></div>
        <div class="viz-stat stat-success"><span>Kỷ lục (best)</span><strong>${st.best}</strong></div>
      </div>
      <div class="viz-array">${cells}</div>
      <div class="viz-subbox">
        <div class="viz-sublabel">Từ điển <code>last[x]</code> (vị trí xuất hiện gần nhất):</div>
        <div class="viz-chips">${dictEntries || '<span class="viz-empty">Chưa có phần tử</span>'}</div>
      </div>
    `;
  }

  // =========================================================================
  // BÀI 2: Chào đón tân sinh viên K59 (Monotonic Stack)
  // =========================================================================
  function buildP2Steps() {
    const a = [1, 4, 2, 1, 7, 6];
    const n = a.length;
    const steps = [];
    const L = Array(n).fill(-1);
    const R = Array(n).fill(-1);

    // Pass 1: Left to right
    let st = [];
    for (let i = 0; i < n; i++) {
      const popped = [];
      while (st.length && a[st[st.length - 1]] <= a[i]) {
        popped.push(st.pop());
      }
      const found = st.length ? st[st.length - 1] : -1;
      L[i] = found;
      st.push(i);

      const popText = popped.length
        ? `Loại khỏi ngăn xếp các chỉ số [${popped.join(", ")}] vì chiều cao ≤ ${a[i]}.`
        : `Không loại ai vì đỉnh ngăn xếp đã cao hơn ${a[i]} (hoặc ngăn xếp rỗng).`;
      const foundText = found !== -1 ? `Đỉnh còn lại là ${found} (cao ${a[found]}) → L[${i}] = ${found}.` : `Ngăn xếp rỗng → L[${i}] = -1.`;

      steps.push({
        title: `Lượt 1 (Trái → Phải): i = ${i}`,
        explain: `Xét sinh viên ${i} (cao ${a[i]}). ${popText} ${foundText} Đẩy ${i} vào ngăn xếp.`,
        phase: "L", a, cur: i, stack: [...st], popped, found, L: [...L], R: [...R], res: null
      });
    }

    // Pass 2: Right to left
    st = [];
    for (let i = n - 1; i >= 0; i--) {
      const popped = [];
      while (st.length && a[st[st.length - 1]] <= a[i]) {
        popped.push(st.pop());
      }
      const found = st.length ? st[st.length - 1] : -1;
      R[i] = found;
      st.push(i);

      const popText = popped.length
        ? `Loại khỏi ngăn xếp [${popped.join(", ")}] vì chiều cao ≤ ${a[i]}.`
        : `Không loại ai khỏi ngăn xếp.`;
      const foundText = found !== -1 ? `Đỉnh còn lại là ${found} (cao ${a[found]}) → R[${i}] = ${found}.` : `Ngăn xếp rỗng → R[${i}] = -1.`;

      steps.push({
        title: `Lượt 2 (Phải → Trái): i = ${i}`,
        explain: `Xét sinh viên ${i} (cao ${a[i]}). ${popText} ${foundText} Đẩy ${i} vào ngăn xếp.`,
        phase: "R", a, cur: i, stack: [...st], popped, found, L: [...L], R: [...R], res: null
      });
    }

    // Final merge
    const res = a.map((_, i) => {
      if (L[i] === -1) return R[i];
      if (R[i] === -1) return L[i];
      return i - L[i] <= R[i] - i ? L[i] : R[i];
    });
    steps.push({
      title: "Ghép kết quả từ L và R",
      explain: "So sánh khoảng cách (i − L[i]) và (R[i] − i). Nếu bằng nhau (như i = 3: 3−2 = 4−3 = 1) thì ưu tiên chỉ số nhỏ hơn là L[i] = 2.",
      phase: "M", a, cur: -1, stack: [], popped: [], found: -1, L: [...L], R: [...R], res
    });

    return steps;
  }

  function renderP2(st) {
    const maxH = Math.max(...st.a);
    const bars = st.a
      .map((h, idx) => {
        const pct = Math.round((h / maxH) * 100);
        let cls = "bar-col";
        if (idx === st.cur) cls += " bar-current";
        else if (idx === st.found) cls += " bar-found";
        else if (st.popped.includes(idx)) cls += " bar-popped";
        else if (st.stack.includes(idx)) cls += " bar-in-stack";

        return `
          <div class="bar-item">
            <div class="bar-track">
              <div class="${cls}" style="height:${pct}%">
                <span class="bar-val">${h}</span>
              </div>
            </div>
            <div class="bar-idx">i=${idx}</div>
            <div class="bar-meta">L:${st.L[idx]} · R:${st.R[idx]}</div>
            ${st.res ? `<div class="bar-res">→ ${st.res[idx]}</div>` : ""}
          </div>`;
      })
      .join("");

    const stackHtml = st.stack.length
      ? st.stack
          .map((idx, pos) => `<span class="viz-chip ${pos === st.stack.length - 1 ? "chip-accent" : ""}">idx ${idx} (cao ${st.a[idx]})</span>`)
          .join("")
      : '<span class="viz-empty">Ngăn xếp rỗng</span>';

    return `
      <div class="viz-legend">
        <span class="lg"><i class="dot dot-blue"></i>Đang xét (i)</span>
        <span class="lg"><i class="dot dot-green"></i>Người cao hơn gần nhất</span>
        <span class="lg"><i class="dot dot-red"></i>Vừa bị loại (pop)</span>
        <span class="lg"><i class="dot dot-amber"></i>Đang trong ngăn xếp</span>
      </div>
      <div class="viz-bars">${bars}</div>
      <div class="viz-subbox">
        <div class="viz-sublabel">Ngăn xếp đơn điệu (đáy → đỉnh):</div>
        <div class="viz-chips">${stackHtml}</div>
      </div>
    `;
  }

  // =========================================================================
  // BÀI 3: Khối lượng hóa chất (Stack cho ngoặc lồng nhau)
  // =========================================================================
  function buildP3Steps() {
    const s = "((CHOH)2(CO2H)2H2O)4";
    const W = { C: 12, H: 1, O: 16 };
    const steps = [];
    const st = [0];
    let last = 0;

    steps.push({
      title: "Khởi tạo",
      explain: "Ngăn xếp bắt đầu với 1 cấp ngoài cùng [0] và last = 0. Đọc từng ký tự của công thức ((CHOH)2(CO2H)2H2O)4.",
      s, pos: -1, stack: [...st], last, op: "st = [0]"
    });

    for (let idx = 0; idx < s.length; idx++) {
      const ch = s[idx];
      let explain = "";
      let op = "";
      if (ch in W) {
        last = W[ch];
        st[st.length - 1] += last;
        op = `last = ${last}, st[-1] += ${last}`;
        explain = `Gặp nguyên tố ${ch} (khối lượng ${W[ch]}): ghi last = ${W[ch]} và cộng ${W[ch]} vào đỉnh ngăn xếp → đỉnh = ${st[st.length - 1]}.`;
      } else if (ch === "(") {
        st.push(0);
        op = `st.append(0) (mở ngoặc)`;
        explain = `Gặp "(": mở cấp ngoặc mới bằng cách đẩy 0 lên đỉnh ngăn xếp (hiện có ${st.length} cấp).`;
      } else if (ch === ")") {
        last = st.pop();
        st[st.length - 1] += last;
        op = `last = pop() = ${last}, st[-1] += ${last}`;
        explain = `Gặp ")": đóng cấp ngoặc hiện tại (tổng = ${last}), gán last = ${last} và cộng gộp vào cấp ngoài → đỉnh ngoài = ${st[st.length - 1]}.`;
      } else {
        const d = Number(ch);
        const add = last * (d - 1);
        st[st.length - 1] += add;
        op = `st[-1] += ${last} × (${d} − 1) = +${add}`;
        explain = `Gặp chữ số ${d}: khối vừa đọc (last = ${last}) đã được cộng 1 lần, nên cộng thêm ${d - 1} lần nữa (+${add}) → đỉnh = ${st[st.length - 1]}.`;
      }

      steps.push({
        title: `Ký tự #${idx + 1}: "${ch}"`,
        explain,
        s, pos: idx, stack: [...st], last, op
      });
    }
    return steps;
  }

  function renderP3(st) {
    const chars = st.s
      .split("")
      .map((ch, idx) => {
        let cls = "char-tile";
        if (idx === st.pos) cls += " is-current";
        else if (idx < st.pos) cls += " is-done";
        return `<span class="${cls}">${esc(ch)}</span>`;
      })
      .join("");

    const stackItems = [...st.stack]
      .reverse()
      .map((val, revIdx) => {
        const level = st.stack.length - 1 - revIdx;
        const isTop = revIdx === 0;
        return `
          <div class="stack-box ${isTop ? "stack-top" : ""}">
            <span class="stack-lvl">Cấp ${level}${isTop ? " (đỉnh)" : ""}</span>
            <strong>${val}</strong>
          </div>`;
      })
      .join("");

    return `
      <div class="viz-ribbon">${chars}</div>
      <div class="viz-split">
        <div class="viz-subbox">
          <div class="viz-sublabel">Ngăn xếp khối lượng (từ đỉnh xuống đáy):</div>
          <div class="stack-column">${stackItems}</div>
        </div>
        <div class="viz-subbox">
          <div class="viz-sublabel">Trạng thái hiện tại:</div>
          <div class="viz-stats vertical">
            <div class="viz-stat"><span>Thao tác</span><strong><code>${esc(st.op)}</code></strong></div>
            <div class="viz-stat"><span>Biến <code>last</code></span><strong>${st.last}</strong></div>
            <div class="viz-stat stat-success"><span>Tổng ngoài cùng <code>st[0]</code></span><strong>${st.stack[0]}</strong></div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // BÀI 4: Trinh thám (Sliding Window Max with Deque)
  // =========================================================================
  function buildP4Steps() {
    const a = [4, 7, 2, 5, 6, 3, 9, 1];
    const k = 3;
    const steps = [];
    const dq = [];
    const res = [];

    for (let i = 0; i < a.length; i++) {
      const popBack = [];
      while (dq.length && a[dq[dq.length - 1]] <= a[i]) {
        popBack.push(dq.pop());
      }
      dq.push(i);

      let popFront = null;
      if (dq[0] <= i - k) {
        popFront = dq.shift();
      }

      let emitted = null;
      if (i >= k - 1) {
        emitted = a[dq[0]];
        res.push(emitted);
      }

      const parts = [`Xét a[${i}] = ${a[i]}.`];
      if (popBack.length) {
        parts.push(`Loại ở cuối deque [${popBack.map((x) => `${x}(${a[x]})`).join(", ")}] vì ≤ ${a[i]}.`);
      }
      parts.push(`Thêm ${i}(${a[i]}) vào cuối deque.`);
      if (popFront !== null) {
        parts.push(`Loại đầu deque ${popFront}(${a[popFront]}) vì đã ra khỏi khung nhìn [${i - k + 1}..${i}].`);
      }
      if (emitted !== null) {
        parts.push(`Đầu deque là ${dq[0]}(${emitted}) → Max khung nhìn = ${emitted}.`);
      } else {
        parts.push(`Chưa đủ ${k} phần tử để tạo khung nhìn hoàn chỉnh.`);
      }

      steps.push({
        title: `i = ${i}, a[${i}] = ${a[i]}`,
        explain: parts.join(" "),
        a, k, i, dq: [...dq], popBack, popFront, emitted, res: [...res]
      });
    }
    return steps;
  }

  function renderP4(st) {
    const winStart = Math.max(0, st.i - st.k + 1);
    const cells = st.a
      .map((val, idx) => {
        const inWin = idx >= winStart && idx <= st.i;
        const isMax = st.dq.length && idx === st.dq[0];
        const isCur = idx === st.i;
        const cls = [
          "viz-cell",
          inWin ? "in-window" : "",
          isMax ? "is-best" : "",
          isCur ? "is-current" : ""
        ].join(" ");
        return `
          <div class="viz-cell-wrap">
            <div class="viz-ptrs">
              ${isMax ? '<span class="ptr ptr-best">MAX</span>' : ""}
              ${isCur ? '<span class="ptr ptr-i">i</span>' : ""}
            </div>
            <div class="${cls}">
              <span class="cell-val">${val}</span>
              <span class="cell-idx">${idx}</span>
            </div>
          </div>`;
      })
      .join("");

    const dqChips = st.dq
      .map((idx, pos) => `<span class="viz-chip ${pos === 0 ? "chip-success" : "chip-accent"}">${idx}(${st.a[idx]})</span>`)
      .join("");

    return `
      <div class="viz-array">${cells}</div>
      <div class="viz-split">
        <div class="viz-subbox">
          <div class="viz-sublabel">Deque (Đầu → Cuối, giá trị giảm dần):</div>
          <div class="viz-chips">${dqChips || '<span class="viz-empty">Rỗng</span>'}</div>
        </div>
        <div class="viz-subbox">
          <div class="viz-sublabel">Kết quả đã in ra (<code>res</code>):</div>
          <div class="viz-chips">${st.res.length ? st.res.map((v) => `<span class="viz-chip chip-success">${v}</span>`).join("") : '<span class="viz-empty">Chưa đủ k = 3 phần tử</span>'}</div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // BÀI 5: Liên lạc (DFS Thành phần liên thông)
  // =========================================================================
  function buildP5Steps() {
    const trust = { 1: 90, 2: 85, 3: 100, 4: 75, 5: 65 };
    const edges = [[1, 2], [1, 3], [2, 3], [4, 5]];
    const adj = { 1: [2, 3], 2: [1, 3], 3: [1, 2], 4: [5], 5: [4] };
    const steps = [];
    const visited = new Set();
    const compOf = {};
    const chosen = [];

    steps.push({
      title: "Khởi tạo đồ thị",
      explain: "5 học sinh với độ tin cậy t = [90, 85, 100, 75, 65]. Ta duyệt từ đỉnh 1 đến 5 để tìm các thành phần liên thông bằng DFS.",
      trust, edges, visited: new Set(), compOf: {}, cur: null, stack: [], best: null, chosen: []
    });

    let compId = 0;
    for (let s = 1; s <= 5; s++) {
      if (!visited.has(s)) {
        compId++;
        visited.add(s);
        compOf[s] = compId;
        const st = [s];
        let best = s;

        steps.push({
          title: `Bắt đầu thành phần #${compId} từ đỉnh ${s}`,
          explain: `Đỉnh ${s} chưa thăm → mở thành phần liên thông mới #${compId}, đặt best = ${s} (t=${trust[s]}), đẩy ${s} vào ngăn xếp.`,
          trust, edges, visited: new Set(visited), compOf: { ...compOf }, cur: s, stack: [...st], best, chosen: [...chosen]
        });

        while (st.length) {
          const u = st.pop();
          if (trust[u] > trust[best]) best = u;
          const pushed = [];
          for (const v of adj[u]) {
            if (!visited.has(v)) {
              visited.add(v);
              compOf[v] = compId;
              st.push(v);
              pushed.push(v);
            }
          }
          steps.push({
            title: `DFS lấy đỉnh ${u}`,
            explain: `Lấy ${u} (t=${trust[u]}) ra khỏi ngăn xếp. Tin cậy nhất hiện tại: đỉnh ${best} (t=${trust[best]}). ${
              pushed.length ? `Đẩy các đỉnh kề chưa thăm [${pushed.join(", ")}] vào ngăn xếp.` : `Không còn đỉnh kề nào chưa thăm.`
            }`,
            trust, edges, visited: new Set(visited), compOf: { ...compOf }, cur: u, stack: [...st], best, chosen: [...chosen]
          });
        }
        chosen.push(best);
        steps.push({
          title: `Xong thành phần #${compId} → Chọn đỉnh ${best}`,
          explain: `Ngăn xếp rỗng, kết thúc thành phần #${compId}. Học sinh tin cậy nhất được chọn là ${best} (t=${trust[best]}).`,
          trust, edges, visited: new Set(visited), compOf: { ...compOf }, cur: null, stack: [], best, chosen: [...chosen]
        });
      }
    }

    steps.push({
      title: "Hoàn thành",
      explain: `Tổng cộng có ${chosen.length} thành phần liên thông. Thầy chỉ cần nhắn cho ${chosen.length} bạn: ${chosen.slice().sort((a, b) => a - b).join(", ")}.`,
      trust, edges, visited: new Set(visited), compOf: { ...compOf }, cur: null, stack: [], best: null, chosen: chosen.slice().sort((a, b) => a - b)
    });
    return steps;
  }

  function renderP5(st) {
    const pos = {
      1: [110, 55],
      2: [55, 165],
      3: [175, 165],
      4: [320, 75],
      5: [370, 165]
    };

    const edgeSvg = st.edges
      .map(([u, v]) => {
        const [x1, y1] = pos[u];
        const [x2, y2] = pos[v];
        const active = st.visited.has(u) && st.visited.has(v);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="svg-edge ${active ? "edge-active" : ""}" />`;
      })
      .join("");

    const nodeSvg = Object.entries(pos)
      .map(([idStr, [x, y]]) => {
        const id = Number(idStr);
        const isCur = st.cur === id;
        const isChosen = st.chosen.includes(id) || st.best === id;
        const comp = st.compOf[id];
        let cls = "svg-node";
        if (comp === 1) cls += " node-c1";
        if (comp === 2) cls += " node-c2";
        if (isCur) cls += " node-cur";
        if (isChosen) cls += " node-best";
        return `
          <g class="${cls}">
            <circle cx="${x}" cy="${y}" r="24" />
            <text x="${x}" y="${y - 3}" class="svg-node-id">${id}</text>
            <text x="${x}" y="${y + 13}" class="svg-node-sub">t=${st.trust[id]}</text>
          </g>`;
      })
      .join("");

    return `
      <div class="viz-split">
        <div class="viz-svg-wrap">
          <svg viewBox="0 0 430 220" class="viz-svg">
            ${edgeSvg}
            ${nodeSvg}
          </svg>
        </div>
        <div class="viz-subbox">
          <div class="viz-stats vertical">
            <div class="viz-stat"><span>Ngăn xếp DFS</span><strong>${st.stack.length ? `[${st.stack.join(", ")}]` : "rỗng"}</strong></div>
            <div class="viz-stat"><span>Best thành phần đang xét</span><strong>${st.best ? `Học sinh ${st.best} (${st.trust[st.best]})` : "—"}</strong></div>
            <div class="viz-stat stat-success"><span>Danh sách chọn</span><strong>${st.chosen.length ? st.chosen.join(", ") : "chưa có"}</strong></div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // BÀI 6: Mã hóa Huffman (Min-Heap Greedy)
  // =========================================================================
  function buildP6Steps() {
    const init = [
      { label: "H", w: 1 },
      { label: "V", w: 1 },
      { label: "G", w: 2 },
      { label: "I", w: 2 },
      { label: "O", w: 2 },
      { label: "T", w: 2 },
      { label: "N", w: 2 },
      { label: "A", w: 3 }
    ];
    let heap = init.map((x) => ({ ...x }));
    const steps = [];
    let totalBits = 0;
    const merges = [];

    steps.push({
      title: "Khởi tạo Min-Heap",
      explain: "Đếm tần số xâu GIAOTHONGVANTAI (15 ký tự): H:1, V:1, G:2, I:2, O:2, T:2, N:2, A:3. Đưa tất cả vào min-heap.",
      heap: heap.map((x) => ({ ...x })), picked: [], merged: null, totalBits: 0, merges: []
    });

    let round = 0;
    while (heap.length > 1) {
      round++;
      heap.sort((a, b) => a.w - b.w);
      const x = heap.shift();
      const y = heap.shift();
      const nw = x.w + y.w;
      const newNode = { label: `${x.label}+${y.label}`, w: nw, isNew: true };
      totalBits += nw;
      merges.push(`${x.w} + ${y.w} = ${nw}`);
      heap.push(newNode);
      heap.sort((a, b) => a.w - b.w);

      steps.push({
        title: `Lần ghép ${round}: ${x.w} + ${y.w} = ${nw}`,
        explain: `Lấy 2 nút nhỏ nhất (${x.label}:${x.w}) và (${y.label}:${y.w}), ghép thành nút mới trọng số ${nw}. Cộng thêm ${nw} bit vào tổng → tổng = ${totalBits} bit.`,
        heap: heap.map((item) => ({ ...item })),
        picked: [x, y],
        merged: newNode,
        totalBits,
        merges: [...merges]
      });
      delete newNode.isNew;
    }
    return steps;
  }

  function renderP6(st) {
    const heapChips = st.heap
      .map((item, idx) => {
        const cls = item.isNew ? "chip-success" : idx < 2 && st.heap.length > 1 ? "chip-amber" : "chip-accent";
        return `<span class="viz-chip ${cls}"><strong>${item.w}</strong> <small>(${esc(item.label)})</small></span>`;
      })
      .join("");

    const pickedHtml = st.picked.length
      ? `<div class="huff-merge-box">
           <span class="viz-chip chip-red">${st.picked[0].w} (${esc(st.picked[0].label)})</span>
           <span class="huff-op">+</span>
           <span class="viz-chip chip-red">${st.picked[1].w} (${esc(st.picked[1].label)})</span>
           <span class="huff-op">→</span>
           <span class="viz-chip chip-success"><strong>${st.merged.w}</strong></span>
         </div>`
      : '<span class="viz-empty">Bấm "Bước sau" để bắt đầu ghép 2 nút nhỏ nhất</span>';

    return `
      <div class="viz-stats">
        <div class="viz-stat"><span>Số nút còn trong Heap</span><strong>${st.heap.length}</strong></div>
        <div class="viz-stat stat-success"><span>Tổng số bit tích lũy</span><strong>${st.totalBits} bit</strong></div>
        <div class="viz-stat"><span>So với mã 8-bit cố định</span><strong>120 bit</strong></div>
      </div>
      <div class="viz-subbox" style="margin-bottom:12px;">
        <div class="viz-sublabel">Phép ghép ở bước này:</div>
        ${pickedHtml}
      </div>
      <div class="viz-subbox">
        <div class="viz-sublabel">Trạng thái Min-Heap (tăng dần — 2 nút màu vàng sẽ được ghép tiếp):</div>
        <div class="viz-chips">${heapChips}</div>
      </div>
    `;
  }

  // =========================================================================
  // BÀI 7: Cây khung nhỏ nhất (Kruskal trên đồ thị có trọng số)
  // =========================================================================
  function buildP7Steps() {
    const edges = [
      [1, 3, 1], [2, 5, 1], [2, 3, 2], [5, 6, 2],
      [1, 7, 3], [3, 6, 3], [5, 7, 3], [1, 2, 4],
      [4, 5, 5], [2, 4, 6], [3, 5, 8]
    ];
    const parent = [0, 1, 2, 3, 4, 5, 6, 7];
    const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const getComps = () => {
      const m = {};
      for (let i = 1; i <= 7; i++) {
        const r = find(i);
        if (!m[r]) m[r] = [];
        m[r].push(i);
      }
      return Object.values(m).map((arr) => `{${arr.join(",")}}`);
    };

    const steps = [];
    const accepted = [];
    const rejected = [];
    let total = 0;

    steps.push({
      title: "Sắp xếp cạnh tăng dần",
      explain: "Kruskal sắp xếp 11 cạnh theo trọng số tăng dần. Ban đầu có 7 thành phần rời nhau, cần chọn đúng n − 1 = 6 cạnh.",
      edges, curIdx: -1, status: "init", accepted: [], rejected: [], total: 0, comps: getComps()
    });

    for (let idx = 0; idx < edges.length; idx++) {
      const [u, v, w] = edges[idx];
      const ru = find(u);
      const rv = find(v);
      let status = "";
      let explain = "";
      if (ru !== rv) {
        parent[ru] = rv;
        accepted.push(idx);
        total += w;
        status = "accept";
        explain = `Xét cạnh (${u}, ${v}) trọng số ${w}: hai đầu mút thuộc 2 thành phần khác nhau → CHỌN cạnh! Tổng trọng số = ${total} (${accepted.length}/6 cạnh).`;
      } else {
        rejected.push(idx);
        status = "reject";
        explain = `Xét cạnh (${u}, ${v}) trọng số ${w}: cả ${u} và ${v} đã chung thành phần → BỎ qua vì sẽ tạo chu trình!`;
      }

      steps.push({
        title: `Cạnh (${u}, ${v}), w = ${w} — ${status === "accept" ? "CHỌN" : "BỎ"}`,
        explain,
        edges, curIdx: idx, status, accepted: [...accepted], rejected: [...rejected], total, comps: getComps()
      });

      if (accepted.length === 6) {
        steps.push({
          title: "Đủ 6 cạnh — Hoàn thành MST!",
          explain: `Đã chọn đủ n − 1 = 6 cạnh, cả 7 đỉnh đã liên thông. Tổng trọng số cây khung nhỏ nhất = ${total}.`,
          edges, curIdx: -1, status: "done", accepted: [...accepted], rejected: [...rejected], total, comps: getComps()
        });
        break;
      }
    }
    return steps;
  }

  function renderP7(st) {
    const pos = {
      1: [70, 55],
      2: [195, 45],
      3: [130, 145],
      4: [345, 50],
      5: [275, 130],
      6: [215, 210],
      7: [65, 200]
    };

    const edgeSvg = st.edges
      .map(([u, v, w], idx) => {
        const [x1, y1] = pos[u];
        const [x2, y2] = pos[v];
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        let cls = "svg-edge";
        if (idx === st.curIdx && st.status === "reject") cls += " edge-reject";
        else if (idx === st.curIdx && st.status === "accept") cls += " edge-cur-accept";
        else if (st.accepted.includes(idx)) cls += " edge-mst";
        else if (st.rejected.includes(idx)) cls += " edge-dim";

        return `
          <g>
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" />
            <rect x="${mx - 10}" y="${my - 9}" width="20" height="17" rx="4" class="svg-w-bg" />
            <text x="${mx}" y="${my + 3}" class="svg-w-txt">${w}</text>
          </g>`;
      })
      .join("");

    const nodeSvg = Object.entries(pos)
      .map(([id, [x, y]]) => `
        <g class="svg-node node-c1">
          <circle cx="${x}" cy="${y}" r="18" />
          <text x="${x}" y="${y + 4}" class="svg-node-id">${id}</text>
        </g>`)
      .join("");

    return `
      <div class="viz-split">
        <div class="viz-svg-wrap">
          <svg viewBox="0 0 410 245" class="viz-svg">
            ${edgeSvg}
            ${nodeSvg}
          </svg>
        </div>
        <div class="viz-subbox">
          <div class="viz-stats vertical">
            <div class="viz-stat"><span>Số cạnh đã chọn</span><strong>${st.accepted.length} / 6</strong></div>
            <div class="viz-stat stat-success"><span>Tổng trọng số MST</span><strong>${st.total}</strong></div>
            <div class="viz-stat"><span>Các thành phần DSU</span><strong>${st.comps.join("  ")}</strong></div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // BÀI 8: Cắt thanh kim loại (Thanh [0..20] cắt trực quan)
  // =========================================================================
  function buildP8Steps() {
    const m = 20;
    const cuts = [13, 8, 17, 5, 9];
    const steps = [];
    let points = [0, m];
    const results = [];

    steps.push({
      title: "Thanh ban đầu [0, 20]",
      explain: "Ban đầu thanh kim loại nguyên vẹn dài 20 đơn vị (gốc cây quản lý đoạn [0, 20], elem = 20).",
      m, points: [...points], lastCut: null, results: [], maxLen: 20
    });

    for (let idx = 0; idx < cuts.length; idx++) {
      const k = cuts[idx];
      // find segment containing k
      let segL = 0, segR = m;
      for (let j = 0; j < points.length - 1; j++) {
        if (points[j] < k && k < points[j + 1]) {
          segL = points[j];
          segR = points[j + 1];
          break;
        }
      }
      points.push(k);
      points.sort((a, b) => a - b);
      let maxLen = 0;
      for (let j = 0; j < points.length - 1; j++) {
        maxLen = Math.max(maxLen, points[j + 1] - points[j]);
      }
      results.push(maxLen);

      steps.push({
        title: `Nhát cắt #${idx + 1} tại vị trí ${k}`,
        explain: `Đoạn [${segL}, ${segR}] bị tách thành 2 đoạn con [${segL}, ${k}] (dài ${k - segL}) và [${k}, ${segR}] (dài ${segR - k}). Đoạn dài nhất hiện tại = ${maxLen}.`,
        m, points: [...points], lastCut: k, results: [...results], maxLen
      });
    }
    return steps;
  }

  function renderP8(st) {
    const segs = [];
    for (let j = 0; j < st.points.length - 1; j++) {
      const a = st.points[j];
      const b = st.points[j + 1];
      const len = b - a;
      const pct = (len / st.m) * 100;
      const isMax = len === st.maxLen;
      segs.push(`
        <div class="rod-seg ${isMax ? "rod-max" : ""}" style="width:${pct}%">
          <span class="rod-len">${len}</span>
          <span class="rod-range">[${a},${b}]</span>
        </div>`);
    }

    const resChips = st.results.length
      ? st.results.map((v, idx) => `<span class="viz-chip ${idx === st.results.length - 1 ? "chip-success" : "chip-accent"}">${v}</span>`).join("")
      : '<span class="viz-empty">Chưa cắt</span>';

    return `
      <div class="viz-stats">
        <div class="viz-stat"><span>Nhát cắt vừa thực hiện</span><strong>${st.lastCut !== null ? `x = ${st.lastCut}` : "chưa cắt"}</strong></div>
        <div class="viz-stat stat-success"><span>Đoạn dài nhất (<code>root.elem</code>)</span><strong>${st.maxLen}</strong></div>
      </div>
      <div class="rod-bar">${segs.join("")}</div>
      <div class="viz-subbox">
        <div class="viz-sublabel">Kết quả in ra sau từng nhát cắt:</div>
        <div class="viz-chips">${resChips}</div>
      </div>
    `;
  }

  // =========================================================================
  // BÀI 9: Đếm số nghịch thế (Cây nhị phân theo miền giá trị [1, 6))
  // =========================================================================
  function buildP9Steps() {
    const arr = [3, 1, 4, 5, 2];
    const nodes = [
      { id: "1-6", a: 1, b: 6, x: 220, y: 30, l: "1-3", r: "3-6" },
      { id: "1-3", a: 1, b: 3, x: 110, y: 95, l: "1-2", r: "2-3" },
      { id: "3-6", a: 3, b: 6, x: 330, y: 95, l: "3-4", r: "4-6" },
      { id: "1-2", a: 1, b: 2, x: 60, y: 165, l: null, r: null },
      { id: "2-3", a: 2, b: 3, x: 160, y: 165, l: null, r: null },
      { id: "3-4", a: 3, b: 4, x: 270, y: 165, l: null, r: null },
      { id: "4-6", a: 4, b: 6, x: 380, y: 165, l: "4-5", r: "5-6" },
      { id: "4-5", a: 4, b: 5, x: 335, y: 230, l: null, r: null },
      { id: "5-6", a: 5, b: 6, x: 425, y: 230, l: null, r: null }
    ];
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const elem = Object.fromEntries(nodes.map((n) => [n.id, 0]));
    let res = 0;
    const steps = [];

    steps.push({
      title: "Khởi tạo cây miền giá trị [1, 6)",
      explain: "Mỗi nút [a, b) đếm số phần tử đã chèn có giá trị thuộc [a, b). Ban đầu tất cả elem = 0, res = 0.",
      arr, idx: -1, nodes, elem: { ...elem }, path: [], addedNodes: [], addedVal: 0, res: 0
    });

    for (let idx = 0; idx < arr.length; idx++) {
      const k = arr[idx];
      const path = [];
      const addedNodes = [];
      let addedVal = 0;

      let cur = byId["1-6"];
      while (cur) {
        path.push(cur.id);
        elem[cur.id] += 1;
        if (!cur.l) break;
        const leftNode = byId[cur.l];
        if (k < leftNode.b) {
          const rightNode = byId[cur.r];
          addedNodes.push(rightNode.id);
          addedVal += elem[rightNode.id];
          cur = leftNode;
        } else {
          cur = byId[cur.r];
        }
      }
      res += addedVal;

      const addExplain = addedNodes.length
        ? `Khi rẽ trái, cộng elem của con phải (${addedNodes.map((id) => `[${byId[id].a},${byId[id].b})=${elem[id]}`).join(", ")}) → cộng thêm ${addedVal}.`
        : `Không rẽ trái lần nào → không có phần tử nào đứng trước mà lớn hơn ${k}.`;

      steps.push({
        title: `Chèn a[${idx}] = ${k}`,
        explain: `Đi từ gốc xuống lá [${k}, ${k + 1}) và tăng elem thêm 1 trên đường đi. ${addExplain} Tổng nghịch thế res = ${res}.`,
        arr, idx, nodes, elem: { ...elem }, path, addedNodes, addedVal, res
      });
    }
    return steps;
  }

  function renderP9(st) {
    const byId = Object.fromEntries(st.nodes.map((n) => [n.id, n]));
    const edgesSvg = st.nodes
      .flatMap((n) => {
        const out = [];
        for (const childId of [n.l, n.r]) {
          if (!childId) continue;
          const c = byId[childId];
          const onPath = st.path.includes(n.id) && st.path.includes(c.id);
          out.push(`<line x1="${n.x}" y1="${n.y}" x2="${c.x}" y2="${c.y}" class="svg-edge ${onPath ? "edge-active" : ""}" />`);
        }
        return out;
      })
      .join("");

    const nodesSvg = st.nodes
      .map((n) => {
        const onPath = st.path.includes(n.id);
        const isAdded = st.addedNodes.includes(n.id);
        let cls = "tree-box";
        if (isAdded) cls += " tree-added";
        else if (onPath) cls += " tree-path";
        return `
          <g class="${cls}">
            <rect x="${n.x - 30}" y="${n.y - 18}" width="60" height="36" rx="7" />
            <text x="${n.x}" y="${n.y - 3}" class="tree-range">[${n.a},${n.b})</text>
            <text x="${n.x}" y="${n.y + 12}" class="tree-val">e=${st.elem[n.id]}</text>
          </g>`;
      })
      .join("");

    const arrHtml = st.arr
      .map((v, i) => `<span class="viz-chip ${i === st.idx ? "chip-accent" : i < st.idx ? "chip-done" : ""}">${v}</span>`)
      .join("");

    return `
      <div class="viz-stats">
        <div class="viz-stat"><span>Dãy đầu vào</span><div class="viz-chips inline">${arrHtml}</div></div>
        <div class="viz-stat"><span>Cộng thêm ở bước này</span><strong>+${st.addedVal}</strong></div>
        <div class="viz-stat stat-success"><span>Tổng số nghịch thế</span><strong>${st.res}</strong></div>
      </div>
      <div class="viz-svg-wrap">
        <svg viewBox="0 0 470 265" class="viz-svg">
          ${edgesSvg}
          ${nodesSvg}
        </svg>
      </div>
      <div class="viz-legend">
        <span class="lg"><i class="dot dot-blue"></i>Đường đi chèn k (elem += 1)</span>
        <span class="lg"><i class="dot dot-green"></i>Con phải được cộng vào res khi rẽ trái</span>
      </div>
    `;
  }

  // =========================================================================
  // BÀI 10: Truy vấn max (Segment Tree theo đoạn chỉ số [1, 7))
  // =========================================================================
  function buildP10Steps() {
    const arr = [3, 1, 4, 1, 5, 2];
    const nodes = [
      { id: "1-7", a: 1, b: 7, e: 5, x: 235, y: 28, l: "1-4", r: "4-7" },
      { id: "1-4", a: 1, b: 4, e: 4, x: 120, y: 92, l: "1-2", r: "2-4" },
      { id: "4-7", a: 4, b: 7, e: 5, x: 350, y: 92, l: "4-5", r: "5-7" },
      { id: "1-2", a: 1, b: 2, e: 3, x: 55, y: 160, l: null, r: null },
      { id: "2-4", a: 2, b: 4, e: 4, x: 170, y: 160, l: "2-3", r: "3-4" },
      { id: "4-5", a: 4, b: 5, e: 1, x: 290, y: 160, l: null, r: null },
      { id: "5-7", a: 5, b: 7, e: 5, x: 405, y: 160, l: "5-6", r: "6-7" },
      { id: "2-3", a: 2, b: 3, e: 1, x: 130, y: 226, l: null, r: null },
      { id: "3-4", a: 3, b: 4, e: 4, x: 210, y: 226, l: null, r: null },
      { id: "5-6", a: 5, b: 6, e: 5, x: 365, y: 226, l: null, r: null },
      { id: "6-7", a: 6, b: 7, e: 2, x: 445, y: 226, l: null, r: null }
    ];

    return [
      {
        title: "Cây sau khi nạp dãy a = [3, 1, 4, 1, 5, 2]",
        explain: "Mỗi nút [a, b) lưu giá trị lớn nhất e của các phần tử có chỉ số trong nửa khoảng [a, b). Truy vấn [L, R] sẽ gọi get(gốc, L, R + 1).",
        arr, nodes, query: null, visited: [], matched: [], ans: "—"
      },
      {
        title: "Truy vấn 1: L = 1, R = 3 → get([1, 4))",
        explain: "Nửa khoảng [1, 4) nằm trọn trong con trái của gốc và khớp chính xác nút [1, 4) → trả về ngay e = 4 (không cần đi sâu hơn).",
        arr, nodes, query: [1, 3], visited: ["1-7"], matched: ["1-4"], ans: "4"
      },
      {
        title: "Truy vấn 2: L = 2, R = 4 → get([2, 5))",
        explain: "Đoạn [2, 5) cắt qua điểm chia 4 nên tách làm 2 nhánh: trái lấy nút [2, 4) (e = 4), phải lấy nút [4, 5) (e = 1) → max(4, 1) = 4.",
        arr, nodes, query: [2, 4], visited: ["1-7", "1-4", "4-7"], matched: ["2-4", "4-5"], ans: "max(4, 1) = 4"
      },
      {
        title: "Truy vấn 3: L = 4, R = 6 → get([4, 7))",
        explain: "Nửa khoảng [4, 7) nằm trọn trong con phải của gốc và khớp chính xác nút [4, 7) → trả về ngay e = 5.",
        arr, nodes, query: [4, 6], visited: ["1-7"], matched: ["4-7"], ans: "5"
      },
      {
        title: "Truy vấn 4: L = 2, R = 2 → get([2, 3))",
        explain: "Đi từ gốc [1, 7) → [1, 4) → [2, 4) → khớp chính xác lá [2, 3) → trả về e = 1.",
        arr, nodes, query: [2, 2], visited: ["1-7", "1-4", "2-4"], matched: ["2-3"], ans: "1"
      }
    ];
  }

  function renderP10(st) {
    const byId = Object.fromEntries(st.nodes.map((n) => [n.id, n]));
    const edgesSvg = st.nodes
      .flatMap((n) => {
        const out = [];
        for (const childId of [n.l, n.r]) {
          if (!childId) continue;
          const c = byId[childId];
          const active =
            (st.visited.includes(n.id) || st.matched.includes(n.id)) &&
            (st.visited.includes(c.id) || st.matched.includes(c.id));
          out.push(`<line x1="${n.x}" y1="${n.y}" x2="${c.x}" y2="${c.y}" class="svg-edge ${active ? "edge-active" : ""}" />`);
        }
        return out;
      })
      .join("");

    const nodesSvg = st.nodes
      .map((n) => {
        const isMatched = st.matched.includes(n.id);
        const isVisited = st.visited.includes(n.id);
        let cls = "tree-box";
        if (isMatched) cls += " tree-added";
        else if (isVisited) cls += " tree-path";
        return `
          <g class="${cls}">
            <rect x="${n.x - 29}" y="${n.y - 18}" width="58" height="36" rx="7" />
            <text x="${n.x}" y="${n.y - 3}" class="tree-range">[${n.a},${n.b})</text>
            <text x="${n.x}" y="${n.y + 12}" class="tree-val">e=${n.e}</text>
          </g>`;
      })
      .join("");

    const arrHtml = st.arr
      .map((v, idx) => {
        const i1 = idx + 1;
        const inQ = st.query && i1 >= st.query[0] && i1 <= st.query[1];
        return `<span class="viz-chip ${inQ ? "chip-success" : ""}">a[${i1}]=${v}</span>`;
      })
      .join("");

    return `
      <div class="viz-stats">
        <div class="viz-stat"><span>Đoạn truy vấn</span><div class="viz-chips inline">${arrHtml}</div></div>
        <div class="viz-stat stat-success"><span>Kết quả trả về</span><strong>${esc(st.ans)}</strong></div>
      </div>
      <div class="viz-svg-wrap">
        <svg viewBox="0 0 495 262" class="viz-svg">
          ${edgesSvg}
          ${nodesSvg}
        </svg>
      </div>
      <div class="viz-legend">
        <span class="lg"><i class="dot dot-blue"></i>Nút trung gian đi qua</span>
        <span class="lg"><i class="dot dot-green"></i>Nút khớp đoạn trả về giá trị e</span>
      </div>
    `;
  }

  const BUILDERS = {
    1: { build: buildP1Steps, render: renderP1 },
    2: { build: buildP2Steps, render: renderP2 },
    3: { build: buildP3Steps, render: renderP3 },
    4: { build: buildP4Steps, render: renderP4 },
    5: { build: buildP5Steps, render: renderP5 },
    6: { build: buildP6Steps, render: renderP6 },
    7: { build: buildP7Steps, render: renderP7 },
    8: { build: buildP8Steps, render: renderP8 },
    9: { build: buildP9Steps, render: renderP9 },
    10: { build: buildP10Steps, render: renderP10 }
  };

  const cache = {};

  window.VISUALIZERS = {
    getSteps(problemId) {
      if (!cache[problemId]) {
        cache[problemId] = BUILDERS[problemId].build();
      }
      return cache[problemId];
    },
    renderStage(problemId, stepObj) {
      return BUILDERS[problemId].render(stepObj);
    }
  };
})();
