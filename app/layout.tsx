import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Phone from "@/components/Phone";
import StoreHydrator from "@/components/StoreHydrator";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DS Akquise-Planer",
  description: "Akquise-Projekte, Kunden-Pipeline, Termine und Ziele",
  applicationName: "DS Akquise",
  appleWebApp: {
    capable: true,
    title: "DS Akquise",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1F3A2C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${dmSans.variable} ${instrument.variable}`}>
      <body>
        <StoreHydrator>
          <Phone>{children}</Phone>
        </StoreHydrator>
      </body>
    </html>
  );
}
