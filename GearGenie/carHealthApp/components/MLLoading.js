// components/MLLoading.js
import React, { useEffect, useRef } from "react";
import { View, Text, Animated, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function MLLoading() {
  const pulse = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Icon pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 300, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])
    ).start();

    // Fade text animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fade, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View
      style={{
        position: "absolute",
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      {/* Pulsing Robot Icon */}
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <MaterialCommunityIcons name="robot" size={90} color="#2ecc71" />
      </Animated.View>

      {/* Animated Text */}
      <Animated.Text
        style={{
          marginTop: 20,
          color: "#ffffff",
          fontSize: 20,
          fontWeight: "600",
          opacity: fade,
        }}
      >
        Analyzing OBD Data…
      </Animated.Text>

      <Text style={{ marginTop: 10, color: "#cccccc", fontSize: 14 }}>
        Running machine learning predictions
      </Text>

      <ActivityIndicator size="large" color="#2ecc71" style={{ marginTop: 25 }} />
    </View>
  );
}
