import * as Haptics from "expo-haptics";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
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
    } catch (e) {
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
    <View className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-white font-semibold text-base">
            {log.drinks?.name || "Unknown drink"}
          </Text>
          {log.drinks?.brand && (
            <Text className="text-gray-400 text-sm">{log.drinks.brand}</Text>
          )}
          <View className="flex-row mt-2 space-x-4">
            <Text className="text-gray-300 text-sm">
              {safeServings}x serving{safeServings !== 1 ? "s" : ""}
            </Text>
            <Text className="text-white text-sm font-medium">
              {safeCaffeine}mg
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-gray-400 text-sm">
            {formatTime(log.consumed_at)}
          </Text>
          <TouchableOpacity onPress={handleDelete} className="mt-2 px-2 py-1">
            <Text className="text-red-400 text-xs">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
