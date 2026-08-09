"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { CartItem } from "@/lib/types";

export interface PrefillAddress {
  email: string;
  name: string;
  street: string;
  zip: string;
  city: string;
}

/**
 * Legt die noch verfügbaren Artikel der Bestellung erneut in den Warenkorb
 * und übergibt die Lieferadresse an den Checkout — der Kunde muss nichts
 * abtippen, kann aber alles ändern.
 */
export default function ReorderButton({
  items,
  address,
  skipped,
}: {
  items: Omit<CartItem, "qty">[] & { qty?: number }[];
  address: PrefillAddress;
  skipped: number;
}) {
  const { add } = useCart();
  const router = useRouter();

  function reorder() {
    try {
      sessionStorage.setItem("jizai_prefill", JSON.stringify(address));
    } catch {
      /* Privater Modus o. Ä. — dann füllt der Kunde die Adresse selbst aus */
    }
    for (const item of items) {
      const { qty = 1, ...rest } = item;
      add(rest as Omit<CartItem, "qty">, qty);
    }
    router.push("/checkout");
  }

  if (items.length === 0) {
    return (
      <p className="ord-note">
        Keine Artikel dieser Bestellung sind aktuell bestellbar.
      </p>
    );
  }

  return (
    <div className="ord-reorder">
      <button className="btn-seal" onClick={reorder} data-hover>
        Nochmals bestellen
      </button>
      {skipped > 0 && (
        <p className="ord-note">
          {skipped === 1 ? "Ein Artikel ist" : `${skipped} Artikel sind`} derzeit nicht
          bestellbar und {skipped === 1 ? "wurde" : "wurden"} ausgelassen.
        </p>
      )}
    </div>
  );
}
