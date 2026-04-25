import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QuoteDetailRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/requests?tab=quotes&id=${encodeURIComponent(id)}`);
}
