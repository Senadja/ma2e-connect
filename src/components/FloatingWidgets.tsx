import { useState } from "react";
import { useSettings } from "@/lib/content";
import { X } from "lucide-react";

const AYA_AVATAR = "/images/aya-avatar.png";
const CHAT_SEEN_KEY = "ma2e-chat-seen";

// Icône WhatsApp officielle (glyphe Simple Icons — lucide n'a pas de logo de marque).
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

// Boutons flottants (bas-droite) : WhatsApp + assistant AYA (chat en iframe, sans quitter le site).
// Activation et paramètres via le CMS (réglages whatsapp / chatbot).
export const FloatingWidgets = () => {
  const { data: settings } = useSettings();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSeen, setChatSeen] = useState(() => {
    try {
      return sessionStorage.getItem(CHAT_SEEN_KEY) === "1";
    } catch {
      return false;
    }
  });

  const wa = settings?.whatsapp;
  const bot = settings?.chatbot;
  const waEnabled = !!(wa?.enabled && wa.phone);
  const botEnabled = !!(bot?.enabled && bot.url);

  if (!waEnabled && !botEnabled) return null;

  const waHref = waEnabled
    ? `https://wa.me/${wa!.phone.replace(/\D/g, "")}?text=${encodeURIComponent(wa!.message || "")}`
    : "#";

  const toggleChat = () => {
    setChatOpen((o) => !o);
    if (!chatSeen) {
      setChatSeen(true);
      try {
        sessionStorage.setItem(CHAT_SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
    }
  };

  const showNudge = botEnabled && !chatOpen && !chatSeen;

  return (
    <>
      {botEnabled && chatOpen && (
        <div className="fixed bottom-36 lg:bottom-24 right-4 z-50 flex h-[min(560px,65vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-scale-in">
          <div className="flex shrink-0 items-center gap-2 bg-primary px-4 py-2.5 text-primary-foreground">
            <img src={AYA_AVATAR} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-white/40" />
            <span className="font-display text-sm font-bold">Assistant AYA — MA2E</span>
            <button onClick={() => setChatOpen(false)} aria-label="Fermer le chat" className="ml-auto rounded-full p-1 transition-colors hover:bg-white/15">
              <X className="h-4 w-4" />
            </button>
          </div>
          <iframe src={bot!.url} title="Assistant AYA" className="w-full flex-1 border-0" />
        </div>
      )}

      <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col items-end gap-3">
        {waEnabled && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contacter MA2E sur WhatsApp"
            className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-elegant transition-transform hover:scale-110"
          >
            <WhatsAppIcon className="h-8 w-8" />
          </a>
        )}
        {botEnabled && (
          <div className={`relative ${showNudge ? "animate-chat-nudge" : ""}`}>
            {/* Bulle d'invite (incite au clic), disparaît une fois le chat ouvert */}
            {showNudge && (
              <div className="pointer-events-none absolute right-16 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-elegant ring-1 ring-border sm:block animate-fade-in">
                Une question ? 💬
              </div>
            )}
            <button
              onClick={toggleChat}
              aria-label={chatOpen ? "Fermer l'assistant" : "Ouvrir l'assistant AYA"}
              className="h-14 w-14 overflow-hidden rounded-full shadow-elegant ring-2 ring-white transition-transform hover:scale-110"
            >
              {chatOpen ? (
                <span className="grid h-full w-full place-items-center bg-primary text-primary-foreground">
                  <X className="h-6 w-6" />
                </span>
              ) : (
                <img src={AYA_AVATAR} alt="" className="h-full w-full object-cover" />
              )}
            </button>
            {/* Badge de notification animé */}
            {showNudge && (
              <span className="pointer-events-none absolute -right-1 -top-1 flex h-5 w-5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">1</span>
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingWidgets;
