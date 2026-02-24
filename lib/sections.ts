import type { Section } from "@/lib/types";

export const SECTION_DEFS: Omit<Section, "visited">[] = [
    {
        id: "about",
        label: "Intro",
        w: 64,
        h: 84,
        content: {
            title: "Intro",
            body: [
                "Hi, I’m Mainao — a Senior Software Engineer focused on frontend development with 8 years of experience building modern web applications. I’ve worked on large-scale enterprise products, crafting clean, scalable UIs using React, Next.js, TypeScript, and modern frontend tools. I’m always learning, building, and exploring along the way.",
            ],
        },
    },
    {
        id: "education",
        label: "Education",
        w: 64,
        h: 84,
        content: {
            title: "Education",
            body: [
                "Master of Computer Application",
                "Tezpur University (Assam) · 2014-2017",
                "CGPA 7.53/10",
            ],
        },
    },
    {
        id: "experience",
        label: "Experience",
        w: 64,
        h: 84,
        content: {
            title: "Experience",
            body: [
                "Senior Software Engineer",
                "CGI, Bangalore",
                "Apr 2023 - Present",
                "",
                "Software Engineer A2",
                "Epam Systems, Remote",
                "Nov 2021 - Apr 2023",
                "",
                "Software Engineer",
                "Byond Travel, Bangalore",
                "July 2019 - Mar 2021",
                "",
                "Associate UI Developer",
                "Toolyt, Bangalore",
                "Jul 2017 - Jul 2019",
            ],
        },
    },
    {
        id: "projects",
        label: "Fun Projects",
        w: 64,
        h: 84,
        content: {
            title: "Projects",
            body: ["Loading.."],
        },
    },
    {
        id: "contact",
        label: "Contact",
        w: 64,
        h: 84,
        content: {
            title: "Contact",
            body: [
                {
                    text: "mainao1230@gmail.com",
                    url: "mailto:mainao1230@gmail.com",
                },
                { text: "github.com/Mainao", url: "https://github.com/Mainao" },
                {
                    text: "linkedin.com/in/mainao-baro",
                    url: "https://linkedin.com/in/mainao-baro",
                },
                "",
                "Open to full-time roles",
            ],
        },
    },
];
