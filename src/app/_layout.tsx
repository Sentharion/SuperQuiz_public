import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {LinearGradient} from 'expo-linear-gradient';
import { View, Image, StyleSheet } from 'react-native';
import "../global.css";
import { useEffect } from 'react';
import SoundService from '@/services/sound';
import { useGameStore } from '@/store/gameStore';
import AsyncStorage from '@react-native-async-storage/async-storage';


SplashScreen.preventAutoHideAsync();


export default function TabLayout() {

  useEffect(() => {
    async function prepareApp() {
      try {
        await SoundService.init();
        await useGameStore.getState().loadFlashcardScores();
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
          'rgba(59, 130, 246, 0.85)',
          'rgba(59, 110, 159, 0.85)',
          'rgba(59, 130, 246, 0.85)'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" }, animation:"slide_from_right" }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

