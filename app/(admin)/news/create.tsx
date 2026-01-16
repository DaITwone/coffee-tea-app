import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function CreateNews() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [type, setType] = useState<"news" | "promotion">("news");

  // image state
  const [image, setImage] = useState<string>(""); // file:// hoặc url
  const [isLinkMode, setIsLinkMode] = useState(true);

  /* ===============================
     PICK IMAGE (LOCAL)
  ================================ */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // file://
      setIsLinkMode(false);
    }
  };

  /* ===============================
     CREATE NEWS
  ================================ */
  const handleCreate = async () => {
    if (!title) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề");
      return;
    }

    let imagePath: string | null = null;

    // upload ảnh local
    if (image && image.startsWith("file://")) {
      const res = await fetch(image);
      const blob = await res.blob();
      const filePath = `news-${Date.now()}.png`;

      const { error: uploadError } = await supabase.storage
        .from("news") // ⚠️ bucket news
        .upload(filePath, blob, {
          upsert: true,
          contentType: "image/png",
        });

      if (uploadError) {
        Alert.alert("Lỗi upload ảnh", uploadError.message);
        return;
      }

      imagePath = filePath; // lưu PATH
    } else if (image) {
      // link ảnh
      imagePath = image;
    }

    const { error } = await supabase.from("news").insert({
      title,
      description: description || null,
      content: content || null,
      image: imagePath,
      type,
      hashtag: hashtag || null,
    });

    if (error) {
      Alert.alert("Lỗi", error.message);
      return;
    }

    router.back();
  };

  /* ===============================
     UI
  ================================ */
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* ===== HEADER ===== */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-300">
        <Text className="text-2xl font-bold text-[#1c4273]">
          THÊM TIN TỨC - ƯU ĐÃI
        </Text>

        <Pressable
          onPress={() => router.back()}
          className="bg-gray-200 rounded-full p-1"
        >
          <Ionicons name="close" size={22} color="#1b4f94" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ===== IMAGE ===== */}
        <View className="mb-4">
          <View className="h-40 rounded-2xl bg-gray-100 overflow-hidden items-center justify-center">
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-full h-full"
                resizeMode="contain"
              />
            ) : (
              <Ionicons
                name="image-outline"
                size={36}
                color="#9ca3af"
              />
            )}
          </View>

          {/* IMAGE ACTIONS */}
          <View className="flex-row gap-3 mt-3">
            <Pressable
              onPress={pickImage}
              className="flex-1 border border-gray-200 rounded-xl py-2 items-center"
            >
              <Text className="text-sm text-[#1b4f94]">
                Chọn ảnh từ máy
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setImage("");
                setIsLinkMode(true);
              }}
              className="flex-1 border border-gray-200 rounded-xl py-2 items-center"
            >
              <Text className="text-sm text-[#1b4f94]">
                Dán link ảnh
              </Text>
            </Pressable>
          </View>
        </View>

        {/* IMAGE LINK INPUT */}
        {isLinkMode && (
          <TextInput
            placeholder="Link ảnh (https://...)"
            value={image}
            onChangeText={setImage}
            autoCapitalize="none"
            autoCorrect={false}
            className="border border-gray-200 rounded-xl p-3 mb-4"
          />
        )}

        {/* ===== FORM ===== */}
        <TextInput
          placeholder="Tiêu đề"
          value={title}
          onChangeText={setTitle}
          className="border border-gray-200 rounded-xl p-3 mb-3"
        />

        <TextInput
          placeholder="Mô tả ngắn"
          value={description}
          onChangeText={setDescription}
          className="border border-gray-200 rounded-xl p-3 mb-3"
        />

        <TextInput
          placeholder="Nội dung chi tiết"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          className="border border-gray-200 rounded-xl p-3 mb-3"
        />

        <TextInput
          placeholder="Hashtag (vd: uudai)"
          value={hashtag}
          onChangeText={setHashtag}
          className="border border-gray-200 rounded-xl p-3 mb-4"
        />

        {/* ===== TYPE SELECT ===== */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          <Pressable
            onPress={() => setType("news")}
            className={`px-4 py-2 rounded-full ${type === "news"
                ? "bg-[#1b4f94]"
                : "bg-gray-200"
              }`}
          >
            <Text
              className={`text-sm ${type === "news"
                  ? "text-white font-bold"
                  : "text-gray-700"
                }`}
            >
              Tin tức
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setType("promotion")}
            className={`px-4 py-2 rounded-full ${type === "promotion"
                ? "bg-[#1b4f94]"
                : "bg-gray-200"
              }`}
          >
            <Text
              className={`text-sm ${type === "promotion"
                  ? "text-white font-bold"
                  : "text-gray-700"
                }`}
            >
              Khuyến mãi
            </Text>
          </Pressable>
        </View>

        {/* ===== SUBMIT ===== */}
        <Pressable
          onPress={handleCreate}
          className="bg-[#1b4f94] py-3 rounded-xl flex-row items-center justify-center mb-10"
        >
          <Ionicons name="add-outline" size={20} color="#fff" />
          <Text className="text-white font-semibold text-lg ml-2">
            Đăng tin
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
