import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGameSettings } from '../context/GameSettings';

function SettingRow({ label, description, value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  function startEdit() {
    setDraft(String(value));
    setEditing(true);
  }

  function confirm() {
    const num = parseInt(draft, 10);
    if (!num || num <= 0) {
      Alert.alert('שגיאה', 'יש להזין מספר חיובי');
      return;
    }
    onSave(num);
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
  }

  return (
    <View style={styles.settingCard}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description ? <Text style={styles.settingDesc}>{description}</Text> : null}
      </View>

      {editing ? (
        <View style={styles.editRow}>
          <TextInput
            style={styles.editInput}
            value={draft}
            onChangeText={setDraft}
            keyboardType="number-pad"
            textAlign="right"
            autoFocus
            selectTextOnFocus
          />
          <TouchableOpacity style={styles.saveBtn} onPress={confirm}>
            <Text style={styles.saveBtnText}>✓</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelEditBtn} onPress={cancel}>
            <Text style={styles.cancelEditBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.valueBtn} onPress={startEdit}>
          <Text style={styles.valueText}>M₪{value.toLocaleString()}</Text>
          <Text style={styles.editHint}>✎</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function AdminScreen() {
  const { settings, updateSetting, resetSettings } = useGameSettings();

  function confirmReset() {
    Alert.alert('איפוס הגדרות', 'לאפס את כל ההגדרות לברירת מחדל?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'איפוס', style: 'destructive', onPress: resetSettings },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>הגדרות משחק</Text>

      <SettingRow
        label="יתרה התחלתית"
        description="סכום הכסף שכל שחקן מקבל בתחילת המשחק"
        value={settings.startingBalance}
        onSave={(v) => updateSetting('startingBalance', v)}
      />

      <SettingRow
        label='משכורת – מעבר ב"עברי"'
        description='סכום המתקבל בכל מעבר בתחנת "עברי"'
        value={settings.goSalary}
        onSave={(v) => updateSetting('goSalary', v)}
      />

      <TouchableOpacity style={styles.resetBtn} onPress={confirmReset}>
        <Text style={styles.resetBtnText}>איפוס לברירת מחדל</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 28,
  },
  settingCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  settingInfo: {
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  settingDesc: {
    fontSize: 13,
    color: '#a8dadc',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: 2,
  },
  valueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  valueText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e9c46a',
    flex: 1,
    textAlign: 'right',
  },
  editHint: {
    fontSize: 18,
    color: '#555',
    marginLeft: 8,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 22,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#e94560',
    writingDirection: 'rtl',
  },
  saveBtn: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cancelEditBtn: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelEditBtnText: {
    color: '#a8dadc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetBtn: {
    marginTop: 16,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  resetBtnText: {
    color: '#555',
    fontSize: 15,
    writingDirection: 'rtl',
  },
});
