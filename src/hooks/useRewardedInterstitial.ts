import { useEffect, useState } from 'react';
import { AdEventType, RewardedAdEventType, RewardedInterstitialAd, TestIds } from 'react-native-google-mobile-ads';

const ad = RewardedInterstitialAd.createForAdRequest(
    __DEV__
        ? TestIds.REWARDED_INTERSTITIAL
        : 'TWOJ_REWARDED_INTERSTITIAL_ID'
);

export function useRewardedInterstitial() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const unsubscribeLoaded = ad.addAdEventListener(
            RewardedAdEventType.LOADED,
            () => setLoaded(true)
        );

        const unsubscribeEarned = ad.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            (reward) => {
                console.log('Przyznana nagroda:', reward);
            }
        );

        const unsubscribeClosed = ad.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                setLoaded(false);
                ad.load();
            }
        );

        const unsubscribeError = ad.addAdEventListener(
            AdEventType.ERROR,
            () => setLoaded(false)
        );

        ad.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeClosed();
            unsubscribeError();
        };
    }, []);

    const show = async () => {
        if (loaded) {
            await ad.show();
            return true;
        }

        return false;
    };

    return { loaded, show };
}
