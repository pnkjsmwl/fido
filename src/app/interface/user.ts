export interface User {
    id?: string;
    username: string;
    credentials: Credential[];
}

export interface Credential {
    credentialId: Uint8Array;
    publicKey: Uint8Array;
}
