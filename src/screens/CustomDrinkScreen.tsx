import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../hooks/UseAuthContext";

const categories = [
  { value: "coffee", label: "Coffee" },
  { value: "tea", label: "Tea" },
  { value: "energy_drink", label: "Energy Drink" },
  { value: "soda", label: "Soda" },
  { value: "other", label: "Other" },
];

export default function CustomDrinkScreen() {
  const [name, setName] = useState("");
  const [caffeinePerServing, setCaffeinePerServing] = useState("");
  const [category, setCategory] = useState("coffee");
  const [brand, setBrand] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { getCurrentToken } = useAuth();
  const { showNotification } = useNotification();

  const validateForm = () => {
    if (!name.trim()) {
      showNotification("Please enter a drink name", "error");
      return false;
    }

    const caffeine = parseInt(caffeinePerServing);
    if (isNaN(caffeine) || caffeine < 0 || caffeine > 1000) {
      showNotification(
        "Please enter a valid caffeine amount (0-1000mg)",
        "error"
      );
      return false;
    }

    if (!servingSize.trim()) {
      showNotification("Please enter a serving size", "error");
      return false;
    }

    return true;
  };

  const createCustomDrink = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await getCurrentToken();

      if (!token) {
        showNotification("Please sign in again", "error");
        return;
      }

      console.log("Creating custom drink:", {
        name: name.trim(),
        caffeine_per_serving: parseInt(caffeinePerServing),
        category,
        brand: brand.trim() || undefined,
        serving_size: servingSize.trim(),
      });

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/drinks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            caffeine_per_serving: parseInt(caffeinePerServing),
            category,
            brand: brand.trim() || undefined,
            serving_size: servingSize.trim(),
          }),
        }
      );

      console.log("Custom drink response status:", response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log("Custom drink created successfully:", responseData);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Navigate back first, then show notification
        router.back();

        setTimeout(() => {
          showNotification(`${name} added to your drinks!`, "success");
        }, 100);
      } else {
        const errorData = await response.json();
        console.error("Custom drink creation error:", errorData);
        showNotification(
          errorData.error || "Failed to create custom drink",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to create custom drink:", error);
      showNotification(
        "Failed to create custom drink. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-white text-lg">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            Create Custom Drink
          </Text>
          <TouchableOpacity
            onPress={createCustomDrink}
            disabled={loading}
            className={loading ? "opacity-50" : ""}
          >
            <Text className="text-white text-lg font-semibold">
              {loading ? "Creating..." : "Create"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          <View className="px-6 py-6">
            {/* Info Banner */}
            <View className="bg-blue-900 border border-blue-700 p-4 rounded-lg mb-6">
              <Text className="text-blue-300 text-sm text-center">
                💡 Create your own caffeine items for drinks not in our
                database. Perfect for homemade coffee, specialty teas, or unique
                energy drinks!
              </Text>
            </View>

            {/* Drink Name */}
            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-3">
                Drink Name *
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., My Morning Espresso, Custom Energy Mix"
                placeholderTextColor="#6B7280"
                className="bg-gray-900 text-white px-4 py-4 rounded-lg border border-gray-700 text-base"
                maxLength={50}
              />
              <Text className="text-gray-500 text-xs mt-2">
                Give your drink a memorable name
              </Text>
            </View>

            {/* Caffeine Amount */}
            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-3">
                Caffeine per Serving *
              </Text>
              <View className="flex-row items-center">
                <TextInput
                  value={caffeinePerServing}
                  onChangeText={setCaffeinePerServing}
                  placeholder="95"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  className="bg-gray-900 text-white px-4 py-4 rounded-lg border border-gray-700 text-base flex-1"
                  maxLength={4}
                />
                <Text className="text-white text-lg ml-3 font-medium">mg</Text>
              </View>
              <Text className="text-gray-500 text-xs mt-2">
                Most coffees: 80-120mg • Energy drinks: 50-300mg • Teas: 15-70mg
              </Text>
            </View>

            {/* Category */}
            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-3">
                Category *
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 4 }}
              >
                <View className="flex-row space-x-3">
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat.value}
                      onPress={() => setCategory(cat.value)}
                      className={`px-4 py-3 rounded-lg border ${
                        category === cat.value
                          ? "bg-white border-white"
                          : "bg-transparent border-gray-600"
                      }`}
                      style={{ minWidth: 100 }}
                    >
                      <Text
                        className={`text-center font-medium ${
                          category === cat.value
                            ? "text-black"
                            : "text-gray-300"
                        }`}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Brand (Optional) */}
            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-3">
                Brand <Text className="text-gray-500 text-sm">(Optional)</Text>
              </Text>
              <TextInput
                value={brand}
                onChangeText={setBrand}
                placeholder="e.g., Starbucks, Local Coffee Shop, Homemade"
                placeholderTextColor="#6B7280"
                className="bg-gray-900 text-white px-4 py-4 rounded-lg border border-gray-700 text-base"
                maxLength={30}
              />
            </View>

            {/* Serving Size */}
            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-3">
                Serving Size *
              </Text>
              <TextInput
                value={servingSize}
                onChangeText={setServingSize}
                placeholder="e.g., 8 oz, 12 oz cup, 1 shot, 16 oz bottle"
                placeholderTextColor="#6B7280"
                className="bg-gray-900 text-white px-4 py-4 rounded-lg border border-gray-700 text-base"
                maxLength={20}
              />
              <Text className="text-gray-500 text-xs mt-2">
                Describe the standard serving size for this drink
              </Text>
            </View>

            {/* Preview */}
            {name && caffeinePerServing && servingSize && (
              <View className="bg-gray-900 border border-gray-700 p-4 rounded-lg mb-6">
                <Text className="text-white text-lg font-semibold mb-2">
                  Preview
                </Text>
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-white font-semibold text-base">
                        {name}
                      </Text>
                      <View className="ml-2 bg-blue-600 px-2 py-1 rounded">
                        <Text className="text-white text-xs font-medium">
                          CUSTOM
                        </Text>
                      </View>
                    </View>
                    {brand && (
                      <Text className="text-gray-400 text-sm">{brand}</Text>
                    )}
                    <Text className="text-gray-500 text-sm mt-1">
                      {servingSize}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-white font-bold">
                      {caffeinePerServing || "0"}mg
                    </Text>
                    <Text className="text-gray-500 text-xs capitalize">
                      {category.replace("_", " ")}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Tips */}
            <View className="bg-gray-900 border border-gray-700 p-4 rounded-lg mb-8">
              <Text className="text-white font-semibold mb-3">
                💡 Tips for accuracy
              </Text>
              <View className="space-y-2">
                <Text className="text-gray-300 text-sm">
                  • Check labels or look up caffeine content online
                </Text>
                <Text className="text-gray-300 text-sm">
                  • For homemade coffee, use brewing method as reference
                </Text>
                <Text className="text-gray-300 text-sm">
                  • Energy drinks usually list caffeine on the label
                </Text>
                <Text className="text-gray-300 text-sm">
                  • When in doubt, estimate conservatively
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
