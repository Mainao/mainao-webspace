"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Tab = "howtoplay" | "audio" | "credits" | "guestbook";

type Props = {
    soundOn: boolean;
    onSoundToggle: () => void;
    onClose: () => void;
};

const TABS: { id: Tab; label: string }[] = [
    { id: "howtoplay", label: "How to Play" },
    { id: "audio",     label: "Audio" },
    { id: "credits",   label: "Credits" },
    { id: "guestbook", label: "Guestbook" },
];

// ── Shared primitives ────────────────────────────────────────────────────────

function KeyBadge({ children }: { children: React.ReactNode }) {
    return (
        <span
            className="font-mono-stm bg-[#f5f1e8] border-[1.5px] border-[#333] px-2 py-0.5 rounded leading-none whitespace-nowrap"
            style={{ fontSize: 12 }}
        >
            {children}
        </span>
    );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            role="switch"
            aria-checked={on}
            style={{
                position: "relative",
                flexShrink: 0,
                width: 40,
                height: 22,
                borderRadius: 999,
                background: on ? "#333" : "#dedede",
                transition: "background 150ms ease",
                cursor: "pointer",
                border: "none",
            }}
        >
            <span
                style={{
                    position: "absolute",
                    top: 3,
                    left: 0,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: on ? "white" : "#888",
                    transform: on ? "translateX(20px)" : "translateX(2px)",
                    transition: "transform 150ms ease, background 150ms ease",
                }}
            />
        </button>
    );
}

// ── Tab: How to Play ─────────────────────────────────────────────────────────

function HowToPlayTab() {
    return (
        <div>
            <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-20 shrink-0 flex gap-1">
                        <KeyBadge>←</KeyBadge>
                        <KeyBadge>→</KeyBadge>
                    </div>
                    <span className="font-mono-stm text-sm text-[#3a3a3a]">Move around</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-20 shrink-0 flex gap-1">
                        <KeyBadge>↑</KeyBadge>
                        <KeyBadge>Space</KeyBadge>
                    </div>
                    <span className="font-mono-stm text-sm text-[#3a3a3a]">Jump</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-20 shrink-0">
                        <Image src="/icons/flowers/tulip-pink.webp" alt="flower" width={28} height={28} />
                    </div>
                    <span className="font-mono-stm text-sm text-[#3a3a3a]">
                        Jump INTO the flowers to open sections
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-20 shrink-0">
                        <KeyBadge>esc</KeyBadge>
                    </div>
                    <span className="font-mono-stm text-sm text-[#3a3a3a]">press esc or enter to close a section</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-20 shrink-0">
                        <Image src="/icons/ui/frog.webp" alt="" width={28} height={28} style={{ objectFit: "contain" }} />
                    </div>
                    <p className="font-mono-stm text-xs text-[#999]">Click the frog to play some music</p>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-20 shrink-0 text-lg leading-none">✨</div>
                    <p className="font-mono-stm text-[11px] text-[#888]">visit all 5 sections for a surprise</p>
                </div>
            </div>
        </div>
    );
}

// ── Tab: Audio ───────────────────────────────────────────────────────────────

function AudioTab({ soundOn, onSoundToggle }: { soundOn: boolean; onSoundToggle: () => void }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="font-mono-stm text-[#333]" style={{ fontSize: 13 }}>Sound</p>
                <p className="font-mono-stm text-[#888] mt-0.5" style={{ fontSize: 11 }}>music + sound effects</p>
            </div>
            <Toggle on={soundOn} onToggle={onSoundToggle} />
        </div>
    );
}

// ── Tab: Credits ─────────────────────────────────────────────────────────────

function CreditsTab() {
    return (
        <p className="font-mono-stm text-[#333]" style={{ fontSize: 13 }}>
            Sound effects and music obtained from{" "}
            <a
                href="https://www.zapsplat.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e85d5d] hover:underline"
            >
                zapsplat.com
            </a>
        </p>
    );
}

// ── Tab: Guestbook ───────────────────────────────────────────────────────────

type GuestbookNote = { name: string; message: string; timestamp: number };

const GB_PREFIX = "guestbook:";
const MAX_NOTES = 20;

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function loadNotes(): GuestbookNote[] {
    const storage = (window as any).storage;
    if (storage?.list) {
        return (storage.list(GB_PREFIX) as { value: string }[])
            .map((e) => { try { return JSON.parse(e.value); } catch { return null; } })
            .filter(Boolean)
            .sort((a: GuestbookNote, b: GuestbookNote) => b.timestamp - a.timestamp)
            .slice(0, MAX_NOTES);
    }
    return Object.keys(localStorage)
        .filter((k) => k.startsWith(GB_PREFIX))
        .map((k) => { try { return JSON.parse(localStorage.getItem(k) ?? ""); } catch { return null; } })
        .filter(Boolean)
        .sort((a: GuestbookNote, b: GuestbookNote) => b.timestamp - a.timestamp)
        .slice(0, MAX_NOTES);
}

function saveNote(note: GuestbookNote) {
    const key = `${GB_PREFIX}${note.timestamp}`;
    const storage = (window as any).storage;
    if (storage?.set) {
        storage.set(key, JSON.stringify(note), true);
    } else {
        localStorage.setItem(key, JSON.stringify(note));
    }
}

