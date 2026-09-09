"use client";

const HX = 150;
const HY = 305;

interface ToothSpec {
  x: number;
  w: number;
  yBase: number;
  yTip: number;
}

// wide rounded base -> narrow rounded tip; works for teeth pointing either direction
function fangPath(x: number, w: number, yBase: number, yTip: number): string {
  const xc = x + w / 2;
  const r = Math.min(6, w / 4);
  const tipW = Math.max(6, w * 0.3);
  const tipR = 4;
  const inward = yTip > yBase ? 1 : -1;
  return (
    `M ${x} ${yBase + inward * r} ` +
    `Q ${x} ${yBase} ${x + r} ${yBase} ` +
    `L ${x + w - r} ${yBase} ` +
    `Q ${x + w} ${yBase} ${x + w} ${yBase + inward * r} ` +
    `L ${xc + tipW / 2} ${yTip - inward * tipR} ` +
    `Q ${xc + tipW / 2} ${yTip} ${xc} ${yTip} ` +
    `Q ${xc - tipW / 2} ${yTip} ${xc - tipW / 2} ${yTip - inward * tipR} Z`
  );
}

// 12 lower teeth: front/back taller & narrower, middle shorter & wider — like real jaws
const LOWER: ToothSpec[] = [
  { c: 220, w: 26, top: 284 }, { c: 262, w: 30, top: 286 }, { c: 304, w: 32, top: 288 }, { c: 346, w: 34, top: 290 },
  { c: 388, w: 32, top: 289 }, { c: 430, w: 30, top: 288 }, { c: 472, w: 30, top: 288 }, { c: 514, w: 32, top: 289 },
  { c: 556, w: 34, top: 290 }, { c: 598, w: 32, top: 288 }, { c: 640, w: 30, top: 286 }, { c: 682, w: 26, top: 284 },
].map((t) => ({ x: t.c - t.w / 2, w: t.w, yBase: 344, yTip: t.top }));

// 7 upper teeth hang from the flat rim (HY in the lid's own unrotated frame)
const UPPER: ToothSpec[] = [260, 327, 393, 460, 527, 593, 660].map((cx, i) => {
  const w = 13 + (i % 2 ? 1 : -1);
  const len = 22 + (i % 3) * 3;
  return { x: cx - w / 2, w, yBase: HY, yTip: HY + len };
});

interface Props {
  pressedTeeth: number[];
  isMyTurn: boolean;
  phase: "waiting" | "playing" | "ended";
  snapped: boolean;
  paused: boolean;
  onPressTooth: (index: number) => void;
}

export function CrocodileSVG({ pressedTeeth, isMyTurn, phase, snapped, paused, onPressTooth }: Props) {
  const rotation = snapped ? 0 : -14;

  return (
    <div className="crocodile-stage w-full max-w-2xl mx-auto select-none">
      <svg viewBox="-10 -5 800 500" className="w-full" style={{ overflow: "visible" }} aria-label="Crocodile">
        <defs>
          <linearGradient id="cd-skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--croc-light)" />
            <stop offset="100%" stopColor="var(--croc)" />
          </linearGradient>
          <clipPath id="cd-sink-clip">
            <rect x="180" y="250" width="545" height="105" rx="38" ry="38" />
          </clipPath>
        </defs>

        <ellipse cx={55} cy={447} rx={30} ry={20} fill="var(--croc-deep)" />
        <ellipse cx={112} cy={455} rx={30} ry={20} fill="var(--croc-deep)" />
        <g fill="var(--claw)" stroke="var(--claw-edge)" strokeWidth={1.5}>
          <ellipse cx={35} cy={469} rx={9} ry={6.5} />
          <ellipse cx={55} cy={473} rx={9} ry={6.5} />
          <ellipse cx={75} cy={469} rx={9} ry={6.5} />
          <ellipse cx={92} cy={477} rx={9} ry={6.5} />
          <ellipse cx={112} cy={481} rx={9} ry={6.5} />
          <ellipse cx={132} cy={477} rx={9} ry={6.5} />
        </g>

        <path
          d="M 10 335 Q 0 265 70 250 Q 130 240 150 305 L 150 415 Q 100 450 55 447 Q 15 443 10 395 Z"
          fill="url(#cd-skin)"
          stroke="var(--croc-shadow)"
          strokeWidth={4}
        />

        {/* lower jaw shell — cut at the hinge line, bottom (rounded) half only */}
        <path
          d="M 150 305 L 750 305 L 750 344 Q 750 380 714 380 L 186 380 Q 150 380 150 344 Z"
          fill="url(#cd-skin)"
          stroke="var(--croc-shadow)"
          strokeWidth={4}
        />

        {/* mouth interior — same cut line as the shell, bottom half only */}
        <path
          d="M 180 305 L 725 305 L 725 327 Q 725 355 697 355 L 208 355 Q 180 355 180 327 Z"
          fill="var(--mouth)"
        />

        <g clipPath="url(#cd-sink-clip)">
          {LOWER.map((t, i) => {
            const pressed = pressedTeeth.includes(i);
            const canPress = isMyTurn && phase === "playing" && !pressed && !snapped && !paused;
            const cls = ["tooth", pressed ? "pressed" : "", canPress ? "interactive" : ""]
              .filter(Boolean)
              .join(" ");
            return (
              <path
                key={i}
                d={fangPath(t.x, t.w, t.yBase, t.yTip)}
                className={cls}
                stroke="var(--tooth-edge)"
                strokeWidth={2}
                onClick={() => canPress && onPressTooth(i)}
                onKeyDown={(e) => {
                  if (!canPress) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPressTooth(i);
                  }
                }}
                role={canPress ? "button" : undefined}
                tabIndex={canPress ? 0 : -1}
                aria-label={canPress ? `Press tooth ${i + 1}` : undefined}
              />
            );
          })}
        </g>

        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `${HX}px ${HY}px`,
            transition: "transform 420ms cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <path
            d="M 150 195 L 150 305 L 750 305 L 758 225 Q 760 185 720 175 L 300 167 Q 200 160 150 195 Z"
            fill="url(#cd-skin)"
            stroke="var(--croc-shadow)"
            strokeWidth={4}
          />
          {UPPER.map((t, i) => (
            <path
              key={i}
              d={fangPath(t.x, t.w, t.yBase, t.yTip)}
              fill="var(--tooth)"
              stroke="var(--tooth-edge)"
              strokeWidth={1.6}
            />
          ))}
          <ellipse cx={740} cy={193} rx={7} ry={9} fill="var(--croc-shadow)" />
          <circle cx={210} cy={183} r={26} fill="var(--tooth)" stroke="var(--croc-shadow)" strokeWidth={3.5} />
          <circle cx={218} cy={189} r={12} fill="#1A2416" />
          <circle cx={224} cy={180} r={4.2} fill="#fff" />
          <circle cx={265} cy={170} r={21} fill="var(--tooth)" stroke="var(--croc-shadow)" strokeWidth={3.5} />
          <circle cx={272} cy={175} r={10} fill="#1A2416" />
          <circle cx={277} cy={168} r={3.6} fill="#fff" />
        </g>
      </svg>
    </div>
  );
}
