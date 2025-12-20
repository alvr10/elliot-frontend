import { AppTheme, Spacing, Typography } from "@/constants";
import { useAuth } from "@/hooks";
import { caffeineApi } from "@/services/api";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

interface DailyTotal {
  [date: string]: number;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: AppTheme.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: AppTheme.text.primary,
    fontSize: Typography.size.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
  },
  headerTitle: {
    color: AppTheme.text.primary,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  backButton: {
    color: AppTheme.text.primary,
    fontSize: Typography.size.lg,
  },
  scrollView: {
    flex: 1,
  },
  chartContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  chartTitle: {
    color: AppTheme.text.primary,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.md,
  },
  chartWrapper: {
    backgroundColor: AppTheme.surface,
    borderRadius: 8,
    padding: Spacing.md,
    position: "relative",
  },
  dailyLimitBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: AppTheme.background,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dailyLimitText: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.xs,
  },
  statsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    color: AppTheme.text.primary,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.md,
  },
  statCard: {
    backgroundColor: AppTheme.surface,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
    marginBottom: Spacing.md,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.base,
  },
  statValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  statValueNormal: {
    color: AppTheme.text.primary,
  },
  statValueSuccess: {
    color: AppTheme.success,
  },
  statValueDanger: {
    color: AppTheme.error,
  },
  recentDaysContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing["2xl"],
  },
  emptyState: {
    backgroundColor: AppTheme.surface,
    padding: Spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  emptyStateText: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.base,
    textAlign: "center",
  },
  dayItem: {
    backgroundColor: AppTheme.surface,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
    marginBottom: Spacing.sm,
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayDate: {
    color: AppTheme.text.primary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },
  dayValues: {
    alignItems: "flex-end",
  },
  dayAmount: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  dayDifference: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.xs,
  },
});

export default function HistoryScreen() {
  const [dailyTotals, setDailyTotals] = useState<DailyTotal>({});
  const [dailyLimit, setDailyLimit] = useState(400);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchHistory();
      fetchDailyLimit();
    }
  }, [user]);

  const fetchDailyLimit = async () => {
    try {
      const response = await caffeineApi.getDailyLimit();
      setDailyLimit(response.dailyLimitMg || 400);
    } catch (error) {
      console.error("Failed to fetch daily limit:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      console.log("Fetching history...");
      const historyData = await caffeineApi.getIntakeHistory();

      const transformedData: DailyTotal = {};
      historyData.forEach(item => {
        const date = new Date(item.consumedAt).toISOString().split("T")[0];
        if (!transformedData[date]) {
          transformedData[date] = 0;
        }
        transformedData[date] += item.caffeineMg;
      });

      setDailyTotals(transformedData);
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
            } catch {
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

  const validTotals = Object.values(dailyTotals)
    .filter(total => !isNaN(Number(total)) && isFinite(Number(total)))
    .map(total => Number(total));

  const totalDays = validTotals.length;
  const averageIntake =
    totalDays > 0
      ? Math.round(validTotals.reduce((a, b) => a + b, 0) / totalDays)
      : 0;
  const daysOverLimit = validTotals.filter(total => total > dailyLimit).length;
  const maxIntake = validTotals.length > 0 ? Math.max(...validTotals) : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Intake History</Text>
        <View />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Chart */}
        {last7Days.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Last 7 Days</Text>
            <View style={styles.chartWrapper}>
              <LineChart
                data={chartData}
                width={screenWidth - 80}
                height={200}
                chartConfig={{
                  backgroundColor: AppTheme.surface,
                  backgroundGradientFrom: AppTheme.surface,
                  backgroundGradientTo: AppTheme.surface,
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
                    stroke: AppTheme.primary,
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: "",
                  },
                }}
                bezier
                style={{
                  borderRadius: 8,
                }}
              />
              <View style={styles.dailyLimitBadge}>
                <Text style={styles.dailyLimitText}>
                  Daily limit: {dailyLimit}mg
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Statistics</Text>

          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Daily Intake</Text>
              <Text style={[styles.statValue, styles.statValueNormal]}>
                {averageIntake}mg
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Days Over Your Limit</Text>
              <Text
                style={[
                  styles.statValue,
                  daysOverLimit > 0
                    ? styles.statValueDanger
                    : styles.statValueSuccess,
                ]}
              >
                {daysOverLimit}/{totalDays}
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Highest Single Day</Text>
              <Text
                style={[
                  styles.statValue,
                  maxIntake > dailyLimit
                    ? styles.statValueDanger
                    : styles.statValueNormal,
                ]}
              >
                {maxIntake}mg
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Your Daily Limit</Text>
              <Text style={[styles.statValue, styles.statValueNormal]}>
                {dailyLimit}mg
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Days Tracked</Text>
              <Text style={[styles.statValue, styles.statValueNormal]}>
                {totalDays}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Days */}
        <View style={styles.recentDaysContainer}>
          <Text style={styles.sectionTitle}>Recent Days</Text>
          {sortedEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No intake data yet. Start logging your caffeine to see your
                history!
              </Text>
            </View>
          ) : (
            sortedEntries
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
                } catch {
                  formattedDate = date;
                }

                // Safe number handling
                const safeTotal = Number(total) || 0;

                return (
                  <View key={date} style={styles.dayItem}>
                    <View style={styles.dayRow}>
                      <Text style={styles.dayDate}>{formattedDate}</Text>
                      <View style={styles.dayValues}>
                        <Text
                          style={[
                            styles.dayAmount,
                            safeTotal > dailyLimit
                              ? styles.statValueDanger
                              : styles.statValueNormal,
                          ]}
                        >
                          {safeTotal}mg
                        </Text>
                        <Text style={styles.dayDifference}>
                          {safeTotal > dailyLimit
                            ? `+${safeTotal - dailyLimit}mg over`
                            : `${dailyLimit - safeTotal}mg under`}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
