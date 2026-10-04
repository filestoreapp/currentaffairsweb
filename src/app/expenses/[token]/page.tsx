import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EXPENSE_TOKEN, FRIEND_NAME } from "@/lib/expenses";
import Tracker from "./tracker";

export const metadata: Metadata = {
  title: "Expense Tracker",
  robots: { index: false, follow: false },
};

/**
 * Private expense tracker. The token in the URL is the only gate —
 * a wrong token renders the site 404 page, so the page is invisible
 * to anyone without the link.
 */
export default async function ExpensePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (token !== EXPENSE_TOKEN) notFound();
  return <Tracker token={token} friendName={FRIEND_NAME} />;
}
