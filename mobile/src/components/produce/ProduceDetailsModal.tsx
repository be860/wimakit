import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';
import { Produce, formatLE } from '../../services/produce-api';
import { useCart } from '../../context/cart-context';
import { useFavorites } from '../../context/favorites-context';
import { useChat } from '../../context/chat-context';
import { reviewsApi, Review } from '../../services/reviews-api';
import { getErrorMessage } from '../../services/api-client';

// A percentage maxHeight on modalContent relies on Yoga measuring its "auto"
// content height first (to know whether it needs to shrink to that cap) —
// but ScrollView doesn't propagate its content's true height upward for that
// measurement, so modalContent's auto height comes out near-zero and there's
// nothing to shrink from. Computing the cap as a concrete number and applying
// it directly to the ScrollView sidesteps that ambiguity entirely.
const MODAL_MAX_HEIGHT = Dimensions.get('window').height * 0.92;

interface ProduceDetailsModalProps {
  produce: Produce | null;
  visible: boolean;
  onClose: () => void;
  onOpenChat?: (farmerId: number, farmerName: string, produceName: string) => void;
}

export function ProduceDetailsModal({
  produce: produceProp,
  visible,
  onClose,
  onOpenChat,
}: ProduceDetailsModalProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { sendMessage } = useChat();

  const [quantity, setQuantity] = useState(1);
  const [sendingChat, setSendingChat] = useState(false);

  // Cache the last-selected produce so the modal keeps rendering full
  // details while it plays its close animation. Callers null out `produce`
  // in the same update that flips `visible` to false, and bailing out on a
  // null produce immediately (below) would unmount <Modal> before it gets
  // to slide away, making the close feel like a hard cut instead of a slide.
  const [displayProduce, setDisplayProduce] = useState<Produce | null>(produceProp);
  useLayoutEffect(() => {
    if (produceProp) setDisplayProduce(produceProp);
  }, [produceProp]);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Reset quantity and fetch reviews when produce changes
  useEffect(() => {
    if (produceProp) {
      setQuantity(produceProp.quantity > 0 ? 1 : 0);
      loadReviews(produceProp.farmerId);
    }
  }, [produceProp?.id]);

  const loadReviews = async (farmerId: number) => {
    setLoadingReviews(true);
    try {
      const data = await reviewsApi.getFarmerReviews(farmerId);
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  if (!displayProduce) return null;
  const produce = displayProduce;

  const favorite = isFavorite(produce.id);
  const inStock = produce.quantity > 0 && produce.status === 'Live';
  const atMax = quantity >= produce.quantity;

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 'New';

  const handleAddToCart = () => {
    addToCart(produce, quantity);
    Alert.alert(
      'Added to Cart! 🛒',
      `${quantity} × ${produce.name} added to your shopping cart.`,
      [
        { text: 'Continue Shopping', style: 'cancel', onPress: onClose },
        {
          text: 'View Cart',
          onPress: () => {
            onClose();
            router.push('/(tabs)/cart');
          },
        },
      ]
    );
  };

  const handleMessageFarmer = async () => {
    try {
      await sendMessage(
        produce.farmerId,
        `Hello ${produce.farmerName}, I am interested in buying ${quantity} ${produce.unit || 'units'} of ${produce.name}. Is it available?`,
        produce.farmerName,
        produce.name,
        produce.id
      );
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Could not send message',
        text2: getErrorMessage(err, 'Please try messaging the farmer again.'),
      });
    }
    onClose();
    if (onOpenChat) {
      onOpenChat(produce.farmerId, produce.farmerName, produce.name);
    }
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      setReviewError('Please write a short comment for your review.');
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);

    try {
      await reviewsApi.createReview({
        produceId: produce.id,
        farmerId: produce.farmerId,
        rating,
        comment: comment.trim(),
      });

      setSubmittingReview(false);
      setWriteModalOpen(false);
      setComment('');
      setRating(5);

      Toast.show({
        type: 'success',
        text1: 'Review submitted',
        text2: 'Thank you for your feedback.',
      });
      loadReviews(produce.farmerId);
    } catch (err: any) {
      setSubmittingReview(false);
      const msg = getErrorMessage(err, 'Could not submit review.');
      setReviewError(msg);
      Toast.show({ type: 'error', text1: 'Could not submit review', text2: msg });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop tap-to-close as a separate sibling behind modalContent —
            not a wrapper around it. A wrapping TouchableOpacity plus manual
            onStartShouldSetResponder claiming (the previous approach) steals
            the touch responder from the nested ScrollView before its pan
            gesture can register, which is what made scrolling to the reviews
            section feel stiff/unresponsive. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.dragHandle} />

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
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
                  {produce.farmerProfilePhotoUrl ? (
                    <Image source={{ uri: produce.farmerProfilePhotoUrl }} style={styles.farmerAvatarImage} />
                  ) : (
                    <Ionicons name="person" size={20} color={COLORS.primary} />
                  )}
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
                  <Ionicons name="chatbubbles-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.messageBtnText} allowFontScaling={false}>
                    Chat
                  </Text>
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

              {/* ── Reviews & Ratings Section ── */}
              <View style={styles.reviewsSection}>
                <View style={styles.reviewsHeaderRow}>
                  <View>
                    <Text style={styles.sectionHeader} allowFontScaling={false}>
                      Ratings & Reviews
                    </Text>
                    <View style={styles.avgRatingRow}>
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text style={styles.avgRatingText} allowFontScaling={false}>
                        {avgRating} {reviews.length > 0 ? `(${reviews.length} reviews)` : '(No reviews yet)'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.writeReviewBtn}
                    onPress={() => setWriteModalOpen(true)}
                  >
                    <Ionicons name="create-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.writeReviewBtnText} allowFontScaling={false}>
                      Write Review
                    </Text>
                  </TouchableOpacity>
                </View>

                {loadingReviews ? (
                  <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
                ) : reviews.length === 0 ? (
                  <View style={styles.noReviewsBox}>
                    <Text style={styles.noReviewsText} allowFontScaling={false}>
                      No reviews yet for this farmer. Be the first to leave a review!
                    </Text>
                  </View>
                ) : (
                  reviews.map((rev) => (
                    <View key={rev.id} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.buyerAvatar}>
                          <Text style={styles.buyerAvatarText}>{rev.initials || 'U'}</Text>
                        </View>
                        <View style={styles.reviewMeta}>
                          <Text style={styles.buyerName}>{rev.buyer}</Text>
                          <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Ionicons
                                key={s}
                                name={s <= rev.rating ? 'star' : 'star-outline'}
                                size={13}
                                color="#F59E0B"
                              />
                            ))}
                          </View>
                        </View>
                        <Text style={styles.reviewDate}>
                          {new Date(rev.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>

                      <Text style={styles.commentText}>{rev.comment}</Text>

                      {/* Farmer Reply if present */}
                      {rev.reply ? (
                        <View style={styles.replyBox}>
                          <View style={styles.replyHeader}>
                            <Ionicons name="return-down-forward-outline" size={14} color={COLORS.primary} />
                            <Text style={styles.replyTitle}>Farmer Response:</Text>
                          </View>
                          <Text style={styles.replyText}>{rev.reply}</Text>
                        </View>
                      ) : null}
                    </View>
                  ))
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* ── Write Review Modal ── */}
      <Modal
        visible={writeModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setWriteModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.writeModalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
          <View style={styles.writeModalContent}>
            <View style={styles.writeModalHeader}>
              <Text style={styles.writeModalTitle} allowFontScaling={false}>
                Rate & Review Farmer
              </Text>
              <TouchableOpacity onPress={() => setWriteModalOpen(false)} hitSlop={6}>
                <Ionicons name="close" size={20} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {reviewError ? (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorAlertText}>{reviewError}</Text>
              </View>
            ) : null}

            <Text style={styles.starPrompt} allowFontScaling={false}>
              Tap stars to rate
            </Text>
            <View style={styles.starPickerRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} hitSlop={4}>
                  <Ionicons
                    name={s <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel} allowFontScaling={false}>
              Your Comment
            </Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Tell others about the produce quality and farmer service..."
              placeholderTextColor={COLORS.placeholderText}
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
            />

            <TouchableOpacity
              style={[styles.submitReviewBtn, submittingReview && styles.btnDisabled]}
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitReviewBtnText} allowFontScaling={false}>
                  Submit Review
                </Text>
              )}
            </TouchableOpacity>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
    maxHeight: MODAL_MAX_HEIGHT,
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
  scrollBody: {
    maxHeight: MODAL_MAX_HEIGHT,
  },
  imageContainer: {
    width: '100%',
    height: 220,
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
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBottomRow: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  categoryTagText: {
    fontSize: 11.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  outOfStockTag: {
    backgroundColor: 'rgba(211, 47, 47, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
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
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
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
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stockPillText: {
    fontSize: 11.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
  },
  farmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  farmerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  farmerAvatarImage: {
    width: '100%',
    height: '100%',
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
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EAF3E4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  verifiedText: {
    fontSize: 10.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.accent,
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: 20,
  },
  quantitySection: {
    marginBottom: 20,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    minWidth: 20,
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
    marginBottom: 24,
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 50,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
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
    height: 50,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accent,
  },
  cartBtnDisabled: {
    backgroundColor: '#C4C8D4',
  },
  cartBtnText: {
    fontSize: 14.5,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewsSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 20,
    paddingBottom: 24,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  avgRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  avgRatingText: {
    fontSize: 12.5,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: '#F0F4FC',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  writeReviewBtnText: {
    fontSize: 12,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.primary,
  },
  noReviewsBox: {
    padding: 16,
    backgroundColor: '#F9FAFC',
    borderRadius: 12,
    alignItems: 'center',
  },
  noReviewsText: {
    fontSize: 12.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#F9FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  buyerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyerAvatarText: {
    fontSize: 12,
    fontFamily: FONTS.headingBold,
    color: '#FFFFFF',
  },
  reviewMeta: {
    flex: 1,
  },
  buyerName: {
    fontSize: 13,
    fontFamily: FONTS.bodySemiBold,
    color: '#1A1A1A',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 1,
  },
  reviewDate: {
    fontSize: 11,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  commentText: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: '#333333',
    lineHeight: 18,
  },
  replyBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  replyTitle: {
    fontSize: 11.5,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.primary,
  },
  replyText: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: '#1E3A8A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  writeModalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  writeModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 22,
  },
  writeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  writeModalTitle: {
    fontSize: 18,
    fontFamily: FONTS.headingBold,
    color: '#1A1A1A',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    borderColor: '#F8B4B4',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  errorAlertText: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.error,
    flex: 1,
  },
  starPrompt: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  starPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12.5,
    fontFamily: FONTS.bodySemiBold,
    color: '#1A1A1A',
    marginBottom: 6,
  },
  commentInput: {
    backgroundColor: '#F4F6FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    height: 80,
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitReviewBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitReviewBtnText: {
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
    color: '#FFFFFF',
  },
});
