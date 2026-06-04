import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/sign-in");
  if (session.user.role !== "AGENCY") redirect("/");
  if (!session.user.onboardingDone) redirect("/onboarding/agency");

  return (
    <div className="flex min-h-screen bg-[#060610] text-white">
      <Sidebar
        variant="agency"
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main className="flex-1 min-w-0 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
