import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  try {
    console.log('Proxy: POST request received', {
      params,
      url: request.url,
      backendUrl: process.env.NEXT_PUBLIC_API_BASE_URL
    });

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

    // Extract the path from the URL - this route handles /api/auth/[...slug]
    // So if the frontend receives /api/auth/register, params.slug would be ['register']
    // We need to reconstruct the full backend path as /auth/register
    const path = params.slug.join('/');
    const backendPath = `auth/${path}`;

    console.log('Proxy: Constructed backend URL', `${backendUrl}/${backendPath}`);

    // Get the request body
    const body = await request.json();

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/${backendPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Proxy: Backend response status', response.status);

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  try {
    console.log('Proxy: GET request received', {
      params,
      url: request.url,
      backendUrl: process.env.NEXT_PUBLIC_API_BASE_URL
    });

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

    // Extract the path from the URL - this route handles /api/auth/[...slug]
    // So if the frontend receives /api/auth/me, params.slug would be ['me']
    // We need to reconstruct the full backend path as /auth/me
    const path = params.slug.join('/');
    const backendPath = `auth/${path}`;

    console.log('Proxy: Constructed backend URL', `${backendUrl}/${backendPath}`);

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/${backendPath}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Proxy: Backend response status', response.status);

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}