import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  Heart,
  TrendingUp,
  Award,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { VitalsReading, SupportedLanguage, PatientProfile } from '../types';

interface VitalsTrendsChartProps {
  vitalsHistory: VitalsReading[];
  currentLanguage: SupportedLanguage;
  activeProfile?: PatientProfile;
  onAddLogClick?: () => void;
}

type TimeRangeOption = 30 | 14 | 7;
type MetricFilterOption = 'all' | 'bp' | 'heart';

export const VitalsTrendsChart: React.FC<VitalsTrendsChartProps> = ({
  vitalsHistory,
  currentLanguage,
  activeProfile,
  onAddLogClick,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  const [timeRange, setTimeRange] = useState<TimeRangeOption>(30);
  const [metricFilter, setMetricFilter] = useState<MetricFilterOption>('all');

  // Filter and sort chronologically (oldest to newest) for chart plotting
  const chartData = useMemo(() => {
    // If history has items, filter by the selected time range
    const sorted = [...vitalsHistory].sort((a, b) => {
      const tsA = a.customTimestamp || (a.date ? new Date(a.date).getTime() : 0);
      const tsB = b.customTimestamp || (b.date ? new Date(b.date).getTime() : 0);
      return tsA - tsB;
    });

    const sliced = sorted.slice(-timeRange);

    return sliced.map((item, index) => {
      const dateObj = item.customTimestamp ? new Date(item.customTimestamp) : new Date(item.date);
      const shortDate = isNaN(dateObj.getTime())
        ? item.date
        : dateObj.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'en-GB', {
            day: 'numeric',
            month: 'short',
          });

      const dayName = isUrdu
        ? item.dayNameUrdu || item.dayOfWeek
        : isRoman
        ? item.dayNameRoman || item.dayOfWeek
        : item.dayOfWeek;

      return {
        id: item.id || `pt-${index}`,
        shortDate,
        fullDate: item.date,
        dayOfWeek: dayName,
        timeOfDay: item.timeOfDay || '',
        systolic: item.systolic ?? null,
        diastolic: item.diastolic ?? null,
        heartRate: item.heartRateBpm ?? null,
        sugarValue: item.sugarValue ?? null,
        sugarUnit: item.sugarUnit || 'mg/dL',
        urgency: item.urgency,
      };
    });
  }, [vitalsHistory, timeRange, isUrdu, isRoman, currentLanguage]);

  // Compute 30-day statistical averages and clinical insights
  const stats = useMemo(() => {
    const validSys = chartData.map((d) => d.systolic).filter((v): v is number => typeof v === 'number');
    const validDia = chartData.map((d) => d.diastolic).filter((v): v is number => typeof v === 'number');
    const validHr = chartData.map((d) => d.heartRate).filter((v): v is number => typeof v === 'number');

    const avgSys = validSys.length ? Math.round(validSys.reduce((a, b) => a + b, 0) / validSys.length) : null;
    const avgDia = validDia.length ? Math.round(validDia.reduce((a, b) => a + b, 0) / validDia.length) : null;
    const avgHr = validHr.length ? Math.round(validHr.reduce((a, b) => a + b, 0) / validHr.length) : null;

    const maxSys = validSys.length ? Math.max(...validSys) : null;
    const minSys = validSys.length ? Math.min(...validSys) : null;
    const maxHr = validHr.length ? Math.max(...validHr) : null;
    const minHr = validHr.length ? Math.min(...validHr) : null;

    let bpStatusText = isUrdu ? 'نارمل متوازن بلڈ پریشر' : isRoman ? 'Normal BP' : 'Optimal Blood Pressure';
    let bpStatusUrgency: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';

    if (avgSys) {
      if (avgSys >= 140 || (avgDia && avgDia >= 90)) {
        bpStatusText = isUrdu ? 'اسٹیج 2 ہائی بلڈ پریشر رجحان' : isRoman ? 'Stage 2 High BP' : 'Stage 2 Hypertension Trend';
        bpStatusUrgency = 'RED';
      } else if (avgSys >= 130 || (avgDia && avgDia >= 80)) {
        bpStatusText = isUrdu ? 'اسٹیج 1 ہائی بلڈ پریشر رجحان' : isRoman ? 'Stage 1 High BP' : 'Stage 1 Hypertension Trend';
        bpStatusUrgency = 'YELLOW';
      } else if (avgSys >= 120) {
        bpStatusText = isUrdu ? 'قدرے بلند بلڈ پریشر (Elevated)' : isRoman ? 'Elevated BP' : 'Elevated Pre-hypertensive';
        bpStatusUrgency = 'YELLOW';
      }
    }

    return {
      avgSys,
      avgDia,
      avgHr,
      maxSys,
      minSys,
      maxHr,
      minHr,
      bpStatusText,
      bpStatusUrgency,
      totalCount: chartData.length,
    };
  }, [chartData, isUrdu, isRoman]);

  // Custom Clinical Tooltip Component for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 backdrop-blur-md text-xs min-w-[190px] space-y-1.5 z-50">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/80">
            <span className="font-bold text-slate-100">{data.dayOfWeek}</span>
            <span className="text-[11px] text-slate-400 font-mono">{data.shortDate}</span>
          </div>

          {data.systolic !== null && data.diastolic !== null && (
            <div className="flex items-center justify-between gap-3 text-rose-300">
              <span className="flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                {isUrdu ? 'بلڈ پریشر:' : 'BP (Sys/Dia):'}
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {data.systolic}/{data.diastolic} <span className="text-[10px] text-slate-400">mmHg</span>
              </span>
            </div>
          )}

          {data.heartRate !== null && (
            <div className="flex items-center justify-between gap-3 text-cyan-300">
              <span className="flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                {isUrdu ? 'نبض / دھڑکن:' : 'Heart Rate:'}
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {data.heartRate} <span className="text-[10px] text-slate-400">bpm</span>
              </span>
            </div>
          )}

          {data.sugarValue !== null && (
            <div className="flex items-center justify-between gap-3 text-teal-300">
              <span className="flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                {isUrdu ? 'بلڈ شوگر:' : 'Blood Sugar:'}
              </span>
              <span className="font-mono font-bold text-white">
                {data.sugarValue} <span className="text-[10px] text-slate-400">{data.sugarUnit}</span>
              </span>
            </div>
          )}

          <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400">
            {isUrdu
              ? data.systolic >= 130 ? '⚠️ بلند ریڈنگ' : '✓ صحت مند حد'
              : data.systolic >= 130 ? '⚠️ High Reading' : '✓ Normal Range'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Top Header & Range/Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>
                  {isUrdu
                    ? `${timeRange} روزہ بلڈ پریشر اور نبض کا کلینیکل گراف`
                    : isRoman
                    ? `${timeRange}-Roza BP Aur Pulse Rate Ka Graph`
                    : `${timeRange}-Day Blood Pressure & Heart Rate Trends`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  RECHARTS
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isUrdu
                  ? 'سسٹولک، ڈائیسٹولک اور نبض کی باقاعدہ روزانہ پیش رفت کا تصویری جائزہ'
                  : 'Daily longitudinal timeline showing systolic, diastolic, and pulse trajectories'}
              </p>
            </div>
          </div>
        </div>

        {/* Range and Metric Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {/* Time Range Filter (7d / 14d / 30d) */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {([7, 14, 30] as TimeRangeOption[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isUrdu ? `${r} دن` : isRoman ? `${r} Din` : `${r} Days`}
              </button>
            ))}
          </div>

          {/* Metric Selector (All / BP only / Pulse only) */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMetricFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                metricFilter === 'all'
                  ? 'bg-teal-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isUrdu ? 'سب' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setMetricFilter('bp')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                metricFilter === 'bp'
                  ? 'bg-rose-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isUrdu ? 'بی پی' : 'BP'}
            </button>
            <button
              type="button"
              onClick={() => setMetricFilter('heart')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                metricFilter === 'heart'
                  ? 'bg-cyan-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isUrdu ? 'نبض' : 'Pulse'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistical Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Average BP */}
        <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
          <div className="flex items-center justify-between text-[11px] font-bold text-rose-700 dark:text-rose-300">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'اوسط بلڈ پریشر' : 'Avg Blood Pressure'}</span>
            </span>
            <span className="font-mono text-[10px]">mmHg</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {stats.avgSys && stats.avgDia ? `${stats.avgSys}/${stats.avgDia}` : '--/--'}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {stats.minSys && stats.maxSys ? `Range: ${stats.minSys} - ${stats.maxSys}` : 'Normal baseline'}
          </div>
        </div>

        {/* Average Heart Rate */}
        <div className="p-3.5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-900/40">
          <div className="flex items-center justify-between text-[11px] font-bold text-cyan-700 dark:text-cyan-300">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'اوسط نبض / دھڑکن' : 'Avg Heart Rate'}</span>
            </span>
            <span className="font-mono text-[10px]">BPM</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {stats.avgHr ? `${stats.avgHr}` : '--'}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {stats.minHr && stats.maxHr ? `Range: ${stats.minHr} - ${stats.maxHr} bpm` : 'Normal sinus'}
          </div>
        </div>

        {/* Clinical Assessment Badge */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 sm:col-span-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'کلینیکل درجہ بندی' : 'Clinical Classification'}</span>
            </span>
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-600">AHA / ADA</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1 truncate">
            {stats.bpStatusText}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isUrdu
              ? 'ہدف: سسٹولک 120 کے نیچے اور ڈائیسٹولک 80 کے نیچے مثالی مانا جاتا ہے۔'
              : 'Target: Systolic < 120 mmHg & Diastolic < 80 mmHg considered optimal.'}
          </div>
        </div>
      </div>

      {/* Main Recharts Line Chart Container */}
      <div className="w-full h-72 sm:h-80 pt-2 pb-1 relative">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <Activity className="w-8 h-8 text-slate-400 mb-2 opacity-60" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isUrdu ? 'اس دورانیے کا کوئی ریکارڈ موجود نہیں' : 'No vitals records in this timeframe'}
            </p>
            {onAddLogClick && (
              <button
                type="button"
                onClick={onAddLogClick}
                className="mt-3 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold"
              >
                {isUrdu ? 'نیا ریکارڈ درج کریں' : 'Log New Reading'}
              </button>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#94a3b8', opacity: 0.3 }}
              />

              {/* Left Y Axis for Blood Pressure (mmHg) */}
              <YAxis
                yAxisId="left"
                domain={[50, 180]}
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#94a3b8', opacity: 0.3 }}
              />

              {/* Right Y Axis for Heart Rate (BPM) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[40, 130]}
                tick={{ fontSize: 10, fill: '#06b6d4' }}
                tickLine={false}
                axisLine={{ stroke: '#06b6d4', opacity: 0.3 }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value: string) => {
                  if (value === 'systolic') {
                    return isUrdu ? 'سسٹولک بی پی (Systolic)' : isRoman ? 'Systolic BP' : 'Systolic BP (Top)';
                  }
                  if (value === 'diastolic') {
                    return isUrdu ? 'ڈائیسٹولک بی پی (Diastolic)' : isRoman ? 'Diastolic BP' : 'Diastolic BP (Bottom)';
                  }
                  if (value === 'heartRate') {
                    return isUrdu ? 'دل کی نبض (Pulse BPM)' : isRoman ? 'Pulse Rate' : 'Heart Rate (Pulse BPM)';
                  }
                  return value;
                }}
              />

              {/* Clinical Target Reference Lines for BP */}
              {(metricFilter === 'all' || metricFilter === 'bp') && (
                <>
                  <ReferenceLine
                    yAxisId="left"
                    y={120}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: '120 Target',
                      fill: '#10b981',
                      fontSize: 10,
                      position: 'insideTopLeft',
                    }}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    y={80}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: '80 Target',
                      fill: '#10b981',
                      fontSize: 10,
                      position: 'insideBottomLeft',
                    }}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    y={140}
                    stroke="#f43f5e"
                    strokeDasharray="3 3"
                    opacity={0.5}
                  />
                </>
              )}

              {/* Systolic Line (Rose Red) */}
              {(metricFilter === 'all' || metricFilter === 'bp') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="systolic"
                  name="systolic"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f43f5e', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#f43f5e' }}
                  connectNulls
                />
              )}

              {/* Diastolic Line (Amber Orange) */}
              {(metricFilter === 'all' || metricFilter === 'bp') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="diastolic"
                  name="diastolic"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#f59e0b' }}
                  connectNulls
                />
              )}

              {/* Heart Rate Line (Cyan / Teal) on Right Axis */}
              {(metricFilter === 'all' || metricFilter === 'heart') && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="heartRate"
                  name="heartRate"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#06b6d4' }}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Clinical Notes & Target Guidance Strip */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            {isUrdu
              ? 'سبز ڈیش لائن (120/80 mmHg) نارمل بلڈ پریشر کی بین الاقوامی حد کو ظاہر کرتی ہے۔'
              : 'Dashed green lines (120/80 mmHg) indicate the international clinical target for resting adult blood pressure.'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {chartData.length} {isUrdu ? 'ریکارڈ شدہ پوائنٹس' : 'data points'}
        </span>
      </div>
    </div>
  );
};
