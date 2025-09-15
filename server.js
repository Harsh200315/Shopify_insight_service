const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Xeno FDE Internship Backend');
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// Onboard tenant
app.post('/onboard-tenant', async (req, res) => {
  const { name, shopifyUrl, apiKey } = req.body;
  try {
    const tenant = await prisma.tenant.create({
       data: { name, shopifyUrl, apiKey }
    });
    res.json(tenant);
  } catch (error) {
    console.error('Error onboarding tenant:', error);
    res.status(500).json({ error: 'Failed to onboard tenant' });
  }
});

// Get insights for tenant
app.get('/insights/:tenantId', async (req, res) => {
  const { tenantId } = req.params;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  try {
    jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);

    const customers = await prisma.customer.count({ where: { tenantId } });
    const orders = await prisma.order.findMany({ where: { tenantId } });
    const revenue = orders.reduce((sum, o) => sum + o.amount, 0);

    res.json({ customers, orders, revenue });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Webhook to ingest orders
app.post('/webhook/order', async (req, res) => {
  const tenantId = req.headers['tenantid'];
  const data = req.body;

  if (!tenantId) {
    return res.status(400).json({ error: 'Missing tenant ID in headers' });
  }

  try {
    await prisma.order.upsert({
      where: { id: data.id.toString() },
      update: {
        amount: parseFloat(data.total_price),
        date: new Date(data.created_at)
      },
      create: {
        id: data.id.toString(),
        tenantId,
        customerId: data.customer?.id?.toString() || 'unknown',
        amount: parseFloat(data.total_price),
        date: new Date(data.created_at)
      }
    });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook order:', error);
    res.status(500).send();
  }
});

// Webhook to ingest customers
app.post('/webhook/customer', async (req, res) => {
  const tenantId = req.headers['tenantid'];
  const data = req.body;

  console.log('Webhook customer received:', data, 'Tenant ID:', tenantId);

  if (!tenantId) return res.status(400).json({ error: 'Missing tenant ID in headers' });

  try {
    const result = await prisma.customer.upsert({
      where: { id: data.id.toString() },
      update: {
        name: data.name,
        email: data.email,
        spend: parseFloat(data.spend) || 0,
        tenantId,
      },
      create: {
        id: data.id.toString(),
        name: data.name,
        email: data.email,
        spend: parseFloat(data.spend) || 0,
        tenantId,
      },
    });
    console.log('Upsert result:', result);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook customer:', error);
    res.status(500).send();
  }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
