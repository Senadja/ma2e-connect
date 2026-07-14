import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { LegalArticle } from "@/components/LegalArticle";
import { useSettings } from "@/lib/content";
import { DEFAULT_LEGAL } from "@/data/legal";

const Cgu = () => {
  const { data: settings } = useSettings();
  const page = settings?.legal?.cgu ?? DEFAULT_LEGAL.cgu;
  return (
    <Layout>
      <PageHero title={page.title} subtitle={page.subtitle} />
      <LegalArticle page={page} />
    </Layout>
  );
};

export default Cgu;
