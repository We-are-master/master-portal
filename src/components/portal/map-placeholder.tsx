export function MapPlaceholder({
  height = 220,
  techLive = false,
  pinCount = 1,
}: {
  height?: number;
  techLive?: boolean;
  pinCount?: number;
}) {
  const secondaryPins: [number, number][] = [[28, 32], [72, 58], [42, 75], [68, 22]];
  return (
    <div className="map-ph" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice">
        <rect width="600" height="300" fill="#E4E8F5" />
        {[[0, 90, 600, 90], [0, 180, 600, 180], [150, 0, 150, 300], [350, 0, 350, 300]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="10" />
        ))}
        {[[10, 10, 120, 70], [170, 10, 150, 80], [210, 10, 90, 70], [380, 10, 100, 65], [490, 10, 95, 60], [10, 120, 110, 55], [170, 120, 130, 55], [390, 120, 170, 60], [10, 210, 140, 80], [380, 210, 170, 75]].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#CBD5E1" />
        ))}
        <path d="M0,200 Q150,185 300,195 T600,190" stroke="rgba(80,120,220,.25)" strokeWidth="14" fill="none" />
      </svg>
      <div className="pin" style={{ left: "50%", top: "48%", transform: "translate(-50%,-50%)" }}>
        <div className="r" style={{ width: 20, height: 20, background: "rgba(234,76,11,.2)", borderColor: "var(--co)" }} />
        <div className="d" style={{ width: 8, height: 8, background: "var(--co)" }} />
      </div>
      {pinCount > 1 &&
        secondaryPins.slice(0, pinCount - 1).map(([x, y], i) => (
          <div key={i} className="pin" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}>
            <div className="r" style={{ width: 16, height: 16, background: "rgba(37,99,235,.2)", borderColor: "var(--bl)" }} />
            <div className="d" style={{ width: 6, height: 6, background: "var(--bl)" }} />
          </div>
        ))}
      {techLive && (
        <div className="pin" style={{ left: "38%", top: "42%", transform: "translate(-50%,-50%)" }}>
          <div className="r" style={{ width: 16, height: 16, background: "rgba(22,163,74,.2)", borderColor: "var(--gr)" }} />
          <div className="d" style={{ width: 6, height: 6, background: "var(--gr)" }} />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          background: "rgba(255,255,255,.9)",
          borderRadius: 4,
          padding: "3px 8px",
          fontFamily: "var(--mono)",
          fontSize: 10,
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        {techLive && (
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gr)", display: "inline-block" }} />
        )}
        {techLive ? "Technician on site — live tracking" : pinCount > 1 ? `${pinCount} active jobs` : "Property location"}
      </div>
    </div>
  );
}
