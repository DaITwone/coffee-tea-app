import { supabase } from "../lib/supabaseClient";

export type Voucher = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_value: number | null;
  for_new_user: boolean;
};

/* ================= CHECK USER IS NEW ================= */
export const isNewUser = async (userId: string): Promise<boolean> => {
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed");

  return (count ?? 0) === 0;
};

/* ================= LOAD AVAILABLE VOUCHERS ================= */
export const loadAvailableVouchers = async (
  userId: string,
  cartTotal: number
): Promise<Voucher[]> => {
  const { data: vouchers } = await supabase
    .from("vouchers")
    .select("*")
    .eq("is_active", true);

  if (!vouchers) return [];

  const isNew = await isNewUser(userId);

  return vouchers.filter((v) => {
    if (v.for_new_user && !isNew) return false;
    if (v.min_order_value && cartTotal < v.min_order_value) return false;
    return true;
  });
};

/* ================= CALCULATE DISCOUNT ================= */
export const calculateDiscount = (
  voucher: Voucher,
  cartTotal: number
): number => {
  if (voucher.discount_type === "percent") {
    return Math.floor((cartTotal * voucher.discount_value) / 100);
  }
  return voucher.discount_value;
};
