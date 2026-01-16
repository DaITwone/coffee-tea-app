import { Modal, Pressable, Text, View, ScrollView, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Voucher } from "../services/voucherService";

type Props = {
    visible: boolean;
    vouchers: Voucher[];
    selectedVoucher?: Voucher | null;
    onSelect: (voucher: Voucher) => void;
    onRemove?: () => void;
    onClose: () => void;
};

export default function VoucherModal({
    visible,
    vouchers,
    selectedVoucher,
    onSelect,
    onRemove,
    onClose,
}: Props) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <ImageBackground
                    source={require("../assets/images/theme-bg-06.png")}
                    resizeMode="cover"
                    className="rounded-t-3xl overflow-hidden"
                >
                    {/* Overlay để chữ nổi, không rối */}
                    <View className="bg-white/80 rounded-t-3xl max-h-[80%]">
                        {/* Header */}
                        <View className="px-6 py-3 pb-4 border-b border-gray-100">
                            {/* Handle bar */}
                            <View className="items-center mb-4">
                                <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
                            </View>
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-2xl font-bold text-blue-900">
                                        Chọn voucher
                                    </Text>
                                    <Text className="text-sm text-gray-500 mt-1">
                                        {vouchers.length} voucher khả dụng
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={onClose}
                                    className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
                                >
                                    <Ionicons name="close" size={24} color="#666" />
                                </Pressable>
                            </View>
                        </View>

                        {/* Content */}
                        <ScrollView
                            className="px-6 py-4"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Voucher đang áp dụng */}
                            {selectedVoucher && (
                                <View className="mb-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 overflow-hidden">
                                    <View className="p-4">
                                        <View className="flex-row items-center mb-3">
                                            <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center mr-2">
                                                <Ionicons name="checkmark" size={18} color="white" />
                                            </View>
                                            <Text className="text-blue-600 font-bold flex-1">
                                                Đang áp dụng
                                            </Text>
                                            {onRemove && (
                                                <Pressable
                                                    onPress={() => {
                                                        onRemove();
                                                        onClose();
                                                    }}
                                                    className="flex-row items-center bg-white px-3 py-2 rounded-full border border-gray-200 active:bg-gray-50"
                                                >
                                                    <Ionicons name="close-circle" size={16} color="#ef4444" />
                                                    <Text className="text-red-500 font-semibold text-xs ml-1">
                                                        Bỏ chọn
                                                    </Text>
                                                </Pressable>
                                            )}
                                        </View>

                                        <Text className="text-blue-900 font-bold text-base mb-1">
                                            {selectedVoucher.title}
                                        </Text>
                                        {selectedVoucher.description && (
                                            <Text className="text-gray-600 text-sm">
                                                {selectedVoucher.description}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* Divider */}
                            {selectedVoucher && vouchers.length > 0 && (
                                <View className="flex-row items-center my-2 mb-4">
                                    <View className="flex-1 h-px bg-gray-200" />
                                    <Text className="text-gray-400 text-xs mx-3">
                                        Hoặc chọn voucher khác
                                    </Text>
                                    <View className="flex-1 h-px bg-gray-200" />
                                </View>
                            )}

                            {/* Danh sách voucher */}
                            {vouchers.length === 0 ? (
                                <View className="items-center justify-center py-16">
                                    <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                                        <Ionicons name="ticket-outline" size={40} color="#999" />
                                    </View>
                                    <Text className="text-gray-900 font-semibold text-lg mb-2">
                                        Không có voucher
                                    </Text>
                                    <Text className="text-gray-500 text-center px-8">
                                        Hiện tại không có voucher phù hợp cho đơn hàng này
                                    </Text>
                                </View>
                            ) : (
                                vouchers.map((v, index) => {
                                    const isSelected = selectedVoucher?.title === v.title;

                                    return (
                                        <Pressable
                                            key={index}
                                            onPress={() => {
                                                onSelect(v);
                                                onClose();
                                            }}
                                            disabled={isSelected}
                                            className={`mb-3 rounded-2xl overflow-hidden border active:opacity-70 ${isSelected
                                                ? "border-gray-300 bg-gray-50 opacity-50"
                                                : "border-gray-200 bg-white"
                                                }`}
                                        >
                                            <View className="flex-row">
                                                <View
                                                    className={`w-1.5 ${isSelected
                                                        ? "bg-gray-400"
                                                        : "bg-gradient-to-b from-blue-500 to-purple-500"
                                                        }`}
                                                />

                                                <View className="flex-1 p-4">
                                                    <View className="flex-row items-start justify-between mb-2">
                                                        <View className="flex-1 mr-3">
                                                            <View className="flex-row items-center mb-1">
                                                                <Ionicons
                                                                    name="pricetag"
                                                                    size={20}
                                                                    color={isSelected ? "#9ca3af" : "#3b82f6"}
                                                                    style={{ marginRight: 6 }}
                                                                />
                                                                <Text
                                                                    className={`text-base font-bold flex-1 ${isSelected
                                                                        ? "text-gray-400"
                                                                        : "text-blue-900"
                                                                        }`}
                                                                >
                                                                    {v.title}
                                                                </Text>
                                                            </View>
                                                            {v.description && (
                                                                <Text
                                                                    className={`text-sm leading-5 ml-6 ${isSelected
                                                                        ? "text-gray-400"
                                                                        : "text-gray-600"
                                                                        }`}
                                                                >
                                                                    {v.description}
                                                                </Text>
                                                            )}
                                                        </View>

                                                        {!isSelected && (
                                                            <View className="px-3 py-2 rounded-full" style={{ backgroundColor: "#80C34F" }}>
                                                                <Text className="text-white font-semibold text-xs">
                                                                    Áp dụng
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>

                                                    <View className="flex-row items-center mt-2 pt-3 border-t border-gray-100">
                                                        <Ionicons
                                                            name="checkmark-circle"
                                                            size={14}
                                                            color={isSelected ? "#9ca3af" : "#10b981"}
                                                        />
                                                        <Text
                                                            className={`text-xs ml-1.5 ${isSelected
                                                                ? "text-gray-400"
                                                                : "text-gray-500"
                                                                }`}
                                                        >
                                                            Đủ điều kiện sử dụng
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </Pressable>
                                    );
                                })
                            )}
                        </ScrollView>
                    </View>
                </ImageBackground>

            </View>
        </Modal>
    );
}