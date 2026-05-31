// Web Audio Synth for Premium sound effects (Zero asset dependencies!)
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmInterval = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  startBGM() {
    this.init();
    if (this.bgmInterval) return; // BGM already running
    
    // Soft, whimsical pentatonic arpeggio (C4, E4, F4, G4, A4, C5) for a forest theme
    const melody = [261.63, 329.63, 349.23, 392.00, 440.00, 523.25, 440.00, 392.00];
    let noteIdx = 0;
    
    this.bgmInterval = setInterval(() => {
      if (this.muted || !this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
        return;
      }
      
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      // Soft triangle wave for a cozy woodwind / music-box sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(melody[noteIdx], t);
      
      // Keep background music very soft
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.015, t + 0.05); // quick fade in
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55); // long decay
      
      osc.start(t);
      osc.stop(t + 0.6);
      
      noteIdx = (noteIdx + 1) % melody.length;
    }, 450); // soft tempo
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  play(type) {
    if (this.muted) return;
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    const t = this.ctx.currentTime;
    
    switch(type) {
      case 'click': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      }
      case 'roll': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(300, t + 0.4);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
        break;
      }
      case 'collect': {
        // Double sweet note
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc1.frequency.setValueAtTime(523.25, t); // C5
        osc1.frequency.setValueAtTime(659.25, t + 0.08); // E5
        osc2.frequency.setValueAtTime(783.99, t + 0.16); // G5
        
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.35);
        
        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.35);
        osc2.stop(t + 0.35);
        break;
      }
      case 'sting': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.linearRampToValueAtTime(80, t + 0.3);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      }
      case 'hazard': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.5);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
        break;
      }
      case 'win': {
        // Fanfare!
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.frequency.setValueAtTime(freq, t + idx * 0.1);
          gain.gain.setValueAtTime(0.12, t + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.01, t + idx * 0.1 + 0.4);
          osc.start(t + idx * 0.1);
          osc.stop(t + idx * 0.1 + 0.4);
        });
        break;
      }
    }
  }
}

// Global Sound Instance
const sound = new SoundEngine();
window.playAudio = (type) => sound.play(type);

// Game board path configs
const PATH_CONFIG = {
  width: 1000,
  height: 1000,
  spacesCount: 100
};

// Types of board spaces
const SPACE_TYPES = {
  START: 'START',
  HONEY_1: 'HONEY_1',
  HONEY_2: 'HONEY_2',
  HONEY_3: 'HONEY_3',
  HAZARD_BEE: 'HAZARD_BEE',
  HAZARD_SKUNK: 'HAZARD_SKUNK',
  HAZARD_HUNTER: 'HAZARD_HUNTER',
  HAZARD_MUD: 'HAZARD_MUD',
  QUEST: 'QUEST',
  END: 'END'
};

class Game {
  constructor() {
    this.players = [];
    this.activePlayerIndex = 0;
    this.spaces = [];
    this.boardCoordinates = [];
    
    this.diceValue = 1;
    this.isRolling = false;
    this.isMoving = false;
    this.winningHoney = 25;
    
    // UI elements
    this.welcomeScreen = document.getElementById('welcome-screen');
    this.gameScreen = document.getElementById('game-screen');
    this.boardSvg = document.getElementById('game-board-svg');
    this.spacesGroup = document.getElementById('spaces-group');
    this.playersGroup = document.getElementById('players-group');
    this.trailPath = document.getElementById('board-trail');
    this.trailPathInner = document.getElementById('board-trail-inner');
    
    this.activeBearName = document.getElementById('active-bear-name');
    this.activeBearIcon = document.getElementById('active-bear-icon');
    this.diceElement = document.getElementById('dice-element');
    this.rollBtn = document.getElementById('roll-btn');
    this.turnStatus = document.getElementById('turn-status');
    this.jarsList = document.getElementById('players-jars-list');
    
    this.eventDialog = document.getElementById('event-dialog');
    this.eventTitle = document.getElementById('event-title');
    this.eventDescription = document.getElementById('event-description');
    this.eventIcon = document.getElementById('event-icon');
    this.eventOkBtn = document.getElementById('event-ok-btn');
    
    this.minigameDialog = document.getElementById('minigame-dialog');
    this.minigameTitle = document.getElementById('minigame-title');
    this.minigameHelp = document.getElementById('minigame-help');
    this.minigameActions = document.getElementById('minigame-actions');
    this.minigameCloseBtn = document.getElementById('minigame-close-btn');

    this.winDialog = document.getElementById('win-dialog');
    this.winTitle = document.getElementById('win-title');
    this.winDescription = document.getElementById('win-description');
    
    this.initEvents();
  }

