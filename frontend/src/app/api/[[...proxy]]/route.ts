import { NextRequest, NextResponse } from 'next/server';

// Proxy handler for API requests
async function proxyApiRequest(request: NextRequest, path: string) {
  try {
    const backendUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

    // Check if the path matches the user-specific tasks pattern (e.g., "13/tasks", "13/tasks/5", etc.)
    // If so, we need to add the url_user_id query parameter for the backend
    const userTasksMatch = /^(\d+)\/tasks/.exec(path);
    let fullUrl;

    // For all paths, use the original construction without adding extra query parameters
    // The backend handles path parameters correctly without needing query parameters
    fullUrl = `${backendUrl}/api/${path}`;

    // Get request method
    const method = request.method;

    // Get request body if it exists
    let body = null;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.json();
      } catch (e) {
        // If parsing JSON fails, continue without body
      }
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if present (try both cases to handle potential variations)
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Make the request to the backend
    console.log(`Forwarding request to: ${fullUrl}`);
    console.log(`Headers: ${JSON.stringify(headers)}`);

    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(`Response status: ${response.status}`);

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

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

// Handle POST requests to /api/*
export async function POST(request: NextRequest) {
  // Get the full URL pathname and extract the path after /api
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');

  // Proxy all API requests that start with 'auth', 'tasks', 'chat', or match the pattern {userId}/chat, {userId}/tasks, or {userId}/tasks/{taskId}
  if (path.startsWith('auth/') ||
      path.startsWith('tasks/') ||
      /^\d+\/tasks/.test(path) ||
      path.includes('chat') ||
      /^\d+\/chat/.test(path) ||
      /^\d+\/tasks\/\d+/.test(path)) {  // Match {userId}/tasks/{taskId} pattern
    return proxyApiRequest(request, path);
  }

  // Otherwise return 404 for non-API routes
  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

// Handle GET requests to /api/*
export async function GET(request: NextRequest) {
  // Get the full URL pathname and extract the path after /api
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');

  // Proxy all API requests that start with 'auth', 'tasks', 'chat', or match the pattern {userId}/chat, {userId}/tasks, or {userId}/tasks/{taskId}
  if (path.startsWith('auth/') ||
      path.startsWith('tasks/') ||
      /^\d+\/tasks/.test(path) ||
      path.includes('chat') ||
      /^\d+\/chat/.test(path) ||
      /^\d+\/tasks\/\d+/.test(path)) {  // Match {userId}/tasks/{taskId} pattern
    return proxyApiRequest(request, path);
  }

  // Otherwise return 404 for non-API routes
  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

// Handle PUT requests to /api/*
export async function PUT(request: NextRequest) {
  // Get the full URL pathname and extract the path after /api
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');

  // Proxy all API requests that start with 'auth', 'tasks', 'chat', or match the pattern {userId}/chat, {userId}/tasks, or {userId}/tasks/{taskId}
  if (path.startsWith('auth/') ||
      path.startsWith('tasks/') ||
      /^\d+\/tasks/.test(path) ||
      path.includes('chat') ||
      /^\d+\/chat/.test(path) ||
      /^\d+\/tasks\/\d+/.test(path)) {  // Match {userId}/tasks/{taskId} pattern
    return proxyApiRequest(request, path);
  }

  // Otherwise return 404 for non-API routes
  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

// Handle DELETE requests to /api/*
export async function DELETE(request: NextRequest) {
  // Get the full URL pathname and extract the path after /api
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');

  // Proxy all API requests that start with 'auth', 'tasks', 'chat', or match the pattern {userId}/chat, {userId}/tasks, or {userId}/tasks/{taskId}
  if (path.startsWith('auth/') ||
      path.startsWith('tasks/') ||
      /^\d+\/tasks/.test(path) ||
      path.includes('chat') ||
      /^\d+\/chat/.test(path) ||
      /^\d+\/tasks\/\d+/.test(path)) {  // Match {userId}/tasks/{taskId} pattern
    return proxyApiRequest(request, path);
  }

  // Otherwise return 404 for non-API routes
  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}