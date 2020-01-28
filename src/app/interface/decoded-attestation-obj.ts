export interface DecodedAttestationObj {
    attestationStatement: {
        alg: number;
        sig: Uint8Array;
    },
    authData: Uint8Array;
    format: string;
}
