import { CircularProgress, IntakeLogItem } from "@/components";
import { AppTheme, Colors, Spacing, Typography } from "@/constants";
import { useAuth } from "@/hooks";
import { caffeineApi } from "@/services/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface DailyIntake {
  date: string;
  total_caffeine: number;
  logs: import("@/types/api").IntakeLogResponse[];
}

export default function HomeScreen() {
  const [dailyIntake, setDailyIntake] = useState<DailyIntake | null>(null);
  const [dailyLimit, setDailyLimit] = useState(400);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const router = useRouter();
  const { user } = useAuth();

  // Fetch data when screen comes into focus (after adding intake)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchDailyIntake();
        fetchUserLimit();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])
  );

  const fetchUserLimit = async () => {
    try {
      const response = await caffeineApi.getDailyLimit();
      const userLimit = response?.dailyLimitMg || 400;
      setDailyLimit(userLimit);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const fetchDailyIntake = async (date?: string) => {
    try {
      if (!user) return;

      const targetDate = date || selectedDate;
      const logs =
        (await caffeineApi.getIntakeHistory("daily", targetDate)) || [];

      // Calculate total caffeine from the logs
      const total_caffeine = logs.reduce(
        (sum, log) => sum + (log.caffeineMg || 0),
        0
      );
      const data = { date: targetDate, total_caffeine, logs };
      setDailyIntake(data as any);
    } catch (error) {
      console.error("Failed to fetch daily intake:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDailyIntake(selectedDate);
    await fetchUserLimit();
    setRefreshing(false);
  };

  const caffeinePercentage = dailyIntake
    ? (dailyIntake.total_caffeine / dailyLimit) * 100
    : 0;

  // Generate 7 days starting from Monday of current week
  const days = [];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dayName = date.toLocaleDateString("es-ES", { weekday: "short" });
    const formattedDayName = dayName.toUpperCase().replace(".", "");
    const dayNum = date.getDate();
    const dateString = date.toISOString().split("T")[0];
    days.push({ dayName: formattedDayName, dayNum, date: dateString });
  }

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: AppTheme.background }]}
      >
        <SafeAreaView style={styles.safeArea}>
          <Text style={[styles.loadingText, { color: AppTheme.text.primary }]}>
            Loading...
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: AppTheme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={AppTheme.text.primary}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.greeting, { color: AppTheme.text.primary }]}>
              Hola, {user?.email ? user.email.split("@")[0] : "Usuario"}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/settings")}
              style={styles.profileButton}
            >
              <Image
                source={require("../../assets/images/profile.png")}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>

          {/* Days Circles */}
          <View style={styles.daysContainer}>
            {days.map((day, index) => {
              const isToday =
                day.date === new Date().toISOString().split("T")[0];
              const isSelected = day.date === selectedDate;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.dayItem}
                  onPress={() => {
                    setSelectedDate(day.date);
                    fetchDailyIntake(day.date);
                  }}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      { color: AppTheme.text.secondary },
                    ]}
                  >
                    {day.dayName}
                  </Text>
                  <View
                    style={[
                      styles.dayCircle,
                      {
                        backgroundColor: isSelected
                          ? AppTheme.primary
                          : isToday
                            ? AppTheme.surface
                            : AppTheme.surface,
                        borderColor: isSelected
                          ? AppTheme.primary
                          : AppTheme.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        {
                          color: isSelected
                            ? AppTheme.secondary
                            : isToday
                              ? AppTheme.text.primary
                              : AppTheme.text.primary,
                        },
                      ]}
                    >
                      {day.dayNum}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Daily Intake Card */}
          <View style={[styles.card, { backgroundColor: AppTheme.primary }]}>
            {/* Title and icon at top left corner */}
            <View style={styles.cardHeader}>
              <MaterialIcons name="bolt" size={24} color={Colors.white} />
              <Text style={[styles.cardTitle, { color: Colors.white }]}>
                Ingesta diaria
              </Text>
            </View>

            {/* Content area with percentage and circular progress */}
            <View style={styles.cardContent}>
              <View style={styles.cardLeft}>
                <Text style={[styles.percentage, { color: Colors.white }]}>
                  {Math.round(caffeinePercentage)}%
                </Text>
              </View>
              <View style={styles.cardRight}>
                <CircularProgress
                  size={120}
                  strokeWidth={10}
                  progress={Math.min(caffeinePercentage, 100)}
                  backgroundColor="transparent"
                  progressColor="#FFA500" // Yellow-orange color
                  centerFillColor={AppTheme.secondary}
                >
                  <View style={styles.progressCenter}>
                    <Text
                      style={[styles.progressText, { color: Colors.primary }]}
                    >
                      {dailyIntake?.total_caffeine || 0}
                    </Text>
                    <View style={styles.progressSeparator} />
                    <Text
                      style={[
                        styles.progressLimitText,
                        { color: Colors.primary },
                      ]}
                    >
                      {dailyLimit} mg
                    </Text>
                  </View>
                </CircularProgress>
              </View>
            </View>
          </View>

          {/* Selected Day's History */}
          {dailyIntake?.logs && dailyIntake.logs.length > 0 && (
            <View style={styles.historyContainer}>
              <Text
                style={[styles.historyTitle, { color: AppTheme.text.primary }]}
              >
                {selectedDate === new Date().toISOString().split("T")[0]
                  ? "Historial de hoy"
                  : `Historial del ${new Date(selectedDate).toLocaleDateString(
                      "es-ES",
                      {
                        day: "numeric",
                        month: "short",
                      }
                    )}`}
              </Text>
              <View style={styles.historyList}>
                {dailyIntake.logs.map(log => (
                  <IntakeLogItem key={log.id} log={log} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    fontSize: Typography.size.lg,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing["2xl"],
  },
  greeting: {
    fontSize: Typography.size["3xl"],
    fontWeight: Typography.weight.bold,
  },
  profileButton: {
    padding: Spacing.sm,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 999,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  dayItem: {
    alignItems: "center",
  },
  dayLabel: {
    fontSize: Typography.size.sm,
    marginBottom: Spacing.xs,
  },
  dayCircle: {
    width: 50,
    height: 50,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  dayNumber: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },
  card: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: 16,
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  cardContent: {
    flexDirection: "row",
    flex: 1,
  },
  cardLeft: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginLeft: Spacing.xs,
  },
  percentage: {
    fontSize: 60,
    fontWeight: Typography.weight.bold,
  },
  cardRight: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  progressCenter: {
    alignItems: "center",
  },
  progressText: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  progressSeparator: {
    height: 1,
    backgroundColor: Colors.primary,
    width: 40,
    marginVertical: 2,
  },
  progressLimitText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  historyContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  historyTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.md,
  },
  historyList: {
    // Add spacing if needed
  },
});
