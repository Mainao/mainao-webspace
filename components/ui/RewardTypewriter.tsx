"use client";

const STYLES = `
    @keyframes wordReveal {
        0%   { opacity: 0; transform: translateY(6px); }
        100% { opacity: 1; transform: translateY(0px); }
    }
`;

const LINE1_WORDS = ["congratulations!"];
const LINE2_WORDS = ["you", "have", "visited", "all", "the", "sections."];
const LINE2_START_DELAY = LINE1_WORDS.length * 120 + 200;

function WordSpan({ word, delay, red }: { word: string; delay: number; red?: boolean }) {
    return (
        <span
            style={{
                display: "inline-block",
                opacity: 0,
                animationName: "wordReveal",
                animationDuration: "300ms",
                animationTimingFunction: "ease-out",
                animationFillMode: "forwards",
                animationDelay: `${delay}ms`,
                ...(red ? { color: "#e85d5d", fontWeight: 600 } : {}),
            }}
        >
            {word}
        </span>
    );
}

export default function RewardTypewriter() {
    return (
        <>
            <style>{STYLES}</style>
            <div
                className="hidden sm:flex"
                style={{
                    position: "fixed",
                    bottom: 120,
                    left: "50%",
                    transform: "translateX(-50%)",
                    textAlign: "center",
                    pointerEvents: "none",
                    zIndex: 15,
                    flexDirection: "column",
                    gap: 8,
                }}
            >
                <div
                    style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#333",
                        fontFamily: "var(--font-share-tech-mono), monospace",
                    }}
                >
                    {LINE1_WORDS.map((word, i) => (
                        <span key={i}>
                            <WordSpan
                                word={word}
                                delay={i * 120}
                                red={word === "congratulations!"}
                            />
                            {i < LINE1_WORDS.length - 1 && " "}
                        </span>
                    ))}
                </div>

                <div
                    style={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: "#555",
                        fontFamily: "var(--font-share-tech-mono), monospace",
                    }}
                >
                    {LINE2_WORDS.map((word, i) => (
                        <span key={i}>
                            <WordSpan
                                word={word}
                                delay={LINE2_START_DELAY + i * 120}
                            />
                            {i < LINE2_WORDS.length - 1 && " "}
                        </span>
                    ))}
                </div>
            </div>
        </>
    );
}
