import { StyleSheet, Text, View } from 'react-native';

export default function AdminScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>ניהול</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e94560',
    writingDirection: 'rtl',
  },
});
