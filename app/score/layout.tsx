import "../globals.css";
import type { Metadata } from "next";
import React from 'react';

export const metadata: Metadata = {
  title: "Score Management | Facts Party",
  description: "An app for managing a Facts Party",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
