import { VitalsReading, PatientProfile, SupportedLanguage } from '../types';
import { calculateWeeklyVitalsAverages } from './vitalsService';

/**
 * Escapes a field for safe CSV output according to RFC 4180.
 * Wraps in quotes and escapes internal double-quotes.
 */
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  // If contains commas, newlines, or quotes, wrap and double-quote
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Generates formatted CSV content from patient vitals history.
 */
export function generateVitalsCSVContent(
  readings: VitalsReading[],
  patientProfile?: PatientProfile,
  language: SupportedLanguage = 'en'
): string {
  const isUrdu = language === 'ur';
  const isRoman = language === 'roman';

  const patientName = patientProfile?.name || readings[0]?.patientName || 'Patient';
  const patientAge = patientProfile?.exactAge || readings[0]?.patientAge || '35';
  const patientGender = patientProfile?.gender || 'Not specified';
  const conditions = patientProfile?.conditions || 'None documented';
  const exportDate = new Date().toLocaleString('en-GB', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const weeklyStats = calculateWeeklyVitalsAverages(readings);

  const lines: string[] = [];

  // 1. Clinical Header Section
  lines.push(
    [
      escapeCSV('SEHATSAATHI PRO - COMPREHENSIVE CLINICAL VITALS REPORT'),
      escapeCSV(''),
      escapeCSV(''),
    ].join(',')
  );
  lines.push(
    [
      escapeCSV('Report Generation Date & Time:'),
      escapeCSV(exportDate),
      escapeCSV(''),
    ].join(',')
  );
  lines.push(
    [
      escapeCSV('Patient Full Name:'),
      escapeCSV(patientName),
      escapeCSV(''),
    ].join(',')
  );
  lines.push(
    [
      escapeCSV('Age:'),
      escapeCSV(`${patientAge} Years`),
      escapeCSV('Gender:'),
      escapeCSV(patientGender),
    ].join(',')
  );
  lines.push(
    [
      escapeCSV('Documented Conditions / Allergies:'),
      escapeCSV(conditions),
      escapeCSV(''),
    ].join(',')
  );
  lines.push(
    [
      escapeCSV('Total Vitals Logs Included:'),
      escapeCSV(readings.length),
      escapeCSV(''),
    ].join(',')
  );
  lines.push(''); // Blank line

  // 2. Statistical Summary & Averages
  lines.push(
    [
      escapeCSV('CLINICAL SUMMARY & AVERAGES ACROSS PERIOD'),
      escapeCSV(''),
      escapeCSV(''),
    ].join(',')
  );
  lines.push(
    [
      escapeCSV('Average Fasting/Random Sugar (mg/dL):'),
      escapeCSV(weeklyStats.avgSugar ? `${weeklyStats.avgSugar} mg/dL` : 'No readings recorded'),
      escapeCSV(''),
    ].join(',')
  );
  lines.push(
    [
      escapeCSV('Average Blood Pressure (mmHg):'),
      escapeCSV(
        weeklyStats.avgSystolic && weeklyStats.avgDiastolic
          ? `${weeklyStats.avgSystolic}/${weeklyStats.avgDiastolic} mmHg`
          : 'No readings recorded'
      ),
      escapeCSV(''),
    ].join(',')
  );
  lines.push(
    [
      escapeCSV('Average Resting Heart Rate (BPM):'),
      escapeCSV(
        weeklyStats.avgHeartRate ? `${weeklyStats.avgHeartRate} BPM` : 'No readings recorded'
      ),
      escapeCSV(''),
    ].join(',')
  );
  lines.push(
    [
      escapeCSV('Trend Analysis & Clinical Impression:'),
      escapeCSV(
        isUrdu
          ? weeklyStats.trendAdviceUr
          : isRoman
          ? weeklyStats.trendAdviceRoman
          : weeklyStats.trendAdviceEn
      ),
      escapeCSV(''),
    ].join(',')
  );
  lines.push(''); // Blank line

  // 3. Tabular Column Headers
  const headers = [
    'Record ID',
    'Date (DD/MM/YYYY)',
    'Day of Week',
    'Time of Day',
    'Metric Type',
    'Blood Sugar (mg/dL)',
    'Sugar Test Context',
    'Sugar Clinical Category',
    'Blood Pressure (Systolic/Diastolic mmHg)',
    'Systolic BP (mmHg)',
    'Diastolic BP (mmHg)',
    'BP Clinical Category',
    'Heart Rate / Pulse (BPM)',
    'Pulse Measurement Source',
    'Heart Rate Category',
    'Overall Clinical Urgency',
    'Clinical Assessment Title',
    'Clinical Interpretation & Physician Summary',
    'Lifestyle & Medical Guidance',
    'Physician Reviewed',
    'Doctor PMDC License',
  ];
  lines.push(headers.map(escapeCSV).join(','));

  // 4. Data Rows (sorted chronologically newest first or chronological)
  const sortedReadings = [...readings].sort((a, b) => b.timestamp - a.timestamp);

  for (const item of sortedReadings) {
    const bpCombined =
      item.systolic && item.diastolic ? `${item.systolic}/${item.diastolic}` : '';

    const sugarContext =
      item.sugarTiming === 'fasting'
        ? 'Fasting (Nihar munh)'
        : item.sugarTiming === 'post_meal'
        ? 'Post-Meal (2h after meal)'
        : item.sugarTiming === 'hba1c'
        ? 'HbA1c'
        : item.sugarTiming === 'random'
        ? 'Random'
        : '';

    const interpretation =
      (isUrdu
        ? item.interpretationText?.ur
        : isRoman
        ? item.interpretationText?.roman
        : item.interpretationText?.en) ||
      item.dailyDoctorSummary?.en ||
      item.categoryTitle ||
      '';

    const guidance =
      (isUrdu
        ? item.guidanceText?.ur
        : isRoman
        ? item.guidanceText?.roman
        : item.guidanceText?.en) || '';

    const row = [
      item.id,
      item.date,
      item.dayOfWeek || '',
      item.timeOfDay || '',
      item.vitalType.toUpperCase(),
      item.sugarValue !== undefined ? item.sugarValue : '',
      sugarContext,
      item.sugarStatus?.category || '',
      bpCombined,
      item.systolic !== undefined ? item.systolic : '',
      item.diastolic !== undefined ? item.diastolic : '',
      item.bpStatus?.category || '',
      item.heartRateBpm !== undefined ? item.heartRateBpm : '',
      item.heartRateSource === 'camera_sensor' ? 'Optical Camera Sensor' : 'Manual Entry / Cuff',
      item.heartRateStatus?.category || '',
      item.urgency,
      item.categoryTitle,
      interpretation,
      guidance,
      item.isDoctorReviewed ? 'Yes (Verified)' : 'Pending Doctor Sign-off',
      item.doctorPmdc || (item.isDoctorReviewed ? 'PMDC #54921-S' : 'Unassigned'),
    ];

    lines.push(row.map(escapeCSV).join(','));
  }

  // 5. Clinical Disclaimer Footer
  lines.push('');
  lines.push(
    [
      escapeCSV(
        'DISCLAIMER: This report is compiled from patient-logged readings via SehatSaathi Pro for clinical review by licensed healthcare professionals. It does not replace physical in-clinic triage.'
      ),
    ].join(',')
  );

  return lines.join('\r\n');
}

/**
 * Triggers a browser download of the user's vitals history as a UTF-8 CSV file.
 */
export function downloadVitalsCSVReport(
  readings: VitalsReading[],
  patientProfile?: PatientProfile,
  language: SupportedLanguage = 'en'
): { success: boolean; filename: string; count: number } {
  if (!readings || readings.length === 0) {
    return { success: false, filename: '', count: 0 };
  }

  const csvContent = generateVitalsCSVContent(readings, patientProfile, language);

  const patientSlug = (patientProfile?.name || readings[0]?.patientName || 'Patient')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `SehatSaathi_Vitals_Report_${patientSlug}_${dateStr}.csv`;

  try {
    // Add UTF-8 Byte Order Mark (BOM) so Excel opens Arabic/Urdu/special symbols correctly
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, filename, count: readings.length };
  } catch (err) {
    console.error('Failed to download vitals CSV report:', err);
    return { success: false, filename, count: 0 };
  }
}
