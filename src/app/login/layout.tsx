import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logg inn",
  description: "Logg inn for å booke squashbane hos Søm Squashklubb.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
