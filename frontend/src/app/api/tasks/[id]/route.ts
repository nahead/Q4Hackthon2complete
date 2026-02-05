import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('Single Task GET proxy called', params);
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

    // Get the auth token from headers
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers.authorization = authHeader;
    }

    // Extract user ID from the URL if present (format would be /api/:userId/tasks/:taskId)
    // The params.id here would be the taskId from the URL pattern /api/tasks/[id]
    // For the new user-specific pattern, we would need a different route structure
    // This route handles the legacy /api/tasks/:id pattern
    const response = await fetch(`${backendUrl}/api/tasks/${params.id}`, {
      method: 'GET',
      headers,
    });

    // Handle response based on content type
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON responses (like plain text errors)
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        // If it's not valid JSON, return as error message
        data = { detail: text || 'Unknown error occurred' };
      }
    }

    console.log('Backend response:', response.status, data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('Single Task PUT proxy called', params);
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

    // Get the auth token from headers
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers.authorization = authHeader;
    }

    // Get the request body
    const body = await request.json();

    // This route handles the legacy /api/tasks/:id pattern
    const response = await fetch(`${backendUrl}/api/tasks/${params.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    // Handle response based on content type
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON responses (like plain text errors)
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        // If it's not valid JSON, return as error message
        data = { detail: text || 'Unknown error occurred' };
      }
    }

    console.log('Backend response:', response.status, data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('Single Task DELETE proxy called', params);
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

    // Get the auth token from headers
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {};

    if (authHeader) {
      headers.authorization = authHeader;
    }

    // This route handles the legacy /api/tasks/:id pattern
    const response = await fetch(`${backendUrl}/api/tasks/${params.id}`, {
      method: 'DELETE',
      headers,
    });

    // Handle response based on content type
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON responses (like plain text errors)
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        // If it's not valid JSON, return as error message
        data = { detail: text || 'Unknown error occurred' };
      }
    }

    console.log('Backend response:', response.status, data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}