// Simple Express server to serve the frontend for testing
// Note: This is a workaround for the & symbol issue in the path
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files - note that Next.js has a different structure
app.use(express.static(path.join(__dirname, 'public')));

// Proxy API requests to the backend
app.use('/api', (req, res) => {
  // This would normally forward requests to your backend at http://localhost:8000
  res.status(501).json({
    error: 'API proxy not implemented in test server',
    message: 'Backend should be running at http://localhost:8000',
    requestedPath: req.url
  });
});

// Handle Next.js App Router structure
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Todo App Frontend</title></head>
      <body>
        <div id="root">
          <h1>Todo App Frontend</h1>
          <p>Next.js app structure detected in src/app/</p>
          <p>Pages: <a href="/login">Login</a> | <a href="/register">Register</a> | <a href="/tasks">Tasks</a></p>
          <p>This is a test server. For full functionality, run: npm run dev</p>
          <p style="color:red;">Note: There appears to be an issue with the & symbol in the project path</p>
        </div>
      </body>
    </html>
  `);
});

app.get('/login', (req, res) => {
  res.send('<h1>Login Page</h1><p>Next.js login page would render here. Actual page in src/app/login/page.tsx</p>');
});

app.get('/register', (req, res) => {
  res.send('<h1>Register Page</h1><p>Next.js register page would render here. Actual page in src/app/register/page.tsx</p>');
});

app.get('/tasks', (req, res) => {
  res.send('<h1>Tasks Page</h1><p>Next.js tasks page would render here. Actual page in src/app/tasks/page.tsx</p>');
});

// Catch-all for other routes - using middleware approach
app.use((req, res) => {
  res.status(404).send(`<h1>Page not served by test server</h1><p>Requested: ${req.url}</p><p>Available routes: /, /login, /register, /tasks</p>`);
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Frontend test server running at http://127.0.0.1:${port}`);
  console.log('Note: This is a simplified server for testing frontend components.');
  console.log('The actual Next.js app files are located in src/app/');
});