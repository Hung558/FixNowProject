import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  Platform,
  Modal,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

interface BookingDetail {
  id: number;
  description: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
  serviceId: number;
  customerId: number;
  technicianId?: number;
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  const fetchDetail = useCallback(async () => {
    try {
      const response = await api.get("/bookings/me");
      const found = response.data.find((b: any) => b.id === Number(id));
      if (found) {
        setBooking(found);
      } else {
        // If not in me, check if it's an available job
        if (user?.role === "TECHNICIAN") {
          const avail = await api.get("/bookings/available");
          const foundAvail = avail.data.find((b: any) => b.id === Number(id));
          setBooking(foundAvail || null);
        }
      }

      try {
        const reviewRes = await api.get(`/reviews/booking/${id}`);
        if (reviewRes.data) {
          setExistingReview(reviewRes.data);
        }
      } catch (e) {
        // Ignored
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const updateStatus = async (newStatus: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status: newStatus });
      setShowUpdateModal(true);
      fetchDetail();
    } catch (error: any) {
      console.error("Status update error:", error);
      const errorData = error.response?.data;
      const errorMsg = errorData?.message || errorData?.error || "Không thể cập nhật trạng thái.";
      const statusTitle = error.response?.status ? `Lỗi (${error.response.status})` : "Lỗi";
      
      if (Platform.OS === 'web') {
        alert(`${statusTitle}: ${errorMsg}`);
      } else {
        Alert.alert(statusTitle, errorMsg);
      }
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return { text: "Chờ xác nhận", color: "#f59e0b" };
      case "ACCEPTED": return { text: "Đã nhận việc", color: "#38bdf8" };
      case "IN_PROGRESS": return { text: "Đang sửa chữa", color: "#0ea5e9" };
      case "COMPLETED": return { text: "Hoàn thành", color: "#10b981" };
      case "CANCELLED": return { text: "Đã hủy", color: "#ef4444" };
      default: return { text: status, color: "#94a3b8" };
    }
  };

  const submitReview = async () => {
    if (!comment) {
      if (Platform.OS === 'web') {
        alert("Vui lòng nhập bình luận");
      } else {
        Alert.alert("Lỗi", "Vui lòng nhập bình luận");
      }
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        bookingId: Number(id),
        rating,
        comment,
      });
      if (Platform.OS === 'web') {
        alert("Thành công: Cảm ơn bạn đã đánh giá!");
      } else {
        Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá!");
      }
      fetchDetail();
    } catch (error: any) {
      console.error("Review error:", error);
      const errorMsg = error.response?.data?.message || "Không thể gửi đánh giá.";
      if (Platform.OS === 'web') {
        alert("Lỗi: " + errorMsg);
      } else {
        Alert.alert("Lỗi", errorMsg);
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator style={{ flex: 1 }} size="large" color="#38bdf8" /></View>;
  if (!booking) return <View style={styles.container}><Text style={{ padding: 20 }}>Không tìm thấy đơn hàng.</Text></View>;

  const currentStatusInfo = getStatusLabel(booking.status);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#38bdf8", "#0ea5e9"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
      >
        <View style={styles.section}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Trạng thái hiện tại:</Text>
            <View style={[styles.statusBadge, { backgroundColor: currentStatusInfo.color + "20" }]}>
              <Text style={[styles.statusText, { color: currentStatusInfo.color }]}>
                {currentStatusInfo.text}
              </Text>
            </View>
          </View>
          
          <View style={styles.descBox}>
            <Text style={styles.descriptionText}>{booking.description}</Text>
          </View>
          
          {booking.imageUrl ? (
            <Image source={{ uri: booking.imageUrl }} style={styles.bookingImage} />
          ) : null}
          
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#94a3b8" />
            <Text style={styles.metaText}> {new Date(booking.createdAt).toLocaleString("vi-VN")}</Text>
          </View>
        </View>

        {user?.role === "TECHNICIAN" && Number(booking.technicianId) === Number(user.id) && booking.status !== "COMPLETED" && booking.status !== "CANCELLED" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cập nhật tiến độ</Text>
            <View style={styles.actionGrid}>
              {[
                { id: "IN_PROGRESS", label: "Đang sửa", icon: "hammer-wrench", color: "#0ea5e9" },
                { id: "COMPLETED", label: "Xong việc", icon: "check-circle", color: "#10b981" }
              ].map((s) => (
                <TouchableOpacity 
                  key={s.id} 
                  style={[
                    styles.actionButton, 
                    booking.status === s.id && { backgroundColor: s.color, borderColor: s.color }
                  ]}
                  onPress={() => updateStatus(s.id)}
                >
                  <MaterialCommunityIcons 
                    name={s.icon as any} 
                    size={18} 
                    color={booking.status === s.id ? "#fff" : s.color} 
                    style={{ marginRight: 6 }} 
                  />
                  <Text style={[styles.actionButtonText, { color: s.color }, booking.status === s.id && { color: "#fff" }]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {user?.role === "CUSTOMER" && booking.status === "COMPLETED" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đánh giá dịch vụ</Text>
            {existingReview ? (
              <View style={styles.existingReviewBox}>
                <View style={styles.ratingRowStatus}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <MaterialCommunityIcons 
                      key={s}
                      name={s <= existingReview.rating ? "star" : "star-outline"} 
                      size={24} 
                      color="#eab308" 
                    />
                  ))}
                </View>
                {existingReview.comment ? (
                  <Text style={styles.existingComment}>"{existingReview.comment}"</Text>
                ) : null}
              </View>
            ) : (
              <>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setRating(s)}>
                      <MaterialCommunityIcons 
                        name={s <= rating ? "star" : "star-outline"} 
                        size={32} 
                        color="#eab308" 
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  multiline
                  value={comment}
                  onChangeText={setComment}
                />
                <TouchableOpacity 
                  style={[styles.submitButton, submittingReview && { opacity: 0.6 }]} 
                  onPress={submitReview}
                  disabled={submittingReview}
                >
                  <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showUpdateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <MaterialCommunityIcons name="check-bold" size={40} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Cập nhật thành công!</Text>
            <Text style={styles.successMessage}>Trạng thái đơn hàng đã được thay đổi.</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowUpdateModal(false)}
            >
              <Text style={styles.modalButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, flexDirection: "row", alignItems: "center" },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255, 255, 255, 0.2)", justifyContent: "center", alignItems: "center", marginRight: 16 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  scrollContent: { padding: 24 },
  section: { backgroundColor: "#fff", borderRadius: 28, padding: 24, marginBottom: 20, elevation: 2, shadowOpacity: 0.05, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  statusLabel: { fontSize: 16, fontWeight: "600", color: "#64748b" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontWeight: "700", fontSize: 13 },
  descBox: { backgroundColor: "#f8fafc", padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: "#f1f5f9" },
  descriptionText: { fontSize: 16, color: "#1e293b", lineHeight: 24 },
  bookingImage: { width: "100%", height: 220, borderRadius: 20, marginBottom: 16 },
  metaRow: { flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: 12, color: "#94a3b8" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginBottom: 20 },
  actionGrid: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  actionButton: { 
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 14, 
    borderWidth: 1.5, 
    borderColor: "#e2e8f0" 
  },
  actionButtonText: { fontSize: 13, fontWeight: "700" },
  ratingRowStatus: { flexDirection: "row", justifyContent: "flex-start", gap: 4, marginBottom: 16 },
  ratingRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 20 },
  existingReviewBox: { backgroundColor: "#f0fdf4", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#bbf7d0" },
  existingComment: { fontSize: 16, color: "#166534", fontStyle: "italic", lineHeight: 24 },
  reviewInput: { backgroundColor: "#f8fafc", borderRadius: 16, padding: 16, height: 120, textAlignVertical: "top", marginBottom: 16, borderWidth: 1, borderColor: "#f1f5f9" },
  submitButton: { backgroundColor: "#0ea5e9", height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 32 },
  modalContent: { backgroundColor: "#fff", borderRadius: 32, padding: 32, alignItems: "center", width: "100%", maxWidth: 340 },
  successIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#10b981", justifyContent: "center", alignItems: "center", marginBottom: 24, elevation: 4, shadowColor: "#10b981", shadowOpacity: 0.3, shadowRadius: 10 },
  successTitle: { fontSize: 22, fontWeight: "800", color: "#1e293b", marginBottom: 12, textAlign: "center" },
  successMessage: { fontSize: 16, color: "#64748b", textAlign: "center", marginBottom: 32, lineHeight: 22 },
  modalButton: { backgroundColor: "#1e293b", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16, width: "100%" },
  modalButtonText: { color: "#fff", fontWeight: "700", fontSize: 16, textAlign: "center" },
});
