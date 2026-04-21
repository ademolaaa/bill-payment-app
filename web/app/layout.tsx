import "./globals.css";

export const metadata = {
  title: "Bill Payment App",
  description: "Generated for preview",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
