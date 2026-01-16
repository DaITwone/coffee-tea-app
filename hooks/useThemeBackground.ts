import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Image } from "react-native";

/* ===============================
   IMAGE HELPER
================================ */
const getPublicImageUrl = (path?: string | null) => {
  if (!path) return null;
  return supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
};

/* ===============================
   THEME BACKGROUND HOOK
================================ */
export function useThemeBackground() {
  const [themeBg, setThemeBg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchTheme = async () => {
      const { data, error } = await supabase
        .from("app_themes")
        .select("background_uri")
        .eq("is_active", true)
        .single();

      if (!error && mounted && data?.background_uri) {
        setThemeBg(data.background_uri);
      }

      mounted && setLoading(false);
    };

    fetchTheme();

    return () => {
      mounted = false;
    };
  }, []);

  const bgUrl = themeBg ? getPublicImageUrl(themeBg) : null;

  /* ===============================
     PREFETCH BACKGROUND
  ================================ */
  useEffect(() => {
    if (!bgUrl) return;
    Image.prefetch(bgUrl);
  }, [bgUrl]);

  return {
    bgUrl,
    loading,
  };
}
