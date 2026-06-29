"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseFirestoreTransaction } from "@/lib/finance";
import type { TransactionRecord } from "@/types/finance";

export function useTransactions(
  uid: string | undefined,
): { transactions: TransactionRecord[]; loading: boolean } {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      queueMicrotask(() => {
        setTransactions([]);
        setLoading(false);
      });
      return;
    }
    queueMicrotask(() => {
      setLoading(true);
    });
    const q = query(
      collection(db, `users/${uid}/transactions`),
      orderBy("date", "desc"),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: TransactionRecord[] = [];
        snapshot.docs.forEach((d) => {
          const parsed = parseFirestoreTransaction(d.id, d.data());
          if (parsed) list.push(parsed);
        });
        setTransactions(list);
        setLoading(false);
      },
      (error) => {
        console.error("[useTransactions] Erro no snapshot:", error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [uid]);

  return { transactions, loading };
}
