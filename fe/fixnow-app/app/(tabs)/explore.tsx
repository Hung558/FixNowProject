import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
  Platform,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { router } from "expo-router";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  tabBar: { flexDirection: "row", backgroundColor: "#fff", padding: 6, marginHorizontal: 24, marginTop: -20, borderRadius: 16, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 12 },
  activeTab: { backgroundColor: "#38bdf8" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  activeTabText: { color: "#fff" },
  listContent: { padding: 24, paddingTop: 32 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700" },
  dateText: { fontSize: 12, color: "#94a3b8" },
  cardDescription: { fontSize: 15, color: "#334155", lineHeight: 20, marginBottom: 16 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  idContainer: { flexDirection: "row", alignItems: "center" },
  idText: { fontSize: 12, color: "#94a3b8", marginLeft: 4 },
  actionRow: { flexDirection: "row", gap: 8 },
  rejectButton: { backgroundColor: "#f1f5f9", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  rejectButtonText: { color: "#64748b", fontSize: 13, fontWeight: "700" },
  acceptButton: { backgroundColor: "#38bdf8", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  acceptButtonText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { marginTop: 12, color: "#94a3b8", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 32 },
  modalContent: { backgroundColor: "#fff", borderRadius: 32, padding: 32, alignItems: "center", width: "100%", maxWidth: 340 },
  successIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#0ea5e9", justifyContent: "center", alignItems: "center", marginBottom: 24, elevation: 4, shadowColor: "#0ea5e9", shadowOpacity: 0.3, shadowRadius: 10 },
  successTitle: { fontSize: 22, fontWeight: "800", color: "#1e293b", marginBottom: 12, textAlign: "center" },
  successMessage: { fontSize: 16, color: "#64748b", textAlign: "center", marginBottom: 32, lineHeight: 22 },
  modalButton: {
    backgroundColor: "#1e293b",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  noStoreContainer: {
    padding: 32,
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 24,
    borderRadius: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  noStoreTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  noStoreText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
});

interface Booking {
  id: number;
  serviceId: number;
  description: string;
  status: string;
  createdAt: string;
  technicianId?: number;
}

export default function ExploreScreen() {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [availableBookings, setAvailableBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"MY_JOBS" | "AVAILABLE">("MY_JOBS");
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [processingIds, setProcessingIds] = useState<Record<number, boolean>>({});

  const fetchData = useCallback(async () => {
    try {
      const myRes = await api.get("/bookings/me");
      setMyBookings(myRes.data);

      if (user?.role === "TECHNICIAN") {
        const availRes = await api.get("/bookings/available");
        setAvailableBookings(availRes.data);
      }
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAcceptJob = async (id: number) => {
    if (processingIds[id]) return;
    setProcessingIds(prev => ({ ...prev, [id]: true }));
    try {
      await api.put(`/bookings/${id}/accept`);
      setShowAcceptModal(true);
      fetchData();
    } catch (error) {
      if (Platform.OS === 'web') {
        alert("Lỗi: Không thể nhận việc.");
      } else {
        Alert.alert("Lỗi", "Không thể nhận việc.");
      }
    } finally {
      setProcessingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRejectJob = async (id: number) => {
    if (processingIds[id]) return;
    setProcessingIds(prev => ({ ...prev, [id]: true }));
    try {
      await api.put(`/bookings/${id}/status`, { status: "CANCELLED" });
      fetchData();
    } catch (error: any) {
      console.error("Reject job error:", error);
      const errorData = error.response?.data;
      const errorMsg = errorData?.message || errorData?.error || "Không thể hủy đơn hàng.";
      const statusTitle = error.response?.status ? `Lỗi (${error.response.status})` : "Lỗi";
      
      if (Platform.OS === 'web') {
        alert(`${statusTitle}: ${errorMsg}`);
      } else {
        Alert.alert(statusTitle, errorMsg);
      }
    } finally {
      setProcessingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING": return { text: "Chờ xác nhận", color: "#f59e0b" };
      case "ACCEPTED": return { text: "Đã nhận việc", color: "#3b82f6" };
      case "IN_PROGRESS": return { text: "Đang sửa chữa", color: "#0ea5e9" };
      case "COMPLETED": return { text: "Hoàn thành", color: "#10b981" };
      case "CANCELLED": return { text: "Đã hủy", color: "#ef4444" };
      default: return { text: status, color: "#64748b" };
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const statusInfo = getStatusInfo(item.status);
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => router.push({ pathname: "/(tabs)/order-detail", params: { id: item.id } })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + "20" }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
          </View>
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</Text>
        </View>
        
        <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.idContainer}>
            <MaterialCommunityIcons name="tag-outline" size={14} color="#94a3b8" />
            <Text style={styles.idText}>ID: #{item.id}</Text>
          </View>
          
          {user?.role === "TECHNICIAN" && item.status === "PENDING" && (
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.rejectButton, processingIds[item.id] && { opacity: 0.5 }]} 
                onPress={() => handleRejectJob(item.id)}
                disabled={processingIds[item.id]}
              >
                {processingIds[item.id] ? <ActivityIndicator size="small" color="#ef4444" /> : <Text style={styles.rejectButtonText}>Hủy</Text>}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.acceptButton, processingIds[item.id] && { opacity: 0.5 }]} 
                onPress={() => handleAcceptJob(item.id)}
                disabled={processingIds[item.id]}
              >
                {processingIds[item.id] ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.acceptButtonText}>Nhận việc</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const checkRole = async () => {
    try {
      const res = await api.get("/auth/me");
      alert(`Backend Info:\nEmail: ${res.data.email}\nRole: ${res.data.role}\nID: ${res.data.id}`);
    } catch (error: any) {
      alert("Error checking role: " + (error.response?.status || error.message));
    }
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#38bdf8", "#0ea5e9"]} style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>
            {user.role === "CUSTOMER" ? "Lịch sử đặt lịch" : "Quản lý công việc"}
          </Text>
          <TouchableOpacity onPress={checkRole} style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontSize: 12 }}>Check Role</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {user.role === "TECHNICIAN" && (
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "MY_JOBS" && styles.activeTab]} 
            onPress={() => setActiveTab("MY_JOBS")}
          >
            <Text style={[styles.tabText, activeTab === "MY_JOBS" && styles.activeTabText]}>Việc của tôi</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "AVAILABLE" && styles.activeTab]} 
            onPress={() => setActiveTab("AVAILABLE")}
          >
            <Text style={[styles.tabText, activeTab === "AVAILABLE" && styles.activeTabText]}>Việc mới</Text>
          </TouchableOpacity>
        </View>
      )}

      {user.role === "TECHNICIAN" && !user.storeCode && activeTab === "AVAILABLE" && (
        <View style={styles.noStoreContainer}>
          <MaterialCommunityIcons name="store-alert" size={48} color="#f59e0b" />
          <Text style={styles.noStoreTitle}>Bạn chưa tham gia cửa hàng</Text>
          <Text style={styles.noStoreText}>Hãy vào phần Cá nhân để tạo hoặc tham gia một cửa hàng để bắt đầu nhận việc nhé!</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={user.role === "CUSTOMER" ? myBookings : (activeTab === "MY_JOBS" ? myBookings : availableBookings)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>Chưa có dữ liệu đơn hàng.</Text>
            </View>
          }
        />
      )}

      <Modal
        visible={showAcceptModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAcceptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <MaterialCommunityIcons name="briefcase-check" size={40} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Nhận việc thành công!</Text>
            <Text style={styles.successMessage}>Chúc mừng! Bạn đã nhận thêm một công việc mới.</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setShowAcceptModal(false);
                setActiveTab("MY_JOBS");
              }}
            >
              <Text style={styles.modalButtonText}>Xem đơn ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


