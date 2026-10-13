import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book bane",
  description: "Se ledige tider og book squashbane hos Søm Squashklubb.",
  alternates: { canonical: "/book" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
