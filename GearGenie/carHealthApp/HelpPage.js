import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";

const mockGarages = {
  engine: [
    { name: "OEM Engine Care Center", distance: "2.1 km" },
    { name: "Certified Auto Engines", distance: "5.4 km" }
  ],
  battery: [
    { name: "EV Battery Service Hub", distance: "1.8 km" },
    { name: "Authorized Battery Clinic", distance: "6.2 km" }
  ],
  brake: [
    { name: "Brake Safety Garage", distance: "3.3 km" },
    { name: "ABS Certified Workshop", distance: "7.0 km" }
  ]
};

export default function HelpPage({ route, navigation }) {
  const type = route.params.type; // engine / battery / brake
  const list = mockGarages[type];

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#06212c" }}>
      <Text style={{ color: "white", fontSize: 26, marginBottom: 20 }}>
        Nearby OEM-Certified {type.toUpperCase()} Garages
      </Text>

      <FlatList
        data={list}
        keyExtractor={(item, i) => String(i)}
        renderItem={({ item }) => (
          <View style={{ padding: 15, backgroundColor: "#0f2f3b", borderRadius: 10, marginBottom: 12 }}>
            <Text style={{ color: "white", fontSize: 18 }}>{item.name}</Text>
            <Text style={{ color: "#9fb7c7" }}>{item.distance} away</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={{ marginTop: 20, padding: 15, backgroundColor: "#2ecc71", borderRadius: 8 }}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ color: "#052026", textAlign: "center", fontWeight: "bold" }}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
