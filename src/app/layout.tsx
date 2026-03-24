import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/Header";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Project Mesh";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} – Deine Community-Plattform`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Project Mesh ist eine offene Community-Plattform. Entdecke Posts, Communities und Menschen, die deine Interessen teilen.",
  keywords: ["Community", "Social Media", "Posts", "Forum", "Project Mesh"],
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} – Deine Community-Plattform`,
    description:
      "Project Mesh ist eine offene Community-Plattform. Entdecke Posts, Communities und Menschen, die deine Interessen teilen.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} – Deine Community-Plattform`,
    description:
      "Project Mesh ist eine offene Community-Plattform.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <footer className="bg-white border-t border-gray-200 py-6 mt-12">
              <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                <p>© {new Date().getFullYear()} {APP_NAME}. Alle Rechte vorbehalten.</p>
                <nav className="flex gap-4">
                  <a href="/impressum" className="hover:text-gray-900">Impressum</a>
                  <a href="/datenschutz" className="hover:text-gray-900">Datenschutz</a>
                </nav>
              </div>
            </footer>
          </div>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
