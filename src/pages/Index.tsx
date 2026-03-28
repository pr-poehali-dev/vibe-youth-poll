import { useState, useEffect } from "react";

const API_URL = "https://functions.poehali.dev/5fa6aab2-8cb1-4aed-88ae-258326d75e97";

const days = [
  { id: "fri", label: "Пятница", emoji: "🔥", color: "#FF3CAC" },
  { id: "sat", label: "Суббота", emoji: "⚡", color: "#784BA0" },
  { id: "sun", label: "Воскресенье", emoji: "🌀", color: "#2B86C5" },
  { id: "thu", label: "Четверг", emoji: "💥", color: "#F7971E" },
];

function getVoterId() {
  let id = localStorage.getItem("vibe_voter_id");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("vibe_voter_id", id);
  }
  return id;
}

const Index = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [myDay, setMyDay] = useState<string | null>(null);
  const [votes, setVotes] = useState({ fri: 0, sat: 0, sun: 0, thu: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => {
        const v = typeof data === "string" ? JSON.parse(data) : data;
        setVotes(v.votes);
      })
      .finally(() => setLoading(false));

    const saved = localStorage.getItem("vibe_voted_day");
    if (saved) {
      setVoted(true);
      setMyDay(saved);
      setSelected(saved);
    }
  }, []);

  const handleVote = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    const voter_id = getVoterId();
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day: selected, voter_id }),
    });
    const data = await res.json();
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    if (parsed.votes) setVotes(parsed.votes);
    const day = parsed.day || selected;
    setMyDay(day);
    setSelected(day);
    localStorage.setItem("vibe_voted_day", day);
    setVoted(true);
    setSubmitting(false);
  };

  const total = Object.values(votes).reduce((a, b) => a + b, 0);
  const getPercent = (id: string) => {
    if (total === 0) return 0;
    return Math.round((votes[id as keyof typeof votes] / total) * 100);
  };

  return (
    <div className="vibe-root">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="vibe-container">
        <div className="vibe-header">
          <div className="vibe-badge">14+ ✦ МОЛОДЁЖНАЯ ТУСОВКА</div>
          <h1 className="vibe-title">
            <span className="vibe-title-vibe">ВАЙБ</span>
            <span className="vibe-title-sub">первая тусовка</span>
          </h1>
          <p className="vibe-tagline">Выбираем день — голосуй и зови друзей!</p>
        </div>

        <div className="vibe-info">
          <div className="vibe-info-header">
            <span className="vibe-info-icon">🎉</span>
            <span>О тусовке</span>
          </div>
          <p>
            Первая встреча молодёжного сообщества <strong>«ВАЙБ»</strong> — живая музыка,
            знакомства, движ и атмосфера которую ты запомнишь. Возраст 14+, вход свободный.
          </p>
          <div className="vibe-rules">
            <div className="vibe-rule"><span>🙌</span> Будь собой — здесь все свои</div>
            <div className="vibe-rule"><span>📵</span> Телефоны в кармане — живём в моменте</div>
            <div className="vibe-rule"><span>🤝</span> Уважение — главное правило</div>
            <div className="vibe-rule"><span>🔊</span> Зови друзей — чем больше, тем вайбовее</div>
          </div>
        </div>

        <div className="vibe-poll">
          <div className="vibe-poll-title">📅 В какой день проведём первую тусовку?</div>

          {loading ? (
            <div className="vibe-loading">Загружаем результаты...</div>
          ) : !voted ? (
            <div className="vibe-options">
              {days.map((day) => (
                <button
                  key={day.id}
                  className={`vibe-option ${selected === day.id ? "vibe-option-selected" : ""}`}
                  style={selected === day.id ? { "--day-color": day.color } as React.CSSProperties : {}}
                  onClick={() => setSelected(day.id)}
                >
                  <span className="vibe-option-emoji">{day.emoji}</span>
                  <span className="vibe-option-label">{day.label}</span>
                  {selected === day.id && <span className="vibe-option-check">✓</span>}
                </button>
              ))}
              <button
                className={`vibe-vote-btn ${selected ? "vibe-vote-btn-active" : ""}`}
                onClick={handleVote}
                disabled={!selected || submitting}
              >
                {submitting ? "Отправляем..." : selected ? "ГОЛОСУЮ! 🚀" : "Выбери день"}
              </button>
            </div>
          ) : (
            <div className="vibe-results">
              {days.map((day) => {
                const pct = getPercent(day.id);
                return (
                  <div key={day.id} className={`vibe-result-row ${myDay === day.id ? "vibe-result-mine" : ""}`}>
                    <div className="vibe-result-label">
                      <span>{day.emoji}</span>
                      <span>{day.label}</span>
                      {myDay === day.id && <span className="vibe-result-tag">твой голос</span>}
                    </div>
                    <div className="vibe-result-bar-wrap">
                      <div className="vibe-result-bar" style={{ width: `${pct}%`, background: day.color }} />
                    </div>
                    <span className="vibe-result-pct">{pct}%</span>
                  </div>
                );
              })}
              <div className="vibe-result-total">
                Всего голосов: <strong>{total}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="vibe-footer">Подписывайся на канал — там объявим дату! 👇</div>
      </div>

      <style>{`
        .vibe-root {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
          font-family: 'Rubik', sans-serif;
        }
        .blob { position: fixed; border-radius: 50%; filter: blur(80px); opacity: 0.35; animation: blobMove 10s ease-in-out infinite alternate; pointer-events: none; z-index: 0; }
        .blob-1 { width: 400px; height: 400px; background: #FF3CAC; top: -100px; left: -100px; animation-delay: 0s; }
        .blob-2 { width: 350px; height: 350px; background: #784BA0; bottom: -80px; right: -80px; animation-delay: 3s; }
        .blob-3 { width: 250px; height: 250px; background: #F7971E; top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: 6s; }
        @keyframes blobMove { 0% { transform: scale(1) translate(0,0); } 100% { transform: scale(1.2) translate(30px, -30px); } }
        .vibe-container { position: relative; z-index: 1; max-width: 480px; width: 100%; display: flex; flex-direction: column; gap: 20px; }
        .vibe-header { text-align: center; }
        .vibe-badge { display: inline-block; background: linear-gradient(90deg, #FF3CAC, #F7971E); color: #fff; font-family: 'Oswald', sans-serif; font-size: 11px; letter-spacing: 2px; padding: 6px 18px; border-radius: 999px; margin-bottom: 16px; font-weight: 600; }
        .vibe-title { display: flex; flex-direction: column; align-items: center; line-height: 1; margin-bottom: 10px; }
        .vibe-title-vibe { font-family: 'Oswald', sans-serif; font-size: clamp(72px, 22vw, 110px); font-weight: 700; background: linear-gradient(135deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -2px; line-height: 0.9; }
        .vibe-title-sub { font-family: 'Oswald', sans-serif; font-size: clamp(18px, 5vw, 26px); font-weight: 400; color: rgba(255,255,255,0.5); letter-spacing: 6px; text-transform: uppercase; margin-top: 6px; }
        .vibe-tagline { color: rgba(255,255,255,0.7); font-size: 15px; font-weight: 400; margin-top: 8px; }
        .vibe-info { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 20px; color: rgba(255,255,255,0.85); font-size: 14px; line-height: 1.6; }
        .vibe-info-header { display: flex; align-items: center; gap: 8px; font-family: 'Oswald', sans-serif; font-size: 18px; font-weight: 600; color: #fff; margin-bottom: 10px; letter-spacing: 1px; }
        .vibe-info-icon { font-size: 20px; }
        .vibe-rules { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
        .vibe-rule { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); border-radius: 10px; padding: 8px 12px; font-size: 13px; color: rgba(255,255,255,0.75); }
        .vibe-rule span:first-child { font-size: 16px; flex-shrink: 0; }
        .vibe-poll { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 24px 20px; }
        .vibe-poll-title { font-family: 'Oswald', sans-serif; font-size: 18px; font-weight: 600; color: #fff; margin-bottom: 18px; letter-spacing: 0.5px; }
        .vibe-loading { text-align: center; color: rgba(255,255,255,0.4); padding: 24px; font-size: 14px; }
        .vibe-options { display: flex; flex-direction: column; gap: 10px; }
        .vibe-option { display: flex; align-items: center; gap: 14px; padding: 14px 18px; background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 14px; cursor: pointer; transition: all 0.2s ease; color: rgba(255,255,255,0.85); font-family: 'Rubik', sans-serif; font-size: 16px; font-weight: 500; text-align: left; }
        .vibe-option:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); transform: translateY(-1px); }
        .vibe-option-selected { background: linear-gradient(135deg, rgba(255,60,172,0.2), rgba(120,75,160,0.2)) !important; border-color: var(--day-color, #FF3CAC) !important; color: #fff !important; }
        .vibe-option-emoji { font-size: 22px; }
        .vibe-option-label { flex: 1; }
        .vibe-option-check { width: 24px; height: 24px; background: linear-gradient(135deg, #FF3CAC, #784BA0); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0; }
        .vibe-vote-btn { margin-top: 8px; padding: 16px; border-radius: 14px; border: none; font-family: 'Oswald', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: 2px; cursor: pointer; transition: all 0.25s ease; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.3); width: 100%; }
        .vibe-vote-btn-active { background: linear-gradient(135deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%); color: #fff; box-shadow: 0 8px 30px rgba(255,60,172,0.4); transform: translateY(-2px); }
        .vibe-vote-btn-active:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(255,60,172,0.5); }
        .vibe-results { display: flex; flex-direction: column; gap: 14px; }
        .vibe-result-row { display: flex; flex-direction: column; gap: 6px; }
        .vibe-result-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.8); }
        .vibe-result-mine .vibe-result-label { color: #fff; font-weight: 700; }
        .vibe-result-tag { font-size: 10px; background: linear-gradient(90deg, #FF3CAC, #784BA0); color: #fff; padding: 2px 8px; border-radius: 999px; letter-spacing: 0.5px; font-weight: 600; }
        .vibe-result-bar-wrap { height: 10px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; }
        .vibe-result-bar { height: 100%; border-radius: 999px; transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .vibe-result-pct { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.6); text-align: right; }
        .vibe-result-total { text-align: center; font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px; }
        .vibe-result-total strong { color: rgba(255,255,255,0.7); }
        .vibe-footer { text-align: center; color: rgba(255,255,255,0.4); font-size: 13px; padding-bottom: 8px; }
      `}</style>
    </div>
  );
};

export default Index;
