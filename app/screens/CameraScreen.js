import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CameraView } from 'expo-camera';

import streetCards from '../../cards/street-cards/street-cards.json';
import surpriseCards from '../../cards/surprise-cards/surprise-cards.json';

// Build a flat lookup map: barcode → card info
const CARD_DB = {};
for (const card of streetCards) {
  CARD_DB[card.barcode] = { kind: 'street', ...card };
}
for (const card of surpriseCards) {
  CARD_DB[card.barcode] = { kind: 'surprise', ...card };
}


export default function CameraScreen() {
  const [result, setResult] = useState(null); // { card, raw } | { unknown, raw }
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const subscription = CameraView.onModernBarcodeScanned(({ data }) => {
      console.log('[CameraScreen] scanned:', data);
      const card = CARD_DB[data] ?? null;
      setResult({ card, raw: data });
      setScanning(false);
    });
    return () => subscription.remove();
  }, []);

  async function startScan() {
    setResult(null);
    setScanning(true);
    await CameraView.launchScanner({ barcodeTypes: ['qr'] });
    setScanning(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>סריקת כרטיס</Text>

      <TouchableOpacity
        style={[styles.scanBtn, scanning && styles.scanBtnDisabled]}
        onPress={startScan}
        disabled={scanning}
      >
        <Text style={styles.scanBtnIcon}>📷</Text>
        <Text style={styles.scanBtnText}>{scanning ? 'סורק...' : 'סרוק כרטיס'}</Text>
      </TouchableOpacity>

      {result && <CardResult result={result} onScanAgain={startScan} />}
      {!result && !scanning && <Text style={styles.hint}>סרוק את קוד ה-QR שעל הכרטיס</Text>}
    </View>
  );
}

function CardResult({ result, onScanAgain }) {
  const { card, raw } = result;

  if (!card) {
    return (
      <View style={styles.resultBox}>
        <Text style={styles.unknownText}>קוד לא מזוהה</Text>
        <Text style={styles.rawText}>{raw}</Text>
        <ScanAgainBtn onPress={onScanAgain} />
      </View>
    );
  }

  if (card.kind === 'street') {
    return (
      <View style={[styles.resultBox, { borderLeftColor: card.colorHex, borderLeftWidth: 6 }]}>
        <Text style={styles.cardType}>שטר קניין</Text>
        <Text style={styles.cardCity}>{card.city}</Text>
        <Text style={styles.cardStreet}>{card.street}</Text>
        <View style={styles.rentRow}>
          <Text style={styles.rentLabel}>שכירות:</Text>
          <Text style={styles.rentValue}>M₪{card.rent}</Text>
        </View>
        <View style={styles.rentRow}>
          <Text style={styles.rentLabel}>קבוצה מלאה:</Text>
          <Text style={styles.rentValue}>M₪{card.rentFullGroup}</Text>
        </View>
        <ScanAgainBtn onPress={onScanAgain} />
      </View>
    );
  }

  // surprise card
  return (
    <View style={styles.resultBox}>
      <Text style={styles.cardType}>הפתעה</Text>
      <Text style={styles.surpriseText}>{card.textHe}</Text>
      {card.amount != null && (
        <Text style={styles.surpriseAmount}>
          {card.effectType.startsWith('pay') ? '-' : '+'}M₪{card.amount}
        </Text>
      )}
      <ScanAgainBtn onPress={onScanAgain} />
    </View>
  );
}

function ScanAgainBtn({ onPress }) {
  return (
    <TouchableOpacity style={styles.scanAgainBtn} onPress={onPress}>
      <Text style={styles.scanAgainText}>סרוק שוב</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 32,
  },
  scanBtn: {
    backgroundColor: '#e94560',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '80%',
    gap: 8,
  },
  scanBtnDisabled: { opacity: 0.5 },
  scanBtnIcon: { fontSize: 48 },
  scanBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    writingDirection: 'rtl',
  },
  hint: {
    color: '#a8dadc',
    fontSize: 14,
    textAlign: 'center',
    writingDirection: 'rtl',
    marginTop: 20,
  },
  resultBox: {
    width: '100%',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    marginTop: 28,
    gap: 8,
  },
  cardType: {
    color: '#a8dadc',
    fontSize: 13,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 2,
  },
  cardCity: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
    opacity: 0.7,
  },
  cardStreet: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rentLabel: {
    color: '#a8dadc',
    fontSize: 15,
    writingDirection: 'rtl',
  },
  rentValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  surpriseText: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 26,
  },
  surpriseAmount: {
    color: '#e9c46a',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  unknownText: {
    color: '#e94560',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  rawText: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  scanAgainBtn: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  scanAgainText: {
    color: '#a8dadc',
    fontSize: 16,
    fontWeight: 'bold',
    writingDirection: 'rtl',
  },
});
