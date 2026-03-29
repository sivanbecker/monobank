import { createContext, useContext, useState } from 'react';

const DEFAULTS = {
  startingBalance: 1500,
  goSalary: 200,
};

const GameSettingsContext = createContext(null);

export function GameSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function resetSettings() {
    setSettings(DEFAULTS);
  }

  return (
    <GameSettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </GameSettingsContext.Provider>
  );
}

export function useGameSettings() {
  return useContext(GameSettingsContext);
}
