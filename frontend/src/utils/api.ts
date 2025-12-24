export const API_BASE =
  process.env.REACT_APP_API_URL || `${window.location.origin.replace(/\/$/, '')}/api`;

export const getApiUrl = (path: string): string => {
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  return `${API_BASE}/${path}`;
};

// Types for API requests and responses
export interface User {
  id: number;
  keycloak_id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Parent {
  id: number;
  user_id: number;
  age?: number;
  location?: string;
  parenting_style?: string;
  concerns?: string;
  goals?: string;
  experience_level?: string;
  family_structure?: string;
  created_at: string;
  updated_at?: string;
}

export interface Child {
  id: number;
  parent_id: number;
  name: string;
  age: number;
  gender: string;
  hobbies?: string[];
  interests?: string[];
  personality_traits?: string[];
  special_needs?: string;
  school_grade?: string;
  studies?: string[];
  ethnicity?: string;
  height_cm?: number;
  weight_kg?: number;
  favorite_activities?: string[];
  challenges?: string;
  achievements?: string;
  created_at: string;
  updated_at?: string;
}

export interface ChildOptions {
  hobbies: string[];
  interests: string[];
  personality_traits: string[];
  genders: string[];
  school_grades: string[];
}

// API functions
export const api = {
  // User management
  async createUser(userData: {
    keycloak_id: string;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
  }): Promise<User> {
    const response = await fetch(getApiUrl('users'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  async getUser(keycloakId: string): Promise<User> {
    const response = await fetch(getApiUrl(`users/${keycloakId}`));
    if (!response.ok) throw new Error('Failed to get user');
    return response.json();
  },

  // Parent profile management
  async createParentProfile(parentData: {
    age?: number;
    location?: string;
    parenting_style?: string;
    concerns?: string;
    goals?: string;
    experience_level?: string;
    family_structure?: string;
  }, keycloakId: string): Promise<Parent> {
    const response = await fetch(getApiUrl('parents'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...parentData, keycloak_id: keycloakId }),
    });
    if (!response.ok) throw new Error('Failed to create parent profile');
    return response.json();
  },

  async getParentProfile(keycloakId: string): Promise<Parent> {
    const response = await fetch(getApiUrl(`parents/${keycloakId}`));
    if (!response.ok) throw new Error('Failed to get parent profile');
    return response.json();
  },

  // Children management
  async createChild(childData: {
    name: string;
    age: number;
    gender: string;
    hobbies?: string[];
    interests?: string[];
    personality_traits?: string[];
    special_needs?: string;
    school_grade?: string;
    studies?: string[];
    ethnicity?: string;
    height_cm?: number;
    weight_kg?: number;
    favorite_activities?: string[];
    challenges?: string;
    achievements?: string;
  }, keycloakId: string): Promise<Child> {
    const response = await fetch(getApiUrl('children'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...childData, keycloak_id: keycloakId }),
    });
    if (!response.ok) throw new Error('Failed to create child');
    return response.json();
  },

  async getChildren(keycloakId: string): Promise<Child[]> {
    const response = await fetch(getApiUrl(`children/${keycloakId}`));
    if (!response.ok) throw new Error('Failed to get children');
    return response.json();
  },

  async updateChild(childId: number, childData: {
    name: string;
    age: number;
    gender: string;
    hobbies?: string[];
    interests?: string[];
    personality_traits?: string[];
    special_needs?: string;
    school_grade?: string;
    studies?: string[];
    ethnicity?: string;
    height_cm?: number;
    weight_kg?: number;
    favorite_activities?: string[];
    challenges?: string;
    achievements?: string;
  }, keycloakId: string): Promise<Child> {
    const response = await fetch(getApiUrl(`children/${childId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...childData, keycloak_id: keycloakId }),
    });
    if (!response.ok) throw new Error('Failed to update child');
    return response.json();
  },

  async deleteChild(childId: number, keycloakId: string): Promise<void> {
    const response = await fetch(getApiUrl(`children/${childId}`), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keycloak_id: keycloakId }),
    });
    if (!response.ok) throw new Error('Failed to delete child');
  },

  // Options for dropdowns
  async getChildOptions(): Promise<ChildOptions> {
    const response = await fetch(getApiUrl('child-options'));
    if (!response.ok) throw new Error('Failed to get child options');
    return response.json();
  },

  // Chat functionality - using Vercel serverless function as proxy
  async sendChatMessage(message: string, childContext: string[] = []): Promise<{ response: string; timestamp: string }> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, childContext }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to send chat message: ${response.status}`);
    }
    
    return response.json();
  },
}; 