import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Swipeable } from "react-native-gesture-handler";
import { KeyboardAvoidingView, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

/* ===============================
   ADMIN NEWS
================================ */
export default function AdminNews() {
  const [news, setNews] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  // form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [image, setImage] = useState("");
  const [isActive, setIsActive] = useState(true);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
    }
  };

  /* ===============================
     FETCH
  ================================ */
  const fetchNews = async () => {
    const { data } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    setNews(data || []);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  /* ===============================
     OPEN EDIT
  ================================ */
  const openEdit = (item: any) => {

    setEditing(item);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setContent(item.content || "");
    setType(item.type || "news");
    setHashtag(item.hashtag || "");
    setImage(item.image || "");
    setIsActive(item.is_active);
  };

  /* ===============================
     UPDATE
  ================================ */
  const handleUpdate = async () => {
    if (!editing) return;

    const { error } = await supabase
      .from("news")
      .update({
        title,
        description: description || null,
        content: content || null,
        type,
        hashtag: hashtag || null,
        image: image || null,
        is_active: isActive,
      })
      .eq("id", editing.id);

    if (error) {
      Alert.alert("Lỗi", error.message);
      return;
    }

    setEditing(null);
    fetchNews();
  };

  /* ===============================
     DELETE
  ================================ */
  const handleDelete = (id: string) => {
    Alert.alert("Xoá tin tức?", "Không thể hoàn tác", [
      { text: "Huỷ" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          await supabase.from("news").delete().eq("id", id);
          fetchNews();
        },
      },
    ]);
  };

  /* ===============================
     SWIPE ACTION
  ================================ */
  const renderRightActions = (id: string) => (
    <View className="h-full">
      <Pressable
        onPress={() => handleDelete(id)}
        className="bg-red-600 h-full w-20 items-center justify-center"
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text className="text-white text-xs mt-1">Xoá</Text>
      </Pressable>
    </View>
  );

  /* ===============================
     RENDER ITEM
  ================================ */
  const renderItem = ({ item }: any) => {
    return (
      <View className="mx-4 mb-4 rounded-2xl overflow-hidden bg-white border border-gray-100">
        <Swipeable
          renderRightActions={() => renderRightActions(item.id)}
          overshootRight={false}
        >
          <Pressable
            onPress={() => openEdit(item)}
            className="p-4 bg-white"
          >
            <View className="flex-row gap-4">
              {/* IMAGE */}
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  className="w-20 h-28 rounded-xl bg-gray-100"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-20 h-20 rounded-xl bg-gray-100 items-center justify-center">
                  <Ionicons
                    name="image-outline"
                    size={24}
                    color="#9ca3af"
                  />
                </View>
              )}

              {/* CONTENT */}
              <View className="flex-1">
                <Text className="font-bold text-[#1b4f94] text-lg">
                  {item.title}
                </Text>

                {item.description && (
                  <Text
                    className="text-sm text-gray-500 mt-1"
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                )}

                <Text className="text-xs text-gray-400 mt-1">
                  {item.type || "news"} ·{" "}
                  {item.is_active ? "Hiển thị" : "Ẩn"}
                </Text>
              </View>
            </View>
          </Pressable>
        </Swipeable>
      </View>
    );
  };

  /* ===============================
     UI
  ================================ */
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* ===== HEADER ===== */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-300">
        <Text className="text-2xl font-bold text-[#1c4273]">
          QUẢN LÝ TIN TỨC - ƯU ĐÃI
        </Text>

        <Pressable onPress={() => router.push("/(admin)/news/create")}>
          <Ionicons name="add-circle" size={28} color="#1c4273" />
        </Pressable>
      </View>

      {/* ===== LIST ===== */}
      <FlatList
        data={news}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
      />

      {/* ===== EDIT MODAL ===== */}
      <Modal visible={!!editing} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* OVERLAY – tap ngoài để đóng */}
          <Pressable
            className="flex-1 bg-black/40 justify-end"
            onPress={() => setEditing(null)}
          >
            {/* MODAL CONTENT */}
            <Pressable
              onPress={() => { }}
              className="bg-white rounded-t-3xl p-5 max-h-[90%]"
            >
              {/* ===== HEADER ===== */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-[#1b4f94]">
                  Chỉnh sửa tin tức
                </Text>
                <Pressable
                  onPress={() => setEditing(null)}
                  className="bg-gray-200 rounded-full p-1"
                >
                  <Ionicons name="close" size={22} color="#1b4f94" />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* ===== IMAGE SECTION ===== */}
                <Text className="text-base font-bold text-[#1b4f94] mb-2">
                  Ảnh đại diện
                </Text>

                <View className="h-40 rounded-2xl bg-gray-100 overflow-hidden items-center justify-center mb-3">
                  {image ? (
                    <Image
                      source={{ uri: image }}
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons name="image-outline" size={36} color="#9ca3af" />
                  )}
                </View>

                <View className="flex-row gap-3 mb-4">
                  <Pressable
                    onPress={pickImage}
                    className="flex-1 border border-gray-200 rounded-xl py-2 items-center"
                  >
                    <Text className="text-base text-[#1b4f94]">
                      Chọn ảnh từ máy
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setImage("")}
                    className="flex-1 border border-gray-200 rounded-xl py-2 items-center"
                  >
                    <Text className="text-base text-[#1b4f94]">
                      Dán link ảnh
                    </Text>
                  </Pressable>
                </View>

                {/* IMAGE LINK INPUT */}
                <TextInput
                  value={image}
                  onChangeText={setImage}
                  placeholder="https://image-url..."
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="border border-gray-200 rounded-xl p-3 mb-6"
                />

                {/* ===== BASIC INFO ===== */}
                <Text className="text-base font-bold text-[#1b4f94] mb-2">
                  Thông tin cơ bản
                </Text>

                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Tiêu đề"
                  className="border border-gray-200 rounded-xl p-3 mb-3"
                />

                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Mô tả ngắn"
                  className="border border-gray-200 rounded-xl p-3 mb-3"
                />

                {/* ===== CONTENT ===== */}
                <Text className="text-base font-bold text-[#1b4f94] mb-2">
                  Nội dung chi tiết
                </Text>

                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="Nội dung bài viết"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  className="border border-gray-200 rounded-xl p-3 mb-4"
                />

                {/* ===== META ===== */}
                <Text className="text-base font-bold text-[#1b4f94] mb-2">
                  Phân loại
                </Text>

                <View className="flex-row flex-wrap gap-2 mb-4">
                  {/* NEWS */}
                  <Pressable
                    onPress={() => setType("Tin Tức")}
                    className={`px-4 py-2 rounded-full ${type === "Tin Tức"
                      ? "bg-[#1b4f94]" : "bg-gray-200"
                      }`}
                  >
                    <Text
                      className={`text-sm ${type === "Tin Tức" ? "text-white font-bold"
                        : "text-gray-700"
                        }`}
                    >
                      Tin tức
                    </Text>
                  </Pressable>

                  {/* PROMOTION */}
                  <Pressable
                    onPress={() => setType("Khuyến Mãi")}
                    className={`px-4 py-2 rounded-full ${type === "Khuyến Mãi"
                      ? "bg-[#1b4f94]" : "bg-gray-200"
                      }`}
                  >
                    <Text
                      className={`text-sm ${type === "Khuyến Mãi" ? "text-white font-bold"
                        : "text-gray-700"
                        }`}
                    >
                      Khuyến mãi
                    </Text>
                  </Pressable>
                </View>

                <TextInput
                  value={hashtag}
                  onChangeText={setHashtag}
                  placeholder="Hashtag (vd: uudai)"
                  className="border border-gray-200 rounded-xl p-3 mb-4"
                />

                <Pressable
                  onPress={() => setIsActive(!isActive)}
                  className="mb-3"
                >
                  <Text
                    className={`font-semibold ${isActive ? "text-green-600" : "text-gray-500"
                      }`}
                  >
                    Trạng thái: {isActive ? "Hiển thị" : "Ẩn"}
                  </Text>
                </Pressable>

                {/* ===== SAVE ===== */}
                <Pressable
                  onPress={handleUpdate}
                  className="bg-[#1b4f94] py-3 rounded-xl items-center mb-6"
                >
                  <Text className="text-white font-bold text-base">
                    Lưu thay đổi
                  </Text>
                </Pressable>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>


    </SafeAreaView>
  );
}
