const express = require('express');
const { body, validationResult } = require('express-validator');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const supabaseUrl = 'https://gcfeqklskmwbiwjkdouu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZmVxa2xza213Yml3amtkb3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMzA2NTQsImV4cCI6MjA3MDcwNjY1NH0.ZW9_4Xo9D5tK2mEHl2uMTdiCOUIUkuzp88YYAhFyr6Y';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all complaint types
router.get('/', async (req, res) => {
  try {
    const { data: types, error } = await supabase
      .from('complaintType')
      .select('*')
      .eq('isActive', true)
      .order('name', { ascending: true });
    if (error) {
      console.error('Get types error:', error);
      return res.status(500).json({ error: 'خطأ في جلب أنواع الشكاوى' });
    }
    res.json(types);
  } catch (error) {
    console.error('Get types error:', error);
    res.status(500).json({ error: 'خطأ في جلب أنواع الشكاوى' });
  }
});

// Create new complaint type (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), [
  body('name').isLength({ min: 2 }).withMessage('اسم النوع مطلوب'),
  body('description').optional().isString(),
  body('icon').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'بيانات غير صالحة',
        details: errors.array()
      });
    }

    const { name, description, icon } = req.body;

    const { data: existingType, error: findError } = await supabase
      .from('complaintType')
      .select('id')
      .eq('name', name)
      .single();
    if (findError && findError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'خطأ في البحث عن نوع الشكوى' });
    }
    if (existingType) {
      return res.status(400).json({ error: 'نوع الشكوى موجود بالفعل' });
    }
    const { data: type, error: createError } = await supabase
      .from('complaintType')
      .insert({
        name,
        description: description || null,
        icon: icon || null,
      })
      .select('*')
      .single();
    if (createError) {
      return res.status(500).json({ error: 'خطأ في إنشاء نوع الشكوى' });
    }
    res.status(201).json({
      success: true,
      type,
      message: 'تم إنشاء نوع الشكوى بنجاح'
    });
  } catch (error) {
    console.error('Create type error:', error);
    res.status(500).json({ error: 'خطأ في إنشاء نوع الشكوى' });
  }
});

// Update complaint type (Admin only)
router.patch('/:id', authenticateToken, requireRole(['ADMIN']), [
  body('name').optional().isLength({ min: 2 }).withMessage('اسم النوع مطلوب'),
  body('description').optional().isString(),
  body('icon').optional().isString(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'بيانات غير صالحة',
        details: errors.array()
      });
    }

    const typeId = req.params.id;
    const updateData = { ...req.body };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data: type, error: updateError } = await supabase
      .from('complaintType')
      .update(updateData)
      .eq('id', typeId)
      .select('*')
      .single();
    if (updateError) {
      return res.status(500).json({ error: 'خطأ في تحديث نوع الشكوى' });
    }
    res.json({
      success: true,
      type,
      message: 'تم تحديث نوع الشكوى بنجاح'
    });
  } catch (error) {
    console.error('Update type error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'نوع الشكوى غير موجود' });
    }
    res.status(500).json({ error: 'خطأ في تحديث نوع الشكوى' });
  }
});

// Delete complaint type (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const typeId = req.params.id;

    // Check if type has complaints
    const { data: complaints, error: countError } = await supabase
      .from('complaint')
      .select('id', { count: 'exact', head: true })
      .eq('typeId', typeId);
    const complaintsCount = complaints?.length || 0;
    if (countError) {
      return res.status(500).json({ error: 'خطأ في التحقق من الشكاوى المرتبطة' });
    }
    if (complaintsCount > 0) {
      return res.status(400).json({ 
        error: 'لا يمكن حذف نوع الشكوى لوجود شكاوى مرتبطة به' 
      });
    }
    const { error: deleteError } = await supabase
      .from('complaintType')
      .delete()
      .eq('id', typeId);
    if (deleteError) {
      return res.status(500).json({ error: 'خطأ في حذف نوع الشكوى' });
    }
    res.json({
      success: true,
      message: 'تم حذف نوع الشكوى بنجاح'
    });
  } catch (error) {
    console.error('Delete type error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'نوع الشكوى غير موجود' });
    }
    res.status(500).json({ error: 'خطأ في حذف نوع الشكوى' });
  }
});

module.exports = router;