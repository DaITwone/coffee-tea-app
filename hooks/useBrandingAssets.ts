import { useEffect, useState } from "react";
import { Image } from "react-native";
import { supabase } from "@/lib/supabaseClient";

/* ===============================
   IMAGE HELPER
================================ */
const getPublicImageUrl = (path?: string | null) => {
  if (!path) return null;
  return supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
};

/* ===============================
   BRANDING ASSETS HOOK
================================ */
export function useBrandingAssets() {
  const [background, setBackground] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchBranding = async () => {
      const { data, error } = await supabase
        .from("app_brandings")
        .select("background_uri, logo_uri")
        .eq("is_active", true)
        .single();

      if (!error && mounted && data) {
        setBackground(data.background_uri ?? null);
        setLogo(data.logo_uri ?? null);
      }

      mounted && setLoading(false);
    };

    fetchBranding();

    return () => {
      mounted = false;
    };
  }, []);

  const backgroundUrl = background ? getPublicImageUrl(background) : null;
  const logoUrl = logo ? getPublicImageUrl(logo) : null;

  /* ===============================
     PREFETCH BRANDING ASSETS
  ================================ */
  useEffect(() => {
    if (backgroundUrl) {
      Image.prefetch(backgroundUrl);
    }
  }, [backgroundUrl]);

  useEffect(() => {
    if (logoUrl) {
      Image.prefetch(logoUrl);
    }
  }, [logoUrl]);

  return {
    backgroundUrl,
    logoUrl,
    loading,
  };
}
