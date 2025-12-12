import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Spacing, Typography } from "../constants";

interface Testimonial {
  text: string;
  author: string;
}

interface TestimonialListProps {
  testimonials: Testimonial[];
}

const TestimonialList: React.FC<TestimonialListProps> = ({ testimonials }) => {
  return (
    <View>
      {testimonials.map((testimonial, index) => (
        <View key={index} style={styles.testimonialItem}>
          <Text style={styles.testimonialText}>
            &quot;{testimonial.text}&quot;
          </Text>
          <Text style={styles.testimonialAuthor}>— {testimonial.author}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  testimonialItem: {
    backgroundColor: Colors.gray900,
    padding: Spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray700,
    marginBottom: Spacing.lg,
  },
  testimonialText: {
    color: Colors.gray300,
    fontSize: Typography.size.sm,
    marginBottom: Spacing.xs,
    fontStyle: "italic",
  },
  testimonialAuthor: {
    color: Colors.white,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
});

export default TestimonialList;
