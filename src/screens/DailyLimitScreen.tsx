import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../hooks/UseAuthContext";

const presetLimits = [
  { value: 200, label: "Low (200mg)", description: "1-2 cups of coffee" },
  { value: 300, label: "Moderate (300mg)", description: "2-3 cups of coffee" },
  {
    value: 400,
    label: "Standard (400mg)",
    description: "FDA recommended limit",
  },
  { value: 500, label: "High (500mg)", description: "For high tolerance" },
  { value: 600, label: "Very High (600mg)", description: "Use with caution" },
];

export default function DailyLimitScreen() {
  const [selectedLimit, setSelectedLimit] = useState(400);
  const [customLimit, setCustomLimit] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { getCurrentToken } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchCurrentLimit();
  }, []);

  const fetchCurrentLimit = async () => {
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
        const limit = data.daily_caffeine_limit || 400;
        setSelectedLimit(limit);

        // Check if it's a preset or custom
        const isPreset = presetLimits.some(p => p.value === limit);
        setIsCustom(!isPreset);
        if (!isPreset) {
          setCustomLimit(limit.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch current limit:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveLimit = async () => {
    const finalLimit = isCustom ? parseInt(customLimit) || 400 : selectedLimit;

    if (finalLimit < 50 || finalLimit > 1000) {
      showNotification("Limit must be between 50-1000mg", "error");
      return;
    }

    setSaving(true);
    try {
      const token = await getCurrentToken();
      if (!token) {
        showNotification("Please sign in again", "error");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/daily-limit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ daily_caffeine_limit: finalLimit }),
        }
      );

      if (response.ok) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        showNotification(`Daily limit set to ${finalLimit}mg`, "success");
        router.back();
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || "Failed to save limit", "error");
      }
    } catch (error) {
      console.error("Failed to save limit:", error);
      showNotification("Failed to save limit", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white text-lg mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Daily Limit</Text>
        <TouchableOpacity
          onPress={saveLimit}
          disabled={saving}
          className={saving ? "opacity-50" : ""}
        >
          <Text className="text-white text-lg font-semibold">
            {saving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Info */}
          <View className="bg-blue-900 border border-blue-700 p-4 rounded-lg mb-6">
            <Text className="text-blue-300 text-sm text-center">
              ℹ️ Your daily caffeine limit helps you track healthy consumption.
              The FDA recommends 400mg per day for most adults.
            </Text>
          </View>

          {/* Preset Options */}
          <Text className="text-white text-lg font-bold mb-4">
            Preset Limits
          </Text>
          <View className="space-y-3 mb-6">
            {presetLimits.map(preset => (
              <TouchableOpacity
                key={preset.value}
                onPress={() => {
                  setSelectedLimit(preset.value);
                  setIsCustom(false);
                }}
                className={`p-4 rounded-lg border ${
                  !isCustom && selectedLimit === preset.value
                    ? "bg-white border-white"
                    : "bg-gray-900 border-gray-700"
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text
                      className={`font-semibold text-base ${
                        !isCustom && selectedLimit === preset.value
                          ? "text-black"
                          : "text-white"
                      }`}
                    >
                      {preset.label}
                    </Text>
                    <Text
                      className={`text-sm ${
                        !isCustom && selectedLimit === preset.value
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      {preset.description}
                    </Text>
                  </View>
                  {preset.value === 400 && (
                    <View className="ml-2 bg-green-600 px-2 py-1 rounded">
                      <Text className="text-white text-xs font-medium">
                        RECOMMENDED
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Option */}
          <Text className="text-white text-lg font-bold mb-4">
            Custom Limit
          </Text>
          <TouchableOpacity
            onPress={() => setIsCustom(true)}
            className={`p-4 rounded-lg border mb-4 ${
              isCustom ? "bg-white border-white" : "bg-gray-900 border-gray-700"
            }`}
          >
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text
                  className={`font-semibold text-base ${
                    isCustom ? "text-black" : "text-white"
                  }`}
                >
                  Custom Amount
                </Text>
                <Text
                  className={`text-sm ${
                    isCustom ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  Set your own personalized limit
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {isCustom && (
            <View className="mb-6">
              <View className="flex-row items-center">
                <TextInput
                  value={customLimit}
                  onChangeText={setCustomLimit}
                  placeholder="Enter amount"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  className="bg-gray-900 text-white px-4 py-4 rounded-lg border border-gray-700 text-base flex-1"
                  maxLength={4}
                />
                <Text className="text-white text-lg ml-3 font-medium">mg</Text>
              </View>
              <Text className="text-gray-500 text-xs mt-2">
                Range: 50-1000mg per day
              </Text>
            </View>
          )}

          {/* Current Preview */}
          <View className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
            <Text className="text-white font-semibold mb-2">
              Current Setting
            </Text>
            <Text className="text-white text-2xl font-bold">
              {isCustom ? customLimit || "400" : selectedLimit}mg
            </Text>
            <Text className="text-gray-400 text-sm">per day</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
