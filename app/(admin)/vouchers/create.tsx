import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function CreateVoucher() {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [discountType, setDiscountType] =
    useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("");

  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxUsage, setMaxUsage] = useState("1");
  const [forNewUser, setForNewUser] = useState(false);

  /* ===============================
     CREATE
  ================================ */
  const handleCreate = async () => {
    if (!code || !title || !discountValue) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập mã, tiêu đề và giá trị giảm"
      );
      return;
    }

    const { error } = await supabase.from("vouchers").insert({
      code: code.trim().toUpperCase(),
      title,
      description: description || null,
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_order_value: minOrderValue
        ? Number(minOrderValue)
        : null,
      for_new_user: forNewUser,
      max_usage_per_user: maxUsage
        ? Number(maxUsage)
        : 1,
    });

    if (error) {
      Alert.alert("Lỗi", error.message);
      return;
    }

    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* ===== HEADER ===== */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-300">
        <Text className="text-2xl font-bold text-[#1b4f94]">
          THÊM VOUCHER
        </Text>

        <Pressable
          onPress={() => router.back()}
          className="bg-gray-200 rounded-full p-1"
        >
          <Ionicons name="close" size={22} color="#1b4f94" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= BASIC ================= */}
        <Text className="text-base font-bold text-[#1b4f94] mb-2">
          Thông tin cơ bản
        </Text>

        <TextInput
          placeholder="Mã voucher (VD: SALE10)"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          className="border border-gray-200 rounded-xl p-3 mb-3"
        />

        <TextInput
          placeholder="Tiêu đề"
          value={title}
          onChangeText={setTitle}
          className="border border-gray-200 rounded-xl p-3 mb-3"
        />

        <TextInput
          placeholder="Mô tả"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          className="border border-gray-200 rounded-xl p-3 mb-4"
        />

        {/* ================= DISCOUNT TYPE ================= */}
        <Text className="text-base font-bold text-[#1b4f94] mb-2">
          Loại giảm giá
        </Text>

        <View className="flex-row gap-2 mb-4">
          <Pressable
            onPress={() => setDiscountType("percent")}
            className={`px-4 py-2 rounded-full ${
              discountType === "percent"
                ? "bg-[#1b4f94]"
                : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-sm ${
                discountType === "percent"
                  ? "text-white font-bold"
                  : "text-gray-700"
              }`}
            >
              %
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setDiscountType("fixed")}
            className={`px-4 py-2 rounded-full ${
              discountType === "fixed"
                ? "bg-[#1b4f94]"
                : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-sm ${
                discountType === "fixed"
                  ? "text-white font-bold"
                  : "text-gray-700"
              }`}
            >
              VNĐ
            </Text>
          </Pressable>
        </View>

        {/* ================= VALUES ================= */}
        <Text className="text-base font-bold text-[#1b4f94] mb-2">
          Giá trị & điều kiện
        </Text>

        <TextInput
          placeholder="Giá trị giảm"
          keyboardType="numeric"
          value={discountValue}
          onChangeText={setDiscountValue}
          className="border border-gray-200 rounded-xl p-3 mb-3"
        />

        <TextInput
          placeholder="Đơn tối thiểu (tuỳ chọn)"
          keyboardType="numeric"
          value={minOrderValue}
          onChangeText={setMinOrderValue}
          className="border border-gray-200 rounded-xl p-3 mb-3"
        />

        <TextInput
          placeholder="Số lần dùng / user"
          keyboardType="numeric"
          value={maxUsage}
          onChangeText={setMaxUsage}
          className="border border-gray-200 rounded-xl p-3 mb-4"
        />

        {/* ================= FLAGS ================= */}
        <Text className="text-base font-bold text-[#1b4f94] mb-2">
          Đối tượng & trạng thái
        </Text>

        <Pressable
          onPress={() => setForNewUser(!forNewUser)}
          className="mb-6"
        >
          <Text
            className={`font-semibold ${
              forNewUser
                ? "text-green-600"
                : "text-gray-500"
            }`}
          >
            Chỉ dành cho user mới:{" "}
            {forNewUser ? "Có" : "Không"}
          </Text>
        </Pressable>

        {/* ================= SUBMIT ================= */}
        <Pressable
          onPress={handleCreate}
          className="bg-[#1b4f94] py-3 rounded-xl flex-row items-center justify-center"
        >
          <Ionicons name="add-outline" size={20} color="#fff" />
          <Text className="text-white font-bold text-base ml-2">
            Tạo voucher
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
