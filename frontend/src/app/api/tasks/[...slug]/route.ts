import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  try {
    console.log('Catch-all Task GET proxy called', params);
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

    // Get the auth token from headers
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers.authorization = authHeader;
    }

    // Extract potential user ID from slug
    let userId;

    // Check if the slug has the format [userId, "tasks"] or [userId, "tasks", taskId]
    if (params.slug && params.slug.length >= 2 && params.slug[1] === "tasks") {
      // Format: userId/tasks or userId/tasks/taskId
      userId = params.slug[0];

      // If there's a third element, it's a specific task ID
      if (params.slug.length >= 3) {
        const taskId = params.slug[2];

        // Verify task ID is a valid number
        if (!isNaN(Number(taskId)) && Number.isInteger(Number(taskId)) && Number(taskId) > 0) {
          console.log('Single Task GET proxy called for ID:', taskId, 'with user ID:', userId);

          // Construct the backend URL for specific task (no extra query parameters needed)
          const apiUrl = `${backendUrl}/api/${userId}/tasks/${taskId}`;

          // Forward the request to the backend
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers,
          });

          const data = await response.json();

          console.log('Backend response:', response.status, data);

          return NextResponse.json(data, { status: response.status });
        }
      } else {
        // Format is userId/tasks - get all tasks for user
        console.log('All Tasks GET proxy called for user ID:', userId);

        // Construct the backend URL for all tasks (no extra query parameters needed)
        const apiUrl = `${backendUrl}/api/${userId}/tasks`;

        // Forward the request to the backend
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers,
        });

        const data = await response.json();

        console.log('Backend response:', response.status, data);

        return NextResponse.json(data, { status: response.status });
      }
    }

    // Fallback for legacy format (just taskId)
    if (params.slug && params.slug.length === 1) {
      const taskId = params.slug[0];

      // Verify task ID is a valid number
      if (!isNaN(Number(taskId)) && Number.isInteger(Number(taskId)) && Number(taskId) > 0) {
        console.log('Legacy Single Task GET proxy called for ID:', taskId);

        // Construct the backend URL for specific task (legacy)
        const apiUrl = `${backendUrl}/api/tasks/${taskId}`;

        // Forward the request to the backend
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers,
        });

        const data = await response.json();

        console.log('Backend response:', response.status, data);

        return NextResponse.json(data, { status: response.status });
      }
    }

    return NextResponse.json({ error: 'Invalid URL format or task ID not found' }, { status: 404 });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  try {
    console.log('Catch-all Task POST proxy called', params);
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

    // Get the auth token from headers
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers.authorization = authHeader;
    }

    // Extract potential user ID from slug
    let userId;

    // Check if the slug has the format [userId, "tasks"]
    if (params.slug && params.slug.length >= 2 && params.slug[1] === "tasks") {
      // Format: userId/tasks
      userId = params.slug[0];
    }

    console.log('Task POST proxy called with user ID:', userId);

    // Get the request body
    const body = await request.json();

    // Construct the backend URL based on whether user ID is provided
    // No extra query parameters needed
    const apiUrl = userId ?
      `${backendUrl}/api/${userId}/tasks` :
      `${backendUrl}/api/tasks`;

    // Forward the request to the backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log('Backend response:', response.status, data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string[] } }) {
  try {
    console.log('Catch-all Task PUT proxy called', params);
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

    // Get the auth token from headers
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers.authorization = authHeader;
    }

    // Extract potential user ID from slug
    if (params.slug && params.slug.length >= 2) {
      const userId = params.slug[0];
      const resourceType = params.slug[1];

      if (resourceType === "tasks" && params.slug.length >= 3) {
        // Format: userId/tasks/taskId - update specific task
        const taskId = params.slug[2];

        // Verify task ID is a valid number
        if (!isNaN(Number(taskId)) && Number.isInteger(Number(taskId)) && Number(taskId) > 0) {
          console.log('Single Task PUT proxy called for ID:', taskId, 'with user ID:', userId);

          // Get the request body
          const body = await request.json();

          // Construct the backend URL for specific task (no extra query parameters needed)
          const apiUrl = `${backendUrl}/api/${userId}/tasks/${taskId}`;

          // Forward the request to the backend
          const response = await fetch(apiUrl, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
          });

          const data = await response.json();

          console.log('Backend response:', response.status, data);

          return NextResponse.json(data, { status: response.status });
        }
      }
    }

    // Fallback for legacy format (just taskId)
    if (params.slug && params.slug.length === 1) {
      const taskId = params.slug[0];

      // Verify task ID is a valid number
      if (!isNaN(Number(taskId)) && Number.isInteger(Number(taskId)) && Number(taskId) > 0) {
        console.log('Legacy Single Task PUT proxy called for ID:', taskId);

        // Get the request body
        const body = await request.json();

        // Construct the backend URL for specific task (legacy)
        const apiUrl = `${backendUrl}/api/tasks/${taskId}`;

        // Forward the request to the backend
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        });

        const data = await response.json();

        console.log('Backend response:', response.status, data);

        return NextResponse.json(data, { status: response.status });
      }
    }

    return NextResponse.json({ error: 'Invalid URL format or task ID not found' }, { status: 404 });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string[] } }) {
  try {
    console.log('Catch-all Task DELETE proxy called', params);
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

    // Get the auth token from headers
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {};

    if (authHeader) {
      headers.authorization = authHeader;
    }

    // Extract potential user ID from slug
    if (params.slug && params.slug.length >= 2) {
      const userId = params.slug[0];
      const resourceType = params.slug[1];

      if (resourceType === "tasks" && params.slug.length >= 3) {
        // Format: userId/tasks/taskId - delete specific task
        const taskId = params.slug[2];

        // Verify task ID is a valid number
        if (!isNaN(Number(taskId)) && Number.isInteger(Number(taskId)) && Number(taskId) > 0) {
          console.log('Single Task DELETE proxy called for ID:', taskId, 'with user ID:', userId);

          // Construct the backend URL for specific task (no extra query parameters needed)
          const apiUrl = `${backendUrl}/api/${userId}/tasks/${taskId}`;

          // Forward the request to the backend
          const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers,
          });

          const data = await response.json();

          console.log('Backend response:', response.status, data);

          return NextResponse.json(data, { status: response.status });
        }
      }
    }

    // Fallback for legacy format (just taskId)
    if (params.slug && params.slug.length === 1) {
      const taskId = params.slug[0];

      // Verify task ID is a valid number
      if (!isNaN(Number(taskId)) && Number.isInteger(Number(taskId)) && Number(taskId) > 0) {
        console.log('Legacy Single Task DELETE proxy called for ID:', taskId);

        // Construct the backend URL for specific task (legacy)
        const apiUrl = `${backendUrl}/api/tasks/${taskId}`;

        // Forward the request to the backend
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers,
        });

        const data = await response.json();

        console.log('Backend response:', response.status, data);

        return NextResponse.json(data, { status: response.status });
      }
    }

    return NextResponse.json({ error: 'Invalid URL format or task ID not found' }, { status: 404 });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}