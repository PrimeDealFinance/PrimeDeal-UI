import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import bitcoinRight from "@/public/bitcoinRight.png"
import blurCoinRight from "@/public/blurCoinRight.svg"
import coinGroup from "@/public/coinGroup.png"
import bitcoinLeft from "@/public/bitcoinLeft.png"
import ConnectButton from "@/components/ConnectButton";
import logo from "@/public/PrimeDeal.svg"
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import Button from "@mui/joy/Button";
import Link from "next/link";



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
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
            <main className="dark h-screen flex flex-col relative text-foreground bg-[#010306] z-[0]">
              <div className="z-[2]">
                <Link href={'/'}>
                  <Image
                      src={logo}
                      alt=""
                      width={88}
                      height={14}
                      className="absolute top-[45.07px] left-[70.34px]"/>
                </Link>
              </div>
              <div className="absolute z-[2] top-[35px] right-[70px]">  
                  <ConnectButton/>
              </div>
              <div className="absolute z-[2] top-[100px] right-[70px]">
              <Link href={'/orders'}>
                <Button variant="outlined" 
                  sx={{
                    borderRadius: '1000px',
                    boxShadow: 'none',
                    textTransform: 'none',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    color: '#FFFFFF',
                    letterSpacing: '-0.54px',
                    width: '160px',
                    height: '48px',
                    border: '1px solid',
                    lineHeight: 1.5,
                    backgroundColor: '#010306',
                    borderColor: '#5606FF',
                    fontFamily: [
                      'Gotham',
                      '-apple-system',
                      'BlinkMacSystemFont',
                      '"Segoe UI"',
                      'Roboto',
                      '"Helvetica Neue"',
                      'Arial',
                      'sans-serif',
                      '"Apple Color Emoji"',
                      '"Segoe UI Emoji"',
                      '"Segoe UI Symbol"',
                    ].join(','),
                    '&:hover': {
                      backgroundColor: '#5606FF',
                      borderColor: '#010306',
                      boxShadow: 'none',
                    },
                  }}>
                  MY ORDERS
                </Button>
              </Link>
              </div>
              <div style={{position: 'absolute',
                  width: '1082px',
                  height: '530.9px',
                  right: '50%',
                  top: '103px',
                  margin: '0 -541px 0 0',
                  background: 'radial-gradient(50% 50% at 50% 50%, #3144EF 71.39%, #3D0DFF 81.49%)',
                  borderRadius: '50%',
                  filter: 'blur(152.923px)',
                  transform: 'matrix(-1, 0, 0, 1, 0, 0)',
                  zIndex:'-1'
                  }}></div>
              <div style={{
                  position: 'absolute',
                  width: '548.12px',
                  height: '275.32px',
                  right: '35%',
                  top: '176.34px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  transform: 'matrix(-0.97, 0.26, 0.26, 0.97, 0, 0)',
                  filter: 'blur(116.495px)',
                  zIndex:'-1'
                  }}></div>
              <div style={{
                  position: 'absolute',
                  width: '313.06px',
                  height: '157.25px',
                  right: '52%',
                  top: '389.85px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  transform: 'matrix(-0.97, 0.26, 0.26, 0.97, 0, 0)',
                  filter: 'blur(59.1959px)',
                  zIndex:'-1'
                  }}></div>
              <Image 
                  src={bitcoinRight} 
                  alt="" 
                  width={159.42} 
                  height={185.29}
                  className="absolute right-0 top-[165.12px]"/>
              <Image 
                  src={blurCoinRight} 
                  alt="" 
                  width={100} 
                  height={200}
                  className="absolute right-[33.88px] top-[601.04px]"/>
               <Image 
                  src={coinGroup} 
                  alt="" 
                  width={465} 
                  height={713}
                  className="absolute left-0 bottom-0"/>
               <Image 
                  src={bitcoinLeft} 
                  alt="" 
                  width={250} 
                  height={355}
                  className="absolute left-0 top-[328px]"/>
              {children}
            </main>
          </ThemeRegistry>
      </body>
    </html>
  );
}