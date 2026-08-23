import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';
import { useCart, CartItem } from '../../context/cart-context';
import { useAuth } from '../../context/auth-context';
import { formatLE } from '../../services/produce-api';
import { ordersApi } from '../../services/orders-api';
import { getErrorMessage } from '../../services/api-client';
import { PillTextInput } from '../../components/common/PillTextInput';
import { PillSelectInput, PillSelectOption } from '../../components/common/PillSelectInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';

const DELIVERY_FEE = 15000;
const PAYMENT_METHODS: PillSelectOption[] = [
  { value: 'Orange Money', icon: require('../../../assets/images/payment-methods/orange-money.png') },
  { value: 'Africell Money', icon: require('../../../assets/images/payment-methods/africell-money.png') },
  { value: 'QMoney', icon: require('../../../assets/images/payment-methods/qmoney.png') },
  { value: 'Cash on Delivery', ioniconName: 'cash-outline' },
];

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, hydrating, removeFromCart, updateQuantity, itemCount, totalAmount } = useCart();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);
  const [accountNumber, setAccountNumber] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.location || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const openCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutError(null);
    setCheckoutOpen(true);
  };

  const handlePlaceOrder = async () => {
    if (!accountNumber.trim()) {
      setCheckoutError('Please enter the mobile money / account number to pay with.');
      return;
    }

    setSubmitting(true);
    setCheckoutError(null);

    const itemsToCharge = [...cart];
    const failures: { name: string; message: string }[] = [];

    for (const item of itemsToCharge) {
      try {
        const result = await ordersApi.placeOrder({
          produceId: item.produce.id,
          quantity: item.quantity,
          paymentMethod,
          accountNumber: accountNumber.trim(),
          district: district.trim() || undefined,
          deliveryAddress: deliveryAddress.trim() || undefined,
        });

        if (result.success) {
          removeFromCart(item.produce.id);
        } else {
          failures.push({ name: item.produce.name, message: result.message });
        }
      } catch (err: any) {
        failures.push({
          name: item.produce.name,
          message: getErrorMessage(err, 'Could not place this order.'),
        });
      }
    }

    setSubmitting(false);

    if (failures.length === 0) {
      setCheckoutOpen(false);
      Toast.show({
        type: 'success',
        text1: 'Order placed successfully',
        text2: 'The farmers have received your order and will contact you for delivery.',
      });
      router.push('/(tabs)/orders');
    } else if (failures.length === itemsToCharge.length) {
      setCheckoutError(failures[0].message);
      Toast.show({
        type: 'error',
        text1: 'Could not place order',
        text2: failures[0].message,
      });
    } else {
      setCheckoutOpen(false);
      Alert.alert(
        'Some Items Could Not Be Ordered',
        failures.map((f) => `• ${f.name}: ${f.message}`).join('\n') +
          '\n\nThe rest of your order was placed successfully.'
      );
      router.push('/(tabs)/orders');
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const { produce, quantity } = item;
    const atMax = quantity >= Math.max(produce.quantity, 1);

    return (
      <View style={styles.cartCard}>
        <View style={styles.imageBox}>
          {produce.imageUrl ? (
            <Image source={{ uri: produce.imageUrl }} style={styles.produceImg} />
          ) : (
            <Ionicons name="leaf-outline" size={28} color={COLORS.accent} />
          )}
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.produceTitle} numberOfLines={1} allowFontScaling={false}>
            {produce.name}
          </Text>
          <Text style={styles.farmerName} numberOfLines={1} allowFontScaling={false}>
            Seller: {produce.farmerName || 'Verified Farmer'}
          </Text>
          <Text style={styles.itemPrice} allowFontScaling={false}>
            {formatLE(produce.price)} / {produce.unit || 'unit'}
          </Text>
        </View>

        <View style={styles.stepperCol}>
          <TouchableOpacity
            style={styles.trashBtn}
            onPress={() => removeFromCart(produce.id)}
            hitSlop={6}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          </TouchableOpacity>

          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => updateQuantity(produce.id, quantity - 1)}
            >
              <Ionicons name="remove" size={14} color="#1A1A1A" />
            </TouchableOpacity>

            <Text style={styles.qtyText} allowFontScaling={false}>
              {quantity}
            </Text>

            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => !atMax && updateQuantity(produce.id, quantity + 1)}
              disabled={atMax}
            >
              <Ionicons name="add" size={14} color={atMax ? COLORS.placeholderText : '#1A1A1A'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title} allowFontScaling={false}>
          My Shopping Cart
        </Text>
        <Text style={styles.subtitle} allowFontScaling={false}>
          {itemCount} item{itemCount === 1 ? '' : 's'} in cart
        </Text>
      </View>

      {hydrating ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : cart.length === 0 ? (
        <View style={styles.centerBox}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cart-outline" size={40} color={COLORS.accent} />
          </View>
          <Text style={styles.emptyTitle} allowFontScaling={false}>
            Your cart is empty
          </Text>
          <Text style={styles.emptySubtitle} allowFontScaling={false}>
            Explore fresh farm produce directly from verified farmers in your community.
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/browse')}
          >
            <Text style={styles.browseBtnText} allowFontScaling={false}>
              Shop Fresh Produce
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.container}>
          <FlatList
            data={cart}
            keyExtractor={(item) => String(item.produce.id)}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Summary Footer */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel} allowFontScaling={false}>
                Subtotal:
              </Text>
              <Text style={styles.summaryValue} allowFontScaling={false}>
                {formatLE(totalAmount)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel} allowFontScaling={false}>
                Estimated Delivery Fee:
              </Text>
              <Text style={styles.summaryValue} allowFontScaling={false}>
                {formatLE(DELIVERY_FEE)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel} allowFontScaling={false}>
                Total:
              </Text>
              <Text style={styles.totalValue} allowFontScaling={false}>
                {formatLE(totalAmount + DELIVERY_FEE)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              activeOpacity={0.85}
              onPress={openCheckout}
            >
              <Text style={styles.checkoutBtnText} allowFontScaling={false}>
                Proceed to Checkout ({formatLE(totalAmount + DELIVERY_FEE)})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Checkout Modal */}
      <Modal
        visible={checkoutOpen}
        animationType="slide"
        transparent
        onRequestClose={() => !submitting && setCheckoutOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.checkoutModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} allowFontScaling={false}>
                Confirm & Pay
              </Text>
              <TouchableOpacity
                onPress={() => !submitting && setCheckoutOpen(false)}
                hitSlop={6}
              >
                <Ionicons name="close" size={20} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.checkoutSummaryText} allowFontScaling={false}>
                {itemCount} item{itemCount === 1 ? '' : 's'} · Total {formatLE(totalAmount + DELIVERY_FEE)}
              </Text>

              {checkoutError ? (
                <View style={styles.errorAlert}>
                  <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                  <Text style={styles.errorAlertText}>{checkoutError}</Text>
                </View>
              ) : null}

              <PillSelectInput
                label="Payment Method"
                value={paymentMethod}
                options={PAYMENT_METHODS}
                onSelect={setPaymentMethod}
              />

              <PillTextInput
                label="Mobile Money / Account Number"
                placeholder="+232 76 123 456"
                leadingIcon="call-outline"
                keyboardType="phone-pad"
                value={accountNumber}
                onChangeText={setAccountNumber}
              />

              <PillTextInput
                label="District"
                placeholder="e.g. Freetown, Waterloo"
                leadingIcon="location-outline"
                value={district}
                onChangeText={setDistrict}
              />

              <PillTextInput
                label="Delivery Address (optional)"
                placeholder="Street, landmark, or pickup point"
                leadingIcon="navigate-outline"
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
              />

              <PrimaryButton
                label={submitting ? 'Placing Order...' : 'Place Order'}
                variant="accent"
                showArrow={false}
                loading={submitting}
                onPress={handlePlaceOrder}
                style={styles.placeOrderBtn}
              />
            </ScrollView>
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
  container: {
    flex: 1,
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
    paddingBottom: 16,
    gap: 12,
  },
  cartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  imageBox: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#EAF3E4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  produceImg: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
  },
  produceTitle: {
    fontSize: 14.5,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  farmerName: {
    fontSize: 11.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stepperCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 64,
  },
  trashBtn: {
    padding: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F4F6FA',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyText: {
    fontSize: 13,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 14,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 13.5,
    fontFamily: FONTS.bodyMedium,
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: COLORS.primary,
  },
  checkoutBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.pill,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  checkoutBtnText: {
    fontSize: 14.5,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF3E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  browseBtn: {
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
  checkoutModalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
    padding: 24,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  checkoutSummaryText: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    marginBottom: 16,
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
  placeOrderBtn: {
    marginTop: 8,
    marginBottom: 12,
  },
});
