/**
 * Simple session store to track the latest active session ID for each user.
 * In a production environment, this should be replaced with a persistent 
 * store like Redis or a database table.
 */

// Use a global variable to persist the store across module reloads in development
const globalForSessions = global;

if (!globalForSessions.sessionStore) {
  globalForSessions.sessionStore = new Map();
}

const sessionStore = {
  /**
   * Sets the active session ID for a user.
   * @param {string} email - The user's email address.
   * @param {string} sessionId - The unique session identifier.
   */
  setActiveSession: (email, sessionId) => {
    const sanitizedEmail = email.toLowerCase().trim();
    globalForSessions.sessionStore.set(sanitizedEmail, sessionId);
    console.log(`[SECURITY] Session updated for ${sanitizedEmail}: ${sessionId}`);
  },

  /**
   * Gets the current active session ID for a user.
   * @param {string} email - The user's email address.
   * @returns {string|null} - The session ID or null if not found.
   */
  getActiveSession: (email) => {
    const sanitizedEmail = email.toLowerCase().trim();
    return globalForSessions.sessionStore.get(sanitizedEmail) || null;
  },

  /**
   * Invalidates a user's session.
   * @param {string} email - The user's email address.
   */
  invalidateSession: (email) => {
    const sanitizedEmail = email.toLowerCase().trim();
    globalForSessions.sessionStore.delete(sanitizedEmail);
    console.log(`[SECURITY] Session invalidated for ${sanitizedEmail}`);
  }
};

export default sessionStore;
