"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseFirestoreAccount } from "@/lib/finance";
import type { AccountRecord } from "@/types/finance";

export function useAccounts(
  uid: string | undefined,
): { accounts: AccountRecord[]; loading: boolean } {
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      queueMicrotask(() => {
        setAccounts([]);
        setLoading(false);
      });
      return;
    }
    queueMicrotask(() => {
      setLoading(true);
    });
    const q = query(collection(db, `users/${uid}/accounts`));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: AccountRecord[] = [];
        snapshot.docs.forEach((d) => {
          const parsed = parseFirestoreAccount(
            d.id,
            d.data() as Record<string, unknown>,
          );
          if (parsed) list.push(parsed);
        });
        setAccounts(list);
        setLoading(false);
      },
      (error) => {
        console.error("[useAccounts] Erro no snapshot:", error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [uid]);

  return { accounts, loading };
}
