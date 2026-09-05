// ============================================
// LIVING CITY — Time-Based Creative
// Enhanced with Custom Cursor, 3D City, Aurora
// ============================================

// ---------- 1. Time Utilities ----------

function getMinutesSinceMidnight(date = new Date()) {
    return (
        date.getHours() * 60 +
        date.getMinutes() +
        date.getSeconds() / 60
    );
}

function progressBetween(time, start, end) {
    return Math.min(1, Math.max(0, (time - start) / (end - start)));
}

function lerp(start, end, progress) {
    return start + (end - start) * progress;
}

// ---------- 2. Color Utilities ----------

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

function rgbToHex(r, g, b) {
    return `#${[r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

function lerpColor(color1, color2, progress) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const r = lerp(rgb1[0], rgb2[0], progress);
    const g = lerp(rgb1[1], rgb2[1], progress);
    const b = lerp(rgb1[2], rgb2[2], progress);
    return rgbToHex(r, g, b);
}

// ---------- 3. Keyframe Data ----------

const skyKeyframes = [
    { time: 300, top: '#0d1b2a', middle: '#1b263b', bottom: '#4a2c3a' },  // 05:00
    { time: 360, top: '#1a1a2e', middle: '#2d3561', bottom: '#6b4f6b' },  // 06:00
    { time: 420, top: '#2c3e50', middle: '#5d8aa8', bottom: '#c17a5a' },  // 07:00
    { time: 720, top: '#4a90d9', middle: '#87c4e8', bottom: '#c9e4d9' },  // 12:00
    { time: 960, top: '#3a7bd5', middle: '#7fb2e5', bottom: '#e8c4a0' },  // 16:00
    { time: 1080, top: '#5c3a6e', middle: '#9b5e6e', bottom: '#e8995a' }, // 18:00
    { time: 1110, top: '#2a1b38', middle: '#6b3a5e', bottom: '#c95a3a' }, // 18:30
    { time: 1260, top: '#0d1b2a', middle: '#1b263b', bottom: '#2a2a3a' }, // 21:00
    { time: 1440, top: '#050510', middle: '#0a0a20', bottom: '#1a1a2e' }, // 00:00
];

const sunColorKeyframes = [
    { time: 300, color: '#ff3b1a' },
    { time: 360, color: '#ff6b35' },
    { time: 420, color: '#ffa550' },
    { time: 720, color: '#ffe066' },
    { time: 960, color: '#ffcc55' },
    { time: 1080, color: '#ff8c3a' },
    { time: 1110, color: '#ff4d1a' },
];

// ---------- 4. Keyframe Interpolation (Circular) ----------

function interpolateKeyframes(keyframes, time) {
    let prev = keyframes[keyframes.length - 1];
    let next = keyframes[0];
    let prevTime = prev.time - 1440;
    let nextTime = next.time;

    for (let i = 0; i < keyframes.length - 1; i++) {
        if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
            prev = keyframes[i];
            next = keyframes[i + 1];
            prevTime = prev.time;
            nextTime = next.time;
            break;
        }
    }

    const progress = progressBetween(time, prevTime, nextTime);
    const result = {};
    for (const key in prev) {
        if (key === 'time') continue;
        if (typeof prev[key] === 'string' && prev[key].startsWith('#')) {
            result[key] = lerpColor(prev[key], next[key], progress);
        } else {
            result[key] = lerp(prev[key], next[key], progress);
        }
    }
    return result;
}

// ---------- 5. Sun Position ----------

function calculateSunPosition(time) {
    const sunrise = 330;
    const sunset = 1110;
    if (time < sunrise || time > sunset) return null;
    const progress = progressBetween(time, sunrise, sunset);
    const angle = Math.PI * progress;
    const x = lerp(5, 95, progress);
    const y = 85 - Math.sin(angle) * 70;
    return { x, y, progress };
}

// ---------- 6. Moon Position (Fixed) ----------

function calculateMoonPosition(time) {
    const moonStart = 1080;
    const moonEnd = 1080 + 690;
    let t = time < moonStart ? time + 1440 : time;
    if (t < moonStart || t > moonEnd) return null;
    const progress = progressBetween(t, moonStart, moonEnd);
    const angle = Math.PI * progress;
    const x = lerp(5, 95, progress);
    const y = 85 - Math.sin(angle) * 60;
    return { x, y, progress };
}

// ---------- 7. Stars Opacity ----------

function calculateStarsOpacity(time) {
    if (time >= 1110 || time < 330) {
        let progress;
        if (time >= 1110) {
            progress = progressBetween(time, 1110, 1380);
        } else {
            progress = 1 - progressBetween(time, 240, 330);
        }
        return lerp(0, 1, Math.min(1, Math.max(0, progress)));
    }
    return 0;
}

// ---------- 8. Clouds Opacity ----------

function calculateCloudsOpacity(time) {
    if (time >= 360 && time <= 1080) return 0.5;
    if (time > 1080 && time <= 1200) return lerp(0.5, 0.15, progressBetween(time, 1080, 1200));
    if (time < 360 && time >= 240) return lerp(0.15, 0.5, progressBetween(time, 240, 360));
    return 0.15;
}

// ---------- 9. Windows Opacity ----------

function calculateWindowsOpacity(time) {
    if (time >= 1080 || time < 420) {
        let progress;
        if (time >= 1080) {
            progress = progressBetween(time, 1080, 1320);
        } else {
            progress = 1 - progressBetween(time, 300, 420);
        }
        return lerp(0.05, 0.85, Math.min(1, Math.max(0, progress)));
    }
    return 0.05;
}

// ---------- 10. Building Brightness ----------

function calculateBuildingBrightness(time) {
    if (time >= 360 && time <= 960) return 1;
    if (time > 960 && time <= 1200) return lerp(1, 0.35, progressBetween(time, 960, 1200));
    if (time < 360 && time >= 240) return lerp(0.35, 1, progressBetween(time, 240, 360));
    return 0.35;
}

// ---------- 11. Special Moment (Golden Hour) ----------

function calculateSpecialMoment(time) {
    const start = 1080;
    const end = 1110;
    if (time >= start && time <= end) {
        const progress = progressBetween(time, start, end);
        const intensity = Math.sin(Math.PI * progress);
        return {
            birdsOpacity: intensity,
            glow: intensity * 50,
            active: true
        };
    }
    return { birdsOpacity: 0, glow: 0, active: false };
}

// ---------- 12. Aurora Opacity (time-based) ----------

function calculateAuroraOpacity(time, starsOpacity) {
    // Aurora more visible at night, subtle during day
    let base = 0.15;
    if (time >= 1080 || time < 360) {
        base = lerp(0.4, 0.15, starsOpacity); // stronger when stars visible
    } else {
        base = 0.05;
    }
    // Golden hour boost
    if (time >= 1080 && time <= 1110) base += 0.2;
    return base;
}

// ---------- 13. Generate Stars Dynamically ----------

function generateStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = Math.floor(window.innerWidth / 30);
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 1;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.animationDelay = `${delay}s`;
        starsContainer.appendChild(star);
    }
}

// ---------- 14. Cursor Logic (Enhanced) ----------

const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;
let dotX = mouseX;
let dotY = mouseY;
let isCursorVisible = true;
let inactivityTimer = null;

function showCursor() {
    if (!isCursorVisible) {
        cursorDot.classList.remove('cursor-hidden');
        cursorRing.classList.remove('cursor-hidden');
        isCursorVisible = true;
    }
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(hideCursor, 5000);
}

function hideCursor() {
    cursorDot.classList.add('cursor-hidden');
    cursorRing.classList.add('cursor-hidden');
    isCursorVisible = false;
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    showCursor();
});

// Smooth follow using requestAnimationFrame
function animateCursor() {
    // Dot follows instantly (or very fast)
    dotX = lerp(dotX, mouseX, 0.5);
    dotY = lerp(dotY, mouseY, 0.5);
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';
    
    // Ring follows slower for smooth effect
    ringX = lerp(ringX, mouseX, 0.2);
    ringY = lerp(ringY, mouseY, 0.2);
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Hover effect on interactive elements (optional)
document.querySelectorAll('.ui-header, .time-display, .tagline').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorRing.style.width = '50px';
        cursorRing.style.height = '50px';
        cursorRing.style.opacity = '0.8';
    });
    el.addEventListener('mouseleave', () => {
        cursorRing.style.width = '36px';
        cursorRing.style.height = '36px';
        cursorRing.style.opacity = '0.5';
    });
});

// ---------- 15. Main Render Function ----------

function updateScene() {
    const now = new Date();
    const minutes = getMinutesSinceMidnight(now);
    
    // Calculate all properties
    const sky = interpolateKeyframes(skyKeyframes, minutes);
    const sunColor = interpolateKeyframes(sunColorKeyframes, minutes);
    const sunPos = calculateSunPosition(minutes);
    const moonPos = calculateMoonPosition(minutes);
    const starsOpacity = calculateStarsOpacity(minutes);
    const cloudsOpacity = calculateCloudsOpacity(minutes);
    const windowsOpacity = calculateWindowsOpacity(minutes);
    const buildingBrightness = calculateBuildingBrightness(minutes);
    const special = calculateSpecialMoment(minutes);
    const auroraOpacity = calculateAuroraOpacity(minutes, starsOpacity);
    
    const root = document.documentElement;
    
    // Sky
    root.style.setProperty('--sky-top', sky.top);
    root.style.setProperty('--sky-middle', sky.middle);
    root.style.setProperty('--sky-bottom', sky.bottom);
    
    // Sun
    if (sunPos) {
        root.style.setProperty('--sun-x', `${sunPos.x}%`);
        root.style.setProperty('--sun-y', `${sunPos.y}%`);
        root.style.setProperty('--sun-opacity', '1');
        root.style.setProperty('--sun-color', sunColor.color);
        const glowProgress = Math.abs(sunPos.progress - 0.5) * 2;
        const sunGlow = lerp(40, 80, glowProgress);
        root.style.setProperty('--sun-glow', `${sunGlow}px`);
        root.style.setProperty('--sun-scale', '1');
    } else {
        root.style.setProperty('--sun-opacity', '0');
    }
    
    // Moon
    if (moonPos) {
        root.style.setProperty('--moon-x', `${moonPos.x}%`);
        root.style.setProperty('--moon-y', `${moonPos.y}%`);
        root.style.setProperty('--moon-opacity', `${moonPos.progress}`);
        root.style.setProperty('--moon-glow', `${moonPos.progress * 40}px`);
    } else {
        root.style.setProperty('--moon-opacity', '0');
    }
    
    // Stars
    root.style.setProperty('--stars-opacity', starsOpacity);
    
    // Clouds
    root.style.setProperty('--clouds-opacity', cloudsOpacity);
    
    // Windows
    root.style.setProperty('--window-opacity', windowsOpacity);
    
    // Building brightness
    root.style.setProperty('--building-brightness', buildingBrightness);
    
    // Special moment
    root.style.setProperty('--special-glow', `${special.glow}px`);
    root.style.setProperty('--birds-opacity', special.birdsOpacity);
    
    // Aurora
    root.style.setProperty('--aurora-opacity', auroraOpacity);
    
    // Update cursor color based on time
    updateCursorColor(minutes);
    
    // Update time display
    const hours = now.getHours();
    const minutesDisplay = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    document.getElementById('time-text').textContent = `${displayHours}:${minutesDisplay}`;
    document.getElementById('ampm').textContent = ampm;
    
    // Update status text
    updateStatus(minutes, special.active);
}

// ---------- 16. Cursor Color Updater ----------

function updateCursorColor(time) {
    let color, glow;
    if (time >= 330 && time <= 1110) {
        color = '#ffd700';
        glow = 'rgba(255,215,0,0.8)';
    } else {
        color = '#b0c4de';
        glow = 'rgba(176,196,222,0.8)';
    }
    if (time >= 1080 && time <= 1110) {
        color = '#ff8c00';
        glow = 'rgba(255,140,0,0.9)';
    }
    document.documentElement.style.setProperty('--cursor-color', color);
    document.documentElement.style.setProperty('--cursor-glow', glow);
    
    // Update status dot color
    const statusDot = document.getElementById('status-dot');
    if (statusDot) {
        statusDot.style.background = color;
        statusDot.style.boxShadow = `0 0 10px ${glow}`;
    }
}

// ---------- 17. Status Text Updater ----------

function updateStatus(minutes, isGoldenHour) {
    const statusText = document.getElementById('status-text');
    if (!statusText) return;
    if (isGoldenHour) {
        statusText.textContent = 'Golden Hour';
    } else if (minutes >= 330 && minutes < 1080) {
        statusText.textContent = 'Daytime';
    } else if (minutes >= 1080 && minutes < 1110) {
        statusText.textContent = 'Golden Hour'; // will be overridden if active, but just in case
    } else {
        statusText.textContent = 'Night';
    }
}

// ---------- 18. Initialization ----------

generateStars();
updateScene();
setInterval(updateScene, 1000);

window.addEventListener('resize', () => {
    clearTimeout(window._starResizeTimeout);
    window._starResizeTimeout = setTimeout(() => {
        const starsContainer = document.getElementById('stars');
        starsContainer.innerHTML = '';
        generateStars();
    }, 500);
});