import { createContext, useContext } from "react";

type CartContextType = {
    refreshCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = CartContext.Provider;

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used within CartProvider");
    }
    return ctx;
};
