import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { DollarSign, PackageCheck, FileText, CalendarClock, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";
import { OpsBoard, type OpsBooking } from "@/components/admin/ops-board";
import { PricingEditor } from "@/components/admin/pricing-editor";

export const metadata: Metadata = { title: "Admin · Operations" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?callbackUrl=/admin");
  const isAdmin = session.user.role === "ADMIN";

  const [bookings, quoteCount, paidAgg, upcomingCount] = await Promise.all([
    prisma.booking.findMany({
      include: { quote: true, crew: true, user: true },
      orderBy: { scheduledDate: "asc" },
      take: 40,
    }),
    prisma.quote.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    prisma.booking.count({ where: { status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
  ]);

  const revenue = paidAgg._sum.amount ?? 0;
  const pipeline = bookings.reduce((s, b) => s + b.totalAmount, 0);

  const opsBookings: OpsBooking[] = bookings.map((b) => ({
    id: b.id,
    reference: b.reference,
    status: b.status,
    scheduledDate: b.scheduledDate.toISOString(),
    timeSlot: b.timeSlot,
    customer: b.user?.name || b.quote.contactName || "—",
    origin: b.quote.originAddress,
    destination: b.quote.destAddress,
    crew: b.crew?.name ?? null,
  }));

  const stats = [
    { icon: DollarSign, label: "Deposits collected", value: formatMoney(revenue) },
    { icon: Truck, label: "Booked pipeline", value: formatMoney(pipeline) },
    { icon: CalendarClock, label: "Active moves", value: String(upcomingCount) },
    { icon: FileText, label: "Quotes generated", value: String(quoteCount) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Operations</h1>
          <p className="mt-1 text-[var(--text-secondary)]">Manage bookings, drive move status, and tune your pricing guidelines.</p>
        </div>
        {!isAdmin && (
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">Read-only — sign in as an admin to edit</span>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5 shadow-card">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-forest-50)] text-[var(--color-forest-600)]"><s.icon className="h-5 w-5" /></span>
            <p className="mt-3 text-2xl font-extrabold tabular-nums">{s.value}</p>
            <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Ops board */}
      <section className="mt-8">
        <div className="card p-5 shadow-card sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><PackageCheck className="h-5 w-5 text-[var(--color-forest-500)]" /> Bookings & dispatch</h2>
          <OpsBoard bookings={opsBookings} />
        </div>
      </section>

      {/* Pricing */}
      <section className="mt-8">
        <div className="card p-5 shadow-card sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><DollarSign className="h-5 w-5 text-[var(--color-forest-500)]" /> Pricing guidelines</h2>
          <PricingEditor isAdmin={isAdmin} />
        </div>
      </section>
    </div>
  );
}
