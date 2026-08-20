import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseJson } from "@/lib/utils";
import type { Tier } from "@/lib/pricing";
import { BookingFlow } from "@/components/booking/booking-flow";

export const metadata: Metadata = { title: "Book your move" };

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ quoteId: string }>;
  searchParams: Promise<{ tier?: string }>;
}) {
  const { quoteId } = await params;
  const { tier = "standard" } = await searchParams;

  const quote = await prisma.quote.findFirst({
    where: { OR: [{ id: quoteId }, { reference: quoteId }] },
    include: { booking: { select: { reference: true } } },
  });
  if (!quote) notFound();
  if (quote.booking) redirect(`/booking/${quote.booking.reference}`);

  const tiers = parseJson<Tier[]>(quote.tiers, []);
  const session = await auth();

  return (
    <div className="bg-[var(--surface-2)] py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Confirm & schedule your move</h1>
          <p className="mt-1.5 text-[var(--text-secondary)]">Quote {quote.reference} · pick a time, create your account, and pay a small deposit to lock it in.</p>
        </div>
        <BookingFlow
          quote={{
            id: quote.id,
            reference: quote.reference,
            originAddress: quote.originAddress,
            destAddress: quote.destAddress,
            contactName: quote.contactName,
            contactEmail: quote.contactEmail,
            contactPhone: quote.contactPhone,
            tiers,
          }}
          initialTier={tiers.some((t) => t.id === tier) ? tier : "standard"}
          loggedIn={!!session?.user}
          userName={session?.user?.name}
          userEmail={session?.user?.email}
        />
      </div>
    </div>
  );
}
