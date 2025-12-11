import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

interface Drink {
  id: number;
  name: string;
  caffeine_per_serving: number;
  category: string;
  brand?: string;
  serving_size: string;
  is_custom: boolean;
}

export default function AddIntakeScreen() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [servings, setServings] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [fetchingDrinks, setFetchingDrinks] = useState(true);

  const navigation = useNavigation();
  const { user, getCurrentToken } = useAuth();
  const { showNotification } = useNotification();

  const categories = ["all", "coffee", "tea", "energy_drink", "soda", "other"];

  // Function to get the appropriate image based on drink category
  const getDrinkImage = (category: string) => {
    switch (category) {
      case "coffee":
        return require("../../assets/images/drinks/coffee-image.png");
      case "tea":
        return require("../../assets/images/drinks/tea-image.png");
      case "energy_drink":
        return require("../../assets/images/drinks/energy-drink-image.png");
      default:
        return require("../../assets/images/drinks/coffee-image.png"); // default image
    }
  };

  useEffect(() => {
    if (user) {
      fetchDrinks();
    }
  }, [user]);

  // Refresh drinks when returning from custom drink creation
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchDrinks();
      }
    }, [user])
  );

  const fetchDrinks = async () => {
    try {
      setFetchingDrinks(true);
      console.log("Fetching drinks...");

      const token = await getCurrentToken();

      if (!token) {
        console.error("No token available");
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

      console.log("Drinks response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Drinks fetch error:", errorText);
        throw new Error("Failed to fetch drinks");
      }

      const data = await response.json();
      console.log("Fetched drinks count:", data?.length || 0);

      if (Array.isArray(data)) {
        // Sort drinks: custom drinks first, then by name
        const sortedDrinks = data.sort((a, b) => {
          if (a.is_custom !== b.is_custom) {
            return a.is_custom ? -1 : 1; // Custom drinks first
          }
          return a.name.localeCompare(b.name);
        });
        setDrinks(sortedDrinks);
      } else {
        console.error("Drinks data is not an array:", data);
        setDrinks([]);
        showNotification("Failed to load drinks database", "error");
      }
    } catch (error) {
      console.error("Failed to fetch drinks:", error);
      setDrinks([]);
      showNotification("Failed to load drinks. Please try again.", "error");
    } finally {
      setFetchingDrinks(false);
    }
  };

  const logIntake = async () => {
    if (!selectedDrink) {
      showNotification("Please select a drink first", "error");
      return;
    }

    const servingsNum = parseFloat(servings);
    if (isNaN(servingsNum) || servingsNum <= 0) {
      showNotification("Please enter a valid number of servings", "error");
      return;
    }

    setLoading(true);
    try {
      const token = await getCurrentToken();

      if (!token) {
        showNotification("Please sign in again", "error");
        return;
      }

      console.log("Logging intake:", {
        drink_id: selectedDrink.id,
        drink_name: selectedDrink.name,
        servings: servingsNum,
        total_caffeine: Math.round(
          selectedDrink.caffeine_per_serving * servingsNum
        ),
      });

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/intake`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            drink_id: selectedDrink.id,
            servings: servingsNum,
          }),
        }
      );

      console.log("Intake response status:", response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log("Intake logged successfully:", responseData);

        const totalCaffeine = Math.round(
          selectedDrink.caffeine_per_serving * servingsNum
        );

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Navigate back first, then show notification
        navigation.goBack();

        // Use setTimeout to ensure navigation completes before showing notification
        setTimeout(() => {
          showNotification(`Logged ${totalCaffeine}mg of caffeine`, "success");
        }, 100);
      } else {
        const errorData = await response.json();
        console.error("Intake logging error:", errorData);
        showNotification(errorData.error || "Failed to log intake", "error");
      }
    } catch (error) {
      console.error("Failed to log intake:", error);
      showNotification("Failed to log intake. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredDrinks = React.useMemo(() => {
    if (!Array.isArray(drinks)) {
      console.warn("drinks is not an array:", drinks);
      return [];
    }

    return drinks.filter(drink => {
      const matchesSearch =
        drink.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (drink.brand &&
          drink.brand.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === "all" || drink.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [drinks, searchQuery, selectedCategory]);

  const totalCaffeine = selectedDrink
    ? Math.round(
        selectedDrink.caffeine_per_serving * parseFloat(servings || "1")
      )
    : 0;

  if (fetchingDrinks) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white text-lg mt-4">Loading drinks...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-white text-lg">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Log Intake</Text>
        <TouchableOpacity
          onPress={logIntake}
          disabled={!selectedDrink || loading}
          className={selectedDrink && !loading ? "" : "opacity-50"}
        >
          <Text className="text-white text-lg font-semibold">
            {loading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Add Custom */}
      <View className="px-6 py-4">
        <View className="flex-row space-x-3">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search drinks..."
            placeholderTextColor="#6B7280"
            className="bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 flex-1"
          />
          <TouchableOpacity
            onPress={() => navigation.navigate("CustomDrink" as never)}
            className="bg-white px-4 py-3 rounded-lg justify-center"
          >
            <Text className="text-black font-semibold">+ Custom</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View className="px-6 mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          <View className="flex-row space-x-2">
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-3 py-2 rounded-full border ${
                  selectedCategory === category
                    ? "bg-white border-white"
                    : "bg-transparent border-gray-600"
                }`}
                style={{ minWidth: 80 }}
              >
                <Text
                  className={`text-center text-sm capitalize ${
                    selectedCategory === category
                      ? "text-black"
                      : "text-gray-300"
                  }`}
                >
                  {category === "all" ? "All" : category.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Error State */}
      {!fetchingDrinks && drinks.length === 0 && (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-white text-lg text-center mb-4">
            No drinks available
          </Text>
          <Text className="text-gray-400 text-center mb-6">
            Unable to load the drinks database. Please check your connection and
            try again.
          </Text>
          <TouchableOpacity
            onPress={fetchDrinks}
            className="bg-white px-6 py-3 rounded-lg"
          >
            <Text className="text-black font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Drinks List */}
      {!fetchingDrinks && drinks.length > 0 && (
        <ScrollView className="flex-1 px-6">
          {filteredDrinks.length === 0 ? (
            <View className="py-8">
              <Text className="text-gray-400 text-center mb-4">
                No drinks found matching your search
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("CustomDrink" as never)}
                className="bg-white py-3 px-6 rounded-lg mx-8"
              >
                <Text className="text-black font-semibold text-center">
                  Create Custom Drink
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-3">
              {filteredDrinks.map(drink => (
                <TouchableOpacity
                  key={drink.id}
                  onPress={() => setSelectedDrink(drink)}
                  className={`p-4 rounded-lg border ${
                    selectedDrink?.id === drink.id
                      ? "bg-white border-white"
                      : "bg-gray-900 border-gray-700"
                  }`}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-row flex-1">
                      {/* Drink Image */}
                      <Image
                        source={getDrinkImage(drink.category)}
                        style={{ width: 40, height: 40, marginRight: 12 }}
                        resizeMode="contain"
                      />
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text
                            className={`font-semibold text-base ${
                              selectedDrink?.id === drink.id
                                ? "text-black"
                                : "text-white"
                            }`}
                          >
                            {drink.name}
                          </Text>
                          {drink.is_custom && (
                            <View className="ml-2 bg-blue-600 px-2 py-1 rounded">
                              <Text className="text-white text-xs font-medium">
                                CUSTOM
                              </Text>
                            </View>
                          )}
                        </View>
                        {drink.brand && (
                          <Text
                            className={`text-sm ${
                              selectedDrink?.id === drink.id
                                ? "text-gray-700"
                                : "text-gray-400"
                            }`}
                          >
                            {drink.brand}
                          </Text>
                        )}
                        <Text
                          className={`text-sm mt-1 ${
                            selectedDrink?.id === drink.id
                              ? "text-gray-600"
                              : "text-gray-500"
                          }`}
                        >
                          {drink.serving_size}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text
                        className={`font-bold ${
                          selectedDrink?.id === drink.id
                            ? "text-black"
                            : "text-white"
                        }`}
                      >
                        {drink.caffeine_per_serving}mg
                      </Text>
                      <Text
                        className={`text-xs capitalize ${
                          selectedDrink?.id === drink.id
                            ? "text-gray-600"
                            : "text-gray-500"
                        }`}
                      >
                        {drink.category.replace("_", " ")}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Selected Drink Summary */}
      {selectedDrink && (
        <View className="bg-gray-900 border-t border-gray-700 px-6 py-4">
          <Text className="text-white text-lg font-bold mb-3">
            {selectedDrink.name}
            {selectedDrink.is_custom && (
              <Text className="text-blue-400 text-sm"> (Custom)</Text>
            )}
          </Text>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-300">Servings:</Text>
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity
                onPress={() => {
                  const current = parseFloat(servings || "1");
                  if (current > 0.5) setServings((current - 0.5).toString());
                }}
                className="bg-gray-700 w-8 h-8 rounded-full justify-center items-center"
              >
                <Text className="text-white font-bold">-</Text>
              </TouchableOpacity>

              <TextInput
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
                className="bg-gray-800 text-white text-center px-3 py-2 rounded w-16"
              />

              <TouchableOpacity
                onPress={() => {
                  const current = parseFloat(servings || "1");
                  setServings((current + 0.5).toString());
                }}
                className="bg-gray-700 w-8 h-8 rounded-full justify-center items-center"
              >
                <Text className="text-white font-bold">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-gray-300">Total Caffeine:</Text>
            <Text className="text-white text-xl font-bold">
              {totalCaffeine}mg
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
