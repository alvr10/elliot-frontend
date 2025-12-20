import { AppTheme, Spacing, Typography } from "@/constants";
import { caffeineApi } from "@/services/api";
import { Drink } from "@/types/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface DrinkModalProps {
  visible: boolean;
  drink: Drink | null;
  onClose: () => void;
}

export default function DrinkModal({
  visible,
  drink,
  onClose,
}: DrinkModalProps) {
  const [servings, setServings] = useState("1");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  const handleAddIntake = async () => {
    if (!drink) {
      Alert.alert("Error", "Por favor selecciona una bebida");
      return;
    }

    const servingsNum = parseFloat(servings);
    if (isNaN(servingsNum) || servingsNum < 0.1) {
      Alert.alert("Error", "Por favor ingresa un número válido de porciones");
      return;
    }

    setLoading(true);
    try {
      // Get current time as ISO 8601 timestamp
      const consumedAt = new Date().toISOString();

      await caffeineApi.logIntake({
        drinkId: drink.id,
        servings: servingsNum,
        consumedAt,
      });

      Alert.alert("Éxito", "Ingesta agregada correctamente", [
        {
          text: "OK",
          onPress: () => {
            onClose();
            router.push("/(tabs)/home");
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to add intake:", error);
      Alert.alert("Error", "No se pudo agregar la ingesta");
    } finally {
      setLoading(false);
    }
  };

  if (!drink) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalTouchableArea}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[styles.bottomSheet, { backgroundColor: AppTheme.secondary }]}
        >
          <View style={styles.bottomSheetContent}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text
                style={[
                  styles.closeButtonText,
                  { color: AppTheme.text.primary },
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Large Image */}
              <Image
                source={getDrinkImage(drink.category)}
                style={styles.largeImage}
              />

              {/* Name */}
              <Text
                style={[styles.drinkName, { color: AppTheme.text.primary }]}
              >
                {drink.name}
              </Text>

              {/* Separator Bar */}
              <View style={styles.separator} />

              {/* Quantity of Portions */}
              <View style={styles.infoRow}>
                <Text
                  style={[styles.infoLabel, { color: AppTheme.text.primary }]}
                >
                  Cantidad de porciones
                </Text>
                <TextInput
                  style={[
                    styles.servingsInput,
                    {
                      backgroundColor: AppTheme.background,
                      borderColor: AppTheme.border,
                      color: AppTheme.text.primary,
                    },
                  ]}
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={AppTheme.text.secondary}
                />
              </View>

              {/* Separator Bar */}
              <View style={styles.separator} />

              {/* mg per one */}
              <View style={styles.infoRow}>
                <Text
                  style={[styles.infoLabel, { color: AppTheme.text.primary }]}
                >
                  mg por uno
                </Text>
                <Text
                  style={[styles.infoValue, { color: AppTheme.text.primary }]}
                >
                  {drink.caffeine_per_serving}mg
                </Text>
              </View>

              {/* Separator Bar */}
              <View style={styles.separator} />

              {/* size ml */}
              <View style={styles.infoRow}>
                <Text
                  style={[styles.infoLabel, { color: AppTheme.text.primary }]}
                >
                  tamaño ml
                </Text>
                <Text
                  style={[styles.infoValue, { color: AppTheme.text.primary }]}
                >
                  {drink.serving_size}
                </Text>
              </View>

              {/* Separator Bar */}
              <View style={styles.separator} />

              {/* time of log */}
              <View style={styles.infoRow}>
                <Text
                  style={[styles.infoLabel, { color: AppTheme.text.primary }]}
                >
                  hora de registro
                </Text>
                <Text
                  style={[styles.infoValue, { color: AppTheme.text.primary }]}
                >
                  {new Date().toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              {/* Separator Bar */}
              <View style={styles.separator} />

              {/* Total Caffeine */}
              <View style={styles.totalContainer}>
                <Text
                  style={[styles.totalLabel, { color: AppTheme.text.primary }]}
                >
                  Total de cafeína
                </Text>
                <Text
                  style={[styles.totalAmount, { color: AppTheme.text.primary }]}
                >
                  {Math.round(
                    drink.caffeine_per_serving * parseFloat(servings || "1")
                  )}
                  mg
                </Text>
              </View>

              {/* Add Button */}
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: AppTheme.primary },
                ]}
                onPress={handleAddIntake}
                disabled={loading}
              >
                <Text
                  style={[styles.addButtonText, { color: AppTheme.secondary }]}
                >
                  {loading ? "Agregando..." : "Agregar"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalTouchableArea: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    width: "100%",
    height: Dimensions.get("window").height * 0.7,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
  },
  bottomSheetContent: {
    flex: 1,
    position: "relative",
  },
  scrollView: {
    flex: 1,
    marginTop: 40, // Make space for the close button
  },
  scrollContent: {
    paddingBottom: Spacing.xl, // Add padding at the bottom
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: AppTheme.background,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  largeImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  drinkName: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  separator: {
    height: 1,
    backgroundColor: AppTheme.border,
    marginVertical: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  infoLabel: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    flex: 1,
  },
  infoValue: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    flex: 1,
    textAlign: "right",
  },
  servingsInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.base,
    flex: 1,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: 12,
    marginVertical: Spacing.md,
    backgroundColor: AppTheme.background,
  },
  totalLabel: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  totalAmount: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  addButton: {
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  addButtonText: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
});
