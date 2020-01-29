import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { User } from '../interface/user';
import { ClientDataObj } from '../interface/client-data-obj';
import { DecodedAttestationObj } from '../interface/decoded-attestation-obj';
import * as CBOR from '../utils/cbor'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockServerService {

  constructor(private userservice: UserService) { }

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

  registerCredential(user: User, credential: PublicKeyCredential): User {
    const authData = this.getAuthData(credential);

    const credentialIdLength = this.getCredentialIdLength(authData);
    console.log('credentialIdLength : ', credentialIdLength);

    const credentialId = authData.slice(55, 55 + credentialIdLength);
    console.log('credentialId : ', credentialId);

    const publicKeyBytes: Uint8Array = authData.slice(55 + credentialIdLength);
    console.log('publicKeyBytes : ', publicKeyBytes);

    const publicKeyObject = CBOR.decode(publicKeyBytes.buffer);
    console.log('Public Key Object : ', publicKeyObject);

    const valid = true;
    if (valid) {
      user.credentials.push({
        credentialId: credentialId,
        publicKey: publicKeyBytes
      });
      //this.updateUser(user);
    }
    return user;
  }

  getAuthData(credential: PublicKeyCredential) {
    const utf8Decoder = new TextDecoder('utf-8');
    const decodedClientData = utf8Decoder.decode(credential.response.clientDataJSON);

    const clientDataObj: ClientDataObj = JSON.parse(decodedClientData);
    console.log('Client Data Object : ', clientDataObj);

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


  registerUser(user: User): Observable<User> {
    //user.id = '' + Math.floor(Math.random() * 10000000);
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
  // getUser(username: string) {
  //   return this.userservice.getUser(username);
  // }

  // getUsers() {
  //   return this.userservice.getUsers();
  // }

  // addUser(user: User) {
  //   user.id = '' + Math.floor(Math.random() * 10000000);
  //   this.userservice.addUser(user);
  //   return user;
  // }

  // updateUser(user: User) {
  //   this.removeUser(user.username);
  //   this.addUser(user);
  // }

  // removeUser(username: string) {
  //   return this.userservice.removeUser(username);
  // }

}