function GuestbookTab() {
    return (
        <p className="font-mono-stm text-[#888]" style={{ fontSize: 13 }}>coming soon</p>
    );
}

function GuestbookTabOld() {
    const [message, setMessage] = useState("");
    const [name, setName] = useState("");
    const [notes, setNotes] = useState<GuestbookNote[]>([]);
    const [error, setError] = useState("");
    const [unavailable, setUnavailable] = useState(false);

    useEffect(() => {
        try {
            setNotes(loadNotes());
        } catch {
            setUnavailable(true);
        }
    }, []);

    const handleSubmit = () => {
        if (!message.trim()) return;
        const note: GuestbookNote = {
            name: name.trim() || "Anonymous",
            message: message.trim(),
            timestamp: Date.now(),
        };
        try {
            saveNote(note);
            setNotes((prev) => [note, ...prev].slice(0, MAX_NOTES));
            setMessage("");
            setName("");
        } catch {
            setError("Notes unavailable right now :(");
        }
    };

    if (unavailable) {
        return <p className="font-mono-stm text-sm text-[#888]">Notes unavailable right now :(</p>;
    }

    return (
        <div>
            <p className="font-mono-stm text-sm text-[#333] mb-0.5">Leave a note for Mainao 🌸</p>
            <p className="font-mono-stm text-xs text-[#888] mb-3">
                Notes are public and visible to all visitors
            </p>

            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 80))}
                maxLength={80}
                rows={3}
                placeholder="Your message..."
                className="w-full bg-[#f5f1e8] border-[1.5px] border-[#333] rounded font-mono-stm text-xs p-2 resize-none focus:outline-none"
            />
            <p className="font-mono-stm text-[10px] text-[#888] text-right mb-2">{message.length}/80</p>

            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full bg-[#f5f1e8] border-[1.5px] border-[#333] rounded font-mono-stm text-xs p-2 mb-3 focus:outline-none"
            />

            {error && <p className="font-mono-stm text-xs text-[#e85d5d] mb-2">{error}</p>}

            <button
                onClick={handleSubmit}
                disabled={!message.trim()}
                className="w-full bg-[#171717] text-[#f5f1e8] font-mono-stm text-sm py-2.5 border-2 border-[#171717] shadow-[3px_3px_0_#e85d5d] hover:shadow-[1px_1px_0_#e85d5d] hover:translate-x-0.5 hover:translate-y-0.5 transition-[transform,box-shadow] duration-100 cursor-pointer tracking-wide disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
            >
                Leave a note ▶
            </button>

            {notes.length > 0 && (
                <>
                    <div className="border-t border-[#dedede] mt-4 mb-2" />
                    <p className="font-mono-stm text-[11px] text-[#888] mb-3">Recent notes</p>
                    <div className="space-y-3 overflow-y-auto max-h-[180px]">
                        {notes.map((note, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span className="shrink-0">🌸</span>
                                <div>
                                    <p className="font-mono-stm text-sm text-[#333]">
                                        &ldquo;{note.message}&rdquo;
                                    </p>
                                    <p className="font-mono-stm text-xs text-[#888]">
                                        — {note.name} · {timeAgo(note.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ── Root component ───────────────────────────────────────────────────────────

export default function MenuModalContent({ soundOn, onSoundToggle, onClose }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>(
        typeof window !== "undefined" && window.innerWidth < 640 ? "audio" : "howtoplay"
    );

    return (
        <>
            {/* Visually hidden title for accessibility */}
            <h2
                id="menu-title"
                style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }}
            >
                Menu
            </h2>

            {/* Tab bar — negative margins escape Modal's padding so tabs sit flush with the card edges.
                pt-10 clears the [ close ] button which sits at absolute top-5 right-3. */}
            <div className="-mx-6 sm:-mx-8 -mt-6 sm:-mt-8 pt-10 overflow-hidden">
                <div className="flex border-b border-[#dedede]">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 items-center justify-center pt-3 pb-2 transition-colors cursor-pointer font-mono-stm ${
                                tab.id === "howtoplay" ? "hidden sm:flex" : "flex"
                            } ${
                                activeTab === tab.id
                                    ? "text-[#333] border-b-2 border-[#333]"
                                    : "text-[#888]"
                            }`}
                            style={{ fontSize: 11 }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 mt-4 min-h-[280px] overflow-y-auto sm:overflow-visible">
                {activeTab === "howtoplay" && <HowToPlayTab />}
                {activeTab === "audio" && (
                    <AudioTab soundOn={soundOn} onSoundToggle={onSoundToggle} />
                )}
                {activeTab === "credits" && <CreditsTab />}
                {activeTab === "guestbook" && <GuestbookTab />}
            </div>

            {/* Mobile close prompt */}
            <p
                className="sm:hidden font-mono-stm text-center w-full border-t border-[#dedede] cursor-pointer"
                style={{
                    fontSize: 12,
                    color: "#555",
                    letterSpacing: "0.05em",
                    padding: "16px 0 24px 0",
                    animation: "dialoguePulse 1.2s ease-in-out infinite",
                }}
                onClick={onClose}
            >
                <span style={{ color: "#e85d5d" }}>►</span> tap to close
            </p>
        </>
    );
}
