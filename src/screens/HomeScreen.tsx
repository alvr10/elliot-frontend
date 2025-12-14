import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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
import CircularProgress from "../components/CircularProgress";
import IntakeLogItem from "../components/IntakeLogItem";
import { AppTheme, Colors, Spacing, Typography } from "../constants";
import { useAuth } from "../context/AuthContext";
import { authApi, caffeineApi } from "../services/api";

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
  const { user } = useAuth();

  // Fetch data when screen comes into focus (after adding intake)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchDailyIntake();
        fetchUserProfile(); // FETCH USER'S DAILY LIMIT
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])
  );

  // NEW FUNCTION: Fetch user's daily limit
  const fetchUserProfile = async () => {
    try {
      console.log("Fetching user profile for daily limit...");
      const profile = await authApi.getProfile();
      const userLimit = profile.dailyLimit || 400;
      console.log("User's daily limit:", userLimit);
      setDailyLimit(userLimit);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const fetchDailyIntake = async () => {
    try {
      if (!user) return;

      console.log("Fetching daily intake...");
      const today = new Date().toISOString().split("T")[0];

      const logs = await caffeineApi.getIntakeHistory("daily", today);
      const total_caffeine = logs.reduce((sum, log) => sum + log.caffeineMg, 0);
      const data = { date: today, total_caffeine, logs };
      console.log("Daily intake data:", data);
      setDailyIntake(data as any);
    } catch (error) {
      console.error("Failed to fetch daily intake:", error);
    } finally {
      setLoading(false);
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
              onPress={() => (navigation as any).navigate("Settings")}
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
              return (
                <View key={index} style={styles.dayItem}>
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
                        backgroundColor: isToday
                          ? AppTheme.primary
                          : AppTheme.surface,
                        borderColor: AppTheme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        {
                          color: isToday
                            ? AppTheme.secondary
                            : AppTheme.text.primary,
                        },
                      ]}
                    >
                      {day.dayNum}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Daily Intake Card */}
          <View style={[styles.card, { backgroundColor: AppTheme.primary }]}>
            <View style={styles.cardLeft}>
              <View style={styles.cardTitleContainer}>
                <MaterialIcons name="bolt" size={24} color={Colors.white} />
                <Text style={[styles.cardTitle, { color: Colors.white }]}>
                  Ingesta diaria
                </Text>
              </View>
              <Text style={[styles.percentage, { color: Colors.white }]}>
                {Math.round(caffeinePercentage)}%
              </Text>
            </View>
            <View style={styles.cardRight}>
              <CircularProgress
                size={80}
                strokeWidth={8}
                progress={Math.min(caffeinePercentage, 100)}
                backgroundColor="transparent"
                progressColor={Colors.secondary}
                centerFillColor={AppTheme.secondary}
              >
                <View style={styles.progressCenter}>
                  <Text style={[styles.progressText, { color: Colors.white }]}>
                    {dailyIntake?.total_caffeine || 0}
                  </Text>
                  <View style={styles.progressSeparator} />
                  <Text
                    style={[styles.progressLimitText, { color: Colors.white }]}
                  >
                    {dailyLimit}
                  </Text>
                </View>
              </CircularProgress>
            </View>
          </View>

          {/* Today's History */}
          {dailyIntake?.logs && dailyIntake.logs.length > 0 && (
            <View style={styles.historyContainer}>
              <Text
                style={[styles.historyTitle, { color: AppTheme.text.primary }]}
              >
                Historial de hoy
              </Text>
              <View style={styles.historyList}>
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
        </ScrollView>
      </SafeAreaView>

      {/* Tabbar */}
      <View style={styles.tabbar}>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate("History")}
        >
          <MaterialIcons
            name="bar-chart"
            size={32}
            color={AppTheme.secondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate("AddIntake")}
          style={[styles.addButton]}
        >
          <MaterialIcons
            name="add-circle"
            size={48}
            color={AppTheme.secondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate("Settings")}
        >
          <MaterialIcons name="person" size={32} color={AppTheme.secondary} />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 80,
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
    flexDirection: "row",
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: 16,
  },
  cardLeft: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginLeft: Spacing.xs,
  },
  percentage: {
    fontSize: Typography.size["4xl"],
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
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
  },
  progressSeparator: {
    height: 1,
    backgroundColor: Colors.secondary,
    width: 20,
    marginVertical: 2,
  },
  progressLimitText: {
    fontSize: Typography.size.base,
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
  tabbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: AppTheme.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 54,
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 16,
  },
  addButton: {
    marginTop: -20,
    borderWidth: 2,
    borderColor: AppTheme.error,
    borderRadius: 26,
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
});
