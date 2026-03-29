import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>מונופול</Text>
      <Text style={styles.subtitle}>סופר בנקאות אלקטרונית</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Game')}
      >
        <Text style={styles.buttonText}>משחק חדש</Text>
      </TouchableOpacity>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#a8dadc',
    marginTop: 8,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  button: {
    marginTop: 48,
    backgroundColor: '#e94560',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
});
