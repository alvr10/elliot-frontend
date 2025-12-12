import { AppTheme, Colors, Spacing, Typography } from "@/constants";
import * as Haptics from "expo-haptics";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

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

interface IntakeLogItemProps {
  log: IntakeLog;
  onUpdate: () => void;
}

export default function IntakeLogItem({ log, onUpdate }: IntakeLogItemProps) {
  const { getCurrentToken } = useAuth();
  const { showNotification } = useNotification();

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

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this caffeine log?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteLog },
      ]
    );
  };

  const deleteLog = async () => {
    try {
      console.log("Deleting log:", log.id);
      const token = await getCurrentToken();

      if (!token) {
        showNotification("Please sign in again", "error");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/intake/${log.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Delete response status:", response.status);

      if (response.ok) {
        console.log("Log deleted successfully");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onUpdate(); // Refresh the parent component
        showNotification("Caffeine log deleted", "success");
      } else {
        const errorData = await response.json();
        console.error("Delete error:", errorData);
        showNotification(errorData.error || "Failed to delete log", "error");
      }
    } catch (error) {
      console.error("Failed to delete log:", error);
      showNotification("Failed to delete log. Please try again.", "error");
    }
  };

  // Safe number formatting
  const safeServings = Number(log.servings) || 0;
  const safeCaffeine = Number(log.total_caffeine) || 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.drinkName}>
            {log.drinks?.name || "Unknown drink"}
          </Text>
          {log.drinks?.brand && (
            <Text style={styles.brand}>{log.drinks.brand}</Text>
          )}
          <View style={styles.details}>
            <Text style={styles.servings}>
              {safeServings}x serving{safeServings !== 1 ? "s" : ""}
            </Text>
            <Text style={styles.caffeine}>{safeCaffeine}mg</Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={styles.time}>{formatTime(log.consumed_at)}</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppTheme.surface,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  left: {
    flex: 1,
  },
  drinkName: {
    color: AppTheme.text.primary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  brand: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.sm,
  },
  details: {
    flexDirection: "row",
    marginTop: Spacing.xs,
  },
  servings: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.sm,
    marginRight: Spacing.lg,
  },
  caffeine: {
    color: AppTheme.text.primary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  right: {
    alignItems: "flex-end",
  },
  time: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.sm,
  },
  deleteButton: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  deleteText: {
    color: Colors.error,
    fontSize: Typography.size.xs,
  },
});
