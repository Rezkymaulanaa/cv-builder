import Image from "next/image";
import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-lg text-ink">
      <Image src="/logo.png" alt="" width={28} height={28} priority className="size-7" />
      <span className="text-lg font-semibold tracking-tight">Sumeio</span>
    </Link>
  );
}
