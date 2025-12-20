import { DrinkModal } from "@/components";
import { AppTheme, Spacing, Typography } from "@/constants";
import { caffeineApi } from "@/services/api";
import { Drink } from "@/types/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddIntakeScreen() {
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt: any, gestureState: any) => {
      // Only respond to horizontal swipes
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onPanResponderRelease: (evt: any, gestureState: any) => {
      // Check if it's a swipe to the right with sufficient distance and velocity
      if (gestureState.dx > 50 && gestureState.vx > 0.3) {
        router.back();
      }
    },
  });

  const categories = [
    "Todos",
    "Café",
    "Té",
    "Refresco",
    "Bebida Energética",
    "Agua",
  ];

  useEffect(() => {
    fetchDrinks();
  }, []);

  const fetchDrinks = async () => {
    try {
      const fetchedDrinks = await caffeineApi.getDrinks();
      setDrinks(fetchedDrinks);
    } catch (error) {
      console.error("Failed to fetch drinks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrinks = drinks.filter(drink => {
    const matchesSearch =
      drink.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drink.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      selectedCategory === "Todos" ||
      drink.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDrinkPress = (drink: Drink) => {
    setSelectedDrink(drink);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedDrink(null);
  };

  const getDrinkImage = (category: string) => {
    switch (category.toLowerCase()) {
      case "café":
        return require("../../assets/images/drinks/coffee-image.png");
      case "té":
        return require("../../assets/images/drinks/tea-image.png");
      case "bebida energética":
        return require("../../assets/images/drinks/energy-drink-image.png");
      default:
        return require("../../assets/images/elliot.png");
    }
  };

  const renderDrinkItem = ({ item }: { item: Drink }) => (
    <TouchableOpacity
      style={styles.drinkItem}
      onPress={() => handleDrinkPress(item)}
    >
      <Image
        source={getDrinkImage(item.category)}
        style={styles.drinkItemImage}
      />
      <View style={styles.drinkInfo}>
        <Text style={[styles.drinkItemName, { color: AppTheme.secondary }]}>
          {item.name}
        </Text>
        <Text style={[styles.drinkItemBrand, { color: AppTheme.text.primary }]}>
          {item.brand}
        </Text>
      </View>
      <Text
        style={[styles.drinkItemCaffeineRight, { color: AppTheme.secondary }]}
      >
        {item.caffeine_per_serving}mg
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: AppTheme.background }]}
      {...panResponder.panHandlers}
    >
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons
                name="arrow-back"
                size={24}
                color={AppTheme.secondary}
              />
            </TouchableOpacity>
            <Text style={[styles.title, { color: AppTheme.secondary }]}>
              Agregar Ingesta
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <MaterialIcons
              name="search"
              size={20}
              color={AppTheme.text.secondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: AppTheme.surface,
                  borderColor: AppTheme.border,
                  color: AppTheme.text.primary,
                },
              ]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar bebida..."
              placeholderTextColor={AppTheme.text.secondary}
            />
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsContainer}
            contentContainerStyle={styles.chipsContent}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      selectedCategory === category
                        ? AppTheme.background
                        : AppTheme.surface,
                    borderColor: AppTheme.border,
                  },
                ]}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === category ? null : category
                  )
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        selectedCategory === category
                          ? AppTheme.primary
                          : AppTheme.text.secondary,
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Drinks List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={AppTheme.primary} />
              <Text
                style={[styles.loadingText, { color: AppTheme.text.secondary }]}
              >
                Cargando bebidas...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredDrinks}
              renderItem={renderDrinkItem}
              keyExtractor={item => item.id}
              style={styles.drinksList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Drink Modal */}
          <DrinkModal
            visible={modalVisible}
            drink={selectedDrink}
            onClose={handleCloseModal}
          />
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingTop: Spacing["2xl"],
  },
  title: {
    fontSize: Typography.size["2xl"],
    fontWeight: Typography.weight.bold,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: AppTheme.border,
    backgroundColor: AppTheme.surface,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: Typography.size.base,
    borderWidth: 0,
  },
  chipsContainer: {
    maxHeight: 40,
    marginVertical: Spacing.xs,
  },
  chipsContent: {
    paddingHorizontal: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    marginRight: Spacing.sm,
    height: 28,
    justifyContent: "center",
  },
  chipText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  drinksList: {
    flex: 1,
  },
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
  drinkItemCaffeineRight: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    marginLeft: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.size.base,
  },
});
