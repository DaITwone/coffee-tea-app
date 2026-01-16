import { router, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#2756AE",
                tabBarStyle: {
                    height: 60,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Trang chủ",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="sparkles" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="menu"
                options={{
                    title: "Menu",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cafe" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="news"
                options={{
                    headerShown: false,
                    title: "Tin Tức",
                    headerTitle: "TIN TỨC - ƯU ĐÃI",
                    headerStyle: {
                        backgroundColor: "#0E2A47", // 🎨 bg header
                    },
                    headerTitleStyle: {
                        color: "#fff",
                        fontWeight: "300",
                        fontSize: 18,
                    },
                    headerTintColor: "#fff", // màu icon back (nếu có)
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="flame" size={size} color={color} />
                    ),
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        router.replace("/(tabs)/news");
                    },
                }}
            />

            <Tabs.Screen
                name="account"
                options={{
                    title: "Tài khoản",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        router.replace("/(tabs)/account/account");
                    },
                }}
            />
        </Tabs>
    );
}
