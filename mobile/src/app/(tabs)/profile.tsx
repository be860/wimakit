import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';
import { useAuth } from '../../context/auth-context';
import { PillTextInput } from '../../components/common/PillTextInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { apiClient } from '../../services/api-client';
import { fraudApi, FraudCase } from '../../services/fraud-api';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  const [editModalOpen, setEditModalOpen] = useState(false);

  // Fraud report history modal
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [fraudReports, setFraudReports] = useState<FraudCase[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const openReportsModal = () => {
    setReportsModalOpen(true);
    setLoadingReports(true);
    setReportsError(null);
    fraudApi
      .getMyReports()
      .then(setFraudReports)
      .catch((err: any) =>
        setReportsError(err?.data?.message || err?.message || 'Could not load your reports.')
      )
      .finally(() => setLoadingReports(false));
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return { bg: '#EAF3E4', text: COLORS.accent };
      case 'Rejected':
        return { bg: '#FDE8E8', text: COLORS.error };
      case 'Under Review':
        return { bg: '#FEF3C7', text: '#D97706' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  // Profile Edit form states
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);

  const openEditModal = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setPhone(user?.phone || '');
    setLocation(user?.location || '');
    setErrorMsg(null);
    setLocalPhotoUri(null);
    setEditModalOpen(true);
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo Access Needed',
        'Please allow WiMakit to access your photos so you can set a profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setLocalPhotoUri(asset.uri);
    await uploadPhoto(asset.uri, asset.mimeType, asset.fileName);
  };

  const uploadPhoto = async (uri: string, mimeType?: string | null, fileName?: string | null) => {
    setUploadingPhoto(true);
    setErrorMsg(null);
    try {
      const inferredExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const type = mimeType || (inferredExt === 'png' ? 'image/png' : 'image/jpeg');
      const name = fileName || `profile-photo.${inferredExt}`;

      const formData = new FormData();
      formData.append(
        'file',
        Platform.OS === 'web'
          ? await (await fetch(uri)).blob()
          : ({ uri, name, type } as any)
      );

      await apiClient.post('/api/user/profile/photo', formData);
      await refreshUser();
    } catch (err: any) {
      setLocalPhotoUri(null);
      setErrorMsg(err.data?.message || err.message || 'Could not upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('First and last name are required.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      await apiClient.put('/api/user/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        location: location.trim(),
      });

      await refreshUser();
      setSaving(false);
      setEditModalOpen(false);

      Alert.alert('Profile Updated 🎉', 'Your profile details have been updated successfully.');
    } catch (err: any) {
      setSaving(false);
      const msg = err.data?.message || err.message || 'Could not update profile. Please try again.';
      setErrorMsg(msg);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of WiMakit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  const getInitials = () => {
    if (!user) return 'B';
    const f = user.firstName ? user.firstName[0] : '';
    const l = user.lastName ? user.lastName[0] : '';
    return (f + l).toUpperCase() || 'B';
  };

  const displayedPhotoUri = localPhotoUri || user?.profilePhotoUrl;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.title} allowFontScaling={false}>
            My Account
          </Text>

          <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {user?.profilePhotoUrl ? (
            <Image source={{ uri: user.profilePhotoUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.fullName}>{user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Buyer')}</Text>
            <Text style={styles.emailText}>{user?.email || 'buyer@wimakit.com'}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <Ionicons name="checkmark-circle" size={12} color={COLORS.accent} />
                <Text style={styles.roleText}>Verified Buyer</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Details Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PERSONAL INFORMATION</Text>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location / District</Text>
              <Text style={styles.infoValue}>{user?.location || 'Sierra Leone'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SUPPORT & HELP</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert('WiMakit Support Hotline', 'Call +232 73 834 941 for buyer assistance.')
            }
          >
            <Ionicons name="headset-outline" size={20} color={COLORS.primary} />
            <Text style={styles.menuItemText}>Customer Support</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                'WiMakit Marketplace',
                'Connecting buyers directly with verified Sierra Leonean farmers.'
              )
            }
          >
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.menuItemText}>About WiMakit</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={openReportsModal}
          >
            <Ionicons name="flag-outline" size={20} color={COLORS.error} />
            <Text style={styles.menuItemText}>My Fraud Reports</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutBtn}
          activeOpacity={0.8}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal visible={editModalOpen} animationType="slide" transparent onRequestClose={() => setEditModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} allowFontScaling={false}>
                Edit Buyer Profile
              </Text>
              <TouchableOpacity onPress={() => setEditModalOpen(false)} hitSlop={6}>
                <Ionicons name="close" size={20} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {errorMsg ? (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorAlertText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Photo Picker */}
            <View style={styles.photoPickerRow}>
              <TouchableOpacity
                style={styles.photoPickerTouchable}
                activeOpacity={0.85}
                onPress={handlePickPhoto}
                disabled={uploadingPhoto}
              >
                {displayedPhotoUri ? (
                  <Image source={{ uri: displayedPhotoUri }} style={styles.photoPickerImage} />
                ) : (
                  <View style={styles.photoPickerPlaceholder}>
                    <Text style={styles.photoPickerInitials}>{getInitials()}</Text>
                  </View>
                )}

                {uploadingPhoto ? (
                  <View style={styles.photoUploadOverlay}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  </View>
                ) : (
                  <View style={styles.photoEditBadge}>
                    <Ionicons name="camera" size={14} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.photoPickerTextCol}>
                <Text style={styles.photoPickerTitle} allowFontScaling={false}>
                  Profile Photo
                </Text>
                <TouchableOpacity onPress={handlePickPhoto} disabled={uploadingPhoto} hitSlop={4}>
                  <Text style={styles.photoPickerLink} allowFontScaling={false}>
                    {uploadingPhoto ? 'Uploading...' : 'Tap to change photo'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <PillTextInput
              label="First Name"
              placeholder="First name"
              leadingIcon="person-outline"
              value={firstName}
              onChangeText={setFirstName}
            />

            <PillTextInput
              label="Last Name"
              placeholder="Last name"
              leadingIcon="person-outline"
              value={lastName}
              onChangeText={setLastName}
            />

            <PillTextInput
              label="Phone Number"
              placeholder="+232 76 123 456"
              leadingIcon="call-outline"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <PillTextInput
              label="District / Location"
              placeholder="e.g. Freetown, Waterloo"
              leadingIcon="location-outline"
              value={location}
              onChangeText={setLocation}
            />

            <PrimaryButton
              label="Save Changes"
              variant="primary"
              showArrow={false}
              loading={saving}
              onPress={handleSaveProfile}
              style={styles.saveBtn}
            />
          </View>
        </View>
      </Modal>

      {/* Fraud Reports History Modal */}
      <Modal
        visible={reportsModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setReportsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportsModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="flag-outline" size={18} color={COLORS.error} />
                <Text style={styles.modalTitle} allowFontScaling={false}>
                  My Fraud Reports
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReportsModalOpen(false)} hitSlop={6}>
                <Ionicons name="close" size={20} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {loadingReports ? (
              <View style={styles.reportsCenterBox}>
                <ActivityIndicator color={COLORS.primary} size="large" />
              </View>
            ) : reportsError ? (
              <View style={styles.reportsCenterBox}>
                <Ionicons name="cloud-offline-outline" size={36} color={COLORS.placeholderText} />
                <Text style={styles.reportsEmptyText}>{reportsError}</Text>
              </View>
            ) : fraudReports.length === 0 ? (
              <View style={styles.reportsCenterBox}>
                <Ionicons name="shield-checkmark-outline" size={36} color={COLORS.accent} />
                <Text style={styles.reportsEmptyText}>
                  You haven't filed any fraud reports. You can report an issue from any order in
                  the Orders tab.
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.reportsList}>
                {fraudReports.map((fc) => {
                  const statusStyle = getReportStatusColor(fc.status);
                  return (
                    <View key={fc.id} style={styles.reportCard}>
                      <View style={styles.reportCardHeader}>
                        <Text style={styles.reportCaseNumber}>{fc.caseNumber}</Text>
                        <View style={[styles.reportStatusBadge, { backgroundColor: statusStyle.bg }]}>
                          <Text style={[styles.reportStatusText, { color: statusStyle.text }]}>
                            {fc.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.reportOrderLine}>
                        {fc.produceName} · {fc.orderNumber || 'N/A'}
                      </Text>
                      <Text style={styles.reportReasonText} numberOfLines={3}>
                        {fc.reason}
                      </Text>
                      <Text style={styles.reportDateText}>
                        Filed {new Date(fc.reportedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  editBtn: {
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
  editBtnText: {
    fontSize: 12.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.primary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    shadowColor: '#2E4E92',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#F0F4FC',
  },
  avatarText: {
    fontSize: 22,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: 17,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  emailText: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF3E4',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  roleText: {
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.accent,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 11.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: '#1A1A1A',
    marginTop: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    gap: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDE8E8',
    borderColor: '#F8B4B4',
    borderWidth: 1,
    borderRadius: RADIUS.pill,
    height: 52,
    gap: 8,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 14.5,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    color: COLORS.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  editModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  photoPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  photoPickerTouchable: {
    width: 68,
    height: 68,
    borderRadius: 34,
    position: 'relative',
  },
  photoPickerImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F0F4FC',
  },
  photoPickerPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPickerInitials: {
    fontSize: 22,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  photoUploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  photoPickerTextCol: {
    flex: 1,
  },
  photoPickerTitle: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  photoPickerLink: {
    fontSize: 12.5,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: COLORS.primary,
  },
  saveBtn: {
    marginTop: 12,
  },
  reportsModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: '80%',
  },
  reportsList: {
    marginTop: 4,
  },
  reportsCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    gap: 10,
  },
  reportsEmptyText: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  reportCard: {
    backgroundColor: '#F9FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportCaseNumber: {
    fontSize: 13.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  reportStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  reportStatusText: {
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
  },
  reportOrderLine: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  reportReasonText: {
    fontSize: 12.5,
    fontFamily: FONTS.bodyRegular,
    color: '#1A1A1A',
    lineHeight: 18,
    marginBottom: 6,
  },
  reportDateText: {
    fontSize: 11,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.placeholderText,
  },
});
