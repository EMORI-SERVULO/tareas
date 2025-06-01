export interface AuthResponse {
    access_token: string;
    user: User;
    accessToken: string;
    refreshToken: string;
    userId: string;
  
}
export interface AuthResponseError {

    error: string;

}

export interface User {
  id: string;
  name: string;
  username: string;
}

export interface AccessTokenResponse {
  statusCode: number;
  body: {
    accessToken: string;
  };
  error?: string;
}