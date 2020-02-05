import { Injectable } from '@angular/core';
import { MockServerService } from './mock-server.service';
import { User } from '../interface/user';

@Injectable({
  providedIn: 'root'
})
export class WebAuthnService {

  constructor(private mockserver: MockServerService) { }

  register(options: PublicKeyCredentialCreationOptions): Promise<CredentialType> {
    return navigator.credentials.create({
      publicKey: options
    });
  }

  login(options: PublicKeyCredentialRequestOptions): Promise<CredentialType> {
    return navigator.credentials.get({
      publicKey: options
    });
  }

  registerOptions(user: User) {
    const rp: PublicKeyCredentialRpEntity = {
      name: 'frontend-fido.s3.amazonaws.com',
      id: window.location.hostname
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
      challenge: this.mockserver.getChallenge(),
      rp: rp,
      user: userX,
      pubKeyCredParams: pubKeyCredParams,
      authenticatorSelection: authenticatorSelection,
      timeout: timeout,
      attestation: attestation,
      extensions: extensions
    };

    console.log('publicKeyCredentialCreationOptions : ', publicKeyCredentialCreationOptions);
    return publicKeyCredentialCreationOptions;
  }

  loginOptions(user: User) {
    const allowCredentials: PublicKeyCredentialDescriptor[] = user.credentials.map(c => {
      console.log('credentials id : ', c.credentialId);
      console.log('public key : ', c.publicKey);
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
    console.log('credentialRequestOptions : ', credentialRequestOptions);
    return credentialRequestOptions;
  }

}