  initEvents() {
    // Player selection buttons
    const countBtns = document.querySelectorAll('.player-count-btn');
    countBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        sound.play('click');
        countBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const count = parseInt(btn.dataset.count);
        for (let i = 1; i <= 4; i++) {
          const inputRow = document.getElementById(`player-${i}-input`);
          if (i <= count) {
            inputRow.classList.remove('hidden');
          } else {
            inputRow.classList.add('hidden');
          }
        }
      });
    });

    // Start Game
    document.getElementById('start-game-btn').addEventListener('click', () => {
      sound.play('click');
      sound.startBGM(); // Start loop BGM!
      this.setupGame();
    });

    // Audio Toggle
    const audioBtn = document.getElementById('toggle-audio');
    audioBtn.addEventListener('click', () => {
      sound.muted = !sound.muted;
      audioBtn.innerText = sound.muted ? '🔇' : '🔊';
    });

    // Dice Roll
    this.rollBtn.addEventListener('click', () => {
      if (this.isRolling || this.isMoving) return;
      this.rollDice();
    });

    // Restart game
    document.getElementById('restart-game-btn').addEventListener('click', () => {
      sound.play('click');
      this.winDialog.close();
      this.welcomeScreen.classList.add('active');
      this.gameScreen.classList.remove('active');
    });
  }

  // Set up players and procedurally layout board path
  setupGame() {
    const activeBtn = document.querySelector('.player-count-btn.active');
    const count = parseInt(activeBtn.dataset.count);
    
    this.players = [];
    const colors = [
      { name: 'Pink', hex: '#f472b6', emoji: '🌸🐻' },
      { name: 'Mint', hex: '#34d399', emoji: '🌱🐻' },
      { name: 'Sunny', hex: '#fbbf24', emoji: '☀️🐻' },
      { name: 'Sky', hex: '#60a5fa', emoji: '☁️🐻' }
    ];

    for (let i = 1; i <= count; i++) {
      const nameInput = document.querySelector(`#player-${i}-input input`);
      this.players.push({
        id: i,
        name: nameInput.value.trim() || `${colors[i-1].name} Bear`,
        color: colors[i-1].hex,
        emoji: colors[i-1].emoji,
        position: 0, // Starts at space 0
        honey: 0,
        mudTurns: 0,
        skunkBlocked: false
      });
    }

    this.generateBoardPath();
    this.generateSpaceTypes();
    this.renderBoard();
    this.renderPlayers();
    this.updateLeaderboard();
    
    this.activePlayerIndex = 0;
    this.updateActivePlayerUI();

    this.welcomeScreen.classList.remove('active');
    this.gameScreen.classList.add('active');
  }

  // Generates a whimsical winding trail snake path across the board
  generateBoardPath() {
    this.boardCoordinates = [];
    
    // Snaking track generation
    const padding = 80;
    const width = PATH_CONFIG.width - padding * 2;
    const height = PATH_CONFIG.height - padding * 2;
    
    const rows = 10;
    const cols = 10;
    
    for (let r = 0; r < rows; r++) {
      const y = padding + (height / (rows - 1)) * (rows - 1 - r); // start from bottom to top
      const isReverse = r % 2 !== 0;
      
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;
        const colVal = isReverse ? (cols - 1 - c) : c;
        const x = padding + (width / (cols - 1)) * colVal;
        
        // Add subtle organic offset to make it look winding/hand-drawn
        let offsetX = 0;
        let offsetY = 0;
        
        if (index > 0 && index < 99) {
          offsetX = Math.sin(index * 0.8) * 16;
          offsetY = Math.cos(index * 0.8) * 16;
        }

        this.boardCoordinates.push({ x: x + offsetX, y: y + offsetY });
      }
    }
  }

  // Distribute hazards, side quests, and honey rewards among the 100 spaces
  generateSpaceTypes() {
    this.spaces = Array(PATH_CONFIG.spacesCount).fill(null).map((_, i) => {
      if (i === 0) return { type: SPACE_TYPES.START, index: i };
      if (i === 99) return { type: SPACE_TYPES.END, index: i };
      
      // Categorize remaining 98 spaces
      const rand = Math.random();
      
      if (rand < 0.35) {
        // Honey spaces
        const sub = Math.random();
        if (sub < 0.6) return { type: SPACE_TYPES.HONEY_1, amount: 1, index: i };
        if (sub < 0.9) return { type: SPACE_TYPES.HONEY_2, amount: 2, index: i };
        return { type: SPACE_TYPES.HONEY_3, amount: 3, index: i };
      } else if (rand < 0.65) {
        // Hazards
        const sub = Math.random();
        if (sub < 0.3) return { type: SPACE_TYPES.HAZARD_BEE, index: i };
        if (sub < 0.55) return { type: SPACE_TYPES.HAZARD_SKUNK, index: i };
        if (sub < 0.8) return { type: SPACE_TYPES.HAZARD_HUNTER, index: i };
        return { type: SPACE_TYPES.HAZARD_MUD, index: i };
      } else {
        // Quest space
        return { type: SPACE_TYPES.QUEST, index: i };
      }
    });
  }

  renderBoard() {
    this.spacesGroup.innerHTML = '';
    
    // Create the background trail path
    let d = `M ${this.boardCoordinates[0].x} ${this.boardCoordinates[0].y}`;
    for (let i = 1; i < this.boardCoordinates.length; i++) {
      d += ` L ${this.boardCoordinates[i].x} ${this.boardCoordinates[i].y}`;
    }
    
    this.trailPath.setAttribute('d', d);
    this.trailPathInner.setAttribute('d', d);

    // Draw space tree stumps
    this.spaces.forEach((space, i) => {
      const coord = this.boardCoordinates[i];
      const radius = i === 0 || i === 99 ? 34 : 26;
      
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `board-space ${this.getSpaceColorClass(space.type)}`);
      
      // Bark (outer circle)
      const bark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      bark.setAttribute('cx', coord.x);
      bark.setAttribute('cy', coord.y);
      bark.setAttribute('r', radius);
      bark.setAttribute('class', 'stump-bark');
      bark.setAttribute('filter', 'url(#shadow)');
      g.appendChild(bark);

      // Wood face (inner circle)
      const wood = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      wood.setAttribute('cx', coord.x);
      wood.setAttribute('cy', coord.y);
      wood.setAttribute('r', radius - 4);
      wood.setAttribute('class', 'stump-wood');
      g.appendChild(wood);

      // Age ring 1
      const ring1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring1.setAttribute('cx', coord.x);
      ring1.setAttribute('cy', coord.y);
      ring1.setAttribute('r', (radius - 4) * 0.65);
      ring1.setAttribute('class', 'stump-ring');
      g.appendChild(ring1);

      // Age ring 2
      const ring2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring2.setAttribute('cx', coord.x);
      ring2.setAttribute('cy', coord.y);
      ring2.setAttribute('r', (radius - 4) * 0.35);
      ring2.setAttribute('class', 'stump-ring');
      g.appendChild(ring2);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', coord.x);
      text.setAttribute('y', coord.y + 4);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-family', 'Fredoka');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('font-size', i === 0 || i === 99 ? '12px' : '10px');
      text.setAttribute('fill', '#5c3a21'); // Dark brown text to match wood rings
      text.textContent = this.getSpaceEmoji(space);

      g.appendChild(text);
      this.spacesGroup.appendChild(g);
    });
  }

  getSpaceColorClass(type) {
    switch (type) {
      case SPACE_TYPES.START: return 'space-start';
      case SPACE_TYPES.END: return 'space-end';
      case SPACE_TYPES.HONEY_1: return 'space-honey-1';
      case SPACE_TYPES.HONEY_2: return 'space-honey-2';
      case SPACE_TYPES.HONEY_3: return 'space-honey-3';
      case SPACE_TYPES.HAZARD_BEE: return 'space-hazard-bee';
      case SPACE_TYPES.HAZARD_SKUNK: return 'space-hazard-skunk';
      case SPACE_TYPES.HAZARD_HUNTER: return 'space-hazard-hunter';
      case SPACE_TYPES.HAZARD_MUD: return 'space-hazard-mud';
      case SPACE_TYPES.QUEST: return 'space-quest';
      default: return '';
    }
  }

  getSpaceEmoji(space) {
    if (space.index === 0) return 'START';
    if (space.index === 99) return 'WIN';
    switch (space.type) {
      case SPACE_TYPES.HONEY_1: return '🍯1';
      case SPACE_TYPES.HONEY_2: return '🍯2';
      case SPACE_TYPES.HONEY_3: return '🍯3';
      case SPACE_TYPES.HAZARD_BEE: return '🐝';
      case SPACE_TYPES.HAZARD_SKUNK: return '🦨';
      case SPACE_TYPES.HAZARD_HUNTER: return '🤠';
      case SPACE_TYPES.HAZARD_MUD: return '💩';
      case SPACE_TYPES.QUEST: return '❓';
      default: return '';
    }
  }

  renderPlayers() {
    this.playersGroup.innerHTML = '';
    
    this.players.forEach(player => {
      const coord = this.boardCoordinates[player.position];
      
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', `player-token-${player.id}`);
      g.setAttribute('class', 'player-token');
      // Apply offset depending on player ID to prevent overlapping
      const offset = this.getPlayerOffset(player.id);
      g.setAttribute('transform', `translate(${coord.x + offset.x}, ${coord.y + offset.y})`);
      
      // Token background ring (Scaled up!)
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('r', '28');
      ring.setAttribute('fill', player.color);
      ring.setAttribute('stroke', '#ffffff');
      ring.setAttribute('stroke-width', '4');
      ring.setAttribute('filter', 'url(#shadow)');

      // Emoji representation (Scaled up!)
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('y', '9');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '28px');
      text.textContent = '🐻';

      g.appendChild(ring);
      g.appendChild(text);
      this.playersGroup.appendChild(g);
    });
  }

  getPlayerOffset(id) {
    // Distribute overlapping bears in a circle
    const angle = (id * 2 * Math.PI) / 4;
    const r = 18;
    return {
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r
    };
  }

  // Smooth token translation along winding board coordinates
  animateToken(playerId, startPos, endPos, callback) {
    const token = document.getElementById(`player-token-${playerId}`);
    const offset = this.getPlayerOffset(playerId);
    
    let currentPos = startPos;
    const step = () => {
      if (currentPos === endPos) {
        if (callback) callback();
        return;
      }
      
      // Step closer
      currentPos += (endPos > startPos ? 1 : -1);
      const coord = this.boardCoordinates[currentPos];
      
      // Apply smooth transition
      token.setAttribute('transform', `translate(${coord.x + offset.x}, ${coord.y + offset.y})`);
      sound.play('click');
      
      setTimeout(step, 200);
    };
    step();
  }

  updateLeaderboard() {
    this.jarsList.innerHTML = '';
    
    this.players.forEach(player => {
      const percentage = Math.min(100, (player.honey / this.winningHoney) * 100);
      const row = document.createElement('div');
      row.className = `player-jar-row ${this.players[this.activePlayerIndex].id === player.id ? 'active-turn' : ''}`;
      
      row.innerHTML = `
        <div class="jar-avatar" style="background-color: ${player.color};">🐻</div>
        <div class="jar-info">
          <div class="jar-info-header">
            <span>${player.name}</span>
            <span>${player.honey} / ${this.winningHoney} 🍯</span>
          </div>
          <div class="jar-bar-bg">
            <div class="jar-bar-fill" style="width: ${percentage}%;"></div>
          </div>
        </div>
      `;
      this.jarsList.appendChild(row);
    });
  }

  updateActivePlayerUI() {
    const player = this.players[this.activePlayerIndex];
    this.activeBearName.innerText = player.name;
    this.activeBearIcon.innerText = player.emoji;
    this.activeBearIcon.style.backgroundColor = player.color;
    
    // Status text
    if (player.mudTurns > 0) {
      this.turnStatus.innerHTML = `⚠️ Stuck in Sticky Mud! Roll is cut in half! (1 turn left)`;
    } else if (player.skunkBlocked) {
      this.turnStatus.innerHTML = `🦨 Skunk blocking path! Roll an <b>Even</b> number to pass, or pay 1 honey.`;
    } else {
      this.turnStatus.innerText = 'Roll the dice to move!';
    }
    
    this.updateLeaderboard();
  }

  rollDice() {
    this.isRolling = true;
    this.rollBtn.disabled = true;
    
    sound.play('roll');
    this.diceElement.classList.add('rolling');

    // Simulate 3D rotation faces randomly
    const diceFaces = [
      { x: 0, y: 0 },       // 1
      { x: 180, y: 0 },     // 6
      { x: 0, y: -90 },     // 3
      { x: 0, y: 90 },      // 4
      { x: -90, y: 0 },     // 2
      { x: 90, y: 0 }       // 5
    ];
    
    const rollResult = Math.floor(Math.random() * 6) + 1;
    const face = diceFaces[rollResult - 1];

    setTimeout(() => {
      this.diceElement.classList.remove('rolling');
      this.diceElement.style.transform = `rotateX(${face.x}deg) rotateY(${face.y}deg)`;
      this.diceValue = rollResult;
      
      this.isRolling = false;
      this.moveActivePlayer();
    }, 800);
  }

  moveActivePlayer() {
    const player = this.players[this.activePlayerIndex];
    let movement = this.diceValue;
    
    // Sticky Mud penalty
    if (player.mudTurns > 0) {
      movement = Math.max(1, Math.floor(movement / 2));
      player.mudTurns = 0; // consumed
    }

    // Skunk blocked interaction
    if (player.skunkBlocked) {
      if (movement % 2 === 0) {
        // Roll is even, we break free
        player.skunkBlocked = false;
        this.turnStatus.innerHTML = `Rolled an even ${movement}! Sneaked past the Skunk!`;
        this.executeMovement(player, movement);
      } else {
        // Odd roll: show interactive decision dialog!
        this.showSkunkDialog(player, movement);
      }
    } else {
      this.executeMovement(player, movement);
    }
  }

  showSkunkDialog(player, movement) {
    this.eventTitle.innerText = 'Smelly Skunk block! 🦨';
    this.eventIcon.innerText = '🦨';
    this.eventDescription.innerText = `${player.name} rolled an odd number (${movement}). Would you like to pay 1 honey to pass, or stay blocked and lose your turn?`;
    
    // Inject choices dynamically
    const actions = this.eventDialog.querySelector('.modal-actions');
    actions.innerHTML = `
      <button id="skunk-pay-btn" class="btn btn-primary" ${player.honey >= 1 ? '' : 'disabled'} style="margin-right:10px;">Pay 1 Honey 🍯</button>
      <button id="skunk-wait-btn" class="btn btn-secondary" style="background:rgba(0,0,0,0.15); border-radius:16px; padding:12px 24px; font-weight:bold; color:var(--color-text); border:none; cursor:pointer;">Stay Blocked 🦨</button>
    `;
    
    // Pay button action
    const payBtn = this.eventDialog.querySelector('#skunk-pay-btn');
    payBtn.onclick = () => {
      sound.play('collect');
      player.honey--;
      player.skunkBlocked = false;
      this.eventDialog.close();
      this.restoreEventDialogButtons();
      
      this.turnStatus.innerText = `Paid 1 Honey to pass the Skunk! Moving ${movement} spaces.`;
      this.executeMovement(player, movement);
    };
    
    // Wait button action
    const waitBtn = this.eventDialog.querySelector('#skunk-wait-btn');
    waitBtn.onclick = () => {
      sound.play('hazard');
      this.eventDialog.close();
      this.restoreEventDialogButtons();
      
      this.turnStatus.innerText = `Chose to stay blocked by the Skunk. Next player!`;
      this.nextTurn();
    };
    
    this.eventDialog.showModal();
  }

  restoreEventDialogButtons() {
    const actions = this.eventDialog.querySelector('.modal-actions');
    actions.innerHTML = `<button id="event-ok-btn" class="btn btn-primary">Okay!</button>`;
    this.eventOkBtn = document.getElementById('event-ok-btn');
  }

  executeMovement(player, movement) {
    const startPos = player.position;
    let endPos = startPos + movement;
    
    if (endPos >= 99) {
      endPos = 99;
    }

    this.isMoving = true;
    this.animateToken(player.id, startPos, endPos, () => {
      player.position = endPos;
      this.isMoving = false;
      
      // Arrived, check space event
      this.resolveSpaceEvent();
    });
  }

  resolveSpaceEvent() {
    const player = this.players[this.activePlayerIndex];
    const space = this.spaces[player.position];

    switch (space.type) {
      case SPACE_TYPES.HONEY_1:
      case SPACE_TYPES.HONEY_2:
      case SPACE_TYPES.HONEY_3: {
        player.honey += space.amount;
        sound.play('collect');
        this.showEventDialog('Honey Patch! 🍯', `Yum! ${player.name} gathered +${space.amount} Honey!`, '🍯');
        break;
      }
      
      case SPACE_TYPES.HAZARD_BEE: {
        // Sting threat minigame trigger or pay honey
        sound.play('sting');
        this.showEventDialog('Bee Sting! 🐝', `A swarm of bees is buzzing! Dodge the bees in the mini-game to keep your honey!`, '🐝');
        this.eventOkBtn.onclick = () => {
          this.eventDialog.close();
          this.triggerMiniGame('bee');
        };
        break;
      }

      case SPACE_TYPES.HAZARD_SKUNK: {
        player.skunkBlocked = true;
        sound.play('hazard');
        this.showEventDialog('Smelly Skunk! 🦨', `A skunk blocks the trail. On your next turn, roll an Even number or pay 1 honey to pass!`, '🦨');
        break;
      }

      case SPACE_TYPES.HAZARD_HUNTER: {
        // Scare back
        sound.play('hazard');
        const start = player.position;
        const target = Math.max(0, start - 3);
        this.showEventDialog('Hunter! 🤠', `Uh oh, a hunter is nearby! ${player.name} runs back 3 spaces!`, '🤠');
        this.eventOkBtn.onclick = () => {
          this.eventDialog.close();
          this.animateToken(player.id, start, target, () => {
            player.position = target;
            this.nextTurn();
          });
        };
        break;
      }

      case SPACE_TYPES.HAZARD_MUD: {
        player.mudTurns = 1;
        sound.play('hazard');
        this.showEventDialog('Sticky Mud! 💩', `Squish! Sticky mud slows your bear down. Your next roll is cut in half!`, '💩');
        break;
      }

      case SPACE_TYPES.QUEST: {
        // Trigger mini side-quest
        this.showEventDialog('Mysterious Quest! ❓', `${player.name} found a secret path leading to a mini-game quest!`, '❓');
        this.eventOkBtn.onclick = () => {
          this.eventDialog.close();
          const games = ['catcher', 'memory', 'scramble', 'quiz', 'tictactoe'];
          const randomGame = games[Math.floor(Math.random() * games.length)];
          this.triggerMiniGame(randomGame);
        };
        break;
      }

      case SPACE_TYPES.END: {
        this.checkWinCondition();
        break;
      }

      default: {
        // Start or Safe Space
        this.nextTurn();
      }
    }
  }

  showEventDialog(title, desc, icon) {
    this.eventTitle.innerText = title;
    this.eventDescription.innerText = desc;
    this.eventIcon.innerText = icon;
    
    // Reset standard behavior
    this.eventOkBtn.onclick = () => {
      sound.play('click');
      this.eventDialog.close();
      this.checkWinCondition();
      this.nextTurn();
    };
    
    this.eventDialog.showModal();
  }

  triggerMiniGame(gameType) {
    const player = this.players[this.activePlayerIndex];
    this.minigameDialog.showModal();
    this.minigameActions.classList.add('hidden');
    
    const manager = new MiniGameManager('minigame-container', (success, honeyDiff) => {
      // Game over callback
      player.honey = Math.max(0, player.honey + honeyDiff);
      
      this.minigameActions.classList.remove('hidden');
      this.minigameCloseBtn.onclick = () => {
        this.minigameDialog.close();
        this.checkWinCondition();
        this.nextTurn();
      };
    });

    if (gameType === 'bee' || gameType === 'catcher') {
      this.minigameTitle.innerText = '🍯 Honey Catcher';
      this.minigameHelp.innerText = 'Move your mouse/finger or Arrow keys (A/D) left and right to catch honey drops. Avoid gray rocks!';
      manager.startHoneyCatcher();
    } else if (gameType === 'scramble') {
      this.minigameTitle.innerText = '🍓 Berry Clicker';
      this.minigameHelp.innerText = 'Click or tap berries as fast as they appear! Click 10 berries to win!';
      manager.startBerryScramble();
    } else if (gameType === 'quiz') {
      this.minigameTitle.innerText = '🌲 Forest Quiz';
      this.minigameHelp.innerText = 'Answer the whimsical forest question correctly to earn honey!';
      manager.startForestQuiz();
    } else if (gameType === 'tictactoe') {
      this.minigameTitle.innerText = '🐿️ Mr. Squirrel\'s Tic-Tac-Toe';
      this.minigameHelp.innerText = 'Get three marks (🐾) in a row to win! Mr. Squirrel plays with (🌰).';
      manager.startTicTacToe();
    } else {
      this.minigameTitle.innerText = '🐻 Bear Memory';
      this.minigameHelp.innerText = 'Match the cards to find forest friends! Match all pairs in under 9 turns.';
      manager.startBearMemory();
    }
  }

  checkWinCondition() {
    // If player reaches space 99 OR has 25 honey
    const player = this.players[this.activePlayerIndex];
    if (player.honey >= this.winningHoney || player.position === 99) {
      sound.play('win');
      this.winTitle.innerText = `🏆 ${player.name} Wins!`;
      this.winDescription.innerText = `${player.name} successfully collected ${player.honey} units of honey and mastered the forest adventure!`;
      this.winDialog.showModal();
      return true;
    }
    return false;
  }

  nextTurn() {
    this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    this.rollBtn.disabled = false;
    this.updateActivePlayerUI();
  }
}

// Initialise game when window loads
window.addEventListener('load', () => {
  new Game();
});
