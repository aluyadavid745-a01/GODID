'use client'
import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import type { StoreSettings } from "../types/domain";

let cache: StoreSettings | null = null;

export const useSiteConfig = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(cache);

  useEffect(() => {
    if (cache) return;
    adminApi.settings().then((s) => {
      cache = s;
      setSettings(s);
    });
  }, []);

  return { navLogo: settings?.navLogo ?? "" };
};
