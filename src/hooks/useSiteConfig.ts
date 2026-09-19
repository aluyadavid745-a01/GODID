'use client'
import { useEffect, useState } from "react";
import { adminApi } from "../services/api";

export const useSiteConfig = () => {
  const [navLogo, setNavLogo] = useState("");

  useEffect(() => {
    adminApi.settings().then((s) => setNavLogo(s.navLogo ?? ""));
  }, []);

  return { navLogo };
};
