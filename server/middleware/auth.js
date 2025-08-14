const jwt = require("jsonwebtoken");
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gcfeqklskmwbiwjkdouu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZmVxa2xza213Yml3amtkb3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMzA2NTQsImV4cCI6MjA3MDcwNjY1NH0.ZW9_4Xo9D5tK2mEHl2uMTdiCOUIUkuzp88YYAhFyr6Y';
const supabase = createClient(supabaseUrl, supabaseKey);
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "رمز الوصول مطلوب" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if userId or complainantId exists in the decoded token
    if (!decoded.userId && !decoded.complainantId) {
      return res
        .status(401)
        .json({ error: "رمز وصول غير صالح - معرف المستخدم مفقود" });
    }

    // If it's a complainant token, we need to fetch complainant data
    if (decoded.complainantId) {
      const { data: complainant, error: complainantError } = await supabase
        .from('complainant')
        .select('id, fullName, phone, nationalId, email')
        .eq('id', decoded.complainantId)
        .single();
      if (complainantError || !complainant) {
        return res.status(401).json({ error: "مشتكي غير صالح" });
      }
      req.user = {
        id: complainant.id,
        complainantId: complainant.id,
        role: "CITIZEN",
        fullName: complainant.fullName,
        phone: complainant.phone,
        nationalId: complainant.nationalId,
        email: complainant.email,
      };
      return next();
    }

    const { data: user, error: userError } = await supabase
      .from('user')
      .select('id, email, phone, nationalId, fullName, role, isActive')
      .eq('id', decoded.userId)
      .single();
    if (userError || !user) {
      return res.status(401).json({ error: "رمز وصول غير صالح - المستخدم غير موجود" });
    }
    req.user = user;
    return next();
  // Removed leftover Prisma code. Supabase logic above already sets req.user and calls next().
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(403).json({ error: "رمز وصول غير صالح" });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "مصادقة مطلوبة" });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "غير مسموح لك بالوصول" });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET,
};
