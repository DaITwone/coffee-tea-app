import { Stack, usePathname } from "expo-router";
import "../global.css";
import { View } from "react-native";
import { CartProvider } from "../contexts/CartContext";
import { FloatingCart } from "../components/FloatingCart";
import { useCartSummary } from "../hooks/useCartSummary";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { NotificationProvider } from "@/contexts/NotificationsContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function AppContent() {
  const { userId, loading } = useAuth();
  const pathname = usePathname();

  const { totalQty, totalPrice, refresh } = useCartSummary(userId);
  const [showFloatingCart, setShowFloatingCart] = useState(false);

  const isCartScreen = pathname.startsWith("/cart");

  useEffect(() => {
    if (totalQty > 0 && !isCartScreen) {
      setShowFloatingCart(false);
      const timer = setTimeout(() => setShowFloatingCart(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowFloatingCart(false);
    }
  }, [totalQty, isCartScreen]);

  if (loading) return null;

  return (
    <CartProvider value={{ refreshCart: refresh }}>
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="cart/cart" />
        </Stack>

        {showFloatingCart && (
          <FloatingCart
            totalQty={totalQty}
            totalPrice={totalPrice}
          />
        )}
      </View>
    </CartProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NotificationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationProvider>
    </GestureHandlerRootView >
  );
}
