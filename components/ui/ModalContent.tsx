import type { Section } from "@/lib/types";

const isDateLine = (text: string) => /^[A-Za-z]+ \d{4}\s*[-–]/.test(text);

export default function ModalContent({
    section,
    titleId,
}: {
    section: Section;
    titleId?: string;
}) {
    const { title, body } = section.content;

    return (
        <div className="mb-4">
            <h2
                id={titleId}
                className="font-pixel text-2xl text-[#171717] mb-3 leading-tight"
            >
                {title}
            </h2>
            <div className="border-b-2 border-[#171717] mb-4" />
            <div className="font-mono-stm text-sm leading-relaxed text-[#3a3a3a] space-y-0.5">
                {body.map((item, i) => {
                    if (item === "") return <div key={i} className="h-3" />;

                    if (typeof item === "object") {
                        return (
                            <p key={i}>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#e85d5d] hover:underline transition-colors"
                                >
                                    {item.text}
                                </a>
                            </p>
                        );
                    }

                    if (isDateLine(item)) {
                        return (
                            <p key={i} className="text-[#999] text-xs">
                                {item}
                            </p>
                        );
                    }

                    return (
                        <p
                            key={i}
                            className={
                                section.id !== "about" &&
                                section.id !== "contact" &&
                                (i === 0 || body[i - 1] === "")
                                    ? "font-bold text-[#171717]"
                                    : undefined
                            }
                        >
                            {item}
                        </p>
                    );
                })}
            </div>
        </div>
    );
}
