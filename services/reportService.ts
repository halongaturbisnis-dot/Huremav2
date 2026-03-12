
import { supabase } from '../lib/supabase';
import { 
  Attendance, 
  Overtime, 
  LeaveRequest, 
  AnnualLeaveRequest, 
  PermissionRequest, 
  MaternityLeaveRequest, 
  Account, 
  PayrollItem, 
  Reimbursement, 
  Compensation,
  AttendanceSummary,
  OvertimeSummary,
  LeaveSummary
} from '../types';
import { eachDayOfInterval, parseISO, format, isWithinInterval } from 'date-fns';


export const reportService = {
  async getAttendanceReport(startDate: string, endDate: string) {
    const [
      { data: accounts },
      { data: attendances },
      { data: overtimes },
      { data: leaves },
      { data: annualLeaves },
      { data: permissions },
      { data: maternityLeaves }
    ] = await Promise.all([
      supabase.from('accounts').select('id, full_name, internal_nik, position, grade, location:locations(name)'),
      supabase.from('attendances').select('*').gte('check_in', `${startDate}T00:00:00Z`).lte('check_in', `${endDate}T23:59:59Z`),
      supabase.from('overtimes').select('*').gte('check_in', `${startDate}T00:00:00Z`).lte('check_in', `${endDate}T23:59:59Z`),
      supabase.from('account_leave_requests').select('*').eq('status', 'approved').lte('start_date', endDate).gte('end_date', startDate),
      supabase.from('account_annual_leaves').select('*').eq('status', 'approved').lte('start_date', endDate).gte('end_date', startDate),
      supabase.from('account_permission_requests').select('*').eq('status', 'approved').lte('start_date', endDate).gte('end_date', startDate),
      supabase.from('account_maternity_leaves').select('*').eq('status', 'approved').lte('start_date', endDate).gte('end_date', startDate)
    ]);

    return {
      accounts: accounts || [],
      attendances: attendances || [],
      overtimes: overtimes || [],
      leaves: leaves || [],
      annualLeaves: annualLeaves || [],
      permissions: permissions || [],
      maternityLeaves: maternityLeaves || []
    };
  },

  async getAttendanceReportSummary(startDate: string, endDate: string): Promise<AttendanceSummary[]> {
    const data = await this.getAttendanceReport(startDate, endDate);
    const { accounts, attendances, overtimes, leaves, annualLeaves, permissions, maternityLeaves } = data;

    const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
    const totalDays = days.length;

    return (accounts || []).map(acc => {
      const empAttendances = (attendances || []).filter(a => a.account_id === acc.id);
      const empLeaves = (leaves || []).filter(l => l.account_id === acc.id);
      const empAnnualLeaves = (annualLeaves || []).filter(l => l.account_id === acc.id);
      const empPermissions = (permissions || []).filter(p => p.account_id === acc.id);
      const empMaternityLeaves = (maternityLeaves || []).filter(m => m.account_id === acc.id);

      const present = empAttendances.length;
      const late = empAttendances.filter(a => a.is_late).length;
      const lateMinutes = empAttendances.reduce((sum, a) => sum + (a.late_minutes || 0), 0);
      const earlyDeparture = empAttendances.filter(a => a.is_early_departure).length;
      const earlyDepartureMinutes = empAttendances.reduce((sum, a) => sum + (a.early_departure_minutes || 0), 0);
      const leave = empLeaves.length;
      const annualLeave = empAnnualLeaves.length;
      const permission = empPermissions.length;
      const maternityLeave = empMaternityLeaves.length;
      const noClockOut = empAttendances.filter(a => !a.check_out).length;
      
      const absent = Math.max(0, totalDays - (present + leave + annualLeave + permission + maternityLeave));
      const attendanceRate = totalDays > 0 ? (present / totalDays) * 100 : 0;

      const dailyDetails = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const att = empAttendances.find(a => a.check_in.startsWith(dateStr));
        const isOnLeave = empLeaves.some(l => isWithinInterval(day, { start: parseISO(l.start_date), end: parseISO(l.end_date) }));
        const isOnAnnualLeave = empAnnualLeaves.some(l => isWithinInterval(day, { start: parseISO(l.start_date), end: parseISO(l.end_date) }));
        const isOnPermission = empPermissions.some(p => isWithinInterval(day, { start: parseISO(p.start_date), end: parseISO(p.end_date) }));
        const isOnMaternity = empMaternityLeaves.some(m => isWithinInterval(day, { start: parseISO(m.start_date), end: parseISO(m.end_date) }));

        let status: any = 'ABSENT';
        if (att) status = 'PRESENT';
        else if (isOnAnnualLeave) status = 'LEAVE';
        else if (isOnMaternity) status = 'MATERNITY';
        else if (isOnPermission) status = 'PERMISSION';
        else if (isOnLeave) status = 'LEAVE';

        return {
          date: dateStr,
          status,
          isLate: att?.is_late || false,
          isEarlyDeparture: att?.is_early_departure || false,
          isNoClockOut: att ? !att.check_out : false
        };
      });

      return {
        accountId: acc.id,
        fullName: acc.full_name,
        nik: acc.internal_nik,
        totalDays,
        present,
        late,
        lateMinutes,
        earlyDeparture,
        earlyDepartureMinutes,
        absent,
        leave: annualLeave,
        maternityLeave,
        permission,
        holiday: 0,
        specialHoliday: 0,
        noClockOut,
        dispensationCount: 0,
        attendanceRate,
        dailyDetails
      };
    });
  },

  async getOvertimeReport(startDate: string, endDate: string): Promise<OvertimeSummary[]> {
    const [
      { data: accounts },
      { data: overtimes }
    ] = await Promise.all([
      supabase.from('accounts').select('id, full_name, internal_nik'),
      supabase.from('overtimes').select('*').gte('check_in', `${startDate}T00:00:00Z`).lte('check_in', `${endDate}T23:59:59Z`)
    ]);

    return (accounts || []).map(acc => {
      const empOvertimes = (overtimes || []).filter(o => o.account_id === acc.id);
      const totalMinutes = empOvertimes.reduce((sum, o) => sum + (o.duration_minutes || 0), 0);
      
      return {
        accountId: acc.id,
        fullName: acc.full_name,
        nik: acc.internal_nik,
        totalOvertimeMinutes: totalMinutes,
        totalOvertimeHours: Number((totalMinutes / 60).toFixed(1)),
        overtimeCount: empOvertimes.length,
        estimatedCost: totalMinutes * 500 // Placeholder rate
      };
    });
  },

  async getLeaveReport(): Promise<LeaveSummary[]> {
    const [
      { data: accounts },
      { data: annualLeaves },
      { data: maternityLeaves },
      { data: permissions }
    ] = await Promise.all([
      supabase.from('accounts').select('id, full_name, internal_nik'),
      supabase.from('account_annual_leaves').select('*').eq('status', 'approved'),
      supabase.from('account_maternity_leaves').select('*').eq('status', 'approved'),
      supabase.from('account_permission_requests').select('*').eq('status', 'approved')
    ]);

    return (accounts || []).map(acc => {
      const empAnnualLeaves = (annualLeaves || []).filter(l => l.account_id === acc.id);
      const empMaternityLeaves = (maternityLeaves || []).filter(m => m.account_id === acc.id);
      const empPermissions = (permissions || []).filter(p => p.account_id === acc.id);

      const usedQuota = empAnnualLeaves.length; // Simplified: 1 record = 1 day (should ideally sum durations)
      const maternityUsed = empMaternityLeaves.length;

      return {
        accountId: acc.id,
        fullName: acc.full_name,
        nik: acc.internal_nik,
        totalQuota: 12, // Default
        usedQuota,
        remainingQuota: 12 - usedQuota,
        carryOverQuota: 0,
        maternityQuota: 90,
        maternityUsed,
        permissionCount: empPermissions.length
      };
    });
  },

  async getFinanceReport(startDate: string, endDate: string) {
    const startMonth = new Date(startDate).getMonth() + 1;
    const startYear = new Date(startDate).getFullYear();
    const endMonth = new Date(endDate).getMonth() + 1;
    const endYear = new Date(endDate).getFullYear();

    const [
      { data: payrollItems },
      { data: reimbursements },
      { data: compensations },
      { data: overtimes }
    ] = await Promise.all([
      supabase
        .from('finance_payroll_items')
        .select('*, payroll:finance_payrolls!inner(*), account:accounts(full_name, internal_nik, position, grade)')
        .gte('payroll.start_date', startDate)
        .lte('payroll.end_date', endDate)
        .in('payroll.status', ['Approved', 'Paid']),
      supabase
        .from('finance_reimbursements')
        .select('*, account:accounts(full_name, internal_nik)')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .in('status', ['Approved', 'Partially Approved']),
      supabase
        .from('account_compensation_logs')
        .select('*, account:accounts(full_name, internal_nik)')
        .gte('termination_date', startDate)
        .lte('termination_date', endDate)
        .eq('status', 'Completed'),
      this.getOvertimeReport(startDate, endDate)
    ]);

    // Synchronize Overtime cost with Payroll if available
    const syncedOvertimes = (overtimes || []).map(ot => {
      const employeePayrollItems = (payrollItems || []).filter(p => p.account_id === ot.accountId);
      const totalOvertimePay = employeePayrollItems.reduce((sum, p) => sum + (p.overtime_pay || 0), 0);
      
      if (totalOvertimePay > 0) {
        return { ...ot, estimatedCost: totalOvertimePay };
      }
      return ot;
    });

    // Synchronize Reimbursement with Payroll Items for Salary Recap
    const enrichedPayrollItems = (payrollItems || []).map(item => {
      const employeeReimbursements = (reimbursements || []).filter(r => r.account_id === item.account_id);
      const totalReimbursement = employeeReimbursements.reduce((sum, r) => sum + (r.amount_approved || 0), 0);
      return {
        ...item,
        reimbursement_pay: totalReimbursement
      };
    });

    return {
      payrollItems: enrichedPayrollItems,
      reimbursements: reimbursements || [],
      compensations: compensations || [],
      overtimes: syncedOvertimes
    };
  }
};
