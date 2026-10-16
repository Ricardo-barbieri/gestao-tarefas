import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
    title: "Vamo · Gestão de trabalho",
    description: "Seu trabalho em movimento. Gestão de demandas, projetos e processos.",
    icons: {
        icon: "/favicon.svg",
        shortcut: "/favicon.svg",
    },
};
export default function RootLayout({ children, }: Readonly<{
    children: React.ReactNode;
}>) {
    return (<html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>);
}
