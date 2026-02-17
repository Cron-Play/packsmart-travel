
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Modal,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, spacing, borderRadius, typography, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { WeatherType, TripType, TravelType, PackingStyle, PackingItem, TripTemplate } from '@/types/packing';
import { generatePackingList, groupItemsByCategory, getCategoryDisplayName } from '@/utils/packingGenerator';
import { saveTemplates, loadTemplates, deleteTemplate } from '@/utils/storage';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;

  // Trip parameters
  const [days, setDays] = useState('7');
  const [weather, setWeather] = useState<WeatherType>('warm');
  const [tripType, setTripType] = useState<TripType>('city');
  const [travelType, setTravelType] = useState<TravelType>('local');
  const [packingStyle, setPackingStyle] = useState<PackingStyle>('normal');
  const [city, setCity] = useState('');
  
  // Date parameters
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Packing list state
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Custom item state
  const [showAddCustomItem, setShowAddCustomItem] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState('misc');

  // Templates state
  const [templates, setTemplates] = useState<TripTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Load templates on mount
  useEffect(() => {
    loadSavedTemplates();
  }, []);

  // Auto-calculate days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDays(diffDays.toString());
      console.log('Auto-calculated days from dates:', diffDays);
    }
  }, [startDate, endDate]);

  const loadSavedTemplates = async () => {
    const savedTemplates = await loadTemplates();
    setTemplates(savedTemplates);
    console.log('Loaded templates on mount');
  };

  const handleGenerateList = () => {
    console.log('Generating packing list with params:', { days, weather, tripType, travelType, packingStyle, city, startDate, endDate });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const daysNum = parseInt(days) || 7;
    const items = generatePackingList({ 
      days: daysNum, 
      weather, 
      tripType, 
      travelType, 
      packingStyle,
      city: tripType === 'city' ? city : undefined,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    });
    setPackingItems(items);
    setCollapsedCategories(new Set());
    console.log('Generated items count:', items.length);
  };

  const toggleItemChecked = (itemId: string) => {
    console.log('Toggling item:', itemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPackingItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const toggleCategory = (category: string) => {
    console.log('Toggling category:', category);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleAddCustomItem = () => {
    if (!customItemName.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    if (packingItems.length === 0) {
      Alert.alert('Error', 'Generate a packing list first');
      return;
    }

    console.log('Adding custom item:', customItemName, 'to category:', customItemCategory);
    const newItem: PackingItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: customItemName,
      category: customItemCategory,
      checked: false,
      isCustom: true,
    };

    setPackingItems(prev => [...prev, newItem]);
    setCustomItemName('');
    setShowAddCustomItem(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteCustomItem = (itemId: string) => {
    console.log('Deleting custom item:', itemId);
    setPackingItems(prev => prev.filter(item => item.id !== itemId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return;
    }

    if (packingItems.length === 0) {
      Alert.alert('Error', 'Generate a packing list first');
      return;
    }

    console.log('Saving template:', templateName);
    const newTemplate: TripTemplate = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: templateName,
      days: parseInt(days) || 7,
      weather,
      tripType,
      travelType,
      packingStyle,
      city: tripType === 'city' ? city : undefined,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      items: packingItems,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...templates, newTemplate];
    await saveTemplates(updatedTemplates);
    setTemplates(updatedTemplates);
    setShowSaveModal(false);
    setTemplateName('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Success', 'Template saved successfully!');
  };

  const handleLoadTemplate = (template: TripTemplate) => {
    console.log('Loading template:', template.name);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDays(template.days.toString());
    setWeather(template.weather);
    setTripType(template.tripType);
    setTravelType(template.travelType);
    setPackingStyle(template.packingStyle);
    setCity(template.city || '');
    setStartDate(template.startDate ? new Date(template.startDate) : undefined);
    setEndDate(template.endDate ? new Date(template.endDate) : undefined);
    setPackingItems(template.items);
    setShowTemplates(false);
    setCollapsedCategories(new Set());
  };

  const handleDeleteTemplate = async (templateId: string) => {
    console.log('Deleting template:', templateId);
    await deleteTemplate(templateId);
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      console.log('Start date selected:', selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      console.log('End date selected:', selectedDate);
    }
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Select date';
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const startDateText = formatDate(startDate);
  const endDateText = formatDate(endDate);

  const groupedItems = groupItemsByCategory(packingItems);
  const categories = Object.keys(groupedItems);

  const checkedCount = packingItems.filter(item => item.checked).length;
  const totalCount = packingItems.length;
  const progressText = totalCount > 0 ? `${checkedCount}/${totalCount}` : '';

  const weatherOptions: { value: WeatherType; label: string; icon: string }[] = [
    { value: 'hot', label: 'Hot', icon: 'sun.max.fill' },
    { value: 'warm', label: 'Warm', icon: 'sun.min.fill' },
    { value: 'cool', label: 'Cool', icon: 'cloud.fill' },
    { value: 'cold', label: 'Cold', icon: 'snowflake' },
    { value: 'rainy', label: 'Rainy', icon: 'cloud.rain.fill' },
  ];

  const tripTypeOptions: { value: TripType; label: string; icon: string }[] = [
    { value: 'business', label: 'Business', icon: 'briefcase.fill' },
    { value: 'beach', label: 'Beach', icon: 'beach.umbrella.fill' },
    { value: 'hiking', label: 'Hiking', icon: 'figure.hiking' },
    { value: 'city', label: 'City', icon: 'building.2.fill' },
    { value: 'winter', label: 'Winter', icon: 'snowflake' },
  ];

  const travelTypeOptions: { value: TravelType; label: string; icon: string }[] = [
    { value: 'local', label: 'Local', icon: 'house.fill' },
    { value: 'international', label: 'International', icon: 'airplane' },
  ];

  const packingStyleOptions: { value: PackingStyle; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: 'bag.fill' },
    { value: 'normal', label: 'Normal', icon: 'suitcase.fill' },
    { value: 'heavy', label: 'Heavy', icon: 'suitcase.cart.fill' },
  ];

  const categoryOptions = [
    { value: 'clothing', label: 'Clothing' },
    { value: 'toiletries', label: 'Toiletries' },
    { value: 'tech', label: 'Tech & Electronics' },
    { value: 'travelDocs', label: 'Travel Documents' },
    { value: 'misc', label: 'Miscellaneous' },
  ];

  const showCityInput = tripType === 'city';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.backgroundGradientStart, theme.backgroundGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'PackSmart',
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: colorScheme === 'dark' ? 'dark' : 'light',
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowTemplates(true)}
              style={styles.headerButton}
            >
              <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.headerButtonBlur}>
                <IconSymbol
                  ios_icon_name="folder.fill"
                  android_material_icon_name="folder"
                  size={20}
                  color={theme.primary}
                />
              </BlurView>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Input Section - Glass Card */}
        <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={[styles.glassCard, shadows.glass]}>
          <View style={[styles.cardContent, { borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Trip Details</Text>

            {/* Travel Dates */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Travel Dates</Text>
              <View style={styles.dateRow}>
                <TouchableOpacity
                  style={[styles.dateButton, { borderColor: theme.border }]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <BlurView intensity={60} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.dateButtonBlur}>
                    <IconSymbol
                      ios_icon_name="calendar"
                      android_material_icon_name="calendar-today"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.dateButtonText, { color: startDate ? theme.text : theme.textSecondary }]}>
                      {startDateText}
                    </Text>
                  </BlurView>
                </TouchableOpacity>
                <Text style={[styles.dateArrow, { color: theme.textSecondary }]}>→</Text>
                <TouchableOpacity
                  style={[styles.dateButton, { borderColor: theme.border }]}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <BlurView intensity={60} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.dateButtonBlur}>
                    <IconSymbol
                      ios_icon_name="calendar"
                      android_material_icon_name="calendar-today"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.dateButtonText, { color: endDate ? theme.text : theme.textSecondary }]}>
                      {endDateText}
                    </Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            </View>

            {/* Days Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Number of Days</Text>
              <BlurView intensity={60} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={[styles.inputBlur, { borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={days}
                  onChangeText={setDays}
                  keyboardType="number-pad"
                  placeholder="7"
                  placeholderTextColor={theme.textSecondary}
                />
              </BlurView>
            </View>

            {/* Travel Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Travel Type</Text>
              <View style={styles.optionsGrid}>
                {travelTypeOptions.map(option => {
                  const isSelected = travelType === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.optionButton, { borderColor: theme.border }]}
                      onPress={() => setTravelType(option.value)}
                    >
                      <BlurView 
                        intensity={isSelected ? 100 : 60} 
                        tint={colorScheme === 'dark' ? 'dark' : 'light'} 
                        style={[
                          styles.optionButtonBlur,
                          isSelected && { backgroundColor: theme.primaryGlass }
                        ]}
                      >
                        <IconSymbol
                          ios_icon_name={option.icon}
                          android_material_icon_name={option.icon}
                          size={18}
                          color={isSelected ? theme.primary : theme.text}
                        />
                        <Text style={[styles.optionText, { color: isSelected ? theme.primary : theme.text }]}>
                          {option.label}
                        </Text>
                      </BlurView>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Weather Selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Weather</Text>
              <View style={styles.optionsGrid}>
                {weatherOptions.map(option => {
                  const isSelected = weather === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.optionButton, { borderColor: theme.border }]}
                      onPress={() => setWeather(option.value)}
                    >
                      <BlurView 
                        intensity={isSelected ? 100 : 60} 
                        tint={colorScheme === 'dark' ? 'dark' : 'light'} 
                        style={[
                          styles.optionButtonBlur,
                          isSelected && { backgroundColor: theme.primaryGlass }
                        ]}
                      >
                        <IconSymbol
                          ios_icon_name={option.icon}
                          android_material_icon_name={option.icon}
                          size={18}
                          color={isSelected ? theme.primary : theme.text}
                        />
                        <Text style={[styles.optionText, { color: isSelected ? theme.primary : theme.text }]}>
                          {option.label}
                        </Text>
                      </BlurView>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Trip Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Trip Type</Text>
              <View style={styles.optionsGrid}>
                {tripTypeOptions.map(option => {
                  const isSelected = tripType === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.optionButton, { borderColor: theme.border }]}
                      onPress={() => setTripType(option.value)}
                    >
                      <BlurView 
                        intensity={isSelected ? 100 : 60} 
                        tint={colorScheme === 'dark' ? 'dark' : 'light'} 
                        style={[
                          styles.optionButtonBlur,
                          isSelected && { backgroundColor: theme.primaryGlass }
                        ]}
                      >
                        <IconSymbol
                          ios_icon_name={option.icon}
                          android_material_icon_name={option.icon}
                          size={18}
                          color={isSelected ? theme.primary : theme.text}
                        />
                        <Text style={[styles.optionText, { color: isSelected ? theme.primary : theme.text }]}>
                          {option.label}
                        </Text>
                      </BlurView>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* City Input (only for city trips) */}
            {showCityInput && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>City</Text>
                <BlurView intensity={60} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={[styles.inputBlur, { borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={city}
                    onChangeText={setCity}
                    placeholder="e.g., Paris, Tokyo"
                    placeholderTextColor={theme.textSecondary}
                  />
                </BlurView>
              </View>
            )}

            {/* Packing Style Selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Packing Style</Text>
              <View style={styles.optionsGrid}>
                {packingStyleOptions.map(option => {
                  const isSelected = packingStyle === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.optionButton, { borderColor: theme.border }]}
                      onPress={() => setPackingStyle(option.value)}
                    >
                      <BlurView 
                        intensity={isSelected ? 100 : 60} 
                        tint={colorScheme === 'dark' ? 'dark' : 'light'} 
                        style={[
                          styles.optionButtonBlur,
                          isSelected && { backgroundColor: theme.primaryGlass }
                        ]}
                      >
                        <IconSymbol
                          ios_icon_name={option.icon}
                          android_material_icon_name={option.icon}
                          size={18}
                          color={isSelected ? theme.primary : theme.text}
                        />
                        <Text style={[styles.optionText, { color: isSelected ? theme.primary : theme.text }]}>
                          {option.label}
                        </Text>
                      </BlurView>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateList}
            >
              <LinearGradient
                colors={[theme.primary, theme.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateButtonGradient}
              >
                <IconSymbol
                  ios_icon_name="sparkles"
                  android_material_icon_name="auto-awesome"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.generateButtonText}>Generate List</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Packing List */}
        {packingItems.length > 0 && (
          <React.Fragment>
            {/* Progress Header */}
            <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={[styles.glassCard, shadows.glass]}>
              <View style={[styles.cardContent, { borderColor: theme.border }]}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressTitle, { color: theme.text }]}>Your List</Text>
                  <Text style={[styles.progressCount, { color: theme.primary }]}>{progressText}</Text>
                </View>
                <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
                  <LinearGradient
                    colors={[theme.primary, theme.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${(checkedCount / totalCount) * 100}%` }]}
                  />
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowAddCustomItem(true)}
                  >
                    <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={[styles.actionButtonBlur, { backgroundColor: theme.secondaryGlass }]}>
                      <IconSymbol
                        ios_icon_name="plus"
                        android_material_icon_name="add"
                        size={16}
                        color={theme.secondary}
                      />
                      <Text style={[styles.actionButtonText, { color: theme.secondary }]}>Add Item</Text>
                    </BlurView>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowSaveModal(true)}
                  >
                    <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={[styles.actionButtonBlur, { backgroundColor: theme.accentGlass }]}>
                      <IconSymbol
                        ios_icon_name="bookmark.fill"
                        android_material_icon_name="bookmark"
                        size={16}
                        color={theme.accent}
                      />
                      <Text style={[styles.actionButtonText, { color: theme.accent }]}>Save</Text>
                    </BlurView>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>

            {/* Categories */}
            {categories.map(category => {
              const categoryItems = groupedItems[category];
              const isCollapsed = collapsedCategories.has(category);
              const categoryCheckedCount = categoryItems.filter(item => item.checked).length;
              const categoryTotalCount = categoryItems.length;
              const categoryProgressText = `${categoryCheckedCount}/${categoryTotalCount}`;

              return (
                <BlurView key={category} intensity={70} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={[styles.categoryCard, shadows.sm]}>
                  <View style={[styles.categoryCardContent, { borderColor: theme.border }]}>
                    <TouchableOpacity
                      style={styles.categoryHeader}
                      onPress={() => toggleCategory(category)}
                    >
                      <View style={styles.categoryTitleRow}>
                        <IconSymbol
                          ios_icon_name={isCollapsed ? 'chevron.right' : 'chevron.down'}
                          android_material_icon_name={isCollapsed ? 'chevron-right' : 'expand-more'}
                          size={18}
                          color={theme.textSecondary}
                        />
                        <Text style={[styles.categoryTitle, { color: theme.text }]}>
                          {getCategoryDisplayName(category)}
                        </Text>
                      </View>
                      <Text style={[styles.categoryCount, { color: theme.textSecondary }]}>
                        {categoryProgressText}
                      </Text>
                    </TouchableOpacity>

                    {!isCollapsed && (
                      <View style={styles.itemsList}>
                        {categoryItems.map(item => (
                          <View
                            key={item.id}
                            style={[styles.itemRow, { borderBottomColor: theme.border }]}
                          >
                            <TouchableOpacity
                              style={styles.itemContent}
                              onPress={() => toggleItemChecked(item.id)}
                            >
                              <View
                                style={[
                                  styles.checkbox,
                                  { borderColor: theme.border },
                                  item.checked && { 
                                    backgroundColor: theme.primaryGlass, 
                                    borderColor: theme.primary,
                                    borderWidth: 2,
                                  },
                                ]}
                              >
                                {item.checked && (
                                  <IconSymbol
                                    ios_icon_name="checkmark"
                                    android_material_icon_name="check"
                                    size={14}
                                    color={theme.primary}
                                  />
                                )}
                              </View>
                              <Text
                                style={[
                                  styles.itemText,
                                  { color: theme.text },
                                  item.checked && { opacity: 0.5, textDecorationLine: 'line-through' },
                                ]}
                              >
                                {item.name}
                              </Text>
                              {item.isCustom && (
                                <View style={[styles.customBadge, { backgroundColor: theme.accentGlass }]}>
                                  <Text style={[styles.customBadgeText, { color: theme.accent }]}>Custom</Text>
                                </View>
                              )}
                            </TouchableOpacity>
                            {item.isCustom && (
                              <TouchableOpacity
                                style={styles.deleteItemButton}
                                onPress={() => handleDeleteCustomItem(item.id)}
                              >
                                <IconSymbol
                                  ios_icon_name="trash"
                                  android_material_icon_name="delete"
                                  size={16}
                                  color={theme.error}
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </BlurView>
              );
            })}
          </React.Fragment>
        )}

        {/* Empty State */}
        {packingItems.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="suitcase.fill"
              android_material_icon_name="luggage"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Ready to Pack?</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Enter your trip details and generate your personalized packing list
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={onStartDateChange}
          minimumDate={new Date()}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || startDate || new Date()}
          mode="date"
          display="default"
          onChange={onEndDateChange}
          minimumDate={startDate || new Date()}
        />
      )}

      {/* Add Custom Item Modal */}
      <Modal
        visible={showAddCustomItem}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAddCustomItem(false)}
      >
        <BlurView intensity={90} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.modalOverlay}>
          <BlurView intensity={100} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={[styles.modalContent, shadows.lg]}>
            <View style={[styles.modalInner, { borderColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add Custom Item</Text>
              <BlurView intensity={60} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={[styles.inputBlur, { borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={customItemName}
                  onChangeText={setCustomItemName}
                  placeholder="Item name"
                  placeholderTextColor={theme.textSecondary}
                  autoFocus
                />
              </BlurView>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Category</Text>
              <View style={styles.categoryOptionsGrid}>
                {categoryOptions.map(option => {
                  const isSelected = customItemCategory === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.categoryOptionButton, { borderColor: theme.border }]}
                      onPress={() => setCustomItemCategory(option.value)}
                    >
                      <BlurView 
                        intensity={isSelected ? 100 : 60} 
                        tint={colorScheme === 'dark' ? 'dark' : 'light'} 
                        style={[
                          styles.categoryOptionBlur,
                          isSelected && { backgroundColor: theme.primaryGlass }
                        ]}
                      >
                        <Text style={[styles.categoryOptionText, { color: isSelected ? theme.primary : theme.text }]}>
                          {option.label}
                        </Text>
                      </BlurView>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setShowAddCustomItem(false);
                    setCustomItemName('');
                    setCustomItemCategory('misc');
                  }}
                >
                  <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.modalButtonBlur}>
                    <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
                  </BlurView>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleAddCustomItem}
                >
                  <LinearGradient
                    colors={[theme.primary, theme.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Add</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </BlurView>
      </Modal>

      {/* Templates Modal */}
      <Modal
        visible={showTemplates}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTemplates(false)}
      >
        <LinearGradient
          colors={[theme.backgroundGradientStart, theme.backgroundGradientEnd]}
          style={styles.fullModalContainer}
        >
          <BlurView intensity={90} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={[styles.fullModalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.fullModalTitle, { color: theme.text }]}>Templates</Text>
            <TouchableOpacity onPress={() => setShowTemplates(false)}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
          </BlurView>

          <ScrollView style={styles.fullModalContent}>
            {templates.length === 0 ? (
              <View style={styles.emptyTemplates}>
                <IconSymbol
                  ios_icon_name="folder"
                  android_material_icon_name="folder-open"
                  size={64}
                  color={theme.textSecondary}
                />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Templates</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Save your packing lists as templates for quick access
                </Text>
              </View>
            ) : (
              templates.map(template => {
                const templateTotalCount = template.items.length;
                const templateProgressText = `${templateTotalCount} items`;
                const travelTypeLabel = template.travelType === 'international' ? 'International' : 'Local';
                const packingStyleLabel = template.packingStyle.charAt(0).toUpperCase() + template.packingStyle.slice(1);

                return (
                  <BlurView key={template.id} intensity={70} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={[styles.templateCard, shadows.sm]}>
                    <View style={[styles.templateCardContent, { borderColor: theme.border }]}>
                      <TouchableOpacity
                        style={styles.templateContent}
                        onPress={() => handleLoadTemplate(template)}
                      >
                        <Text style={[styles.templateName, { color: theme.text }]}>{template.name}</Text>
                        <View style={styles.templateInfo}>
                          <Text style={[styles.templateDetails, { color: theme.textSecondary }]}>
                            {template.days}
                          </Text>
                          <Text style={[styles.templateDetails, { color: theme.textSecondary }]}>
                            {' '}days • 
                          </Text>
                          <Text style={[styles.templateDetails, { color: theme.textSecondary }]}>
                            {travelTypeLabel}
                          </Text>
                          <Text style={[styles.templateDetails, { color: theme.textSecondary }]}>
                            {' '}• 
                          </Text>
                          <Text style={[styles.templateDetails, { color: theme.textSecondary }]}>
                            {packingStyleLabel}
                          </Text>
                          {template.city && (
                            <React.Fragment>
                              <Text style={[styles.templateDetails, { color: theme.textSecondary }]}>
                                {' '}• 
                              </Text>
                              <Text style={[styles.templateDetails, { color: theme.textSecondary }]}>
                                {template.city}
                              </Text>
                            </React.Fragment>
                          )}
                        </View>
                        <Text style={[styles.templateCount, { color: theme.primary }]}>{templateProgressText}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTemplate(template.id)}
                      >
                        <IconSymbol
                          ios_icon_name="trash"
                          android_material_icon_name="delete"
                          size={18}
                          color={theme.error}
                        />
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                );
              })
            )}
          </ScrollView>
        </LinearGradient>
      </Modal>

      {/* Save Template Modal */}
      <Modal
        visible={showSaveModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSaveModal(false)}
      >
        <BlurView intensity={90} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.modalOverlay}>
          <BlurView intensity={100} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={[styles.modalContent, shadows.lg]}>
            <View style={[styles.modalInner, { borderColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Save Template</Text>
              <BlurView intensity={60} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={[styles.inputBlur, { borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={templateName}
                  onChangeText={setTemplateName}
                  placeholder="Template name"
                  placeholderTextColor={theme.textSecondary}
                  autoFocus
                />
              </BlurView>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setShowSaveModal(false);
                    setTemplateName('');
                  }}
                >
                  <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.modalButtonBlur}>
                    <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
                  </BlurView>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleSaveTemplate}
                >
                  <LinearGradient
                    colors={[theme.primary, theme.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 120,
    paddingBottom: 120,
  },
  headerButton: {
    marginRight: spacing.sm,
  },
  headerButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glassCard: {
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  cardContent: {
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: borderRadius.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    marginBottom: spacing.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputBlur: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  input: {
    padding: spacing.md,
    ...typography.body,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  dateButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
  },
  dateButtonText: {
    ...typography.bodySmall,
    flex: 1,
  },
  dateArrow: {
    ...typography.body,
    fontWeight: '600',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  optionButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  generateButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  generateButtonText: {
    color: '#FFFFFF',
    ...typography.body,
    fontWeight: '700',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.h3,
  },
  progressCount: {
    ...typography.body,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  actionButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  actionButtonText: {
    ...typography.bodySmall,
    fontWeight: '700',
  },
  categoryCard: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  categoryCardContent: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  categoryCount: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  itemsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    ...typography.body,
    flex: 1,
  },
  customBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteItemButton: {
    padding: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  modalInner: {
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: borderRadius.xl,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  modalLabel: {
    ...typography.bodySmall,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  categoryOptionButton: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    borderWidth: 1,
  },
  categoryOptionBlur: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryOptionText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  modalButtonBlur: {
    padding: spacing.md,
    alignItems: 'center',
  },
  modalButtonGradient: {
    padding: spacing.md,
    alignItems: 'center',
  },
  modalButtonText: {
    ...typography.body,
    fontWeight: '700',
  },
  fullModalContainer: {
    flex: 1,
  },
  fullModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  fullModalTitle: {
    ...typography.h3,
  },
  fullModalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  emptyTemplates: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  templateCard: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  templateCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
  },
  templateContent: {
    flex: 1,
    padding: spacing.md,
  },
  templateName: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  templateInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  templateDetails: {
    ...typography.bodySmall,
  },
  templateCount: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  deleteButton: {
    padding: spacing.md,
  },
});
