// styles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // ================= SCREEN =================
  container: {
    flex: 1,
    backgroundColor: "#000814",
    paddingTop: 44,
    paddingHorizontal: 18,
  },

  // ================= HEADER =================
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#00e8ff",
    fontSize: 22,
    fontWeight: "800",
    textShadowColor: "#00e8ff",
    textShadowRadius: 3, // reduced glow
  },
  subtitle: { color: "#7bb6d9", fontSize: 13 },

  // ================= TOP STATS =================
  topArea: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSummary: { flex: 1, paddingRight: 12 },
  overallLabel: { color: "#89b8c7", fontSize: 14, marginBottom: 6 },
  overallLarge: {
    color: "#00eaff",
    fontSize: 42,
    fontWeight: "800",
    textShadowColor: "#00eaff",
    textShadowRadius: 4, // toned down glow
  },

  // ================= RING =================
  ringBox: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },

  // ================= HEALTH CARDS =================
  card: {
    backgroundColor: "rgba(10,20,35,0.55)",
    padding: 16,
    borderRadius: 18,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0,255,255,0.08)", // softer border
    shadowColor: "#00eaff",
    shadowOpacity: 0.15, // reduced shadow
    shadowRadius: 6,
    elevation: 3,
  },

  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "rgba(0,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#c7e8f7" },
  cardSubtitle: { color: "#8ea7b4", fontSize: 12 },

  healthNumber: { fontWeight: "700", fontSize: 16 },
  smallLabel: { color: "#9fb7c7", fontSize: 12 },
  healthBarBackground: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 8,
  },
  healthBarFill: {
    height: "100%",
    borderRadius: 8,
    opacity: 0.95,
  },

  recoText: { color: "#b6d7e1", marginTop: 8 },
  lastSync: { color: "#7fa2ad", fontSize: 12, marginTop: 8 },

  // ================= BUTTONS (Cleaner Design) =================
  syncButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 10,

    backgroundColor: "#00bcd4", // softer cyan
    shadowColor: "#00eaff",
    shadowOpacity: 0.25, // reduced glow
    shadowRadius: 6,
    elevation: 4,
  },
  syncText: {
    color: "#00121a",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },

  list: { marginTop: 8 },

  // ================= BOTTOM CTA =================
  bottomServiceWrapper: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 99999,
    elevation: 10,
  },
  bottomServiceButton: {
    backgroundColor: "#ff3b3b",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#ff3b3b",
    shadowOpacity: 0.35, // reduced glow
    shadowRadius: 8,
    elevation: 6,
  },
  bottomServiceText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.4,
  },
});

// ================= NAV HEADER THEME =================
export const headerTheme = {
  headerStyle: { backgroundColor: "#000814" },
  headerTintColor: "#00e8ff",
  headerTitleStyle: {
    color: "#e6f7ff",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headerBackTitleVisible: false,
  headerShadowVisible: false,
};
