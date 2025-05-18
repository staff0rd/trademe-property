import { atom, useAtom } from "jotai";
import { loadable } from "jotai/utils";
import type { PropertyRecord } from "@staff0rd/shared/types";
import type { SortField, SortOrder } from "@staff0rd/shared/data";

// Base atoms
export const selectedCategoryAtom = atom<string>("");
export const sortByAtom = atom<SortField>("price");
export const orderAtom = atom<SortOrder>("asc");

// Async atoms with loadable
const categoriesBaseAtom = atom<Promise<string[]>>(async () => {
  const response = await fetch("http://localhost:3000/api/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
});

export const categoriesAtom = loadable(categoriesBaseAtom);

const propertiesBaseAtom = atom(async (get) => {
  const selectedCategory = get(selectedCategoryAtom);
  const sortBy = get(sortByAtom);
  const order = get(orderAtom);

  if (!selectedCategory) return [];

  const params = new URLSearchParams();
  if (sortBy) params.append("sortBy", sortBy);
  params.append("order", order);

  const response = await fetch(
    `http://localhost:3000/api/properties/${selectedCategory}?${params}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch properties");
  }
  return response.json() as Promise<PropertyRecord[]>;
});

export const propertiesAtom = loadable(propertiesBaseAtom);

// Custom hooks
export const useCategories = () => {
  const [categoriesLoadable] = useAtom(categoriesAtom);
  const [selectedCategory, setSelectedCategory] = useAtom(selectedCategoryAtom);

  // Initialize selected category when categories load
  if (
    categoriesLoadable.state === "hasData" &&
    !selectedCategory &&
    categoriesLoadable.data.length > 0
  ) {
    setSelectedCategory(categoriesLoadable.data[0]);
  }

  return {
    categories:
      categoriesLoadable.state === "hasData" ? categoriesLoadable.data : [],
    loading: categoriesLoadable.state === "loading",
    error:
      categoriesLoadable.state === "hasError"
        ? categoriesLoadable.error instanceof Error
          ? categoriesLoadable.error.message
          : "An error occurred"
        : null,
    selectedCategory,
    setSelectedCategory,
  };
};

export const useProperties = () => {
  const [propertiesLoadable] = useAtom(propertiesAtom);
  const [sortBy, setSortBy] = useAtom(sortByAtom);
  const [order, setOrder] = useAtom(orderAtom);

  return {
    properties:
      propertiesLoadable.state === "hasData" ? propertiesLoadable.data : [],
    loading: propertiesLoadable.state === "loading",
    error:
      propertiesLoadable.state === "hasError"
        ? propertiesLoadable.error instanceof Error
          ? propertiesLoadable.error.message
          : "An error occurred"
        : null,
    sortBy,
    setSortBy,
    order,
    setOrder,
  };
};
