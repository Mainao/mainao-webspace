import Link from "next/link";

export default function InstructionsPage() {
    return (
        <main className="min-h-screen bg-[#f5f1e8] flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-lg w-full">
                <h1 className="font-pixel text-4xl text-[#171717] leading-tight mb-8">
                    Instructions
                </h1>

                <p className="font-mono-stm text-sm text-[#3a3a3a] leading-loose">
                    Walk around with{" "}
                    <kbd className="font-mono-stm text-[11px] bg-white border-2 border-[#171717] shadow-[2px_2px_0_#171717] px-1.5 py-0.5">
                        ← →
                    </kbd>{" "}
                    (or{" "}
                    <kbd className="font-mono-stm text-[11px] bg-white border-2 border-[#171717] shadow-[2px_2px_0_#171717] px-1.5 py-0.5">
                        A D
                    </kbd>
                    ) and jump with{" "}
                    <kbd className="font-mono-stm text-[11px] bg-white border-2 border-[#171717] shadow-[2px_2px_0_#171717] px-1.5 py-0.5">
                        ↑
                    </kbd>{" "}
                    or{" "}
                    <kbd className="font-mono-stm text-[11px] bg-white border-2 border-[#171717] shadow-[2px_2px_0_#171717] px-1.5 py-0.5">
                        Space
                    </kbd>{" "}
                    — hop onto a flower to explore a section! Discover all five
                    and a special magic flower will bloom just for you ✨ Oh,
                    and give the cute little frog a click for good vibes 🎶
                </p>

                <div className="mt-10">
                    <Link
                        href="/"
                        className="inline-block font-pixel text-sm text-[#f5f1e8] bg-[#e85d5d] border-2 border-[#171717] shadow-[4px_4px_0_#171717] px-8 py-3 hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#171717] transition-[transform,box-shadow] duration-100"
                    >
                        Let&apos;s go! ▶
                    </Link>
                </div>
            </div>
        </main>
    );
}
