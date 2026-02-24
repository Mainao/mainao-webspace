"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import GameWorld from "./game/GameWorld";
import ModalContent from "./ui/ModalContent";
import { SECTION_DEFS } from "@/lib/sections";
import { Z } from "@/lib/constants";
import type { Section, GameControls } from "@/lib/types";
import Modal from "./ui/Modal";

export default function Portfolio() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [sections] = useState<Section[]>(() =>
        SECTION_DEFS.map((s) => ({ ...s, visited: false })),
    );
    const sectionsRef = useRef(sections);
    const controlsRef = useRef<GameControls | null>(null);

    const [modal, setModal] = useState<Section | null>(null);
    const [visitedCount, setVisitedCount] = useState(0);
    const [showHint, setShowHint] = useState(true);
    const [gameReady, setGameReady] = useState(false);
    const [frogDancing, setFrogDancing] = useState(false);
    const [showFlowerQuote, setShowFlowerQuote] = useState(false);
    const [soundOn, setSoundOn] = useState(true);
    const soundOnRef = useRef(true);
    const chillAudioRef = useRef<HTMLAudioElement | null>(null);
    const totalSections = SECTION_DEFS.length;

    // ── Background grid canvas ──
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const drawGrid = () => {
            const size = 28;
            ctx.fillStyle = "#f5f1e8";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "#dedede";
            ctx.lineWidth = 1;
            for (let x = 0; x <= canvas.width; x += size) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y <= canvas.height; y += size) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawGrid();
        };
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    // ── Cleanup chill audio on unmount ──
    useEffect(() => {
        return () => {
            if (chillAudioRef.current) {
                chillAudioRef.current.pause();
                chillAudioRef.current = null;
            }
        };
    }, []);

    const onSectionHit = useCallback((id: string) => {
        const sections = sectionsRef.current;
        const sec = sections.find((s) => s.id === id);
        if (!sec) return;
        setModal({ ...sec });
        if (!sec.visited) {
            sec.visited = true;
            const newCount = sections.filter((s) => s.visited).length;
            setVisitedCount(newCount);
            if (newCount === totalSections)
                new Audio("/audio/chime.mp3").play().catch(() => {});
        }
    }, []);

    const hideHint = useCallback(() => setShowHint(false), []);

    const onLoadProgress = useCallback(
        (_loaded: number, _total: number) => {},
        [],
    );

    const onReady = useCallback(() => setGameReady(true), []);

    const closeFlowerQuote = useCallback(() => {
        if (soundOnRef.current)
            new Audio("/audio/click-close.mp3").play().catch(() => {});
        setShowFlowerQuote(false);
    }, []);

    const closeModal = useCallback(() => {
        if (soundOnRef.current)
            new Audio("/audio/click-close.mp3").play().catch(() => {});
        setModal(null);
    }, []);

    useEffect(() => {
        controlsRef.current?.setPaused(!!modal);
        if (modal && soundOnRef.current)
            new Audio("/audio/click-open.mp3").play().catch(() => {});
    }, [modal]);

    return (
        <main className="relative w-screen h-screen overflow-hidden">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ zIndex: Z.background }}
            />

            <div
                className="absolute top-32 left-1/2 -translate-x-1/2 text-center pointer-events-none"
                style={{ zIndex: Z.hud }}
            >
                <h1 className="font-(--font-pixelify-sans) text-5xl md:text-7xl text-[#2d2d2d] select-none tracking-wide">
                    Hi! I&apos;m Mainao
                </h1>
                <p className="mt-2 text-lg md:text-xl text-[#555] select-none font-mono-stm">
                    Welcome to my cute space on the internet :)
                </p>
            </div>

            <div
                className="absolute top-4 left-4 pointer-events-none"
                style={{ zIndex: Z.hud }}
            >
                <Image
                    src="/icons/ui/cute-logo.webp"
                    alt="Mainao"
                    width={80}
                    height={80}
                />
            </div>

            <div
                className="absolute top-4 right-4 h-20 flex items-center gap-3"
                style={{ zIndex: Z.hud }}
            >
                <div className="pointer-events-none">
                    {visitedCount !== totalSections && (
                        <div className="group relative pointer-events-auto">
                            <Image
                                src="/icons/flowers/magic-flower.webp"
                                alt="Locked magic flower"
                                width={40}
                                height={40}
                                className="opacity-50 grayscale"
                            />
                            <div className="absolute right-0 top-12 w-52 bg-[#f5f1e8] border-2 border-[#171717] shadow-[4px_4px_0_#171717] p-3 hidden group-hover:block">
                                <p className="font-pixel text-md text-[#e85d5d] mb-1">
                                    🔒 locked
                                </p>
                                <p className="font-mono-stm text-sm text-[#3a3a3a] leading-relaxed">
                                    Visit all {totalSections} sections to unlock
                                    the magic flower!
                                </p>
                                <p className="font-mono-stm text-[10px] text-gray-400 mt-1">
                                    {visitedCount}/{totalSections} visited
                                </p>
                            </div>
                        </div>
                    )}
                    {visitedCount === totalSections && (
                        <div className="relative pointer-events-auto">
                            <button
                                className="flower-sparkle cursor-pointer"
                                onClick={() => {
                                    if (showFlowerQuote) {
                                        closeFlowerQuote();
                                    } else {
                                        if (soundOnRef.current)
                                            new Audio("/audio/click-open.mp3")
                                                .play()
                                                .catch(() => {});
                                        setShowFlowerQuote(true);
                                    }
                                }}
                                aria-label="You found them all!"
                            >
                                <Image
                                    src="/icons/flowers/magic-flower-red.webp"
                                    alt="All sections visited!"
                                    width={40}
                                    height={40}
                                    className="animate-flower-pop"
                                />
                            </button>

                            {showFlowerQuote && (
                                <>
                                    <div
                                        className="fixed inset-0"
                                        onClick={closeFlowerQuote}
                                    />
                                    <div className="flower-quote-card absolute right-0 top-12 w-64">
                                        <p className="font-pixel text-md text-[#e85d5d] mb-2 tracking-wide">
                                            ✨ Congratulations!
                                        </p>
                                        <p className="font-mono-stm text-sm text-[#3a3a3a] leading-relaxed">
                                            You explored everything! The magic
                                            flower blooms for you 🌸 — hope you
                                            enjoyed the journey ✨
                                        </p>
                                        <button
                                            className="mt-3 font-mono-stm text-[11px] text-gray-400 hover:text-[#e85d5d] transition-colors cursor-pointer"
                                            onClick={closeFlowerQuote}
                                        >
                                            [ close ]
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <button
                    className="cursor-pointer shrink-0"
                    style={{ width: 36, height: 36 }}
                    aria-label={soundOn ? "Mute sound" : "Unmute sound"}
                    onClick={() => {
                        const next = !soundOn;
                        soundOnRef.current = next;
                        setSoundOn(next);
                        if (chillAudioRef.current)
                            chillAudioRef.current.muted = !next;
                    }}
                >
                    <Image
                        src={
                            soundOn
                                ? "/icons/ui/sound-on.webp"
                                : "/icons/ui/sound-off.webp"
                        }
                        alt=""
                        width={36}
                        height={36}
                    />
                </button>
            </div>

            <GameWorld
                sections={sections}
                onSectionHit={onSectionHit}
                onMove={hideHint}
                controlsRef={controlsRef}
                onLoadProgress={onLoadProgress}
                onReady={onReady}
            />

            {showHint && (
                <div
                    className="absolute bottom-24 inset-x-0 flex justify-center pointer-events-none"
                    style={{ zIndex: Z.hud }}
                >
                    <div className="bg-black/60 text-white font-mono-stm text-md px-4 py-2 rounded-lg text-center">
                        <p>← → to move &nbsp;·&nbsp; ↑ or Space to jump</p>
                        <p>Jump into the flowers to open the sections!</p>
                    </div>
                </div>
            )}

            <div
                className="absolute bottom-4 right-4 flex flex-col items-center cursor-pointer"
                style={{ zIndex: Z.hud }}
                onClick={() => {
                    if (!frogDancing) {
                        const audio = new Audio("/audio/chill.mp3");
                        audio.loop = true;
                        audio.muted = !soundOnRef.current;
                        audio.play().catch(() => {});
                        chillAudioRef.current = audio;
                    } else {
                        if (chillAudioRef.current) {
                            chillAudioRef.current.pause();
                            chillAudioRef.current.currentTime = 0;
                            chillAudioRef.current = null;
                        }
                    }
                    setFrogDancing((v) => !v);
                }}
            >
                <Image
                    src={
                        frogDancing
                            ? "/icons/ui/dance.gif"
                            : "/icons/ui/frog.webp"
                    }
                    alt={frogDancing ? "stop music" : "play music"}
                    width={80}
                    height={80}
                />
                <span className="text-gray-500 text-sm mt-1 font-(--font-pixelify-sans)">
                    {frogDancing ? "stop" : "play me"}
                </span>
            </div>

            <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{ zIndex: Z.hud }}
            >
                <div className="flex items-center gap-2">
                    <span className="font-mono-stm text-xs text-[#555]">
                        © 2026 Mainao · made with{" "}
                        <span className="text-[#e85d5d]">♥</span>
                    </span>
                    <span className="text-[#aaa]">|</span>
                    <Link
                        href="/instructions"
                        className="pointer-events-auto font-mono-stm text-xs text-[#e85d5d] hover:underline transition-colors"
                    >
                        instructions
                    </Link>
                </div>
            </div>

            <div
                className="absolute bottom-6 left-6 flex gap-3 sm:hidden select-none"
                style={{ zIndex: Z.controls }}
            >
                <button
                    className="w-14 h-14 rounded-xl bg-white/90 border-2 border-gray-300 shadow-lg text-xl flex items-center justify-center active:scale-95 touch-none"
                    aria-label="Move left"
                    tabIndex={-1}
                    onPointerDown={() => {
                        controlsRef.current?.setKey("left", true);
                        hideHint();
                    }}
                    onPointerUp={() =>
                        controlsRef.current?.setKey("left", false)
                    }
                    onPointerLeave={() =>
                        controlsRef.current?.setKey("left", false)
                    }
                >
                    ◀
                </button>
                <button
                    className="w-14 h-14 rounded-xl bg-white/90 border-2 border-gray-300 shadow-lg text-xl flex items-center justify-center active:scale-95 touch-none"
                    aria-label="Move right"
                    tabIndex={-1}
                    onPointerDown={() => {
                        controlsRef.current?.setKey("right", true);
                        hideHint();
                    }}
                    onPointerUp={() =>
                        controlsRef.current?.setKey("right", false)
                    }
                    onPointerLeave={() =>
                        controlsRef.current?.setKey("right", false)
                    }
                >
                    ▶
                </button>
            </div>
            <div
                className="absolute bottom-6 right-6 sm:hidden select-none"
                style={{ zIndex: Z.controls }}
            >
                <button
                    className="w-16 h-16 rounded-full bg-[#e85d5d] border-2 border-[#c44] text-white shadow-lg font-(--font-pixelify-sans) text-sm flex items-center justify-center active:scale-95 touch-none"
                    aria-label="Jump"
                    tabIndex={-1}
                    onPointerDown={() => {
                        controlsRef.current?.jump();
                        hideHint();
                    }}
                >
                    JUMP
                </button>
            </div>

            {modal && (
                <Modal
                    isOpen={!!modal}
                    onClose={closeModal}
                    titleId="modal-title"
                >
                    <ModalContent section={modal} titleId="modal-title" />
                    <button
                        onClick={closeModal}
                        className="mt-2 w-full bg-[#171717] text-[#f5f1e8] font-pixel text-sm py-2.5 border-2 border-[#171717] shadow-[3px_3px_0_#e85d5d] hover:shadow-[1px_1px_0_#e85d5d] hover:translate-x-0.5 hover:translate-y-0.5 transition-[transform,box-shadow] duration-100 cursor-pointer tracking-wide"
                    >
                        Continue exploring ▶
                    </button>
                </Modal>
            )}

            {!gameReady && (
                <div
                    className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-[#f5f1e8]"
                    style={{ zIndex: Z.modal + 10 }}
                    aria-label="Loading"
                    aria-live="polite"
                >
                    <Image
                        src="/icons/ui/cute-logo.webp"
                        alt=""
                        className="animate-float"
                        width={80}
                        height={80}
                        priority
                    />
                    <p className="font-(--font-pixelify-sans) text-[#2d2d2d] text-xl tracking-wide -mt-8">
                        Loading
                        <span className="animate-blink">...</span>
                    </p>
                </div>
            )}
        </main>
    );
}
