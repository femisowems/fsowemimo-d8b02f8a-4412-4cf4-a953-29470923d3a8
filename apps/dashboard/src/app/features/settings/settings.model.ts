export interface SettingsProfile {
    email: string;
    role: string;
    name?: string;
}

export interface SettingsOrganization {
    id: string;
}

export interface SettingsSecurity {
    mfaEnabled: boolean;
    sessionTimeout: number; // minutes
}

export interface SettingsPreferences {
    theme: 'light' | 'dark' | 'system';
    defaultView: 'kanban' | 'list';
    itemsPerPage: number;
}

export interface UserSettings {
    profile: SettingsProfile;
    organization: SettingsOrganization;
    security: SettingsSecurity;
    preferences: SettingsPreferences;
}

export type SettingsTab = 'profile' | 'organization' | 'security' | 'preferences';
