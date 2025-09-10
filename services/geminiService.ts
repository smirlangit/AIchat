
import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
  // In a real app, you might want to show a more user-friendly message
  // or disable the chat functionality.
  console.error("API_KEY environment variable not set. App will not function correctly.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || " " });

export const createChat = (systemInstruction: string): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const sendMessageStream = async function* (chat: Chat, message: string) {
  if (!process.env.API_KEY) {
    yield "Ошибка: API ключ не настроен. Пожалуйста, установите переменную окружения API_KEY.";
    return;
  }
  try {
    const responseStream = await chat.sendMessageStream({ message });
    for await (const chunk of responseStream) {
      yield chunk.text;
    }
  } catch(error) {
     console.error("Error sending message to Gemini API:", error);
     yield "Произошла ошибка при обращении к API. Подробности смотрите в консоли.";
  }
};
