/* =============================================
   DATA
   ============================================= */

   const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  
  let currentYear = 2026;
  let currentMonthIndex = 0;
  let activeSessionId = null;
  let selectedDifficulty = 'very-hard';
  
  const sessionsData = {
    '2026-01-01': [
      { id: 's1', time: '10:00 – 12:00', title: 'Session-training', coach: 'Coach pep' },
      { id: 's2', time: '20:00 – 22:00', title: 'Session-Boxing',   coach: 'Coach pep' },
    ],
    '2026-01-08': [
      { id: 's3', time: '10:00 – 12:00', title: 'Session-training', coach: 'Coach pep' },
    ],
    '2026-01-15': [
      { id: 's4', time: '09:00 – 11:00', title: 'Session-Cardio',   coach: 'Coach pep' },
      { id: 's5', time: '18:00 – 19:30', title: 'Session-Sparring', coach: 'Coach pep' },
    ],
  };
  
  const reviewsData = {
    's1': [], 's2': [], 's3': [], 's4': [], 's5': []
  };
  
  /* =============================================
     RENDER SCHEDULE
     ============================================= */
  function formatDate(dateStr) {
    const d    = new Date(dateStr + 'T00:00:00');
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const mons = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${days[d.getDay()]}, ${mons[d.getMonth()]} ${d.getDate()}`;
  }
  
  function renderSchedule() {
    const container   = document.getElementById('schedule-container');
    const label       = document.getElementById('month-label');
    const filterValue = document.getElementById('filter-select').value;
  
    label.textContent = `${months[currentMonthIndex]} ${currentYear}`;
  
    const prefix = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
    const entries = Object.entries(sessionsData)
      .filter(([date]) => date.startsWith(prefix))
      .sort(([a], [b]) => a.localeCompare(b));
  
    if (entries.length === 0) {
      container.innerHTML = `<div style="padding:30px 28px;color:#444;font-size:12px;">No sessions this month.</div>`;
      return;
    }
  
    let html = '';
  
    entries.forEach(([date, sessions]) => {
      const filtered = filterValue === 'all'
        ? sessions
        : sessions.filter(s => s.title === filterValue);
  
      if (filtered.length === 0) return;
  
      html += `<div class="day-group">
        <div class="day-label">${formatDate(date)}</div>
        ${filtered.map(s => `
          <div class="session-row" id="row-${s.id}">
            <span class="time">${s.time}</span>
            <div class="red-bar"></div>
            <div class="session-info">
              <div class="session-title">${s.title}</div>
              <div class="session-coach">${s.coach}</div>
            </div>
            <div class="row-actions">
              <button class="btn-present" onclick="markPresent('${s.id}')">Present</button>
              <button class="btn-submit"  onclick="openModal('${s.id}', '${s.title}')">Submit</button>
            </div>
          </div>
        `).join('')}
      </div>`;
    });
  
    container.innerHTML = html || `<div style="padding:30px 28px;color:#444;font-size:12px;">No sessions match filter.</div>`;
  }
  
  /* =============================================
     FILTER
     ============================================= */
  function filterSessions() {
    renderSchedule();
  }
  
  /* =============================================
     MONTH NAVIGATION
     ============================================= */
  function changeMonth(dir) {
    currentMonthIndex += dir;
    if (currentMonthIndex > 11) { currentMonthIndex = 0;  currentYear++; }
    if (currentMonthIndex < 0)  { currentMonthIndex = 11; currentYear--; }
    renderSchedule();
  }
  
  /* =============================================
     MODAL — OPEN / CLOSE
     ============================================= */
  function openModal(sessionId, sessionTitle) {
    activeSessionId = sessionId;
    document.getElementById('modal-title').textContent   = sessionTitle;
    document.getElementById('modal-comment').value       = '';
  
    // Reset difficulty selection
    selectedDifficulty = 'very-hard';
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent === 'very-hard');
    });
  
    document.getElementById('modal-overlay').classList.add('open');
  }
  
  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    activeSessionId = null;
  }
  
  function handleOverlayClick(e) {
    if (e.target === document.getElementById('modal-overlay')) {
      closeModal();
    }
  }
  
  /* =============================================
     DIFFICULTY BUTTONS
     ============================================= */
  function selectDiff(btn, value) {
    selectedDifficulty = value;
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  
  /* =============================================
     PRESENT BUTTON
     ============================================= */
  function markPresent(sessionId) {
    const btn = document.querySelector(`#row-${sessionId} .btn-present`);
    if (btn) {
      btn.textContent = '✓ Present';
      btn.style.background = '#2d6a4f';
    }
    showToast('Marked as present!');
  }
  
  /* =============================================
     POST REVIEW
     ============================================= */
  function postReview() {
    const comment = document.getElementById('modal-comment').value.trim();
  
    if (!comment) {
      showToast('Please write a comment.');
      return;
    }
  
    if (!reviewsData[activeSessionId]) reviewsData[activeSessionId] = [];
  
    reviewsData[activeSessionId].unshift({
      difficulty: selectedDifficulty,
      text:       comment,
      date:       new Date().toLocaleDateString()
    });
  
    closeModal();
    showToast('Review posted!');
  }
  
  /* =============================================
     TOAST
     ============================================= */
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }
  
  /* =============================================
     INIT
     ============================================= */
  renderSchedule();
