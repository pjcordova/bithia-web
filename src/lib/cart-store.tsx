"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  productoId: string;
  codigoLote: string;
  nombre: string;
  talla: string;
  precio: number;
  cantidad: number;
  imagenUrl: string | null;
};

const STORAGE_KEY = "bithia_carrito_v1";

/** Una prenda en dos tallas distintas son dos líneas separadas. */
function mismaLinea(a: CartItem, b: Pick<CartItem, "productoId" | "talla">) {
  return a.productoId === b.productoId && a.talla === b.talla;
}

type CartContextValue = {
  items: CartItem[];
  total: number;
  cantidadTotal: number;
  /** true una vez leído localStorage — evita parpadeo del contador al hidratar. */
  listo: boolean;
  agregar: (item: CartItem) => void;
  cambiarCantidad: (productoId: string, talla: string, delta: number) => void;
  quitar: (productoId: string, talla: string) => void;
  vaciar: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function leerAlmacenado(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const crudo = window.localStorage.getItem(STORAGE_KEY);
    if (!crudo) return [];
    const parsed: unknown = JSON.parse(crudo);
    if (!Array.isArray(parsed)) return [];
    // Filtra entradas corruptas o de una versión anterior del formato.
    return parsed.filter(
      (i): i is CartItem =>
        typeof i?.productoId === "string" &&
        typeof i?.talla === "string" &&
        typeof i?.precio === "number" &&
        typeof i?.cantidad === "number"
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [listo, setListo] = useState(false);

  // El carrito se lee después del montaje: en el servidor no existe
  // localStorage y leerlo durante el render rompería la hidratación.
  useEffect(() => {
    setItems(leerAlmacenado());
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, listo]);

  const agregar = useCallback((nuevo: CartItem) => {
    setItems((actuales) => {
      const existente = actuales.find((i) => mismaLinea(i, nuevo));
      if (!existente) return [...actuales, nuevo];
      return actuales.map((i) =>
        mismaLinea(i, nuevo) ? { ...i, cantidad: i.cantidad + nuevo.cantidad } : i
      );
    });
  }, []);

  const cambiarCantidad = useCallback(
    (productoId: string, talla: string, delta: number) => {
      setItems((actuales) =>
        actuales.flatMap((i) => {
          if (!mismaLinea(i, { productoId, talla })) return [i];
          const cantidad = i.cantidad + delta;
          // Bajar de 1 elimina la línea.
          return cantidad < 1 ? [] : [{ ...i, cantidad }];
        })
      );
    },
    []
  );

  const quitar = useCallback((productoId: string, talla: string) => {
    setItems((actuales) =>
      actuales.filter((i) => !mismaLinea(i, { productoId, talla }))
    );
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const cantidadTotal = items.reduce((s, i) => s + i.cantidad, 0);
    return {
      items,
      total,
      cantidadTotal,
      listo,
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
    };
  }, [items, listo, agregar, cambiarCantidad, quitar, vaciar]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
