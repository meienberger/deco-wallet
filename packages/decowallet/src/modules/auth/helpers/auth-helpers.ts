// import { appleAuth } from '@invertase/react-native-apple-authentication';
// import { GoogleSignin, statusCodes } from '@react-native-community/google-signin';
// import { AccessToken, LoginManager } from 'react-native-fbsdk';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';

// GoogleSignin.configure({
//   webClientId: Config.GOOGLE_CLIENT_ID,
// });

const getFacebookToken = async (): Promise<string | null> => {
  const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

  if (result.isCancelled) {
    return Promise.resolve(null);
  }

  const data = await AccessToken.getCurrentAccessToken();

  if (!data) {
    throw new Error('Something went wrong obtaining access token');
  }

  return data.accessToken;
};

const loginFacebook = async (): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const accessToken = await getFacebookToken();
    const facebookCredential = auth.FacebookAuthProvider.credential(accessToken);

    return await auth().signInWithCredential(facebookCredential);
  } catch (error) {
    console.error(error);

    return Promise.reject(error);
  }
};

// const loginGoogle = async (): Promise<FirebaseAuthTypes.UserCredential | void> => {
//   try {
//     await GoogleSignin.hasPlayServices();

//     const userInfo = await GoogleSignin.signIn();

//     const googleCredential = auth.GoogleAuthProvider.credential(userInfo.idToken);

//     return await auth().signInWithCredential(googleCredential);
//   } catch (error) {
//     if (error.code === statusCodes.IN_PROGRESS || error.code === statusCodes.SIGN_IN_CANCELLED) {
//       // operation (e.g. sign in) is in progress already
//       return Promise.resolve();
//     }

//     console.error(error);

//     return Promise.reject(error);
//   }
// };

// const loginApple = async (): Promise<FirebaseAuthTypes.UserCredential | void> => {
//   try {
//     // performs login request
//     const appleAuthRequestResponse = await appleAuth.performRequest({
//       requestedOperation: appleAuth.Operation.LOGIN,
//       requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
//     });

//     const { identityToken, nonce } = appleAuthRequestResponse;
//     const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

//     // user is authenticated
//     return await auth().signInWithCredential(appleCredential);
//   } catch (error) {
//     console.error(error);

//     return Promise.reject(error);
//   }
// };

export { loginFacebook };
