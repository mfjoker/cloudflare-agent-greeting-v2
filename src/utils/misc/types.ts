
export type GroupMember = {
    id: string;
    name: string;
    username: string;
};

export type authenticatedUser = {
    id: string;
    name: string;
    email: string;
    token: string;
    roles: string[];
};

export type recorderData = {
    blobUri: string;
    duration: number;
    language: string;
    saveToAllLanguages: boolean;
    success: boolean;
};