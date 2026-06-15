import { useState } from "react";
import { useSettings } from "@/lib/content";
import { MessageCircle, X } from "lucide-react";

// Icône WhatsApp (glyphe officiel — lucide n'a pas de logo de marque).
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.82 9.82 0 001.523 5.26l-.999 3.648 3.965-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

// Boutons flottants (bas-droite) : WhatsApp + assistant AYA (chat en iframe, sans quitter le site).
// Activation et paramètres via le CMS (réglages whatsapp / chatbot).
export const FloatingWidgets = () => {
  const { data: settings } = useSettings();
  const [chatOpen, setChatOpen] = useState(false);

  const wa = settings?.whatsapp;
  const bot = settings?.chatbot;
  const waEnabled = !!(wa?.enabled && wa.phone);
  const botEnabled = !!(bot?.enabled && bot.url);

  if (!waEnabled && !botEnabled) return null;

  const waHref = waEnabled
    ? `https://wa.me/${wa!.phone.replace(/\D/g, "")}?text=${encodeURIComponent(wa!.message || "")}`
    : "#";

  return (
    <>
      {botEnabled && chatOpen && (
        <div className="fixed bottom-36 lg:bottom-24 right-4 z-50 flex h-[min(560px,65vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-scale-in">
          <div className="flex shrink-0 items-center justify-between bg-primary px-4 py-2.5 text-primary-foreground">
            <span className="font-display text-sm font-bold">Assistant MA2E</span>
            <button onClick={() => setChatOpen(false)} aria-label="Fermer le chat" className="rounded-full p-1 transition-colors hover:bg-white/15">
              <X className="h-4 w-4" />
            </button>
          </div>
          <iframe src={bot!.url} title="Assistant MA2E" className="w-full flex-1 border-0" />
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
            <WhatsAppIcon className="h-7 w-7" />
          </a>
        )}
        {botEnabled && (
          <button
            onClick={() => setChatOpen((o) => !o)}
            aria-label={chatOpen ? "Fermer l'assistant" : "Ouvrir l'assistant MA2E"}
            className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-elegant transition-transform hover:scale-110"
          >
            {chatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
          </button>
        )}
      </div>
    </>
  );
};

export default FloatingWidgets;
