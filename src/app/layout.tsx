import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "2050 Future Scenario Engine",
  description:
    "A scenario simulator that turns 2050 calibration sliders into a narrative and audio."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
