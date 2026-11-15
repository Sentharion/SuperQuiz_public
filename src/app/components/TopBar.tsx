import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface TopBarProps {
    TabName: string;
}

const TopBar = ({ TabName }: TopBarProps) => {
    const router = useRouter();
    return (
        <View className="relative flex-row items-center px-2 py-3">
            <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                className="z-10 flex-row items-center gap-2 bg-slate-900/80 border border-border px-4 py-2 rounded-full"
            >
                <ArrowLeft color="#00D4E6" size={20} />
                <Text className="text-white font-semibold text-sm">
                    Wróć
                </Text>
            </TouchableOpacity>

            <Text className="absolute left-0 right-0 text-xl font-bold text-white text-center tracking-wide">
                {TabName}
            </Text>
        </View>
    )
}

export default TopBar;