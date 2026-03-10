"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import GameWorld from "./game/GameWorld";
import ModalContent from "./ui/ModalContent";
import { SECTION_DEFS } from "@/lib/sections";
import { Z } from "@/lib/constants";
import type { Section, GameControls } from "@/lib/types";
import Modal from "./ui/Modal";
import MenuModalContent from "./ui/MenuModalContent";
import ScatteredDoodles from "./ui/ScatteredDoodles";
import TypewriterHint from "./ui/TypewriterHint";
import RewardTypewriter from "./ui/RewardTypewriter";

export default function Portfolio() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [sections] = useState<Section[]>(() =>
        SECTION_DEFS.map((s) => ({ ...s, visited: false })),
    );
    const sectionsRef = useRef(sections);
    const controlsRef = useRef<GameControls | null>(null);

    const [modal, setModal] = useState<Section | null>(null);
    const [visitedCount, setVisitedCount] = useState(0);
    const [gameReady, setGameReady] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showTypewriterHint, setShowTypewriterHint] = useState(false);
    const [frogDancing, setFrogDancing] = useState(false);
    const frogDancingRef = useRef(false);
    const [soundOn, setSoundOn] = useState(true);
    const [showDesktopBanner, setShowDesktopBanner] = useState(true);
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

    useEffect(() => { frogDancingRef.current = frogDancing; }, [frogDancing]);

    useEffect(() => {
        if (visitedCount === totalSections && !frogDancingRef.current) {
            const audio = new Audio("/audio/chill.mp3");
            audio.loop = true;
            audio.play().catch(() => {});
            chillAudioRef.current = audio;
            setTimeout(() => setFrogDancing(true), 0);
        }
    }, [visitedCount, totalSections]);

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
    }, [totalSections]);

    const hideHint = useCallback(() => {}, []);

    const onLoadProgress = useCallback(() => {}, []);

    const onReady = useCallback(() => {
        setGameReady(true);
        setShowTypewriterHint(true);
    }, []);

    const closeModal = useCallback(() => {
        if (soundOnRef.current)
            new Audio("/audio/click-close.mp3").play().catch(() => {});
        setModal(null);
    }, []);

    const handleSoundToggle = useCallback(() => {
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
    }, [frogDancing]);

    const handleSfxToggle = useCallback(() => {
        const next = !soundOn;
        soundOnRef.current = next;
        setSoundOn(next);
        if (chillAudioRef.current) {
            chillAudioRef.current.muted = !next;
        }
    }, [soundOn]);

    useEffect(() => {
        controlsRef.current?.setPaused(!!modal || showMenu);
        if (modal && soundOnRef.current)
            new Audio("/audio/click-open.mp3").play().catch(() => {});
    }, [modal, showMenu]);

    useEffect(() => {
        if (!modal) return;
        const handleEnter = (e: KeyboardEvent) => {
            if (e.key === "Enter") closeModal();
        };
        document.addEventListener("keydown", handleEnter);
        return () => document.removeEventListener("keydown", handleEnter);
    }, [modal, closeModal]);

    return (
        <main className="relative w-screen h-screen overflow-hidden">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ zIndex: Z.background }}
            />

            <ScatteredDoodles allVisited={visitedCount === totalSections} />

            {showTypewriterHint && visitedCount < totalSections && (
                <TypewriterHint onDone={() => setShowTypewriterHint(false)} />
            )}

            {visitedCount === totalSections && <RewardTypewriter />}

            <div
                className="absolute top-[calc(50vh-210px)] sm:top-32 left-0 right-0 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 text-center pointer-events-none px-20 sm:px-0"
                style={{ zIndex: Z.hud }}
            >
                <h1 className="font-(--font-pixelify-sans) text-3xl sm:text-5xl md:text-7xl text-[#2d2d2d] select-none tracking-widest">
                    Hi! I&apos;m Mainao
                </h1>
                <p className="mt-2 sm:mt-2 text-base sm:text-lg md:text-xl text-[#555] select-none font-mono-stm tracking-widest">
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
                <button
                    onClick={() => {
                        if (soundOnRef.current) new Audio("/audio/click-open.mp3").play().catch(() => {});
                        setShowMenu(true);
                    }}
                    className="font-mono-stm text-base text-[#333] hover:text-[#e85d5d] transition-colors cursor-pointer leading-none font-bold"
                    aria-label="Open menu"
                >
                    [ ≡ ]
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


            <div
                className="absolute bottom-4 right-4 hidden sm:flex flex-col items-center cursor-pointer"
                style={{ zIndex: Z.hud }}
                onClick={handleSoundToggle}
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
                className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{ zIndex: Z.hud }}
            >
                <div className="flex items-center gap-2">
                    <span className="font-mono-stm text-xs text-[#555]">
                        © 2026 Mainao · made with{" "}
                        <span className="text-[#e85d5d]">♥</span>
                    </span>
                </div>
            </div>

            <div
                className="absolute bottom-6 left-6 flex gap-3 hidden select-none"
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
                className="absolute bottom-32 right-4 hidden select-none"
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
                    <p
                        className="font-mono-stm text-center mt-6"
                        style={{
                            fontSize: 12,
                            color: "#555",
                            letterSpacing: "0.05em",
                            animation: "dialoguePulse 1.2s ease-in-out infinite",
                        }}
                    >
                        <span style={{ color: "#e85d5d" }}>►</span> press enter to continue
                    </p>
                </Modal>
            )}


            <Modal
                isOpen={showMenu}
                onClose={() => {
                    if (soundOnRef.current) new Audio("/audio/click-close.mp3").play().catch(() => {});
                    setShowMenu(false);
                }}
                titleId="menu-title"
                showClose
            >
                <MenuModalContent
                    soundOn={soundOn}
                    onSoundToggle={handleSfxToggle}
                />
            </Modal>

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

            {showDesktopBanner && (
                <div
                    className="fixed bottom-0 left-0 right-0 sm:hidden flex items-center justify-between gap-2 bg-[#171717] text-[#f5f1e8] px-4 py-3"
                    style={{ zIndex: Z.modal }}
                >
                    <p className="font-mono-stm text-xs leading-snug">
                        psst... the real fun happens on desktop
                    </p>
                    <button
                        onClick={() => setShowDesktopBanner(false)}
                        className="shrink-0 font-mono-stm text-xs text-[#aaa] hover:text-[#f5f1e8] transition-colors cursor-pointer"
                        aria-label="Dismiss banner"
                    >
                        [ close ]
                    </button>
                </div>
            )}
        </main>
    );
}
