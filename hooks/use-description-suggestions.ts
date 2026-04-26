"use client";

import { useCallback, useRef, useState } from "react";
import { suggestFromDescription } from "@/app/actions/suggest/from-description";

interface CategorySuggestion {
  categoryId: string;
  slug: string;
  count: number;
}

interface SuggestionState {
  categories: CategorySuggestion[];
  storeName: string | null;
  isLoading: boolean;
}

export function useDescriptionSuggestions() {
  const [state, setState] = useState<SuggestionState>({
    categories: [],
    storeName: null,
    isLoading: false,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback((description: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!description || description.length < 2) {
      setState({ categories: [], storeName: null, isLoading: false });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    debounceRef.current = setTimeout(async () => {
      const result = await suggestFromDescription(description);
      if (result.success) {
        setState({
          categories: result.data.categories,
          storeName: result.data.storeName,
          isLoading: false,
        });
      } else {
        setState({ categories: [], storeName: null, isLoading: false });
      }
    }, 300);
  }, []);

  const clearSuggestions = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setState({ categories: [], storeName: null, isLoading: false });
  }, []);

  return {
    ...state,
    fetchSuggestions,
    clearSuggestions,
  };
}
