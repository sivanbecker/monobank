import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>מונופול</Text>
      <Text style={styles.subtitle}>סופר בנקאות אלקטרונית</Text>
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
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#e94560',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 20,
    color: '#a8dadc',
    marginTop: 8,
    writingDirection: 'rtl',
  },
});
