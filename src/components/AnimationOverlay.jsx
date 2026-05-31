import React, { useEffect } from 'react';

export default function AnimationOverlay({ type, active, onComplete }) {
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3500); // Animation duration: 3.5s
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div style={styles.overlay}>
      {type === 'hunter' && <HunterAnimation />}
      {type === 'bee' && <BeeStingAnimation />}
    </div>
  );
}

// --- COMICAL HUNTER ANIMATION ---
function HunterAnimation() {
  return (
    <div style={styles.container}>
      {/* Comical Hunter */}
      <div className="hunter-character" style={{ ...styles.character, animation: 'hunterWalkIn 3.5s forwards' }}>
        <span style={{ fontSize: '4.5rem' }}>🤠</span>
        <div style={styles.binoculars}>🔭</div>
      </div>

      {/* Cute startler (Ladybug or Squirrel) */}
      <div className="forest-friend" style={{ ...styles.friend, animation: 'friendPopUp 3.5s forwards' }}>
        <span style={{ fontSize: '3rem' }}>🐿️</span>
        <span style={{ fontSize: '1.2rem', display: 'block', fontWeight: 'bold', color: '#1e293b' }}>"BOO!"</span>
      </div>

      {/* Screen tint & warning */}
      <div style={styles.textContainer}>
        <h2 style={styles.title}>Hunter Alert! 🤠</h2>
        <p style={styles.subtitle}>Watch out! A hunter is wandering around...</p>
      </div>

      <style>{`
        @keyframes hunterWalkIn {
          0% { transform: translateX(-150px) scaleX(1); }
          30% { transform: translateX(120px) scaleX(1); }
          50% { transform: translateX(120px) translateY(-20px) rotate(15deg) scaleX(1); }
          60% { transform: translateX(120px) translateY(0) scaleX(-1); }
          70% { transform: translateX(120px) scaleX(-1); }
          100% { transform: translateX(-300px) scaleX(-1); }
        }
        @keyframes friendPopUp {
          0%, 35% { transform: translateY(150px); opacity: 0; }
          45% { transform: translateY(0); opacity: 1; }
          65% { transform: translateY(0) scale(1.2); opacity: 1; }
          75%, 100% { transform: translateY(150px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// --- COMICAL BEE CHASE ANIMATION ---
function BeeStingAnimation() {
  return (
    <div style={styles.container}>
      {/* Running Bear */}
      <div className="running-bear" style={{ ...styles.character, animation: 'bearRun 3.5s forwards' }}>
        <span style={{ fontSize: '5rem' }}>🐻</span>
        <span style={{ position: 'absolute', top: -30, left: 15, fontSize: '2.5rem', animation: 'sweatDrip 0.5s infinite' }}>💦</span>
      </div>

      {/* Swarming Bees */}
      <div className="swarm" style={{ ...styles.swarm, animation: 'swarmChase 3.5s forwards' }}>
        <span style={{ fontSize: '3rem', position: 'absolute', top: -10, left: 10 }}>🐝</span>
        <span style={{ fontSize: '2rem', position: 'absolute', top: 30, left: -20 }}>🐝</span>
        <span style={{ fontSize: '2.5rem', position: 'absolute', top: -30, left: -40 }}>🐝</span>
        <span style={{ fontSize: '2.2rem', position: 'absolute', top: 20, left: 50 }}>🐝</span>
        <span style={{ fontSize: '3rem', position: 'absolute', top: -20, left: 40 }}>🐝</span>
      </div>

      <div style={styles.textContainer}>
        <h2 style={{ ...styles.title, color: '#f59e0b' }}>Bees Swarming! 🐝</h2>
        <p style={styles.subtitle}>Bzzz! The bees are protecting their honey!</p>
      </div>

      <style>{`
        @keyframes bearRun {
          0% { transform: translateX(-150px) translateY(0) rotate(0); }
          15% { transform: translateX(80px) translateY(-10px) rotate(5deg); }
          30% { transform: translateX(80px) translateY(0) rotate(-5deg); }
          35% { transform: translateX(80px) scaleX(-1); }
          50% { transform: translateX(80px) translateY(-15px) rotate(15deg) scaleX(-1); }
          55% { transform: translateX(80px) scaleX(1); }
          100% { transform: translateX(650px) translateY(-5px) rotate(10deg); }
        }
        @keyframes swarmChase {
          0% { transform: translateX(-200px) translateY(0); opacity: 0; }
          25% { transform: translateX(-50px) translateY(-20px); opacity: 1; }
          45% { transform: translateX(0px) translateY(10px); }
          60% { transform: translateX(0px) translateY(-30px); }
          100% { transform: translateX(650px) translateY(0); }
        }
        @keyframes sweatDrip {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
          50% { transform: translateY(10px) scale(0.8); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    overflow: 'hidden'
  },
  container: {
    position: 'relative',
    width: '500px',
    height: '350px',
    background: 'rgba(255, 255, 255, 0.9)',
    border: '4px solid #fff',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: '30px',
    overflow: 'hidden'
  },
  character: {
    position: 'absolute',
    bottom: 80,
    left: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  binoculars: {
    position: 'absolute',
    left: 45,
    top: 15,
    fontSize: '2rem',
    transform: 'rotate(-45deg)'
  },
  friend: {
    position: 'absolute',
    bottom: 80,
    right: '120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  swarm: {
    position: 'absolute',
    bottom: 120,
    left: '60px'
  },
  textContainer: {
    textAlign: 'center',
    fontFamily: 'var(--font-body)',
    zIndex: 10
  },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.8rem',
    color: '#ef4444',
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '1rem',
    color: '#475569',
    fontWeight: 600
  }
};
