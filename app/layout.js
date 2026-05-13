import { Inter, Manrope } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata = {
  title: "Tech2Globe - Login",
  description: "Streamline your workforce management.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* External icon font; App Router equivalent of loading in root layout */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Material Symbols via Google Fonts CDN */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
