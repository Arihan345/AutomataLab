import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.post('/automata', async (req, res) => {
  try {
    const { type, name, description, data } = req.body;
    const automaton = await prisma.automaton.create({
      data: { type, name, description, data },
    });
    res.json(automaton);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save automaton' });
  }
});

app.get('/automata/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const automaton = await prisma.automaton.findUnique({ where: { id } });
    if (!automaton) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(automaton);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load automaton' });
  }
});

app.get('/automata', async (req, res) => {
  try {
    const list = await prisma.automaton.findMany({
      select: { id: true, name: true, type: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list automata' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});