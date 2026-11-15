import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, X } from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Achievement } from "@/constants/achievements";
import SoundService from "@/services/sound";

type Props = {
    achievement: Achievement | null;
    onHide: () => void;
};

export default function AchievementToast({
    achievement,
    onHide,
}: Props) {
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(-160)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.92)).current;

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isHidingRef = useRef(false);

    const hide = () => {
        if (isHidingRef.current) return;
        isHidingRef.current = true;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -160,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 0.95,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            isHidingRef.current = false;
            onHide();
        });
    };

    useEffect(() => {
        if (!achievement) return;

        isHidingRef.current = false;
        translateY.setValue(-160);
        opacity.setValue(0);
        scale.setValue(0.92);

        try {
            SoundService.play("correct");
        } catch {
            // Audio error non-blocking
        }

        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                damping: 15,
                stiffness: 130,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                damping: 14,
                stiffness: 140,
                useNativeDriver: true,
            }),
        ]).start();

        timeoutRef.current = setTimeout(() => {
            hide();
        }, 4000);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [achievement?.id]);

    if (!achievement) return null;

    const Icon = achievement.icon;

    return (
        <View
            pointerEvents="box-none"
            style={[
                styles.container,
                { top: Math.max(insets.top + 8, 16) },
            ]}
        >
            <Animated.View
                style={[
                    styles.wrapper,
                    {
                        shadowColor: achievement.color,
                        opacity,
                        transform: [
                            { translateY },
                            { scale },
                        ],
                    },
                ]}
            >
                <TouchableOpacity
                    activeOpacity={0.92}
                    onPress={hide}
                    style={styles.touchable}
                >
                    <LinearGradient
                        colors={["#0f172a", "#1e1b4b"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.card,
                            { borderColor: achievement.color },
                        ]}
                    >
                        <View
                            style={[
                                styles.iconContainer,
                                {
                                    backgroundColor: `${achievement.color}25`,
                                    borderColor: `${achievement.color}55`,
                                },
                            ]}
                        >
                            <Icon
                                size={26}
                                color={achievement.color}
                                strokeWidth={2.4}
                            />
                        </View>

                        <View style={styles.content}>
                            <View style={styles.header}>
                                <Sparkles size={13} color="#38bdf8" />
                                <Text style={styles.label}>
                                    OSIĄGNIĘCIE ODBLOKOWANE!
                                </Text>
                            </View>

                            <Text
                                style={styles.title}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {achievement.title}
                            </Text>

                            <Text
                                style={styles.description}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {achievement.desc}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={hide}
                            style={styles.closeButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            accessibilityLabel="Zamknij powiadomienie"
                        >
                            <X size={18} color="#94a3b8" />
                        </TouchableOpacity>

                        <View
                            style={[
                                styles.bottomLine,
                                { backgroundColor: achievement.color },
                            ]}
                        />
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 14,
        right: 14,
        zIndex: 9999,
        elevation: 20,
    },
    wrapper: {
        width: "100%",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 12,
    },
    touchable: {
        width: "100%",
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 18,
        borderWidth: 1,
        overflow: "hidden",
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
    },
    content: {
        flex: 1,
        paddingRight: 26,
        gap: 2,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    label: {
        color: "#38bdf8",
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 0.8,
    },
    title: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "900",
    },
    description: {
        color: "#cbd5e1",
        fontSize: 12,
        lineHeight: 16,
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        padding: 4,
    },
    bottomLine: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        opacity: 0.85,
    },
});
