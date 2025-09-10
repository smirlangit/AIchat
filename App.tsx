
import React, { useState } from 'react';
import { SettingsPanel } from './components/SettingsPanel';
import { ChatPanel } from './components/ChatPanel';

const DEFAULT_INSTRUCTION = 'Ты — полезный ассистент.';

function App() {
  const [systemInstruction, setSystemInstruction] = useState<string>(DEFAULT_INSTRUCTION);
  const [chatKey, setChatKey] = useState<number>(1);

  const handleApplyInstruction = (newInstruction: string) => {
    // Use the default if the new instruction is empty
    const instructionToApply = newInstruction.trim() === '' ? DEFAULT_INSTRUCTION : newInstruction;
    setSystemInstruction(instructionToApply);
    setChatKey(prevKey => prevKey + 1); // This forces the ChatPanel to remount and reset
  };

  return (
    <div className="flex h-screen font-sans bg-gray-900 text-white overflow-hidden">
      <SettingsPanel 
        onApply={handleApplyInstruction} 
        initialInstruction={systemInstruction} 
      />
      <main className="flex-1 flex flex-col h-screen">
        <ChatPanel key={chatKey} systemInstruction={systemInstruction} />
      </main>
    </div>
  );
}

export default App;
