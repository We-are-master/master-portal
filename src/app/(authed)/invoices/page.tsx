import { requirePortalUserOrRedirect } from "@/lib/portal-auth";
import { fetchAccountInvoices } from "@/lib/server-fetchers/portal-invoices";
import { InvoicesClient } from "./invoices-client";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const auth = await requirePortalUserOrRedirect();
  const { outstanding, paid } = await fetchAccountInvoices(auth.accountId);
  return <InvoicesClient outstanding={outstanding} paid={paid} />;
}
