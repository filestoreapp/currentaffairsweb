import { redirect } from "next/navigation";

/** The standalone PYQ index is merged into /exams — keep old links working. */
export default function PyqsRedirect() {
  redirect("/exams#pyq-papers");
}
