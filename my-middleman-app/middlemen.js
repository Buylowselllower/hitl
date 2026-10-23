const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static HTML files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// In-memory request queue
const tasks = {};

// --- USER ENDPOINTS ---
app.post('/api/request', (req, res) => {
  const requestId = 'REQ_' + Math.floor(1000 + Math.random() * 9000);
  const userInput = req.body.color || 'No input';

  tasks[requestId] = {
    id: requestId,
    input: userInput,
    status: 'PENDING',
    link: null
  };

  console.log(`[New Request] ${requestId} received: "${userInput}"`);
  res.json({ success: true, requestId });
});

app.get('/api/status/:id', (req, res) => {
  const task = tasks[req.params.id];
  if (!task) return res.status(404).json({ error: 'Request not found' });
  
  res.json({ status: task.status, link: task.link });
});

// --- OPERATOR ENDPOINTS ---
app.get('/api/admin/tasks', (req, res) => {
  const pending = Object.values(tasks).filter(t => t.status === 'PENDING');
  res.json(pending);
});

app.post('/api/admin/fulfill', (req, res) => {
  const { requestId, generatedLink } = req.body;

  if (tasks[requestId]) {
    tasks[requestId].status = 'COMPLETED';
    tasks[requestId].link = generatedLink;
    console.log(`[Fulfilled] Request ${requestId} sent link: ${generatedLink}`);
    return res.json({ success: true });
  }

  res.status(400).json({ error: 'Invalid request ID' });
});

// Route for the admin dashboard: /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Render dynamic port assignment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Middleman running on port ${PORT}`);
});