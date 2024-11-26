import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    logoutButton: {
      marginLeft: 15, // Adds spacing from the left edge
      padding: 5, // Increases the touchable area
    },
    accountButton: {
      marginRight: 10, // Adds spacing from the right edge
      padding: 5,
    },
    pressedButton: {
      opacity: 0.5, // Provides visual feedback when pressed
    },
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    qrContainer: {
      marginVertical: 20,
      padding: 10,
      borderWidth: 2,
      borderColor: '#000',
      borderRadius: 12,
      backgroundColor: '#f9f9f9',
      alignItems:'center',
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginRight: 15,
      resizeMode: 'cover',
      overflow: 'hidden',
      flex : 1,
    },
    nameText:{
      fontSize: 30,
      fontWeight: 'bold',
    },
    nameContainer: {
      paddingVertical: 5,
      paddingHorizontal: 15,
      alignItems: 'center',
      backgroundColor: '#f9f9f9',
      borderRadius: 15,
      borderColor: '#000',
      borderWidth: 2,
      flex : 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    infoRowQR: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      fontSize: 18,
      fontWeight: 'bold',
      marginRight: 10,
    },
    labelQrcode: {
      fontSize: 18,
      fontWeight: 'bold',
      marginRight: 10,
      flex: 5,
    },
    labelCentered:{
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    infoBox: {
      backgroundColor: '#D4F0DD',
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 15,
      flex: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    infoText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    groupContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 10,
      marginBottom: 10,
    },
    groupBox: {
      backgroundColor: '#D4F0DD',
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 20,
      marginRight: 10,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    groupText: {
      fontSize: 14,
      fontWeight : 'bold',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '80%',
      padding: 20,
      backgroundColor: '#fff',
      borderRadius: 10,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    modalText: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
    },
    closeButton: {
      backgroundColor: '#4CAF50',
      padding: 10,
      borderRadius: 5,
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 16,
    },
    container2: {
      padding: 20,
      justifyContent: 'center',
      flex: 1,
      backgroundColor: '#fff',
    },
    label2: {
      color: 'gray',
    },
    title: {
      color: 'black',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    input: {
      borderWidth: 1,
      borderColor: '#5AC07C',
      padding: 10,
      marginTop: 5,
      marginBottom: 20,
      backgroundColor: 'white',
      borderRadius: 5,
    },
    textButton: {
      fontWeight: 'bold',
      color: "#5AC07C",
      fontSize: 16,
      marginVertical: 10,
    },
    textnormal: {
      fontSize: 16,
      color: "#000",
      marginVertical: 10,
      marginRight: 5,
    },
    spacer: {
      flex: 1,
    },
    bottomContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20, // Optional: Add some margin at the bottom
    },
    evenmatelogo: {
      width: 33,
      height: 27,
      resizeMode: 'cover',
      overflow: 'hidden',
    },
  });