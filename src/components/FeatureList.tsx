import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppTheme, Spacing, Typography } from "../constants";

interface FeatureListProps {
  features: string[];
}

const FeatureList: React.FC<FeatureListProps> = ({ features }) => {
  return (
    <View>
      {features.map((feature, index) => (
        <View key={index} style={styles.featureItem}>
          <View style={styles.featureDot} />
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  featureDot: {
    backgroundColor: AppTheme.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.lg,
  },
  featureText: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.base,
    flex: 1,
  },
});

export default FeatureList;
