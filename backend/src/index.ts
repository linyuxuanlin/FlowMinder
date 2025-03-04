import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const server = http.createServer(app);

// 设置CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 创建Prisma客户端
const prisma = new PrismaClient();

// 设置Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// 定义API路由
const apiRouter = express.Router();

// 扩展Express请求类型以包含用户属性
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// 身份验证中间件
const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: '未提供认证令牌' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
    if (err) return res.status(403).json({ error: '令牌无效' });
    req.user = user;
    next();
  });
};

// 认证路由
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        password: hashedPassword,
        name,
      },
    });

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // 返回用户信息和令牌
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: '邮箱或密码不正确' });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '邮箱或密码不正确' });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // 返回用户信息和令牌
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 任务路由
apiRouter.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.id,
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error('获取任务错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

apiRouter.get('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    res.json(task);
  } catch (error) {
    console.error('获取任务详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

apiRouter.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, content, status, parentId, filePath, positionX, positionY } = req.body;

    const task = await prisma.task.create({
      data: {
        id: uuidv4(),
        title,
        content,
        status,
        parentId,
        filePath,
        positionX,
        positionY,
        userId: req.user.id,
      },
    });

    // 通知所有客户端有新任务创建
    io.emit('task:created', task);

    res.status(201).json(task);
  } catch (error) {
    console.error('创建任务错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

apiRouter.put('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, status, parentId, filePath, positionX, positionY } = req.body;

    // 检查任务是否存在且属于当前用户
    const existingTask = await prisma.task.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ error: '任务不存在' });
    }

    if (existingTask.userId !== req.user.id) {
      return res.status(403).json({ error: '无权限修改此任务' });
    }

    const task = await prisma.task.update({
      where: {
        id: req.params.id,
      },
      data: {
        title,
        content,
        status,
        parentId,
        filePath,
        positionX,
        positionY,
      },
    });

    // 通知所有客户端任务已更新
    io.emit('task:updated', task);

    res.json(task);
  } catch (error) {
    console.error('更新任务错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

apiRouter.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    // 检查任务是否存在且属于当前用户
    const existingTask = await prisma.task.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ error: '任务不存在' });
    }

    if (existingTask.userId !== req.user.id) {
      return res.status(403).json({ error: '无权限删除此任务' });
    }

    await prisma.task.delete({
      where: {
        id: req.params.id,
      },
    });

    // 通知所有客户端任务已删除
    io.emit('task:deleted', req.params.id);

    res.status(204).send();
  } catch (error) {
    console.error('删除任务错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 任务关系路由
apiRouter.get('/relations', authenticateToken, async (req, res) => {
  try {
    const relations = await prisma.taskRelation.findMany({
      where: {
        OR: [
          {
            source: {
              userId: req.user.id,
            },
          },
          {
            target: {
              userId: req.user.id,
            },
          },
        ],
      },
      include: {
        source: true,
        target: true,
      },
    });

    // 过滤掉不属于当前用户的关系
    const filteredRelations = relations.filter(
      (relation: any) => relation.source.userId === req.user.id && relation.target.userId === req.user.id
    );

    res.json(filteredRelations);
  } catch (error) {
    console.error('获取任务关系错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

apiRouter.post('/relations', authenticateToken, async (req, res) => {
  try {
    const { sourceId, targetId, type } = req.body;

    // 检查源任务和目标任务是否存在且属于当前用户
    const sourceTask = await prisma.task.findUnique({
      where: {
        id: sourceId,
      },
    });

    const targetTask = await prisma.task.findUnique({
      where: {
        id: targetId,
      },
    });

    if (!sourceTask || !targetTask) {
      return res.status(404).json({ error: '源任务或目标任务不存在' });
    }

    if (sourceTask.userId !== req.user.id || targetTask.userId !== req.user.id) {
      return res.status(403).json({ error: '无权限创建此关系' });
    }

    const relation = await prisma.taskRelation.create({
      data: {
        id: uuidv4(),
        sourceId,
        targetId,
        type,
      },
    });

    // 通知所有客户端有新关系创建
    io.emit('relation:created', relation);

    res.status(201).json(relation);
  } catch (error) {
    console.error('创建任务关系错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

apiRouter.put('/relations/:id', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body;

    // 检查关系是否存在且关联的任务属于当前用户
    const existingRelation = await prisma.taskRelation.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        source: true,
        target: true,
      },
    });

    if (!existingRelation) {
      return res.status(404).json({ error: '关系不存在' });
    }

    if (existingRelation.source.userId !== req.user.id || existingRelation.target.userId !== req.user.id) {
      return res.status(403).json({ error: '无权限修改此关系' });
    }

    const relation = await prisma.taskRelation.update({
      where: {
        id: req.params.id,
      },
      data: {
        type,
      },
    });

    // 通知所有客户端关系已更新
    io.emit('relation:updated', relation);

    res.json(relation);
  } catch (error) {
    console.error('更新任务关系错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

apiRouter.delete('/relations/:id', authenticateToken, async (req, res) => {
  try {
    // 检查关系是否存在且关联的任务属于当前用户
    const existingRelation = await prisma.taskRelation.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        source: true,
        target: true,
      },
    });

    if (!existingRelation) {
      return res.status(404).json({ error: '关系不存在' });
    }

    if (existingRelation.source.userId !== req.user.id || existingRelation.target.userId !== req.user.id) {
      return res.status(403).json({ error: '无权限删除此关系' });
    }

    await prisma.taskRelation.delete({
      where: {
        id: req.params.id,
      },
    });

    // 通知所有客户端关系已删除
    io.emit('relation:deleted', req.params.id);

    res.status(204).send();
  } catch (error) {
    console.error('删除任务关系错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 使用API路由
app.use('/api', apiRouter);

// 启动服务器
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});