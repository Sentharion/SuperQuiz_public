import { SimpleLineIcons } from '@expo/vector-icons';
import { Image, Text, View, TouchableOpacity } from "react-native";
import {useGameStore} from "@/store/gameStore";
import {Bot} from "lucide-react-native";

interface StandProps {
    id: number;
    username: string;
    points: number;
    lives: number;
    position: number;
    avatar?: string;
    avatarColor?: string;
    gameMode: string | null;
    sex: 'male' | 'female'
    active: boolean;
    isCurrent: boolean;
    isBot?: boolean;
    canBeDesignated: boolean;
    onDesignate: (id: number) => void;
}


const Stand = ({ id, username, points, lives, position, gameMode, avatar, avatarColor, sex,isBot, active, isCurrent, canBeDesignated, onDesignate }: StandProps) => {
    const stage = useGameStore((state) => state.stage);
    const pointsState =
    (gameMode === "classic" && stage === 3) ||
    gameMode === "final" ||
    gameMode === "solo" || (gameMode === "multiplayer" && stage === 3) || gameMode === "flashcards";

    return (
        <View className={`items-center ${!active ? "opacity-40" : ""}`}>
    
    {/* Avatar */}
    <View
        className="w-20 h-20 rounded-full items-center justify-center overflow-hidden"
        style={{
            backgroundColor: avatar ? "transparent" : avatarColor || "#0ea5e9",
            borderWidth: isCurrent ? 5 : 0,
            borderColor: "#ebeb34",
        }}
    >
        {avatar ? (
            <Image
                source={{ uri: avatar }}
                resizeMode="cover"
                style={{
                    width: 70,
                    height: 70,
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
    )
}
export default Stand;