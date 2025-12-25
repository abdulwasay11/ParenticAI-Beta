export const API_BASE =
  process.env.REACT_APP_API_URL || `${window.location.origin.replace(/\/$/, '')}/api`;

export const getApiUrl = (path: string): string => {
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  return `${API_BASE}/${path}`;
};

// Helper to get auth headers
const getAuthHeaders = (token?: string | null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Types for API requests and responses
export interface User {
  id: number;
  firebase_uid: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
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
  parenting_score?: number;
  improvement_areas?: string[];
  strengths?: string[];
  children_count?: number;
  avg_assessment_score?: number;
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
    firebase_uid: string;
    email: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  }, token?: string | null): Promise<User> {
    const response = await fetch(getApiUrl('users'), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create user');
    }
    return response.json();
  },

  async getUser(firebaseUid: string, token?: string | null): Promise<User> {
    const response = await fetch(getApiUrl(`users?firebase_uid=${firebaseUid}`), {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get user');
    }
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
  }, firebaseUid: string, token?: string | null): Promise<Parent> {
    const response = await fetch(getApiUrl('parents'), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ ...parentData, firebase_uid: firebaseUid }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create parent profile');
    }
    return response.json();
  },

  async getParentProfile(firebaseUid: string, token?: string | null): Promise<Parent> {
    const response = await fetch(getApiUrl(`parents?firebase_uid=${firebaseUid}`), {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get parent profile');
    }
    return response.json();
  },

  async updateParentProfile(parentData: {
    age?: number;
    location?: string;
    parenting_style?: string;
    concerns?: string;
    goals?: string;
    experience_level?: string;
    family_structure?: string;
  }, firebaseUid: string, token?: string | null): Promise<Parent> {
    const response = await fetch(getApiUrl('parents'), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ ...parentData, firebase_uid: firebaseUid }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to update parent profile');
    }
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
  }, firebaseUid: string, token?: string | null): Promise<Child> {
    const response = await fetch(getApiUrl('children'), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ ...childData, firebase_uid: firebaseUid }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create child');
    }
    return response.json();
  },

  async getChildren(firebaseUid: string, token?: string | null): Promise<Child[]> {
    const response = await fetch(getApiUrl(`children?firebase_uid=${firebaseUid}`), {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get children');
    }
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
  }, firebaseUid: string, token?: string | null): Promise<Child> {
    const response = await fetch(getApiUrl('children'), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ ...childData, child_id: childId, firebase_uid: firebaseUid }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to update child');
    }
    return response.json();
  },

  async deleteChild(childId: number, firebaseUid: string, token?: string | null): Promise<void> {
    const response = await fetch(getApiUrl('children'), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ child_id: childId, firebase_uid: firebaseUid }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to delete child');
    }
  },

  // Options for dropdowns
  async getChildOptions(): Promise<ChildOptions> {
    const response = await fetch(getApiUrl('child-options'));
    if (!response.ok) throw new Error('Failed to get child options');
    return response.json();
  },

  // Personality Assessment
  async createPersonalityAssessment(assessmentData: {
    child_id: number;
    image_url?: string;
    quiz_data?: any;
    ai_analysis?: any;
    traits?: string[];
    recommendations?: string[];
    confidence_score?: number;
  }, firebaseUid: string, token?: string | null): Promise<any> {
    const response = await fetch(getApiUrl('personality-assessment'), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ ...assessmentData, firebase_uid: firebaseUid }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create personality assessment');
    }
    return response.json();
  },

  async getPersonalityAssessments(firebaseUid: string, childId?: number, token?: string | null): Promise<any[]> {
    const url = childId 
      ? getApiUrl(`personality-assessment?firebase_uid=${firebaseUid}&child_id=${childId}`)
      : getApiUrl(`personality-assessment?firebase_uid=${firebaseUid}`);
    const response = await fetch(url, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get personality assessments');
    }
    return response.json();
  },

  // Parent Tracking
  async recordParentActivity(activityData: {
    interactions_count?: number;
    questions_asked?: number;
    advice_followed?: number;
    improvement_notes?: string;
  }, firebaseUid: string, token?: string | null): Promise<any> {
    const response = await fetch(getApiUrl('parent-tracking'), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ ...activityData, firebase_uid: firebaseUid }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to record parent activity');
    }
    return response.json();
  },

  async getParentTracking(firebaseUid: string, days?: number, token?: string | null): Promise<any> {
    const url = days
      ? getApiUrl(`parent-tracking?firebase_uid=${firebaseUid}&days=${days}`)
      : getApiUrl(`parent-tracking?firebase_uid=${firebaseUid}`);
    const response = await fetch(url, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get parent tracking');
    }
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