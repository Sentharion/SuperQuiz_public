import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Award,
    Camera,
    Check,
    Crown,
    Flame,
    Pencil,
    RotateCcw,
    Sparkles,
    Trash2,
    Trophy,
    UserRound,
    Volume2,
    VolumeX,
    X
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "../../store/gameStore";
import { useProfileStore, type ProfileStore } from "../../store/profileStore";
import Achievements from "../components/Achievements";
import TopBar from "../components/TopBar";

const PRESET_AVATARS = [
    { id: "owl", label: "Mądra Sowa", url: "https://api.dicebear.com/7.x/bottts/png?seed=OwlMaster&backgroundColor=b6e3f4" },
    { id: "brain", label: "Mózgowiec", url: "https://api.dicebear.com/7.x/bottts/png?seed=BrainGenius&backgroundColor=c0aede" },
    { id: "king", label: "Król Quizu", url: "https://api.dicebear.com/7.x/bottts/png?seed=QuizKing&backgroundColor=ffd5dc" },
    { id: "robot", label: "CyberMistrz", url: "https://api.dicebear.com/7.x/bottts/png?seed=CyberSpark&backgroundColor=d1d4f9" },
    { id: "scholar", label: "Profesor", url: "https://api.dicebear.com/7.x/bottts/png?seed=ProfesorX&backgroundColor=ffdfbf" },
    { id: "champion", label: "Czempion", url: "https://api.dicebear.com/7.x/bottts/png?seed=GrandChamp&backgroundColor=b6e3f4" },
];

