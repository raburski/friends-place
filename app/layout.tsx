import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Fraunces, Sora } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "./_components/QueryProvider";

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

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme_mode")?.value;
  const dataTheme =
    themeCookie === "light" || themeCookie === "dark" ? themeCookie : undefined;

  return (
    <html
      lang="pl"
      className={`${headingFont.variable} ${bodyFont.variable}`}
      data-theme={dataTheme}
    >
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
