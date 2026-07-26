import type { Metadata } from "next";
import "./globals.css";

const productName = process.env.NEXT_PUBLIC_PRODUCT_NAME ?? "TenderLoop";

export const metadata: Metadata = {
  title: `${productName} — Evidence-led procurement`,
  description: "Qualified suppliers. Comparable bids. Confident decisions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
