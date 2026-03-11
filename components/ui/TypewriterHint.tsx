"use client";

import { useEffect, useState } from "react";

const STYLES = `
    @keyframes wordReveal {
        0%   { opacity: 0; transform: translateY(6px); }
        100% { opacity: 1; transform: translateY(0px); }
    }
`;

type WordDef = { text: string; muted?: boolean };

const LINE1: WordDef[] = [
    { text: "← →" },
    { text: "to" },
    { text: "move" },
    { text: "·", muted: true },
    { text: "↑ or Space" },
    { text: "to" },
    { text: "jump" },
];

const LINE2: WordDef[] = [
    { text: "jump" },
    { text: "into" },
    { text: "the" },
    { text: "flowers!" },
];

const LINE2_START_DELAY = LINE1.length * 120 + 200;
const LAST_WORD_END = LINE2_START_DELAY + (LINE2.length - 1) * 120 + 300;

type Props = { onDone: () => void };

export default function TypewriterHint({ onDone }: Props) {
    const [started, setStarted] = useState(false);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setStarted(true), 1000);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!started) return;
        const t = setTimeout(() => setFading(true), LAST_WORD_END + 3000);
        return () => clearTimeout(t);
    }, [started]);

    useEffect(() => {
        if (!fading) return;
        const t = setTimeout(() => onDone(), 600);
        return () => clearTimeout(t);
    }, [fading, onDone]);

    if (!started) return null;

    return (
        <>
            <style>{STYLES}</style>
            <div
                className="hidden sm:flex"
                style={{
                    position: "fixed",
                    bottom: 120,
                    left: "50%",
                    transform: fading
                        ? "translateX(-50%) translateY(-6px)"
                        : "translateX(-50%) translateY(0px)",
                    textAlign: "center",
                    pointerEvents: "none",
                    zIndex: 15,
                    flexDirection: "column",
                    gap: 6,
                    opacity: fading ? 0 : 1,
                    transition: fading
                        ? "opacity 600ms ease-in, transform 600ms ease-in"
                        : "none",
                }}
            >
                {/* Line 1 */}
                <div
                    style={{
                        fontSize: 18,
                        fontWeight: 600,
                        fontFamily: "var(--font-share-tech-mono), monospace",
                        filter: "drop-shadow(0 0 8px rgba(232, 93, 93, 0.25))",
                    }}
                >
                    {LINE1.map((w, i) => (
                        <span key={i}>
                            <span
                                style={{
                                    display: "inline-block",
                                    opacity: 0,
                                    animationName: "wordReveal",
                                    animationDuration: "300ms",
                                    animationTimingFunction: "ease-out",
                                    animationFillMode: "forwards",
                                    animationDelay: `${i * 120}ms`,
                                    ...(w.muted ? { color: "#bbb" } : {}),
                                }}
                            >
                                {w.text}
                            </span>
                            {i < LINE1.length - 1 && " "}
                        </span>
                    ))}
                </div>

                {/* Line 2 */}
                <div
                    style={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: "#555",
                        fontFamily: "var(--font-share-tech-mono), monospace",
                    }}
                >
                    {LINE2.map((w, i) => (
                        <span key={i}>
                            <span
                                style={{
                                    display: "inline-block",
                                    opacity: 0,
                                    animationName: "wordReveal",
                                    animationDuration: "300ms",
                                    animationTimingFunction: "ease-out",
                                    animationFillMode: "forwards",
                                    animationDelay: `${LINE2_START_DELAY + i * 120}ms`,
                                }}
                            >
                                {w.text}
                            </span>
                            {i < LINE2.length - 1 && " "}
                        </span>
                    ))}
                </div>
            </div>
        </>
    );
}
