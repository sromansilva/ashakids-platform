import type { usePadreHome } from "@/pages/padre/dashboard/usePadreHome";
import { Search, X, Bell, HelpCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Av } from "@/components/common/Av";
import { ChildPicker } from "@/pages/padre/dashboard/ChildPicker";

type Props = Pick<ReturnType<typeof usePadreHome>, "padreUserName" | "padrePlan" | "activeChild" | "handleSetChild" | "searchVal" | "setSearchVal" | "searchResults" | "go" | "setShowNotifs" | "setNotifsRead" | "onNotifsRead" | "hasUnread" | "showNotifs" | "notifs" | "childrenList">;
export function PadreHomeBuenosDias({ padreUserName, padrePlan, activeChild, handleSetChild, searchVal, setSearchVal, searchResults, go, setShowNotifs, setNotifsRead, onNotifsRead, hasUnread, showNotifs, notifs, childrenList }: Props) {
return (<div className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-[#E8E5F4] sticky top-0 z-20 gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black text-[#9E95B7] uppercase tracking-widest">
            Centro Familiar
          </p>
          <h1 className="text-lg font-black text-[#1C1135] leading-tight">
            Buenos días, {padreUserName.split(" ")[0]} 👋
          </h1>
          <p className="text-xs text-[#9E95B7] font-medium">
            Hoy es un gran día para seguir aprendiendo.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Child selector — custom dropdown */}
          {padrePlan === "familia" && <ChildPicker activeChild={activeChild} setActiveChild={handleSetChild} childrenList={childrenList} />}

          {/* Search with results dropdown */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]"
            />
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onBlur={() =>
                setTimeout(() => setSearchVal(""), 150)
              }
              placeholder="Buscar en ASHAKids..."
              className="pl-9 pr-4 py-2.5 rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] text-sm text-[#1C1135] placeholder-[#C4BED8] focus:outline-none focus:ring-2 focus:ring-violet-300/30 w-52 font-medium transition-all"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl border border-[#E8E5F4] shadow-xl z-50 py-1 overflow-hidden">
                {searchResults.map((r) => (
                  <button
                    key={r.view}
                    onMouseDown={() => go(r.view)}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#1C1135] hover:bg-[#F5F3FF] flex items-center gap-2 transition-colors"
                  >
                    <Search
                      size={12}
                      className="text-[#9E95B7]"
                    />{" "}
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification bell with dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs((v) => !v);
                setNotifsRead(true);
                onNotifsRead?.();
              }}
              className="relative p-2.5 rounded-2xl border border-[#E8E5F4] bg-white hover:bg-[#F5F3FF] transition-colors"
            >
              <Bell size={17} className="text-[#7C6F9A]" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 border-2 border-white" />
              )}
            </button>
            {showNotifs && (
              <div
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-3xl border border-[#E8E5F4] shadow-2xl z-50 overflow-hidden"
                style={{
                  fontFamily: '"Nunito", system-ui, sans-serif',
                }}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E5F4]">
                  <p className="font-extrabold text-[#1C1135]">
                    Notificaciones
                  </p>
                  <button
                    onClick={() => setShowNotifs(false)}
                    className="text-[#9E95B7] hover:text-[#1C1135] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifs.map((n, i) => (
                    <button
                      key={i}
                      onClick={() => setShowNotifs(false)}
                      className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-[#FAFAF9] transition-colors border-b border-[#F5F3FF] last:border-0 text-left"
                    >
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: n.bg }}
                      >
                        {n.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1C1135] leading-snug">
                          {n.title}
                        </p>
                        <p className="text-xs text-[#9E95B7] font-medium mt-0.5">
                          {n.time}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-[#E8E5F4]">
                  <button
                    onClick={() => setShowNotifs(false)}
                    className="text-xs font-extrabold w-full text-center"
                    style={{ color: B.violet }}
                  >
                    Ver todo el historial
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help → public/ayuda */}
          <button
            onClick={() => go("padre/ayuda")}
            className="p-2.5 rounded-2xl border border-[#E8E5F4] bg-white hover:bg-[#F5F3FF] transition-colors"
            title="Centro de ayuda"
          >
            <HelpCircle size={17} className="text-[#7C6F9A]" />
          </button>

          {/* Avatar */}
          <button
            onClick={() => go("padre/config")}
            title="Mi configuración"
            className="rounded-2xl transition-opacity hover:opacity-75 active:scale-95"
          >
            <Av initials="LG" color={B.violet} size="md" />
          </button>
        </div>
      </div>);
}
