/**
 * Chatbot Frontend Script
 * Handles form submission, API calls, and chat UI updates
 */

// Configuration
const API_ENDPOINT = '/api/chat';
const THINKING_MESSAGE = 'Thinking...';
const ERROR_MESSAGE = 'Failed to get response from server.';
const NO_RESPONSE_MESSAGE = 'Sorry, no response received.';

// DOM Elements
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Conversation history
let conversationHistory = [];

/**
 * Add a message to the chat box
 * @param {string} message - The message text
 * @param {string} role - 'user' or 'model'
 * @param {string} id - Optional unique ID for the message element
 * @returns {HTMLElement} The created message element
 */
function addMessageToChat(message, role, id = '') {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${role}`;
  messageElement.textContent = message;
  
  if (id) {
    messageElement.id = id;
  }
  
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
  
  return messageElement;
}

/**
 * Update an existing message in the chat box
 * @param {string} id - The ID of the message element to update
 * @param {string} newMessage - The new message text
 */
function updateMessage(id, newMessage) {
  const messageElement = document.getElementById(id);
  if (messageElement) {
    messageElement.textContent = newMessage;
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
  }
}

/**
 * Build the conversation payload for the API request
 * @param {string} userMessage - The current user message
 * @returns {Array} Array of conversation objects
 */
function buildConversationPayload(userMessage) {
  // Clone existing history and add the new user message
  const payload = [...conversationHistory];
  payload.push({
    role: 'user',
    text: userMessage
  });
  return payload;
}

/**
 * Send the user message to the backend API
 * @param {string} userMessage - The user's message
 * @returns {Promise<string>} The AI response or error message
 */
async function sendMessageToAPI(userMessage) {
  try {
    const payload = {
      conversation: buildConversationPayload(userMessage)
    };

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return ERROR_MESSAGE;
    }

    const data = await response.json();

    // Validate response structure
    if (!data || typeof data.result !== 'string') {
      console.error('Invalid API response structure:', data);
      return NO_RESPONSE_MESSAGE;
    }

    return data.result;
  } catch (error) {
    console.error('Network or parsing error:', error);
    return ERROR_MESSAGE;
  }
}

/**
 * Handle form submission
 * @param {Event} event - The form submit event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const userMessage = userInput.value.trim();

  // Validate input
  if (!userMessage) {
    return;
  }

  // Clear input field
  userInput.value = '';
  userInput.focus();

  // Add user message to chat and history
  addMessageToChat(userMessage, 'user');
  conversationHistory.push({
    role: 'user',
    text: userMessage
  });

  // Add thinking message with temporary ID
  const thinkingId = `thinking-${Date.now()}`;
  addMessageToChat(THINKING_MESSAGE, 'model', thinkingId);

  // Send to API
  const aiResponse = await sendMessageToAPI(userMessage);

  // Update or replace thinking message
  updateMessage(thinkingId, aiResponse);

  // Add AI response to history
  conversationHistory.push({
    role: 'model',
    text: aiResponse
  });
}

/**
 * Initialize the chatbot
 */
function initializeChatbot() {
  chatForm.addEventListener('submit', handleFormSubmit);
  userInput.focus();
}

// Start the chatbot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
  initializeChatbot();
}
