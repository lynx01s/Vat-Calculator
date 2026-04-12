"use client";
import { useState, useCallback } from "react";

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = ++_id;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 2800);
  }, []);

  return { toasts, push };
}
