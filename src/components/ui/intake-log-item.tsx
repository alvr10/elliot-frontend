import { AppTheme, Spacing, Typography } from "@/constants";
import { IntakeLogResponse } from "@/types/api";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface IntakeLogItemProps {
  log: IntakeLogResponse;
  onUpdate?: () => void;
}

export default function IntakeLogItem({ log }: IntakeLogItemProps) {
  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid time";
    }
  };

  // Safe number formatting
  const safeServings = Number(log.servings) || 0;
  const totalCaffeine = Number(log.caffeineMg) || 0;

  return (
    <View style={styles.drinkItem}>
      <Image
        source={require("../../../assets/images/elliot.png")}
        style={styles.drinkItemImage}
      />
      <View style={styles.drinkInfo}>
        <Text style={[styles.drinkItemName, { color: AppTheme.text.primary }]}>
          {log.drink?.name || "Unknown drink"}
        </Text>
        <Text
          style={[styles.drinkItemBrand, { color: AppTheme.text.secondary }]}
        >
          {log.drink?.brand || ""}
        </Text>
        <Text
          style={[styles.drinkItemTime, { color: AppTheme.text.secondary }]}
        >
          {formatTime(log.consumedAt)} • {safeServings}x serving
          {safeServings !== 1 ? "s" : ""}
        </Text>
      </View>
      <Text
        style={[
          styles.drinkItemCaffeineRight,
          { color: AppTheme.text.primary },
        ]}
      >
        {totalCaffeine}mg
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  drinkItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
  },
  drinkItemImage: {
    width: 52,
    height: 52,
    borderRadius: 20,
    marginRight: Spacing.md,
  },
  drinkInfo: {
    flex: 1,
  },
  drinkItemName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.xs,
  },
  drinkItemBrand: {
    fontSize: Typography.size.sm,
    marginBottom: Spacing.xs,
  },
  drinkItemTime: {
    fontSize: Typography.size.sm,
  },
  drinkItemCaffeineRight: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    marginLeft: Spacing.md,
  },
});
