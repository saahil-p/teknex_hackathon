// ===============================
// components/HealthCard.js
// ===============================

import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "../styles";

export default function HealthCard({
  title,
  iconName,
  health,
  recommendation,
  onHelpPress,
  rul,
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: health ?? 0,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [health]);

  const widthInterpolate = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  // ---------- Status -> Color ----------
  function getLevel() {
    if ((rul ?? 999) <= 10) return "red";      // Critical
    if ((rul ?? 999) <= 40) return "yellow";   // Attention soon
    return "green";                            // Healthy
  }

  const level = getLevel();

  const barColor =
    level === "green" ? "#2ecc71" :
    level === "yellow" ? "#f1c40f" :
    "#ff4b4b";

  const showRUL = (rul ?? 999) <= 40;

  // ---------- Dynamic Gradient Based On Level ----------
  const gradientFill =
    level === "green"
      ? ["#d4ffe9", "#6effb0", "#00c76a"]      // GREEN GRADIENT
      : level === "yellow"
      ? ["#fff4b0", "#ffd65a", "#e0a100"]      // YELLOW GRADIENT
      : ["#ffb3b3", "#ff5757", "#b30000"];     // RED GRADIENT

  return (
    <LinearGradient
      colors={["#00121d", "#000a13"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Top Row */}
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={iconName} size={22} color={barColor} />
        </View>

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.cardTitle, { color: barColor }]}>
            {title}
          </Text>
        </View>

        <Text style={[styles.healthNumber, { color: barColor }]}>
          {health}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={{ marginTop: 12 }}>
        <View style={styles.healthBarBackground}>
          <Animated.View
            style={{
              width: widthInterpolate,
              height: "100%",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={gradientFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: "100%", width: "100%" }}
            />
          </Animated.View>
        </View>

        {showRUL && (
          <Text style={[styles.recoText, { marginTop: 6 }]}>
            Next Maintenance In: {rul?.toFixed(1)} km 
          </Text>
        )}

        <Text style={[styles.recoText, { marginTop: 4, opacity: 0.85 }]}>
          {recommendation}
        </Text>
      </View>
    </LinearGradient>
  );
}
