import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';

export default function MiniGames({ gameType, onComplete }) {
  switch (gameType) {
    case 'bee':
    case 'catcher':
      return <HoneyCatcher onComplete={onComplete} isBee={gameType === 'bee'} />;
    case 'scramble':
      return <BerryClicker onComplete={onComplete} />;
    case 'quiz':
      return <ForestQuiz onComplete={onComplete} />;
    case 'tictactoe':
      return <TicTacToe onComplete={onComplete} />;
    default:
      return <BearMemory onComplete={onComplete} />;
  }
}

// --- HONEY CATCHER / BEE STING DODGER ---
function HoneyCatcher({ onComplete, isBee }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(20);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let gameActive = true;
    let items = [];
    
    const jar = {
      x: canvas.width / 2 - 40,
      y: canvas.height - 50,
      width: 80,
      height: 40,
      speed: 8
    };

    let moveLeft = false;
    let moveRight = false;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft = true;
      if (e.key === 'ArrowRight' || e.key === 'd') moveRight = true;
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft = false;
      if (e.key === 'ArrowRight' || e.key === 'd') moveRight = false;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      jar.x = mouseX - jar.width / 2;
      if (jar.x < 0) jar.x = 0;
      if (jar.x > canvas.width - jar.width) jar.x = canvas.width - jar.width;
    };

    const handleTouchMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      jar.x = touchX - jar.width / 2;
      if (jar.x < 0) jar.x = 0;
      if (jar.x > canvas.width - jar.width) jar.x = canvas.width - jar.width;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Spawn loop
    const spawnTimer = setInterval(() => {
      if (!gameActive) return;
      const isHoney = Math.random() > 0.3;
      items.push({
        x: Math.random() * (canvas.width - 30) + 15,
        y: -20,
        type: isHoney ? 'honey' : 'rock',
        speed: Math.random() * 3 + 3,
        radius: 15
      });
    }, 600);

    // Clock timer
    const clockTimer = setInterval(() => {
      if (!gameActive) return;
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame(true, scoreRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const endGame = (timerDone = false, finalScore) => {
      gameActive = false;
      clearInterval(spawnTimer);
      clearInterval(clockTimer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      const win = timerDone && finalScore >= 8;
      const reward = win ? 4 : (finalScore >= 4 ? 2 : -1);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Fredoka';
      ctx.textAlign = 'center';
      
      if (win) {
        ctx.fillText('🏆 Win! Caught all the honey!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Reward: +${reward} Honey 🍯`, canvas.width / 2, canvas.height / 2 + 20);
      } else if (livesRef.current <= 0) {
        ctx.fillText('💥 Oops! You hit too many rocks!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`Penalty: ${reward} Honey 🍯`, canvas.width / 2, canvas.height / 2 + 20);
      } else {
        ctx.fillText("Time's Up!", canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = reward > 0 ? '#fbbf24' : '#ef4444';
        ctx.fillText(reward > 0 ? `Reward: +${reward} Honey 🍯` : `Penalty: ${reward} Honey 🍯`, canvas.width / 2, canvas.height / 2 + 20);
      }

      setTimeout(() => onComplete(win || finalScore >= 4, reward), 2000);
    };

    const draw = () => {
      if (!gameActive) return;
      ctx.fillStyle = '#ecfdf5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Backdrop
      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(60, canvas.height, 120, 0, Math.PI * 2);
      ctx.arc(canvas.width - 60, canvas.height, 100, 0, Math.PI * 2);
      ctx.fill();

      if (moveLeft && jar.x > 0) jar.x -= jar.speed;
      if (moveRight && jar.x < canvas.width - jar.width) jar.x += jar.speed;

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(jar.x, jar.y, jar.width, jar.height, 8);
      ctx.fill();
      ctx.fillStyle = '#d97706';
      ctx.fillRect(jar.x - 4, jar.y, jar.width + 8, 8);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('HONEY', jar.x + jar.width / 2, jar.y + 26);

      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += item.speed;

        if (
          item.y + item.radius >= jar.y &&
          item.x >= jar.x &&
          item.x <= jar.x + jar.width &&
          item.y - item.radius <= jar.y + jar.height
        ) {
          if (item.type === 'honey') {
            scoreRef.current += 1;
            setScore(scoreRef.current);
            sound.play('collect');
            
            if (scoreRef.current >= 8) {
              endGame(true, scoreRef.current);
              return;
            }
          } else {
            livesRef.current -= 1;
            setLives(livesRef.current);
            sound.play('sting');
            if (livesRef.current <= 0) {
              endGame(false, scoreRef.current);
              return;
            }
          }
          items.splice(i, 1);
          continue;
        }

        if (item.y > canvas.height + 20) {
          items.splice(i, 1);
          continue;
        }

        if (item.type === 'honey') {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      gameActive = false;
      clearInterval(spawnTimer);
      clearInterval(clockTimer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: 12, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontWeight: 'bold', pointerEvents: 'none' }}>
        <span>🍯 Honey: {score}/8</span>
        <span>❤️ Lives: {'❤️'.repeat(lives)}</span>
        <span>⏱️ Time: {timeLeft}s</span>
      </div>
      <canvas ref={canvasRef} width="500" height="375" style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}

// --- BERRY CLICKER ---
function BerryClicker({ onComplete }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12);
  const [berries, setBerries] = useState([]);
  const scoreRef = useRef(0);
  const playAreaRef = useRef(null);

  const spawnBerry = () => {
    if (!playAreaRef.current) return;
    const width = playAreaRef.current.clientWidth - 60;
    const height = playAreaRef.current.clientHeight - 60;
    const newBerry = {
      id: Math.random(),
      x: Math.random() * Math.max(10, width),
      y: Math.random() * Math.max(10, height),
      emoji: Math.random() > 0.2 ? '🍓' : '🍒'
    };
    setBerries(prev => [...prev, newBerry]);
  };

  useEffect(() => {
    // Initial Spawns
    setTimeout(spawnBerry, 100);
    setTimeout(spawnBerry, 400);
    setTimeout(spawnBerry, 700);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame(scoreRef.current >= 10);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClick = (id) => {
    scoreRef.current += 1;
    setScore(scoreRef.current);
    sound.play('collect');
    
    setBerries(prev => prev.filter(b => b.id !== id));
    spawnBerry();

    if (scoreRef.current >= 10) {
      endGame(true);
    }
  };

  const endGame = (won) => {
    setBerries([]);
    const reward = won ? 3 : -1;
    setTimeout(() => onComplete(won, reward), 2000);
  };

  const won = score >= 10;
  const reward = won ? 3 : -1;

  return (
    <div ref={playAreaRef} style={{ position: 'relative', width: '100%', height: '100%', background: '#fef3c7', overflow: 'hidden' }}>
      <div style={{ padding: 10, fontWeight: 'bold', fontFamily: 'var(--font-body)', display: 'flex', justifyContent: 'space-between' }}>
        <span>🍓 Berries Clicked: {score}/10</span>
        <span>⏱️ Time Left: {timeLeft}s</span>
      </div>
      {timeLeft > 0 && score < 10 ? (
        berries.map(b => (
          <div
            key={b.id}
            onClick={() => handleClick(b.id)}
            style={{
              position: 'absolute',
              left: b.x,
              top: b.y + 40,
              fontSize: '2.5rem',
              cursor: 'pointer',
              userSelect: 'none',
              transform: 'scale(1)',
              transition: 'transform 0.1s'
            }}
          >
            {b.emoji}
          </div>
        ))
      ) : (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-title)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 10 }}>{won ? '🎉 Delicious Success!' : '😢 Too Slow!'}</h2>
          <p style={{ fontSize: '1.2rem', color: won ? '#fbbf24' : '#ef4444' }}>
            {won ? `Reward: +${reward} Honey 🍯` : `Penalty: ${reward} Honey 🍯`}
          </p>
        </div>
      )}
    </div>
  );
}

// --- BEAR MEMORY ---
function BearMemory({ onComplete }) {
  const icons = ['🐻', '🍯', '🐝', '🌲', '🦊', '🐿️'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matches, setMatches] = useState(0);
  const [movesLeft, setMovesLeft] = useState(9);
  const [gameOver, setGameOver] = useState(false);
  const [wonState, setWonState] = useState(false);

  useEffect(() => {
    const shuffled = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({ id: idx, icon, matched: false, faceUp: false }));
    setCards(shuffled);
  }, []);

  const handleCardClick = (card) => {
    if (flipped.length >= 2 || card.matched || card.faceUp || gameOver) return;

    // Flip card
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, faceUp: true } : c));
    const nextFlipped = [...flipped, card];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const [c1, c2] = nextFlipped;
      setMovesLeft(m => m - 1);
      
      if (c1.icon === c2.icon) {
        // Match!
        setCards(prev => prev.map(c => c.id === c1.id || c.id === c2.id ? { ...c, matched: true } : c));
        setMatches(m => {
          const nextM = m + 1;
          if (nextM === 6) {
            endGame(true);
          } else if (movesLeft - 1 <= 0) {
            endGame(false);
          }
          return nextM;
        });
        setFlipped([]);
        sound.play('collect');
      } else {
        // No match
        sound.play('sting');
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === c1.id || c.id === c2.id ? { ...c, faceUp: false } : c));
          setFlipped([]);
          if (movesLeft - 1 <= 0) {
            endGame(false);
          }
        }, 800);
      }
    }
  };

  const endGame = (won) => {
    setGameOver(true);
    setWonState(won);
    const reward = won ? 3 : -1;
    setTimeout(() => onComplete(won, reward), 2500);
  };

  const reward = wonState ? 3 : -1;

  return (
    <div style={{ width: '100%', height: '100%', background: '#dbeafe', padding: 15, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
      <div style={{ fontWeight: 'bold', fontFamily: 'var(--font-body)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Matches: {matches}/6</span>
        <span>Moves left: {movesLeft}</span>
      </div>
      {!gameOver ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, flex: 1 }}>
          {cards.map(card => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              style={{
                background: card.faceUp || card.matched ? '#fff' : '#3b82f6',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                cursor: 'pointer',
                userSelect: 'none',
                color: card.faceUp || card.matched ? '#000' : 'transparent'
              }}
            >
              {card.faceUp || card.matched ? card.icon : '❓'}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-title)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 10 }}>{wonState ? '🎉 Memory Master!' : '😢 Out of moves!'}</h2>
          <p style={{ fontSize: '1.2rem', color: wonState ? '#fbbf24' : '#ef4444' }}>
            {wonState ? `Reward: +${reward} Honey 🍯` : `Penalty: ${reward} Honey 🍯`}
          </p>
        </div>
      )}
    </div>
  );
}

