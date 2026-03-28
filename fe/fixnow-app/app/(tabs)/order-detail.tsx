import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Animated,
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
  finalPrice?: number;
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReviewSuccessModal, setShowReviewSuccessModal] = useState(false);
  
  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  // Payment state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [showPaymentProcessing, setShowPaymentProcessing] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentProgress] = useState(new Animated.Value(0));

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

  const updateStatus = async (newStatus: string, finalPrice?: number) => {
    try {
      await api.put(`/bookings/${id}/status`, { status: newStatus, finalPrice });
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

  const handleRequestPayment = () => {
    const price = parseFloat(priceInput.replace(/,/g, ''));
    if (!price || price <= 0) {
      if (Platform.OS === 'web') {
        alert("Vui lòng nhập số tiền hợp lệ");
      } else {
        Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
      }
      return;
    }
    setShowPriceModal(false);
    setPriceInput("");
    updateStatus("PAYMENT_PENDING", price);
  };

  const handleMockPayment = async () => {
    setShowPaymentProcessing(true);
    paymentProgress.setValue(0);
    Animated.timing(paymentProgress, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start(async () => {
      try {
        await api.put(`/bookings/${id}/status`, { status: "COMPLETED" });
        setShowPaymentProcessing(false);
        setShowPaymentSuccess(true);
        fetchDetail();
      } catch (error: any) {
        setShowPaymentProcessing(false);
        const errorMsg = error.response?.data?.message || "Thanh toán thất bại.";
        if (Platform.OS === 'web') {
          alert("Lỗi: " + errorMsg);
        } else {
          Alert.alert("Lỗi", errorMsg);
        }
      }
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return { text: "Chờ xác nhận", color: "#f59e0b" };
      case "ACCEPTED": return { text: "Đã nhận việc", color: "#38bdf8" };
      case "IN_PROGRESS": return { text: "Đang sửa chữa", color: "#0ea5e9" };
      case "PAYMENT_PENDING": return { text: "Chờ thanh toán", color: "#8b5cf6" };
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
      setShowReviewSuccessModal(true);
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
        <TouchableOpacity onPress={() => router.push("/(tabs)/explore")} style={styles.backButton}>
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

        {user?.role === "TECHNICIAN" && Number(booking.technicianId) === Number(user.id) && booking.status !== "COMPLETED" && booking.status !== "CANCELLED" && booking.status !== "PAYMENT_PENDING" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cập nhật tiến độ</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  booking.status === "IN_PROGRESS" && { backgroundColor: "#0ea5e9", borderColor: "#0ea5e9" }
                ]}
                onPress={() => updateStatus("IN_PROGRESS")}
              >
                <MaterialCommunityIcons 
                  name="hammer-wrench" 
                  size={18} 
                  color={booking.status === "IN_PROGRESS" ? "#fff" : "#0ea5e9"} 
                  style={{ marginRight: 6 }} 
                />
                <Text style={[styles.actionButtonText, { color: "#0ea5e9" }, booking.status === "IN_PROGRESS" && { color: "#fff" }]}>
                  Đang sửa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, { borderColor: "#8b5cf6" }]}
                onPress={() => setShowPriceModal(true)}
              >
                <MaterialCommunityIcons 
                  name="cash-register" 
                  size={18} 
                  color="#8b5cf6" 
                  style={{ marginRight: 6 }} 
                />
                <Text style={[styles.actionButtonText, { color: "#8b5cf6" }]}>
                  Yêu cầu thanh toán
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Customer Payment Section */}
        {user?.role === "CUSTOMER" && booking.status === "PAYMENT_PENDING" && (
          <View style={styles.section}>
            <View style={styles.invoiceHeader}>
              <MaterialCommunityIcons name="receipt" size={28} color="#8b5cf6" />
              <Text style={styles.invoiceTitle}>Hóa đơn thanh toán</Text>
            </View>
            <View style={styles.invoiceBox}>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Phí dịch vụ sửa chữa</Text>
                <Text style={styles.invoiceValue}>
                  {(booking.finalPrice || 0).toLocaleString("vi-VN")}đ
                </Text>
              </View>
              <View style={styles.invoiceDivider} />
              <View style={styles.invoiceRow}>
                <Text style={[styles.invoiceLabel, { fontWeight: "800", color: "#1e293b" }]}>Tổng cộng</Text>
                <Text style={[styles.invoiceValue, { fontWeight: "800", fontSize: 20, color: "#8b5cf6" }]}>
                  {(booking.finalPrice || 0).toLocaleString("vi-VN")}đ
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.payButton} onPress={handleMockPayment}>
              <MaterialCommunityIcons name="wallet" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.payButtonText}>Thanh toán bằng Ví FixNow</Text>
            </TouchableOpacity>
          </View>
        )}

        {booking.status === "COMPLETED" && (
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
            ) : user?.role === "CUSTOMER" ? (
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
            ) : (
              <Text style={{ color: "#64748b", fontStyle: "italic", marginTop: 8 }}>
                Khách hàng chưa gửi đánh giá cho đơn hàng này.
              </Text>
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

      <Modal
        visible={showReviewSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReviewSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.successIconContainer, { backgroundColor: "#eab308", shadowColor: "#eab308" }]}>
              <MaterialCommunityIcons name="star-circle" size={40} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Đánh giá thành công!</Text>
            <Text style={styles.successMessage}>Cảm ơn bạn đã chia sẻ trải nghiệm dịch vụ. Đánh giá của bạn giúp FixNow ngày càng tốt hơn!</Text>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: "#0ea5e9" }]}
              onPress={() => setShowReviewSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Price Input Modal for Technician */}
      <Modal
        visible={showPriceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPriceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.successIconContainer, { backgroundColor: "#8b5cf6", shadowColor: "#8b5cf6" }]}>
              <MaterialCommunityIcons name="cash-register" size={40} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Nhập giá tiền hóa đơn</Text>
            <Text style={[styles.successMessage, { marginBottom: 16 }]}>Nhập số tiền thực tế khách hàng cần thanh toán (VNĐ)</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="VD: 500000"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={priceInput}
              onChangeText={setPriceInput}
            />
            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <TouchableOpacity 
                style={[styles.modalButton, { flex: 1, backgroundColor: "#e2e8f0" }]}
                onPress={() => { setShowPriceModal(false); setPriceInput(""); }}
              >
                <Text style={[styles.modalButtonText, { color: "#64748b" }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { flex: 1, backgroundColor: "#8b5cf6" }]}
                onPress={handleRequestPayment}
              >
                <Text style={styles.modalButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Processing Modal */}
      <Modal
        visible={showPaymentProcessing}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.successIconContainer, { backgroundColor: "#8b5cf6", shadowColor: "#8b5cf6" }]}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
            <Text style={styles.successTitle}>Đang xử lý thanh toán...</Text>
            <Text style={[styles.successMessage, { marginBottom: 16 }]}>Vui lòng đợi trong giây lát</Text>
            <View style={styles.progressBarBg}>
              <Animated.View style={[
                styles.progressBarFill,
                { width: paymentProgress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }
              ]} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Success Modal */}
      <Modal
        visible={showPaymentSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPaymentSuccess(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.successIconContainer, { backgroundColor: "#10b981" }]}>
              <MaterialCommunityIcons name="check-decagram" size={40} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Thanh toán thành công!</Text>
            <Text style={styles.successMessage}>Giao dịch {(booking?.finalPrice || 0).toLocaleString("vi-VN")}đ đã hoàn tất qua Ví FixNow. Cảm ơn bạn đã sử dụng dịch vụ!</Text>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: "#10b981" }]}
              onPress={() => setShowPaymentSuccess(false)}
            >
              <Text style={styles.modalButtonText}>Tuyệt vời!</Text>
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
  invoiceHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  invoiceTitle: { fontSize: 20, fontWeight: "800", color: "#1e293b" },
  invoiceBox: { backgroundColor: "#faf5ff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#e9d5ff", marginBottom: 20 },
  invoiceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  invoiceLabel: { fontSize: 15, color: "#64748b" },
  invoiceValue: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  invoiceDivider: { height: 1, backgroundColor: "#e9d5ff", marginVertical: 8 },
  payButton: { backgroundColor: "#8b5cf6", height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center", flexDirection: "row", shadowColor: "#8b5cf6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  payButtonText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  priceInput: { backgroundColor: "#f8fafc", borderRadius: 16, padding: 16, fontSize: 18, textAlign: "center", marginBottom: 20, borderWidth: 1, borderColor: "#e2e8f0", color: "#1e293b", width: "100%", fontWeight: "700" },
  progressBarBg: { width: "100%", height: 8, backgroundColor: "#e2e8f0", borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#8b5cf6", borderRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 32 },
  modalContent: { backgroundColor: "#fff", borderRadius: 32, padding: 32, alignItems: "center", width: "100%", maxWidth: 340 },
  successIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#10b981", justifyContent: "center", alignItems: "center", marginBottom: 24, elevation: 4, shadowColor: "#10b981", shadowOpacity: 0.3, shadowRadius: 10 },
  successTitle: { fontSize: 22, fontWeight: "800", color: "#1e293b", marginBottom: 12, textAlign: "center" },
  successMessage: { fontSize: 16, color: "#64748b", textAlign: "center", marginBottom: 32, lineHeight: 22 },
  modalButton: { backgroundColor: "#1e293b", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16, width: "100%" },
  modalButtonText: { color: "#fff", fontWeight: "700", fontSize: 16, textAlign: "center" },
});
