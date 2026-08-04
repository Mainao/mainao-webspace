"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { GameWorldProps } from "@/lib/types";
import {
    GRAVITY,
    JUMP_FORCE,
    MOVE_SPEED,
    CHAR_W,
    CHAR_H,
    GROUND_FRAC,
    TULIP_W,
    TULIP_H,
    HIT_COOLDOWN,
    HITBOX_HEIGHT_RATIO,
    BOUNCE_DAMPING,
    TULIP_SRCS,
} from "@/lib/constants";
import type { Section } from "@/lib/types";

// ---------------------------------------------------------------------------
// Shared position logic — used by BOTH the canvas draw loop and the
// accessible DOM overlay, so the invisible buttons always line up exactly
// with the tulips drawn on the canvas.
// ---------------------------------------------------------------------------
type BoxPos = { sx: number; sy: number; tW: number; tH: number };

function computeBoxScreenPositions(
    sections: Section[],
    cw: number,
    ch: number,
): BoxPos[] {
    const isMobile = cw < 640;

    if (isMobile) {
        const tW = 84,
            tH = 84,
            gap = 20,
            slot = 104;
        const rowGap = 60;
        const row1Count = 3,
            row2Count = sections.length - 3;
        const row1W = row1Count * slot - gap;
        const row2W = row2Count * slot - gap;
        const midY = ch * 0.58;
        const row1Y = midY - tH - rowGap / 2;
        const row2Y = midY + rowGap / 2;

        return sections.map((_, i) => {
            if (i < 3) {
                return { sx: (cw - row1W) / 2 + i * slot, sy: row1Y, tW, tH };
            } else {
                return {
                    sx: (cw - row2W) / 2 + (i - 3) * slot,
                    sy: row2Y,
                    tW,
                    tH,
                };
            }
        });
    }

    const gap = 52;
    const slot = TULIP_W + gap;
    const totalW = TULIP_W + (sections.length - 1) * slot;
    const startX = (cw - totalW) / 2;
    const baseY = (ch - TULIP_H) / 2;
    return sections.map((_, i) => ({
        sx: startX + i * slot,
        sy: baseY,
        tW: TULIP_W,
        tH: TULIP_H,
    }));
}

