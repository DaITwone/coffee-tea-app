import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabaseClient";

const LAST_SEEN_KEY = "last_seen_notification";

type NotificationItem = {
  id: string;
  title: string;
  type: "news" | "product";
  created_at: string;
};

export function useNotifications() {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  /* ================= LOAD INIT ================= */

  const loadNotifications = async () => {
    const lastSeen =
      (await AsyncStorage.getItem(LAST_SEEN_KEY)) ??
      "1970-01-01T00:00:00Z";

    const [{ data: news }, { data: products }] = await Promise.all([
      supabase
        .from("news")
        .select("id, title, created_at")
        .eq("is_active", true)
        .gt("created_at", lastSeen),

      supabase
        .from("products")
        .select("id, name, created_at")
        .gt("created_at", lastSeen),
    ]);

    const mappedNews =
      news?.map((n) => ({
        id: n.id,
        title: `📰 ${n.title}`,
        type: "news" as const,
        created_at: n.created_at,
      })) ?? [];

    const mappedProducts =
      products?.map((p) => ({
        id: p.id,
        title: `🍹 Món mới: ${p.name}`,
        type: "product" as const,
        created_at: p.created_at,
      })) ?? [];

    const merged = [...mappedNews, ...mappedProducts].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );

    setNotifications(merged);
    setCount(merged.length);
  };

  /* ================= REALTIME ================= */

  useEffect(() => {
    loadNotifications();

    // 🔔 News realtime
    const newsChannel = supabase
      .channel("realtime-news")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "news",
        },
        (payload) => {
          const record = payload.new;

          if (!record.is_active) return;

          setCount((c) => c + 1);
          setNotifications((prev) => [
            {
              id: record.id,
              title: `📰 ${record.title}`,
              type: "news",
              created_at: record.created_at,
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    // 🔔 Products realtime
    const productChannel = supabase
      .channel("realtime-products")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "products",
        },
        (payload) => {
          const record = payload.new;

          setCount((c) => c + 1);
          setNotifications((prev) => [
            {
              id: record.id,
              title: `🍹 Món mới: ${record.name}`,
              type: "product",
              created_at: record.created_at,
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(newsChannel);
      supabase.removeChannel(productChannel);
    };
  }, []);

  /* ================= MARK READ ================= */

  const markAllAsRead = async () => {
    await AsyncStorage.setItem(
      LAST_SEEN_KEY,
      new Date().toISOString()
    );
    setCount(0);
  };

  return {
    count,
    notifications,
    reload: loadNotifications,
    markAllAsRead,
  };
}
