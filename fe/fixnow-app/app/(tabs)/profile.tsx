import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, TextInput, Alert, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { createStore, joinStore } from "@/services/store.service";

export default function ProfileScreen() {
  const { user, logout, login } = useAuth();
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [modalType, setModalType] = useState<"create" | "join">("join");
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeCode, setStoreCode] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleStoreAction = async () => {
    setLoading(true);
    try {
      let updatedStore;
      if (modalType === "create") {
        if (!storeName) throw new Error("Vui lòng nhập tên cửa hàng");
        updatedStore = await createStore(storeName, storeAddress);
      } else {
        if (!storeCode) throw new Error("Vui lòng nhập mã cửa hàng");
        updatedStore = await joinStore(storeCode);
      }

      // Update local user state via Context
      const updatedUser = { ...user, storeCode: updatedStore.storeCode };
      const token = await (await import("@react-native-async-storage/async-storage")).default.getItem("userToken") || "";
      await login(updatedUser, token);
      
      Alert.alert("Thành công", modalType === "create" ? "Đã tạo cửa hàng thành công!" : "Đã tham gia cửa hàng thành công!");
      setShowStoreModal(false);
      setStoreName("");
      setStoreAddress("");
      setStoreCode("");
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

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

        {user.role === "TECHNICIAN" && (
          <View style={styles.storeSection}>
            <Text style={styles.sectionTitle}>Cửa hàng của tôi</Text>
            {user.storeCode ? (
              <View style={styles.storeCard}>
                <View style={styles.storeInfoMain}>
                  <MaterialCommunityIcons name="store" size={32} color="#0ea5e9" />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.storeCodeLabel}>Mã cửa hàng:</Text>
                    <Text style={styles.storeCodeValue}>{user.storeCode}</Text>
                  </View>
                </View>
                <Text style={styles.storeHint}>Chia sẻ mã này cho đồng nghiệp để cùng quản lý đơn hàng.</Text>
              </View>
            ) : (
              <View style={styles.storeActions}>
                <TouchableOpacity
                  style={[styles.storeButton, { backgroundColor: "#f0f9ff" }]}
                  onPress={() => {
                    setModalType("create");
                    setShowStoreModal(true);
                  }}
                >
                  <MaterialCommunityIcons name="plus-circle-outline" size={24} color="#0ea5e9" />
                  <Text style={[styles.storeButtonText, { color: "#0ea5e9" }]}>Tạo cửa hàng</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.storeButton, { backgroundColor: "#f0fdf4" }]}
                  onPress={() => {
                    setModalType("join");
                    setShowStoreModal(true);
                  }}
                >
                  <MaterialCommunityIcons name="login-variant" size={24} color="#22c55e" />
                  <Text style={[styles.storeButtonText, { color: "#22c55e" }]}>Tham gia</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

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

      <Modal visible={showStoreModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === "create" ? "Tạo cửa hàng mới" : "Tham gia cửa hàng"}
              </Text>
              <TouchableOpacity onPress={() => setShowStoreModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {modalType === "create" ? (
              <>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Tên cửa hàng"
                  value={storeName}
                  onChangeText={setStoreName}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Địa chỉ (tùy chọn)"
                  value={storeAddress}
                  onChangeText={setStoreAddress}
                />
              </>
            ) : (
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập mã cửa hàng (Vòng: ABC123)"
                value={storeCode}
                onChangeText={(text) => setStoreCode(text.toUpperCase())}
                autoCapitalize="characters"
              />
            )}

            <TouchableOpacity
              style={styles.modalSubmit}
              onPress={handleStoreAction}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.modalSubmitText}>
                  {modalType === "create" ? "Xác nhận tạo" : "Xác nhận tham gia"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  storeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
  },
  storeCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: "#0ea5e9",
    shadowOpacity: 0.1,
  },
  storeInfoMain: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  storeCodeLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  storeCodeValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0ea5e9",
    letterSpacing: 2,
  },
  storeHint: {
    fontSize: 12,
    color: "#94a3b8",
    fontStyle: "italic",
  },
  storeActions: {
    flexDirection: "row",
    gap: 12,
  },
  storeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  storeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  modalInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#1e293b",
  },
  modalSubmit: {
    backgroundColor: "#0ea5e9",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  modalSubmitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
