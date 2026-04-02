import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Fetch user repositories from GitHub
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100&type=all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'StruktAI-App'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: 'Failed to fetch repositories', details: errorData },
        { status: response.status }
      )
    }

    const repos = await response.json()
    return NextResponse.json(repos)
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}