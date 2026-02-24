"use client";

import { useEffect, useRef } from "react";
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

function drawTulip(
    ctx: CanvasRenderingContext2D,
    sec: Section,
    sx: number,
    sy: number,
    img: HTMLImageElement | undefined,
) {
    if (img?.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, sx, sy, TULIP_W, TULIP_H);
    }

    ctx.fillStyle = "#444";
    ctx.font = `${sec.visited ? "bold " : ""}12px Pixelify_Sans, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(sec.label, sx + TULIP_W / 2, sy + TULIP_H + 6);
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

export default function GameWorld({
    sections,
    onSectionHit,
    onMove,
    controlsRef,
    onLoadProgress,
    onReady,
}: GameWorldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
        let moved = false;
        let paused = false;

        controlsRef.current = {
            setKey: (k, v) => {
                if (paused) return;
                keys[k] = v;
                if (v && !moved) {
                    moved = true;
                    onMove();
                }
            },
            jump: () => {
                if (paused) return;
                if (onGround) {
                    velY = JUMP_FORCE;
                    onGround = false;
                }
                if (!moved) {
                    moved = true;
                    onMove();
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
                if (!moved) {
                    moved = true;
                    onMove();
                }
            }
            if (e.key === "ArrowRight" || e.key === "d") {
                keys.right = true;
                if (!moved) {
                    moved = true;
                    onMove();
                }
            }
            if (
                (e.key === " " || e.key === "ArrowUp" || e.key === "w") &&
                onGround
            ) {
                velY = JUMP_FORCE;
                onGround = false;
                if (!moved) {
                    moved = true;
                    onMove();
                }
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
        };
        window.addEventListener("resize", onResize);

        function getBoxScreenPositions(): { sx: number; sy: number }[] {
            const n = sections.length;
            const baseY = (ch - TULIP_H) / 2;
            const gap = 30;
            const slot = TULIP_W + gap;
            const totalW = TULIP_W + (n - 1) * slot;
            const startX = (cw - totalW) / 2;

            return sections.map((_, i) => ({
                sx: startX + i * slot,
                sy: baseY,
            }));
        }

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

            const positions = getBoxScreenPositions();
            const cx1 = charX + 10;
            const cx2 = charX + CHAR_W - 10;
            const cy1 = charY;
            const cy2 = charY + CHAR_H * HITBOX_HEIGHT_RATIO;

            for (let i = 0; i < sections.length; i++) {
                const sec = sections[i];
                const { sx, sy } = positions[i];

                if ((cooldowns[sec.id] ?? 0) > 0) continue;

                if (
                    cx2 > sx &&
                    cx1 < sx + sec.w &&
                    cy2 > sy &&
                    cy1 < sy + sec.h
                ) {
                    onSectionHit(sec.id);
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
                const { sx, sy } = positions[i];
                drawTulip(ctx, sections[i], sx, sy, tulipImgs[sections[i].id]);
            }

            drawGround(ctx, groundY);

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

            rafId = requestAnimationFrame(tick);
        }

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
        };
    }, [sections, onSectionHit, onMove, controlsRef, onLoadProgress, onReady]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none outline-none"
            style={{ zIndex: 10 }}
            tabIndex={-1}
            role="img"
            aria-label="Interactive game world"
        />
    );
}
