const doodles = [
    // flowers — spread across all quadrants
    { shape: "flower", top: "8%",  left: "12%", size: 30, rotate: 15  },
    { shape: "flower", top: "14%", left: "68%", size: 30, rotate: -20 },
    { shape: "flower", top: "38%", left: "6%",  size: 30, rotate: 30  },
    { shape: "flower", top: "42%", left: "88%", size: 30, rotate: -10 },
    { shape: "flower", top: "62%", left: "32%", size: 30, rotate: 45  },
    { shape: "flower", top: "72%", left: "75%", size: 30, rotate: -25 },
    { shape: "flower", top: "88%", left: "18%", size: 30, rotate: 20  },
    { shape: "flower", top: "82%", left: "58%", size: 30, rotate: -40 },
    // leaves — interior
    { shape: "leaf",   top: "6%",  left: "38%", size: 26, rotate: -30 },
    { shape: "leaf",   top: "28%", left: "55%", size: 26, rotate: 20  },
    { shape: "leaf",   top: "50%", left: "22%", size: 26, rotate: -45 },
    { shape: "leaf",   top: "66%", left: "92%", size: 26, rotate: 15  },
    { shape: "leaf",   top: "78%", left: "48%", size: 26, rotate: -20 },
    { shape: "leaf",   top: "92%", left: "82%", size: 26, rotate: 35  },
    // edge leaves
    { shape: "leaf",   top: "15%", left: "2%",  size: 26, rotate: -40 },
    { shape: "leaf",   top: "48%", left: "1%",  size: 26, rotate: -15 },
    { shape: "leaf",   top: "10%", left: "96%", size: 26, rotate: 20  },
    { shape: "leaf",   top: "45%", left: "97%", size: 26, rotate: 15  },
] as const;

const BLOOM_MS = 800;

const STYLES = `
    @keyframes bloomIn {
        0%   { opacity: 0; transform: scale(0) rotate(var(--rot)); }
        60%  { opacity: 1; transform: scale(1.3) rotate(var(--rot)); }
        100% { opacity: 0.85; transform: scale(1) rotate(var(--rot)); }
    }
    @keyframes petalFall {
        0%   { transform: translateY(0px)   translateX(0px)   rotate(var(--rot)); }
        25%  { transform: translateY(-15px) translateX(8px)   rotate(calc(var(--rot) + 20deg)); }
        50%  { transform: translateY(-8px)  translateX(15px)  rotate(calc(var(--rot) + 45deg)); }
        75%  { transform: translateY(-20px) translateX(6px)   rotate(calc(var(--rot) + 30deg)); }
        100% { transform: translateY(0px)   translateX(0px)   rotate(calc(var(--rot) + 360deg)); }
    }
    @keyframes petalFallAlt {
        0%   { transform: translateY(0px)   translateX(0px)    rotate(var(--rot)); }
        25%  { transform: translateY(-12px) translateX(-10px)  rotate(calc(var(--rot) - 25deg)); }
        50%  { transform: translateY(-20px) translateX(-6px)   rotate(calc(var(--rot) - 50deg)); }
        75%  { transform: translateY(-10px) translateX(-12px)  rotate(calc(var(--rot) - 35deg)); }
        100% { transform: translateY(0px)   translateX(0px)    rotate(calc(var(--rot) - 360deg)); }
    }
    .doodle {
        position: absolute;
        opacity: 0;
    }
    .doodle-even {
        animation:
            bloomIn ${BLOOM_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) var(--bloom-delay) forwards,
            petalFall var(--float-duration) ease-in-out var(--float-delay) infinite;
    }
    .doodle-odd {
        animation:
            bloomIn ${BLOOM_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) var(--bloom-delay) forwards,
            petalFallAlt var(--float-duration) ease-in-out var(--float-delay) infinite;
    }
`;

function Flower() {
    return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="22" r="16" fill="#f2a8be" />
            <circle cx="74" cy="40" r="16" fill="#f2a8be" />
            <circle cx="65" cy="70" r="16" fill="#f2a8be" />
            <circle cx="35" cy="70" r="16" fill="#f2a8be" />
            <circle cx="26" cy="40" r="16" fill="#f2a8be" />
            <circle cx="50" cy="50" r="18" fill="#f2a8be" />
        </svg>
    );
}

function Leaf() {
    return (
        <svg viewBox="0 0 20 36" width="100%" height="100%">
            <path d="M10 2 C18 10 18 26 10 34 C2 26 2 10 10 2Z" fill="#a8c5a0" />
        </svg>
    );
}

export default function ScatteredDoodles() {
    return (
        <>
            <style>{STYLES}</style>
            <div
                className="hidden sm:block fixed inset-0 pointer-events-none overflow-hidden"
                style={{ zIndex: 5 }}
                aria-hidden="true"
            >
                {doodles.map((d, i) => (
                    <div
                        key={i}
                        className={`doodle ${i % 2 === 0 ? "doodle-even" : "doodle-odd"}`}
                        style={{
                            top: d.top,
                            left: d.left,
                            width: d.size,
                            height: d.size,
                            "--rot": `${d.rotate}deg`,
                            "--bloom-delay": `${i * 150}ms`,
                            "--float-delay": `${i * 150 + BLOOM_MS}ms`,
                            "--float-duration": `${(8 + i * 0.7).toFixed(1)}s`,
                        } as React.CSSProperties}
                    >
                        {d.shape === "flower" ? <Flower /> : <Leaf />}
                    </div>
                ))}
            </div>
        </>
    );
}