export default function ProfileScreen() {
    const router = useRouter();

    const avatarUrl = useProfileStore((state: ProfileStore) => state.avatarUrl);
    const updateAvatar = useProfileStore((state: ProfileStore) => state.updateAvatar);
    const username = useProfileStore((state: ProfileStore) => state.username);
    const updateUsername = useProfileStore((state: ProfileStore) => state.updateUsername);
    const highestScore = useProfileStore((state: ProfileStore) => state.highestScore);
    const wins = useProfileStore((state: ProfileStore) => state.wins);
    const resetStats = useProfileStore((state: ProfileStore) => state.resetStats);

    const soundEnabled = useGameStore((state) => state.soundEnabled);
    const toggleSound = useGameStore((state) => state.toggleSound);

    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [usernameDraft, setUsernameDraft] = useState(username);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    useEffect(() => {
        setUsernameDraft(username);
    }, [username]);

    const handlePickFromGallery = async () => {
        setIsAvatarModalOpen(false);
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Dostęp zabroniony", "Potrzebne jest pozwolenie na dostęp do galerii zdjęć.");
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.85,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                updateAvatar(result.assets[0].uri);
                Alert.alert("Sukces", "Zdjęcie profilowe zostało zaktualizowane!");
            }
        } catch {
            Alert.alert("Błąd", "Nie udało się załadować zdjęcia z galerii.");
        }
    };

    const handleSelectPreset = (url: string) => {
        updateAvatar(url);
        setIsAvatarModalOpen(false);
        Alert.alert("Sukces", "Awatar został zaktualizowany!");
    };

    const handleRemoveAvatar = () => {
        updateAvatar(null);
        setIsAvatarModalOpen(false);
        Alert.alert("Usunięto", "Przywrócono domyślny awatar.");
    };

    const handleSaveUsername = () => {
        const trimmed = usernameDraft.trim();
        if (!trimmed) {
            Alert.alert("Błąd", "Nazwa użytkownika nie może być pusta.");
            return;
        }
        if (trimmed.length > 18) {
            Alert.alert("Błąd", "Nazwa użytkownika może mieć maksymalnie 18 znaków.");
            return;
        }
        updateUsername(trimmed);
        setIsEditingUsername(false);
        Alert.alert("Sukces", "Nazwa użytkownika została zaktualizowana!");
    };

    const handleCancelEditUsername = () => {
        setUsernameDraft(username);
        setIsEditingUsername(false);
    };

    const handleResetStats = () => {
        Alert.alert(
            "Zresetować statystyki?",
            "Wszystkie Twoje wygrane oraz najwyższe wyniki punktowe zostaną trwale wyzerowane.",
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Resetuj",
                    style: "destructive",
                    onPress: () => {
                        resetStats();
                        Alert.alert("Wyzerowano", "Twoje statystyki gry zostały zresetowane.");
                    },
                },
            ]
        );
    };

    const getRankInfo = () => {
        const getProgress = (targetWins: number, targetScore: number) => {
            return Math.min(
                100,
                Math.round(
                    Math.max(
                        wins / targetWins,
                        highestScore / targetScore
                    ) * 100
                )
            );
        };

        const ranks = [
            {
                title: "Początkujący Gracz",
                badgeBorder: "border-slate-400",
                badgeBg: "bg-slate-500/20",
                textColor: "text-slate-300",
                icon: UserRound,
                iconColor: "#94a3b8",
                targetWins: 2,
                targetScore: 150,
                nextRank: "Aspiranta",
            },
            {
                title: "Aspirant Teleturnieju",
                badgeBorder: "border-emerald-400",
                badgeBg: "bg-emerald-500/20",
                textColor: "text-emerald-300",
                icon: Trophy,
                iconColor: "#34d399",
                targetWins: 5,
                targetScore: 350,
                nextRank: "Weterana",
            },
            {
                title: "Weteran Quizu",
                badgeBorder: "border-blue-400",
                badgeBg: "bg-blue-500/20",
                textColor: "text-blue-300",
                icon: Sparkles,
                iconColor: "#60a5fa",
                targetWins: 10,
                targetScore: 600,
                nextRank: "Mistrza",
            },
            {
                title: "Mistrz Wiedzy",
                badgeBorder: "border-purple-400",
                badgeBg: "bg-purple-500/20",
                textColor: "text-purple-300",
                icon: Award,
                iconColor: "#c084fc",
                targetWins: 20,
                targetScore: 1000,
                nextRank: "Legendy",
            },
            {
                title: "Legenda Teleturnieju",
                badgeBorder: "border-amber-400",
                badgeBg: "bg-amber-500/20",
                textColor: "text-amber-300",
                icon: Crown,
                iconColor: "#facc15",
                targetWins: 20,
                targetScore: 1000,
                nextRank: null,
            },
        ];

        const currentIndex =
            wins >= 20 || highestScore >= 1000 ? 4 :
                wins >= 10 || highestScore >= 600 ? 3 :
                    wins >= 5 || highestScore >= 350 ? 2 :
                        wins >= 2 || highestScore >= 150 ? 1 : 0;

        const current = ranks[currentIndex];

        if (currentIndex === 4) {
            return {
                ...current,
                progressPercent: 100,
                hint: "Maksymalna ranga osiągnięta!",
                progressLabel: "MAX",
            };
        }

        const progressPercent = getProgress(
            current.targetWins,
            current.targetScore
        );

        return {
            ...current,
            progressPercent,
            progressLabel: `${progressPercent}%`,
            hint: `Do ${current.nextRank}: ${Math.max(0, current.targetWins - wins)} wygranych lub ${Math.max(0, current.targetScore - highestScore)} pkt rekordu`,
        };
    };

    const rank = getRankInfo();
    const RankIcon = rank.icon;


    return (
        <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
            {/* Top Navigation */}
            <TopBar TabName="Twój Profil" />

            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Profile Card */}
                <View className="bg-backgroundLight/95 border border-yellow-400 rounded-3xl p-6 mt-2 shadow-xl shadow-black/40">
                    <View className="items-center">
                        {/* Avatar container with action button */}
                        <View className="relative">
                            <View className="w-28 h-28 rounded-full border-4 border-yellow-400 bg-slate-800 justify-center items-center overflow-hidden shadow-lg shadow-yellow-500/20">
                                {avatarUrl ? (
                                    <Image
                                        source={{ uri: avatarUrl }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="w-full h-full bg-slate-800 justify-center items-center">
                                        <UserRound color="#facc15" size={56} />
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                onPress={() => setIsAvatarModalOpen(true)}
                                activeOpacity={0.8}
                                className="absolute bottom-0 right-0 w-9 h-9 bg-yellow-400 border-2 border-slate-900 rounded-full justify-center items-center shadow-md"
                            >
                                <Camera color="#0f172a" size={17} />
                            </TouchableOpacity>
                        </View>

                        {/* Username + Edit mode */}
                        <View className="w-full mt-4 items-center">
                            {isEditingUsername ? (
                                <View className="w-full max-w-xs items-center gap-2">
                                    <TextInput
                                        value={usernameDraft}
                                        onChangeText={setUsernameDraft}
                                        maxLength={18}
                                        placeholder="Wpisz nazwę gracza"
                                        placeholderTextColor="#64748b"
                                        autoFocus
                                        className="w-full bg-slate-900/90 border border-yellow-400 rounded-xl px-4 py-2.5 text-white font-bold text-center text-lg"
                                    />
                                    <View className="flex-row gap-2 mt-1">
                                        <TouchableOpacity
                                            onPress={handleSaveUsername}
                                            activeOpacity={0.7}
                                            className="flex-row items-center gap-1 bg-yellow-500 px-4 py-2 rounded-lg"
                                        >
                                            <Check color="#0f172a" size={18} />
                                            <Text className="text-slate-950 font-bold text-sm">Zapisz</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleCancelEditUsername}
                                            activeOpacity={0.7}
                                            className="flex-row items-center gap-1 bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg"
                                        >
                                            <X color="white" size={18} />
                                            <Text className="text-white font-semibold text-sm">Anuluj</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => setIsEditingUsername(true)}
                                    activeOpacity={0.7}
                                    className="flex-row items-center justify-center gap-2"
                                >
                                    <Text className="text-2xl font-black text-white tracking-wide">
                                        {username}
                                    </Text>
                                    <View className="bg-slate-800 p-1.5 rounded-full border border-slate-700">
                                        <Pencil color="#facc15" size={14} />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Rank Badge */}
                        <View
                            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border mt-3 ${rank.badgeBg} ${rank.badgeBorder}`}
                        >
                            <RankIcon color={rank.iconColor} size={16} />
                            <Text className={`font-bold text-xs uppercase tracking-wider ${rank.textColor}`}>
                                {rank.title}
                            </Text>
                        </View>

                        {/* Rank Progress Bar */}
                        <View className="w-full mt-4 bg-slate-900/70 border border-slate-800 p-3 rounded-2xl">
                            <View className="flex-row justify-between items-center mb-1.5">
                                <Text className="text-xs text-slate-400 font-medium">Postęp do kolejnej rangi</Text>
                                <Text className="text-xs text-yellow-400 font-bold">{rank.progressPercent}%</Text>
                            </View>
                            <View className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                <View
                                    className="h-full bg-yellow-400 rounded-full"
                                    style={{ width: `${rank.progressPercent}%` }}
                                />
                            </View>
                            <Text className="text-[11px] text-slate-500 mt-1.5 text-center">{rank.hint}</Text>
                        </View>
                    </View>
                </View>

                {/* Statistics Grid */}
                <View className="mt-5">
                    <Text className="text-white font-bold text-lg mb-3 tracking-wide">
                        Statystyki Gracza
                    </Text>

                    <View className="flex-row gap-3">
                        {/* Wins Card */}
                        <View className="flex-1 bg-backgroundLight/95 border border-yellow-500 p-4 rounded-2xl">
                            <View className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 items-center justify-center mb-2">
                                <Trophy color="#facc15" size={22} />
                            </View>
                            <Text className="text-3xl font-black text-white">{wins}</Text>
                            <Text className="text-xs text-slate-400 mt-0.5">Wygrane teleturnieje</Text>
                        </View>

                        {/* Highest Quiz Score */}
                        <View className="flex-1 bg-backgroundLight/95 border border-orange-500/25 p-4 rounded-2xl">
                            <View className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 items-center justify-center mb-2">
                                <Flame color="#fb923c" size={22} />
                            </View>
                            <Text className="text-3xl font-black text-white">{highestScore}</Text>
                            <Text className="text-xs text-slate-400 mt-0.5">Rekord punktów</Text>
                        </View>
                    </View>
                </View>

                {/* Achievements Section */}
                <Achievements highestScore={highestScore} wins={wins} />

                {/* Settings & Account Options */}
                <View className="mt-6">
                    <Text className="text-white font-bold text-lg mb-3 tracking-wide">
                        Ustawienia Profilu
                    </Text>

                    <View className="bg-backgroundLight/95 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
                        {/* Sound Toggle Row */}
                        <TouchableOpacity
                            onPress={toggleSound}
                            activeOpacity={0.7}
                            className="flex-row items-center justify-between p-4"
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-9 h-9 rounded-xl bg-slate-800 items-center justify-center border border-slate-700">
                                    {soundEnabled ? (
                                        <Volume2 color="#facc15" size={18} />
                                    ) : (
                                        <VolumeX color="#94a3b8" size={18} />
                                    )}
                                </View>
                                <View>
                                    <Text className="text-white font-semibold text-sm">Dźwięki w grze</Text>
                                    <Text className="text-slate-400 text-xs">Efekty dźwiękowe pytań i gongu</Text>
                                </View>
                            </View>
                            <View
                                className={`px-3 py-1 rounded-full border ${soundEnabled
                                    ? "bg-green-500/20 border-green-500/40"
                                    : "bg-slate-800 border-slate-700"
                                    }`}
                            >
                                <Text
                                    className={`text-xs font-bold ${soundEnabled ? "text-green-400" : "text-slate-400"
                                        }`}
                                >
                                    {soundEnabled ? "Włączone" : "Wyciszone"}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Reset Stats Row */}
                        <TouchableOpacity
                            onPress={handleResetStats}
                            activeOpacity={0.7}
                            className="flex-row items-center justify-between p-4"
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-9 h-9 rounded-xl bg-red-500/10 items-center justify-center border border-red-500/30">
                                    <RotateCcw color="#f87171" size={18} />
                                </View>
                                <View>
                                    <Text className="text-red-400 font-semibold text-sm">Zresetuj statystyki</Text>
                                    <Text className="text-slate-500 text-xs">Wyzeruj liczbę wygranych i rekordy</Text>
                                </View>
                            </View>
                            <Trash2 color="#f87171" size={16} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Avatar Selector Modal */}
            <Modal
                visible={isAvatarModalOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsAvatarModalOpen(false)}
            >
                <Pressable
                    className="flex-1 bg-black/75 justify-center items-center px-4"
                    onPress={() => setIsAvatarModalOpen(false)}
                >
                    <Pressable
                        className="w-full max-w-sm bg-backgroundLight border border-yellow-400 rounded-3xl p-5 shadow-2xl"
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold text-white">Wybierz swój awatar</Text>
                            <TouchableOpacity
                                onPress={() => setIsAvatarModalOpen(false)}
                                className="p-1 rounded-full bg-slate-800"
                            >
                                <X color="#94a3b8" size={18} />
                            </TouchableOpacity>
                        </View>

                        {/* Gallery option */}
                        <TouchableOpacity
                            onPress={handlePickFromGallery}
                            activeOpacity={0.8}
                            className="flex-row items-center justify-center gap-2 bg-yellow-400 py-3 rounded-xl mb-4"
                        >
                            <Camera color="#0f172a" size={18} />
                            <Text className="text-slate-950 font-bold text-sm">
                                Wybierz z galerii zdjęć
                            </Text>
                        </TouchableOpacity>

                        {/* Presets Grid */}
                        <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                            Lub wybierz gotową postać:
                        </Text>
                        <View className="flex-row flex-wrap justify-between gap-y-3 mb-4">
                            {PRESET_AVATARS.map((preset) => (
                                <TouchableOpacity
                                    key={preset.id}
                                    onPress={() => handleSelectPreset(preset.url)}
                                    activeOpacity={0.7}
                                    className="w-[30%] items-center bg-slate-900 border border-slate-800 p-2 rounded-xl"
                                >
                                    <Image
                                        source={{ uri: preset.url }}
                                        className="w-14 h-14 rounded-full bg-slate-800"
                                        resizeMode="cover"
                                    />
                                    <Text
                                        numberOfLines={1}
                                        className="text-[11px] text-slate-300 font-medium mt-1.5 text-center"
                                    >
                                        {preset.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Remove avatar option */}
                        {avatarUrl && (
                            <TouchableOpacity
                                onPress={handleRemoveAvatar}
                                activeOpacity={0.7}
                                className="flex-row items-center justify-center gap-2 bg-slate-800/80 border border-red-500/40 py-2.5 rounded-xl"
                            >
                                <Trash2 color="#f87171" size={16} />
                                <Text className="text-red-400 font-semibold text-xs">
                                    Usuń aktualne zdjęcie
                                </Text>
                            </TouchableOpacity>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
