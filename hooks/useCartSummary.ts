import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useCartSummary(userId: string | null) {
    const [totalQty, setTotalQty] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const fetchSummary = async () => {
        if (!userId) {
            setTotalQty(0);
            setTotalPrice(0);
            return;
        }

        const { data, error } = await supabase
            .from("cart_items")
            .select("quantity, total_price")
            .eq("user_id", userId);

        if (!error && data) {
            setTotalQty(data.reduce((s, i) => s + i.quantity, 0));
            setTotalPrice(data.reduce((s, i) => s + i.total_price, 0));
        }
    };


    useEffect(() => {
        let mounted = true;

        const run = async () => {
            await fetchSummary();
        };

        run();

        return () => {
            mounted = false;
        };
    }, [userId]);


    return { totalQty, totalPrice, refresh: fetchSummary };
}
