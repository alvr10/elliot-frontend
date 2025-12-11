import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { createClient } from "@supabase/supabase-js";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularProgress from "../components/CircularProgress";
import IntakeLogItem from "../components/IntakeLogItem";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

interface IntakeLog {
  id: number;
  total_caffeine: number;
  servings: number;
  consumed_at: string;
  drinks: {
    name: string;
    category: string;
    brand?: string;
  };
}

interface DailyIntake {
  date: string;
  total_caffeine: number;
  logs: IntakeLog[];
}

export default function HomeScreen() {
  const [dailyIntake, setDailyIntake] = useState<DailyIntake | null>(null);
  const [dailyLimit, setDailyLimit] = useState(400); // USER'S CUSTOM LIMIT
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { user, getCurrentToken } = useAuth();
  const { showNotification } = useNotification();

  // Fetch data when screen comes into focus (after adding intake)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchDailyIntake();
        fetchUserProfile(); // FETCH USER'S DAILY LIMIT
      }
    }, [user])
  );

  // NEW FUNCTION: Fetch user's daily limit
  const fetchUserProfile = async () => {
    try {
      const token = await getCurrentToken();
      if (!token) return;

      console.log("Fetching user profile for daily limit...");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const userLimit = data.daily_caffeine_limit || 400;
        console.log("User's daily limit:", userLimit);
        setDailyLimit(userLimit);
      } else {
        console.error("Failed to fetch user profile:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const fetchDailyIntake = async () => {
    try {
      if (!user) return;

      console.log("Fetching daily intake...");
      const today = new Date().toISOString().split("T")[0];
      const token = await getCurrentToken();

      if (!token) {
        console.error("No token available");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/intake/daily/${today}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Daily intake response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Daily intake error:", errorText);
        return;
      }

      const data = await response.json();
      console.log("Daily intake data:", data);
      setDailyIntake(data);
    } catch (error) {
      console.error("Failed to fetch daily intake:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const quickDrinks = [
    { name: "Drip Coffee", caffeine: 95, id: 5 },
    { name: "Espresso", caffeine: 64, id: 1 },
    { name: "Green Tea", caffeine: 25, id: 18 },
  ];

  const quickAddIntake = async (drinkName: string, caffeine: number) => {
    try {
      const token = await getCurrentToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/intake`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            drink_id: quickDrinks.find(d => d.name === drinkName)?.id,
            servings: 1,
          }),
        }
      );

      if (response.ok) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        fetchDailyIntake();
        showNotification(`Added ${drinkName} (${caffeine}mg)`, "success");
      }
    } catch (error) {
      showNotification("Failed to add intake", "error");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDailyIntake();
    await fetchUserProfile(); // ALSO REFRESH USER PROFILE
    setRefreshing(false);
  };

  // USE USER'S CUSTOM DAILY LIMIT
  const caffeinePercentage = dailyIntake
    ? (dailyIntake.total_caffeine / dailyLimit) * 100
    : 0;
  const isOverLimit = caffeinePercentage > 100;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      >
        {/* Header with Settings */}
        <View className="flex-row justify-between items-center px-6 pt-4 pb-6">
          <View>
            <Text className="text-white text-2xl font-bold">
              {getGreeting()}
            </Text>
            <Text className="text-gray-400 text-base">Today's Intake</Text>
            <Text className="text-gray-500 text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings" as never)}
            className="p-2"
          >
            <Text className="text-white text-2xl">⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Debug Info */}
        {__DEV__ && (
          <View className="mx-6 mb-4 bg-gray-800 p-3 rounded">
            <Text className="text-yellow-400 text-xs">
              DEBUG: Total caffeine: {dailyIntake?.total_caffeine || 0}mg, Daily
              limit: {dailyLimit}mg, Logs: {dailyIntake?.logs?.length || 0}
            </Text>
          </View>
        )}

        {/* Circular Progress */}
        <View className="items-center mb-8">
          <CircularProgress
            size={200}
            strokeWidth={12}
            progress={Math.min(caffeinePercentage, 100)}
            backgroundColor="#1F2937"
            progressColor={isOverLimit ? "#DC2626" : "#FFFFFF"}
          >
            <View className="items-center">
              <Text className="text-white text-3xl font-bold">
                {dailyIntake?.total_caffeine || 0}
              </Text>
              <Text className="text-gray-400 text-sm">mg caffeine</Text>
              <Text className="text-gray-400 text-xs mt-1">
                {dailyLimit - (dailyIntake?.total_caffeine || 0) > 0
                  ? `${
                      dailyLimit - (dailyIntake?.total_caffeine || 0)
                    }mg remaining`
                  : `${
                      (dailyIntake?.total_caffeine || 0) - dailyLimit
                    }mg over limit`}
              </Text>
            </View>
          </CircularProgress>
        </View>

        {/* Status Message - Updated to use custom limit */}
        <View className="mx-6 mb-6">
          <View
            className={`p-4 rounded-lg border ${
              isOverLimit
                ? "bg-red-900 border-red-700"
                : caffeinePercentage > 75
                  ? "bg-yellow-900 border-yellow-700"
                  : "bg-gray-900 border-gray-700"
            }`}
          >
            <Text className="text-white text-center font-medium">
              {isOverLimit
                ? `⚠️ Over your ${dailyLimit}mg daily limit - Consider reducing intake`
                : caffeinePercentage > 75
                  ? `🟡 Approaching your ${dailyLimit}mg daily limit`
                  : `✅ Within your ${dailyLimit}mg daily limit`}
            </Text>
          </View>
        </View>

        {/* Add Intake Button */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={() => navigation.navigate("AddIntake" as never)}
            className="bg-white py-4 rounded-lg"
          >
            <Text className="text-black text-lg font-bold text-center">
              + Log Caffeine Intake
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Add */}
        <View className="px-6 mb-6">
          <Text className="text-gray-400 text-sm mb-3">Quick Add</Text>
          <View className="flex-row space-x-3">
            {quickDrinks.map(drink => (
              <TouchableOpacity
                key={drink.name}
                onPress={() => quickAddIntake(drink.name, drink.caffeine)}
                className="flex-1 bg-gray-800 border border-gray-600 py-3 px-2 rounded-lg"
              >
                <Text className="text-white text-sm font-medium text-center">
                  {drink.name}
                </Text>
                <Text className="text-gray-400 text-xs text-center">
                  {drink.caffeine}mg
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Drinks Management */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={() => navigation.navigate("ManageCustomDrinks" as never)}
            className="bg-gray-800 border border-gray-600 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-medium">
              Manage My Custom Drinks
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Logs */}
        {dailyIntake?.logs && dailyIntake.logs.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-white text-xl font-bold mb-4">
              Today's History
            </Text>
            <View className="space-y-3">
              {dailyIntake.logs.map(log => (
                <IntakeLogItem
                  key={log.id}
                  log={log}
                  onUpdate={fetchDailyIntake}
                />
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={() => navigation.navigate("History" as never)}
            className="bg-gray-900 py-3 rounded-lg border border-gray-700"
          >
            <Text className="text-white text-center font-medium">
              View Full History
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
