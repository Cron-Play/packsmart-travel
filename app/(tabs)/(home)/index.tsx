
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
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
    { value: 'hot', label: 'Hot', icon: 'wb-sunny' },
    { value: 'warm', label: 'Warm', icon: 'wb-sunny' },
    { value: 'cool', label: 'Cool', icon: 'wb-cloudy' },
    { value: 'cold', label: 'Cold', icon: 'ac-unit' },
    { value: 'rainy', label: 'Rainy', icon: 'umbrella' },
  ];

  const tripTypeOptions: { value: TripType; label: string; icon: string }[] = [
    { value: 'business', label: 'Business', icon: 'business-center' },
    { value: 'beach', label: 'Beach', icon: 'beach-access' },
    { value: 'hiking', label: 'Hiking', icon: 'terrain' },
    { value: 'city', label: 'City', icon: 'location-city' },
    { value: 'winter', label: 'Winter', icon: 'ac-unit' },
  ];

  const travelTypeOptions: { value: TravelType; label: string; icon: string }[] = [
    { value: 'local', label: 'Local', icon: 'home' },
    { value: 'international', label: 'International', icon: 'flight' },
  ];

  const packingStyleOptions: { value: PackingStyle; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: 'luggage' },
    { value: 'normal', label: 'Normal', icon: 'luggage' },
    { value: 'heavy', label: 'Heavy', icon: 'luggage' },
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'PackSmart',
          headerStyle: { backgroundColor: theme.card },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => setShowTemplates(true)}
                style={styles.headerButton}
              >
                <IconSymbol
                  ios_icon_name="folder.fill"
                  android_material_icon_name="folder"
                  size={24}
                  color={theme.primary}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Input Section */}
        <View style={[styles.card, { backgroundColor: theme.card }, shadows.md]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Trip Details</Text>

          {/* Travel Dates */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Travel Dates (Optional)</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={18}
                  color={theme.textSecondary}
                />
                <Text style={[styles.dateButtonText, { color: startDate ? theme.text : theme.textSecondary }]}>
                  {startDateText}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.dateArrow, { color: theme.textSecondary }]}>→</Text>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={18}
                  color={theme.textSecondary}
                />
                <Text style={[styles.dateButtonText, { color: endDate ? theme.text : theme.textSecondary }]}>
                  {endDateText}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.helperText, { color: theme.textSecondary }]}>
              Dates help predict weather and calculate trip duration
            </Text>
          </View>

          {/* Days Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Number of Days</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={days}
              onChangeText={setDays}
              keyboardType="number-pad"
              placeholder="7"
              placeholderTextColor={theme.textSecondary}
            />
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
                    style={[
                      styles.optionButton,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => setTravelType(option.value)}
                  >
                    <IconSymbol
                      ios_icon_name={option.icon}
                      android_material_icon_name={option.icon}
                      size={20}
                      color={isSelected ? '#FFFFFF' : theme.text}
                    />
                    <Text style={[styles.optionText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                      {option.label}
                    </Text>
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
                    style={[
                      styles.optionButton,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => setWeather(option.value)}
                  >
                    <IconSymbol
                      ios_icon_name={option.icon}
                      android_material_icon_name={option.icon}
                      size={20}
                      color={isSelected ? '#FFFFFF' : theme.text}
                    />
                    <Text style={[styles.optionText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                      {option.label}
                    </Text>
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
                    style={[
                      styles.optionButton,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => setTripType(option.value)}
                  >
                    <IconSymbol
                      ios_icon_name={option.icon}
                      android_material_icon_name={option.icon}
                      size={20}
                      color={isSelected ? '#FFFFFF' : theme.text}
                    />
                    <Text style={[styles.optionText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* City Input (only for city trips) */}
          {showCityInput && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                City (Optional)
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={city}
                onChangeText={setCity}
                placeholder="e.g., Paris, Tokyo, New York"
                placeholderTextColor={theme.textSecondary}
              />
              <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                Get city-specific packing recommendations
              </Text>
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
                    style={[
                      styles.optionButton,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => setPackingStyle(option.value)}
                  >
                    <IconSymbol
                      ios_icon_name={option.icon}
                      android_material_icon_name={option.icon}
                      size={20}
                      color={isSelected ? '#FFFFFF' : theme.text}
                    />
                    <Text style={[styles.optionText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.helperText, { color: theme.textSecondary }]}>
              Light: Minimal essentials • Normal: Balanced • Heavy: Extra comfort
            </Text>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: theme.primary }]}
            onPress={handleGenerateList}
          >
            <IconSymbol
              ios_icon_name="sparkles"
              android_material_icon_name="auto-awesome"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.generateButtonText}>Generate Packing List</Text>
          </TouchableOpacity>
        </View>

        {/* Packing List */}
        {packingItems.length > 0 && (
          <React.Fragment>
            {/* Progress Header */}
            <View style={[styles.progressCard, { backgroundColor: theme.card }, shadows.md]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressTitle, { color: theme.text }]}>Your Packing List</Text>
                <Text style={[styles.progressCount, { color: theme.primary }]}>{progressText}</Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: theme.primary, width: `${(checkedCount / totalCount) * 100}%` },
                  ]}
                />
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                  onPress={() => setShowAddCustomItem(true)}
                >
                  <IconSymbol
                    ios_icon_name="plus"
                    android_material_icon_name="add"
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.actionButtonText}>Add Custom Item</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                  onPress={() => setShowSaveModal(true)}
                >
                  <IconSymbol
                    ios_icon_name="bookmark.fill"
                    android_material_icon_name="bookmark"
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.actionButtonText}>Save Template</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Categories */}
            {categories.map(category => {
              const categoryItems = groupedItems[category];
              const isCollapsed = collapsedCategories.has(category);
              const categoryCheckedCount = categoryItems.filter(item => item.checked).length;
              const categoryTotalCount = categoryItems.length;
              const categoryProgressText = `${categoryCheckedCount}/${categoryTotalCount}`;

              return (
                <View key={category} style={[styles.categoryCard, { backgroundColor: theme.card }, shadows.sm]}>
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(category)}
                  >
                    <View style={styles.categoryTitleRow}>
                      <IconSymbol
                        ios_icon_name={isCollapsed ? 'chevron.right' : 'chevron.down'}
                        android_material_icon_name={isCollapsed ? 'chevron-right' : 'expand-more'}
                        size={20}
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
                                item.checked && { backgroundColor: theme.primary, borderColor: theme.primary },
                              ]}
                            >
                              {item.checked && (
                                <IconSymbol
                                  ios_icon_name="checkmark"
                                  android_material_icon_name="check"
                                  size={16}
                                  color="#FFFFFF"
                                />
                              )}
                            </View>
                            <Text
                              style={[
                                styles.itemText,
                                { color: theme.text },
                                item.checked && styles.itemTextChecked,
                              ]}
                            >
                              {item.name}
                            </Text>
                            {item.isCustom && (
                              <View style={[styles.customBadge, { backgroundColor: theme.primary }]}>
                                <Text style={styles.customBadgeText}>Custom</Text>
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
                                size={18}
                                color={theme.error}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
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
              Enter your trip details above and generate your personalized packing list
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
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }, shadows.lg]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Custom Item</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={customItemName}
              onChangeText={setCustomItemName}
              placeholder="Item name"
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Category</Text>
            <View style={styles.categoryOptionsGrid}>
              {categoryOptions.map(option => {
                const isSelected = customItemCategory === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.categoryOptionButton,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => setCustomItemCategory(option.value)}
                  >
                    <Text style={[styles.categoryOptionText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.background }]}
                onPress={() => {
                  setShowAddCustomItem(false);
                  setCustomItemName('');
                  setCustomItemCategory('misc');
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleAddCustomItem}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Templates Modal */}
      <Modal
        visible={showTemplates}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTemplates(false)}
      >
        <View style={[styles.fullModalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.fullModalHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <Text style={[styles.fullModalTitle, { color: theme.text }]}>Saved Templates</Text>
            <TouchableOpacity onPress={() => setShowTemplates(false)}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.fullModalContent}>
            {templates.length === 0 ? (
              <View style={styles.emptyTemplates}>
                <IconSymbol
                  ios_icon_name="folder"
                  android_material_icon_name="folder-open"
                  size={64}
                  color={theme.textSecondary}
                />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Templates Yet</Text>
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
                  <View key={template.id} style={[styles.templateCard, { backgroundColor: theme.card }, shadows.sm]}>
                    <TouchableOpacity
                      style={styles.templateContent}
                      onPress={() => handleLoadTemplate(template)}
                    >
                      <View style={styles.templateInfo}>
                        <Text style={[styles.templateName, { color: theme.text }]}>{template.name}</Text>
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
                        <Text style={[styles.templateCount, { color: theme.primary }]}>{templateProgressText}</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteTemplate(template.id)}
                    >
                      <IconSymbol
                        ios_icon_name="trash"
                        android_material_icon_name="delete"
                        size={20}
                        color={theme.error}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Save Template Modal */}
      <Modal
        visible={showSaveModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }, shadows.lg]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Save Template</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={templateName}
              onChangeText={setTemplateName}
              placeholder="Enter template name"
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.background }]}
                onPress={() => {
                  setShowSaveModal(false);
                  setTemplateName('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleSaveTemplate}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    padding: spacing.md,
    paddingBottom: 100,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginRight: spacing.sm,
  },
  headerButton: {
    padding: spacing.xs,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
  },
  helperText: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  optionText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  generateButtonText: {
    color: '#FFFFFF',
    ...typography.body,
    fontWeight: '600',
  },
  progressCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    ...typography.h3,
  },
  progressCount: {
    ...typography.body,
    fontWeight: '600',
  },
  progressBar: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  actionButtonText: {
    color: '#FFFFFF',
    ...typography.bodySmall,
    fontWeight: '600',
  },
  categoryCard: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
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
  },
  itemsList: {
    paddingHorizontal: spacing.md,
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
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    ...typography.body,
    flex: 1,
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  customBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  customBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
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
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
  },
  categoryOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  categoryOptionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  categoryOptionText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    ...typography.body,
    fontWeight: '600',
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
    padding: spacing.md,
  },
  emptyTemplates: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  templateCard: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateContent: {
    flex: 1,
    padding: spacing.md,
  },
  templateInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  templateName: {
    ...typography.body,
    fontWeight: '600',
    width: '100%',
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
