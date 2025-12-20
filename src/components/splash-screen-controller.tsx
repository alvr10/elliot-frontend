import { useAuthContext } from "@/hooks";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function SplashScreenController() {
  const { isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading) {
      // Hide the splash screen when loading is complete
      SplashScreen.hideAsync().catch(error => {
        console.error("Error hiding splash screen:", error);
      });
    }
  }, [isLoading]);

  return null;
}
