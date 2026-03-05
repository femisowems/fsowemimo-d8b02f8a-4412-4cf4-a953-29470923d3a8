export type Theme = 'light' | 'dark' | 'system';

export interface SettingsProfile {
  email: string;
  role: string;
  name: string;
}

export interface SettingsOrganization {
  id: string;
}

export interface SettingsSecurity {
  mfaEnabled: boolean;
  sessionTimeout: number;
}

export interface SettingsPreferences {
  theme: Theme;
  defaultView: 'kanban' | 'list';
  itemsPerPage: number;
}

export interface UserSettings {
  profile: SettingsProfile;
  organization: SettingsOrganization;
  security: SettingsSecurity;
  preferences: SettingsPreferences;
}
