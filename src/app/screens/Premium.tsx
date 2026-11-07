import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Check,
    Crown,
    Gem,
    HelpCircle,
    RotateCcw,
    Shield,
    Sparkles,
    Star,
    Trophy,
    X,
    Zap
} from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PLANS } from "../../constants/types";
import { useProfileStore } from "../../store/profileStore";
import TopBar from "../components/TopBar";

const FEATURES = [
    {
        icon: Zap,
        color: "#facc15",
        title: "Nielimitowane gry",
        desc: "Graj bez ograniczeń — tyle rund i podejść, ile chcesz",
    },
    {
        icon: Trophy,
        color: "#fb923c",
        title: "Ekskluzywne tryby",
        desc: "Odblokuj zaawansowane tryby i pojedynki mistrzowskie",
    },
    {
        icon: Shield,
        color: "#60a5fa",
        title: "Brak reklam",
        desc: "Czysta rozgrywka bez przerw i rozpraszaczy",
    },
    {
        icon: Star,
        color: "#c084fc",
        title: "Statystyki Pro",
        desc: "Zaawansowana analiza poprawnych odpowiedzi i postępów",
    },
    {
        icon: Crown,
        color: "#f59e0b",
        title: "Złoty Profil Premium",
        desc: "Unikalna złota ramka i korona obok Twojej nazwy gracza",
    },
    {
        icon: HelpCircle,
        color: "#34d399",
        title: "Pełna baza pytań",
        desc: "Dostęp do wszystkich pytań z teleturnieju bez limitu",
    },
];

