import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

const { width } = Dimensions.get("window");

interface ServiceItem {
  id: number;
  name: string;
  description: string;
  price: number;
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchServices = async () => {
    try {
      const response = await api.get("/services");
      setServices(response.data);
    } catch (error) {
      console.error("Failed to fetch services", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === "CUSTOMER") {
      fetchServices();
    } else {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    if (user?.role === "CUSTOMER") {
      fetchServices();
    } else {
      setRefreshing(false);
    }
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#38bdf8", "#0ea5e9"]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Chào mừng,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
      >
        {user.role === "CUSTOMER" ? (
          <>
            <Text style={styles.sectionTitle}>Dịch vụ của chúng tôi</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.serviceGrid}>
                {services.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.serviceCard}
                    onPress={() => router.push({
                      pathname: "/(tabs)/create-order",
                      params: { serviceId: item.id, serviceName: item.name }
                    })}
                  >
                    <View style={styles.iconContainer}>
                      <MaterialCommunityIcons 
                        name={item.name.toLowerCase().includes("điện thoại") ? "cellphone-cog" : 
                              item.name.toLowerCase().includes("laptop") ? "laptop-off" :
                              item.name.toLowerCase().includes("vệ sinh") ? "broom" : 
                              item.name.toLowerCase().includes("nâng cấp") ? "rocket-launch" : "tools"} 
                        size={32} color="#38bdf8" 
                      />
                    </View>
                    <Text style={styles.serviceName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.servicePrice}>
                      {item.price.toLocaleString("vi-VN")}đ
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.techDashboard}>
            <MaterialCommunityIcons name="view-dashboard-outline" size={64} color="#94a3b8" />
            <Text style={styles.techTitle}>Technician Dashboard</Text>
            <Text style={styles.techSubtitle}>Check the 'Explore' tab to see available jobs.</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>--</Text>
                <Text style={styles.statLabel}>Jobs Done</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>--</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  roleBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 20,
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  serviceCard: {
    backgroundColor: "#fff",
    width: (width - 64) / 2,
    padding: 20,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0ea5e9",
    marginTop: 4,
  },
  techDashboard: {
    alignItems: "center",
    marginTop: 40,
  },
  techTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e293b",
    marginTop: 16,
  },
  techSubtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 32,
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#38bdf8",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
});
