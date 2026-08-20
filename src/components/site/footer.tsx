import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Star } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { company } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--color-forest-900)] text-[var(--color-forest-50)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo invert />
            <p className="mt-4 max-w-xs text-sm text-[var(--color-forest-100)]/80">{company.tagline}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm">
              <Star className="h-4 w-4 fill-[var(--color-honey-300)] text-[var(--color-honey-300)]" />
              <span className="font-semibold">{company.rating}</span>
              <span className="text-[var(--color-forest-100)]/70">· {company.reviewCount} Google reviews</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-honey-300)]">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--color-forest-100)]/85">
              <li><Link href="/#how-it-works" className="hover:text-white">How it works</Link></li>
              <li><Link href="/#services" className="hover:text-white">Services</Link></li>
              <li><Link href="/#pricing" className="hover:text-white">Transparent pricing</Link></li>
              <li><Link href="/#reviews" className="hover:text-white">Customer reviews</Link></li>
              <li><Link href="/quote" className="hover:text-white">Get an instant quote</Link></li>
              <li><Link href="/track" className="hover:text-white">Track my move</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-honey-300)]">Service areas</h4>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[var(--color-forest-100)]/85">
              {company.serviceAreas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-honey-300)]">Get in touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-forest-100)]/85">
              <li>
                <a href={company.phoneHref} className="inline-flex items-center gap-2 hover:text-white">
                  <Phone className="h-4 w-4 text-[var(--color-honey-300)]" /> {company.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="inline-flex items-center gap-2 hover:text-white">
                  <Mail className="h-4 w-4 text-[var(--color-honey-300)]" /> {company.email}
                </a>
              </li>
              <li className="inline-flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-honey-300)]" />
                <span>
                  {company.address.line1}
                  <br />
                  {company.address.city}, {company.address.state} {company.address.zip}
                </span>
              </li>
              <li className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-[var(--color-honey-300)]" /> {company.hours}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-[var(--color-forest-100)]/60 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {company.name}. Licensed & insured · {company.license}.
          </p>
          <p>Instant quotes are estimates and confirmed after a quick review. Deposits are fully refundable up to 48 hours before your move.</p>
        </div>
      </div>
    </footer>
  );
}
