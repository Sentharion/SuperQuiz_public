import { getAchievements } from "@/constants/achievements";
import { Text, View } from "react-native";

interface AchievementProps {
    highestScore: number;
    wins: number;
}

const Achievements = ({ highestScore, wins }: AchievementProps) => {

    const achievements = getAchievements(highestScore, wins);

    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    return (
        <View className="mt-6">
            <View className="mb-3">
                <View className="flex-row justify-between items-center mb-1.5">
                    <Text className="text-white font-bold text-lg tracking-wide">
                        Osiągnięcia
                    </Text>
                    <View className="bg-yellow-400/20 border border-border px-2.5 py-0.5 rounded-full">
                        <Text className="text-border text-xs font-bold font-mono">
                            {unlockedCount} / {achievements.length}
                        </Text>
                    </View>
                </View>
                <View className="w-full h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                    <View
                        className="h-full bg-border rounded-full"
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
                                ? "bg-backgroundLight/95 border-border"
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
                                        className={`text-[10px] font-mono font-bold ${ach.unlocked ? "text-green-400" : "text-border"
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
                                                : (ach.color || "#00D4E6"),
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