export interface CognitoUser {
    given_name: string
    family_name: string
    email: string
}

export const renderUser = (user: CognitoUser) =>
    `${user.email}${user.given_name && user.family_name ? ` (${user.given_name} ${user.family_name})` : ""}`