export default function PremiumScreen() {
    const router = useRouter();
    const isPremium = useProfileStore((state) => state.isPremium);
    const setPremium = useProfileStore((state) => state.setPremium);

    const [selectedPlan, setSelectedPlan] = useState<string>("yearly");
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

    const currentPlan =
        PLANS.find((p) => p.id === selectedPlan) || PLANS[0];

    const handlePurchase = () => {
        setPremium(true);
        setShowConfirmModal(false);
        Alert.alert(
            "Premium aktywowane!",
            "Dziękujemy za dołączenie do klubu Super Quiz Premium! Wszystkie funkcje premium są już aktywne na Twoim koncie.",
            [{ text: "Super!", onPress: () => router.back() }]
        );
    };

    const handleRestore = () => {
        setPremium(!isPremium)
        Alert.alert(
            "Przywracanie zakupów",
            isPremium
                ? "Twoje konto posiada już aktywny pakiet Premium."
                : "Nie znaleziono wcześniejszych subskrypcji powiązanych z tym kontem.",
            [{ text: "OK" }]
        );
    };

    return (
        <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
            {/* Top Navigation */}
            <TopBar TabName="Premium" />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Header */}
                <View className="px-5 pt-3 pb-6 items-center">
                    <View className="relative mb-4">
                        <View className="w-24 h-24 rounded-3xl bg-yellow-400/15 border-2 border-yellow-400/50 items-center justify-center shadow-lg shadow-yellow-500/20">
                            <Gem color="#facc15" size={48} />
                        </View>
                    </View>

                    <Text className="text-3xl font-black text-white text-center tracking-wide">
                        Super <Text className="text-yellow-400">Quiz Premium</Text>
                    </Text>
                    <Text className="text-slate-400 text-center mt-2 text-sm leading-5 max-w-xs">
                        Odblokuj pełną bazę pytań, ekskluzywne tryby gry i trenuj do teleturnieju bez jakichkolwiek limitów!
                    </Text>

                    {/* Active Status Badge if user has premium */}
                    {isPremium && (
                        <View className="flex-row items-center gap-2 bg-green-500/15 border border-green-500/50 px-4 py-2 rounded-full mt-4">
                            <Check color="#4ade80" size={16} strokeWidth={3} />
                            <Text className="text-green-400 font-bold text-xs">
                                Masz aktywny pakiet Premium
                            </Text>
                        </View>
                    )}
                </View>

                {/* Features Grid */}
                <View className="px-5 mb-6">
                    <Text className="text-white font-bold text-lg mb-3 tracking-wide">
                        Co zyskujesz:
                    </Text>

                    <View className="flex-row flex-wrap justify-between gap-y-3">
                        {FEATURES.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <View
                                    key={index}
                                    className="w-[48.5%] bg-backgroundLight/95 border border-yellow-400 rounded-2xl p-3.5 justify-between"
                                >
                                    <View>
                                        <View
                                            className="w-10 h-10 rounded-xl items-center justify-center mb-2.5"
                                            style={{ backgroundColor: `${feature.color}18` }}
                                        >
                                            <IconComponent color={feature.color} size={22} />
                                        </View>
                                        <Text className="text-white font-bold text-xs mb-1">
                                            {feature.title}
                                        </Text>
                                        <Text className="text-slate-400 text-[11px] leading-4">
                                            {feature.desc}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Plan Selection */}
                <View className="px-5 mb-6">
                    <Text className="text-white font-bold text-lg mb-3 tracking-wide">
                        Wybierz swój plan
                    </Text>

                    <View className="gap-3">
                        {PLANS.map((plan) => {
                            const isSelected = selectedPlan === plan.id;
                            return (
                                <TouchableOpacity
                                    key={plan.id}
                                    onPress={() => setSelectedPlan(plan.id)}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center justify-between bg-backgroundLight/95 p-4 rounded-2xl border-2 ${isSelected
                                        ? "border-yellow-400"
                                        : "border-slate-800"
                                        }`}
                                >
                                    <View className="flex-row items-center gap-3.5 flex-1 pr-2">
                                        {/* Radio Circle */}
                                        <View
                                            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected
                                                ? "border-yellow-400 bg-yellow-400"
                                                : "border-slate-600 bg-slate-900"
                                                }`}
                                        >
                                            {isSelected && (
                                                <Check color="#0f172a" size={14} strokeWidth={3} />
                                            )}
                                        </View>

                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-2 flex-wrap">
                                                <Text
                                                    className={`font-bold text-sm ${isSelected ? "text-white" : "text-slate-200"
                                                        }`}
                                                >
                                                    {plan.label}
                                                </Text>
                                                {plan.popular && (
                                                    <View className="bg-yellow-400 px-2 py-0.5 rounded-full">
                                                        <Text className="text-[10px] font-black text-slate-950 uppercase tracking-wider">
                                                            Popularne
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            {plan.savings && (
                                                <Text className="text-green-400 text-[11px] font-semibold mt-0.5">
                                                    {plan.savings}
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    <View className="items-end">
                                        <Text
                                            className={`font-black text-lg ${isSelected ? "text-yellow-400" : "text-white"
                                                }`}
                                        >
                                            {plan.price}
                                        </Text>
                                        <Text className="text-slate-500 text-[11px]">
                                            {plan.period}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Primary CTA Button */}
                <View className="px-5 mb-5 flex-col gap-3">
                    <TouchableOpacity
                        onPress={() => setShowConfirmModal(true)}
                        activeOpacity={0.85}
                        className="rounded-2xl overflow-hidden shadow-xl shadow-yellow-500/25"
                    >
                        <LinearGradient
                            colors={["#facc15", "#eab308", "#ca8a04"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaGradient}
                        >
                            <Sparkles color="#0f172a" size={20} />
                            <Text className="text-slate-950 font-black text-base tracking-wide">
                                {isPremium ? "Zmień plan Premium" : `Odblokuj Premium — ${currentPlan.price}`}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleRestore()}
                        activeOpacity={0.85}
                        className="rounded-2xl overflow-hidden bg-background p-4 border border-yellow-400 shadow-xl shadow-yellow-500/25 flex-row items-center justify-center gap-2">
                        <RotateCcw color="white" size={20} />
                        <Text className="text-white text-center font-black text-base tracking-wide">
                            Przywróc płatności
                        </Text>
                    </TouchableOpacity>

                    <Text className="text-yellow-500 text-center text-[11px] mt-3 leading-4">
                        Płatność obsługiwana bezpiecznie. Możesz zarządzać subskrypcją w dowolnym momencie.
                    </Text>
                </View>

                {/* Trust Badges */}
                <View className="px-5 mb-2">
                    <View className="flex-row justify-center gap-3">
                        {[
                            { icon: Shield, label: "Bezpieczna\npłatność" },
                            { icon: Zap, label: "Natychmiastowy\ndostęp" },
                            { icon: X, label: "Anuluj\nkiedy chcesz" },
                        ].map((badge, i) => (
                            <View key={i} className="items-center flex-1 bg-backgroundLight/60 border border-yellow-300 p-3 rounded-2xl">
                                <View className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 items-center justify-center mb-1.5">
                                    <badge.icon color="#facc15" size={17} />
                                </View>
                                <Text className="text-slate-400 text-[10px] text-center font-medium leading-3">
                                    {badge.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Confirm Purchase Modal */}
            <Modal
                visible={showConfirmModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowConfirmModal(false)}
            >
                <Pressable
                    className="flex-1 bg-black/75 justify-center items-center px-5"
                    onPress={() => setShowConfirmModal(false)}
                >
                    <Pressable
                        className="w-full max-w-sm bg-backgroundLight border border-yellow-400 rounded-3xl p-6 shadow-2xl"
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View className="items-center mb-5">
                            <View className="w-16 h-16 rounded-2xl bg-yellow-400/15 border-2 border-yellow-400/50 items-center justify-center mb-3">
                                <Gem color="#facc15" size={32} />
                            </View>
                            <Text className="text-xl font-black text-white text-center">
                                Potwierdź zakup
                            </Text>
                            <Text className="text-slate-400 text-center text-xs mt-1">
                                Super Quiz Premium
                            </Text>
                        </View>

                        <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-5">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-slate-300 font-semibold text-sm">
                                    {currentPlan.label}
                                </Text>
                                <Text className="text-yellow-400 font-black text-lg">
                                    {currentPlan.price}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handlePurchase}
                            activeOpacity={0.85}
                            className="rounded-xl overflow-hidden mb-3"
                        >
                            <LinearGradient
                                colors={["#facc15", "#eab308"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.modalGradient}
                            >
                                <Text className="text-slate-950 font-black text-sm tracking-wide">
                                    Potwierdzam zakup
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowConfirmModal(false)}
                            activeOpacity={0.7}
                            className="py-2.5 items-center"
                        >
                            <Text className="text-slate-400 font-semibold text-sm">
                                Wróć
                            </Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    ctaGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 8,
    },
    modalGradient: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
});
