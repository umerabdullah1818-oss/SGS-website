import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/app/components/Providers";

export const metadata: Metadata = {
  title: "Sports Guild Society | We Bring The Game To You",
  description:
    "Interactive cricket, football, and futsal experiences delivered straight to your event. Anywhere. Anytime. Sports Guild Society.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
