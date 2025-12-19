import { AppTheme, Spacing, Typography } from "@/constants";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  element: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ icon, title, element }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <MaterialIcons name={icon} size={24} color={AppTheme.text.primary} />
        <Text style={styles.cardTitle}>{title}</Text>
        {element}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.background,
    borderRadius: 16,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: AppTheme.text.primary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    flex: 1,
    marginLeft: Spacing.sm,
  },
});

export default Card;
