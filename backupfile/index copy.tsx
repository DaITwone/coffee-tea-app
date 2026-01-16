import { View, Text, Pressable, Image, ScrollView, ImageBackground } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState, useCallback } from "react";
import { Dimensions } from "react-native";
import { supabase } from "../lib/supabaseClient";
import { Ionicons } from "@expo/vector-icons";

type HomeNews = {
    id: string;
    title: string;
    image: string | null;
    type: string;
};

type Banner = {
    id: string;
    image: string;
    link?: string | null;
};

type User = {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
};

const { width } = Dimensions.get("window");

export default function HomeScreen() {
    const scrollRef = useRef<ScrollView>(null);
    const [index, setIndex] = useState(0);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [homeNews, setHomeNews] = useState<HomeNews[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Lấy lời chào theo thời gian
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Chào buổi sáng✨";
        if (hour >= 12 && hour < 18) return "Chào buổi chiều✨";
        return "Chào buổi tối✨";
    };

    useEffect(() => {
        fetchBanners();
        fetchHomeNews();

        // Lắng nghe sự thay đổi auth state
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === "SIGNED_IN" && session) {
                    setIsLoggedIn(true);
                    fetchUserProfile(session.user.id);
                } else if (event === "SIGNED_OUT") {
                    setIsLoggedIn(false);
                    setUser(null);
                }
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    // Refresh user mỗi khi screen được focus
    useFocusEffect(
        useCallback(() => {
            checkUser();
        }, [])
    );

    // Kiểm tra user đã đăng nhập chưa
    async function checkUser() {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
            setIsLoggedIn(true);
            fetchUserProfile(session.user.id);
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
    }

    // Lấy thông tin user từ bảng users
    async function fetchUserProfile(userId: string) {
        const { data, error } = await supabase
            .from("users")
            .select("id, username, full_name, avatar_url, email")
            .eq("id", userId)
            .single();

        if (!error && data) {
            setUser(data);
        }
    }

    async function fetchBanners() {
        const { data, error } = await supabase
            .from("banners")
            .select("id, image, link")
            .eq("is_active", true)
            .order("order", { ascending: true });

        if (!error) setBanners(data ?? []);
    }

    useEffect(() => {
        if (banners.length === 0) return;

        const timer = setInterval(() => {
            const nextIndex = (index + 1) % banners.length;
            scrollRef.current?.scrollTo({
                x: nextIndex * width,
                animated: true,
            });
            setIndex(nextIndex);
        }, 3000);

        return () => clearInterval(timer);
    }, [index, banners.length]);

    async function fetchHomeNews() {
        const { data, error } = await supabase
            .from("news")
            .select("id, title, image, type")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(4);

        if (!error) setHomeNews(data ?? []);
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setUser(null);
    };


    return (
        <ImageBackground
            source={require("../../assets/images/bg6.png")}
            resizeMode="cover"
            className="flex-1"
        >
            <View className="flex-1">
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Hero */}
                    {/* Overlay */}
                    <View className="">
                        <SafeAreaView edges={["top"]} className="px-5 py-6">
                            {/* Logo */}
                            <Image
                                source={require("../../assets/images/logo3.png")}
                                className="self-center"
                                style={{ height: 140, width: 210 }}
                                resizeMode="cover"
                            />

                            {/* User Section */}
                            {isLoggedIn && user ? (
                                <View className="bg-white/15 py-4 px-5 rounded-2xl border border-white/20 backdrop-blur">
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-1">
                                            <Pressable onPress={() => router.push("/")}>
                                                {user.avatar_url ? (
                                                    <Image
                                                        source={{ uri: user.avatar_url }}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                ) : (
                                                    <Image
                                                        source={require("../../assets/images/avt.jpg")}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                )}
                                            </Pressable>

                                            <View className="ml-3 flex-1">
                                                <Text className="text-white/70 text-sm">
                                                    {getGreeting()}
                                                </Text>
                                                <Text
                                                    className="text-white font-semibold text-lg"
                                                    numberOfLines={1}
                                                >
                                                    {user.full_name || user.username}
                                                </Text>
                                            </View>
                                        </View>

                                        <Pressable
                                            onPress={() => router.push("/(tabs)/news")}
                                            className="ml-3"
                                        >
                                            <Image
                                                source={require("../../assets/images/logo1.png")}
                                                className="w-14 h-10"
                                            />
                                        </Pressable>
                                    </View>
                                </View>
                            ) : (
                                <Pressable
                                    onPress={() => router.push("/(auth)/login")}
                                    className="bg-white/90 py-4 rounded-xl"
                                >
                                    <Text className="text-center text-[#0E2A47] font-medium">
                                        ĐĂNG NHẬP / ĐĂNG KÝ
                                    </Text>
                                </Pressable>
                            )}
                        </SafeAreaView>
                    </View>
                    {/* Featured */}
                    <View className="bg-white rounded-t-xl">
                        <ImageBackground
                            source={require("../../assets/images/bg12.png")} // ảnh nền của bạn
                            resizeMode="cover"
                            className="flex-1"
                        >
                            <View className="pt-3 pb-20 mt-2 bg-white/50">
                                {/* Banner */}
                                <View className="relative">
                                    <ScrollView
                                        ref={scrollRef}
                                        horizontal
                                        pagingEnabled
                                        showsHorizontalScrollIndicator={false}
                                        onMomentumScrollEnd={(e) => {
                                            const newIndex = Math.round(
                                                e.nativeEvent.contentOffset.x / width
                                            );
                                            setIndex(newIndex);
                                        }}
                                    >
                                        {banners.map((item) => (
                                            <Image
                                                key={item.id}
                                                source={{ uri: item.image }}
                                                style={{ width, height: 180 }}
                                                resizeMode="cover"
                                                className="rounded-xl px-5 mb-4"
                                            />
                                        ))}
                                    </ScrollView>

                                    {/* Dots */}
                                    <View className="absolute bottom-8 left-0 right-0 flex-row justify-center items-center">
                                        {banners.map((_, i) => (
                                            <View
                                                key={i}
                                                className={`mx-1 h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/40"
                                                    }`}
                                            />
                                        ))}
                                    </View>
                                </View>

                                {/* Best Seller */}
                                <View className="px-5 mt-1">
                                    <Text className="text-lg font-bold text-blue-900">
                                        Best Seller
                                    </Text>

                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                                        {FEATURED.map((item) => (
                                            <Pressable
                                                key={item.id}
                                                className="mr-4 w-40"
                                                onPress={() => router.push(`/product/${item.id}`)}
                                            >
                                                <Image
                                                    source={{ uri: item.image }}
                                                    className="w-full h-44 rounded-2xl"
                                                />
                                                <Text className="mt-2 mb-1 font-semibold text-blue-900">
                                                    {item.name}
                                                </Text>
                                                <Text className="text-red-500 font-bold">
                                                    {item.price}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* News Section */}
                                <View className="px-5 mt-8">
                                    <Pressable onPress={() => router.push("/news")}>
                                        <Text className="text-lg font-bold text-blue-900">
                                            Tin tức – Ưu đãi
                                        </Text>
                                    </Pressable>

                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {homeNews.map((item) => (
                                            <Pressable
                                                key={item.id}
                                                className="mr-4 w-64"
                                                onPress={() =>
                                                    router.push({
                                                        pathname: "/new/[id]",
                                                        params: { id: item.id },
                                                    })
                                                }
                                            >
                                                {item.image && (
                                                    <Image
                                                        source={{ uri: item.image }}
                                                        className="w-full h-80 rounded-2xl"
                                                    />
                                                )}

                                                <View className="mt-2">
                                                    <View
                                                        className={`self-start px-2 py-0.5 rounded ${item.type === "Tin Tức"
                                                            ? "bg-blue-500"
                                                            : "bg-yellow-400"
                                                            }`}
                                                    >
                                                        <Text className="text-[10px] font-semibold text-white">
                                                            {item.type === "Tin Tức" ? "TIN TỨC" : "ƯU ĐÃI"}
                                                        </Text>
                                                    </View>

                                                    <Text
                                                        className="mt-1 text-base font-semibold text-blue-900"
                                                        numberOfLines={2}
                                                    >
                                                        {item.title}
                                                    </Text>
                                                </View>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>
                        </ImageBackground>

                    </View>
                </ScrollView>
            </View>
        </ImageBackground>
    );
}

const FEATURED = [
    {
        id: "coldbrew",
        name: "Cold Brew Quýt Đào",
        price: "25.000đ",
        image:
            "https://scontent.fsgn2-9.fna.fbcdn.net/v/t39.30808-6/608076990_1193548316217762_6319986843513040563_n.jpg?_nc_cat=103&_nc_cb=99be929b-ad57045b&ccb=1-7&_nc_sid=127cfc&_nc_ohc=ivh9LFN5tF8Q7kNvwFmZqqf&_nc_oc=AdmCQiBbEPMa1BfdGUTPZNL3tg6Kti2itcdDl4IrairKcVbd__y4Cm3tQ7h7VOWMw8Q&_nc_zt=23&_nc_ht=scontent.fsgn2-9.fna&_nc_gid=q7AuxijgyVwf_I3lpUH7LA&oh=00_AfplYN4Q_460lZEb5_SQoQTWJ45OwEhm5sHR1hLOmxLIew&oe=69679F11",
    },
    {
        id: "matcha",
        name: "Matcha Latte",
        price: "32.000đ",
        image:
            "https://scontent.fsgn2-9.fna.fbcdn.net/v/t39.30808-6/612168257_1197784435794150_5157629543238785871_n.jpg?_nc_cat=103&_nc_cb=99be929b-ad57045b&ccb=1-7&_nc_sid=127cfc&_nc_ohc=3C4Edqkm6OoQ7kNvwHqNMVy&_nc_oc=AdkJtQtlmuLivO0qs-MO4IbiawPNQkf13QodXphQhygviiJndzEymXEPJTiWQwISSzU&_nc_zt=23&_nc_ht=scontent.fsgn2-9.fna&_nc_gid=ZUjVV1owiJcCQJYI62JMyg&oh=00_AfqOGDwhu77nkgKIjDyhJ0KZjta9o3G-IbZrFlCy0a8NXQ&oe=6967A7B6",
    },
    {
        id: "tra-dua",
        name: "Trà Dứa Nhiệt Đới",
        price: "34.000đ",
        image:
            "https://scontent.fsgn2-4.fna.fbcdn.net/v/t39.30808-6/495572314_1013284620910800_8914118044289021198_n.jpg?_nc_cat=101&_nc_cb=99be929b-ad57045b&ccb=1-7&_nc_sid=127cfc&_nc_ohc=QqUF7zQS5jsQ7kNvwEF6mwI&_nc_oc=AdkeeJf2FPzSw-fX7eDGETyYNiZrLsQfL5lETq8t38z33iVmd-7MK0jcW8saYfqI_8k&_nc_zt=23&_nc_ht=scontent.fsgn2-4.fna&_nc_gid=dBEGguljhvsfsl0DNbZ1XQ&oh=00_AfqSYggnUQd-OMUKyqlebiL9ctkbtFSAxnpVyuCrRkHzfw&oe=69664821",
    },
];