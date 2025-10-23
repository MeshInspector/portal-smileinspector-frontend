import {Amplify, type ResourcesConfig} from "aws-amplify"
import {cognitoUserPoolsTokenProvider} from "aws-amplify/auth/cognito";
import {CookieStorage} from 'aws-amplify/utils';

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
const userPoolClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID
const upperDomain = import.meta.env.VITE_UPPER_DOMAIN_NAME
const authConfig: ResourcesConfig['Auth'] = {
    Cognito: {
        userPoolId: userPoolId,
        userPoolClientId: userPoolClientId,
    }
};

Amplify.configure({
    Auth: authConfig
});

cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage({
  domain: `.${upperDomain}`,
  path: '/',
  expires: 30,
  secure: true,
  sameSite: 'lax',
}));


