// app/(user)/friendDetails/index.tsx
import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/Colors';
import { useMatesList } from '@/api/mates';
import { useGroupsList, useGroupMembers } from '@/api/groups';
import { supabase } from '@/lib/supabase';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';

export default function MatesScreen() {
  const router = useRouter(); // Initialize the router
  const { expenseName, cost } = useLocalSearchParams();

  // State to track selected option: 'Mates' or 'Group'
  const [selectedOption, setSelectedOption] = useState<'Mates' | 'Group'>('Mates');
  const [selectedMates, setSelectedMates] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // State for refreshing FlatList
  const [refreshing, setRefreshing] = useState(false);

  // Retrieve the current user ID
  const { data: currentUserId, error: currentUserError } = useGetCurrentUserId();
  const { data: matesData, isLoading: isLoadingMates, error: errorMates, refetch: refetchMates } = useMatesList(currentUserId);
  const { data: groupsData, error: errorGroups } = useGroupsList(currentUserId);
  // const groupIds = groupsData ? groupsData.map(group => group.groupid) : [];
  
  // Fetch group members for all group IDs
  // const { data: groupMembers, error: errorGroupsMembers } = useGroupMembers(groupIds);
  const { data: groupMembers, error: errorGroupsMembers, isLoading: isLoadingGroupMembers, refetch: refetchGroups } = useGroupMembers(expandedGroups);

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

//   // Fetch mates data
//   const {
//     data: matesData,
//     error: matesError,
//     isLoading: isLoadingMates,
//     refetch: refetchMates,
//   } = useMatesList(currentUserId);

//   // Fetch groups data
//   const {
//     data: groupsData,
//     error: groupsError,
//     isLoading: isLoadingGroups,
//     refetch: refetchGroups,
//   } = useGroupsList(currentUserId);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    if (selectedOption === 'Mates') {
      refetchMates();
    } else {
      refetchGroups();
    }
    setRefreshing(false);
  };


//   if (currentUserError || matesError || groupsError) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.errorText}>
//           {currentUserError?.message ||
//             matesError?.message ||
//             groupsError?.message ||
//             'Failed to load data.'}
//         </Text>
//       </View>
//     );
//   }

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
            setSelectedMates([]);
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

// Type for Group
type Group = {
groupid: string;
groups: {
    id: string;
    name: string;
    created_at: string;
    creator_id: string;
    notes: string | null;
};
userid: string;
};


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
      {/* Split With Section */}
      <Text style={styles.title}>Split with:</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedOption === 'Mates' && styles.selectedButton,
          ]}
          onPress={() => {
            setSelectedOption('Mates');
            setSelectedMates([]);
            setExpandedGroups([]);
          }}
        >
          <Text
            style={[
              styles.buttonText,
              selectedOption === 'Mates' && styles.selectedButtonText,
            ]}
          >
            Mates
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedOption === 'Group' && styles.selectedButton,
          ]}
          onPress={() => {
            setSelectedOption('Group');
            setSelectedMates([]);
          }}
        >
          <Text
            style={[
              styles.buttonText,
              selectedOption === 'Group' && styles.selectedButtonText,
            ]}
          >
            Group
          </Text>
        </TouchableOpacity>
      </View>

      {/* FlatList for Mates or Groups */}
      <FlatList
        data={selectedOption === 'Mates' ? matesData : groupsData}
        keyExtractor={(item, index) =>
          selectedOption === 'Mates'
            ? item.profiles.username + index
            : item.groups.id + index
        }
        renderItem={selectedOption === 'Mates' ? renderMate : renderGroup}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No {selectedOption.toLowerCase()} available.</Text>
          </View>
        }
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
        marginBottom: 30,
        marginTop: 10,
        textAlign: 'center',
      },
      matesList: {
        flexGrow: 1,
      },
      groupMembersList: {
        paddingLeft: 20,
      },
      mateContainer: {
        width: '100%',
        padding: 15,
        marginBottom: 15,
        backgroundColor: '#D4F0DD',
        borderRadius: 10,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        // Elevation for Android
        elevation: 3,
        alignItems: 'center',
      },
      selectedMateContainer: {
        backgroundColor: '#4CAF50',
      },
      selectedSubMateContainer: {
        backgroundColor: '#4CAF50',
      },
      groupContainer: {
        width: '100%',
        padding: 15,
        marginBottom: 15,
        backgroundColor: '#D4F0DD',
        borderRadius: 10,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        // Elevation for Android
        elevation: 3,
      },
      expandedGroupContainer: {
        backgroundColor: '#60AF7B',
        marginBottom: 1,
      },
      groupPressable: {
        // Optional: Add padding or other styles if needed
      },
      groupText: {
        fontSize: 18,
        color: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
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
        textAlign: 'center',
      },
      selectedMateText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
      },
      toggleButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 10,
        backgroundColor: '#E0F7E9',
        alignItems: 'center',
        justifyContent: 'center',
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
      selectedButton: {
        backgroundColor: '#4CAF50',
      },
      buttonText: {
        fontSize: 16,
        color: '#000',
      },
      selectedButtonText: {
        color: '#fff',
        fontWeight: 'bold',
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
      splitWithText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
      },
      buttonContainer: {
        flexDirection: 'row',
        marginBottom: 20,
      },
    });