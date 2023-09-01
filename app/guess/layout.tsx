import "../globals.css";
import type { Metadata } from "next";
import React from 'react';

export const metadata: Metadata = {
  title: "Player Guessing | Facts Party",
  description: "An app for managing a Facts Party",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
