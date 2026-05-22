import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw,
  Clock
} from 'lucide-react';

interface UserRelation {
  full_name: string;
}

interface Customer {
  customer_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  user_id: string;
  users?: UserRelation | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Thực hiện truy vấn JOIN bảng customers và bảng users để lấy thông tin người phụ trách
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select(`
          customer_id,
          name,
          email,
          phone,
          address,
          created_at,
          user_id,
          users (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        setCustomers(data as unknown as Customer[]);
      }
    } catch (err: any) {
      console.error('Error fetching customers from Supabase:', err);
      setError(err.message || 'Không thể kết nối đến cơ sở dữ liệu Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Bộ lọc tìm kiếm nhanh theo Tên, Số điện thoại, Email, Địa chỉ
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    
    const query = searchQuery.toLowerCase().trim();
    return customers.filter(c => 
      c.name.toLowerCase().includes(query) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.phone && c.phone.includes(query)) ||
      (c.address && c.address.toLowerCase().includes(query))
    );
  }, [searchQuery, customers]);

  // Thống kê nhanh từ danh sách khách hàng thực tế
  const stats = useMemo(() => {
    const total = customers.length;
    const withEmail = customers.filter(c => c.email).length;
    const withPhone = customers.filter(c => c.phone).length;
    
    // Tính số khách hàng được tạo trong tháng này
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = customers.filter(c => {
      const createdDate = new Date(c.created_at);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    return { total, withEmail, withPhone, newThisMonth };
  }, [customers]);

  // Hàm format ngày tháng DD/MM/YYYY HH:MM
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <section className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2">
        <div>
          <p className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-1">CRM & TÀI NGUYÊN</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Danh sách Khách hàng</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Danh bạ đối tác và khách hàng thực tế của F-Solution</p>
        </div>
        <button
          id="btn-refresh-customers"
          onClick={fetchCustomers}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm shadow-sm hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới dữ liệu</span>
        </button>
      </section>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: Tổng khách hàng */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md hover:border-slate-300 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng khách hàng</p>
            <h3 className="text-3xl font-black text-slate-800">{loading ? '...' : stats.total}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 flex items-center justify-center rounded-xl text-blue-600">
            <Building2 size={24} />
          </div>
        </div>

        {/* Card 2: Mới trong tháng */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md hover:border-slate-300 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mới trong tháng</p>
            <h3 className="text-3xl font-black text-slate-800">{loading ? '...' : stats.newThisMonth}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 flex items-center justify-center rounded-xl text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Card 3: Có số điện thoại */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md hover:border-slate-300 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Có số điện thoại</p>
            <h3 className="text-3xl font-black text-slate-800">{loading ? '...' : stats.withPhone}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 border border-amber-100 flex items-center justify-center rounded-xl text-amber-600">
            <Phone size={24} />
          </div>
        </div>

        {/* Card 4: Có email công việc */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md hover:border-slate-300 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Có email liên hệ</p>
            <h3 className="text-3xl font-black text-slate-800">{loading ? '...' : stats.withEmail}</h3>
          </div>
          <div className="w-12 h-12 bg-sky-50 border border-sky-100 flex items-center justify-center rounded-xl text-sky-600">
            <Mail size={24} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {/* Table Search & Filter bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              id="input-search-customers"
              type="text" 
              placeholder="Tìm khách hàng theo tên, email, điện thoại, địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs">
            Hiển thị <span className="text-blue-600 font-extrabold">{filteredCustomers.length}</span> / {customers.length} khách hàng
          </div>
        </div>

        {/* Loading and Error States */}
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Đang đồng bộ dữ liệu khách hàng từ Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 max-w-xl mx-auto my-8 border border-red-100 bg-red-50/50 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-red-800 text-lg">Lỗi tải dữ liệu khách hàng</h3>
              <p className="text-sm text-red-600/90 leading-relaxed">{error}</p>
            </div>
            <button 
              id="btn-retry-fetch"
              onClick={fetchCustomers}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-600/10 active:scale-95 transition-all"
            >
              Kết nối lại
            </button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center shadow-xs">
              <Building2 size={32} />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="font-bold text-slate-800 text-base">Không tìm thấy khách hàng nào</h3>
              <p className="text-sm text-slate-400">
                {searchQuery ? 'Không có khách hàng nào khớp với từ khóa tìm kiếm của bạn.' : 'Hệ thống chưa có dữ liệu khách hàng nào bên Supabase.'}
              </p>
            </div>
            {searchQuery && (
              <button 
                id="btn-clear-search"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-all"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        ) : (
          /* Responsive Customer Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Tên khách hàng</th>
                  <th className="px-6 py-4">Thông tin liên hệ</th>
                  <th className="px-6 py-4">Địa chỉ liên lạc</th>
                  <th className="px-6 py-4">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.customer_id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Tên khách hàng */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-base shadow-xs group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                          {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-tight tracking-tight">{customer.name}</p>
                        </div>
                      </div>
                    </td>

                    {/* Thông tin liên hệ */}
                    <td className="px-6 py-4.5 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone size={13} className="text-slate-400" />
                        <span className="font-semibold">{customer.phone || 'Không có'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail size={13} className="text-slate-400" />
                        <span className="truncate max-w-[200px]">{customer.email || 'Không có'}</span>
                      </div>
                    </td>

                    {/* Địa chỉ */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-start gap-2 text-xs text-slate-600 max-w-[250px] leading-relaxed">
                        <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{customer.address || 'Không có'}</span>
                      </div>
                    </td>

                    {/* Ngày tạo */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock size={13} className="text-slate-400" />
                        <span>{formatDate(customer.created_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
