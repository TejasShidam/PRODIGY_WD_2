// DOM Elements
const hoursDisplay = document.getElementById('hours');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const millisecondsDisplay = document.getElementById('milliseconds');
const startButton = document.getElementById('startBtn');
const pauseButton = document.getElementById('pauseBtn');
const resetButton = document.getElementById('resetBtn');
const lapButton = document.getElementById('lapBtn');
const lapList = document.getElementById('lapList');
const progressFill = document.querySelector('.progress-fill');
const focusTipElement = document.getElementById('focus-tip');


const focusTips = [
    "Take a deep breath before starting your focus session",
    "Clear your workspace of physical and digital distractions",
    "Set a clear, specific goal for this focus session",
    "Stay hydrated - keep water nearby",
    "Maintain good posture to stay alert and focused",
    "Use the lap feature to break down complex tasks",
    "The first 5 minutes are crucial - push through the resistance",
    "If you get stuck, break your task into smaller steps",
    "Remember: progress over perfection",
    "Focus on one task at a time - multitasking reduces productivity",
    "Use the timer as a commitment to yourself",
    "If distracted, gently bring your attention back to the task",
    "Your energy levels peak in 25-minute cycles",
    "Celebrate small wins - each focused minute counts",
    "If you feel overwhelmed, take a deep breath and reset"
];


let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;
let targetTime = 25 * 60 * 1000; // 25 minutes in milliseconds
let lapCount = 0;
let lastLapTime = 0;

// Initialize Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const container = document.getElementById('background-3d');


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

// Create animated background
const createBackground = () => {
    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshBasicMaterial({
        color: 0x64ffda,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);
    return torus;
};

const torus = createBackground();
camera.position.z = 30;


const animate = () => {
    requestAnimationFrame(animate);
    torus.rotation.x += 0.001;
    torus.rotation.y += 0.002;
    torus.rotation.z += 0.001;
    renderer.render(scene, camera);
};


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


animate();


const formatTime = (time) => time.toString().padStart(2, '0');


const updateDisplay = () => {
    const hours = Math.floor(elapsedTime / 3600000);
    const minutes = Math.floor((elapsedTime % 3600000) / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    const milliseconds = Math.floor((elapsedTime % 1000) / 10);

    hoursDisplay.textContent = formatTime(hours);
    minutesDisplay.textContent = formatTime(minutes);
    secondsDisplay.textContent = formatTime(seconds);
    millisecondsDisplay.textContent = formatTime(milliseconds);

    
    const progress = (elapsedTime / targetTime) * 100;
    progressFill.style.width = `${Math.min(progress, 100)}%`;

    
    if (elapsedTime >= targetTime && isRunning) {
        completeSession();
    }
};


const startTimer = () => {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateDisplay();
        }, 10);
        startButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        showNotification('Focus session started');
        updateFocusTip(); 
    }
};


const pauseTimer = () => {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
        showNotification('Session paused');
    }
};


const resetTimer = () => {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
    }

    
    if (elapsedTime >= 60000) {
        const shouldReset = confirm('Are you sure you want to reset your focus session?');
        if (!shouldReset) {
            return;
        }
    }

    
    startTime = 0;
    elapsedTime = 0;
    lapCount = 0;
    lastLapTime = 0;

    
    updateDisplay();
    progressFill.style.width = '0%';
    startButton.style.display = 'inline-block';
    pauseButton.style.display = 'none';
    lapList.innerHTML = '';

    
    showNotification('Timer reset');
    updateFocusTip();
};


const recordLap = () => {
    if (isRunning) {
        lapCount++;
        const currentLapTime = elapsedTime;
        const lapDiff = currentLapTime - lastLapTime;
        
        const lapItem = document.createElement('li');
        lapItem.innerHTML = `
            <span class="lap-number">Lap ${lapCount}</span>
            <div class="lap-times">
                <span class="lap-time">${formatLapTime(currentLapTime)}</span>
                <span class="lap-diff">+${formatLapTime(lapDiff)}</span>
            </div>
        `;
        
        lapItem.style.opacity = '0';
        lapList.insertBefore(lapItem, lapList.firstChild);
        
        requestAnimationFrame(() => {
            lapItem.style.transition = 'opacity 0.3s ease';
            lapItem.style.opacity = '1';
        });

        lastLapTime = currentLapTime;
        showNotification('Lap recorded');
    }
};


const formatLapTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    if (minutes > 0) {
        return `${formatTime(minutes)}:${formatTime(seconds)}.${formatTime(milliseconds)}`;
    }
    return `${formatTime(seconds)}.${formatTime(milliseconds)}`;
};


const completeSession = () => {
    pauseTimer();
    showNotification('Great job! Focus session completed! 🎉');
    updateFocusTip();
};


const showNotification = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    toast.offsetHeight;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
};


const updateFocusTip = () => {
    const randomTip = focusTips[Math.floor(Math.random() * focusTips.length)];
    if (focusTipElement) {
        focusTipElement.textContent = randomTip;
        focusTipElement.style.opacity = '0';
        requestAnimationFrame(() => {
            focusTipElement.style.transition = 'opacity 0.5s ease';
            focusTipElement.style.opacity = '1';
        });
    }
};


startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
lapButton.addEventListener('click', recordLap);


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});


pauseButton.style.display = 'none';
updateDisplay();
updateFocusTip();


document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateFocusTip();
    }
});


const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

const observerOptions = {
    root: null,
    rootMargin: '-50% 0px',
    threshold: 0
};

const observerCallback = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => link.classList.remove('active'));
            
            
            const targetId = entry.target.id;
            const correspondingLink = document.querySelector(`.nav-links a[href="#${targetId}"]`);
            if (correspondingLink) {
                correspondingLink.classList.add('active');
            }
        }
    });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);


sections.forEach(section => {
    observer.observe(section);
}); 