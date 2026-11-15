import SoundService from '@/services/sound';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import "../global.css";
import { AchievementToastProvider } from './context/AchievementProvider';


SplashScreen.preventAutoHideAsync();


export default function TabLayout() {

  useEffect(() => {
    async function prepareApp() {
      try {
        await SoundService.init();
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    prepareApp();

  }, []);


  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/background.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      <LinearGradient
        colors={[
          'rgba(11, 45, 107, 0.85)',
          'rgba(10, 59, 145, 0.85)',
          'rgba(11, 76, 200, 0.85)'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <AchievementToastProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" }, animation: "slide_from_right" }} />
      </AchievementToastProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

