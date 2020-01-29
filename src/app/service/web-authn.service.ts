import { Injectable } from '@angular/core';
import { MockServerService } from './mock-server.service';
import { User } from '../interface/user';

@Injectable({
  providedIn: 'root'
})
export class WebAuthnService {

  constructor(private mockserver: MockServerService) { }

  webAuthn_register(user: User): Promise<CredentialType> {

    const challenge: BufferSource = this.mockserver.getChallenge();
    const rp: PublicKeyCredentialRpEntity = {
      name: 'frontend-fido.s3.amazonaws.com'
    };
    const userX: PublicKeyCredentialUserEntity = {
      id: Uint8Array.from(user.id, c => c.charCodeAt(0)),
      name: user.username,
      displayName: user.username
    };
    const pubKeyCredParams: PublicKeyCredentialParameters[] =
      [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -35 },
        { type: 'public-key', alg: -36 },
        { type: 'public-key', alg: -257 },
        { type: 'public-key', alg: -258 },
        { type: 'public-key', alg: -259 },
        { type: 'public-key', alg: -37 },
        { type: 'public-key', alg: -38 },
        { type: 'public-key', alg: -39 },
        { type: 'public-key', alg: -8 }
      ];
    const authenticatorSelection: AuthenticatorSelectionCriteria = {
      userVerification: 'required',
      authenticatorAttachment: 'platform'
    }

    const timeout: number = 60000;
    /* Valid values for attestation : "none" | "indirect" | "direct" */
    const attestation = "direct"
    const extensions: AuthenticationExtensionsClientInputs = {

    }

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: challenge,
      rp: rp,
      user: userX,
      pubKeyCredParams: pubKeyCredParams,
      authenticatorSelection: authenticatorSelection,
      timeout: timeout,
      attestation: attestation,
      extensions: extensions
    };

    console.log('publicKeyCredentialCreationOptions : ', publicKeyCredentialCreationOptions);
    return navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    });

  }

  webAuthn_login(user: User): Promise<CredentialType> {
    const allowCredentials: PublicKeyCredentialDescriptor[] = user.credentials.map(c => {
      console.log('credentials id : ', c.credentialId);
      return {
        type: 'public-key',
        id: Uint8Array.from(Object.values(c.credentialId)),
        transports: Array.from(["internal"])
      };
    });

    console.log('Allow Credentials : ', allowCredentials);

    const credentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge: this.mockserver.getChallenge(),
      allowCredentials: allowCredentials,
      userVerification: "required"
    };

    return navigator.credentials.get({
      publicKey: credentialRequestOptions
    });
  }
}
