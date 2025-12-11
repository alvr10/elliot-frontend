import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

interface DailyTotal {
  [date: string]: number;
}

export default function HistoryScreen() {
  const [dailyTotals, setDailyTotals] = useState<DailyTotal>({});
  const [dailyLimit, setDailyLimit] = useState(400); // USER'S CUSTOM LIMIT
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { user, getCurrentToken } = useAuth();

  useEffect(() => {
    if (user) {
      fetchHistory();
      fetchUserProfile(); // FETCH USER'S DAILY LIMIT
    }
  }, [user]);

  // NEW FUNCTION: Fetch user's daily limit
  const fetchUserProfile = async () => {
    try {
      const token = await getCurrentToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDailyLimit(data.daily_caffeine_limit || 400);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      console.log("Fetching history...");
      const token = await getCurrentToken();

      if (!token) {
        console.error("No token available");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/intake/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("History response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("History fetch error:", errorText);
        return;
      }

      const data = await response.json();
      console.log("History data:", data);

      // Ensure all values are valid numbers
      const sanitizedData: DailyTotal = {};
      for (const [date, total] of Object.entries(data)) {
        const numTotal = Number(total);
        if (!isNaN(numTotal) && isFinite(numTotal)) {
          sanitizedData[date] = numTotal;
        } else {
          console.warn(`Invalid caffeine total for date ${date}:`, total);
          sanitizedData[date] = 0;
        }
      }

      setDailyTotals(sanitizedData);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const screenWidth = Dimensions.get("window").width;

  // Prepare chart data with safe number handling
  const sortedEntries = Object.entries(dailyTotals)
    .filter(([date, total]) => !isNaN(Number(total))) // Filter out invalid numbers
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());

  const last7Days = sortedEntries.slice(-7);

  // Ensure chart has valid data
  const chartData = {
    labels:
      last7Days.length > 0
        ? last7Days.map(([date]) => {
            try {
              return new Date(date).toLocaleDateString("en-US", {
                weekday: "short",
              });
            } catch (e) {
              return "Invalid";
            }
          })
        : ["No Data"],
    datasets: [
      {
        data:
          last7Days.length > 0
            ? last7Days.map(([, total]) => Number(total) || 0)
            : [0],
        strokeWidth: 3,
      },
    ],
  };

  // Calculate stats with safe number handling - USE CUSTOM DAILY LIMIT
  const validTotals = Object.values(dailyTotals)
    .filter(total => !isNaN(Number(total)) && isFinite(Number(total)))
    .map(total => Number(total));

  const totalDays = validTotals.length;
  const averageIntake =
    totalDays > 0
      ? Math.round(validTotals.reduce((a, b) => a + b, 0) / totalDays)
      : 0;
  const daysOverLimit = validTotals.filter(total => total > dailyLimit).length; // USE CUSTOM LIMIT
  const maxIntake = validTotals.length > 0 ? Math.max(...validTotals) : 0;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">Loading history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-white text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Intake History</Text>
        <View />
      </View>

      <ScrollView className="flex-1">
        {/* Chart */}
        {last7Days.length > 0 && (
          <View className="px-6 py-6">
            <Text className="text-white text-lg font-bold mb-4">
              Last 7 Days
            </Text>
            <View className="bg-gray-900 rounded-lg p-4">
              <LineChart
                data={chartData}
                width={screenWidth - 80}
                height={200}
                chartConfig={{
                  backgroundColor: "#1F2937",
                  backgroundGradientFrom: "#1F2937",
                  backgroundGradientTo: "#1F2937",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    `rgba(156, 163, 175, ${opacity})`,
                  style: {
                    borderRadius: 8,
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#FFFFFF",
                  },
                }}
                bezier
                style={{
                  borderRadius: 8,
                }}
              />
              <View className="absolute top-4 right-4">
                <View className="bg-black bg-opacity-50 px-2 py-1 rounded">
                  <Text className="text-gray-300 text-xs">
                    Daily limit: {dailyLimit}mg
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Stats */}
        <View className="px-6 py-4">
          <Text className="text-white text-lg font-bold mb-4">Statistics</Text>
          <View className="space-y-4">
            <View className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-300">Average Daily Intake</Text>
                <Text className="text-white text-xl font-bold">
                  {averageIntake}mg
                </Text>
              </View>
            </View>

            <View className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-300">Days Over Your Limit</Text>
                <Text
                  className={`text-xl font-bold ${
                    daysOverLimit > 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {daysOverLimit}/{totalDays}
                </Text>
              </View>
            </View>

            <View className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-300">Highest Single Day</Text>
                <Text
                  className={`text-xl font-bold ${
                    maxIntake > dailyLimit ? "text-red-400" : "text-white"
                  }`}
                >
                  {maxIntake}mg
                </Text>
              </View>
            </View>

            <View className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-300">Your Daily Limit</Text>
                <Text className="text-white text-xl font-bold">
                  {dailyLimit}mg
                </Text>
              </View>
            </View>

            <View className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-300">Days Tracked</Text>
                <Text className="text-white text-xl font-bold">
                  {totalDays}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Days */}
        <View className="px-6 py-4 pb-8">
          <Text className="text-white text-lg font-bold mb-4">Recent Days</Text>
          {sortedEntries.length === 0 ? (
            <View className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <Text className="text-gray-400 text-center">
                No intake data yet. Start logging your caffeine to see your
                history!
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {sortedEntries
                .slice(-10)
                .reverse()
                .map(([date, total]) => {
                  // Safe date formatting
                  let formattedDate;
                  try {
                    formattedDate = new Date(date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                  } catch (e) {
                    formattedDate = date;
                  }

                  // Safe number handling
                  const safeTotal = Number(total) || 0;

                  return (
                    <View
                      key={date}
                      className="bg-gray-900 p-4 rounded-lg border border-gray-700"
                    >
                      <View className="flex-row justify-between items-center">
                        <Text className="text-white font-medium">
                          {formattedDate}
                        </Text>
                        <View className="items-end">
                          <Text
                            className={`text-lg font-bold ${
                              safeTotal > dailyLimit
                                ? "text-red-400"
                                : "text-white"
                            }`}
                          >
                            {safeTotal}mg
                          </Text>
                          <Text className="text-gray-400 text-xs">
                            {safeTotal > dailyLimit
                              ? `+${safeTotal - dailyLimit}mg over`
                              : `${dailyLimit - safeTotal}mg under`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
