import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#38bdf8", "#0ea5e9"]} style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account" size={60} color="#38bdf8" />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <MaterialCommunityIcons name="phone-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>{user.phoneNumber || "Chưa cập nhật SĐT"}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="history" size={24} color="#38bdf8" />
          <Text style={styles.menuText}>Lịch sử hoạt động</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="shield-check-outline" size={24} color="#38bdf8" />
          <Text style={styles.menuText}>Bảo mật & Mật khẩu</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  content: {
    padding: 24,
    marginTop: -20,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#334155",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOpacity: 0.05,
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2",
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#ef4444",
  },
});
