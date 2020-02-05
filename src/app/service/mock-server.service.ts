import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { User } from '../interface/user';
import { ClientDataObj } from '../interface/client-data-obj';
import { DecodedAttestationObj } from '../interface/decoded-attestation-obj';
import * as CBOR from '../utils/cbor'
import { Observable } from 'rxjs';
import sha256, { Hash, HMAC } from "fast-sha256";

@Injectable({
  providedIn: 'root'
})
export class MockServerService {

  constructor(private userservice: UserService) { }

  registerCredential(user: User, credential: PublicKeyCredential, options: PublicKeyCredentialCreationOptions): User {

    const authData = this.getAuthData(credential);

    const credentialIdLength = this.getCredentialIdLength(authData);
    console.log('credentialIdLength : ', credentialIdLength);

    const credentialId = authData.slice(55, 55 + credentialIdLength);
    console.log('credentialId : ', credentialId);

    /** Store publicKeyBytes also in the db */
    const publicKeyBytes: Uint8Array = authData.slice(55 + credentialIdLength);
    console.log('publicKeyBytes : ', publicKeyBytes);

    const publicKeyObject = CBOR.decode(publicKeyBytes.buffer);
    console.log('Public Key Object : ', publicKeyObject);

    /**  REGISTER VALIDATION */
    this.registerValidation(credential, options, authData, publicKeyObject);

    /** if validations pass then only perform below step, else fail */
    user.credentials.push({
      credentialId: credentialId,
      publicKey: publicKeyBytes
    });

    return user;
  }

  registerValidation(cred: PublicKeyCredential, options: PublicKeyCredentialCreationOptions, authData: Uint8Array, publicKeyObject: any) {
    const utf8Decoder = new TextDecoder('utf-8');

    /** Perform validation on clientDataJSON */
    const decodedClientData = utf8Decoder.decode(cred.response.clientDataJSON);
    const C: ClientDataObj = JSON.parse(decodedClientData);
    console.log('Client Data JSON : ', C);

    const decodedAttestationObject: DecodedAttestationObj = CBOR.decode((cred.response as any).attestationObject);

    // 7.
    if (C.type != 'webauthn.create') {
      console.log('Thorw error 7');
    }

    // 8.
    if (atob(C.challenge) != utf8Decoder.decode(options.challenge)) {
      console.log('Throw error 8');
    }

    // 9. RP origin check, is this the right way to do ?
    if (C.origin != window.location.origin) {
      console.log('Throw error 9');
    }

    // 13.
    const rpIdHash = this.getRP_ID_hash(authData);
    const rpId = sha256(Uint8Array.from(options.rp.id, c => c.charCodeAt(0)));
    console.log(rpIdHash); console.log(rpId);
    if (!this.compareUint8Array(rpIdHash, rpId)) {
      console.log('Throw error 13');
    }

    // 14. User Present bit
    const flagBits: Array<String> = this.getFlags(authData);
    if (flagBits[0] != '1') {
      console.log('Throw error 14');
    }

    // 15. User Verified bit
    if (options.authenticatorSelection.userVerification == 'required' && flagBits[2] != '1') {
      console.log('Throw error 15');
    }

    // 16. Check Alg
    const algoList = [];
    options.pubKeyCredParams.forEach(x => algoList.push(x.alg));
    if (options.pubKeyCredParams && !algoList.includes(publicKeyObject[3])) {
      console.log('Throw error 16');
    }

    // 18. TODO : Need to get complete list of valid Formats.
    if (decodedAttestationObject.format && decodedAttestationObject.format != 'tpm') {
      console.log('Throw error 18');
    }

    // 19.
    console.log(decodedAttestationObject.attStmt);

  }

  loginCredential(cred: PublicKeyCredential, options: PublicKeyCredentialRequestOptions) {
    const utf8Decoder = new TextDecoder('utf-8');
    const resp: AuthenticatorAssertionResponse = cred.response as AuthenticatorAssertionResponse;

    /* 'cData' : contains the JSON-serialized client data passed to the authenticator by the client 
     * in order to generate this assertion */
    const cData = resp.clientDataJSON;
    const JSONtext = utf8Decoder.decode(cData);
    const C: ClientDataObj = JSON.parse(JSONtext);
    console.log('Client Data JSON : ', C);

    var authData = new Uint8Array(resp.authenticatorData);
    console.log('Auth Data : ', authData);

    var sig = new Uint8Array(resp.signature);
    console.log('Signature : ', sig);

    /**  LOGIN VALIDATION */
    this.loginValidation(cred, options, C, authData);

  }

