import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { COMPANY, EVENTO, SITE_URL } from "@/lib/evento";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${EVENTO.titulo} | ${COMPANY.name} em Curitiba e Campo Largo`,
  description:
    "Cadastre sua empresa para o evento online sobre riscos psicossociais e NR-1, com foco em empresas de Curitiba e Campo Largo.",
  alternates: { canonical: "/" },
  /**
   * Link de campanha, não de busca. Não compete com o site institucional
   * por autoridade nem por termo de pesquisa.
   */
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: COMPANY.legalName,
    title: `${EVENTO.titulo} | ${COMPANY.name}`,
    description:
      "Cadastre sua empresa para o evento online sobre riscos psicossociais e NR-1.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
