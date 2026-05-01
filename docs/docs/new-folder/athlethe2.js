/* =============================================
   DATA
   ============================================= */

   const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  
  let currentYear = 2026;
  let currentMonthIndex = 0; // January
  
  // Sessions data keyed by "YYYY-MM-DD"
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
  
  // Reviews per session id
  const reviewsData = {
    's1': [
      {
        name: 'Mbappé',
        initials: 'MB',
        color: '#1a2a1a',
        textColor: '#5a8a5a',
        difficulty: 'very-hard',
        badgeClass: 'badge-veryhard',
        text: 'Great footwork today. Much better movement in the ring. Footwork improving, still crossing feet sometimes.'
      },
      {
        name: 'Holand',
        initials: 'HL',
        color: '#1a1a2a',
        textColor: '#5a5aaa',
        difficulty: 'very-hard',
        badgeClass: 'badge-veryhard',
        text: 'Needs to work on guard, dropping hands too often. Timing is off on counter punches.'
      },
    ],
    's2': [
      {
        name: 'Mbappé',
        initials: 'MB',
        color: '#1a2a1a',
        textColor: '#5a8a5a',
        difficulty: 'hard',
        badgeClass: 'badge-hard',
        text: 'Good session overall. Combinations are getting sharper. Need to improve footwork on defense.'
      },
    ],
    's3': [],
    's4': [
      {
        name: 'Holand',
        initials: 'HL',
        color: '#1a1a2a',
        textColor: '#5a5aaa',
        difficulty: 'medium',
        badgeClass: 'badge-medium',
        text: 'Solid cardio session. Endurance improving week by week. Heart rate recovery is getting better.'
      },
    ],
    's5': [],
  };
  
  let activeSessionId = 's1';
  
  /* =============================================
     RENDER SCHEDULE
     ============================================= */
  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const mons = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${days[d.getDay()]}, ${mons[d.getMonth()]} ${d.getDate()}`;
  }
  
  function renderSchedule() {
    const container = document.getElementById('schedule-container');
    const label     = document.getElementById('month-label');
  
    label.textContent = `${months[currentMonthIndex]} ${currentYear}`;
  
    const prefix = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
    const entries = Object.entries(sessionsData)
      .filter(([date]) => date.startsWith(prefix))
      .sort(([a], [b]) => a.localeCompare(b));
  
    if (entries.length === 0) {
      container.innerHTML = `<div style="padding:30px 24px;color:#444;font-size:12px;">No sessions this month.</div>`;
      return;
    }
  
    container.innerHTML = entries.map(([date, sessions]) => `
      <div class="day-group">
        <div class="day-label">${formatDate(date)}</div>
        ${sessions.map(s => `
          <div class="session-row ${s.id === activeSessionId ? 'active' : ''}"
               id="row-${s.id}"
               onclick="selectSession('${s.id}', '${s.title}')">
            <span class="time">${s.time}</span>
            <div class="red-bar"></div>
            <div class="session-info">
              <div class="session-title">${s.title}</div>
              <div class="session-coach">${s.coach}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');
  }
  
  /* =============================================
     RENDER REVIEWS
     ============================================= */
  function renderReviews(sessionId) {
    const list    = document.getElementById('reviews-list');
    const reviews = reviewsData[sessionId] || [];
  
    if (reviews.length === 0) {
      list.innerHTML = `<div style="color:#444;font-size:11px;">No reviews yet. Be the first!</div>`;
      return;
    }
  
    list.innerHTML = reviews.map(r => `
      <div class="athlete-review">
        <div class="athlete-header">
          <div class="avatar" style="background:${r.color}; color:${r.textColor};">
            ${r.initials}
          </div>
          <span class="athlete-name">${r.name}</span>
          <span class="diff-badge ${r.badgeClass}">${r.difficulty}</span>
        </div>
        <div class="review-text">${r.text}</div>
      </div>
    `).join('');
  }
  
  /* =============================================
     SESSION SELECTION
     ============================================= */
  function selectSession(sessionId, sessionTitle) {
    const prev = document.getElementById(`row-${activeSessionId}`);
    if (prev) prev.classList.remove('active');
  
    activeSessionId = sessionId;
  
    const curr = document.getElementById(`row-${sessionId}`);
    if (curr) curr.classList.add('active');
  
    document.getElementById('panel-title').textContent = sessionTitle;
    renderReviews(sessionId);
  
    // Open the right panel
    document.querySelector('.right').classList.add('open');
  }
  
  /* =============================================
     CLOSE PANEL
     ============================================= */
  function closePanel() {
    // Slide out the right panel
    document.querySelector('.right').classList.remove('open');
  
    // Reset after animation
    setTimeout(() => {
      document.getElementById('panel-title').textContent = '—';
      document.getElementById('reviews-list').innerHTML =
        `<div style="color:#444;font-size:11px;">Select a session to view reviews.</div>`;
    }, 300);
  
    activeSessionId = null;
    document.querySelectorAll('.session-row').forEach(r => r.classList.remove('active'));
  }
  
  /* =============================================
     POST REVIEW
     ============================================= */
  function postReview() {
    if (!activeSessionId) {
      showToast('Select a session first.');
      return;
    }
  
    const difficulty = document.getElementById('difficulty-select').value;
    const comment    = document.getElementById('comment-input').value.trim();
  
    if (!comment) {
      showToast('Please write a comment.');
      return;
    }
  
    const badgeMap = {
      'very-hard': 'badge-veryhard',
      'hard':      'badge-hard',
      'medium':    'badge-medium',
      'easy':      'badge-medium',
    };
  
    const newReview = {
      name:       'You',
      initials:   'YO',
      color:      '#2a1a1a',
      textColor:  '#e57373',
      difficulty: difficulty,
      badgeClass: badgeMap[difficulty],
      text:       comment,
    };
  
    if (!reviewsData[activeSessionId]) reviewsData[activeSessionId] = [];
    reviewsData[activeSessionId].unshift(newReview);
  
    renderReviews(activeSessionId);
    document.getElementById('comment-input').value = '';
    showToast('Review posted!');
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
  // Panel starts closed — no session selected by default
  activeSessionId = null;
