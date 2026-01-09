import type { Metadata } from "next";
import { Fraunces, Sora } from "next/font/google";
import "./globals.css";

const headingFont = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading"
});

const bodyFont = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Domy Kolegów",
  description: "Prywatne miejsca od kolegów dla kolegów"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var mode = localStorage.getItem('theme_mode');
                  if (!mode || mode === 'auto') {
                    document.documentElement.removeAttribute('data-theme');
                    return;
                  }
                  document.documentElement.setAttribute('data-theme', mode);
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
