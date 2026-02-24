import { useRef, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "../../hooks/useFocusTrap";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    closeOnEscape?: boolean;
    titleId?: string;
};

export default function Modal({
    isOpen,
    onClose,
    children,
    closeOnEscape = true,
    titleId: titleIdProp,
}: ModalProps) {
    const generatedId = useId();
    const titleId = titleIdProp ?? generatedId;
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<Element | null>(null);

    useFocusTrap(contentRef, isOpen);

    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement;

            setTimeout(() => {
                contentRef.current?.focus();
            }, 0);
        } else {
            (previousActiveElement.current as HTMLElement | null)?.focus();
        }
    }, [isOpen]);

    const handleClose = () => {
        contentRef.current?.classList.add("hide-modal");
        overlayRef.current?.classList.add("hide-modal");
        contentRef.current?.addEventListener(
            "animationend",
            handleAnimationEnd,
            {
                once: true,
            },
        );
    };

    const handleAnimationEnd = () => {
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-9999">
            <div
                ref={overlayRef}
                className="absolute inset-0 w-full h-full bg-black/20 z-10 modal-overlay"
                onClick={handleClose}
                aria-hidden="true"
            />
            <div
                ref={contentRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="relative bg-[#f5f1e8] p-8 max-w-lg w-full border-2 border-[#171717] shadow-[6px_6px_0_#171717] z-9999 focus:outline-none"
            >
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 font-mono-stm text-sm text-gray-500 hover:text-[#e85d5d] transition-colors cursor-pointer leading-none focus:outline-none focus-visible:outline-2 focus-visible:outline-[#e85d5d] focus-visible:outline-offset-2"
                    aria-label="Close dialog"
                >
                    [ close ]
                </button>
                <div>{children}</div>
            </div>
        </div>,
        document.getElementsByTagName("body")[0],
    );
}
