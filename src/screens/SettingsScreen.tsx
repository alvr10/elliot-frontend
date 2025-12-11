import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

export default function SettingsScreen() {
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const navigation = useNavigation();
  const { user, subscription, signOut, getCurrentToken, refreshSubscription } =
    useAuth();
  const { showNotification } = useNotification();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          showNotification("Signed out successfully", "info");
        },
      },
    ]);
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription",
      "Your subscription will be cancelled at the end of your current billing period. You'll keep access until then and won't be charged again.",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel at Period End",
          style: "destructive",
          onPress: cancelSubscription,
        },
      ]
    );
  };

  const handleReactivateSubscription = () => {
    Alert.alert(
      "Reactivate Subscription",
      "This will resume your subscription and you'll be charged at the next billing cycle.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reactivate",
          onPress: reactivateSubscription,
        },
      ]
    );
  };

  const cancelSubscription = async () => {
    setCancelling(true);
    try {
      const token = await getCurrentToken();
      if (!token) {
        showNotification("Please sign in again", "error");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/subscription/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await refreshSubscription(); // Refresh to get new status
        showNotification(
          "Subscription cancelled - access until period end",
          "success"
        );
      } else {
        const errorData = await response.json();
        showNotification(
          errorData.error || "Failed to cancel subscription",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      showNotification("Failed to cancel subscription", "error");
    } finally {
      setCancelling(false);
    }
  };

  const reactivateSubscription = async () => {
    setReactivating(true);
    try {
      const token = await getCurrentToken();
      if (!token) {
        showNotification("Please sign in again", "error");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/subscription/reactivate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await refreshSubscription(); // Refresh to get new status
        showNotification("Subscription reactivated successfully", "success");
      } else {
        const errorData = await response.json();
        showNotification(
          errorData.error || "Failed to reactivate subscription",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to reactivate subscription:", error);
      showNotification("Failed to reactivate subscription", "error");
    } finally {
      setReactivating(false);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      showNotification("Could not open link", "error");
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const getSubscriptionStatusDisplay = () => {
    switch (subscription?.status) {
      case "active":
        return { text: "Active", color: "text-green-400" };
      case "active_until_period_end":
        return {
          text: "Cancelled (Active until period end)",
          color: "text-yellow-400",
        };
      case "cancelled":
        return { text: "Cancelled", color: "text-red-400" };
      default:
        return { text: "Inactive", color: "text-gray-400" };
    }
  };

  const subscriptionStatus = getSubscriptionStatusDisplay();
  const isCancelledButActive =
    subscription?.status === "active_until_period_end";

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-white text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Settings</Text>
        <View />
      </View>

      <ScrollView className="flex-1">
        {/* Account Section */}
        <View className="px-6 py-6">
          <Text className="text-white text-lg font-bold mb-4">Account</Text>

          <View className="bg-gray-900 rounded-lg border border-gray-700 mb-4">
            <View className="p-4">
              <Text className="text-gray-400 text-sm">Email</Text>
              <Text className="text-white text-base">{user?.email}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-red-900 border border-red-700 p-4 rounded-lg"
          >
            <Text className="text-red-300 text-center font-medium">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View className="px-6 py-4">
          <Text className="text-white text-lg font-bold mb-4">Preferences</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("DailyLimit" as never)}
            className="bg-gray-900 border border-gray-700 p-4 rounded-lg mb-4"
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white font-medium">
                  Daily Caffeine Limit
                </Text>
                <Text className="text-gray-400 text-sm">
                  Customize your daily goal
                </Text>
              </View>
              <Text className="text-gray-400">→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Subscription Section */}
        <View className="px-6 py-4">
          <Text className="text-white text-lg font-bold mb-4">
            Subscription
          </Text>

          <View className="bg-gray-900 rounded-lg border border-gray-700 mb-4">
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-400 text-sm">Status</Text>
                <Text
                  className={`text-base font-medium ${subscriptionStatus.color}`}
                >
                  {subscriptionStatus.text}
                </Text>
              </View>

              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-400 text-sm">Price</Text>
                <Text className="text-white text-base">€2.99/month</Text>
              </View>

              {subscription?.expires_at && (
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-400 text-sm">
                    {isCancelledButActive ? "Access Until" : "Next Billing"}
                  </Text>
                  <Text className="text-white text-base">
                    {formatDate(subscription.expires_at)}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400 text-sm">Plan</Text>
                <Text className="text-white text-base">CaffTracker Pro</Text>
              </View>
            </View>
          </View>

          {/* Cancellation Warning */}
          {isCancelledButActive && (
            <View className="bg-yellow-900 border border-yellow-700 p-4 rounded-lg mb-4">
              <Text className="text-yellow-300 text-center text-sm">
                ⚠️ Your subscription is cancelled and will end on{" "}
                {formatDate(subscription?.expires_at)}. You won&apos;t be
                charged again unless you reactivate.
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          {subscription?.status === "active" && (
            <TouchableOpacity
              onPress={handleCancelSubscription}
              disabled={cancelling}
              className={`border border-red-700 p-4 rounded-lg ${
                cancelling ? "bg-gray-800" : "bg-red-900"
              }`}
            >
              <Text className="text-red-300 text-center font-medium">
                {cancelling ? "Cancelling..." : "Cancel Subscription"}
              </Text>
            </TouchableOpacity>
          )}

          {isCancelledButActive && (
            <TouchableOpacity
              onPress={handleReactivateSubscription}
              disabled={reactivating}
              className={`border border-green-700 p-4 rounded-lg ${
                reactivating ? "bg-gray-800" : "bg-green-900"
              }`}
            >
              <Text className="text-green-300 text-center font-medium">
                {reactivating ? "Reactivating..." : "Reactivate Subscription"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Legal Section */}
        <View className="px-6 py-4">
          <Text className="text-white text-lg font-bold mb-4">Legal</Text>

          <View className="space-y-3">
            <TouchableOpacity
              onPress={() => openLink("https://cafftracker.com/privacy")}
              className="bg-gray-900 border border-gray-700 p-4 rounded-lg"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-white">Privacy Policy</Text>
                <Text className="text-gray-400">→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openLink("https://cafftracker.com/terms")}
              className="bg-gray-900 border border-gray-700 p-4 rounded-lg"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-white">Terms of Service</Text>
                <Text className="text-gray-400">→</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View className="px-6 py-4 pb-8">
          <Text className="text-white text-lg font-bold mb-4">App Info</Text>

          <View className="bg-gray-900 rounded-lg border border-gray-700">
            <View className="p-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400 text-sm">Version</Text>
                <Text className="text-white text-base">1.0.0</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
