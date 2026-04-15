/* ============================================================
   SMART OFFICE ACCESS — Application Logic
   Navigation, data rendering, modals, and interactions.
   ============================================================ */

// -------------------- DATA --------------------
const recentAccessData = [
  {
    name: 'Main Entrance',
    meta: 'Last accessed 2h ago',
    status: 'VERIFIED',
    icon: 'door_front',
  },
  {
    name: 'Lounge Area',
    meta: 'Last accessed 5h ago',
    status: 'VERIFIED',
    icon: 'weekend',
  },
];

const activityData = [
  {
    group: 'Today, Oct 24',
    items: [
      {
        title: 'Admin entered (Fingerprint)',
        location: 'Main Entrance • Level 4',
        time: '10:15 AM',
        icon: 'fingerprint',
        type: 'success',
      },
      {
        title: 'Unauthorized attempt (Face)',
        location: 'Server Room • Restricted Access',
        time: '09:42 AM',
        icon: 'gpp_bad',
        type: 'error',
        alert: true,
      },
      {
        title: 'Sarah Jenkins (NFC)',
        location: 'Lobby Turnstile • Guest Area',
        time: '08:55 AM',
        icon: 'nfc',
        type: 'neutral',
      },
      {
        title: 'Remote Door Unlock',
        location: 'Loading Dock • Triggered by Admin',
        time: '08:12 AM',
        icon: 'lock_open',
        type: 'info',
      },
    ],
  },
  {
    group: 'Yesterday, Oct 23',
    items: [
      {
        title: 'System Maintenance Check',
        location: 'Global • Scheduled Routine',
        time: '11:55 PM',
        icon: 'build',
        type: 'neutral',
      },
      {
        title: 'Late Exit Detected',
        location: 'North Wing • Marcus Thorne',
        time: '10:30 PM',
        icon: 'exit_to_app',
        type: 'info',
      },
    ],
  },
];

// -------------------- DOM REFERENCES --------------------
const screens = document.querySelectorAll('.screen');
const navItems = document.querySelectorAll('.nav-item');
const otpModal = document.getElementById('otp-modal');
const biometricModal = document.getElementById('biometric-modal');
const recentAccessList = document.getElementById('recent-access-list');
const activityFeed = document.getElementById('activity-feed');

// -------------------- NAVIGATION --------------------
function switchScreen(screenId) {
  screens.forEach((s) => s.classList.remove('active'));
  navItems.forEach((n) => n.classList.remove('active'));

  const target = document.getElementById(`screen-${screenId}`);
  const navTarget = document.querySelector(`[data-screen="${screenId}"]`);

  if (target) target.classList.add('active');
  if (navTarget) navTarget.classList.add('active');
}

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    const screenId = item.dataset.screen;
    switchScreen(screenId);
  });
});

// View History → Activity tab
document.getElementById('btn-view-history').addEventListener('click', () => {
  switchScreen('activity');
});

// -------------------- RENDER RECENT ACCESS --------------------
function renderRecentAccess() {
  recentAccessList.innerHTML = recentAccessData
    .map(
      (item, i) => `
    <div class="access-card animate-in" style="animation-delay: ${i * 60}ms">
      <div class="access-card__icon">
        <span class="material-symbols-outlined">${item.icon}</span>
      </div>
      <div class="access-card__info">
        <div class="access-card__name">${item.name}</div>
        <div class="access-card__meta">${item.meta}</div>
      </div>
      <span class="access-card__status">${item.status}</span>
    </div>
  `
    )
    .join('');
}

