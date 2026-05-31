import React, { useState, useEffect, useRef } from 'react';
import { sound } from './utils/audio';
import GameBoard from './components/GameBoard';
import MiniGames from './components/MiniGames';
import AnimationOverlay from './components/AnimationOverlay';

const WINNING_HONEY = 50;
const SPACES_COUNT = 100;

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

const BEAR_COLORS = [
  { name: 'Pink', hex: '#f472b6', emoji: '🌸🐻' },
  { name: 'Mint', hex: '#34d399', emoji: '🌱🐻' },
  { name: 'Sunny', hex: '#fbbf24', emoji: '☀️🐻' },
  { name: 'Sky', hex: '#60a5fa', emoji: '☁️🐻' }
];

export default function App() {
  const [screen, setScreen] = useState('welcome'); // 'welcome' | 'game' | 'win'
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState(['Pink Bear', 'Mint Bear', 'Sunny Bear', 'Sky Bear']);
  const [players, setPlayers] = useState([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [spaces, setSpaces] = useState([]);
  
  // Game states
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [turnStatus, setTurnStatus] = useState('Roll to start your journey!');
  const [muted, setMuted] = useState(false);

  // Modal / Overlay Dialogs
  const [eventDialog, setEventDialog] = useState(null); // { title, desc, icon, onOk, choices }
  const [activeMinigame, setActiveMinigame] = useState(null); // 'bee' | 'catcher' | 'scramble' | 'quiz' | 'tictactoe'
  const [activeOverlay, setActiveOverlay] = useState(null); // { type, active }
  const [winner, setWinner] = useState(null);

  // Setup spaces procedurally once at start
  const initializeSpaces = () => {
    const list = Array(SPACES_COUNT).fill(null).map((_, i) => {
      if (i === 0) return { type: SPACE_TYPES.START, index: i };
      if (i === 99) return { type: SPACE_TYPES.END, index: i };

      const rand = Math.random();
      if (rand < 0.35) {
        const sub = Math.random();
        if (sub < 0.6) return { type: SPACE_TYPES.HONEY_1, amount: 1, index: i };
        if (sub < 0.9) return { type: SPACE_TYPES.HONEY_2, amount: 2, index: i };
        return { type: SPACE_TYPES.HONEY_3, amount: 3, index: i };
      } else if (rand < 0.65) {
        const sub = Math.random();
        if (sub < 0.3) return { type: SPACE_TYPES.HAZARD_BEE, index: i };
        if (sub < 0.55) return { type: SPACE_TYPES.HAZARD_SKUNK, index: i };
        if (sub < 0.8) return { type: SPACE_TYPES.HAZARD_HUNTER, index: i };
        return { type: SPACE_TYPES.HAZARD_MUD, index: i };
      } else {
        return { type: SPACE_TYPES.QUEST, index: i };
      }
    });
    setSpaces(list);
  };

  const handleStartGame = () => {
    sound.play('click');
    sound.startBGM();

    const initialPlayers = [];
    for (let i = 0; i < playerCount; i++) {
      initialPlayers.push({
        id: i + 1,
        name: playerNames[i].trim() || `${BEAR_COLORS[i].name} Bear`,
        color: BEAR_COLORS[i].hex,
        emoji: BEAR_COLORS[i].emoji,
        position: 0,
        honey: 0,
        mudTurns: 0,
        skunkBlocked: false
      });
    }

    setPlayers(initialPlayers);
    setActivePlayerIndex(0);
    initializeSpaces();
    setScreen('game');
    setTurnStatus('Roll the dice to move!');
    setWinner(null);
  };

  const handleMuteToggle = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    sound.setMute(nextMuted);
  };

  const rollDice = () => {
    if (isRolling || isMoving || eventDialog || activeMinigame || activeOverlay) return;
    
    setIsRolling(true);
    sound.play('roll');

    // Random roll
    const roll = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      setDiceValue(roll);
      setIsRolling(false);
      executeTurn(roll);
    }, 800);
  };

  const executeTurn = (roll) => {
    const player = players[activePlayerIndex];
    let movement = roll;

    // Mud check
    if (player.mudTurns > 0) {
      movement = Math.max(1, Math.floor(movement / 2));
      updatePlayer(activePlayerIndex, { mudTurns: 0 });
    }

    // Skunk check
    if (player.skunkBlocked) {
      if (movement % 2 === 0) {
        // Even roll breaks free
        updatePlayer(activePlayerIndex, { skunkBlocked: false });
        setTurnStatus(`Rolled even ${movement}! Sneaked past the Skunk!`);
        movePlayerStepByStep(activePlayerIndex, movement);
      } else {
        // Odd roll: Prompt skunk choices
        setEventDialog({
          title: 'Smelly Skunk block! 🦨',
          icon: '🦨',
          desc: `${player.name} rolled an odd number (${movement}). Would you like to pay 1 honey to pass, or stay blocked and lose your turn?`,
          choices: [
            {
              text: 'Pay 1 Honey 🍯',
              disabled: player.honey < 1,
              onClick: () => {
                sound.play('collect');
                updatePlayer(activePlayerIndex, { honey: Math.max(0, player.honey - 1), skunkBlocked: false });
                setEventDialog(null);
                setTurnStatus(`Paid 1 Honey to pass the Skunk!`);
                movePlayerStepByStep(activePlayerIndex, movement);
              }
            },
            {
              text: 'Stay Blocked 🦨',
              onClick: () => {
                sound.play('hazard');
                setEventDialog(null);
                setTurnStatus(`Chose to stay blocked by the Skunk. Next player!`);
                nextTurn();
              }
            }
          ]
        });
      }
    } else {
      movePlayerStepByStep(activePlayerIndex, movement);
    }
  };

  const movePlayerStepByStep = (idx, steps) => {
    setIsMoving(true);
    let stepCount = 0;
    
    const interval = setInterval(() => {
      setPlayers(prev => {
        const next = [...prev];
        const p = next[idx];
        if (p.position < SPACES_COUNT - 1 && stepCount < steps) {
          p.position += 1;
          stepCount++;
          sound.play('click');
        } else {
          clearInterval(interval);
          setIsMoving(false);
          resolveSpaceLanding(idx, p.position);
        }
        return next;
      });
    }, 250);
  };

  const resolveSpaceLanding = (idx, position) => {
    const player = players[idx];
    const space = spaces[position];

    if (position === SPACES_COUNT - 1) {
      checkWin(idx);
      return;
    }

    switch (space.type) {
      case SPACE_TYPES.HONEY_1:
      case SPACE_TYPES.HONEY_2:
      case SPACE_TYPES.HONEY_3: {
        sound.play('collect');
        const nextHoney = player.honey + space.amount;
        updatePlayer(idx, { honey: nextHoney });
        
        setEventDialog({
          title: 'Honey Patch! 🍯',
          icon: '🍯',
          desc: `Yum! ${player.name} gathered +${space.amount} Honey!`,
          onOk: () => {
            setEventDialog(null);
            if (nextHoney >= WINNING_HONEY) {
              triggerWinner(idx);
            } else {
              nextTurn();
            }
          }
        });
        break;
      }
      
      case SPACE_TYPES.HAZARD_BEE: {
        // Trigger swarm animation, then minigame
        sound.play('sting');
        setActiveOverlay({ type: 'bee', active: true });
        break;
      }

      case SPACE_TYPES.HAZARD_SKUNK: {
        sound.play('hazard');
        updatePlayer(idx, { skunkBlocked: true });
        setEventDialog({
          title: 'Smelly Skunk! 🦨',
          icon: '🦨',
          desc: `A skunk blocks the trail! On your next turn, roll an Even number or pay 1 honey to pass!`,
          onOk: () => {
            setEventDialog(null);
            nextTurn();
          }
        });
        break;
      }

      case SPACE_TYPES.HAZARD_HUNTER: {
        sound.play('hazard');
        setActiveOverlay({ type: 'hunter', active: true });
        break;
      }

      case SPACE_TYPES.HAZARD_MUD: {
        sound.play('hazard');
        updatePlayer(idx, { mudTurns: 1 });
        setEventDialog({
          title: 'Sticky Mud! 💩',
          icon: '💩',
          desc: `Squish! Sticky mud slows your bear down. Your next roll is cut in half!`,
          onOk: () => {
            setEventDialog(null);
            nextTurn();
          }
        });
        break;
      }

      case SPACE_TYPES.QUEST: {
        setEventDialog({
          title: 'Mysterious Quest! ❓',
          icon: '❓',
          desc: `${player.name} found a secret path leading to a mini-game quest!`,
          onOk: () => {
            setEventDialog(null);
            const games = ['catcher', 'memory', 'scramble', 'quiz', 'tictactoe'];
            const randomGame = games[Math.floor(Math.random() * games.length)];
            setActiveMinigame(randomGame);
          }
        });
        break;
      }

      default: {
        nextTurn();
      }
    }
  };

  const handleOverlayComplete = () => {
    const type = activeOverlay.type;
    const player = players[activePlayerIndex];
    setActiveOverlay(null);

    if (type === 'hunter') {
      // Scare back 3 spaces
      const target = Math.max(0, player.position - 3);
      setEventDialog({
        title: 'Runs Away! 🤠',
        icon: '🏃',
        desc: `Ah! The hunter got scared, but so did ${player.name}! You run back 3 spaces!`,
        onOk: () => {
          setEventDialog(null);
          // Animate back
          setIsMoving(true);
          let steps = player.position - target;
          let stepCount = 0;
          const interval = setInterval(() => {
            setPlayers(prev => {
              const next = [...prev];
              const p = next[activePlayerIndex];
              if (p.position > target && stepCount < steps) {
                p.position -= 1;
                stepCount++;
                sound.play('click');
              } else {
                clearInterval(interval);
                setIsMoving(false);
                nextTurn();
              }
              return next;
            });
          }, 250);
        }
      });
    } else if (type === 'bee') {
      // Trigger dodge bees minigame
      setActiveMinigame('bee');
    }
  };

  const handleMinigameComplete = (success, honeyDiff) => {
    const player = players[activePlayerIndex];
    const nextHoney = Math.max(0, player.honey + honeyDiff);
    updatePlayer(activePlayerIndex, { honey: nextHoney });
    setActiveMinigame(null);

    setEventDialog({
      title: success ? 'Quest Complete! 🎉' : 'Quest Failed 😢',
      icon: success ? '🏆' : '💔',
      desc: success 
        ? `${player.name} did awesome and collected +${honeyDiff} Honey!`
        : `${player.name} lost ${Math.abs(honeyDiff)} Honey!`,
      onOk: () => {
        setEventDialog(null);
        if (nextHoney >= WINNING_HONEY) {
          triggerWinner(activePlayerIndex);
        } else {
          nextTurn();
        }
      }
    });
  };

  const checkWin = (idx) => {
    triggerWinner(idx);
  };

  const triggerWinner = (idx) => {
    sound.play('win');
    setWinner(players[idx]);
    setScreen('win');
  };

  const nextTurn = () => {
    setActivePlayerIndex(prev => (prev + 1) % players.length);
  };

  const updatePlayer = (idx, fields) => {
    setPlayers(prev => prev.map((p, i) => i === idx ? { ...p, ...fields } : p));
  };

  const handleRestart = () => {
    sound.play('click');
    setScreen('welcome');
  };

  const activePlayer = players[activePlayerIndex];

  return (
    <div id="app">
      {/* 1. WELCOME SCREEN */}
      {screen === 'welcome' && (
        <div className="screen welcome-card glass">
          <h1 className="game-title">🐻 Honey Bear Adventure 🍯</h1>
          <p className="game-subtitle">Gather honey, completed side quests, and race stumps to the forest finish!</p>
          
          <div className="player-selection">
            <h3>Choose Players (2-4 players)</h3>
            <div className="player-selector-row">
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  className={`player-count-btn ${playerCount === num ? 'active' : ''}`}
                  onClick={() => { sound.play('click'); setPlayerCount(num); }}
                >
                  {num} Players
                </button>
              ))}
            </div>
            
            <div className="player-names-container">
              {Array(playerCount).fill(null).map((_, i) => (
                <div key={i} className="player-input-row">
                  <span className={`token-preview token-${BEAR_COLORS[i].name.toLowerCase()}`}>🐻</span>
                  <input
                    type="text"
                    value={playerNames[i]}
                    onChange={(e) => {
                      const next = [...playerNames];
                      next[i] = e.target.value;
                      setPlayerNames(next);
                    }}
                    placeholder={`Player ${i + 1} Name`}
                    maxLength={12}
                  />
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleStartGame} className="btn btn-primary btn-large">Start Adventure! 🚀</button>
        </div>
      )}

      {/* 2. GAME SCREEN */}
      {screen === 'game' && (
        <div className="screen">
          <header className="game-header glass">
            <div className="logo" style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', color: '#1e293b' }}>🐻 Honey Bear</div>
            <div className="game-stats">
              <div className="stat-bubble">
                <span className="stat-label">Goal:</span>
                <span className="stat-val">{WINNING_HONEY} 🍯</span>
              </div>
              <button onClick={handleMuteToggle} className="btn btn-icon">
                {muted ? '🔇' : '🔊'}
              </button>
            </div>
          </header>

          <main className="game-container">
            {/* Board Column */}
            <div className="board-wrapper glass">
              <GameBoard
                players={players}
                activePlayerIndex={activePlayerIndex}
                spaces={spaces}
              />
            </div>

            {/* Controls sidebar */}
            <aside className="game-sidebar">
              {activePlayer && (
                <div className="active-player-card glass">
                  <h3>Current Turn</h3>
                  <div className="active-bear-display">
                    <span
                      className="active-bear-emoji"
                      style={{
                        backgroundColor: activePlayer.color,
                        fontSize: '3rem',
                        padding: '16px',
                        borderRadius: '50%',
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                      }}
                    >
                      {activePlayer.emoji}
                    </span>
                    <h2>{activePlayer.name}</h2>
                  </div>
                  
                  {/* Dice roll */}
                  <div className="dice-section">
                    <div className="dice-box">
                      <div className={`dice ${isRolling ? 'rolling' : ''}`} style={{
                        transform: !isRolling ? getDiceTransform(diceValue) : undefined
                      }}>
                        <div className="face front"></div>
                        <div className="face back"></div>
                        <div className="face right"></div>
                        <div className="face left"></div>
                        <div className="face top"></div>
                        <div className="face bottom"></div>
                      </div>
                    </div>
                    <button
                      onClick={rollDice}
                      disabled={isRolling || isMoving || !!eventDialog || !!activeMinigame || !!activeOverlay}
                      className="btn btn-primary btn-large"
                    >
                      Roll Dice 🎲
                    </button>
                  </div>
                  
                  <div className="turn-instruction" style={{ marginTop: 10 }}>
                    {activePlayer.mudTurns > 0 ? (
                      <span style={{ color: '#ef4444' }}>⚠️ Muddy tracks! Roll is cut in half.</span>
                    ) : activePlayer.skunkBlocked ? (
                      <span style={{ color: '#64748b' }}>🦨 Skunk blocked! Roll even or pay 1 honey.</span>
                    ) : (
                      turnStatus
                    )}
                  </div>
                </div>
              )}

              {/* Jars stats */}
              <div className="leaderboard glass">
                <h3>Honey Jars</h3>
                <div id="players-jars-list">
                  {players.map((p, idx) => {
                    const pct = Math.min(100, (p.honey / WINNING_HONEY) * 100);
                    const isTurn = activePlayerIndex === idx;
                    return (
                      <div key={p.id} className={`player-jar-row ${isTurn ? 'active-turn' : ''}`}>
                        <div className="jar-avatar" style={{ backgroundColor: p.color }}>🐻</div>
                        <div className="jar-info">
                          <div className="jar-info-header">
                            <span>{p.name}</span>
                            <span>{p.honey} / {WINNING_HONEY} 🍯</span>
                          </div>
                          <div className="jar-bar-bg">
                            <div className="jar-bar-fill" style={{ width: `${pct}%`, background: p.color }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </main>
        </div>
      )}

      {/* 3. WIN SCREEN */}
      {screen === 'win' && winner && (
        <div className="screen welcome-card glass" style={{ maxWidth: 500, textAlign: 'center' }}>
          <span style={{ fontSize: '4.5rem' }}>👑🏆</span>
          <h1 className="game-title" style={{ fontSize: '2.5rem' }}>{winner.name} Wins!</h1>
          <p className="game-subtitle" style={{ fontSize: '1.2rem', margin: '15px 0' }}>
            Filled their honey jar with {winner.honey} 🍯 units of sweet honey!
          </p>
          <button onClick={handleRestart} className="btn btn-primary btn-large">Play Again 🔄</button>
        </div>
      )}

      {/* --- EVENT MODAL --- */}
      {eventDialog && (
        <div className="glass-modal">
          <div className="modal-content">
            <span className="modal-icon">{eventDialog.icon}</span>
            <h2 style={{ fontFamily: 'var(--font-title)' }}>{eventDialog.title}</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 500, color: 'var(--color-text-light)' }}>
              {eventDialog.desc}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {eventDialog.choices ? (
                eventDialog.choices.map((choice, i) => (
                  <button
                    key={i}
                    disabled={choice.disabled}
                    onClick={choice.onClick}
                    className="btn btn-primary"
                    style={{
                      padding: '10px 20px',
                      borderRadius: '16px',
                      background: i > 0 ? 'rgba(0,0,0,0.15)' : undefined,
                      color: i > 0 ? '#1e293b' : undefined,
                      boxShadow: i > 0 ? 'none' : undefined
                    }}
                  >
                    {choice.text}
                  </button>
                ))
              ) : (
                <button onClick={eventDialog.onOk} className="btn btn-primary btn-large" style={{ padding: '10px 24px', borderRadius: 16 }}>
                  Okay!
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MINI GAME MODAL --- */}
      {activeMinigame && (
        <div className="glass-modal">
          <div className="modal-content minigame-content" style={{ width: '90vw', maxWidth: 550 }}>
            <h2 style={{ fontFamily: 'var(--font-title)', marginBottom: 5 }}>Mini-Game Challenge!</h2>
            <div id="minigame-container" style={{ width: '100%', aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.4)', background: '#fff' }}>
              <MiniGames
                gameType={activeMinigame}
                onComplete={(success, reward) => handleMinigameComplete(success, reward)}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- ANIMATION OVERLAYS --- */}
      {activeOverlay && (
        <AnimationOverlay
          type={activeOverlay.type}
          active={activeOverlay.active}
          onComplete={handleOverlayComplete}
        />
      )}
    </div>
  );
}

function getDiceTransform(val) {
  const diceFaces = [
    { x: 0, y: 0 },       // 1
    { x: -90, y: 0 },     // 2
    { x: 0, y: -90 },     // 3
    { x: 0, y: 90 },      // 4
    { x: 90, y: 0 },      // 5
    { x: 0, y: 180 }      // 6
  ];
  const face = diceFaces[val - 1] || diceFaces[0];
  return `rotateX(${face.x}deg) rotateY(${face.y}deg)`;
}
