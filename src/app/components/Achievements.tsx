import {
    Award,
    Brain,
    Crown,
    Flame,
    Medal,
    ShieldCheck,
    Sparkles,
    Trophy,
} from "lucide-react-native";
import { Text, View } from "react-native";

interface AchievementProps {
    highestScore: number;
    wins: number;

}



const Achievements = ({ highestScore, wins }: AchievementProps) => {

    const achievements = [
        // POCZĄTKI
        {
            id: "first_game",
            title: "Pierwsze Kroki",
            desc: "Zagraj swoją pierwszą partię",
            unlocked: highestScore > 0 || wins > 0,
            progress: highestScore > 0 || wins > 0 ? 100 : 0,
            progressLabel: `${wins > 0 || highestScore > 0 ? 1 : 0} / 1`,
            icon: Sparkles,
            color: "#60a5fa",
            category: "Początki",
        },
        {
            id: "first_win",
            title: "Smak Zwycięstwa",
            desc: "Wygraj swój pierwszy teleturniej",
            unlocked: wins >= 1,
            progress: Math.min(100, wins * 100),
            progressLabel: `${Math.min(wins, 1)} / 1`,
            icon: Trophy,
            color: "#facc15",
            category: "Zwycięstwa",
        },

        // ZWYCIĘSTWA
        {
            id: "triple_champ",
            title: "Potrójna Korona",
            desc: "Wygraj 3 teleturnieje",
            unlocked: wins >= 3,
            progress: Math.min(100, Math.round((wins / 3) * 100)),
            progressLabel: `${Math.min(wins, 3)} / 3`,
            icon: Crown,
            color: "#eab308",
            category: "Zwycięstwa",
        },
        {
            id: "final_master",
            title: "Mistrz Finału",
            desc: "Wygraj 5 teleturniejów",
            unlocked: wins >= 5,
            progress: Math.min(100, Math.round((wins / 5) * 100)),
            progressLabel: `${Math.min(wins, 5)} / 5`,
            icon: Trophy,
            color: "#f59e0b",
            category: "Zwycięstwa",
        },
        {
            id: "champion",
            title: "Niepokonany",
            desc: "Wygraj 10 teleturniejów",
            unlocked: wins >= 10,
            progress: Math.min(100, Math.round((wins / 10) * 100)),
            progressLabel: `${Math.min(wins, 10)} / 10`,
            icon: ShieldCheck,
            color: "#a78bfa",
            category: "Zwycięstwa",
        },
        {
            id: "legend",
            title: "Król Teleturnieju",
            desc: "Wygraj 20 teleturniejów",
            unlocked: wins >= 20,
            progress: Math.min(100, Math.round((wins / 20) * 100)),
            progressLabel: `${Math.min(wins, 20)} / 20`,
            icon: Crown,
            color: "#fbbf24",
            category: "Zwycięstwa",
        },

        // WIEDZA
        {
            id: "hundred_pts",
            title: "Setka Pękła",
            desc: "Zdobądź 100+ pkt w jednej grze",
            unlocked: highestScore >= 100,
            progress: Math.min(100, Math.round((highestScore / 100) * 100)),
            progressLabel: `${Math.min(highestScore, 100)} / 100`,
            icon: Flame,
            color: "#fb923c",
            category: "Wiedza",
        },
        {
            id: "scholar",
            title: "Ekspert Quizu",
            desc: "Zdobądź 300+ punktów",
            unlocked: highestScore >= 300,
            progress: Math.min(100, Math.round((highestScore / 300) * 100)),
            progressLabel: `${Math.min(highestScore, 300)} / 300`,
            icon: Award,
            color: "#c084fc",
            category: "Wiedza",
        },
        {
            id: "genius",
            title: "Umysł Geniusza",
            desc: "Zdobądź 600+ punktów",
            unlocked: highestScore >= 600,
            progress: Math.min(100, Math.round((highestScore / 600) * 100)),
            progressLabel: `${Math.min(highestScore, 600)} / 600`,
            icon: Brain,
            color: "#818cf8",
            category: "Wiedza",
        },
        {
            id: "perfect_score",
            title: "Absolutna Dominacja",
            desc: "Zdobądź 1000+ punktów",
            unlocked: highestScore >= 1000,
            progress: Math.min(100, Math.round((highestScore / 1000) * 100)),
            progressLabel: `${Math.min(highestScore, 1000)} / 1000`,
            icon: Medal,
            color: "#facc15",
            category: "Wiedza",
        },
    ];

    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    return (
        <View className="mt-6">
            <View className="mb-3">
                <View className="flex-row justify-between items-center mb-1.5">
                    <Text className="text-white font-bold text-lg tracking-wide">
                        Osiągnięcia
                    </Text>
                    <View className="bg-yellow-400/20 border border-yellow-400 px-2.5 py-0.5 rounded-full">
                        <Text className="text-yellow-400 text-xs font-bold font-mono">
                            {unlockedCount} / {achievements.length}
                        </Text>
                    </View>
                </View>
                <View className="w-full h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                    <View
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${Math.round((unlockedCount / achievements.length) * 100)}%` }}
                    />
                </View>
            </View>

            <View className="flex-row flex-wrap justify-between gap-y-2.5">
                {achievements.map((ach) => {
                    const IconComponent = ach.icon;
                    return (
                        <View
                            key={ach.id}
                            className={`w-[48.5%] p-3 rounded-2xl border justify-between ${ach.unlocked
                                ? "bg-backgroundLight/95 border-yellow-400"
                                : "bg-slate-900/60 border-slate-800/80"
                                }`}
                        >
                            <View>
                                <View className="flex-row items-center gap-2 mb-1.5">
                                    <View
                                        className="w-8 h-8 rounded-xl items-center justify-center"
                                        style={{
                                            backgroundColor: ach.unlocked
                                                ? `${ach.color}22`
                                                : "#1e293b",
                                        }}
                                    >
                                        <IconComponent
                                            color={ach.unlocked ? ach.color : "#64748b"}
                                            size={18}
                                        />
                                    </View>
                                    <Text
                                        className={`font-bold text-xs flex-1 ${ach.unlocked ? "text-white" : "text-slate-400"
                                            }`}
                                        numberOfLines={1}
                                    >
                                        {ach.title}
                                    </Text>
                                </View>
                                <Text className="text-[11px] text-slate-400 leading-4" numberOfLines={2}>
                                    {ach.desc}
                                </Text>
                            </View>

                            {/* Achievement Progress Bar */}
                            <View className="pt-2 mt-2">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-[10px] text-slate-500 font-medium">
                                        {ach.unlocked ? "Odblokowano" : "Postęp"}
                                    </Text>
                                    <Text
                                        className={`text-[10px] font-mono font-bold ${ach.unlocked ? "text-green-400" : "text-yellow-400"
                                            }`}
                                    >
                                        {ach.unlocked ? "100%" : ach.progressLabel}
                                    </Text>
                                </View>
                                <View className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <View
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${ach.progress}%`,
                                            backgroundColor: ach.unlocked
                                                ? "#22c55e"
                                                : (ach.color || "#facc15"),
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    )
}

export default Achievements;