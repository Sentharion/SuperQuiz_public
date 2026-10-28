import { create } from "zustand";
import {persist,createJSONStorage} from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ProfileStore = {
    avatarUrl:string | null;
    username:string;
    highestScore:number;
    flashcardsBestScore:number;
    wins: number;

    updateAvatar:(url:string|null) => void;
    updateUsername:(username:string) => void;
    updateHighestScore:(score:number) => void;
    updateFlashcardsBestScore:(score:number) => void;
    updateWins:(wins:number) => void;
};

export const useProfileStore = create<ProfileStore>()(persist((set) => ({
    avatarUrl: null,
    username: "Gracz",
    highestScore: 0,
    flashcardsBestScore: 0,
    wins: 0,

    updateAvatar:(url) => set({avatarUrl:url}),
    updateUsername:(username) => set({username}),
    updateHighestScore:(score) => set({highestScore:score}),
    updateFlashcardsBestScore:(score) => set({flashcardsBestScore:score}),
    updateWins:(wins) => set({wins}),
}), {
    name:"profile-store",
    storage:createJSONStorage(()=>AsyncStorage)
}));