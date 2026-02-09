import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { user_id: string } }) {
  try {
    console.log('Chat history proxy called for user:', params.user_id);
    const backendUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

    // Get the auth token from headers
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers.authorization = authHeader;
    }

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/api/chat/${params.user_id}/history`, {
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

export async function POST(request: NextRequest, { params }: { params: { user_id: string } }) {
  try {
    console.log('Chat proxy called for user:', params.user_id);
    const backendUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

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

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/api/chat/${params.user_id}`, {
      method: 'POST',
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