import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

interface CustomDrink {
  id: number;
  name: string;
  caffeine_per_serving: number;
  category: string;
  brand?: string;
  serving_size: string;
  is_custom: boolean;
}

export default function ManageCustomDrinksScreen() {
  const [customDrinks, setCustomDrinks] = useState<CustomDrink[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const navigation = useNavigation();
  const { getCurrentToken } = useAuth();
  const { showNotification } = useNotification();

  // Refresh drinks when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchCustomDrinks();
    }, [])
  );

  const fetchCustomDrinks = async () => {
    try {
      setLoading(true);
      const token = await getCurrentToken();

      if (!token) {
        showNotification("Please sign in again", "error");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/drinks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const drinks = await response.json();
        // Filter only custom drinks for this user
        const userCustomDrinks = drinks.filter(
          (drink: CustomDrink) => drink.is_custom
        );
        setCustomDrinks(userCustomDrinks);
      } else {
        showNotification("Failed to load custom drinks", "error");
      }
    } catch (error) {
      console.error("Failed to fetch custom drinks:", error);
      showNotification("Failed to load custom drinks", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrink = (drink: CustomDrink) => {
    Alert.alert(
      "Delete Custom Drink",
      `Are you sure you want to delete "${drink.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteDrink(drink.id),
        },
      ]
    );
  };

  const deleteDrink = async (drinkId: number) => {
    setDeleting(drinkId);
    try {
      const token = await getCurrentToken();

      if (!token) {
        showNotification("Please sign in again", "error");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/drinks/${drinkId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setCustomDrinks(prev => prev.filter(drink => drink.id !== drinkId));
        showNotification("Custom drink deleted", "success");
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || "Failed to delete drink", "error");
      }
    } catch (error) {
      console.error("Failed to delete drink:", error);
      showNotification("First delete your drink from logs", "error");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white text-lg mt-4">Loading your drinks...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-white text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">My Custom Drinks</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("CustomDrink" as never)}
        >
          <Text className="text-white text-lg font-semibold">+ Add</Text>
        </TouchableOpacity>
      </View>

      {customDrinks.length === 0 ? (
        // Empty State
        <View className="flex-1 justify-center items-center px-6">
          <View className="items-center mb-8">
            <Text className="text-6xl mb-4">☕</Text>
            <Text className="text-white text-xl font-bold text-center mb-2">
              No Custom Drinks Yet
            </Text>
            <Text className="text-gray-400 text-center">
              Create personalized caffeine items for drinks not in our database.
              Perfect for homemade coffee or specialty beverages!
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("CustomDrink" as never)}
            className="bg-white py-4 px-8 rounded-lg"
          >
            <Text className="text-black text-lg font-bold">
              Create Your First Custom Drink
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Drinks List
        <ScrollView className="flex-1">
          <View className="px-6 py-6">
            <Text className="text-gray-400 text-sm mb-4">
              {customDrinks.length} custom drink
              {customDrinks.length !== 1 ? "s" : ""}
            </Text>

            <View className="space-y-4">
              {customDrinks.map(drink => (
                <View
                  key={drink.id}
                  className="bg-gray-900 border border-gray-700 p-4 rounded-lg"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-white font-semibold text-base">
                          {drink.name}
                        </Text>
                        <View className="ml-2 bg-blue-600 px-2 py-1 rounded">
                          <Text className="text-white text-xs font-medium">
                            CUSTOM
                          </Text>
                        </View>
                      </View>

                      {drink.brand && (
                        <Text className="text-gray-400 text-sm mb-1">
                          {drink.brand}
                        </Text>
                      )}

                      <Text className="text-gray-500 text-sm">
                        {drink.serving_size}
                      </Text>

                      <Text className="text-gray-500 text-xs mt-1 capitalize">
                        {drink.category.replace("_", " ")}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-white font-bold text-lg mb-2">
                        {drink.caffeine_per_serving}mg
                      </Text>

                      <TouchableOpacity
                        onPress={() => handleDeleteDrink(drink)}
                        disabled={deleting === drink.id}
                        className={`px-3 py-1 rounded ${
                          deleting === drink.id
                            ? "bg-gray-700"
                            : "bg-red-900 border border-red-700"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            deleting === drink.id
                              ? "text-gray-400"
                              : "text-red-300"
                          }`}
                        >
                          {deleting === drink.id ? "Deleting..." : "Delete"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Add Another Button */}
          <View className="px-6 pb-8">
            <TouchableOpacity
              onPress={() => navigation.navigate("CustomDrink" as never)}
              className="bg-gray-800 border border-gray-600 py-4 rounded-lg"
            >
              <Text className="text-white text-center font-medium">
                + Create Another Custom Drink
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
