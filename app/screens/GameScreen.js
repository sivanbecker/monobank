import { useState } from 'react';
import { useGameSettings } from '../context/GameSettings';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const COLORS = [
  { id: 'red',    hex: '#e94560', label: '🔴' },
  { id: 'blue',   hex: '#457b9d', label: '🔵' },
  { id: 'green',  hex: '#2d6a4f', label: '🟢' },
  { id: 'yellow', hex: '#e9c46a', label: '🟡' },
  { id: 'purple', hex: '#7b2d8b', label: '🟣' },
  { id: 'orange', hex: '#f4a261', label: '🟠' },
];


function colorFor(colorId) {
  return COLORS.find((c) => c.id === colorId);
}

// ─── Setup phase ─────────────────────────────────────────────────────────────

function SetupPhase({ onStart }) {
  const [players, setPlayers] = useState([]);
  const [name, setName]       = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].id);

  const usedColors      = players.map((p) => p.color);
  const availableColors = COLORS.filter((c) => !usedColors.includes(c.id));

  function addPlayer() {
    const trimmed = name.trim();
    if (!trimmed || players.length >= 6) return;
    const color = COLORS.find((c) => c.id === selectedColor) || availableColors[0];
    setPlayers([...players, { id: Date.now().toString(), name: trimmed, color: color.id }]);
    setName('');
    const remaining = availableColors.filter((c) => c.id !== color.id);
    setSelectedColor(remaining.length > 0 ? remaining[0].id : COLORS[0].id);
  }

  function removePlayer(id) {
    setPlayers(players.filter((p) => p.id !== id));
  }

  const canAdd   = name.trim().length > 0 && players.length < 6;
  const canStart = players.length >= 2;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.heading}>משחק חדש</Text>
      <Text style={styles.subheading}>הוסף שחקנים (2–6)</Text>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => {
          const c = colorFor(item.color);
          return (
            <View style={styles.playerRow}>
              <View style={[styles.colorDot, { backgroundColor: c?.hex }]} />
              <Text style={styles.playerName}>{item.name}</Text>
              <TouchableOpacity onPress={() => removePlayer(item.id)} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>טרם נוספו שחקנים</Text>}
      />

      {players.length < 6 && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="שם שחקן"
            placeholderTextColor="#666"
            textAlign="right"
            returnKeyType="done"
            onSubmitEditing={addPlayer}
          />

          <View style={styles.colorPicker}>
            {availableColors.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedColor(c.id)}
                style={[
                  styles.colorOption,
                  { backgroundColor: c.hex },
                  selectedColor === c.id && styles.colorOptionSelected,
                ]}
              >
                <Text style={styles.colorEmoji}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
            onPress={addPlayer}
            disabled={!canAdd}
          >
            <Text style={styles.addBtnText}>הוסף שחקן +</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
        disabled={!canStart}
        onPress={() => onStart(players)}
      >
        <Text style={styles.startBtnText}>התחל משחק</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

// ─── Active game phase ────────────────────────────────────────────────────────

function ActiveGamePhase({ players, setPlayers, onEnd }) {
  const [modalPlayer, setModalPlayer] = useState(null);
  const [txType,      setTxType]      = useState(null); // 'payBank' | 'collectBank' | 'payPlayer' | 'collectPlayer'
  const [amount,      setAmount]      = useState('');
  const [targetId,    setTargetId]    = useState(null);

  function openModal(player) {
    setModalPlayer(player);
    setTxType(null);
    setAmount('');
    setTargetId(null);
  }

  function closeModal() {
    setModalPlayer(null);
  }

  function confirmTransaction() {
    const val = parseInt(amount, 10);
    if (!val || val <= 0) return;

    setPlayers((prev) => {
      const next = prev.map((p) => ({ ...p }));
      const fromIdx = next.findIndex((p) => p.id === modalPlayer.id);

      if (txType === 'payBank') {
        next[fromIdx].balance -= val;
      } else if (txType === 'collectBank') {
        next[fromIdx].balance += val;
      } else if (txType === 'payPlayer') {
        const toIdx = next.findIndex((p) => p.id === targetId);
        if (toIdx === -1) return prev;
        next[fromIdx].balance -= val;
        next[toIdx].balance   += val;
      } else if (txType === 'collectPlayer') {
        const fromPlayerIdx = next.findIndex((p) => p.id === targetId);
        if (fromPlayerIdx === -1) return prev;
        next[fromPlayerIdx].balance -= val;
        next[fromIdx].balance       += val;
      }
      return next;
    });
    closeModal();
  }

  function confirmEnd() {
    Alert.alert('סיום משחק', 'לסיים את המשחק הנוכחי?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'סיים', style: 'destructive', onPress: onEnd },
    ]);
  }

  const needsTarget = txType === 'payPlayer' || txType === 'collectPlayer';
  const canConfirm  =
    txType !== null &&
    parseInt(amount, 10) > 0 &&
    (!needsTarget || targetId !== null);

  const otherPlayers = modalPlayer ? players.filter((p) => p.id !== modalPlayer.id) : [];

  // Keep modal in sync with latest balance
  const liveModalPlayer = modalPlayer
    ? players.find((p) => p.id === modalPlayer.id) ?? modalPlayer
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>משחק פעיל</Text>
      <Text style={styles.subheading}>הקש על שחקן לביצוע עסקה</Text>

      <ScrollView style={styles.playerList} contentContainerStyle={styles.playerListContent}>
        {players.map((p) => {
          const c      = colorFor(p.color);
          const isNeg  = p.balance < 0;
          return (
            <TouchableOpacity key={p.id} style={styles.playerCard} onPress={() => openModal(p)}>
              <View style={[styles.colorBar, { backgroundColor: c?.hex }]} />
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{p.name}</Text>
                <Text style={[styles.cardBalance, isNeg && styles.cardBalanceNeg]}>
                  M₪{p.balance.toLocaleString()}
                </Text>
              </View>
              <Text style={styles.cardArrow}>‹</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.endBtn} onPress={confirmEnd}>
        <Text style={styles.endBtnText}>סיים משחק</Text>
      </TouchableOpacity>

      {/* ── Transaction modal ─────────────────────────────────────────── */}
      <Modal visible={!!liveModalPlayer} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={styles.modalDismissArea} onPress={closeModal} activeOpacity={1} />

          <View style={styles.modalSheet}>
            {liveModalPlayer && (
              <>
                {/* Player header */}
                <View style={styles.modalHeader}>
                  <View style={[styles.modalColorDot, { backgroundColor: colorFor(liveModalPlayer.color)?.hex }]} />
                  <Text style={styles.modalPlayerName}>{liveModalPlayer.name}</Text>
                  <Text style={styles.modalBalance}>M₪{liveModalPlayer.balance.toLocaleString()}</Text>
                </View>

                {/* Amount input */}
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="סכום"
                  placeholderTextColor="#555"
                  keyboardType="number-pad"
                  textAlign="right"
                  autoFocus
                />

                {/* Transaction type — 2×2 grid */}
                <View style={styles.txGrid}>
                  <TouchableOpacity
                    style={[styles.txBtn, txType === 'payBank' && styles.txBtnActive]}
                    onPress={() => { setTxType('payBank'); setTargetId(null); }}
                  >
                    <Text style={styles.txBtnEmoji}>🏦</Text>
                    <Text style={styles.txBtnLabel}>שלם לבנק</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.txBtn, txType === 'collectBank' && styles.txBtnActive]}
                    onPress={() => { setTxType('collectBank'); setTargetId(null); }}
                  >
                    <Text style={styles.txBtnEmoji}>💰</Text>
                    <Text style={styles.txBtnLabel}>קבל מבנק</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.txBtn, txType === 'payPlayer' && styles.txBtnActive]}
                    onPress={() => setTxType('payPlayer')}
                  >
                    <Text style={styles.txBtnEmoji}>➡️</Text>
                    <Text style={styles.txBtnLabel}>שלם לשחקן</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.txBtn, txType === 'collectPlayer' && styles.txBtnActive]}
                    onPress={() => setTxType('collectPlayer')}
                  >
                    <Text style={styles.txBtnEmoji}>⬅️</Text>
                    <Text style={styles.txBtnLabel}>קבל משחקן</Text>
                  </TouchableOpacity>
                </View>

                {/* Target player picker */}
                {needsTarget && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.targetScroll}>
                    {otherPlayers.map((p) => {
                      const c = colorFor(p.color);
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[styles.targetBtn, targetId === p.id && styles.targetBtnActive]}
                          onPress={() => setTargetId(p.id)}
                        >
                          <View style={[styles.targetDot, { backgroundColor: c?.hex }]} />
                          <Text style={styles.targetName}>{p.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}

                {/* Cancel / Confirm */}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                    <Text style={styles.cancelBtnText}>ביטול</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
                    disabled={!canConfirm}
                    onPress={confirmTransaction}
                  >
                    <Text style={styles.confirmBtnText}>אישור</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function GameScreen() {
  const [phase,   setPhase]   = useState('setup');
  const [players, setPlayers] = useState([]);
  const { settings } = useGameSettings();

  function startGame(setupPlayers) {
    setPlayers(setupPlayers.map((p) => ({ ...p, balance: settings.startingBalance })));
    setPhase('active');
  }

  function endGame() {
    setPlayers([]);
    setPhase('setup');
  }

  if (phase === 'active') {
    return <ActiveGamePhase players={players} setPlayers={setPlayers} onEnd={endGame} />;
  }
  return <SetupPhase onStart={startGame} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Shared ──
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
    paddingTop: 60,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 15,
    color: '#a8dadc',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 20,
  },

  // ── Setup phase ──
  list: {
    flexGrow: 0,
    maxHeight: 240,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 12,
  },
  playerName: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  removeBtn: {
    padding: 4,
  },
  removeBtnText: {
    color: '#e94560',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#555',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginVertical: 16,
    fontSize: 15,
  },
  addForm: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#16213e',
    color: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
    writingDirection: 'rtl',
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 10,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  colorOptionSelected: {
    opacity: 1,
    borderWidth: 3,
    borderColor: '#fff',
  },
  colorEmoji: {
    fontSize: 22,
  },
  addBtn: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: '#a8dadc',
    fontSize: 17,
    fontWeight: 'bold',
    writingDirection: 'rtl',
  },
  startBtn: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  startBtnDisabled: {
    opacity: 0.35,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    writingDirection: 'rtl',
  },

  // ── Active game phase ──
  playerList: {
    flex: 1,
  },
  playerListContent: {
    paddingBottom: 8,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  colorBar: {
    width: 8,
    alignSelf: 'stretch',
  },
  cardContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'flex-end',
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  cardBalance: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#a8dadc',
    marginTop: 2,
    textAlign: 'right',
  },
  cardBalanceNeg: {
    color: '#e94560',
  },
  cardArrow: {
    fontSize: 28,
    color: '#0f3460',
    paddingHorizontal: 12,
  },
  endBtn: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  endBtnText: {
    color: '#a8dadc',
    fontSize: 16,
    fontWeight: 'bold',
    writingDirection: 'rtl',
  },

  // ── Transaction modal ──
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: '#16213e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  modalColorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginLeft: 10,
  },
  modalPlayerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  modalBalance: {
    fontSize: 16,
    color: '#a8dadc',
    marginRight: 4,
  },
  amountInput: {
    backgroundColor: '#1a1a2e',
    color: '#fff',
    borderRadius: 10,
    padding: 16,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
    writingDirection: 'rtl',
  },
  txGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  txBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  txBtnActive: {
    borderColor: '#e94560',
    backgroundColor: '#2a1a2e',
  },
  txBtnEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  txBtnLabel: {
    color: '#a8dadc',
    fontSize: 13,
    fontWeight: 'bold',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  targetScroll: {
    marginBottom: 12,
  },
  targetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  targetBtnActive: {
    borderColor: '#e94560',
  },
  targetDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 6,
  },
  targetName: {
    color: '#fff',
    fontSize: 14,
    writingDirection: 'rtl',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#a8dadc',
    fontSize: 17,
    fontWeight: 'bold',
    writingDirection: 'rtl',
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: '#e94560',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.35,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    writingDirection: 'rtl',
  },
});
