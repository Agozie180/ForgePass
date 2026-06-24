import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet-provider";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ForgePass | Forge Trust. Reveal Nothing.",
  description:
    "ForgePass is a zero-knowledge reputation credential on Stellar. Prove financial credibility — income, balance, reputation score — without revealing any of it. Verifiable off-chain computation plus a private credential, powered by Noir, UltraHonk and Soroban.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${mono.variable}`}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
