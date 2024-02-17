import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';;
import "./globals.css";
import "./font.css";
import dynamic from 'next/dynamic'

const MainPageDynamic = dynamic(() => import('../components/MainPage'), {
  ssr: false,
})

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prime Deal",
  description: "DeFi project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ThemeRegistry>
          <MainPageDynamic children={children}/>
        </ThemeRegistry>
      </body>
    </html>
  );
}