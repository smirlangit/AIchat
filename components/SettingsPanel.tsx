
import React, { useState } from 'react';

interface SettingsPanelProps {
  onApply: (instruction: string) => void;
  initialInstruction: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onApply, initialInstruction }) => {
  const [instruction, setInstruction] = useState(initialInstruction);

  const handleApplyClick = () => {
    onApply(instruction);
  };

  return (
    <aside className="w-80 bg-gray-800 p-6 flex flex-col border-r border-gray-700">
      <h1 className="text-2xl font-bold text-white mb-2">Настройки ИИ</h1>
      <p className="text-sm text-gray-400 mb-6">Задайте личность для вашего собеседника.</p>
      
      <div className="flex-grow flex flex-col">
        <label htmlFor="system-instruction" className="text-md font-semibold text-gray-300 mb-2">
          Системная инструкция
        </label>
        <textarea
          id="system-instruction"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="По умолчанию: Ты — полезный ассистент."
          className="flex-grow bg-gray-900 text-gray-200 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition duration-200"
        />
      </div>
      
      <button
        onClick={handleApplyClick}
        className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-200"
      >
        Применить и начать новый чат
      </button>
    </aside>
  );
};
