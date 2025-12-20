import { AppTheme, Spacing, Typography } from "@/constants";
import { useAuth } from "@/hooks";
import { caffeineApi } from "@/services/api";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

interface DailyTotal {
  [date: string]: number;
}

export default function HistoryScreen() {
  const [dailyTotals, setDailyTotals] = useState<DailyTotal>({});
  const [dailyLimit, setDailyLimit] = useState(400);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCurrentWeekHistory();
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

  const fetchCurrentWeekHistory = async () => {
    try {
      console.log("Fetching current week history...");

      // Generate current week dates from Monday to Sunday
      const days = [];
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateString = date.toISOString().split("T")[0];
        days.push(dateString);
      }

      // Fetch history for each day of the current week
      const transformedData: DailyTotal = {};

      for (const date of days) {
        try {
          const historyData = await caffeineApi.getIntakeHistory("daily", date);

          let dayTotal = 0;
          historyData.forEach(item => {
            dayTotal += item.caffeineMg || 0;
          });

          transformedData[date] = dayTotal;
        } catch (error) {
          console.error(`Failed to fetch history for ${date}:`, error);
          transformedData[date] = 0;
        }
      }

      setDailyTotals(transformedData);
    } catch (error) {
      console.error("Failed to fetch current week history:", error);
    } finally {
      setLoading(false);
    }
  };

  const screenWidth = Dimensions.get("window").width;

  // Generate current week days from Monday to Sunday
  const currentWeekDays = [];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateString = date.toISOString().split("T")[0];
    const dayName = date.toLocaleDateString("es-ES", { weekday: "short" });
    const formattedDayName = dayName.toUpperCase().replace(".", "");
    currentWeekDays.push({
      date: dateString,
      dayName: formattedDayName,
      total: dailyTotals[dateString] || 0,
    });
  }

  // Prepare chart data with current week data
  const chartData = {
    labels: currentWeekDays.map(day => day.dayName),
    datasets: [
      {
        data: currentWeekDays.map(day => Number(day.total) || 0),
        strokeWidth: 3,
      },
    ],
  };

  const validTotals = currentWeekDays
    .map(day => day.total)
    .filter(total => !isNaN(Number(total)) && isFinite(Number(total)));

  const totalDays = validTotals.length;
  const averageIntake =
    totalDays > 0
      ? Math.round(validTotals.reduce((a, b) => a + b, 0) / totalDays)
      : 0;
  const daysOverLimit = validTotals.filter(total => total > dailyLimit).length;
  const maxIntake = validTotals.length > 0 ? Math.max(...validTotals) : 0;

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: AppTheme.background }]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={{ width: 50 }} />
            <Text style={styles.headerTitle}>Historial</Text>
            <View />
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando historial...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: AppTheme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Historial</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Chart */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="bar-chart"
                size={24}
                color={AppTheme.text.primary}
              />
              <Text style={styles.cardTitle}>Semana actual (Lun - Dom)</Text>
            </View>
            <View style={styles.chartWrapper}>
              <LineChart
                data={chartData}
                width={screenWidth - 64}
                height={200}
                chartConfig={{
                  backgroundColor: AppTheme.surface,
                  backgroundGradientFrom: AppTheme.surface,
                  backgroundGradientTo: AppTheme.surface,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(121, 87, 87, ${opacity})`, // Using primary color
                  labelColor: (opacity = 1) =>
                    `rgba(156, 163, 175, ${opacity})`,
                  style: {
                    borderRadius: 8,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: AppTheme.primary,
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: "",
                    color: AppTheme.border,
                  },
                  propsForLabels: {
                    fontSize: 10,
                  },
                  strokeWidth: 2,
                }}
                bezier
                style={{
                  borderRadius: 8,
                  marginLeft: -10,
                }}
              />
              <View style={styles.dailyLimitBadge}>
                <Text style={styles.dailyLimitText}>
                  Límite diario: {dailyLimit}mg
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Estadísticas</Text>

            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Promedio diario</Text>
                <Text style={[styles.statValue, styles.statValueNormal]}>
                  {averageIntake}mg
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Días sobre el límite</Text>
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
                <Text style={styles.statLabel}>Máximo en un día</Text>
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
                <Text style={styles.statLabel}>Tu límite diario</Text>
                <Text style={[styles.statValue, styles.statValueNormal]}>
                  {dailyLimit}mg
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Días registrados</Text>
                <Text style={[styles.statValue, styles.statValueNormal]}>
                  {totalDays}
                </Text>
              </View>
            </View>
          </View>

          {/* Current Week Days */}
          <View style={styles.recentDaysContainer}>
            <Text style={styles.sectionTitle}>Días de la semana actual</Text>
            {currentWeekDays.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No hay datos de ingesta aún. ¡Comienza a registrar tu cafeína
                  para ver tu historial!
                </Text>
              </View>
            ) : (
              currentWeekDays.map(day => {
                // Safe date formatting
                let formattedDate;
                try {
                  formattedDate = new Date(day.date).toLocaleDateString(
                    "es-ES",
                    {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    }
                  );
                } catch {
                  formattedDate = day.date;
                }

                // Safe number handling
                const safeTotal = Number(day.total) || 0;

                return (
                  <View key={day.date} style={styles.dayItem}>
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
                            ? `+${safeTotal - dailyLimit}mg sobre`
                            : `${dailyLimit - safeTotal}mg bajo`}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: AppTheme.primary,
  },
  loadingContainer: {
    flex: 1,
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
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    color: AppTheme.secondary,
    fontSize: Typography.size["2xl"],
    fontWeight: Typography.weight.bold,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: 16,
    backgroundColor: AppTheme.surface,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginLeft: Spacing.xs,
    color: AppTheme.text.primary,
  },
  chartWrapper: {
    borderRadius: 8,
    padding: 0,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    color: AppTheme.text.primary,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.md,
  },
  statCard: {
    backgroundColor: AppTheme.surface,
    padding: Spacing.md,
    borderRadius: 16,
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing["2xl"],
  },
  emptyState: {
    backgroundColor: AppTheme.surface,
    padding: Spacing.lg,
    borderRadius: 16,
  },
  emptyStateText: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.base,
    textAlign: "center",
  },
  dayItem: {
    backgroundColor: AppTheme.surface,
    padding: Spacing.md,
    borderRadius: 16,
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
