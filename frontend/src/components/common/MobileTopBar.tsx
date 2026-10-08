import { Menu } from "lucide-react";
import { Isotipo } from "@/components/illustrations/Isotipo";

export function MobileTopBar({ title, onMenu, menuOpen }: { title: string; onMenu: () => void; menuOpen: boolean }) {
  return <header className="md:hidden shrink-0 bg-white pt-[env(safe-area-inset-top)]">
    <div className="grid h-14 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 px-3">
      <button type="button" onClick={onMenu} className="flex h-11 w-11 items-center justify-center rounded-xl text-[#7C6F9A] hover:bg-violet-50 focus-visible:ring-2 focus-visible:ring-violet-500" aria-label="Abrir menú de navegación" aria-expanded={menuOpen}><Menu size={19} /></button>
      <p className="min-w-0 truncate text-center text-sm font-bold text-[#7C6F9A]">{title}</p>
      <div className="flex h-11 w-11 items-center justify-center"><Isotipo size={34} /></div>
    </div>
  </header>;
}
