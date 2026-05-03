import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  User as UserIcon, 
  Camera, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin,
  Save,
  LogOut,
  Award,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Upload
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, ROUNDING } from '../../theme';

const ProfileScreen = ({ navigation }) => {
  const { userData, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    department: userData?.department || '',
    district: userData?.district || '',
    profilePicture: userData?.profilePicture || null,
    // Technician specific
    specialization: userData?.specialization || '',
    experienceYears: userData?.experienceYears?.toString() || '',
    qualifications: userData?.qualifications || []
  });

  const handleUpdateProfile = async () => {
    if (!profileData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setUpdating(true);
    try {
      await API.put(`/users/${userData.id}`, profileData);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    setLoading(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('file', { uri, name: filename, type });

      const response = await API.post(`/users/${userData.id}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfileData({ ...profileData, profilePicture: response.data.url });
      Alert.alert('Success', 'Profile picture updated');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQualification = () => {
    const newQual = {
      id: Date.now().toString(),
      title: '',
      institution: '',
      year: '',
      certificateUrl: ''
    };
    setProfileData({
      ...profileData,
      qualifications: [...profileData.qualifications, newQual]
    });
  };

  const handleRemoveQualification = (id) => {
    setProfileData({
      ...profileData,
      qualifications: profileData.qualifications.filter(q => q.id !== id)
    });
  };

  const handleUpdateQualification = (id, field, value) => {
    setProfileData({
      ...profileData,
      qualifications: profileData.qualifications.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    });
  };

  const uploadCertificate = async (qualId) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setLoading(true);
      try {
        const formData = new FormData();
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('file', { uri, name: filename, type });

        const response = await API.post(`/users/${userData.id}/profile-picture`, formData, { // Reusing same endpoint
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        handleUpdateQualification(qualId, 'certificateUrl', response.data.url);
        Alert.alert('Success', 'Certificate uploaded');
      } catch (error) {
        Alert.alert('Error', 'Failed to upload certificate');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={loading}>
              {profileData.profilePicture ? (
                <Image source={{ uri: profileData.profilePicture }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <UserIcon size={50} color={COLORS.primary} />
                </View>
              )}
              {loading ? (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color={COLORS.white} />
                </View>
              ) : (
                <View style={styles.cameraIcon}>
                  <Camera size={16} color={COLORS.white} />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.roleText}>{userData?.role}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <UserIcon size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profileData.name}
                  onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                  placeholder="Enter your name"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address (Cannot be changed)</Text>
              <View style={[styles.inputWrapper, styles.disabledInput]}>
                <Mail size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userData?.email}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Phone size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profileData.phone}
                  onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Department / Company</Text>
              <View style={styles.inputWrapper}>
                <Briefcase size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profileData.department}
                  onChangeText={(text) => setProfileData({ ...profileData, department: text })}
                  placeholder="Enter department"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>District / Location</Text>
              <View style={styles.inputWrapper}>
                <MapPin size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profileData.district}
                  onChangeText={(text) => setProfileData({ ...profileData, district: text })}
                  placeholder="Enter district"
                />
              </View>
            </View>

            {userData?.role === 'TECHNICIAN' && (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Technician Information</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Specialization</Text>
                  <View style={styles.inputWrapper}>
                    <Award size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={profileData.specialization}
                      onChangeText={(text) => setProfileData({ ...profileData, specialization: text })}
                      placeholder="e.g. Network Engineering, Hardware"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Years of Experience</Text>
                  <View style={styles.inputWrapper}>
                    <Briefcase size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={profileData.experienceYears}
                      onChangeText={(text) => setProfileData({ ...profileData, experienceYears: text })}
                      placeholder="e.g. 5"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={[styles.sectionHeader, { marginTop: SPACING.md }]}>
                  <Text style={styles.sectionTitle}>Qualifications & Certificates</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={handleAddQualification}>
                    <Plus size={16} color={COLORS.white} />
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {profileData.qualifications.map((qual) => (
                  <View key={qual.id} style={styles.qualCard}>
                    <View style={styles.qualHeader}>
                      <Text style={styles.qualNumber}>Qualification</Text>
                      <TouchableOpacity onPress={() => handleRemoveQualification(qual.id)}>
                        <Trash2 size={18} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      style={styles.qualInput}
                      value={qual.title}
                      onChangeText={(text) => handleUpdateQualification(qual.id, 'title', text)}
                      placeholder="Title (e.g. BSc in IT)"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                    <TextInput
                      style={styles.qualInput}
                      value={qual.institution}
                      onChangeText={(text) => handleUpdateQualification(qual.id, 'institution', text)}
                      placeholder="Institution"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                    <TextInput
                      style={styles.qualInput}
                      value={qual.year}
                      onChangeText={(text) => handleUpdateQualification(qual.id, 'year', text)}
                      placeholder="Year"
                      placeholderTextColor={COLORS.textSecondary}
                      keyboardType="numeric"
                    />

                    <TouchableOpacity 
                      style={[styles.certBtn, qual.certificateUrl && styles.certBtnSuccess]} 
                      onPress={() => uploadCertificate(qual.id)}
                    >
                      {qual.certificateUrl ? (
                        <>
                          <CheckCircle size={16} color={COLORS.success} />
                          <Text style={styles.certBtnTextSuccess}>Certificate Uploaded</Text>
                        </>
                      ) : (
                        <>
                          <Upload size={16} color={COLORS.primary} />
                          <Text style={styles.certBtnText}>Upload Certificate Image</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            <TouchableOpacity 
              style={[styles.saveBtn, updating && styles.saveBtnDisabled]} 
              onPress={handleUpdateProfile}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Save size={20} color={COLORS.white} />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  backBtn: {
    padding: 8,
  },
  logoutBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: COLORS.white,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleText: {
    marginTop: SPACING.sm,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  form: {
    gap: SPACING.md,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 55,
  },
  disabledInput: {
    backgroundColor: COLORS.background,
    opacity: 0.7,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    borderRadius: ROUNDING.xl,
    gap: 10,
    marginTop: SPACING.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: ROUNDING.md,
    gap: 4,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  qualCard: {
    backgroundColor: COLORS.card,
    borderRadius: ROUNDING.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    gap: 10,
  },
  qualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  qualNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  qualInput: {
    backgroundColor: COLORS.background,
    borderRadius: ROUNDING.md,
    paddingHorizontal: SPACING.sm,
    height: 45,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
  },
  certBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    borderRadius: ROUNDING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 4,
  },
  certBtnSuccess: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success,
    borderStyle: 'solid',
  },
  certBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  certBtnTextSuccess: {
    color: COLORS.success,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ProfileScreen;
