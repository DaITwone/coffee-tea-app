import { View, Image } from "react-native";
import { useEffect, useMemo } from "react";
import { router } from "expo-router";

export default function SplashScreen() {
    // Danh sách ảnh splash
    const splashImages = [
        require("../assets/images/bg.png"),
        require("../assets/images/bg1.png"),
        require("../assets/images/bg2.png"),
        require("../assets/images/bg3.png"),
        require("../assets/images/bg4.jpg"),
    ];

    // Random ảnh (chỉ chạy 1 lần khi component mount)
    const randomImage = useMemo(() => {
        const index = Math.floor(Math.random() * splashImages.length);
        return splashImages[index];
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace("/(tabs)");
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View className="flex-1">
            <Image
                source={randomImage}
                className="absolute inset-0 w-full h-full"
                resizeMode="cover"
            />
        </View>
    );
}
