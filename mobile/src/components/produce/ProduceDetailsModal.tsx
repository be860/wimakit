import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';
import { Produce, formatLE } from '../../services/produce-api';
import { useCart } from '../../context/cart-context';
import { useFavorites } from '../../context/favorites-context';
import { useChat } from '../../context/chat-context';

interface ProduceDetailsModalProps {
  produce: Produce | null;
  visible: boolean;
  onClose: () => void;
  onOpenChat?: (farmerId: number, farmerName: string, produceName: string) => void;
}

export function ProduceDetailsModal({
  produce,
  visible,
  onClose,
  onOpenChat,
}: ProduceDetailsModalProps) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { sendMessage } = useChat();

  const [quantity, setQuantity] = useState(1);
  const [sendingChat, setSendingChat] = useState(false);

  // Reset the stepper each time a new produce item is opened.
  useEffect(() => {
    if (produce) setQuantity(produce.quantity > 0 ? 1 : 0);
  }, [produce?.id]);

  if (!produce) return null;

  const favorite = isFavorite(produce.id);
  const inStock = produce.quantity > 0 && produce.status === 'Live';
  const atMax = quantity >= produce.quantity;

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(produce, quantity);
    Alert.alert(
      'Added to Cart 🛒',
      `${quantity} × ${produce.name} added to your shopping cart.`,
      [
        { text: 'Continue Shopping', style: 'cancel', onPress: onClose },
        { text: 'View Cart', onPress: onClose },
      ]
    );
  };

  const handleMessageFarmer = async () => {
    if (sendingChat) return;
    setSendingChat(true);
    try {
      await sendMessage(
        produce.farmerId,
        `Hello ${produce.farmerName}, I am interested in buying ${quantity || 1} ${produce.unit || 'units'} of ${produce.name}. Is it available?`,
        produce.farmerName,
        produce.name,
        produce.id
      );
      onClose();
      if (onOpenChat) {
        onOpenChat(produce.farmerId, produce.farmerName, produce.name);
      }
    } catch (err: any) {
      Alert.alert('Message Not Sent', err?.data?.message || err?.message || 'Please try again.');
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.dragHandle} />

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* Produce Image */}
            <View style={styles.imageContainer}>
              {produce.imageUrl ? (
                <Image
                  source={{ uri: produce.imageUrl }}
                  style={styles.produceImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderBox}>
                  <Ionicons name="leaf-outline" size={64} color={COLORS.accent} />
                </View>
              )}

              <View style={styles.imageTopRow}>
                <TouchableOpacity style={styles.roundIconBtn} onPress={onClose} hitSlop={8}>
                  <Ionicons name="close" size={20} color="#1A1A1A" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.roundIconBtn}
                  onPress={() => toggleFavorite(produce.id)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={favorite ? 'heart' : 'heart-outline'}
                    size={20}
                    color={favorite ? COLORS.error : COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.imageBottomRow}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText} allowFontScaling={false}>
                    {produce.category}
                  </Text>
                </View>
                {!inStock && (
                  <View style={styles.outOfStockTag}>
                    <Text style={styles.outOfStockTagText} allowFontScaling={false}>
                      {produce.status !== 'Live' ? 'Unavailable' : 'Out of Stock'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Produce Info */}
            <View style={styles.detailsBody}>
              <Text style={styles.title} allowFontScaling={false}>
                {produce.name}
              </Text>

              <View style={styles.priceCard}>
                <View>
                  <Text style={styles.priceLabel} allowFontScaling={false}>
                    Price
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price} allowFontScaling={false}>
                      {formatLE(produce.price)}
                    </Text>
                    <Text style={styles.unitText} allowFontScaling={false}>
                      / {produce.unit || 'unit'}
                    </Text>
                  </View>
                </View>
                <View style={styles.stockPill}>
                  <Ionicons
                    name={inStock ? 'checkmark-circle' : 'alert-circle'}
                    size={13}
                    color={inStock ? COLORS.accent : COLORS.error}
                  />
                  <Text
                    style={[
                      styles.stockPillText,
                      { color: inStock ? COLORS.accent : COLORS.error },
                    ]}
                    allowFontScaling={false}
                  >
                    {inStock ? `${produce.quantity} ${produce.unit || 'unit'} available` : 'Unavailable'}
                  </Text>
                </View>
              </View>

              {/* Farmer Info Card */}
              <View style={styles.farmerCard}>
                <View style={styles.farmerAvatar}>
                  <Ionicons name="person" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.farmerDetails}>
                  <Text style={styles.farmerName} numberOfLines={1} allowFontScaling={false}>
                    {produce.farmerName || 'Verified Farmer'}
                  </Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
                    <Text style={styles.locationText} numberOfLines={1} allowFontScaling={false}>
                      {produce.farmerLocation || produce.location || 'Sierra Leone'}
                    </Text>
                  </View>
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.accent} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.sectionHeader} allowFontScaling={false}>
                Description
              </Text>
              <Text style={styles.descriptionText} allowFontScaling={false}>
                {produce.description ||
                  'Freshly harvested agricultural produce direct from local Sierra Leonean farms. Quality inspected and packaged for buyers.'}
              </Text>

              {/* Quantity Stepper */}
              {inStock && (
                <View style={styles.quantitySection}>
                  <Text style={styles.sectionHeader} allowFontScaling={false}>
                    Select Quantity ({produce.unit || 'unit'})
                  </Text>
                  <View style={styles.stepperRow}>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Ionicons name="remove" size={18} color="#1A1A1A" />
                    </TouchableOpacity>

                    <Text style={styles.quantityText} allowFontScaling={false}>
                      {quantity}
                    </Text>

                    <TouchableOpacity
                      style={[styles.stepBtn, atMax && styles.stepBtnDisabled]}
                      onPress={() => setQuantity(Math.min(produce.quantity, quantity + 1))}
                      disabled={atMax}
                    >
                      <Ionicons name="add" size={18} color={atMax ? COLORS.placeholderText : '#1A1A1A'} />
                    </TouchableOpacity>

                    <Text style={styles.totalCalcPrice} allowFontScaling={false}>
                      Total: {formatLE(produce.price * quantity)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.messageBtn}
                  activeOpacity={0.8}
                  onPress={handleMessageFarmer}
                  disabled={sendingChat}
                >
                  {sendingChat ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <>
                      <Ionicons name="chatbubbles-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.messageBtnText} allowFontScaling={false}>
                        Chat
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cartBtn, !inStock && styles.cartBtnDisabled]}
                  activeOpacity={0.85}
                  onPress={handleAddToCart}
                  disabled={!inStock}
                >
                  <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.cartBtnText} allowFontScaling={false}>
                    {inStock ? 'Add to Cart' : 'Unavailable'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 24,
    overflow: 'hidden',
  },
  dragHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginTop: 10,
    marginBottom: 6,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#F4F6FA',
    position: 'relative',
  },
  produceImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF3E4',
  },
  imageTopRow: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  imageBottomRow: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  categoryTag: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  categoryTagText: {
    fontSize: 11.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  outOfStockTag: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  outOfStockTagText: {
    fontSize: 11.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailsBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 14,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F4FC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 21,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: COLORS.primary,
  },
  unitText: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    maxWidth: 150,
  },
  stockPillText: {
    fontSize: 10.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    flexShrink: 1,
  },
  farmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  farmerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EBF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  farmerDetails: {
    flex: 1,
  },
  farmerName: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    flexShrink: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EAF3E4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  verifiedText: {
    fontSize: 10.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.accent,
  },
  sectionHeader: {
    fontSize: 13.5,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 22,
  },
  quantitySection: {
    marginBottom: 24,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 24,
    textAlign: 'center',
  },
  totalCalcPrice: {
    fontSize: 13.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 'auto',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 54,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  messageBtnText: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  cartBtnDisabled: {
    backgroundColor: '#C4C8D4',
    shadowOpacity: 0,
    elevation: 0,
  },
  cartBtnText: {
    fontSize: 14.5,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
