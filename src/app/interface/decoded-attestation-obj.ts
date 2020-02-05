export interface DecodedAttestationObj {
    attStmt: {
        alg: number;
        sig: Uint8Array;
    },
    authData: Uint8Array;
    format: string;
}