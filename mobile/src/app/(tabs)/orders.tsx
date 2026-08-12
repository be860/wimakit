import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';
import { formatLE } from '../../services/produce-api';
import { ordersApi, Order } from '../../services/orders-api';
import { fraudApi, FraudCase } from '../../services/fraud-api';
import { useChat } from '../../context/chat-context';

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 1000;

export default function OrdersScreen() {
  const router = useRouter();
  const { sendMessage } = useChat();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [messagingId, setMessagingId] = useState<number | null>(null);

  // Maps orderId -> the most relevant fraud case already filed for it, so
  // buyers can see a report is in progress instead of filing duplicates.
  const [reportedByOrder, setReportedByOrder] = useState<Record<number, FraudCase>>({});

  const [reportModalOrder, setReportModalOrder] = useState<Order | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const load = useCallback(async (opts: { silent?: boolean } = {}) => {
    if (!opts.silent) setLoading(true);
    setErrorMsg(null);
    try {
      const [ordersData, reportsData] = await Promise.all([
        ordersApi.getBuyerOrders(),
        fraudApi.getMyReports().catch(() => [] as FraudCase[]),
      ]);
      setOrders(ordersData);

      const map: Record<number, FraudCase> = {};
      reportsData.forEach((fc) => {
        if (fc.orderId) map[fc.orderId] = fc;
      });
      setReportedByOrder(map);
    } catch (err: any) {
      setErrorMsg(err.data?.message || err.message || 'Could not load your orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh whenever the Orders tab regains focus (e.g. right after checkout).
  useFocusEffect(
    useCallback(() => {
      load({ silent: true });
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load({ silent: true });
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
        return { bg: '#EAF3E4', text: COLORS.accent };
      case 'Shipped':
        return { bg: '#EBF3FA', text: COLORS.primary };
      case 'Processing':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'Cancelled':
        return { bg: '#FDE8E8', text: COLORS.error };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const contactFarmer = (order: Order) => {
    if (!order.farmerPhone) {
      Alert.alert(`Contact ${order.farmerName}`, `Order Ref: ${order.orderNumber}\n\nNo phone number on file — try messaging the farmer instead.`);
      return;
    }
    Alert.alert(
      `Contact ${order.farmerName}`,
      `Phone: ${order.farmerPhone}\nOrder Ref: ${order.orderNumber}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${order.farmerPhone}`) },
      ]
    );
  };

  const messageFarmer = async (order: Order) => {
    setMessagingId(order.id);
    try {
      await sendMessage(
        order.farmerId,
        `Hello ${order.farmerName}, following up on order ${order.orderNumber} for ${order.produceName}.`,
        order.farmerName,
        order.produceName,
        order.produceId
      );
      router.push('/(tabs)/messages');
    } catch (err: any) {
      Alert.alert('Message Not Sent', err?.data?.message || err?.message || 'Please try again.');
    } finally {
      setMessagingId(null);
    }
  };

  const openReportModal = (order: Order) => {
    setReportReason('');
    setReportError(null);
    setReportModalOrder(order);
  };

  const submitReport = async () => {
    if (!reportModalOrder) return;
    const reason = reportReason.trim();

    if (reason.length < MIN_REASON_LENGTH) {
      setReportError(`Please provide a bit more detail (at least ${MIN_REASON_LENGTH} characters).`);
      return;
    }

    setSubmittingReport(true);
    setReportError(null);

    try {
      const result = await fraudApi.report({ orderId: reportModalOrder.id, reason });
      setReportedByOrder((prev) => ({ ...prev, [reportModalOrder.id]: result.fraudCase }));
      setReportModalOrder(null);
      Alert.alert(
        'Report Submitted',
        `${result.message}\n\nCase Reference: ${result.fraudCase.caseNumber}`
      );
    } catch (err: any) {
      setReportError(err?.data?.message || err?.message || 'Could not submit your report. Please try again.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const statusStyle = getStatusColor(item.status);
    const existingReport = reportedByOrder[item.id];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.iconCircle}>
            <Ionicons name="bag-handle-outline" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.itemDetails}>
            <Text style={styles.produceName}>{item.produceName}</Text>
            <Text style={styles.farmerName}>Seller: {item.farmerName}</Text>
            <Text style={styles.quantityText}>Quantity: {item.quantityText}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.totalLabel}>Total Price:</Text>
          <Text style={styles.totalPrice}>{formatLE(item.amount)}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.messageBtn}
            activeOpacity={0.8}
            onPress={() => messageFarmer(item)}
            disabled={messagingId === item.id}
          >
            {messagingId === item.id ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="chatbubbles-outline" size={16} color={COLORS.primary} />
                <Text style={styles.messageBtnText}>Message</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactBtn}
            activeOpacity={0.8}
            onPress={() => contactFarmer(item)}
          >
            <Ionicons name="call-outline" size={16} color={COLORS.primary} />
            <Text style={styles.contactBtnText}>Call Farmer</Text>
          </TouchableOpacity>
        </View>

        {existingReport ? (
          <View style={styles.reportedPill}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#D97706" />
            <Text style={styles.reportedPillText}>
              Reported · {existingReport.status} ({existingReport.caseNumber})
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.reportLink}
            activeOpacity={0.7}
            onPress={() => openReportModal(item)}
          >
            <Ionicons name="flag-outline" size={14} color={COLORS.error} />
            <Text style={styles.reportLinkText}>Report an Issue</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title} allowFontScaling={false}>
          My Orders
        </Text>
        <Text style={styles.subtitle} allowFontScaling={false}>
          Track your fresh produce deliveries
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : errorMsg && orders.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.placeholderText} />
          <Text style={styles.emptyTitle}>Couldn't load your orders</Text>
          <Text style={styles.emptySubtitle}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerBox}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="receipt-outline" size={36} color={COLORS.accent} />
          </View>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            Orders you place from the marketplace will show up here so you can track delivery.
          </Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)/browse')}>
            <Text style={styles.browseBtnText}>Shop Fresh Produce</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Report an Issue Modal */}
      <Modal
        visible={!!reportModalOrder}
        animationType="slide"
        transparent
        onRequestClose={() => !submittingReport && setReportModalOrder(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.reportModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="flag" size={18} color={COLORS.error} />
                <Text style={styles.modalTitle} allowFontScaling={false}>
                  Report an Issue
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => !submittingReport && setReportModalOrder(null)}
                hitSlop={6}
              >
                <Ionicons name="close" size={20} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {reportModalOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.reportOrderSummary}>
                  <Text style={styles.reportOrderNumber}>{reportModalOrder.orderNumber}</Text>
                  <Text style={styles.reportOrderDetail}>
                    {reportModalOrder.produceName} · {formatLE(reportModalOrder.amount)}
                  </Text>
                  <Text style={styles.reportOrderDetail}>Seller: {reportModalOrder.farmerName}</Text>
                </View>

                <Text style={styles.reportHelpText}>
                  Tell us what went wrong — for example, produce not delivered, wrong quantity,
                  poor quality, or a payment discrepancy. Our team reviews every report.
                </Text>

                {reportError ? (
                  <View style={styles.errorAlert}>
                    <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                    <Text style={styles.errorAlertText}>{reportError}</Text>
                  </View>
                ) : null}

                <TextInput
                  style={styles.reasonInput}
                  placeholder="Describe the issue in detail..."
                  placeholderTextColor={COLORS.placeholderText}
                  value={reportReason}
                  onChangeText={(text) => setReportReason(text.slice(0, MAX_REASON_LENGTH))}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  editable={!submittingReport}
                />
                <Text style={styles.charCounter}>
                  {reportReason.trim().length}/{MAX_REASON_LENGTH}
                </Text>

                <TouchableOpacity
                  style={[styles.submitReportBtn, submittingReport && styles.submitReportBtnDisabled]}
                  activeOpacity={0.85}
                  onPress={submitReport}
                  disabled={submittingReport}
                >
                  {submittingReport ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitReportBtnText}>Submit Report</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#2E4E92',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  orderDate: {
    fontSize: 11.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  statusText: {
    fontSize: 11.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F4FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  produceName: {
    fontSize: 14.5,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  farmerName: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  quantityText: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: '#444444',
    marginTop: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 12.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  totalPrice: {
    fontSize: 15,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  messageBtnText: {
    fontSize: 12.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.primary,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  contactBtnText: {
    fontSize: 12.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  reportLinkText: {
    fontSize: 12,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.error,
  },
  reportedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  reportedPillText: {
    fontSize: 11.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#92600A',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF3E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  retryBtnText: {
    fontSize: 13.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  browseBtn: {
    marginTop: 8,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
  },
  browseBtnText: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  reportModalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  reportOrderSummary: {
    backgroundColor: '#F9FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  reportOrderNumber: {
    fontSize: 13.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  reportOrderDetail: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  reportHelpText: {
    fontSize: 12.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    borderColor: '#F8B4B4',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    gap: 6,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.error,
  },
  reasonInput: {
    minHeight: 110,
    backgroundColor: '#F4F6FA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13.5,
    fontFamily: FONTS.bodyRegular,
    color: '#1A1A1A',
  },
  charCounter: {
    fontSize: 11,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 16,
  },
  submitReportBtn: {
    height: 52,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  submitReportBtnDisabled: {
    opacity: 0.7,
  },
  submitReportBtnText: {
    fontSize: 14.5,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
