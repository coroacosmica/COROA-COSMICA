"use client";

import { createContext, useContext } from "react";
import type { Category } from "@/lib/products";

const CategoryContext = createContext<Category[]>([]);

export function CategoryProvider({
  categories,
  children,
}: {
  categories: Category[];
  children: React.ReactNode;
}) {
  return (
    <CategoryContext.Provider value={categories}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoryContext);
}
