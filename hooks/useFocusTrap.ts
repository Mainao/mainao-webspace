import { useEffect, RefObject } from "react";

export function useFocusTrap(
    ref: RefObject<HTMLElement | null>,
    isActive: boolean,
): void {
    useEffect(() => {
        if (!isActive || !ref.current) return;

        const modal = ref.current;

        const focusableElements = modal.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        const handleTabKey = (event: KeyboardEvent) => {
            if (event.key !== "Tab") return;

            if (event.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    event.preventDefault();
                    lastFocusable?.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    event.preventDefault();
                    firstFocusable?.focus();
                }
            }
        };

        modal.addEventListener("keydown", handleTabKey);
        return () => modal.removeEventListener("keydown", handleTabKey);
    }, [ref, isActive]);
}
