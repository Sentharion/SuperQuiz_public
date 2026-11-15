import { useGameStore } from "@/store/gameStore";
import { SimpleLineIcons } from '@expo/vector-icons';
import { Bot, Crown } from "lucide-react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface StandProps {
    id: number;
    username: string;
    points: number;
    lives: number;
    position: number;
    avatar?: string;
    avatarColor?: string;
    gameMode: string | null;
    sex: 'male' | 'female';
    active: boolean;
    isCurrent: boolean;
    isBot?: boolean;
    isPremium?: boolean;
    canBeDesignated: boolean;
    onDesignate: (id: number) => void;
}


const Stand = ({
    id,
    username,
    points,
    lives,
    position,
    gameMode,
    avatar,
    avatarColor,
    sex,
    isBot,
    isPremium,
    active,
    isCurrent,
    canBeDesignated,
    onDesignate,
}: StandProps) => {
    const stage = useGameStore((state) => state.stage);
    const pointsState =
        (gameMode === "classic" && stage === 3) ||
        gameMode === "final" ||
        gameMode === "solo" ||
        (gameMode === "multiplayer" && stage === 3) ||
        gameMode === "flashcards";

    return (
        <View className={`items-center ${!active ? "opacity-40" : ""}`}>
            {/* Avatar Container */}
            <View className="relative items-center justify-center">
                {/* Premium Crown */}
                {isPremium && (
                    <View
                        style={{
                            position: "absolute",
                            top: -16,
                            zIndex: 20,
                            alignItems: "center",
                            justifyContent: "center",
                            shadowColor: "#facc15",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.8,
                            shadowRadius: 4,
                            elevation: 6,
                        }}
                    >
                        <Crown size={22} color="#facc15" fill="#facc15" />
                    </View>
                )}

                {/* Avatar Circle */}
                <View
                    className="w-20 h-20 rounded-full items-center justify-center overflow-hidden"
                    style={{
                        backgroundColor: avatar ? "transparent" : avatarColor || "#0ea5e9",
                        borderWidth: isCurrent ? 5 : isPremium ? 3.5 : 0,
                        borderColor: isCurrent
                            ? "#00D4E6"
                            : isPremium
                                ? "#facc15"
                                : "transparent",
                        shadowColor: isPremium ? "#facc15" : undefined,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: isPremium ? 0.6 : 0,
                        shadowRadius: 8,
                    }}
                >
                    {avatar ? (
                        <Image
                            source={{ uri: avatar }}
                            resizeMode="cover"
                            style={{
                                width: isPremium || isCurrent ? 72 : 76,
                                height: isPremium || isCurrent ? 72 : 76,
                                borderRadius: 999,
                            }}
                        />
                    ) : isBot ? (
                        <Bot color="white" size={35} />
                    ) : (
                        <SimpleLineIcons
                            name={sex === "male" ? "user" : "user-female"}
                            size={35}
                            color="white"
                        />
                    )}
                </View>
            </View>

            {/* Stand */}
            <View className="items-center mt-2">
                <View className="items-center p-3 rounded-xl">

                    {/* Tablica */}
                    <View className="items-center bg-gray-400 rounded-xl px-3 py-2 border-x-2 border-gray-500">

                        {/* Lives */}
                        <View className="flex-row items-center mb-2">
                            <Text className="text-lg text-yellow-400 font-bold mr-2">
                                {position}
                            </Text>

                            <View className={`w-6 h-4 mx-1 ${lives >= 3 ? "bg-green-500" : "bg-emerald-800"}`} />
                            <View className={`w-6 h-4 mx-1 ${lives >= 2 ? "bg-green-500" : "bg-emerald-800"}`} />
                            <View className={`w-6 h-4 mx-1 ${lives >= 1 ? "bg-green-500" : "bg-emerald-800"}`} />

                            <Text className="text-lg text-yellow-400 font-bold mr-2">
                                {position}
                            </Text>
                        </View>


                        {/* Nazwa */}
                        <View className="flex-row items-center bg-yellow-400 rounded-lg px-2 py-1 max-w-[120px]">
                            <Text
                                className="text-black font-bold text-center"
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {username}
                            </Text>

                            {pointsState && (
                                <Text className="text-black font-bold ml-2">
                                    {points}
                                </Text>
                            )}
                        </View>

                    </View>


                    {/* Noga stanowiska */}
                    <View className="w-16 h-16 bg-gray-400 rounded-b-xl border-x-2 border-gray-500" />

                </View>


                {/* Wybór gracza */}
                {canBeDesignated && (
                    <TouchableOpacity
                        className="mt-3 bg-green-600 px-5 py-2 rounded-xl"
                        activeOpacity={0.8}
                        onPress={() => onDesignate(id)}
                    >
                        <Text className="text-white font-bold">
                            Wybierz
                        </Text>
                    </TouchableOpacity>
                )}

            </View>
        </View>
    );
};

export default Stand;
