import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  totalQty: number;
  totalPrice: number;
};

export function FloatingCart({ totalQty, totalPrice }: Props) {
  const insets = useSafeAreaInsets();

  if (totalQty === 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + 30,
        right: 14,
        zIndex: 50,
      }}
    >
      <Pressable
        onPress={() => router.push("/cart/cart")}
        className="bg-[#1F4171] rounded-2xl px-5 py-3 flex-row items-center gap-2 shadow-lg"
        style={{ opacity: 0.9 }}
      >
        {/* Icon + badge */}
        <View style={{ position: "relative" }}>
          <Ionicons name="cart" size={20} color="white" />

          {/* Badge */}
          <View
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              backgroundColor: "#ef4444",
              borderRadius: 999,
              minWidth: 18,
              height: 18,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 11,
                fontWeight: "bold",
              }}
            >
              {totalQty}
            </Text>
          </View>
        </View>

        {/* Total price */}
        <Text className="text-white font-bold ml-2">
          {totalPrice.toLocaleString("vi-VN")}đ
        </Text>
      </Pressable>
    </View>
  );
}
