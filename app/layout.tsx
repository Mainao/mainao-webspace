import type { Metadata } from "next";
import { Pixelify_Sans, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const pixelifySans = Pixelify_Sans({
    subsets: ["latin"],
    variable: "--font-pixelify-sans",
    weight: ["400", "500", "600", "700"],
});

const shareTechMono = Share_Tech_Mono({
    subsets: ["latin"],
    variable: "--font-share-tech-mono",
    weight: "400",
});

export const metadata: Metadata = {
    title: "Mainao Baro — Frontend Engineer",
    description:
        "Welcome to Mainao's corner of the internet — a gamified portfolio built with Next.js. Explore sections on experience, education, projects, and more.",
    keywords: [
        "Mainao Baro",
        "Frontend Engineer",
        "React",
        "Next.js",
        "TypeScript",
        "Portfolio",
        "Software Engineer",
    ],
    authors: [{ name: "Mainao Baro" }],
    openGraph: {
        title: "Mainao Baro — Frontend Engineer",
        description:
            "A gamified portfolio by Mainao — Senior Software Engineer with 8+ years of experience in React, Next.js, and modern web development.",
        type: "website",
        locale: "en_US",
    },
    twitter: {
        card: "summary",
        title: "Mainao Baro — Frontend Engineer",
        description:
            "A gamified portfolio by Mainao — Senior Software Engineer with 8+ years of experience in React, Next.js, and modern web development.",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${pixelifySans.variable} ${shareTechMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
