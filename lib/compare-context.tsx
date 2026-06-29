"use client";

import { createContext, useContext, useState, useCallback } from "react";

export interface CompareVehicle {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandSlug: string;
  type: string;
  price: string;
  image: string;
}

interface CompareContextType {
  vehicles: CompareVehicle[];
  add: (v: CompareVehicle) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  canAdd: boolean;
}

const CompareContext = createContext<CompareContextType>({
  vehicles: [],
  add: () => {},
  remove: () => {},
  clear: () => {},
  has: () => false,
  canAdd: true,
});

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<CompareVehicle[]>([]);

  const add = useCallback((v: CompareVehicle) => {
    setVehicles((prev) =>
      prev.length >= 3 || prev.some((x) => x.id === v.id) ? prev : [...prev, v]
    );
  }, []);

  const remove = useCallback((id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const clear = useCallback(() => setVehicles([]), []);

  const has = useCallback(
    (id: string) => vehicles.some((v) => v.id === id),
    [vehicles]
  );

  return (
    <CompareContext.Provider
      value={{ vehicles, add, remove, clear, has, canAdd: vehicles.length < 3 }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
