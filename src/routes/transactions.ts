import express from 'express';
import { authenticateToken } from '../middleware/auth';
import Transaction from '../models/Transaction';
import { AICategorizationService } from '../service/aiCategorizationService';


const router = express.Router();

router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.userId },
      order: [['date', 'DESC']],
    });
    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching transactions', error });
  }
});

router.post('/',authenticateToken,async(req : any,res) => {
    try {

        const { amount, description, category, type, date } = req.body;
    
    const transaction = await Transaction.create({
      amount,
      description,
      category,
      type,
      date: date || new Date(),
      userId: req.userId,
    });

    return res.status(201).json(transaction);
    }
    catch(error){
        return res.status(500).json({ message: 'Error creating transaction', error });
    }
});

router.put('/:id',authenticateToken,async(req : any,res) => {
    try{

        const { id } = req.params;
    const { amount, description, category, type, date } = req.body;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.userId },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await transaction.update({
      amount,
      description,
      category,
      type,
      date,
    });

    return res.json(transaction);
        

    } catch(error){
        return res.status(500).json({ message: 'Error updating transaction', error });
    }
});

router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.userId },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await transaction.destroy();
    return res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error });
  }
});

router.post('/smart', authenticateToken, async (req: any, res) => {
  try {
    const { amount, description, type, date } = req.body;
    
    const aiCategorization = new AICategorizationService();
    const { category, confidence } = await aiCategorization.categorizeTransaction(description, amount);
    
    const transaction = await Transaction.create({
      amount,
      description,
      category,
      type,
      date: date || new Date(),
      userId: req.userId,
      aiConfidence: confidence,
      source: 'ai_smart'
    });

    return res.status(201).json({
      ...transaction.toJSON(),
      aiCategorized: true,
      confidence
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating smart transaction', error });
  }
});

router.patch('/:id/correct-category', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { correctCategory } = req.body;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.userId },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const aiCategorization = new AICategorizationService();
    await aiCategorization.learnFromCorrection(transaction.description, correctCategory);
    
    await transaction.update({ 
      category: correctCategory,
      aiConfidence: 1.0
    });

    return res.json({ 
      message: 'Category corrected and AI model updated',
      transaction: transaction 
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error correcting category', error });
  }
});

router.post('/smart', authenticateToken, async (req: any, res) => {
  try {
    const { amount, description, type, date } = req.body;
    
    if (!amount || !description || !type) {
      return res.status(400).json({ 
        message: 'Amount, description, and type are required'
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        message: 'Amount must be a positive number'
      });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ 
        message: 'Type must be either "income" or "expense"' 
      });
    }

    const aiCategorization = new AICategorizationService();
    const { category, confidence, matchedKeyword } = await aiCategorization.categorizeTransaction(description, amount);
    
    const transaction = await Transaction.create({
      amount,
      description: description.trim(),
      category,
      type,
      date: date || new Date(),
      userId: req.userId,
      aiConfidence: confidence,
      source: 'ai_smart'
    });

    return res.status(201).json({
      ...transaction.toJSON(),
      aiCategorized: true,
      confidence,
      matchedKeyword
    });
  } catch (error) {
    console.error('Smart transaction creation error:', error);
    return res.status(500).json({ message: 'Error creating smart transaction', error });
  }
});

router.patch('/:id/correct-category', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { correctCategory } = req.body;

    if (!correctCategory || typeof correctCategory !== 'string') {
      return res.status(400).json({ 
        message: 'correctCategory (string) is required' 
      });
    }

    const transaction = await Transaction.findOne({
      where: { id, userId: req.userId },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const aiCategorization = new AICategorizationService();
    await aiCategorization.learnFromCorrection(transaction.description, correctCategory);
    
    await transaction.update({ 
      category: correctCategory.trim(),
      aiConfidence: 1.0
    });

    return res.json({ 
      message: 'Category corrected and AI model updated',
      transaction: transaction 
    });
  } catch (error) {
    console.error('Category correction error:', error);
    return res.status(500).json({ message: 'Error correcting category', error });
  }
});


export default router;