// --- FOREST QUIZ ---
function ForestQuiz({ onComplete }) {
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

  const [quiz] = useState(() => questions[Math.floor(Math.random() * questions.length)]);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (idx) => {
    setSelected(idx);
    setFinished(true);
    const won = idx === quiz.correct;
    if (won) sound.play('collect');
    else sound.play('sting');
    
    setTimeout(() => onComplete(won, won ? 3 : -1), 2200);
  };

  const won = selected === quiz.correct;
  const reward = won ? 3 : -1;

  return (
    <div style={{ width: '100%', height: '100%', background: '#ecfdf5', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 20, textAlign: 'center' }}>
      {!finished ? (
        <>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', color: 'var(--color-forest-dark)', margin: '0 10px' }}>{quiz.q}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
            {quiz.a.map((ans, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className="btn"
                style={{ padding: 14, background: '#fff', border: '2px solid #a7f3d0', borderRadius: 12, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', color: 'var(--color-text)' }}
              >
                {ans}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-title)', position: 'absolute', top: 0, left: 0 }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 10 }}>{won ? '🎉 Correct Answer!' : '😢 Oops, Wrong!'}</h2>
          <p style={{ fontSize: '1.2rem', color: won ? '#fbbf24' : '#ef4444' }}>
            {won ? `Reward: +${reward} Honey 🍯` : `Penalty: ${reward} Honey 🍯`}
          </p>
        </div>
      )}
    </div>
  );
}

// --- TIC TAC TOE ---
function TicTacToe({ onComplete }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [finished, setFinished] = useState(false);
  const [outcome, setOutcome] = useState(null); // 'win', 'lose', 'draw'

  const checkWin = (b, symbol) => {
    const patterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    return patterns.some(pattern => pattern.every(idx => b[idx] === symbol));
  };

  const makeMove = (idx, symbol, currentBoard) => {
    const nextBoard = [...currentBoard];
    nextBoard[idx] = symbol;
    setBoard(nextBoard);
    sound.play('collect');

    if (checkWin(nextBoard, symbol)) {
      endGame(symbol === '🐾' ? 'win' : 'lose');
      return true;
    } else if (nextBoard.every(v => v !== null)) {
      endGame('draw');
      return true;
    }
    return nextBoard;
  };

  const squirrelMove = (currentBoard) => {
    const emptyIdxs = currentBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);
    if (emptyIdxs.length === 0) return;

    // Smart Squirrel AI
    // 1. Try to win
    for (let idx of emptyIdxs) {
      let temp = [...currentBoard];
      temp[idx] = '🌰';
      if (checkWin(temp, '🌰')) {
        makeMove(idx, '🌰', currentBoard);
        return;
      }
    }
    // 2. Try to block player
    for (let idx of emptyIdxs) {
      let temp = [...currentBoard];
      temp[idx] = '🐾';
      if (checkWin(temp, '🐾')) {
        makeMove(idx, '🌰', currentBoard);
        return;
      }
    }
    // 3. Take center
    if (emptyIdxs.includes(4)) {
      makeMove(4, '🌰', currentBoard);
      return;
    }
    // 4. Random
    const rnd = emptyIdxs[Math.floor(Math.random() * emptyIdxs.length)];
    makeMove(rnd, '🌰', currentBoard);
  };

  const handleCellClick = (idx) => {
    if (board[idx] !== null || finished) return;

    const next = makeMove(idx, '🐾', board);
    if (next !== true) {
      setTimeout(() => squirrelMove(next), 600);
    }
  };

  const endGame = (result) => {
    setFinished(true);
    setOutcome(result);
    const reward = result === 'win' ? 3 : (result === 'draw' ? 1 : -1);
    setTimeout(() => onComplete(result !== 'lose', reward), 2500);
  };

  const reward = outcome === 'win' ? 3 : (outcome === 'draw' ? 1 : -1);

  return (
    <div style={{ width: '100%', height: '100%', background: '#fef3c7', padding: 15, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', fontFamily: 'var(--font-body)', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <span>🐻 You (🐾)</span>
        <span>🐿️ Mr. Squirrel (🌰)</span>
      </div>
      {!finished ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: 220, height: 220 }}>
          {board.map((cell, idx) => (
            <div
              key={idx}
              onClick={() => handleCellClick(idx)}
              style={{
                background: '#fff',
                borderRadius: 12,
                border: '2px solid #fde047',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                cursor: 'pointer',
                userSelect: 'none',
                color: cell === '🐾' ? '#e11d48' : '#d97706'
              }}
            >
              {cell}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-title)', position: 'absolute', top: 0, left: 0 }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 10 }}>
            {outcome === 'win' ? '🎉 You beat Mr. Squirrel!' : outcome === 'draw' ? "🤝 It's a tie!" : '🐿️ Mr. Squirrel won!'}
          </h2>
          <p style={{ fontSize: '1.2rem', color: reward >= 0 ? '#fbbf24' : '#ef4444' }}>
            {reward >= 0 ? `Reward: +${reward} Honey 🍯` : `Penalty: ${reward} Honey 🍯`}
          </p>
        </div>
      )}
    </div>
  );
}
