import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    // 1. Exchange 'code' for an access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
        console.error('GitHub token exchange failed:', tokenData);
        return NextResponse.redirect(new URL('/login?error=token_failed', request.url));
    }

    // 2. Fetch User Profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    const userData = await userResponse.json();

    // 3. Encode the profile data to pass to the frontend Zustand store
    const userPayload = {
      email: userData.email || `${userData.login}@github.com`,
      name: userData.name || userData.login,
      picture: userData.avatar_url || ''
    };

    const payloadString = Buffer.from(JSON.stringify(userPayload)).toString('base64');
    
    // Redirect back to the homepage where the client will catch the query param
    const redirectUrl = new URL(`/?github_auth=${payloadString}&access_token=${accessToken}`, request.url);

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('GitHub OAuth Error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}
