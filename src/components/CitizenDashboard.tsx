import React, { useState, useEffect } from "react";
import {
  FileText,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Bell,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import NotificationCenter from "./NotificationCenter";
import { supabase } from "../utils/supabaseClient";

interface Complainant {
  id: string;
  fullName: string;
  nationalId: string;
  phone: string;
  email?: string;
}

const CitizenDashboard: React.FC = () => {
  const { complainant } = useAuth();
  const [complainants, setComplainants] = useState<Complainant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplainant, setSelectedComplainant] = useState<Complainant | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchComplainants();
  }, []);

  const fetchComplainants = async () => {
    try {
      const { data, error } = await supabase
        .from("complainants")
        .select("*");

      if (error) {
        console.error("Error fetching complainants:", error);
        setComplainants([]);
      } else {
        setComplainants(data || []);
      }
    } catch (error) {
      console.error("Error fetching complainants:", error);
      setComplainants([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800";
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "NEW":
        return "جديد";
      case "UNDER_REVIEW":
        return "قيد المراجعة";
      case "IN_PROGRESS":
        return "جار المعالجة";
      case "RESOLVED":
        return "تم الحل";
      case "REJECTED":
        return "مرفوض";
      case "CLOSED":
        return "مغلق";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "NEW":
        return <AlertCircle className="w-4 h-4" />;
      case "UNDER_REVIEW":
        return <Clock className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4" />;
      case "RESOLVED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      case "CLOSED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                أهلاً بك، {complainant?.fullName}
              </h1>
              <p className="text-gray-600 mt-1">
                تابع شكاواك وحالتها من خلال لوحة التحكم
              </p>
            </div>
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {complainants.length}
                </div>
                <div className="text-sm text-gray-600">إجمالي الشكاوى</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {complainants.filter((c) => c.status === "RESOLVED").length}
                </div>
                <div className="text-sm text-gray-600">تم حلها</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {
                    complainants.filter((c) =>
                      ["NEW", "UNDER_REVIEW", "IN_PROGRESS"].includes(c.status)
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">قيد المعالجة</div>
              </div>
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* complainants List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              قائمة المواطنين ({complainants.length})
            </h2>
          </div>

          {complainants.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا يوجد مواطنون
              </h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم الكامل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الرقم القومي</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الموبايل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complainants.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{c.fullName}</td>
                      <td className="px-6 py-4">{c.nationalId}</td>
                      <td className="px-6 py-4">{c.phone}</td>
                      <td className="px-6 py-4">{c.email || "—"}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => setSelectedComplainant(c)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 ml-1" />
                          عرض التفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Complainant Details Modal */}
        {selectedComplainant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    تفاصيل المواطن
                  </h3>
                  <button
                    onClick={() => setSelectedComplainant(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedComplainant.fullName}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                    <div>
                      <span className="font-medium text-gray-700">الرقم القومي:</span>
                      <br />
                      <span className="text-gray-600">{selectedComplainant.nationalId}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">رقم الموبايل:</span>
                      <br />
                      <span className="text-gray-600">{selectedComplainant.phone}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">البريد الإلكتروني:</span>
                      <br />
                      <span className="text-gray-600">{selectedComplainant.email || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedComplainant(null)}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Center */}
        <NotificationCenter
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      </div>
    </div>
  );
};

export default CitizenDashboard;
