// NEW FUNCTIONALITY: نظام الإشعارات - تم إضافته في الإصدار 2.0.0
const express = require("express");
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
const supabaseUrl = 'https://gcfeqklskmwbiwjkdouu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZmVxa2xza213Yml3amtkb3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMzA2NTQsImV4cCI6MjA3MDcwNjY1NH0.ZW9_4Xo9D5tK2mEHl2uMTdiCOUIUkuzp88YYAhFyr6Y';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get notifications for the authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    let notifications = [];

    if (req.user.role === "CITIZEN") {
      // For citizens, get notifications related to their complaints
      const { data: complaints, error: complaintsError } = await supabase
        .from('complainants')
        .select('id')
        .eq('complainantId', req.user.id);
      if (complaintsError) {
        return res.status(500).json({ error: 'خطأ في جلب الشكاوى' });
      }
      const complaintIds = complaints.map((c) => c.id);
      const { data: logs, error: logsError } = await supabase
        .from('complaintLog')
        .select('*, complaint(title), user(fullName)')
        .in('complaintId', complaintIds)
        .neq('userId', req.user.id)
        .order('createdAt', { ascending: false })
        .limit(50);
      if (logsError) {
        return res.status(500).json({ error: 'خطأ في جلب الإشعارات' });
      }
      notifications = logs.map((log) => ({
        id: log.id,
        type: getNotificationType(log.action),
        title: getNotificationTitle(log.action),
        message: getNotificationMessage(
          log.action,
          log.oldStatus,
          log.newStatus,
          log.notes
        ),
        complaintId: log.complaintId,
        complaintTitle: log.complaint?.title,
        createdAt: log.createdAt,
        read: false,
      }));

      // Transform logs to notification format
      notifications = notifications.map((log) => ({
        id: log.id,
        type: getNotificationType(log.action),
        title: getNotificationTitle(log.action),
        message: getNotificationMessage(
          log.action,
          log.oldStatus,
          log.newStatus,
          log.notes
        ),
        complaintId: log.complaintId,
        complaintTitle: log.complaint.title,
        createdAt: log.createdAt,
        read: false, // For now, all notifications are considered unread
      }));
    } else {
      // For employees and admins, get notifications about new complaints and updates
      const { data: recentComplaints, error: recentError } = await supabase
        .from('complainants')
        .select('*, type(*), complainants(fullName)')
        .or('status.eq.NEW,assignedToId.eq.' + req.user.id)
        .order('createdAt', { ascending: false })
        .limit(20);
      if (recentError) {
        return res.status(500).json({ error: 'خطأ في جلب الشكاوى الحديثة' });
      }
      notifications = recentComplaints.map((complaint) => ({
        id: `complaint-${complaint.id}`,
        type: complaint.status === "NEW" ? "new_complaint" : "status_update",
        title: complaint.status === "NEW" ? "شكوى جديدة" : "تحديث حالة الشكوى",
        message:
          complaint.status === "NEW"
            ? `تم تقديم شكوى جديدة من ${complaint.complainant.fullName}`
            : `تم تحديث حالة الشكوى إلى ${getStatusName(complaint.status)}`,
        complaintId: complaint.id,
        complaintTitle: complaint.title,
        createdAt: complaint.createdAt,
        read: false,
      }));
    }

    res.json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "خطأ في جلب الإشعارات" });
  }
});

// Mark notification as read
router.put("/:id/read", authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;

    // For now, we'll just return success since we're not storing read status
    // In a real implementation, you'd update a notifications table
    res.json({ success: true, message: "تم تحديد الإشعار كمقروء" });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ error: "خطأ في تحديث الإشعار" });
  }
});

// Mark all notifications as read
router.put("/read-all", authenticateToken, async (req, res) => {
  try {
    // For now, we'll just return success since we're not storing read status
    // In a real implementation, you'd update all notifications for the user
    res.json({ success: true, message: "تم تحديد جميع الإشعارات كمقروءة" });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({ error: "خطأ في تحديث الإشعارات" });
  }
});

// Helper functions
function getNotificationType(action) {
  switch (action) {
    case "STATUS_UPDATE":
      return "status_update";
    case "ASSIGNED":
      return "assigned";
    case "RESOLVED":
      return "resolved";
    case "COMMENT_ADDED":
      return "new_message";
    default:
      return "general";
  }
}

function getNotificationTitle(action) {
  switch (action) {
    case "STATUS_UPDATE":
      return "تحديث حالة الشكوى";
    case "ASSIGNED":
      return "تم تخصيص الشكوى";
    case "RESOLVED":
      return "تم حل الشكوى";
    case "COMMENT_ADDED":
      return "تم إضافة تعليق جديد";
    default:
      return "إشعار جديد";
  }
}

function getNotificationMessage(action, oldStatus, newStatus, notes) {
  switch (action) {
    case "STATUS_UPDATE":
      return `تم تغيير حالة الشكوى من ${getStatusName(
        oldStatus
      )} إلى ${getStatusName(newStatus)}${notes ? ` - ${notes}` : ""}`;
    case "ASSIGNED":
      return "تم تخصيص الشكوى لموظف للمراجعة";
    case "RESOLVED":
      return "تم حل الشكوى بنجاح";
    case "COMMENT_ADDED":
      return `تم إضافة تعليق: ${notes || ""}`;
    default:
      return "تم تحديث الشكوى";
  }
}

function getStatusName(status) {
  const statusNames = {
    NEW: "جديدة",
    UNDER_REVIEW: "قيد المراجعة",
    IN_PROGRESS: "قيد التنفيذ",
    RESOLVED: "تم الحل",
    REJECTED: "مرفوضة",
    CLOSED: "مغلقة",
  };
  return statusNames[status] || status;
}

module.exports = router;
