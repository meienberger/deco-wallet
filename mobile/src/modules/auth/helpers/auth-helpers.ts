import { appleAuth } from '@invertase/react-native-apple-authentication';
import { GoogleSignin, statusCodes, NativeModuleError } from '@react-native-google-signin/google-signin';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';

GoogleSignin.configure({
  // Config.GOOGLE_CLIENT_ID,
  webClientId: '118242716459699252078',
});

enum AppleError {
  UNKNOWN = '1000',
  CANCELED = '1001',
  INVALID_RESPONSE = '1002',
  NOT_HANDLED = '1003',
  FAILED = '1004',
}

interface ErrnoException extends Error {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
}

type AuthResult = { credentials?: FirebaseAuthTypes.UserCredential; error?: unknown };

function instanceOfGoogleError(object: any): object is NativeModuleError {
  return 'code' in object;
}

function instanceOfNodeError(object: any): object is ErrnoException {
  return 'code' in object;
}

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

const loginFacebook = async (): Promise<AuthResult> => {
  try {
    const accessToken = await getFacebookToken();

    if (accessToken) {
      const facebookCredential = auth.FacebookAuthProvider.credential(accessToken);

      const credentials = await auth().signInWithCredential(facebookCredential);

      return { credentials };
    }

    // user cancelled
    return {};
  } catch (error) {
    console.error(error);

    return { error };
  }
};

const loginGoogle = async (): Promise<AuthResult> => {
  try {
    await GoogleSignin.hasPlayServices();

    const userInfo = await GoogleSignin.signIn();

    const googleCredential = auth.GoogleAuthProvider.credential(userInfo.idToken);

    const credentials = await auth().signInWithCredential(googleCredential);

    return { credentials };
  } catch (error) {
    console.error(error);

    if (instanceOfGoogleError(error) && (error.code === statusCodes.IN_PROGRESS || error.code === statusCodes.SIGN_IN_CANCELLED)) {
      // operation (e.g. sign in) is in progress already or user cancelled
      return {};
    }

    return { error };
  }
};

const loginApple = async (): Promise<AuthResult> => {
  try {
    // performs login request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    const { identityToken, nonce } = appleAuthRequestResponse;
    const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

    // user is authenticated
    const credentials = await auth().signInWithCredential(appleCredential);

    return { credentials };
  } catch (error) {
    if (instanceOfNodeError(error) && (error.code === AppleError.CANCELED || error.code === AppleError.UNKNOWN)) {
      // user pressed "cancel"
      return {};
    }

    return { error };
  }
};

export { loginFacebook, loginGoogle, loginApple, AuthResult };
