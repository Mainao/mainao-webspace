export const GRAVITY = 0.55;
export const JUMP_FORCE = -14;
export const MOVE_SPEED = 4;
export const CHAR_W = 80;
export const CHAR_H = 80;

export const GROUND_FRAC = 0.25;

export const TULIP_W = 80;
export const TULIP_H = 80;

export const HIT_COOLDOWN = 60;

export const HITBOX_HEIGHT_RATIO = 0.55;

export const BOUNCE_DAMPING = 0.65;

export const TULIP_SRCS: Record<string, string> = {
    about: "/icons/flowers/tulip-pink.webp",
    experience: "/icons/flowers/tulip-violet.webp",
    projects: "/icons/flowers/tulip-purple.webp",
    education: "/icons/flowers/tulip-yellow.webp",
    contact: "/icons/flowers/tulip-red.webp",
};

export const Z = {
    background: 0,
    game: 10,
    hud: 20,
    controls: 25,
    modal: 50,
} as const;
