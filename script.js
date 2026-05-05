// Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const rankingScreen = document.getElementById('ranking-screen');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const viewRankingBtn = document.getElementById('view-ranking-btn');
const backToHomeBtn = document.getElementById('back-to-home-btn');
const saveScoreBtn = document.getElementById('save-score-btn');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const questionCounter = document.getElementById('question-counter');
const scoreDisplay = document.getElementById('score-display');
const progressIndicator = document.getElementById('progress-indicator');

const finalScoreElement = document.getElementById('final-score');
const totalQuestionsDisplay = document.getElementById('total-questions-display');
const resultMessage = document.getElementById('result-message');
const questionCountSelect = document.getElementById('question-count-select');

// Ranking elements
const playerNameInput = document.getElementById('player-name');
const rankingList = document.getElementById('ranking-list');
const saveScoreContainer = document.getElementById('save-score-container');

// Game State
let allQuestions = [];
let gameQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let canClick = false;

// Initialize
function initApp() {
    startBtn.addEventListener('click', startGame);
    nextBtn.addEventListener('click', showNextQuestion);
    restartBtn.addEventListener('click', resetGame);
    
    viewRankingBtn.addEventListener('click', showRanking);
    backToHomeBtn.addEventListener('click', () => {
        rankingScreen.classList.remove('active');
        setTimeout(() => startScreen.classList.add('active'), 500);
    });
    
    saveScoreBtn.addEventListener('click', saveScore);
    
    // Load questions from JSON
    loadQuestions();
}

async function loadQuestions() {
    try {
        const response = await fetch('./questions.json');
        allQuestions = await response.json();
        
        // Enable start button!
        startBtn.disabled = false;
        startBtn.innerText = "Vamos a isso!";
    } catch (e) {
        console.error("Failed to load questions JSON", e);
        startBtn.innerText = "Erro ao carregar dados";
    }
}

function startGame() {
    startScreen.classList.remove('active');
    setTimeout(() => {
        score = 0;
        currentQuestionIndex = 0;
        scoreDisplay.innerText = score;
        
        // Get question count and prepare the questions array
        const qCount = parseInt(questionCountSelect.value);
        let shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        gameQuestions = shuffled.slice(0, qCount);

        quizScreen.classList.add('active');
        renderQuestion();
    }, 500); // Wait for transition
}

function renderQuestion() {
    const currentQ = gameQuestions[currentQuestionIndex];
    canClick = true;
    
    // Update Header
    questionCounter.innerText = `Pergunta ${currentQuestionIndex + 1}/${gameQuestions.length}`;
    const progressPercent = ((currentQuestionIndex) / gameQuestions.length) * 100;
    progressIndicator.style.width = `${progressPercent}%`;
    
    // Hide Next Button
    nextBtn.classList.add('hidden');
    
    // Render text with simple typewriter effect
    questionText.innerHTML = '';
    optionsContainer.innerHTML = '';
    
    // Render question
    questionText.innerText = currentQ.question;
    
    // Render options
    currentQ.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.innerText = opt;
        btn.dataset.index = index;
        
        // Add staggered animation
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(20px)';
        btn.style.animation = `fadeInUp 0.3s forwards ${0.1 * index}s`;
        
        btn.addEventListener('click', (e) => selectAnswer(e, index));
        optionsContainer.appendChild(btn);
    });
}

function selectAnswer(e, selectedIndex) {
    if (!canClick) return;
    canClick = false;
    
    const currentQ = gameQuestions[currentQuestionIndex];
    const isCorrect = selectedIndex === currentQ.answer;
    
    const selectedBtn = e.target;
    const allBtns = optionsContainer.querySelectorAll('.option-btn');
    
    // Disable all buttons
    allBtns.forEach(btn => {
        btn.disabled = true;
        // Highlight correct answer if they were wrong
        if (parseInt(btn.dataset.index) === currentQ.answer) {
            btn.classList.add('correct');
        }
    });
    
    // Handle choice
    if (isCorrect) {
        score++;
        scoreDisplay.innerText = score;
        // Correct class already added by logic above, but ensure it pops
        selectedBtn.classList.add('correct');
        createParticles(e.clientX, e.clientY, '#2ecc71');
    } else {
        selectedBtn.classList.add('wrong');
        createParticles(e.clientX, e.clientY, '#e74c3c');
    }
    
    // Show next button
    nextBtn.classList.remove('hidden');
}

function showNextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < gameQuestions.length) {
        // Animate out
        const allBtns = optionsContainer.querySelectorAll('.option-btn');
        allBtns.forEach(btn => {
            btn.style.animation = 'none'; // reset previous animation
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(-20px)';
            btn.style.transition = 'all 0.3s';
        });
        
        questionText.style.opacity = '0';
        
        setTimeout(() => {
            questionText.style.transition = 'all 0.3s';
            questionText.style.opacity = '1';
            renderQuestion();
        }, 300);
    } else {
        showResults();
    }
}

function showResults() {
    // Finish progress bar
    progressIndicator.style.width = '100%';
    
    setTimeout(() => {
        quizScreen.classList.remove('active');
        
        setTimeout(() => {
            resultScreen.classList.add('active');
            
            finalScoreElement.innerText = score;
            totalQuestionsDisplay.innerText = `em ${gameQuestions.length}`;
            
            // Generate Message based on score
            let msg = '';
            const percentage = score / gameQuestions.length;
            
            if (percentage === 1) {
                msg = "ULTRA INSTINTO! Trabalho incrível!";
            } else if (percentage >= 0.8) {
                msg = "Nível de Super Guerreiro! Muito impressionante!";
            } else if (percentage >= 0.5) {
                msg = "Bom esforço, Guerreiro Z. Continua a treinar!";
            } else {
                msg = "Precisas de treinar na Sala do Tempo!";
            }
            
            // Show save score input if score > 0
            if (score > 0) {
                saveScoreContainer.style.display = 'flex';
                playerNameInput.value = '';
            } else {
                saveScoreContainer.style.display = 'none';
            }
            
            resultMessage.innerText = msg;    
        }, 500);
    }, 500);
}

function saveScore() {
    const name = playerNameInput.value.trim();
    if (!name) {
        alert('Por favor introduz o teu nome!');
        return;
    }
    
    // Percentage to sort properly regardless of quiz length
    const percentage = Math.round((score / gameQuestions.length) * 100);
    
    const newEntry = {
        name: name,
        score: score,
        total: gameQuestions.length,
        percentage: percentage,
        date: new Date().toISOString()
    };
    
    let rankings = JSON.parse(localStorage.getItem('dbzRankings')) || [];
    rankings.push(newEntry);
    
    // Sort by percentage first, then absolute score
    rankings.sort((a, b) => b.percentage - a.percentage || b.score - a.score);
    
    // Keep max 20
    rankings = rankings.slice(0, 20);
    
    localStorage.setItem('dbzRankings', JSON.stringify(rankings));
    
    // Transition to ranking
    resultScreen.classList.remove('active');
    setTimeout(() => {
        showRanking();
    }, 500);
}

function showRanking() {
    startScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    
    // Build UI
    rankingList.innerHTML = '';
    const rankings = JSON.parse(localStorage.getItem('dbzRankings')) || [];
    
    if (rankings.length === 0) {
        rankingList.innerHTML = '<p style="text-align:center;color:#a0aec0;">Ainda não há pontuações! Sê o primeiro a jogar.</p>';
    } else {
        rankings.forEach((entry, index) => {
            const li = document.createElement('li');
            li.classList.add('ranking-item');
            
            if (index === 0) li.classList.add('top-1');
            if (index === 1) li.classList.add('top-2');
            if (index === 2) li.classList.add('top-3');
            
            li.innerHTML = `
                <span class="rank-name">#${index + 1} ${entry.name}</span>
                <span class="rank-score">${entry.score}/${entry.total} (${entry.percentage}%)</span>
            `;
            rankingList.appendChild(li);
        });
    }
    
    setTimeout(() => {
        rankingScreen.classList.add('active');
    }, 100); // 100ms or 500 depending on caller
}

function resetGame() {
    resultScreen.classList.remove('active');
    setTimeout(() => {
        startScreen.classList.add('active');
        progressIndicator.style.width = '0%';
    }, 500);
}

// Simple particle effect for correct/wrong answers
function createParticles(x, y, color) {
    const particleCount = 10;
    const body = document.body;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.backgroundColor = color;
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        body.appendChild(particle);
        
        let opacity = 1;
        
        function animateParticle() {
            const currentX = parseFloat(particle.style.left);
            const currentY = parseFloat(particle.style.top);
            
            particle.style.left = `${currentX + vx}px`;
            particle.style.top = `${currentY + vy}px`;
            
            opacity -= 0.05;
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        }
        
        requestAnimationFrame(animateParticle);
    }
}

// Boot application
initApp();
