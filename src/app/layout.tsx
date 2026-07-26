import type { Metadata } from "next";
import "./globals.css";

const productName = process.env.NEXT_PUBLIC_PRODUCT_NAME ?? "Procurelio";

export const metadata: Metadata = {
  metadataBase: new URL("https://tender-app-gilt-ten.vercel.app"),
  title: `${productName} — Evidence-led procurement`,
  description: "Understand tenders. Prove your fit. Participate with confidence.",
  openGraph: {
    title: "Procurelio — Tenders, made clear.",
    description: "AI-powered tender marketplace for Germany and Austria.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Procurelio — Tenders, made clear.",
    description: "AI-powered tender marketplace for Germany and Austria.",
  },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
