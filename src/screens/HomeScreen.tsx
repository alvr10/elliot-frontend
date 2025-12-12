import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
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

  // Generate 7 days starting from today
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = date.toLocaleDateString("es-ES", { weekday: "short" });
    const formattedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const dayNum = date.getDate();
    days.push({ dayName: formattedDayName, dayNum });
  }

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: AppTheme.background }]}
      >
        <Text style={[styles.loadingText, { color: AppTheme.text.primary }]}>
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: AppTheme.background }]}
    >
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
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Days Circles */}
        <View style={styles.daysContainer}>
          {days.map((day, index) => (
            <View key={index} style={styles.dayItem}>
              <Text
                style={[styles.dayLabel, { color: AppTheme.text.secondary }]}
              >
                {day.dayName}
              </Text>
              <View
                style={[
                  styles.dayCircle,
                  {
                    backgroundColor: AppTheme.surface,
                    borderColor: AppTheme.border,
                  },
                ]}
              >
                <Text
                  style={[styles.dayNumber, { color: AppTheme.text.primary }]}
                >
                  {day.dayNum}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Daily Intake Card */}
        <View style={[styles.card, { backgroundColor: AppTheme.primary }]}>
          <View style={styles.cardLeft}>
            <Text style={[styles.cardTitle, { color: Colors.white }]}>
              Ingesta diaria
            </Text>
            <Text style={styles.energyIcon}>⚡</Text>
            <Text style={[styles.percentage, { color: Colors.white }]}>
              {Math.round(caffeinePercentage)}%
            </Text>
          </View>
          <View style={styles.cardRight}>
            <CircularProgress
              size={80}
              strokeWidth={8}
              progress={Math.min(caffeinePercentage, 100)}
              backgroundColor={Colors.white}
              progressColor={Colors.secondary}
            >
              <View style={styles.progressCenter}>
                <Text style={[styles.progressText, { color: Colors.white }]}>
                  {dailyIntake?.total_caffeine || 0}
                </Text>
                <Text style={[styles.progressSubText, { color: Colors.white }]}>
                  mg
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
  );
}

const styles = StyleSheet.create({
  container: {
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
    paddingVertical: Spacing.sm,
  },
  greeting: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  profileButton: {
    padding: Spacing.sm,
  },
  profileIcon: {
    fontSize: Typography.size["2xl"],
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
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
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
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
    padding: Spacing.md,
    borderRadius: 8,
  },
  cardLeft: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.sm,
  },
  energyIcon: {
    fontSize: Typography.size["3xl"],
    marginBottom: Spacing.sm,
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
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  progressSubText: {
    fontSize: Typography.size.sm,
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
