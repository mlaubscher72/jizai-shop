import type { Metadata } from "next";
import ProductView from "@/components/pages/ProductView";
import { db } from "@/lib/db";
import { langAlternates, productDescription, t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.getProductBySlug(slug);
  return {
    title: product ? `${product.name} — JIZAI` : t("en").metaTitle,
    description: product ? productDescription(product, "en") : t("en").metaDescription,
    alternates: langAlternates("en", `/product/${slug}`),
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductView lang="en" slug={slug} />;
}
