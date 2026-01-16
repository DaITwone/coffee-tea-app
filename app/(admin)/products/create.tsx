import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Image,
  SafeAreaView,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

/* ===============================
   HELPER: GET PUBLIC IMAGE URL
   =============================== */
const getPublicImageUrl = (path?: string | null) => {
  if (!path) return null;

  const { data } = supabase.storage
    .from("products")
    .getPublicUrl(path);

  return data.publicUrl;
};

export default function CreateProduct() {
  const [name, setName] = useState("");
  const [stats, setStats] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [image, setImage] = useState<string | null>(null); // file:// | url | null
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");

      setCategories(data || []);
    };

    fetchCategories();
  }, []);


  /* ===============================
     IMAGE PICKER
     =============================== */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setIsLinkMode(false);
    }
  };

  /* ===============================
     CREATE PRODUCT
     =============================== */
  const handleCreate = async () => {
    if (!name || !price) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên và giá sản phẩm");
      return;
    }

    let imagePath: string | null = null;

    // upload nếu là ảnh local
    if (image && image.startsWith("file://")) {
      const res = await fetch(image);
      const blob = await res.blob();
      const filePath = `${Date.now()}.png`;

      await supabase.storage
        .from("products")
        .upload(filePath, blob, {
          upsert: true,
          contentType: "image/png",
        });

      imagePath = filePath;
    } else if (image) {
      // link ảnh
      imagePath = image;
    }

    const { error } = await supabase.from("products").insert({
      name,
      stats,
      price: Number(price),
      sale_price: salePrice ? Number(salePrice) : null,
      image: imagePath,
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
        <Text className="text-2xl font-bold text-[#1c4273]">
          THÊM SẢN PHẨM
        </Text>

        <Pressable onPress={() => router.back()} className="bg-gray-200 rounded-full p-1">
          <Ionicons name="close" size={22} color="#1b4f94" />
        </Pressable>
      </View>

      <View className="px-5 pt-5">
        {/* ===== IMAGE PREVIEW ===== */}
        <View className="mb-4">
          <View className="h-40 rounded-2xl bg-gray-100 overflow-hidden items-center justify-center">
            {image ? (
              <Image
                source={{
                  uri: image.startsWith("file://")
                    ? image
                    : getPublicImageUrl(image) || image,
                }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="image-outline" size={36} color="#9ca3af" />
            )}
          </View>

          {/* IMAGE ACTIONS */}
          <View className="flex-row gap-3 mt-3">
            <Pressable
              onPress={pickImage}
              className="flex-1 border border-gray-200 rounded-xl py-2 items-center"
            >
              <Text className="text-sm text-[#082841]">
                Chọn ảnh
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setImage("");
                setIsLinkMode(true);
              }}
              className="flex-1 border border-gray-200 rounded-xl py-2 items-center"
            >
              <Text className="text-sm text-[#082841]">
                Dán link ảnh
              </Text>
            </Pressable>
          </View>
        </View>

        {/* IMAGE URL INPUT */}
        {isLinkMode && (
          <TextInput
            placeholder="Dán link ảnh (https://...)"
            className="border border-gray-200 rounded-xl p-3 mb-3"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setImage}
          />
        )}



        {/* FORM */}
        <TextInput
          placeholder="Tên sản phẩm"
          value={name}
          onChangeText={setName}
          className="border border-gray-200 rounded-xl p-3 mb-3"
        />

        <TextInput
          placeholder="Mô tả sản phẩm"
          value={stats}
          onChangeText={setStats}
          className="border border-gray-200 rounded-xl p-3 mb-3"
        />

        <View className="flex-row gap-3">
          <TextInput
            placeholder="Giá"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            className="border border-gray-200 rounded-xl p-3 flex-1"
          />
          <TextInput
            placeholder="Giá sale"
            keyboardType="numeric"
            value={salePrice}
            onChangeText={setSalePrice}
            className="border border-gray-200 rounded-xl p-3 flex-1"
          />
        </View>

        {/* ===== CATEGORY SELECT ===== */}
        <View className="mt-2.5">
          <Text className="text-sm font-semibold text-gray-600 mb-2">
            Danh mục
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {categories.map((cat) => {
              const active = categoryId === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-full ${active ? "bg-[#1b4f94]" : "bg-gray-200"
                    }`}
                >
                  <Text
                    className={`text-sm ${active
                        ? "text-white font-bold"
                        : "text-gray-700"
                      }`}
                  >
                    {cat.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* SUBMIT */}
        <View className="mt-6">
          <Pressable
            onPress={handleCreate}
            className="bg-[#1b4f94] py-3 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="add-outline" size={20} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">
              Thêm sản phẩm
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
