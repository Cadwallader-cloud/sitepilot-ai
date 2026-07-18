import { redirect } from "next/navigation";

/** Legacy URL — dashboard is the home for signed-in users */
export default function ProjectsRedirectPage() {
  redirect("/dashboard");
}