// -------------------- RENDER ACTIVITY FEED --------------------
function renderActivityFeed() {
  activityFeed.innerHTML = activityData
    .map(
      (group) => `
    <div class="activity-group">
      <div class="activity-group__label">${group.group}</div>
      <div class="activity-group__items">
        ${group.items
          .map(
            (item, i) => `
          <div class="activity-item animate-in" style="animation-delay: ${i * 60}ms">
            <div class="activity-item__icon activity-item__icon--${item.type}">
              <span class="material-symbols-outlined">${item.icon}</span>
            </div>
            <div class="activity-item__content">
              <div class="activity-item__title">${item.title}</div>
              <div class="activity-item__location">${item.location}</div>
            </div>
            <div class="activity-item__time ${item.alert ? 'alert' : ''}">${item.time}</div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `
    )
    .join('');
}

// -------------------- OTP MODAL --------------------
function generateOTP() {
  const chars = '0123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }
  return otp;
}

let otpTimerInterval = null;

function showOTPModal() {
  const otpDisplay = document.getElementById('otp-display');
  const timerSpan = document.getElementById('otp-timer');
  const otp = generateOTP();
  otpDisplay.textContent = otp;

  // Timer
  let seconds = 300; // 5 minutes
  clearInterval(otpTimerInterval);
  otpTimerInterval = setInterval(() => {
    seconds--;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    timerSpan.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
    if (seconds <= 0) {
      clearInterval(otpTimerInterval);
      otpDisplay.textContent = '------';
      timerSpan.textContent = 'Expired';
    }
  }, 1000);

  otpModal.classList.add('visible');
}

function hideOTPModal() {
  otpModal.classList.remove('visible');
  clearInterval(otpTimerInterval);
}

document.getElementById('btn-otp').addEventListener('click', showOTPModal);
document.getElementById('btn-close-modal').addEventListener('click', hideOTPModal);
document.getElementById('btn-regenerate').addEventListener('click', () => {
  const otpDisplay = document.getElementById('otp-display');
  otpDisplay.textContent = generateOTP();
  const timerSpan = document.getElementById('otp-timer');
  let seconds = 300;
  clearInterval(otpTimerInterval);
  otpTimerInterval = setInterval(() => {
    seconds--;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    timerSpan.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
    if (seconds <= 0) {
      clearInterval(otpTimerInterval);
      otpDisplay.textContent = '------';
      timerSpan.textContent = 'Expired';
    }
  }, 1000);
  showToast('New code generated', 'success');
});

document.getElementById('btn-copy-otp').addEventListener('click', () => {
  const otp = document.getElementById('otp-display').textContent;
  navigator.clipboard.writeText(otp).then(() => {
    showToast('Code copied to clipboard', 'success');
  });
});

// Close modal on overlay click
otpModal.addEventListener('click', (e) => {
  if (e.target === otpModal) hideOTPModal();
});

// -------------------- BIOMETRIC MODAL --------------------
function showBiometricModal(type) {
  const scanIcon = document.getElementById('scan-icon');
  const scanStatus = document.getElementById('scan-status');

  scanIcon.textContent = type === 'fingerprint' ? 'fingerprint' : 'face';
  scanStatus.textContent =
    type === 'fingerprint'
      ? 'Place your finger on the sensor...'
      : 'Position your face in front of the camera...';
  scanStatus.className = 'scan-status';

  biometricModal.classList.add('visible');

  // Simulate scan process
  setTimeout(() => {
    const success = Math.random() > 0.3; // 70% success rate for demo
    if (success) {
      scanStatus.textContent = 'Access Granted';
      scanStatus.className = 'scan-status success';
      const scanCircle = document.getElementById('scan-circle');
      scanCircle.style.background = `linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)`;
      setTimeout(() => {
        hideBiometricModal();
        showToast('Door unlocked successfully', 'success');
        scanCircle.style.background = '';
      }, 1200);
    } else {
      scanStatus.textContent = 'Verification Failed — Try Again';
      scanStatus.className = 'scan-status error';
      setTimeout(() => {
        hideBiometricModal();
        showToast('Authentication failed', 'error');
      }, 1500);
    }
  }, 2500);
}

function hideBiometricModal() {
  biometricModal.classList.remove('visible');
}

document.getElementById('btn-fingerprint').addEventListener('click', () => {
  showBiometricModal('fingerprint');
});

document.getElementById('btn-faceid').addEventListener('click', () => {
  showBiometricModal('face');
});

document.getElementById('btn-cancel-scan').addEventListener('click', hideBiometricModal);

biometricModal.addEventListener('click', (e) => {
  if (e.target === biometricModal) hideBiometricModal();
});

// -------------------- TOAST --------------------
let toastTimeout = null;
function showToast(message, type = '') {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// -------------------- LOAD MORE --------------------
document.getElementById('btn-load-more').addEventListener('click', () => {
  showToast('Loading archive events...', '');

  // Simulate loading more events
  setTimeout(() => {
    const archiveGroup = {
      group: 'Oct 22',
      items: [
        {
          title: 'Weekly Access Report',
          location: 'Global • Auto-generated',
          time: '6:00 PM',
          icon: 'summarize',
          type: 'neutral',
        },
        {
          title: 'Badge Deactivated',
          location: 'HR Office • Employee #1042',
          time: '2:15 PM',
          icon: 'badge',
          type: 'info',
        },
      ],
    };

    activityData.push(archiveGroup);
    renderActivityFeed();
    showToast('Archive events loaded', 'success');
  }, 800);
});

// -------------------- SEARCH (Activity Screen) --------------------
document.getElementById('btn-search').addEventListener('click', () => {
  showToast('Search is coming soon', '');
});

document.getElementById('btn-filter').addEventListener('click', () => {
  showToast('Filter is coming soon', '');
});

// -------------------- INIT --------------------
function init() {
  renderRecentAccess();
  renderActivityFeed();
}

init();
