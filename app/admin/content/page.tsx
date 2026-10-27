import { redirect } from "next/navigation";

// Page wording now lives in the page builder: open a page and edit its sections.
export default function ContentRedirect() {
  redirect("/admin/pages");
}
