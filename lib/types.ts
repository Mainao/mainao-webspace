import type { RefObject } from "react";

export interface Section {
    id: string;
    label: string;
    w: number;
    h: number;
    visited: boolean;
    content: { title: string; body: (string | { text: string; url: string })[] };
}

export interface GameControls {
    setKey: (key: "left" | "right", val: boolean) => void;
    jump: () => void;
    setPaused: (v: boolean) => void;
}

export interface GameWorldProps {
    sections: Section[];
    onSectionHit: (id: string) => void;
    onMove: () => void;
    controlsRef: RefObject<GameControls | null>;
    onLoadProgress: (loaded: number, total: number) => void;
    onReady: () => void;
}