function drawTulip(
    ctx: CanvasRenderingContext2D,
    sec: Section,
    sx: number,
    sy: number,
    img: HTMLImageElement | undefined,
    tW: number,
    tH: number,
) {
    if (img?.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, sx, sy, tW, tH);
    }

    ctx.fillStyle = "#444";
    ctx.font = `${sec.visited ? "bold " : ""}${tW <= 84 ? "13" : "14"}px Pixelify_Sans, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(sec.label, sx + tW / 2, sy + tH + 4);
}

function drawGround(ctx: CanvasRenderingContext2D, groundY: number) {
    ctx.strokeStyle = "rgba(180,170,150,0.7)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(ctx.canvas.width, groundY);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Visually-hidden but still focusable / in the accessibility tree.
// (Never use display:none or visibility:hidden — those remove elements
// from the accessibility tree entirely.)
const srOnlyStyle: React.CSSProperties = {
    position: "absolute",
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
};

export default function GameWorld({
    sections,
    onSectionHit,
    controlsRef,
    onLoadProgress,
    onReady,
}: GameWorldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Positions for the accessible overlay buttons. Kept in state so React
    // re-renders the overlay whenever the canvas recomputes layout (resize).
    const [boxPositions, setBoxPositions] = useState<BoxPos[]>([]);
    const [announcement, setAnnouncement] = useState("");
    const [skipExpanded, setSkipExpanded] = useState(false);

    // Called by both the canvas hit-test and the overlay buttons, so the
    // live-region announcement fires regardless of how the section was hit.
    const handleSectionHit = useCallback(
        (id: string, label: string) => {
            onSectionHit(id);
            setAnnouncement(`${label} activated`);
        },
        [onSectionHit],
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.imageSmoothingEnabled = true;

        const loadFrames = (path: string, count: number) =>
            Array.from({ length: count }, (_, i) => {
                const img = new Image();
                img.src = `${path}/${i + 1}.png`;
                return img;
            });

        const idleFrames = loadFrames("/sprites/idle", 3);
        const walkFrames = loadFrames("/sprites/walk", 6);
        const jumpFrames = loadFrames("/sprites/jump", 2);

        const tulipImgs: Record<string, HTMLImageElement> = {};
        const srcCache: Record<string, HTMLImageElement> = {};
        for (const [id, src] of Object.entries(TULIP_SRCS)) {
            if (!srcCache[src]) {
                const img = new Image();
                img.src = src;
                srcCache[src] = img;
            }
            tulipImgs[id] = srcCache[src];
        }

        let cw = window.innerWidth;
        let ch = window.innerHeight;
        canvas.width = cw;
        canvas.height = ch;

        let charX = 80;
        let charY = ch * (1 - GROUND_FRAC) - CHAR_H;
        let velY = 0;
        let onGround = true;
        let facingRight = true;
        let animFrame = 0;
        let frameTimer = 0;
        const frameDelay = 8;

        const keys = { left: false, right: false };
        const cooldowns: Record<string, number> = {};
        let rafId = 0;
        let paused = false;

        // Push initial positions to the overlay.
        setBoxPositions(computeBoxScreenPositions(sections, cw, ch));

        controlsRef.current = {
            setKey: (k, v) => {
                if (paused) return;
                keys[k] = v;
            },
            jump: () => {
                if (paused) return;
                if (onGround) {
                    velY = JUMP_FORCE;
                    onGround = false;
                }
            },
            setPaused: (v: boolean) => {
                paused = v;
                if (v) {
                    keys.left = false;
                    keys.right = false;
                }
            },
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (paused) return;
            if (e.key === "ArrowLeft" || e.key === "a") {
                keys.left = true;
            }
            if (e.key === "ArrowRight" || e.key === "d") {
                keys.right = true;
            }
            if (
                (e.key === " " || e.key === "ArrowUp" || e.key === "w") &&
                onGround
            ) {
                velY = JUMP_FORCE;
                onGround = false;
            }
            if ([" ", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key))
                e.preventDefault();
        };
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
            if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
        };
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        const onResize = () => {
            cw = window.innerWidth;
            ch = window.innerHeight;
            canvas.width = cw;
            canvas.height = ch;
            const newGround = ch * (1 - GROUND_FRAC) - CHAR_H;
            if (charY > newGround) {
                charY = newGround;
                velY = 0;
                onGround = true;
            }
            charX = Math.max(0, Math.min(cw - CHAR_W, charX));
            // Keep the DOM overlay in sync with the new canvas layout.
            setBoxPositions(computeBoxScreenPositions(sections, cw, ch));
        };
        window.addEventListener("resize", onResize);

        function tick() {
            for (const id in cooldowns) {
                if (cooldowns[id] > 0) cooldowns[id]--;
            }

            if (!paused) {
                if (keys.left) {
                    charX -= MOVE_SPEED;
                    facingRight = false;
                }
                if (keys.right) {
                    charX += MOVE_SPEED;
                    facingRight = true;
                }
            }

            charX = Math.max(0, Math.min(cw - CHAR_W, charX));

            velY += GRAVITY;
            charY += velY;
            const groundY = ch * (1 - GROUND_FRAC);
            if (charY >= groundY - CHAR_H) {
                charY = groundY - CHAR_H;
                velY = 0;
                onGround = true;
            }

            const positions = computeBoxScreenPositions(sections, cw, ch);
            const cx1 = charX + 10;
            const cx2 = charX + CHAR_W - 10;
            const cy1 = charY;
            const cy2 = charY + CHAR_H * HITBOX_HEIGHT_RATIO;

            for (let i = 0; i < sections.length; i++) {
                const sec = sections[i];
                const { sx, sy, tW, tH } = positions[i];

                if ((cooldowns[sec.id] ?? 0) > 0) continue;

                const tulipCenterX = sx + tW / 2;
                if (
                    cx1 < tulipCenterX &&
                    cx2 > tulipCenterX &&
                    cy1 < sy + tH &&
                    cy1 > sy
                ) {
                    handleSectionHit(sec.id, sec.label);
                    cooldowns[sec.id] = HIT_COOLDOWN;
                    velY = JUMP_FORCE * BOUNCE_DAMPING;
                    onGround = false;
                }
            }

            frameTimer++;
            if (frameTimer > frameDelay) {
                animFrame++;
                frameTimer = 0;
            }

            ctx.clearRect(0, 0, cw, ch);

            for (let i = 0; i < sections.length; i++) {
                const { sx, sy, tW, tH } = positions[i];
                drawTulip(
                    ctx,
                    sections[i],
                    sx,
                    sy,
                    tulipImgs[sections[i].id],
                    tW,
                    tH,
                );
            }

            drawGround(ctx, groundY);

            if (cw >= 640) {
                let frames = idleFrames;
                if (!onGround) frames = jumpFrames;
                else if (keys.left || keys.right) frames = walkFrames;

                const img = frames[animFrame % frames.length];
                if (img?.complete && img.naturalWidth > 0) {
                    ctx.save();
                    if (!facingRight) {
                        ctx.translate(charX + CHAR_W, 0);
                        ctx.scale(-1, 1);
                        ctx.drawImage(img, 0, charY, CHAR_W, CHAR_H);
                    } else {
                        ctx.drawImage(img, charX, charY, CHAR_W, CHAR_H);
                    }
                    ctx.restore();
                }
            }

            rafId = requestAnimationFrame(tick);
        }

        const handleTap = (e: MouseEvent) => {
            if (cw >= 640) return;
            const rect = canvas.getBoundingClientRect();
            const tapX = e.clientX - rect.left;
            const tapY = e.clientY - rect.top;
            const pad = 10;
            const positions = computeBoxScreenPositions(sections, cw, ch);
            for (let i = 0; i < sections.length; i++) {
                const { sx, sy, tW, tH } = positions[i];
                if (
                    tapX >= sx - pad &&
                    tapX <= sx + tW + pad &&
                    tapY >= sy - pad &&
                    tapY <= sy + tH + pad
                ) {
                    handleSectionHit(sections[i].id, sections[i].label);
                    break;
                }
            }
        };
        canvas.addEventListener("click", handleTap);

        const allImgs = [...idleFrames, ...walkFrames, ...jumpFrames];
        const total = allImgs.length;
        let loaded = 0;
        const tryStart = () => {
            onLoadProgress(++loaded, total);
            if (loaded >= total) {
                onReady();
                tick();
                canvas.focus();
            }
        };
        for (const img of allImgs) {
            if (img.complete) tryStart();
            else {
                img.onload = tryStart;
                img.onerror = tryStart;
            }
        }

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("resize", onResize);
            canvas.removeEventListener("click", handleTap);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        sections,
        onSectionHit,
        controlsRef,
        onLoadProgress,
        onReady,
        handleSectionHit,
    ]);

    return (
        <>
            {/* Skip link: lets keyboard/screen-reader users bypass the
                physics game entirely and jump straight to a plain list of
                sections. Only visible/announced on focus. */}
            <a
                href="#section-list"
                style={srOnlyStyle}
                onFocus={(e) => {
                    e.currentTarget.style.position = "fixed";
                    e.currentTarget.style.clip = "auto";
                    e.currentTarget.style.clipPath = "none";
                    e.currentTarget.style.top = "8px";
                    e.currentTarget.style.left = "8px";
                    e.currentTarget.style.zIndex = "100";
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.padding = "8px 12px";
                    e.currentTarget.style.borderRadius = "6px";
                    setSkipExpanded(true);
                }}
                onBlur={(e) => {
                    Object.assign(e.currentTarget.style, srOnlyStyle);
                    setSkipExpanded(false);
                }}
            >
                Skip interactive game, jump to section list
            </a>

            <canvas
                ref={canvasRef}
                className="fixed inset-0 outline-none"
                style={{ zIndex: 10 }}
                tabIndex={-1}
                role="img"
                aria-label="Interactive game world. Use arrow keys to move and space to jump, or tab to individual sections below."
            />

            {/* Accessible overlay: one real, focusable button per section,
                positioned exactly over its tulip on the canvas. Invisible
                but present in the DOM and accessibility tree. */}
            <div ref={overlayRef} aria-hidden={false}>
                {sections.map((sec, i) => {
                    const pos = boxPositions[i];
                    if (!pos) return null;
                    return (
                        <button
                            key={sec.id}
                            type="button"
                            aria-label={`Go to ${sec.label} section`}
                            onClick={() => handleSectionHit(sec.id, sec.label)}
                            style={{
                                position: "fixed",
                                left: pos.sx,
                                top: pos.sy,
                                width: pos.tW,
                                height: pos.tH,
                                zIndex: 20,
                                opacity: 0,
                                cursor: "pointer",
                            }}
                        />
                    );
                })}
            </div>

            {/* Plain list version of the same sections, revealed via the
                skip link — the simplest possible accessible path. */}
            <nav
                id="section-list"
                aria-label="Sections"
                style={skipExpanded ? undefined : srOnlyStyle}
            >
                <ul>
                    {sections.map((sec) => (
                        <li key={sec.id}>
                            <a
                                href={`#${sec.id}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSectionHit(sec.id, sec.label);
                                }}
                            >
                                {sec.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Live region: announces section activation to screen readers,
                whichever path triggered it (collision, tap, or overlay button). */}
            <div aria-live="polite" style={srOnlyStyle}>
                {announcement}
            </div>
        </>
    );
}
