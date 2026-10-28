import { SimpleLineIcons } from '@expo/vector-icons';
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { Bot, Check, UserRoundPlus, UserX, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colorClasses, generateBotName, randomColor, type PlayerColor, type Question } from "../../constants/types";
import { getEasyQuestionsForGame, getQuestionsForGame } from "../../services/supa";
import { useGameStore, type Player } from "../../store/gameStore";
import { useProfileStore } from "../../store/profileStore";


const GameRoomScreen = () => {
    const [openModal, setOpenModal] = useState(false);
    const [colorActive, setColorActive] = useState<PlayerColor | null>(null);
    const [gender, setGender] = useState<'male' | 'female' | null>(null);
    const [playerName, setPlayerName] = useState("");
    const [playerCount, setPlayerCount] = useState(0);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const router = useRouter();
    const startGame = useGameStore((state: any) => state.startGame);
    const players = useGameStore((state: any) => state.players);
    const username = useProfileStore((state: any) => state.username);
    const avatarUrl = useProfileStore((state: any) => state.avatarUrl);
    const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'hard'>('easy');

    useEffect(() => {
    const store = useGameStore.getState();

    store.resetGame();

    store.addPlayer({
        id: 1,
        username,
        avatarColor: randomColor(),
        avatar: avatarUrl || undefined,
        points: 0,
        isBot:false,
        sex:'male',
        active:true,
        lives:3
    });

}, []);

    const getSex = () => {
        if (players.filter((p: Player) => p.sex === 'male').length > players.filter((p: Player) => p.sex === 'female').length) return 'female';
        return 'male';
    }

    const addPlayer = (name: string, color: PlayerColor, avatarUrl: string | undefined, points: number, isBot: boolean, active: boolean, lives: number, sex: 'male' | 'female') => {
        const currentPlayers = useGameStore.getState().players;
        const newId = currentPlayers.length > 0 ? Math.max(...currentPlayers.map(p => p.id)) + 1 : 1;
        const player: Player = {
            id: newId,
            username: name,
            avatarColor: color,
            avatar: avatarUrl ?? undefined,
            points: points,
            isBot: isBot,
            sex: sex,
            active: active,
            lives: lives
        };
        useGameStore.getState().addPlayer(player);
        if (playerCount <= 25) {
            setPlayerCount(playerCount + 1);
        }
        setOpenModal(false);
        setColorActive(null);
        setPlayerName("");
        setDeleteOpen(false);
    }

    const addRandomBot = () => {
        const currentPlayers = useGameStore.getState().players;
        const newId = currentPlayers.length > 0 ? Math.max(...currentPlayers.map(p => p.id)) + 1 : 1;
        const player: Player = {
            id: newId,
            username: generateBotName(1)[0],
            avatarColor: randomColor(),
            points: 0,
            sex: getSex(),
            isBot: true,
            active: true,
            lives: 3,
            knowledge: Math.floor(Math.random() * 31) + 60
        };
        useGameStore.getState().addPlayer(player);
        if (playerCount <= 25) {
            setPlayerCount(playerCount + 1);
        }
        setDeleteOpen(false);
    }

    const removePlayer = (id: number) => {
        useGameStore.getState().removePlayer(id);
        setPlayerCount(playerCount - 1);
    }

   const gameStartHandler = async () => {
    let questions: Question[] = [];

    if (selectedDifficulty === "easy") {
        questions = await getEasyQuestionsForGame();
    } else {
        questions = await getQuestionsForGame();
    }

    setOpenModal(false);

    router.replace("/screens/GameScreen");

    setTimeout(() => {
        startGame(
            "multiplayer",
            questions,
            username,
            players.length,
            avatarUrl
        );
    }, 50);
};


    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Add Player Modal */}
            <Modal
                visible={openModal}
                transparent
                animationType="fade"
                onRequestClose={() => setOpenModal(false)}
            >
                <View className="flex-1 items-center justify-center bg-black/70 px-4">
                    <View className="w-full max-w-sm rounded-2xl border border-borderHover bg-background p-5">
                        <Text className="mb-3 text-xl text-center font-bold text-white">
                            Dodaj gracza
                        </Text>
                        <View className="flex-col items-center gap-4">
                            <TextInput
                                placeholder="Nazwa gracza"
                                placeholderTextColor="#94a3b8"
                                value={playerName}
                                onChangeText={setPlayerName}
                                className="w-full rounded-xl border border-border bg-backgroundLight p-2 text-white"
                            />
                            <View className="flex-col gap-2 w-full">
                                <Text className="text-white">Wybierz płeć gracza</Text>
                                <View className="flex-row gap-2 items-center justify-center flex-wrap">
                                    <TouchableOpacity
                                        onPress={() => setGender('male')}
                                        className={`w-10 h-10 rounded-full items-center justify-center border border-border ${gender === 'male' ? 'bg-blue-500' : 'bg-backgroundLight'}`}
                                    >
                                        <SimpleLineIcons name="user" color="white" size={19} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setGender('female')}
                                        className={`w-10 h-10 rounded-full items-center justify-center border border-border ${gender === 'female' ? 'bg-pink-500' : 'bg-backgroundLight'}`}
                                    >
                                        <SimpleLineIcons name="user-female" color="white" size={19} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View className="flex-col gap-2 w-full">
                                <Text className="text-white">Wybierz kolor gracza</Text>
                                <View className="flex-row gap-2 items-center justify-center flex-wrap">
                                    {(Object.keys(colorClasses) as PlayerColor[]).map((color) => (
                                        <TouchableOpacity
                                            key={color}
                                            onPress={() => setColorActive(color === colorActive ? null : color as PlayerColor)}
                                            className={`w-8 h-8 rounded-full items-center justify-center border border-border ${colorClasses[color]}`}
                                        >
                                            {color === colorActive && (
                                                <Check size={20} color="white" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <View className="flex-row gap-4 w-full">
                                <TouchableOpacity
                                    onPress={() => addPlayer(playerName.trim() || "Gracz", colorActive || "red", undefined, 0, false, true, 3, gender ?? 'male')}
                                    className="flex-1 p-2 rounded-xl bg-primary border-2 border-primary items-center"
                                >
                                    <Text className="text-white font-semibold">Dodaj</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => { setOpenModal(false); setColorActive(null); setPlayerName(""); }}
                                    className="flex-1 p-2 rounded-xl bg-red-500 border-2 border-red-600 items-center"
                                >
                                    <Text className="text-white font-semibold">Anuluj</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 8 }}>
                <View className="bg-background border-border rounded-2xl border-2 w-full">
                    {/* Header */}
                    <View className="flex flex-col items-center justify-between gap-6 pt-5 px-6 border-b bg-backgroundLight border-border pb-5 rounded-t-2xl">
                        <View className="flex-col items-center justify-center">
                            <Text className="text-muted text-center text-2xl font-semibold">Konfiguracja sesji</Text>
                            <Text className="text-white text-center text-4xl font-bold">Tworzenie gry</Text>
                        </View>
                        <View className="flex-col gap-4 justify-center">
                            {/* Difficulty picker */}
                            <View className="flex-row items-center justify-center gap-2">
                                <Text className="text-white font-semibold">Wybierz poziom trudności:</Text>
                                <View className="bg-backgroundLight border border-border rounded-lg overflow-hidden">
                                    <Picker
                                        selectedValue={selectedDifficulty}
                                        onValueChange={(value: string) => setSelectedDifficulty(value as 'easy' | 'hard')}
                                        style={{ color: 'white', minWidth: 120 }}
                                        dropdownIconColor="white"
                                    >
                                        <Picker.Item label="Łatwy" value="easy" />
                                        <Picker.Item label="Trudny" value="hard" />
                                    </Picker>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => setOpenModal(true)}
                                disabled={players.length >= 25}
                                className={`py-3 px-8 rounded-xl flex-row gap-2 items-center justify-center bg-primary border-2 border-primary ${players.length >= 25 ? 'opacity-50' : ''}`}
                            >
                                <UserRoundPlus size={24} color="white" />
                                <Text className="text-white font-semibold">Dodaj gracza</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => addRandomBot()}
                                disabled={players.length >= 25}
                                className={`py-3 px-8 rounded-xl flex-row gap-2 items-center justify-center bg-orange-500 border-2 border-orange-600 ${players.length >= 25 ? 'opacity-50' : ''}`}
                            >
                                <Bot size={24} color="white" />
                                <Text className="text-white font-semibold">Dodaj bota</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setDeleteOpen(!deleteOpen)}
                                disabled={players.length <= 1}
                                className={`py-3 px-8 rounded-xl flex-row gap-2 items-center justify-center bg-red-500 border-2 border-red-600 ${players.length <= 1 ? 'opacity-50' : ''}`}
                            >
                                <UserX size={24} color="white" />
                                <Text className="text-white font-semibold">Usuń gracza</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Players Section */}
                    <View className="mt-10 pt-10 pb-10">
                        <Text className="text-white text-center text-2xl font-semibold mb-1">Gracze ({players.length}/25)</Text>
                        <View className="flex-row justify-center items-center gap-2 mb-10">
                            <Text className="text-muted">Aby rozpocząć grę potrzeba przynajmniej 4 graczy</Text>
                            {players.length >= 4 ? (
                                <Check size={20} color="green" />
                            ) : (
                                <X size={20} color="red" />
                            )}
                        </View>
                        <View className="flex-row flex-wrap justify-center items-center gap-4 mt-5">
                            {players.map((player: Player) => (
                                <View key={player.id} className="flex-col items-center gap-2">
                                    <View className={`items-center justify-center w-20 h-20 rounded-full ${!player.isBot && player.avatarColor ? colorClasses[player.avatarColor as PlayerColor] : "bg-gray-500"}`}>
                                        {player.isBot ? (
                                            <Bot size={40} color="white" />
                                        ) : player.avatar ? (
                                            <Image source={{ uri: player.avatar }} className="w-20 h-20 rounded-full" />
                                        ) : (
                                            player.sex === 'male' ? (
                                                <SimpleLineIcons name="user" color="white" size={40} />
                                            ) : (
                                                <SimpleLineIcons name="user-female" color="white" size={40} />
                                            )
                                        )}
                                    </View>
                                    <Text className="text-white">{player.username}</Text>
                                    {deleteOpen && player.id !== 1 && (
                                        <TouchableOpacity
                                            onPress={() => removePlayer(player.id)}
                                            className="items-center justify-center w-8 h-8 rounded-full bg-red-500"
                                        >
                                            <X size={20} color="white" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Footer Buttons */}
                    <View className="items-center bg-backgroundLight border-t border-border justify-center gap-4 mt-8 py-6 rounded-b-2xl">
                        <TouchableOpacity
                            onPress={gameStartHandler}
                            disabled={players.length < 4}
                            className={`py-3 px-8 rounded-xl border-2 items-center ${players.length < 4 ? 'bg-gray-500 border-gray-600 opacity-50' : 'bg-green-500 border-green-600'}`}
                        >
                            <Text className="text-white font-semibold">Rozpocznij grę</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.replace("/")}
                            className="py-3 px-8 rounded-xl bg-red-500 border-2 border-red-600 items-center"
                        >
                            <Text className="text-white font-semibold">Powrót do menu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default GameRoomScreen;