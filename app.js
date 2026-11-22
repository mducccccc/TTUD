(() => {
  const STORAGE_DONE = "ttud_completed_v1";
  const STORAGE_THEME = "ttud_theme_v1";
  const STORAGE_STUDY = "ttud_study_mode_v1";

  const state = {
    currentView: "home", // "home" or problem id (1..10)
    activeTab: "idea", // "idea" | "illustration" | "code"
    activeSolutionIdx: 0,
    searchQuery: "",
    completedIds: new Set(JSON.parse(localStorage.getItem(STORAGE_DONE) || "[]")),
    studyMode: localStorage.getItem(STORAGE_STUDY) === "true",
    revealedSections: new Set(), // e.g. "1-idea", "1-code"
    traceSteps: {}, // key: `${problemId}-${tableIdx}` -> current step index or null (show all)
    playTimer: null,
    playingKey: null
  };

  // DOM refs
  const navList = document.getElementById("navList");
  const mainContent = document.getElementById("mainContent");
  const searchInput = document.getElementById("searchInput");
  const studyModeToggle = document.getElementById("studyModeToggle");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const menuToggle = document.getElementById("menuToggle");
  const goHomeBtn = document.getElementById("goHomeBtn");
  const themeToggle = document.getElementById("themeToggle");
  const themeToggleMobile = document.getElementById("themeToggleMobile");
  const toastEl = document.getElementById("toast");

  let toastTimer = null;

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2000);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Lightweight Python tokenizer for clean syntax highlighting
  const PY_KEYWORDS = new Set([
    "import", "from", "def", "class", "return", "if", "elif", "else",
    "for", "while", "in", "not", "and", "or", "is", "None", "True", "False",
    "break", "continue", "global", "pass", "as", "with", "try", "except", "lambda"
  ]);

  const PY_BUILTINS = new Set([
    "int", "str", "list", "dict", "set", "tuple", "map", "range", "len",
    "max", "min", "print", "input", "enumerate", "sorted", "sum", "abs", "self"
  ]);

  function highlightPythonLine(line) {
    const tokens = [];
    const regex = /(#.*$|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\b\d+\b|\b[A-Za-z_]\w*\b)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(escapeHtml(line.slice(lastIndex, match.index)));
      }
      const word = match[0];
      if (word.startsWith("#")) {
        tokens.push(`<span class="tok-cmt">${escapeHtml(word)}</span>`);
      } else if (word.startsWith("'") || word.startsWith('"')) {
        tokens.push(`<span class="tok-str">${escapeHtml(word)}</span>`);
      } else if (/^\d+$/.test(word)) {
        tokens.push(`<span class="tok-num">${escapeHtml(word)}</span>`);
      } else if (PY_KEYWORDS.has(word)) {
        tokens.push(`<span class="tok-kw">${escapeHtml(word)}</span>`);
      } else if (PY_BUILTINS.has(word)) {
        tokens.push(`<span class="tok-bi">${escapeHtml(word)}</span>`);
      } else {
        tokens.push(escapeHtml(word));
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      tokens.push(escapeHtml(line.slice(lastIndex)));
    }
    return tokens.join("");
  }

  function renderHighlightedCode(code) {
    const lines = code.split("\n");
    return lines
      .map(
        (line, idx) =>
          `<div class="code-line"><span class="line-no">${idx + 1}</span><span class="line-code">${highlightPythonLine(line)}</span></div>`
      )
      .join("");
  }

  // Theme
  const SUN_ICON = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const MOON_ICON = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_THEME, theme);
    const icon = theme === "dark" ? SUN_ICON : MOON_ICON;
    themeToggle.innerHTML = icon;
    themeToggleMobile.innerHTML = icon;
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(current === "dark" ? "light" : "dark");
  }

  function stopAutoPlay() {
    if (state.playTimer) {
      clearInterval(state.playTimer);
      state.playTimer = null;
      state.playingKey = null;
    }
  }

  function saveCompleted() {
    localStorage.setItem(STORAGE_DONE, JSON.stringify([...state.completedIds]));
  }

  function updateProgress() {
    const count = state.completedIds.size;
    const total = PROBLEMS.length;
    progressText.textContent = `${count} / ${total} bài`;
    progressBar.style.width = `${(count / total) * 100}%`;
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("open");
  }

  function selectView(view, tab = "idea") {
    stopAutoPlay();
    state.currentView = view;
    state.activeTab = tab;
    state.activeSolutionIdx = 0;
    closeSidebar();
    renderNav();
    renderMain();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderNav() {
    const q = state.searchQuery.trim().toLowerCase();
    const filtered = PROBLEMS.filter((p) => {
      if (!q) return true;
      return (
        `bài ${p.id}`.includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q)
      );
    });

    let html = `
      <button class="nav-item ${state.currentView === "home" ? "active" : ""}" data-view="home">
        <span class="nav-num">⌂</span>
        <span class="nav-info">
          <span class="nav-name">Tổng quan đề cương</span>
          <span class="nav-topic">10 bài trọng tâm &amp; hướng dẫn</span>
        </span>
      </button>
      <div class="nav-divider"></div>
    `;

    if (filtered.length === 0) {
      html += `<div style="padding:14px 10px;font-size:0.84rem;color:var(--text-muted);text-align:center;">Không tìm thấy bài phù hợp.</div>`;
    } else {
      html += filtered
        .map((p) => {
          const isActive = state.currentView === p.id;
          const isDone = state.completedIds.has(p.id);
          return `
            <button class="nav-item ${isActive ? "active" : ""} ${isDone ? "done" : ""}" data-view="${p.id}">
              <span class="nav-num">${isDone ? "✓" : p.id}</span>
              <span class="nav-info">
                <span class="nav-name">Bài ${p.id}. ${escapeHtml(p.title)}</span>
                <span class="nav-topic">${escapeHtml(p.topic)}</span>
              </span>
            </button>
          `;
        })
        .join("");
    }

    navList.innerHTML = html;

    navList.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = btn.dataset.view;
        selectView(v === "home" ? "home" : Number(v));
      });
    });
  }

  function renderHome() {
    const rows = PROBLEMS.map((p) => {
      const done = state.completedIds.has(p.id);
      return `
        <tr data-open-id="${p.id}">
          <td><strong>${p.id}</strong></td>
          <td>
            <strong>${escapeHtml(p.title)}</strong>
          </td>
          <td>${p.code ? `<code>${escapeHtml(p.code)}</code>` : `<span style="color:var(--text-muted)">—</span>`}</td>
          <td>${escapeHtml(p.topic)}</td>
          <td><code>${escapeHtml(p.complexity)}</code></td>
          <td>
            <span class="pill ${done ? "btn-done" : ""}">${done ? "✓ Đã học" : "Chưa học"}</span>
          </td>
        </tr>
      `;
    }).join("");

    mainContent.innerHTML = `
      <section class="card hero-card">
        <span class="hero-badge">ĐỀ CƯƠNG ÔN TẬP K65</span>
        <h2>${escapeHtml(COURSE_INFO.title)}</h2>
        <p class="hero-exam">${escapeHtml(COURSE_INFO.examNote)}</p>
        <ul class="tips-list">
          ${COURSE_INFO.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}
        </ul>
      </section>

      <section class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div>
            <h3 style="font-size:1.1rem;">Danh sách 10 bài trong đề cương</h3>
            <p style="font-size:0.85rem;color:var(--text-muted);">Bấm vào từng bài để học đủ 3 phần: Ý tưởng, Minh họa từng bước và Code Python.</p>
          </div>
          <button class="btn btn-primary" id="startFirstBtn">Bắt đầu học từ Bài 1 →</button>
        </div>

        <div class="overview-table-wrap">
          <table class="data-table clickable">
            <thead>
              <tr>
                <th>TT</th>
                <th>Tên bài</th>
                <th>Mã bài</th>
                <th>Kiến thức trọng tâm</th>
                <th>Độ phức tạp</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
    `;

    document.getElementById("startFirstBtn").addEventListener("click", () => selectView(1));
    mainContent.querySelectorAll("tr[data-open-id]").forEach((tr) => {
      tr.addEventListener("click", () => selectView(Number(tr.dataset.openId)));
    });
  }

  function wrapSpoiler(sectionKey, innerHtml, label) {
    const shouldHide = state.studyMode && !state.revealedSections.has(sectionKey);
    if (!shouldHide) return innerHtml;
    return `
      <div class="spoiler-wrap">
        <div class="spoiler-content blurred">${innerHtml}</div>
        <div class="spoiler-overlay">
          <p>Chế độ tự luyện đang che phần ${escapeHtml(label)}</p>
          <button class="btn btn-primary" data-reveal="${sectionKey}">Hiện ${escapeHtml(label)}</button>
        </div>
      </div>
    `;
  }

  function renderIdeaTab(p) {
    const content = `
      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-label">Cấu trúc dữ liệu &amp; Kỹ thuật</div>
          <div class="meta-value">${escapeHtml(p.dataStructure)}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Độ phức tạp thời gian</div>
          <div class="meta-value"><code>${escapeHtml(p.complexity)}</code></div>
        </div>
      </div>

      <h3 style="font-size:1rem;margin-bottom:12px;">Hướng dẫn ý tưởng</h3>
      <ul class="idea-list">
        ${p.idea.points
          .map(
            (pt, i) => `
          <li>
            <span class="idea-step">${i + 1}</span>
            <span>${escapeHtml(pt)}</span>
          </li>`
          )
          .join("")}
      </ul>
    `;

    return wrapSpoiler(`${p.id}-idea`, content, "Ý tưởng");
  }

  function renderIllustrationTab(p) {
    return p.illustration.tables
      .map((tbl, tIdx) => {
        const key = `${p.id}-${tIdx}`;
        const step = state.traceSteps[key]; // undefined or null => show all
        const total = tbl.rows.length;
        const isStepping = typeof step === "number";
        const isPlaying = state.playingKey === key;

        const bodyRows = tbl.rows
          .map((row, rIdx) => {
            let cls = "";
            if (isStepping) {
              if (rIdx === step) cls = "row-active";
              else if (rIdx > step) cls = "row-future";
            }
            return `<tr class="${cls}" data-trace-key="${key}" data-row-idx="${rIdx}" style="cursor:pointer;">
              ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}
            </tr>`;
          })
          .join("");

        return `
          <div class="trace-section">
            <div class="trace-header">
              <div class="trace-title">${escapeHtml(tbl.title)}</div>
              ${
                total > 1
                  ? `<div class="trace-controls">
                      <button class="btn btn-sm" data-trace-action="prev" data-trace-key="${key}">← Trước</button>
                      <span class="step-indicator">${isStepping ? `Bước ${step + 1} / ${total}` : `Tất cả (${total} bước)`}</span>
                      <button class="btn btn-sm" data-trace-action="next" data-trace-key="${key}">Sau →</button>
                      <button class="btn btn-sm ${isPlaying ? "btn-primary" : ""}" data-trace-action="play" data-trace-key="${key}">${isPlaying ? "❚❚ Dừng" : "▶ Chạy từng bước"}</button>
                      <button class="btn btn-sm" data-trace-action="all" data-trace-key="${key}">Hiện tất cả</button>
                    </div>`
                  : ""
              }
            </div>
            <div class="table-scroll">
              <table class="data-table trace-table">
                <thead>
                  <tr>${tbl.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>
                </thead>
                <tbody>${bodyRows}</tbody>
              </table>
            </div>
            ${tbl.note ? `<div class="trace-note">💡 ${escapeHtml(tbl.note)}</div>` : ""}
          </div>
        `;
      })
      .join("");
  }

  function renderCodeTab(p) {
    const sol = p.solutions[state.activeSolutionIdx] || p.solutions[0];
    const switcher =
      p.solutions.length > 1
        ? `<div class="solution-tabs">
            ${p.solutions
              .map(
                (s, idx) =>
                  `<button class="btn btn-sm ${idx === state.activeSolutionIdx ? "btn-primary" : ""}" data-sol-idx="${idx}">${escapeHtml(s.label)}</button>`
              )
              .join("")}
          </div>`
        : "";

    const content = `
      ${switcher}
      <div class="code-card">
        <div class="code-toolbar">
          <div class="code-lang">
            <span class="code-dots"><span></span><span></span><span></span></span>
            <span>${escapeHtml(sol.label)}</span>
          </div>
          <button class="copy-btn" id="copyCodeBtn">Sao chép code</button>
        </div>
        <div class="code-body">${renderHighlightedCode(sol.code)}</div>
      </div>
    `;

    return wrapSpoiler(`${p.id}-code`, content, "Code Python");
  }

  function renderProblem(id) {
    const p = PROBLEMS.find((item) => item.id === id);
    if (!p) return renderHome();

    const isDone = state.completedIds.has(p.id);
    const prevId = p.id > 1 ? p.id - 1 : null;
    const nextId = p.id < PROBLEMS.length ? p.id + 1 : null;

    let tabPanelHtml = "";
    if (state.activeTab === "idea") tabPanelHtml = renderIdeaTab(p);
    else if (state.activeTab === "illustration") tabPanelHtml = renderIllustrationTab(p);
    else tabPanelHtml = renderCodeTab(p);

    const examplesHtml = p.statement.examples
      .map(
        (ex) => `
        <div class="io-grid">
          <div class="io-card">
            <div class="io-label">${escapeHtml(ex.label)} — Input</div>
            <pre>${escapeHtml(ex.input)}</pre>
          </div>
          <div class="io-card">
            <div class="io-label">${escapeHtml(ex.label)} — Output</div>
            <pre>${escapeHtml(ex.output)}</pre>
          </div>
        </div>`
      )
      .join("");

    mainContent.innerHTML = `
      <div class="problem-header">
        <div>
          <div class="problem-kicker">
            <span class="pill pill-accent">Bài ${p.id} / ${PROBLEMS.length}</span>
            <span class="pill">${escapeHtml(p.topic)}</span>
            ${
              p.code
                ? `<span class="pill pill-code" id="copyProblemCode" title="Bấm để sao chép mã bài nộp trên laptrinhonline.club">Mã bài: ${escapeHtml(p.code)} ⧉</span>`
                : ""
            }
          </div>
          <h2 class="problem-title">${escapeHtml(p.title)}</h2>
        </div>

        <div class="header-actions">
          <button class="btn ${isDone ? "btn-done" : ""}" id="toggleDoneBtn">
            ${isDone ? "✓ Đã nắm vững" : "○ Đánh dấu đã học"}
          </button>
        </div>
      </div>

      <details class="statement-box" open>
        <summary class="statement-summary">
          <span>📄 Đề bài &amp; Ví dụ</span>
          <span style="font-size:0.78rem;color:var(--text-muted);font-weight:500;">Bấm để thu gọn / mở rộng</span>
        </summary>
        <div class="statement-body">
          <p>${escapeHtml(p.statement.description)}</p>
          <p><strong>Input:</strong> ${escapeHtml(p.statement.input)}</p>
          <p><strong>Output:</strong> ${escapeHtml(p.statement.output)}</p>
          ${examplesHtml}
        </div>
      </details>

      <div class="tabs-bar" role="tablist">
        <button class="tab-btn ${state.activeTab === "idea" ? "active" : ""}" data-tab="idea" role="tab">
          <span class="tab-num">1</span> Ý tưởng
        </button>
        <button class="tab-btn ${state.activeTab === "illustration" ? "active" : ""}" data-tab="illustration" role="tab">
          <span class="tab-num">2</span> Minh họa
        </button>
        <button class="tab-btn ${state.activeTab === "code" ? "active" : ""}" data-tab="code" role="tab">
          <span class="tab-num">3</span> Code
        </button>
      </div>

      <section class="card" id="tabPanel">
        ${tabPanelHtml}
      </section>

      <div class="problem-nav">
        <button class="btn" id="prevProblemBtn" ${prevId ? "" : "disabled style='opacity:0.45;cursor:not-allowed'"}>
          ← ${prevId ? `Bài ${prevId}` : "Đầu danh sách"}
        </button>
        <button class="btn btn-primary" id="nextProblemBtn" ${nextId ? "" : "disabled style='opacity:0.45;cursor:not-allowed'"}>
          ${nextId ? `Bài ${nextId}` : "Cuối danh sách"} →
        </button>
      </div>
    `;

    // Bind events
    document.getElementById("toggleDoneBtn").addEventListener("click", () => {
      if (state.completedIds.has(p.id)) {
        state.completedIds.delete(p.id);
        showToast(`Đã bỏ đánh dấu Bài ${p.id}`);
      } else {
        state.completedIds.add(p.id);
        showToast(`Đã hoàn thành Bài ${p.id}!`);
      }
      saveCompleted();
      updateProgress();
      renderNav();
      renderProblem(p.id);
    });

    const copyProblemCodeEl = document.getElementById("copyProblemCode");
    if (copyProblemCodeEl) {
      copyProblemCodeEl.addEventListener("click", () => {
        navigator.clipboard.writeText(p.code).then(() => {
          showToast(`Đã sao chép mã bài: ${p.code}`);
        });
      });
    }

    mainContent.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        stopAutoPlay();
        state.activeTab = btn.dataset.tab;
        renderProblem(p.id);
      });
    });

    if (prevId) {
      document.getElementById("prevProblemBtn").addEventListener("click", () => selectView(prevId));
    }
    if (nextId) {
      document.getElementById("nextProblemBtn").addEventListener("click", () => selectView(nextId));
    }

    bindTabPanelEvents(p);
  }

  function bindTabPanelEvents(p) {
    // Reveal buttons (study mode)
    mainContent.querySelectorAll("[data-reveal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.revealedSections.add(btn.dataset.reveal);
        renderProblem(p.id);
      });
    });

    // Solution switcher (e.g. Kruskal / Prim)
    mainContent.querySelectorAll("[data-sol-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeSolutionIdx = Number(btn.dataset.solIdx);
        renderProblem(p.id);
      });
    });

    // Copy code
    const copyCodeBtn = document.getElementById("copyCodeBtn");
    if (copyCodeBtn) {
      copyCodeBtn.addEventListener("click", () => {
        const sol = p.solutions[state.activeSolutionIdx] || p.solutions[0];
        navigator.clipboard.writeText(sol.code).then(() => {
          copyCodeBtn.textContent = "✓ Đã sao chép!";
          showToast("Đã sao chép chương trình Python");
          setTimeout(() => {
            if (copyCodeBtn) copyCodeBtn.textContent = "Sao chép code";
          }, 1800);
        });
      });
    }

    // Trace controls
    mainContent.querySelectorAll("[data-trace-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.traceKey;
        const action = btn.dataset.traceAction;
        const tIdx = Number(key.split("-")[1]);
        const total = p.illustration.tables[tIdx].rows.length;
        const current = state.traceSteps[key];

        if (action === "all") {
          stopAutoPlay();
          state.traceSteps[key] = null;
        } else if (action === "prev") {
          stopAutoPlay();
          if (typeof current !== "number") state.traceSteps[key] = total - 1;
          else state.traceSteps[key] = Math.max(0, current - 1);
        } else if (action === "next") {
          stopAutoPlay();
          if (typeof current !== "number") state.traceSteps[key] = 0;
          else state.traceSteps[key] = Math.min(total - 1, current + 1);
        } else if (action === "play") {
          if (state.playingKey === key) {
            stopAutoPlay();
          } else {
            stopAutoPlay();
            state.playingKey = key;
            state.traceSteps[key] =
              typeof current === "number" && current < total - 1 ? current : 0;
            state.playTimer = setInterval(() => {
              const stepNow = state.traceSteps[key];
              if (stepNow >= total - 1) {
                stopAutoPlay();
                renderProblem(p.id);
                return;
              }
              state.traceSteps[key] = stepNow + 1;
              renderProblem(p.id);
            }, 950);
          }
        }
        renderProblem(p.id);
      });
    });

    // Click any row in trace table to jump to that step
    mainContent.querySelectorAll("tr[data-trace-key]").forEach((tr) => {
      tr.addEventListener("click", () => {
        stopAutoPlay();
        const key = tr.dataset.traceKey;
        const rIdx = Number(tr.dataset.rowIdx);
        state.traceSteps[key] = rIdx;
        renderProblem(p.id);
      });
    });
  }

  function renderMain() {
    if (state.currentView === "home") renderHome();
    else renderProblem(state.currentView);
  }

  // Global event listeners
  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderNav();
  });

  studyModeToggle.checked = state.studyMode;
  studyModeToggle.addEventListener("change", (e) => {
    state.studyMode = e.target.checked;
    localStorage.setItem(STORAGE_STUDY, String(state.studyMode));
    if (state.studyMode) {
      state.revealedSections.clear();
      showToast("Đã bật Chế độ tự luyện (che Ý tưởng & Code)");
    } else {
      showToast("Đã tắt Chế độ tự luyện");
    }
    renderMain();
  });

  themeToggle.addEventListener("click", toggleTheme);
  themeToggleMobile.addEventListener("click", toggleTheme);

  goHomeBtn.addEventListener("click", () => selectView("home"));
  goHomeBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") selectView("home");
  });

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    sidebarOverlay.classList.toggle("open");
  });
  sidebarOverlay.addEventListener("click", closeSidebar);

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      return;
    }
    if (typeof state.currentView === "number") {
      if (e.key === "1") {
        stopAutoPlay();
        state.activeTab = "idea";
        renderProblem(state.currentView);
      } else if (e.key === "2") {
        stopAutoPlay();
        state.activeTab = "illustration";
        renderProblem(state.currentView);
      } else if (e.key === "3") {
        stopAutoPlay();
        state.activeTab = "code";
        renderProblem(state.currentView);
      } else if (e.key === "ArrowLeft" && state.currentView > 1) {
        selectView(state.currentView - 1);
      } else if (e.key === "ArrowRight" && state.currentView < PROBLEMS.length) {
        selectView(state.currentView + 1);
      }
    }
  });

  // Init
  const savedTheme = localStorage.getItem(STORAGE_THEME) || "light";
  applyTheme(savedTheme);
  updateProgress();
  renderNav();
  renderMain();
})();
