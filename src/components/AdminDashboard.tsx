import React, { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Download,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  Mail,
  Shield,
  Paperclip,
  X,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: "EMPLOYEE" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface complaint_types{
  id: string;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
}

interface Stats {
  totalcomplainants: number;
  newcomplainants: number;
  inProgresscomplainants: number;
  resolvedcomplainants: number;
  totalUsers: number;
  activeUsers: number;
  complainantsByType: Array<{
    type: string;
    count: number;
  }>;
  complainantsByStatus: Array<{
    status: string;
    count: number;
  }>;
  overduecomplainants: number;
  avgResolutionTime: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "complainants" | "types" | "settings"
  >("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [complaint_typess, setcomplaint_typess] = useState<complaint_types[]>([]);
  const [complainants, setcomplainants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedType, setSelectedType] = useState<complaint_types| null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  const [complaintFilters, setComplaintFilters] = useState({
    status: "",
    type: "",
    fromDate: "",
    toDate: "",
  });

  const [userForm, setUserForm] = useState({
    email: "",
    fullName: "",
    role: "EMPLOYEE" as "EMPLOYEE" | "ADMIN",
    password: "",
  });

  const [typeForm, setTypeForm] = useState({
    name: "",
    icon: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    const fetchTypes = async () => {
      // Use shared supabase client
      const { supabase } = await import('../utils/supabaseClient');
      const { data, error } = await supabase
        .from('complaint_types')
        .select('*')
        .eq('isActive', true)
        .order('name', { ascending: true });
      if (error) {
        console.error('Error fetching types:', error);
        setcomplaint_typess([]);
      } else {
        setcomplaint_typess(data || []);
      }
    };
    fetchTypes();
  }, []);

  const fetchData = async () => {
    try {
      const { supabase } = await import('../utils/supabaseClient');
      if (activeTab === "overview") {
        // Fetch stats from supabase
        const { data, error } = await supabase.rpc('get_dashboard_stats');
        if (error) throw error;
        setStats(data || null);
      } else if (activeTab === "users") {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        setUsers(data || []);
      } else if (activeTab === "complainants") {
        await fetchcomplainants();
      } else if (activeTab === "types") {
        const { data, error } = await supabase.from('complaint_types').select('*').order('name', { ascending: true });
        if (error) throw error;
        setcomplaint_typess(data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchcomplainants = async () => {
  try {
    const { supabase } = await import('../utils/supabaseClient');
    let query = supabase.from('complainants').select('*');
    if (complaintFilters.status) query = query.eq('status', complaintFilters.status);
    // REMOVE this line:
    // if (complaintFilters.type) query = query.eq('typeId', complaintFilters.type);
    if (complaintFilters.fromDate) query = query.gte('createdAt', complaintFilters.fromDate);
    if (complaintFilters.toDate) query = query.lte('createdAt', complaintFilters.toDate);
    const { data, error } = await query;
    if (error) throw error;
    setcomplainants(data || []);
  } catch (error) {
    console.error("Error fetching complainants:", error);
    setcomplainants([]);
  }
};

  const applyFilters = () => {
    fetchcomplainants();
  };

  const handleViewComplaintDetails = (complaint: any) => {
    setSelectedComplaint(complaint);
    setShowComplaintModal(true);
  };

  const handleCreateUser = async () => {
    try {
      const { supabase } = await import('../utils/supabaseClient');
      const { error } = await supabase.from('users').insert([
        {
          ...userForm,
          phone: "01000000000",
          nationalId: "12345678901234",
        },
      ]);
      if (!error) {
        setShowUserModal(false);
        setUserForm({ email: "", fullName: "", role: "EMPLOYEE", password: "" });
        fetchData();
      } else {
        alert("خطأ في إنشاء المستخدم");
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      const { supabase } = await import('../utils/supabaseClient');
      const { error } = await supabase.from('users').update(userForm).eq('id', selectedUser.id);
      if (!error) {
        setShowUserModal(false);
        setSelectedUser(null);
        setUserForm({ email: "", fullName: "", role: "EMPLOYEE", password: "" });
        fetchData();
      } else {
        alert("خطأ في تحديث المستخدم");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    try {
      const { supabase } = await import('../utils/supabaseClient');
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (!error) {
        fetchData();
      } else {
        alert("خطأ في حذف المستخدم");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleCreateType = async () => {
    try {
      const { supabase } = await import('../utils/supabaseClient');
      const { error } = await supabase.from('complaint_types').insert([typeForm]);
      if (!error) {
        setShowTypeModal(false);
        setTypeForm({ name: "", icon: "", description: "" });
        fetchData();
      } else {
        alert("خطأ في إنشاء نوع الشكوى");
      }
    } catch (error) {
      console.error("Error creating type:", error);
    }
  };

  const handleUpdateType = async () => {
    if (!selectedType) return;
    try {
      const { supabase } = await import('../utils/supabaseClient');
      const { error } = await supabase.from('complaint_types').update(typeForm).eq('id', selectedType.id);
      if (!error) {
        setShowTypeModal(false);
        setSelectedType(null);
        setTypeForm({ name: "", icon: "", description: "" });
        fetchData();
      } else {
        alert("خطأ في تحديث نوع الشكوى");
      }
    } catch (error) {
      console.error("Error updating type:", error);
    }
  };

  const handleDeleteType = async (typeId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا النوع؟")) return;
    try {
      const { supabase } = await import('../utils/supabaseClient');
      const { error } = await supabase.from('complaint_types').delete().eq('id', typeId);
      if (!error) {
        fetchData();
      } else {
        alert("خطأ في حذف نوع الشكوى");
      }
    } catch (error) {
      console.error("Error deleting type:", error);
    }
  };

  const exportReport = async (type: string) => {
    try {
      // Supabase does not support direct file export, so you may need to implement this differently
      alert("تصدير التقارير غير مدعوم مباشرة عبر Supabase. يرجى استخدام لوحة البيانات أو تصدير يدوي من قاعدة البيانات.");
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // No Auth check, always show dashboard

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                لوحة تحكم المدير
              </h1>
              <p className="text-gray-600 mt-1">أهلاً بك في لوحة التحكم</p>
            </div>
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {activeTab === "complainants" ? complainants.length : (stats?.totalcomplainants || 0)}
                </div>
                <div className="text-sm text-gray-600">إجمالي الشكاوى</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.totalUsers || 0}
                </div>
                <div className="text-sm text-gray-600">المستخدمين</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.overduecomplainants || 0}
                </div>
                <div className="text-sm text-gray-600">متأخرة</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-reverse space-x-8 px-6 overflow-x-auto">
              {[
                { id: "overview", label: "نظرة عامة", icon: BarChart3 },
                { id: "users", label: "إدارة المستخدمين", icon: Users },
                { id: "complainants", label: "إدارة الشكاوى", icon: FileText },
                { id: "types", label: "أنواع الشكاوى", icon: Settings },
                { id: "settings", label: "الإعدادات", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 ml-1" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">
                      إجمالي الشكاوى
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activeTab === "overview" ? complainants.length : stats.totalcomplainants}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">تم حلها</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activeTab === "overview"
                        ? complainants.filter(c => c.status === "RESOLVED").length
                        : stats.resolvedcomplainants}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">
                      قيد المعالجة
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activeTab === "overview"
                        ? complainants.filter(c => c.status === "IN_PROGRESS" || c.status === "UNDER_REVIEW").length
                        : stats.inProgresscomplainants}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">متأخرة</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activeTab === "overview"
                        ? complainants.filter(c => c.status === "OVERDUE").length
                        : stats.overduecomplainants}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  الشكاوى حسب النوع
                </h3>
                <div className="space-y-3">
                  {stats?.complainantsByType?.map((item) => (
                    <div
                      key={item.type}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">{item.type}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 ml-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (item.count / (stats?.totalcomplainants || 1)) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-left">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-4">
                      لا توجد بيانات متاحة
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  الشكاوى حسب الحالة
                </h3>
                <div className="space-y-3">
                  {stats?.complainantsByStatus?.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">
                        {item.status}
                      </span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 ml-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (item.count / (stats?.totalcomplainants || 1)) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-left">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-4">
                      لا توجد بيانات متاحة
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Export Reports */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                تصدير التقارير
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => exportReport("complainants")}
                  className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-5 h-5 text-blue-600 ml-2" />
                  <span>تقرير الشكاوى</span>
                </button>
                <button
                  onClick={() => exportReport("users")}
                  className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-5 h-5 text-green-600 ml-2" />
                  <span>تقرير المستخدمين</span>
                </button>
                <button
                  onClick={() => exportReport("stats")}
                  className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-5 h-5 text-purple-600 ml-2" />
                  <span>التقرير الإحصائي</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NEW FUNCTIONALITY: تبويب إدارة الشكاوى - تم إضافته في الإصدار 2.0.0 */}
        {activeTab === "complainants" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  إدارة الشكاوى
                </h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 space-x-reverse space-x-4">
                  <button
                    onClick={() => exportReport("complainants")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 ml-1" />
                    تصدير Excel
                  </button>
                  <button
                    onClick={() => exportReport("complainants-csv")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 ml-1" />
                    تصدير CSV
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    حالة الشكوى
                  </label>
                  <select
                    value={complaintFilters.status}
                    onChange={(e) =>
                      setComplaintFilters({
                        ...complaintFilters,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">جميع الحالات</option>
                    <option value="NEW">قيد الانتظار</option>
                    <option value="UNDER_REVIEW">قيد المراجعة</option>
                    <option value="IN_PROGRESS">قيد المعالجة</option>
                    <option value="RESOLVED">تم الحل</option>
                    <option value="REJECTED">مرفوضة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع الشكوى
                  </label>
                  <select
                    value={complaintFilters.type}
                    onChange={(e) =>
                      setComplaintFilters({
                        ...complaintFilters,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">جميع الأنواع</option>
                    {complaint_typess.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    من تاريخ
                  </label>
                  <input
                    type="date"
                    value={complaintFilters.fromDate}
                    onChange={(e) =>
                      setComplaintFilters({
                        ...complaintFilters,
                        fromDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    إلى تاريخ
                  </label>
                  <input
                    type="date"
                    value={complaintFilters.toDate}
                    onChange={(e) =>
                      setComplaintFilters({
                        ...complaintFilters,
                        toDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="mb-6">
                <button
                  onClick={applyFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  تطبيق الفلاتر
                </button>
              </div>

              {/* complainants Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الشكوى
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المواطن
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نوع الشكوى
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        العنوان
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        التاريخ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {complainants.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          لا توجد شكاوى لعرضها
                        </td>
                      </tr>
                    ) : (
                      complainants.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{complaint.id.slice(-6)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {complaint.fullName || "غير محدد"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {complaint.type}{" "}
                            {complaint.type || "غير محدد"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {complaint.address || "غير محدد"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                complaint.status === "RESOLVED"
                                  ? "bg-green-100 text-green-800"
                                  : complaint.status === "IN_PROGRESS" ||
                                    complaint.status === "UNDER_REVIEW"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : complaint.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {complaint.status === "NEW" && "قيد الانتظار"}
                              {complaint.status === "UNDER_REVIEW" &&
                                "قيد المراجعة"}
                              {complaint.status === "IN_PROGRESS" &&
                                "قيد المعالجة"}
                              {complaint.status === "RESOLVED" && "تم الحل"}
                              {complaint.status === "REJECTED" && "مرفوضة"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(complaint.createdAt).toLocaleDateString(
                              "ar-EG"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() =>
                                handleViewComplaintDetails(complaint)
                              }
                              className="text-blue-600 hover:text-blue-900"
                            >
                              عرض التفاصيل
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    عرض {complainants.length} من {complainants.length} نتيجة
                  </div>
                  <div className="flex items-center space-x-reverse space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                      السابق
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
                      1
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                      التالي
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  إدارة المستخدمين ({users.length})
                </h2>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setUserForm({
                      email: "",
                      fullName: "",
                      role: "EMPLOYEE",
                      password: "",
                    });
                    setShowUserModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                >
                  <UserPlus className="w-4 h-4 ml-1" />
                  إضافة مستخدم
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المستخدم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      البريد الإلكتروني
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الدور
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإنشاء
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role === "ADMIN" ? "مدير" : "موظف"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-reverse space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setUserForm({
                                email: user.email,
                                fullName: user.fullName,
                                role: user.role,
                                password: "",
                              });
                              setShowUserModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "types" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  أنواع الشكاوى ({complaint_typess.length})
                </h2>
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setTypeForm({ name: "", icon: "", description: "" });
                    setShowTypeModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة نوع
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      النوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الوصف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complaint_typess.map((type) => (
                    <tr key={type.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-lg ml-2">{type.icon}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {type.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {type.description}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            type.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {type.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-reverse space-x-2">
                          <button
                            onClick={() => {
                              setSelectedType(type);
                              setTypeForm({
                                name: type.name,
                                icon: type.icon,
                                description: type.description,
                              });
                              setShowTypeModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteType(type.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              إعدادات النظام
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  إعدادات البريد الإلكتروني
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Server
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="587"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-reverse space-x-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center">
                    <Mail className="w-4 h-4 ml-1" />
                    حفظ الإعدادات
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center">
                    <Mail className="w-4 h-4 ml-1" />
                    اختبار الإرسال
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  إعدادات النظام
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      وقت الحل الافتراضي (بالأيام)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="7"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      عدد الشكاوى في الصفحة
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifications"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="notifications"
                      className="mr-2 block text-sm text-gray-900"
                    >
                      تفعيل الإشعارات
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenance"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="maintenance"
                      className="mr-2 block text-sm text-gray-900"
                    >
                      وضع الصيانة
                    </label>
                  </div>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center">
                  <Shield className="w-4 h-4 ml-1" />
                  حفظ الإعدادات
                </button>
              </div>

              {/* NEW FUNCTIONALITY: معلومات النظام - تم إضافته في الإصدار 2.0.0 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  معلومات النظام
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        إصدار النظام:
                      </span>
                      <span className="text-gray-900 mr-2">2.0.0</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        آخر تحديث:
                      </span>
                      <span className="text-gray-900 mr-2">15 يناير 2024</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        حالة الخادم:
                      </span>
                      <span className="text-green-600 mr-2">متصل</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        قاعدة البيانات:
                      </span>
                      <span className="text-green-600 mr-2">متصل</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        إجمالي المستخدمين:
                      </span>
                      <span className="text-gray-900 mr-2">
                        {stats?.totalUsers || 0}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        إجمالي الشكاوى:
                      </span>
                      <span className="text-gray-900 mr-2">
                        {stats?.totalcomplainants || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={userForm.fullName}
                    onChange={(e) =>
                      setUserForm({ ...userForm, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الدور
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        role: e.target.value as "EMPLOYEE" | "ADMIN",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="EMPLOYEE">موظف</option>
                    <option value="ADMIN">مدير</option>
                  </select>
                </div>

               {!selectedUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  className="border rounded px-3 py-2 w-full"
                />
                <div className="overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2">رقم الشكوى</th>
                        <th className="px-4 py-2">المواطن</th>
                        <th className="px-4 py-2">نوع الشكوى</th>
                        <th className="px-4 py-2">العنوان</th>
                        <th className="px-4 py-2">الحالة</th>
                        <th className="px-4 py-2">التاريخ</th>
                        <th className="px-4 py-2">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {complainants.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-gray-500">
                            لا توجد بيانات
                          </td>
                        </tr>
                      ) : (
                        complainants.map((complaint: any) => (
                          <tr key={complaint.id}>
                            <td className="px-4 py-2 font-mono">
                              #{complaint.id?.slice(0, 6) || "غير محدد"}
                            </td>
                            <td className="px-4 py-2">
                              {complaint.citizenName || "غير محدد"}
                            </td>
                            <td className="px-4 py-2">
                              {complaint.typeName || "غير محدد"}
                            </td>
                            <td className="px-4 py-2">
                              {complaint.title || "غير محدد"}
                            </td>
                            <td className="px-4 py-2">{complaint.status || "--"}</td>
                            <td className="px-4 py-2">
                              {complaint.createdAt
                                ? new Date(complaint.createdAt).toLocaleDateString()
                                : "غير محدد"}
                            </td>
                            <td className="px-4 py-2">
                              <button
                                className="text-blue-600 hover:underline"
                                onClick={() => handleViewComplaintDetails(complaint)}
                              >
                                عرض التفاصيل
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex space-x-reverse space-x-3">
                <button
                  onClick={selectedUser ? handleUpdateUser : handleCreateUser}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {selectedUser ? "تحديث" : "إضافة"}
                </button>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                    setUserForm({
                      email: "",
                      fullName: "",
                      role: "EMPLOYEE",
                      password: "",
                    });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Type Modal */}
        {showTypeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedType ? "تعديل نوع الشكوى" : "إضافة نوع شكوى جديد"}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم النوع
                  </label>
                  <input
                    type="text"
                    value={typeForm.name}
                    onChange={(e) =>
                      setTypeForm({ ...typeForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="أدخل اسم النوع"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الأيقونة
                  </label>
                  <input
                    type="text"
                    value={typeForm.icon}
                    onChange={(e) =>
                      setTypeForm({ ...typeForm, icon: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="🏚️"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    value={typeForm.description}
                    onChange={(e) =>
                      setTypeForm({ ...typeForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="أدخل وصف النوع"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex space-x-reverse space-x-3">
                <button
                  onClick={selectedType ? handleUpdateType : handleCreateType}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {selectedType ? "تحديث" : "إضافة"}
                </button>
                <button
                  onClick={() => {
                    setShowTypeModal(false);
                    setSelectedType(null);
                    setTypeForm({ name: "", icon: "", description: "" });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complaint Details Modal */}
        {showComplaintModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    تفاصيل الشكوى #{selectedComplaint.id.slice(-6)}
                  </h3>
                  <button
                    onClick={() => {
                      setShowComplaintModal(false);
                      setSelectedComplaint(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      المعلومات الأساسية
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          رقم الشكوى:
                        </span>
                        <span className="text-sm text-gray-900 mr-2">
                          #{selectedComplaint.id.slice(-6)}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          المواطن:
                        </span>
                        <span className="text-sm text-gray-900 mr-2">
                          {selectedComplaint.fullName ||
                            "غير محدد"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          نوع الشكوى:
                        </span>
                        <span className="text-sm text-gray-900 mr-2">
                          {selectedComplaint.type}{" "}
                          {selectedComplaint.type || "غير محدد"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          الحالة:
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                            selectedComplaint.status === "RESOLVED"
                              ? "bg-green-100 text-green-800"
                              : selectedComplaint.status === "IN_PROGRESS" ||
                                selectedComplaint.status === "UNDER_REVIEW"
                              ? "bg-yellow-100 text-yellow-800"
                              : selectedComplaint.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {selectedComplaint.status === "NEW" && "قيد الانتظار"}
                          {selectedComplaint.status === "UNDER_REVIEW" &&
                            "قيد المراجعة"}
                          {selectedComplaint.status === "IN_PROGRESS" &&
                            "قيد المعالجة"}
                          {selectedComplaint.status === "RESOLVED" && "تم الحل"}
                          {selectedComplaint.status === "REJECTED" && "مرفوضة"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          تاريخ الإنشاء:
                        </span>
                        <span className="text-sm text-gray-900 mr-2">
                          {new Date(
                            selectedComplaint.createdAt
                          ).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      تفاصيل إضافية
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          العنوان:
                        </span>
                        <span className="text-sm text-gray-900 mr-2">
                          {selectedComplaint.address || "غير محدد"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          رقم الهاتف:
                        </span>
                        <span className="text-sm text-gray-900 mr-2">
                          {selectedComplaint.phone || "غير محدد"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          البريد الإلكتروني:
                        </span>
                        <span className="text-sm text-gray-900 mr-2">
                          {selectedComplaint.email || "غير محدد"}
                        </span>
                      </div>
                      {selectedComplaint.assignedTo && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">
                            الموظف المسؤول:
                          </span>
                          <span className="text-sm text-gray-900 mr-2">
                            {selectedComplaint.assignedTo.fullName}
                          </span>
                        </div>
                      )}
                      {selectedComplaint.resolvedAt && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">
                            تاريخ الحل:
                          </span>
                          <span className="text-sm text-gray-900 mr-2">
                            {new Date(
                              selectedComplaint.resolvedAt
                            ).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    وصف الشكوى
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedComplaint.description || "لا يوجد وصف متاح"}
                    </p>
                  </div>
                </div>

                {/* Attachments */}
                {selectedComplaint.attachments &&
                  selectedComplaint.attachments.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        المرفقات
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedComplaint.attachments.map(
                          (attachment: string, index: number) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg p-4"
                            >
                              <div className="flex items-center">
                                <Paperclip className="w-4 h-4 text-gray-500 ml-2" />
                                <span className="text-sm text-gray-700">
                                  مرفق {index + 1}
                                </span>
                              </div>
                              <a
                                href={`http://localhost:3001/uploads/${attachment}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm mt-2 block"
                              >
                                عرض الملف
                              </a>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Internal Notes */}
                {selectedComplaint.internalNotes && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      الملاحظات الداخلية
                    </h4>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedComplaint.internalNotes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowComplaintModal(false);
                    setSelectedComplaint(null);
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
