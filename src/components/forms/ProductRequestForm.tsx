import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  fullName: z.string().min(3, "Nom complet requis"),
  matricule: z.string().min(4, "Matricule requis"),
  phone: z.string().min(10, "Téléphone requis"),
  productType: z.string().min(1, "Sélectionnez un produit"),
  amount: z.string().optional(),
  message: z.string().optional(),
});

interface ProductRequestFormProps {
  defaultProduct?: string;
  category: "épargne" | "crédit" | "immobilier";
}

export const ProductRequestForm = ({ defaultProduct, category }: ProductRequestFormProps) => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      matricule: "",
      phone: "",
      productType: defaultProduct || "",
      amount: "",
      message: "",
    },
  });

  const [loading, setLoading] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const { appId } = await api<{ appId: string }>("/applications", {
        method: "POST",
        body: {
          category,
          type: values.productType,
          name: values.fullName,
          matricule: values.matricule,
          phone: values.phone,
          data: { amount: values.amount || "", message: values.message || "" },
        },
      });
      setSubmitted(true);
      toast.success(`${t("form.sentTitle")} (${appId})`);
    } catch (e: any) {
      toast.error(e?.message || t("form.errorToast"));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-primary/5 rounded-2xl p-8 text-center animate-scale-in">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary mb-4" />
        <h3 className="font-display text-xl font-bold">{t("form.sentTitle")}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("form.sentText")}
        </p>
        <Button
          variant="outline"
          className="mt-6 rounded-full"
          onClick={() => {
            setSubmitted(false);
            form.reset();
          }}
        >
          {t("form.newRequest")}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="font-display text-xl font-bold mb-6">{t("form.title")}</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.fullName")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("form.fullNamePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="matricule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.matricule")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("form.matricule")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.phone")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("form.phone")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="productType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.product")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.chooseProduct")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {category === "épargne" && (
                      <>
                        <SelectItem value="expresse">Épargne Expresse</SelectItem>
                        <SelectItem value="ordinaire">Épargne Ordinaire</SelectItem>
                        <SelectItem value="logement">Épargne Logement</SelectItem>
                        <SelectItem value="dat">Dépôt à terme</SelectItem>
                      </>
                    )}
                    {category === "crédit" && (
                      <>
                        <SelectItem value="ordinaire">Crédit Ordinaire</SelectItem>
                        <SelectItem value="expresse">Crédit Expresse</SelectItem>
                        <SelectItem value="scolaire">Crédit Scolaire</SelectItem>
                        <SelectItem value="immobilier">Crédit Immobilier</SelectItem>
                      </>
                    )}
                    {category === "immobilier" && (
                      <>
                        <SelectItem value="villa-3">Villa 3 pièces</SelectItem>
                        <SelectItem value="villa-4">Villa 4 pièces</SelectItem>
                        <SelectItem value="duplex-4">Duplex 4 pièces</SelectItem>
                        <SelectItem value="duplex-5">Duplex 5 pièces</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{category === "épargne" ? t("form.amountSavings") : t("form.amountOther")}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ex: 1000000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.message")}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t("form.messagePlaceholder")} className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading} className="w-full rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? t("form.submitting") : t("form.submit")}
          </Button>
        </form>
      </Form>
    </div>
  );
};
