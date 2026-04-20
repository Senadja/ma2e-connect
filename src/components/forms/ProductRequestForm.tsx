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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setSubmitted(true);
    toast.success("Votre demande a été transmise au service concerné.");
  }

  if (submitted) {
    return (
      <div className="bg-primary/5 rounded-2xl p-8 text-center animate-scale-in">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary mb-4" />
        <h3 className="font-display text-xl font-bold">Demande envoyée !</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Un conseiller vous recontactera très prochainement pour finaliser votre dossier.
        </p>
        <Button 
          variant="outline" 
          className="mt-6 rounded-full"
          onClick={() => {
            setSubmitted(false);
            form.reset();
          }}
        >
          Nouvelle demande
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="font-display text-xl font-bold mb-6">Demande de renseignements</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet</FormLabel>
                <FormControl>
                  <Input placeholder="Votre nom" {...field} />
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
                  <FormLabel>Matricule</FormLabel>
                  <FormControl>
                    <Input placeholder="Matricule" {...field} />
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
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="Téléphone" {...field} />
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
                <FormLabel>Produit souhaité</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un produit" />
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
                        <SelectItem value="fetes">Crédit Fêtes</SelectItem>
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
                <FormLabel>{category === "épargne" ? "Montant à épargner (FCFA)" : "Montant souhaité (FCFA)"}</FormLabel>
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
                <FormLabel>Message (Optionnel)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Précisez votre besoin..." className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90">
            Envoyer ma demande
          </Button>
        </form>
      </Form>
    </div>
  );
};
