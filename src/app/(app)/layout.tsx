import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--surface-2)]">{children}</main>
      <Footer />
    </>
  );
}
