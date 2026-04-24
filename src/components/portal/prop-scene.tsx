type Scene = "residential-flat" | "office-commercial" | "communal-building" | "retail-shop";

export function PropScene({
  scene = "residential-flat",
  palette = ["#A8B8D0", "#8598B8"],
}: {
  scene?: Scene;
  palette?: [string, string];
}) {
  const [a, b] = palette;
  return (
    <div className="img-scene">
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`sky-${scene}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8EEF7" />
            <stop offset="100%" stopColor={a} />
          </linearGradient>
        </defs>
        <rect width="400" height="250" fill={`url(#sky-${scene})`} />
        {scene === "residential-flat" && (
          <>
            <rect x="40" y="50" width="320" height="170" fill={a} opacity=".9" />
            <rect x="40" y="50" width="320" height="20" fill={b} />
            {[0, 1, 2, 3].map((r) =>
              [0, 1, 2, 3, 4, 5].map((c) => (
                <rect key={`${r}-${c}`} x={60 + c * 50} y={85 + r * 32} width="32" height="22" fill="#F4F6FB" opacity=".85" />
              )),
            )}
            <rect x="180" y="180" width="40" height="40" fill="#3E2A1A" />
          </>
        )}
        {scene === "office-commercial" && (
          <>
            <rect x="20" y="30" width="360" height="190" fill={b} />
            {[0, 1, 2, 3, 4].map((r) =>
              [0, 1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                <rect key={`${r}-${c}`} x={35 + c * 40} y={45 + r * 36} width="32" height="26" fill="#B8D0E8" opacity={0.75} />
              )),
            )}
            <rect x="170" y="195" width="60" height="25" fill="#2A2A3A" />
          </>
        )}
        {scene === "communal-building" && (
          <>
            <rect x="0" y="80" width="140" height="140" fill={a} />
            <rect x="140" y="40" width="120" height="180" fill={b} />
            <rect x="260" y="100" width="140" height="120" fill={a} opacity=".9" />
            {[0, 1, 2, 3].map((r) =>
              [0, 1, 2].map((c) => (
                <rect key={`m-${r}-${c}`} x={155 + c * 35} y={60 + r * 40} width="22" height="26" fill="#F4F6FB" />
              )),
            )}
            {[0, 1].map((r) =>
              [0, 1, 2].map((c) => (
                <rect key={`l-${r}-${c}`} x={15 + c * 35} y={100 + r * 40} width="22" height="26" fill="#F4F6FB" />
              )),
            )}
          </>
        )}
        {scene === "retail-shop" && (
          <>
            <rect x="30" y="90" width="340" height="130" fill={a} />
            <rect x="50" y="110" width="120" height="70" fill="#F8F4ED" stroke={b} strokeWidth="2" />
            <rect x="190" y="110" width="160" height="70" fill="#F8F4ED" stroke={b} strokeWidth="2" />
            <rect x="30" y="80" width="340" height="18" fill={b} />
            <text x="200" y="94" fill="#fff" fontSize="11" fontFamily="monospace" textAnchor="middle">
              SHOP
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
