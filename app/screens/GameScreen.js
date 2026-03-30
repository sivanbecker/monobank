import { useState } from 'react';
import { useGameSettings } from '../context/GameSettings';
import {
  Alert,
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

// 4 fixed tokens matching the physical game pieces
const TOKENS = [
  { id: 'car',   emoji: '🚕', label: 'המטייל',          hex: '#e9c46a' },
  { id: 'safe',  emoji: '🗄️', label: 'החסכן',            hex: '#adb5bd' },
  { id: 'dog',   emoji: '🐕', label: 'הבזבזן',           hex: '#e94560' },
  { id: 'plane', emoji: '✈️', label: 'הנוסע המתמיד',    hex: '#457b9d' },
];

function tokenFor(id) {
  return TOKENS.find((t) => t.id === id);
}

// ─── Setup phase ─────────────────────────────────────────────────────────────

// Each token slot = one potential player. Players enter their name to join.
function SetupPhase({ onStart }) {
  // names[tokenId] = string (empty = not playing)
  const [names, setNames] = useState({ car: '', safe: '', dog: '', plane: '' });

  function setName(tokenId, value) {
    setNames((prev) => ({ ...prev, [tokenId]: value }));
  }

  const activePlayers = TOKENS.filter((t) => names[t.id].trim().length > 0);
  const canStart = activePlayers.length >= 2;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.heading}>משחק חדש</Text>
      <Text style={styles.subheading}>הזן שם לכל שחקן משתתף (2–4)</Text>

      <View style={styles.tokenGrid}>
        {TOKENS.map((token) => (
          <View key={token.id} style={[styles.tokenSlot, { borderColor: token.hex }]}>
            <Text style={styles.tokenEmoji}>{token.emoji}</Text>
            <Text style={[styles.tokenLabel, { color: token.hex }]}>{token.label}</Text>
            <TextInput
              style={styles.tokenInput}
              value={names[token.id]}
              onChangeText={(v) => setName(token.id, v)}
              placeholder="שם שחקן"
              placeholderTextColor="#444"
              textAlign="right"
              returnKeyType="done"
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
        disabled={!canStart}
        onPress={() =>
          onStart(
            activePlayers.map((t) => ({
              id: t.id,
              name: names[t.id].trim(),
              token: t.id,
            }))
          )
        }
      >
        <Text style={styles.startBtnText}>התחל משחק</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

// ─── Active game phase ────────────────────────────────────────────────────────

function ActiveGamePhase({ players, setPlayers, onEnd }) {
  const [modalPlayer, setModalPlayer] = useState(null);
  const [txType,      setTxType]      = useState(null);
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

  const liveModalPlayer = modalPlayer
    ? players.find((p) => p.id === modalPlayer.id) ?? modalPlayer
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>משחק פעיל</Text>
      <Text style={styles.subheading}>הקש על שחקן לביצוע עסקה</Text>

      <ScrollView style={styles.playerList} contentContainerStyle={styles.playerListContent}>
        {players.map((p) => {
          const t     = tokenFor(p.token);
          const isNeg = p.balance < 0;
          return (
            <TouchableOpacity key={p.id} style={styles.playerCard} onPress={() => openModal(p)}>
              <View style={[styles.tokenBar, { backgroundColor: t?.hex }]} />
              <Text style={styles.cardEmoji}>{t?.emoji}</Text>
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

      {/* ── Transaction modal ── */}
      <Modal visible={!!liveModalPlayer} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={styles.modalDismissArea} onPress={closeModal} activeOpacity={1} />

          <View style={styles.modalSheet}>
            {liveModalPlayer && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalEmoji}>{tokenFor(liveModalPlayer.token)?.emoji}</Text>
                  <Text style={styles.modalPlayerName}>{liveModalPlayer.name}</Text>
                  <Text style={styles.modalBalance}>M₪{liveModalPlayer.balance.toLocaleString()}</Text>
                </View>

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

                {needsTarget && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.targetScroll}>
                    {otherPlayers.map((p) => {
                      const t = tokenFor(p.token);
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[styles.targetBtn, targetId === p.id && styles.targetBtnActive]}
                          onPress={() => setTargetId(p.id)}
                        >
                          <Text style={styles.targetEmoji}>{t?.emoji}</Text>
                          <Text style={styles.targetName}>{p.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}

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
    marginBottom: 24,
  },

  // ── Setup phase ──
  tokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 24,
  },
  tokenSlot: {
    width: '46%',
    backgroundColor: '#16213e',
    borderRadius: 14,
    borderWidth: 2,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  tokenEmoji: {
    fontSize: 36,
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    writingDirection: 'rtl',
  },
  tokenInput: {
    width: '100%',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  startBtn: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
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
  tokenBar: {
    width: 8,
    alignSelf: 'stretch',
  },
  cardEmoji: {
    fontSize: 28,
    paddingHorizontal: 10,
  },
  cardContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 4,
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
  modalEmoji: {
    fontSize: 26,
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
  targetEmoji: {
    fontSize: 18,
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
