import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Login proxy called');
    const backendUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

    // Get the request body
    const body = await request.json();

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Get response text first to handle any kind of response
    const responseText = await response.text();

    let data;
    try {
      // Try to parse as JSON
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      // If not valid JSON, return as detail
      data = { detail: responseText || `Backend responded with status ${response.status}` };
    }

    console.log('Backend response:', response.status, data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}