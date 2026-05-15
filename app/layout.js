import { Inter, Manrope } from "next/font/google";
import "../styles/globals.css";
import TabGuard from "@/components/TabGuard";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata = {
  title: "Tech2Globe - Attendance Portal",
  description: "Streamline your workforce management.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans m-0 p-0 overflow-x-hidden min-h-screen">
        <TabGuard />
        <div id="app-root">
          {children}
        </div>
      </body>
    </html>
  );
}
