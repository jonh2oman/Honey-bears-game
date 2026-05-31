class MiniGameManager {
  constructor(containerId, onComplete) {
    this.container = document.getElementById(containerId);
    this.onComplete = onComplete; // callback(success, honeyReward)
  }

  // --- HONEY CATCHER GAME ---
  startHoneyCatcher() {
    this.container.innerHTML = `<canvas id="minigame-canvas" width="500" height="375" style="display: block; width: 100%; height: 100%;"></canvas>`;
    const canvas = document.getElementById('minigame-canvas');
    const ctx = canvas.getContext('2d');

    let score = 0;
    let lives = 3;
    let timeLeft = 20; // seconds
    let gameActive = true;

    const jar = {
      x: canvas.width / 2 - 40,
      y: canvas.height - 50,
      width: 80,
      height: 40,
      speed: 8
    };

    const items = [];
    const itemTypes = {
      HONEY: 'honey',
      ROCK: 'rock'
    };

    // Keyboard and mouse controls
    let moveLeft = false;
    let moveRight = false;

    const keyDownHandler = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft = true;
      if (e.key === 'ArrowRight' || e.key === 'd') moveRight = true;
    };

    const keyUpHandler = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft = false;
      if (e.key === 'ArrowRight' || e.key === 'd') moveRight = false;
    };

    const mouseMoveHandler = (e) => {
      const rect = canvas.getBoundingClientRect();
      const root = document.documentElement;
      const mouseX = e.clientX - rect.left - root.scrollLeft;
      jar.x = mouseX - jar.width / 2;
      // Keep inside boundary
      if (jar.x < 0) jar.x = 0;
      if (jar.x > canvas.width - jar.width) jar.x = canvas.width - jar.width;
    };

    const touchMoveHandler = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      jar.x = touchX - jar.width / 2;
      if (jar.x < 0) jar.x = 0;
      if (jar.x > canvas.width - jar.width) jar.x = canvas.width - jar.width;
    };

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('touchmove', touchMoveHandler, { passive: false });

    // Spawn items
    const spawnInterval = setInterval(() => {
      if (!gameActive) return;
      const isHoney = Math.random() > 0.3;
      items.push({
        x: Math.random() * (canvas.width - 30) + 15,
        y: -20,
        type: isHoney ? itemTypes.HONEY : itemTypes.ROCK,
        speed: Math.random() * 3 + 3,
        radius: 15
      });
    }, 600);

    // Timer
    const timerInterval = setInterval(() => {
      if (!gameActive) return;
      timeLeft--;
      if (timeLeft <= 0) {
        endGame(true);
      }
    }, 1000);

    const endGame = (timerDone = false) => {
      gameActive = false;
      clearInterval(spawnInterval);
      clearInterval(timerInterval);
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
      canvas.removeEventListener('mousemove', mouseMoveHandler);

      const win = timerDone && score >= 8;
      const reward = win ? 4 : (score >= 4 ? 2 : -1);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Fredoka';
      ctx.textAlign = 'center';
      
      if (win) {
        ctx.fillText('🏆 Win! Caught all the honey!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Reward: +${reward} Honey 🍯`, canvas.width / 2, canvas.height / 2 + 20);
      } else if (lives <= 0) {
        ctx.fillText('💥 Oops! You hit too many rocks!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`Penalty: ${reward} Honey 🍯`, canvas.width / 2, canvas.height / 2 + 20);
      } else {
        ctx.fillText('Time\'s Up!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = reward > 0 ? '#fbbf24' : '#ef4444';
        ctx.fillText(reward > 0 ? `Reward: +${reward} Honey 🍯` : `Penalty: ${reward} Honey 🍯`, canvas.width / 2, canvas.height / 2 + 20);
      }

      setTimeout(() => this.onComplete(win || score >= 4, reward), 2000);
    };

    const draw = () => {
      if (!gameActive) return;

      // Clear
      ctx.fillStyle = '#ecfdf5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw forest decorations (simple backdrop)
      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(60, canvas.height, 120, 0, Math.PI * 2);
      ctx.arc(canvas.width - 60, canvas.height, 100, 0, Math.PI * 2);
      ctx.fill();

      // Keyboard movement
      if (moveLeft && jar.x > 0) jar.x -= jar.speed;
      if (moveRight && jar.x < canvas.width - jar.width) jar.x += jar.speed;

      // Draw jar
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(jar.x, jar.y, jar.width, jar.height, 8);
      ctx.fill();
      // Jar rim
      ctx.fillStyle = '#d97706';
      ctx.fillRect(jar.x - 4, jar.y, jar.width + 8, 8);
      // "Honey" label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('HONEY', jar.x + jar.width / 2, jar.y + 26);

      // Update and draw items
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += item.speed;

        // Collision check
        if (
          item.y + item.radius >= jar.y &&
          item.x >= jar.x &&
          item.x <= jar.x + jar.width &&
          item.y - item.radius <= jar.y + jar.height
        ) {
          if (item.type === itemTypes.HONEY) {
            score++;
            if (window.playAudio) window.playAudio('collect');
          } else {
            lives--;
            if (window.playAudio) window.playAudio('sting');
            if (lives <= 0) {
              endGame();
              return;
            }
          }
          items.splice(i, 1);
          continue;
        }

        // Out of bounds
        if (item.y > canvas.height + 20) {
          items.splice(i, 1);
          continue;
        }

        // Draw item
        if (item.type === itemTypes.HONEY) {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
          ctx.fill();
          // Glow
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Drop tip
          ctx.beginPath();
          ctx.moveTo(item.x, item.y - item.radius - 2);
          ctx.lineTo(item.x - 8, item.y);
          ctx.lineTo(item.x + 8, item.y);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
          ctx.fill();
          // Rock texture details
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(item.x - 4, item.y - 4, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Info
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px Outfit';
      ctx.textAlign = 'left';
      ctx.fillText(`🍯 Honey: ${score}/8`, 16, 30);
      ctx.fillText(`❤️ Hearts: ${'❤️'.repeat(lives)}`, 16, 55);
      
      ctx.textAlign = 'right';
      ctx.fillText(`⏱️ Time: ${timeLeft}s`, canvas.width - 16, 30);

      requestAnimationFrame(draw);
    };

    draw();
  }

  // --- BERRY SCRAMBLE GAME ---
  startBerryScramble() {
    this.container.innerHTML = `
      <div id="scramble-game" style="position:relative; width:100%; height:100%; background:#fef3c7; overflow:hidden;">
        <div id="scramble-hud" style="padding:10px; font-weight:bold; font-family:var(--font-body); display:flex; justify-content:space-between;">
          <span>🍓 Berries Clicked: <span id="scramble-score">0</span>/10</span>
          <span>⏱️ Time Left: <span id="scramble-timer">12</span>s</span>
        </div>
        <div id="scramble-playarea" style="position:relative; width:100%; height:calc(100% - 40px);"></div>
      </div>
    `;

    const playArea = document.getElementById('scramble-playarea');
    const scoreVal = document.getElementById('scramble-score');
    const timerVal = document.getElementById('scramble-timer');

    let score = 0;
    let timeLeft = 12;
    let gameActive = true;

    const spawnBerry = () => {
      if (!gameActive) return;

      const berry = document.createElement('div');
      berry.style.position = 'absolute';
      berry.style.fontSize = '2.5rem';
      berry.style.cursor = 'pointer';
      berry.style.userSelect = 'none';
      berry.style.transition = 'transform 0.15s ease-out';
      berry.innerText = Math.random() > 0.2 ? '🍓' : '🍒';

      // Random position
      const x = Math.random() * (playArea.clientWidth - 50);
      const y = Math.random() * (playArea.clientHeight - 50);
      berry.style.left = `${x}px`;
      berry.style.top = `${y}px`;

      berry.addEventListener('mousedown', () => {
        if (!gameActive) return;
        score++;
        scoreVal.innerText = score;
        if (window.playAudio) window.playAudio('collect');
        
        // Pop animation
        berry.style.transform = 'scale(1.4)';
        setTimeout(() => {
          berry.remove();
          spawnBerry(); // Spawn replacement berry!
        }, 100);

        if (score >= 10) {
          endGame(true);
        }
      });

      playArea.appendChild(berry);

      // Auto remove berry after 1.5 seconds if not clicked
      setTimeout(() => {
        if (berry.parentNode) {
          berry.remove();
          spawnBerry(); // spawn another
        }
      }, 1400);
    };

    // Initial Spawns
    for (let i = 0; i < 3; i++) {
      setTimeout(spawnBerry, i * 300);
    }

    const timerInterval = setInterval(() => {
      timeLeft--;
      timerVal.innerText = timeLeft;
      if (timeLeft <= 0) {
        endGame(score >= 10);
      }
    }, 1000);

    const endGame = (won) => {
      gameActive = false;
      clearInterval(timerInterval);
      playArea.innerHTML = '';
      
      const reward = won ? 3 : -1;
      
      const endOverlay = document.createElement('div');
      endOverlay.style.position = 'absolute';
      endOverlay.style.top = '0';
      endOverlay.style.left = '0';
      endOverlay.style.width = '100%';
      endOverlay.style.height = '100%';
      endOverlay.style.background = 'rgba(0,0,0,0.7)';
      endOverlay.style.display = 'flex';
      endOverlay.style.flexDirection = 'column';
      endOverlay.style.alignItems = 'center';
      endOverlay.style.justifyContent = 'center';
      endOverlay.style.color = '#fff';
      endOverlay.style.fontFamily = 'var(--font-title)';
      
      endOverlay.innerHTML = `
        <h2 style="font-size: 2rem; margin-bottom:10px;">${won ? '🎉 Delicious Success!' : '😢 Too Slow!'}</h2>
        <p style="font-size: 1.2rem; color: ${won ? '#fbbf24' : '#ef4444'};">
          ${won ? `Reward: +${reward} Honey 🍯` : `Penalty: ${reward} Honey 🍯`}
        </p>
      `;
      
      playArea.appendChild(endOverlay);
      setTimeout(() => this.onComplete(won, reward), 2000);
    };
  }

  // --- BEAR MEMORY GAME ---
  startBearMemory() {
    const icons = ['🐻', '🍯', '🐝', '🌲', '🦊', '🐿️'];
    // Duplicate and shuffle
    const gameIcons = [...icons, ...icons].sort(() => Math.random() - 0.5);

    this.container.innerHTML = `
      <div id="memory-game" style="width:100%; height:100%; background:#dbeafe; padding:15px; display:flex; flex-direction:column; gap:10px; justify-content:center;">
        <div id="memory-hud" style="font-weight:bold; font-family:var(--font-body); display:flex; justify-content:space-between;">
          <span>Matches: <span id="memory-matches">0</span>/6</span>
          <span>Moves left: <span id="memory-moves">9</span></span>
        </div>
        <div id="memory-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; flex:1;"></div>
      </div>
    `;

    const grid = document.getElementById('memory-grid');
    const matchesVal = document.getElementById('memory-matches');
    const movesVal = document.getElementById('memory-moves');

    let flippedCards = [];
    let matches = 0;
    let movesLeft = 9;
    let lockGrid = false;

    gameIcons.forEach((icon, index) => {
      const card = document.createElement('div');
      card.dataset.icon = icon;
      card.dataset.index = index;
      
      // Card container design
      card.style.background = '#3b82f6';
      card.style.borderRadius = '12px';
      card.style.display = 'flex';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'center';
      card.style.fontSize = '2rem';
      card.style.color = 'transparent';
      card.style.cursor = 'pointer';
      card.style.userSelect = 'none';
      card.style.transition = 'background 0.2s, transform 0.2s';
      card.innerText = '❓';

      card.addEventListener('click', () => {
        if (lockGrid || card.classList.contains('matched') || flippedCards.includes(card)) return;

        // Reveal card
        card.style.background = '#fff';
        card.style.color = '#000';
        card.innerText = card.dataset.icon;
        flippedCards.push(card);

        if (flippedCards.length === 2) {
          lockGrid = true;
          movesLeft--;
          movesVal.innerText = movesLeft;

          const [card1, card2] = flippedCards;
          if (card1.dataset.icon === card2.dataset.icon) {
            // Match found
            card1.classList.add('matched');
            card2.classList.add('matched');
            matches++;
            matchesVal.innerText = matches;
            flippedCards = [];
            lockGrid = false;
            if (window.playAudio) window.playAudio('collect');

            if (matches === 6) {
              endGame(true);
            } else if (movesLeft <= 0) {
              endGame(false);
            }
          } else {
            // No match
            if (window.playAudio) window.playAudio('sting');
            setTimeout(() => {
              card1.style.background = '#3b82f6';
              card1.style.color = 'transparent';
              card1.innerText = '❓';
              
              card2.style.background = '#3b82f6';
              card2.style.color = 'transparent';
              card2.innerText = '❓';

              flippedCards = [];
              lockGrid = false;

              if (movesLeft <= 0) {
                endGame(false);
              }
            }, 800);
          }
        }
      });

      grid.appendChild(card);
    });

    const endGame = (won) => {
      lockGrid = true;
      const reward = won ? 3 : -1;

      setTimeout(() => {
        this.container.innerHTML = `
          <div style="width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; font-family:var(--font-title);">
            <h2 style="font-size:2rem; margin-bottom:10px;">${won ? '🎉 Memory Master!' : '😢 Out of moves!'}</h2>
            <p style="font-size:1.2rem; color:${won ? '#fbbf24' : '#ef4444'};">
              ${won ? `Reward: +${reward} Honey 🍯` : `Penalty: ${reward} Honey 🍯`}
            </p>
          </div>
        `;
        setTimeout(() => this.onComplete(won, reward), 2000);
      }, 800);
    };
  }

  // --- FOREST QUIZ ---
  startForestQuiz() {
    const questions = [
      {
        q: "Where do wild honey bees prefer to build their hives?",
        a: ["Hollow tree trunk 🌲", "Underground cave 🪨", "Inside wobbly mud 💩"],
        correct: 0
      },
      {
        q: "What is a baby bear called?",
        a: ["Cub 🐻", "Calf 🐮", "Puppy 🐶"],
        correct: 0
      },
      {
        q: "What sweet liquid do bees collect from flowers to make honey?",
        a: ["Nectar 🌸", "Sap 🪵", "Rainwater 💧"],
        correct: 0
      },
      {
        q: "How many legs does a busy honey bee have?",
        a: ["6 legs 🐝", "8 legs 🕷️", "4 legs 🐾"],
        correct: 0
      }
    ];

    const quiz = questions[Math.floor(Math.random() * questions.length)];

    this.container.innerHTML = `
      <div id="quiz-game" style="width:100%; height:100%; background:#ecfdf5; padding:20px; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:20px; text-align:center;">
        <h2 style="font-family:var(--font-title); font-size:1.4rem; color:var(--color-forest-dark); margin:0 10px;">${quiz.q}</h2>
        <div id="quiz-options" style="display:flex; flex-direction:column; gap:12px; width:100%; max-width:320px;">
          ${quiz.a.map((ans, idx) => `
            <button class="btn btn-quiz-option" data-idx="${idx}" style="padding:14px; background:#fff; border:2px solid #a7f3d0; border-radius:12px; font-family:var(--font-body); font-weight:600; font-size:1.1rem; cursor:pointer; color:var(--color-text); transition:all 0.2s;">
              ${ans}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    const buttons = this.container.querySelectorAll('.btn-quiz-option');
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.background = '#e6fffa';
        btn.style.borderColor = '#34d399';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = '#fff';
        btn.style.borderColor = '#a7f3d0';
      });

      btn.addEventListener('click', () => {
        const selectedIdx = parseInt(btn.dataset.idx);
        const won = selectedIdx === quiz.correct;
        const reward = won ? 3 : -1;

        buttons.forEach(b => b.disabled = true);

        if (won) {
          btn.style.background = '#d1fae5';
          btn.style.borderColor = '#10b981';
          if (window.playAudio) window.playAudio('collect');
        } else {
          btn.style.background = '#fee2e2';
          btn.style.borderColor = '#ef4444';
          if (window.playAudio) window.playAudio('sting');
          // Highlight correct one
          buttons[quiz.correct].style.background = '#d1fae5';
          buttons[quiz.correct].style.borderColor = '#10b981';
        }

        setTimeout(() => {
          this.container.innerHTML = `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; font-family:var(--font-title);">
              <h2 style="font-size:2rem; margin-bottom:10px;">${won ? '🎉 Correct Answer!' : '😢 Oops, Wrong!'}</h2>
              <p style="font-size:1.2rem; color:${won ? '#fbbf24' : '#ef4444'};">
                ${won ? `Reward: +${reward} Honey 🍯` : `Penalty: ${reward} Honey 🍯`}
              </p>
            </div>
          `;
          setTimeout(() => this.onComplete(won, reward), 2000);
        }, 1200);
      });
    });
  }

  // --- TIC TAC TOE vs MR SQUIRREL ---
  startTicTacToe() {
    this.container.innerHTML = `
      <div id="ttt-game" style="width:100%; height:100%; background:#fef3c7; padding:15px; display:flex; flex-direction:column; gap:10px; justify-content:center; align-items:center;">
        <div id="ttt-hud" style="font-weight:bold; font-family:var(--font-body); width:100%; display:flex; justify-content:space-between;">
          <span>🐻 You (🐾)</span>
          <span>🐿️ Mr. Squirrel (🌰)</span>
        </div>
        <div id="ttt-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; width:220px; height:220px;">
          ${Array(9).fill(null).map((_, idx) => `
            <div class="ttt-cell" data-idx="${idx}" style="background:#fff; border-radius:12px; border:2px solid #fde047; display:flex; align-items:center; justify-content:center; font-size:2.2rem; cursor:pointer; user-select:none; transition:all 0.2s;"></div>
          `).join('')}
        </div>
      </div>
    `;

    const grid = document.getElementById('ttt-grid');
    const cells = this.container.querySelectorAll('.ttt-cell');
    let board = Array(9).fill(null); // '🐾' or '🌰'
    let gameActive = true;

    const checkWin = (b, symbol) => {
      const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
        [0, 4, 8], [2, 4, 6]             // diagonals
      ];
      return winPatterns.some(pattern => pattern.every(idx => b[idx] === symbol));
    };

    const squirrelMove = () => {
      if (!gameActive) return;
      
      // Find empty slots
      const emptyIdxs = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
      if (emptyIdxs.length === 0) return;

      // 1. Try to win
      for (let idx of emptyIdxs) {
        let tempBoard = [...board];
        tempBoard[idx] = '🌰';
        if (checkWin(tempBoard, '🌰')) {
          makeMove(idx, '🌰');
          return;
        }
      }

      // 2. Try to block player
      for (let idx of emptyIdxs) {
        let tempBoard = [...board];
        tempBoard[idx] = '🐾';
        if (checkWin(tempBoard, '🐾')) {
          makeMove(idx, '🌰');
          return;
        }
      }

      // 3. Take center if open
      if (emptyIdxs.includes(4)) {
        makeMove(4, '🌰');
        return;
      }

      // 4. Random move
      const randomIdx = emptyIdxs[Math.floor(Math.random() * emptyIdxs.length)];
      makeMove(randomIdx, '🌰');
    };

    const makeMove = (idx, symbol) => {
      board[idx] = symbol;
      cells[idx].innerText = symbol;
      
      if (symbol === '🐾') {
        cells[idx].style.color = '#e11d48';
      } else {
        cells[idx].style.color = '#d97706';
      }

      if (window.playAudio) window.playAudio('collect');

      if (checkWin(board, symbol)) {
        endGame(symbol === '🐾' ? 'win' : 'lose');
      } else if (board.every(val => val !== null)) {
        endGame('draw');
      } else if (symbol === '🐾') {
        // Squirrel turn after a short delay
        setTimeout(squirrelMove, 600);
      }
    };

    const endGame = (outcome) => {
      gameActive = false;
      let title = '';
      let reward = 0;
      let won = false;

      if (outcome === 'win') {
        title = '🎉 You beat Mr. Squirrel!';
        reward = 3;
        won = true;
      } else if (outcome === 'draw') {
        title = '🤝 It\'s a tie!';
        reward = 1;
        won = true;
      } else {
        title = '🐿️ Mr. Squirrel won!';
        reward = -1;
      }

      setTimeout(() => {
        this.container.innerHTML = `
          <div style="width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; font-family:var(--font-title);">
            <h2 style="font-size:1.8rem; margin-bottom:10px;">${title}</h2>
            <p style="font-size:1.2rem; color:${reward >= 0 ? '#fbbf24' : '#ef4444'};">
              ${reward >= 0 ? `Reward: +${reward} Honey 🍯` : `Penalty: ${reward} Honey 🍯`}
            </p>
          </div>
        `;
        setTimeout(() => this.onComplete(won, reward), 2000);
      }, 1000);
    };

    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        if (!gameActive) return;
        const idx = parseInt(cell.dataset.idx);
        if (board[idx] !== null) return;

        makeMove(idx, '🐾');
      });
    });
  }

  // --- BEE DODGER GAME ---
  startBeeDodger() {
    this.container.innerHTML = `<canvas id="minigame-canvas" width="500" height="375" style="display: block; width: 100%; height: 100%;"></canvas>`;
    const canvas = document.getElementById('minigame-canvas');
    const ctx = canvas.getContext('2d');

    let timeLeft = 15; // survive 15 seconds
    let gameActive = true;
    let hitStung = false;

    const bear = {
      x: 60,
      y: canvas.height / 2,
      radius: 18,
      speed: 6
    };

    const bees = [];

    // Controls
    let moveUp = false;
    let moveDown = false;

    const keyDownHandler = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') moveUp = true;
      if (e.key === 'ArrowDown' || e.key === 's') moveDown = true;
    };

    const keyUpHandler = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') moveUp = false;
      if (e.key === 'ArrowDown' || e.key === 's') moveDown = false;
    };

    const mouseMoveHandler = (e) => {
      const rect = canvas.getBoundingClientRect();
      const root = document.documentElement;
      const mouseY = e.clientY - rect.top - root.scrollTop;
      bear.y = mouseY;
      // Boundaries
      if (bear.y < bear.radius) bear.y = bear.radius;
      if (bear.y > canvas.height - bear.radius) bear.y = canvas.height - bear.radius;
    };

    const touchMoveHandler = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touchY = e.touches[0].clientY - rect.top;
      bear.y = touchY;
      if (bear.y < bear.radius) bear.y = bear.radius;
      if (bear.y > canvas.height - bear.radius) bear.y = canvas.height - bear.radius;
    };

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('touchmove', touchMoveHandler, { passive: false });

    // Spawn bees
    const spawnInterval = setInterval(() => {
      if (!gameActive) return;
      bees.push({
        x: canvas.width + 20,
        y: Math.random() * (canvas.height - 40) + 20,
        width: 24,
        height: 16,
        speed: Math.random() * 3 + 4
      });
    }, 400);

    // Timer
    const timerInterval = setInterval(() => {
      if (!gameActive) return;
      timeLeft--;
      if (timeLeft <= 0) {
        endGame(true);
      }
    }, 1000);

    const endGame = (survived = false) => {
      gameActive = false;
      clearInterval(spawnInterval);
      clearInterval(timerInterval);
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
      canvas.removeEventListener('mousemove', mouseMoveHandler);

      const penalty = survived ? 0 : -2;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Fredoka';
      ctx.textAlign = 'center';
      
      if (survived) {
        ctx.fillText('🏆 Success! You dodged the bees!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Keep all your honey! 🍯`, canvas.width / 2, canvas.height / 2 + 20);
      } else {
        ctx.fillText('💥 Ouch! You got stung!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`Penalty: ${penalty} Honey 🍯`, canvas.width / 2, canvas.height / 2 + 20);
      }

      setTimeout(() => this.onComplete(survived, penalty), 2000);
    };

    const draw = () => {
      if (!gameActive) return;

      // Draw whimsical sky backdrop
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clouds decoration
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(80, 60, 30, 0, Math.PI * 2);
      ctx.arc(120, 50, 40, 0, Math.PI * 2);
      ctx.arc(160, 60, 30, 0, Math.PI * 2);
      ctx.fill();

      // Keyboard movement
      if (moveUp && bear.y > bear.radius) bear.y -= bear.speed;
      if (moveDown && bear.y < canvas.height - bear.radius) bear.y += bear.speed;

      // Draw Bear Face
      ctx.fillStyle = '#f472b6'; // Cute pink bear
      ctx.beginPath();
      ctx.arc(bear.x, bear.y, bear.radius, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.beginPath();
      ctx.arc(bear.x - bear.radius + 4, bear.y - bear.radius + 4, 8, 0, Math.PI * 2);
      ctx.arc(bear.x + bear.radius - 4, bear.y - bear.radius + 4, 8, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(bear.x - 6, bear.y - 2, 2.5, 0, Math.PI * 2);
      ctx.arc(bear.x + 6, bear.y - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Snout
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(bear.x, bear.y + 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(bear.x, bear.y + 4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Update and draw bees
      for (let i = bees.length - 1; i >= 0; i--) {
        const bee = bees[i];
        bee.x -= bee.speed;

        // Collision check
        const dist = Math.hypot(bear.x - bee.x, bear.y - bee.y);
        if (dist < bear.radius + bee.width / 2) {
          if (window.playAudio) window.playAudio('sting');
          endGame(false);
          return;
        }

        // Out of bounds
        if (bee.x < -30) {
          bees.splice(i, 1);
          continue;
        }

        // Draw Bee (Yellow/Black stripes)
        ctx.fillStyle = '#eab308'; // Yellow body
        ctx.beginPath();
        ctx.ellipse(bee.x, bee.y, bee.width / 2, bee.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stripes
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bee.x - 2, bee.y - bee.height / 2 + 1);
        ctx.lineTo(bee.x - 2, bee.y + bee.height / 2 - 1);
        ctx.moveTo(bee.x + 4, bee.y - bee.height / 2 + 2);
        ctx.lineTo(bee.x + 4, bee.y + bee.height / 2 - 2);
        ctx.stroke();

        // Wings
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(bee.x, bee.y - 8, 4, 8, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // HUD
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px Outfit';
      ctx.textAlign = 'left';
      ctx.fillText('🐝 Dodge the bees!', 16, 30);
      
      ctx.textAlign = 'right';
      ctx.fillText(`⏱️ Time: ${timeLeft}s`, canvas.width - 16, 30);

      requestAnimationFrame(draw);
    };

    draw();
  }
}