  loginValidation(cred: PublicKeyCredential, options: PublicKeyCredentialRequestOptions, C: ClientDataObj, authData: Uint8Array) {
    // https://w3c.github.io/webauthn/#sctn-verifying-assertion
    const utf8Decoder = new TextDecoder('utf-8');

    // 4. : cred.getClientExtensionResults();

    // 5. TODO : cred.id should verify 'public key credential' in allowCrdentials
    if (options.allowCredentials) {
      cred.id
    }

    // 11.
    if (C.type != 'webauthn.get') {
      console.log('Throw error 11');
    }

    // 12. compare challenges sent and received
    if (atob(C.challenge) != utf8Decoder.decode(options.challenge)) {
      console.log('Throw error 12');
    }
    // 13.
    if (C.origin != window.location.origin) {
      console.log('Throw error 13');
    }

    // 14. TODO

    // 15. Verify that the rpIdHash in authData is the SHA-256 hash of the RP ID expected by the Relying Party.
    const rpIdHash = this.getRP_ID_hash(authData);
    const rpId = sha256(Uint8Array.from(window.location.hostname, c => c.charCodeAt(0)));
    console.log(rpIdHash); console.log(rpId);
    if (!this.compareUint8Array(rpIdHash, rpId)) {
      console.log('Throw error 15');
    }

    // 16. User Present Bit
    const flagBits: Array<String> = this.getFlags(authData);
    if (flagBits[0] != '1') {
      console.log('Throw error 16');
    }

    // 17. User Verified Bit
    if (options.userVerification == 'required' && flagBits[2] != '1') {
      console.log('Throw error 17');
    }

    // 20.
    const hash = sha256(new Uint8Array(cred.response.clientDataJSON));
    const sig = (cred.response as AuthenticatorAssertionResponse).signature;
  }


  getAuthData(credential: PublicKeyCredential) {

    /* CBOR : Concise Binary Object Representation */
    const decodedAttestationObject: DecodedAttestationObj = CBOR.decode((credential.response as any).attestationObject);
    console.log('Decoded Attestation Object : ', decodedAttestationObject);

    /* Complete authData explained at https://developer.mozilla.org/en-US/docs/Web/API/AuthenticatorAssertionResponse/authenticatorData  */
    const { authData } = decodedAttestationObject;
    // OR const authData = decodedAttestationObject.authData;
    console.log('Auth Data : ', authData);

    return authData;
  }

  getCredentialIdLength(authData: Uint8Array) {
    const dataView = new DataView(new ArrayBuffer(2));
    console.log('dataView : ', dataView);
    /* 53 and 55 are the bytes count, check authData response structure */
    const idLengthBytes = authData.slice(53, 55);
    console.log('idLengthBytes : ', idLengthBytes);

    idLengthBytes.forEach((value, i) => dataView.setUint8(i, value));
    return dataView.getUint16(0);
  }

  isAuthenticatorAttestationResponse(obj: any): obj is AuthenticatorAttestationResponse {
    return 'AuthenticatorAttestationResponse' in obj;
  }

  isAuthenticatorAssertionResponse(obj: any): obj is AuthenticatorAssertionResponse {
    return 'AuthenticatorAssertionResponse' in obj;
  }

  getRP_ID_hash(authData: Uint8Array) {
    return authData.slice(0, 32);
  }

  getFlags(authData: Uint8Array) {
    const flagByte = authData[32];
    var tmp = '00000000' + flagByte.toString(2);
    const flagBits: Array<String> = tmp.slice(flagByte.toString(2).length).split('').reverse();
    console.log('Flags : ', flagBits);
    return flagBits;
  }

  compareUint8Array(ar1: Uint8Array, ar2: Uint8Array) {
    if (ar1.byteLength != ar2.byteLength)
      return false;

    for (let i = 0; i < ar1.byteLength; i++) {
      if (ar1[i] != ar2[i]) {
        return false;
      }
    }
    return true;
  }

  /** This method returns a Uint8Array of Unicode of the charatcters of the random string 
   *  NOTE: char codes for string characters are their ASCII values
  */
  getChallenge() {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < 25; i++) {
      result += characters.charAt(Math.floor(Math.random() * 62));
    }
    console.log('Random : ', result);
    return Uint8Array.from(result, c => c.charCodeAt(0));
  }

  registerUser(user: User): Observable<User> {
    return this.userservice.registerUser(user);
  }

  getUser(user: User): Observable<User> {
    return this.userservice.getUser(user);
  }

  isUserLoggedIn() {
    if (sessionStorage.getItem('user') == null)
      return false;
    return true;
  }
}
