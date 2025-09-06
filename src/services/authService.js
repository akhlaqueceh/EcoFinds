// Simplified auth service for demo mode (no authentication required)
export const authService = {
  // Default user for demo
  getDefaultUser() {
    return {
      id: 1,
      username: 'Demo User',
      email: 'demo@ecofinds.com',
      createdAt: new Date().toISOString()
    };
  },

  // Get current user (always returns demo user)
  async getCurrentUser() {
    return this.getDefaultUser();
  },

  // Get auth token (returns null for demo mode)
  async getToken() {
    return null;
  },

  // Update user profile (simulated)
  async updateProfile(updates) {
    const user = this.getDefaultUser();
    const updatedUser = { ...user, ...updates };
    return { success: true, user: updatedUser };
  },

  // Logout user (no-op for demo mode)
  async logout() {
    return { success: true };
  },
};
