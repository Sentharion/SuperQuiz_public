
import { useCallback, useEffect, useState } from 'react';
import {
    AdEventType,
    InterstitialAd,
    TestIds,
} from 'react-native-google-mobile-ads';

const ad = InterstitialAd.createForAdRequest(
    __DEV__ ? TestIds.INTERSTITIAL : 'xxx'
);

export function useInterstitial() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const unsubscribeLoaded = ad.addAdEventListener(
            AdEventType.LOADED,
            () => setLoaded(true)
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
            unsubscribeClosed();
            unsubscribeError();
        };
    }, []);

    const show = useCallback(async (): Promise<boolean> => {
        if (!loaded) return false;

        return new Promise((resolve) => {
            let finished = false;

            const finish = (success: boolean) => {
                if (finished) return;

                finished = true;
                unsubscribeClosed();
                unsubscribeError();
                resolve(success);
            };

            const unsubscribeClosed = ad.addAdEventListener(
                AdEventType.CLOSED,
                () => finish(true)
            );

            const unsubscribeError = ad.addAdEventListener(
                AdEventType.ERROR,
                () => finish(false)
            );

            ad.show().catch(() => finish(false));
        });
    }, [loaded]);

    return { loaded, show };
}
