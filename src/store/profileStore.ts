import { create } from "zustand";
import {persist,createJSONStorage} from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ProfileStore = {
    avatarUrl:string | null;
    username:string;
    highestScore:number;
    flashcardsBestScore:number;
    wins: number;
    isPremium: boolean;

    updateAvatar:(url:string|null) => void;
    updateUsername:(username:string) => void;
    updateHighestScore:(score:number) => void;
    updateFlashcardsBestScore:(score:number) => void;
    updateWins:(wins:number) => void;
    resetStats:() => void;
    setPremium:(isPremium:boolean) => void;
};

export const useProfileStore = create<ProfileStore>()(persist((set) => ({
    avatarUrl: null,
    username: "Gracz",
    highestScore: 0,
    flashcardsBestScore: 0,
    wins: 0,
    isPremium: false,

    updateAvatar:(url) => set({avatarUrl:url}),
    updateUsername:(username) => set({username}),
    updateHighestScore:(score) => set({highestScore:score}),
    updateFlashcardsBestScore:(score) => set({flashcardsBestScore:score}),
    updateWins:(wins) => set({wins}),
    resetStats:() => set({highestScore: 0, flashcardsBestScore: 0, wins: 0}),
    setPremium:(isPremium) => set({isPremium}),
}), {
    name:"profile-store",
    storage:createJSONStorage(()=>AsyncStorage)
}));