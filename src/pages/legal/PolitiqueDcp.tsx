import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { LegalArticle } from "@/components/LegalArticle";
import { useSettings } from "@/lib/content";
import { DEFAULT_LEGAL } from "@/data/legal";

const PolitiqueDcp = () => {
  const { data: settings } = useSettings();
  const page = settings?.legal?.dcp ?? DEFAULT_LEGAL.dcp;
  return (
    <Layout>
      <PageHero title={page.title} subtitle={page.subtitle} />
      <LegalArticle page={page} />
    </Layout>
  );
};

export default PolitiqueDcp;
