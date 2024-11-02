// app/(user)/account.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const AccountScreen = () => {
  // Replace mock user data with actual user data from your state or props
  const user = {
    name: 'John Doe',
    bankAccount: '12345678',
    email: 'john.doe@example.com',
    groups: ['Group A', 'Group B', 'Group C'],
  };

  // Render the header component containing account information
  const renderHeader = () => (
    <View style={styles.infoContainer}>
      <Text style={styles.label}>
        Name: <Text style={styles.value}>{user.name}</Text>
      </Text>
      <Text style={styles.label}>
        Bank Account: <Text style={styles.value}>{user.bankAccount}</Text>
      </Text>
      <Text style={styles.label}>
        Email: <Text style={styles.value}>{user.email}</Text>
      </Text>
    </View>
  );

  // Render the "My Groups" header
  const renderGroupsHeader = () => (
    <Text style={styles.subHeading}>My Groups</Text>
  );

  // Render the "My Groups" header
  const renderAccountHeader = () => (
    <Text style={styles.subHeading}>My account</Text>
  );

  // Render each group item
  const renderGroupItem = ({ item }: { item: string }) => (
    <View style={styles.groupItemContainer}>
      <Text style={styles.groupItemText}>{item}</Text>
    </View>
  );

  return (
    <FlatList
      data={user.groups}
      keyExtractor={(item) => item}
      renderItem={renderGroupItem}
      ListHeaderComponent={
        <>
          {renderAccountHeader()}
          {renderHeader()}
          {renderGroupsHeader()}
        </>
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  listContainer: {
    padding: 20, // Standardized padding
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  infoContainer: {
    backgroundColor: '#D4F0DD', // Consistent background color
    padding: 20,
    borderRadius: 10,
    marginBottom: 20, // Adjusted margin to separate from "My Groups"
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  heading: {
    fontSize: 24, // Standardized font size
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
  },
  subHeading: { // New style for "My Groups" header
    fontSize: 20, // Slightly smaller than main headings
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 15,
    color: '#333',
    textAlign: 'left', // Align to left for distinction
  },
  label: {
    marginBottom: 10,
    fontSize: 16, // Standardized font size
    fontWeight: '500',
    color: '#555',
  },
  value: {
    fontWeight: '400',
    color: '#333',
  },
  groupItemContainer: {
    width: '100%',
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9', // Consistent background color
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  groupItemText: {
    fontSize: 18, // Enhanced font size for better readability
    color: '#333',
  },
});