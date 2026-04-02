import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { repoFullName, action } = await request.json()
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    switch (action) {
      case 'analyze': {
        // Analyze repository for 3D modeling potential
        const [owner, repo] = repoFullName.split('/')

        // Fetch repository contents
        const contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'StruktAI-App'
          }
        })

        if (!contentsResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch repository contents' }, { status: 400 })
        }

        const contents = await contentsResponse.json()

        // Analyze for 3D modeling files
        const analysis = {
          repoName: repo,
          owner,
          has3DFiles: false,
          hasFloorplans: false,
          hasBlueprints: false,
          fileTypes: [] as string[],
          recommendations: [] as string[]
        }

        const fileExtensions = contents
          .filter((item: { type: string; name: string }) => item.type === 'file')
          .map((item: { type: string; name: string }) => item.name.split('.').pop()?.toLowerCase())
          .filter(Boolean) as string[]

        analysis.fileTypes = [...new Set(fileExtensions)]

        // Check for 3D modeling files
        const modelExtensions = ['obj', 'fbx', 'dae', '3ds', 'blend', 'gltf', 'glb', 'stl']
        analysis.has3DFiles = fileExtensions.some((ext: string) => modelExtensions.includes(ext))

        // Check for floorplan/blueprint files
        const blueprintExtensions = ['pdf', 'dwg', 'dxf', 'png', 'jpg', 'jpeg', 'svg']
        analysis.hasFloorplans = fileExtensions.some((ext: string) => blueprintExtensions.includes(ext))

        // Generate recommendations
        if (analysis.has3DFiles) {
          analysis.recommendations.push('Repository contains 3D model files that can be processed')
        }
        if (analysis.hasFloorplans) {
          analysis.recommendations.push('Repository contains potential floorplan images that can be analyzed')
        }
        if (!analysis.has3DFiles && !analysis.hasFloorplans) {
          analysis.recommendations.push('No obvious 3D modeling or floorplan files detected')
        }

        return NextResponse.json(analysis)
      }

      case 'import': {
        // Import repository data for processing
        const [owner, repo] = repoFullName.split('/')

        // Fetch repository information
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'StruktAI-App'
          }
        })

        if (!repoResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch repository information' }, { status: 400 })
        }

        const repoData = await repoResponse.json()

        // Create import job (this would typically be stored in a database)
        const importJob = {
          id: `import_${Date.now()}`,
          repoFullName,
          status: 'queued',
          createdAt: new Date().toISOString(),
          repoData: {
            name: repoData.name,
            description: repoData.description,
            language: repoData.language,
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            size: repoData.size
          }
        }

        return NextResponse.json({
          success: true,
          importJob,
          message: `Import job created for ${repoFullName}`
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('GitHub action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}