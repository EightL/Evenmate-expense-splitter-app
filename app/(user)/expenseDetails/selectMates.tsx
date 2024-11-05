// components/selectMates.tsx
import Icon from 'react-native-vector-icons/MaterialIcons';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMatesList } from '@/api/mates';
import { useGroupsList, useGroupMembers } from '@/api/groups';
import { supabase } from '@/lib/supabase';


export default function SelectMatesScreen() {
  const router = useRouter();
  const { expenseName, cost } = useLocalSearchParams();
  const [selectedMates, setSelectedMates] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // State to store the current user ID
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Retrieve the current user ID once on component mount
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error.message);
        return;
      }
      setCurrentUserId(session?.user.id || null);
    };

    fetchSession();
  }, []);

  const { data: matesData, isLoading: isLoadingMates, error: errorMates } = useMatesList(currentUserId);
  const { data: groupsData, error: errorGroups } = useGroupsList(currentUserId);
  const groupIds = groupsData ? groupsData.map(group => group.groupid) : [];

  // Fetch group members for all group IDs
  // const { data: groupMembers, error: errorGroupsMembers } = useGroupMembers(groupIds);
  const { data: groupMembers, error: errorGroupsMembers, isLoading: isLoadingGroupMembers } = useGroupMembers(expandedGroups, {
    enabled: !!expandedGroups, // Fetch only when a group is selected
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  if (isLoadingMates) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  if (errorMates || errorGroups) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading data.</Text>
      </View>
    );
  }

  // Toggle selection for mates
  const toggleMateSelection = (mateId: string) => {
    if (selectedMates.includes(mateId)) {
      setSelectedMates(selectedMates.filter((id) => id !== mateId));
    } else {
      setSelectedMates([...selectedMates, mateId]);
    }
  };

  // Toggle expansion for groups
  const toggleGroupExpansion = (groupId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedGroups.includes(groupId)) {
      // Collapse if the clicked group is already expanded
      setExpandedGroups([]);
    } else {
      // Set the expanded group to only the clicked groupId
      setExpandedGroups([groupId]);
      // const { data: groupMembers, error: errorGroupsMembers } = useGroupMembers(groupId);
    }
  };

  // Handle confirm action
  const handleConfirmSplit = () => {
    if (selectedMates.length === 0) {
      Alert.alert('Selection Error', 'Please select at least one mate.');
      return;
    }

    const selectedMateNames = selectedMates.map((id) => {
      const mate = matesData.find((mate) => mate.user2 === id);
      return mate ? mate.profiles.username : '';
    });

    router.replace({
      pathname: '/expenseDetails',
      params: {
        expenseName,
        cost,
        mateIds: selectedMates,
        mateNames: selectedMateNames,
        groupId: expandedGroups,
      },
    });
  };

  // Render individual mate item
  const renderMate = ({ item }: { item: any }) => (
    <Pressable onPress={() => toggleMateSelection(item.user2)}>
      <View
        style={[
          styles.mateContainer,
          selectedMates.includes(item.user2) && styles.selectedMateContainer,
        ]}
      >
        <Text
          style={
            selectedMates.includes(item.user2) ? styles.selectedMateText : styles.mateText
          }
        >
          {item.profiles.username}
        </Text>
      </View>
    </Pressable>
  );

  // Render individual group item
  const renderGroup = ({ item }: { item: any }) => {
    const isExpanded = expandedGroups.includes(item.groups.id);

    return (
      <View>
        <Pressable onPress={() => toggleGroupExpansion(item.groups.id)}>
          <View
            style={[
              styles.groupContainer,
              isExpanded && styles.expandedGroupContainer,
            ]}
          >
            <Text
              style={
                isExpanded ? styles.expandedGroupText : styles.groupText
              }
            >
              {item.groups.name}
            </Text>
          </View>
        </Pressable>
        {isExpanded && (
          <FlatList
            data={groupMembers}
            keyExtractor={(member) => member.userid}
            renderItem={({ item: member }) => (
              <Pressable onPress={() => toggleMateSelection(member.userid)}>
                <View
                  style={[
                    styles.subMateContainer,
                    selectedMates.includes(member.userid) && styles.selectedSubMateContainer,
                  ]}
                >
                  <Text
                    style={
                      selectedMates.includes(member.userid)
                        ? styles.selectedMateText
                        : styles.mateText
                    }
                  >
                    {member.profiles.username}
                  </Text>
                </View>
              </Pressable>
            )}
            nestedScrollEnabled
            style={styles.groupMembersList}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Select Mates or Groups</Text>

      {/* Groups List */}
      <Text style={styles.sectionTitle}>Groups</Text>
      <FlatList
        data={groupsData}
        keyExtractor={(item) => `group-${item.groups.id}`}
        renderItem={renderGroup}
        contentContainerStyle={styles.groupsList}
      />

      {/* Mates List */}
      <Text style={styles.sectionTitle}>Mates</Text>
      <FlatList
        data={matesData}
        keyExtractor={(item) => `mate-${item.user2}`}
        renderItem={renderMate}
        contentContainerStyle={styles.matesList}
      />

      {/* Confirm Button */}
      <Pressable
        style={[
          styles.confirmButton,
          selectedMates.length === 0 && styles.buttonDisabled,
        ]}
        onPress={handleConfirmSplit}
        disabled={selectedMates.length === 0}
      >
        <Text style={styles.confirmButtonText}>Confirm Split</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  matesList: {
    flexGrow: 1,
  },
  groupMembersList: {
    paddingLeft: 20,
  },
  mateContainer: {
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#E0F7E9',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2, // For Android shadow
  },
  selectedMateContainer: {
    backgroundColor: '#4CAF50',
  },
  selectedSubMateContainer: {
    backgroundColor: '#4CAF50',
  },
  groupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#E0F7E9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2, // For Android shadow
  },
  expandedGroupContainer: {
    backgroundColor: '#60AF7B',
  },
  groupPressable: {
    // Optional: Add padding or other styles if needed
  },
  groupText: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
  mateText: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
  expandedGroupText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  selectedMateText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  subMateContainer: {
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#E0F7E9',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2, // For Android shadow
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A1C3AD',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submateText: {
  },
  selectedsubMateText:{

  },
});