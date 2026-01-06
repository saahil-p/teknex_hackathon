import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";

// Haversine formula for distance
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function OEMGaragesScreen({ route, navigation }) {
  const { type, obdData } = route.params; // <-- Now receiving the actual sample

  const [loading, setLoading] = useState(true);
  const [garages, setGarages] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    getLocationThenFetch();
  }, []);

  async function getLocationThenFetch() {
    setLoading(true);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Location permission denied");
      return setLoading(false);
    }

    let pos = await Location.getCurrentPositionAsync({});
    setUserLocation(pos.coords);

    const { latitude, longitude } = pos.coords;

    const query = `
[out:json][timeout:25];
(
  node["amenity"="car_dealership"](around:100000,${latitude},${longitude});
  node["shop"="car_repair"](around:100000,${latitude},${longitude});
  node["service"="vehicle_repair"](around:100000,${latitude},${longitude});
  node["amenity"="car_repair"](around:100000,${latitude},${longitude});
);
out body;
`;

    const overpassURL =
      "https://overpass-api.de/api/interpreter?data=" +
      encodeURIComponent(query);

    try {
      const res = await fetch(overpassURL);
      const json = await res.json();

      const filtered = json.elements.filter(
        (item) =>
          item.tags?.shop === "car_repair" ||
          item.tags?.amenity === "car_repair" ||
          item.tags?.amenity === "service" ||
          item.tags?.amenity === "car_dealership" ||
          item.tags?.service === "vehicle_repair"
      );

      const withDistance = filtered
        .map((s) => ({
          ...s,
          distance: getDistance(latitude, longitude, s.lat, s.lon),
        }))
        .sort((a, b) => a.distance - b.distance);

      setGarages(withDistance);
    } catch (e) {
      alert("Error loading garages");
    }

    setLoading(false);
  }

  if (loading || !userLocation)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#06212c",
        }}
      >
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={{ color: "white", marginTop: 10 }}>
          Finding Authorized service centres...
        </Text>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#06212c", padding: 20 }}>
      <Text style={{ color: "white", fontSize: 26, marginBottom: 15 }}>
        Authorized Service Centres
      </Text>

      <FlatList
        data={garages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("BookingChoice", {
                centre: item,
                type,
                obdData, // <-- passing OBD data forward
              })
            }
            style={{
              backgroundColor: "#0f2f3b",
              padding: 18,
              borderRadius: 12,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
              {item.tags?.name ?? "Authorized Service Centre"}
            </Text>

            <Text style={{ color: "#7dbde8" }}>
              Brand: {item.tags?.brand ?? "OEM Certified"}
            </Text>

            <Text
              style={{ color: "#2ecc71", marginTop: 6, fontWeight: "600" }}
            >
              📍 {item.distance.toFixed(1)} km away
            </Text>

            <Text style={{ color: "#9fe4c1", marginTop: 3 }}>
              Tap to book a visit →
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
