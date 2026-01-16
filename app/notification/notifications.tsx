import { useNotifications } from "@/contexts/NotificationsContext";
import { useThemeBackground } from "@/hooks/useThemeBackground";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  ImageBackground,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const { notifications, markAllAsRead, markAsRead } = useNotifications();
  const { bgUrl } = useThemeBackground();

  const handlePressNotification = async (item: any) => {
    // 1. Đánh dấu đã đọc (UX chuẩn)
    if (!item.is_read) {
      await markAsRead(item.id);
    }

    // 2. Điều hướng theo loại notification
    if (item.target_type === 'news') {
      router.push(`/new/${item.target_id}`);
    }

    if (item.target_type === 'product') {
      router.push(`/product/${item.target_id}`);
    }

  };


  const renderItem = ({ item }: any) => {
    const isUnread = !item.is_read;

    return (
      <Pressable
        onPress={() => handlePressNotification(item)}
        className="mb-4 rounded-2xl overflow-hidden active:opacity-90"
      >
        <View
          className={`p-4 ${isUnread ? "bg-blue-50" : "bg-white/85"
            }`}
        >
          {/* ===== Title ===== */}
          <View className="flex-row items-start">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${isUnread ? "bg-blue-100" : "bg-gray-100"
                }`}
            >
              <Ionicons
                name={
                  item.type === "news"
                    ? "newspaper-outline"
                    : "fast-food-outline"
                }
                size={20}
                color="#1F4171"
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-[#1b4f94]">
                {item.title}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {item.content}
              </Text>
            </View>

            {/* ===== Dot unread ===== */}
            {isUnread && (
              <View className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
            )}
          </View>

          {/* ===== Time ===== */}
          <Text className="text-[11px] text-gray-400 mt-3">
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      </Pressable>

    );
  };

  return (
    <>
      {bgUrl && (
        <ImageBackground
          source={{ uri: bgUrl }}
          resizeMode="cover"
          className="flex-1"
        >
          {/* Overlay */}
          <View className="absolute inset-0 bg-white/60" />

          <SafeAreaView edges={["top"]} className="flex-1">
            {/* ===== HEADER ===== */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => router.back()}
                  className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 active:scale-95"
                >
                  <Ionicons name="arrow-back" size={22} color="#1F4171" />
                </Pressable>

                <View className="ml-3">
                  <Text className="text-2xl font-bold text-blue-900">
                    Thông báo
                  </Text>
                  <Text className="text-gray-500 text-base">
                    Cập nhật mới nhất cho bạn
                  </Text>
                </View>
              </View>
            </View>

            {/* ===== CONTENT ===== */}
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16 }}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              ListEmptyComponent={
                <View className="items-center py-20">
                  <Ionicons
                    name="notifications-outline"
                    size={48}
                    color="#9ca3af"
                  />
                  <Text className="mt-4 text-gray-600">
                    Bạn chưa có thông báo nào
                  </Text>
                </View>
              }
            />
          </SafeAreaView>
        </ImageBackground>
      )}
    </>
  );
}
