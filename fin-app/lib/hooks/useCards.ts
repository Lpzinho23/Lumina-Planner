"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseFirestoreCard } from "@/lib/finance";
import type { CardRecord } from "@/types/finance";

export function useCards(
  uid: string | undefined,
): { cards: CardRecord[]; loading: boolean } {
  const [cards, setCards] = useState<CardRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      queueMicrotask(() => {
        setCards([]);
        setLoading(false);
      });
      return;
    }
    queueMicrotask(() => {
      setLoading(true);
    });
    const q = query(collection(db, `users/${uid}/cards`));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: CardRecord[] = [];
        snapshot.docs.forEach((d) => {
          const parsed = parseFirestoreCard(
            d.id,
            d.data() as Record<string, unknown>,
          );
          if (parsed) list.push(parsed);
        });
        setCards(list);
        setLoading(false);
      },
      (error) => {
        console.error("[useCards] Erro no snapshot:", error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [uid]);

  return { cards, loading };
}
