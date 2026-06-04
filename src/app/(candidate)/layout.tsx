import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/sign-in");
  if (session.user.role !== "CANDIDATE") redirect("/");
  if (!session.user.onboardingDone) redirect("/onboarding/candidate");

  return (
    <div className="flex min-h-screen bg-[#060610] text-white">
      <Sidebar
        variant="candidate"
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main className="flex-1 min-w-0 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
