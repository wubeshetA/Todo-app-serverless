import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// ** DONE
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://wube-fsnd.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  
  /* 
*Here are the steps for validating the JWT:*

  Retrieve the JWKS and filter for potential signature verification keys.
  Extract the JWT from the request's authorization header.
  Decode the JWT and grab the kid property from the header.
  Find the signature verification key in the filtered JWKS with a matching kid property.
  Using the x5c property build a certificate which will be used to verify the JWT signature.
  Ensure the JWT contains the expected audience, issuer, expiration, etc.
  */


 const response = await Axios.get(jwksUrl)
 const keys = response.data.keys
 const signingKeys = keys.find(key => key.kid == jwt.header.kid)
 logger.info('signingKeys', signingKeys)
  if (!signingKeys) {
    throw new Error('The JWKS endpoint did not contain any keys')
  }

  // build certificate
  const pemData = signingKeys.x5c[0]
  const pem = `-----BEGIN CERTIFICATE-----\n${pemData}\n-----END CERTIFICATE-----`

  // verify token
  // Ensure the JWT contains the expected audience, issuer, expiration, etc.
  const verifiedToken = verify(token, pem, { algorithms: ['RS256'] }) as JwtPayload
  logger.info('verifiedToken', verifiedToken)
  return verifiedToken


  // return undefined
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
