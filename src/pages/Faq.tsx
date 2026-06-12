import { useMemo, useState } from "react";
import { Search, HelpCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ_CATEGORIES, type FaqCategory } from "@/data/institutional";
import { useFaq } from "@/lib/content";
import { useTranslation } from "react-i18next";

const Faq = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FaqCategory | "Toutes">("Toutes");
  const { data: FAQS = [] } = useFaq();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      const okCat = category === "Toutes" || f.category === category;
      const okQ = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [query, category, FAQS]);

  return (
    <Layout>
      <PageHero
        title={t("faq.heroTitle")}
        subtitle={t("faq.heroSubtitle")}
        breadcrumb={[{ label: t("nav.home"), href: "/" }, { label: "FAQ" }]}
      />

      <section className="container py-16">
        <div className="mx-auto max-w-3xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("faq.searchPlaceholder")}
              className="pl-12 h-12 text-base"
              aria-label={t("faq.searchPlaceholder")}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <Button
              variant={category === "Toutes" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory("Toutes")}
            >
              {t("faq.all")}
            </Button>
            {FAQ_CATEGORIES.map((c) => (
              <Button
                key={c}
                variant={category === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>

          <div className="mt-10">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <HelpCircle className="mx-auto h-12 w-12 mb-4 opacity-40" />
                <p>{t("faq.noResult")}</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-3">
                {filtered.map((f, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="rounded-xl border bg-card px-5 shadow-sm transition-smooth hover:shadow-md"
                  >
                    <AccordionTrigger className="text-left font-display text-base hover:no-underline py-5">
                      <div className="flex items-start gap-3 pr-4">
                        <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {f.category}
                        </span>
                        <span>{f.q}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Faq;
