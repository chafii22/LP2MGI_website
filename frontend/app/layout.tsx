import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Providers from "./providers";
import { Inter } from "next/font/google";
import { defaultKeywords, siteDescription, siteName, siteTitle, siteUrl } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"]
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: defaultKeywords,
  applicationName: siteName,
  alternates: {
    canonical: "/",
  },
  referrer: "strict-origin-when-cross-origin",
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/Logo_ESTC.png",
        alt: `${siteName} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/Logo_ESTC.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/Logo_ESTC.png" }],
    apple: [{ url: "/Logo_ESTC.png" }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1420" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased leading-relaxed`}
      >
        <Providers>
          <Navbar></Navbar>
          {children}
          <Footer></Footer>
        </Providers>
      </body>
    </html>
  );
}


