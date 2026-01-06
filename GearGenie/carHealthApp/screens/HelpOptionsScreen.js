import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function HelpOptionsScreen({ route, navigation }) {
  const { type } = route.params;   // engine / battery / brake

  return (
    <View style={{ flex: 1, backgroundColor: "#06212c", padding: 25 }}>
      
      <Text style={{ color: "white", fontSize: 26, marginBottom: 25 }}>
        Choose Help Option for {type.toUpperCase()}
      </Text>

      {/* Doorstep Pickup */}
      <TouchableOpacity
        style={{
          backgroundColor: "#0f2f3b",
          padding: 20,
          borderRadius: 14,
          marginBottom: 20,
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() =>
          navigation.navigate("DoorstepPickup", { type })
        }
      >
        <MaterialCommunityIcons name="truck" size={36} color="#2ecc71" />
        <Text style={{ color: "white", fontSize: 20, marginLeft: 15 }}>
          Doorstep Pickup
        </Text>
      </TouchableOpacity>

      {/* OEM Garages */}
      <TouchableOpacity
        style={{
          backgroundColor: "#0f2f3b",
          padding: 20,
          borderRadius: 14,
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() =>
          navigation.navigate("OEMGarages", { type })
        }
      >
        <MaterialCommunityIcons name="factory" size={36} color="#2ecc71" />
        <Text style={{ color: "white", fontSize: 20, marginLeft: 15 }}>
          Authorized Service Centres
        </Text>
      </TouchableOpacity>

    </View>
  );
}
