import { useGameStore } from "@/store/gameStore";
import { SimpleLineIcons } from '@expo/vector-icons';
import { Bot, Crown } from "lucide-react-native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";

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

                            {[3, 2, 1].map((lampNum) => {
                                const isLit = lives >= lampNum;
                                const gradId = `lamp-${id}-${lampNum}`;
                                return (
                                    <View
                                        key={lampNum}
                                        style={styles.lampContainer}
                                    >
                                        {isLit && <View style={styles.lampAura} />}

                                        <View style={styles.lampInner}>
                                            <Svg width="24" height="16" viewBox="0 0 24 16">
                                                <Defs>
                                                    {isLit ? (
                                                        <>
                                                            <RadialGradient
                                                                id={`rad-${gradId}`}
                                                                cx="8.4"
                                                                cy="5.6"
                                                                r="18"
                                                                gradientUnits="userSpaceOnUse"
                                                            >
                                                                <Stop offset="0%" stopColor="#dcfce7" />
                                                                <Stop offset="45%" stopColor="#4ade80" />
                                                                <Stop offset="80%" stopColor="#16a34a" />
                                                                <Stop offset="100%" stopColor="#14532d" />
                                                            </RadialGradient>
                                                            <LinearGradient
                                                                id={`shine-${gradId}`}
                                                                x1="0"
                                                                y1="0"
                                                                x2="0"
                                                                y2="1"
                                                            >
                                                                <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                                                                <Stop offset="50%" stopColor="#ffffff" stopOpacity="0.25" />
                                                                <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                                            </LinearGradient>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <RadialGradient
                                                                id={`rad-${gradId}`}
                                                                cx="9.6"
                                                                cy="6.4"
                                                                r="18"
                                                                gradientUnits="userSpaceOnUse"
                                                            >
                                                                <Stop offset="0%" stopColor="#14251a" />
                                                                <Stop offset="80%" stopColor="#0b1c11" />
                                                                <Stop offset="100%" stopColor="#050d08" />
                                                            </RadialGradient>
                                                            <LinearGradient
                                                                id={`shadow-${gradId}`}
                                                                x1="0"
                                                                y1="0"
                                                                x2="0"
                                                                y2="1"
                                                            >
                                                                <Stop offset="0%" stopColor="#000000" stopOpacity="0.9" />
                                                                <Stop offset="60%" stopColor="#000000" stopOpacity="0.35" />
                                                                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                                                            </LinearGradient>
                                                        </>
                                                    )}
                                                </Defs>

                                                {/* Lamp Bulb & Border */}
                                                <Rect
                                                    x="0.5"
                                                    y="0.5"
                                                    width="23"
                                                    height="15"
                                                    rx="3"
                                                    ry="3"
                                                    fill={`url(#rad-${gradId})`}
                                                    stroke={isLit ? "#bbf7d0" : "#1b4228"}
                                                    strokeWidth="1"
                                                />

                                                {/* Inset highlight/shadow simulation */}
                                                {isLit ? (
                                                    <Rect
                                                        x="1.5"
                                                        y="1"
                                                        width="21"
                                                        height="5"
                                                        rx="2"
                                                        ry="2"
                                                        fill={`url(#shine-${gradId})`}
                                                    />
                                                ) : (
                                                    <Rect
                                                        x="1"
                                                        y="1"
                                                        width="22"
                                                        height="7"
                                                        rx="2"
                                                        ry="2"
                                                        fill={`url(#shadow-${gradId})`}
                                                    />
                                                )}
                                            </Svg>
                                        </View>
                                    </View>
                                );
                            })}

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

const styles = StyleSheet.create({
    lampContainer: {
        width: 24,
        height: 16,
        marginHorizontal: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    lampAura: {
        position: "absolute",
        top: -2,
        bottom: -2,
        left: -2,
        right: -2,
        borderRadius: 5,
        backgroundColor: "rgba(34, 197, 94, 0.55)",
        shadowColor: "#22c55e",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 10,
    },
    lampInner: {
        width: 24,
        height: 16,
        borderRadius: 3,
        overflow: "hidden",
    },
});

export default Stand;
