-- KPI Views for dashboards

-- Service Reports Summary View
CREATE OR REPLACE VIEW report_summary AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  client_id,
  service_type,
  status,
  COUNT(*) as total_reports,
  -- Productivity: avg time per service
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_hours_per_service,
  -- Team size stats
  AVG((SELECT COUNT(*) FROM report_employees WHERE report_id = service_reports.id)) as avg_team_size
FROM service_reports
GROUP BY DATE_TRUNC('day', created_at), client_id, service_type, status;

-- Employee Attendance View
CREATE OR REPLACE VIEW employee_attendance AS
SELECT 
  DATE_TRUNC('day', s.created_at) as date,
  s.id as shift_id,
  COUNT(se.employee_id) as total_employees,
  COUNT(CASE WHEN se.presente THEN 1 END) as present_employees,
  COUNT(CASE WHEN NOT se.presente THEN 1 END) as absent_employees,
  ROUND(COUNT(CASE WHEN se.presente THEN 1 END)::numeric / COUNT(se.employee_id)::numeric * 100, 2) as attendance_rate
FROM shifts s
LEFT JOIN shift_employees se ON s.id = se.shift_id
GROUP BY DATE_TRUNC('day', s.created_at), s.id;

-- Aircraft Service History View
CREATE OR REPLACE VIEW aircraft_service_history AS
SELECT
  DATE_TRUNC('day', sr.created_at) as date,
  a.id as aircraft_id,
  a.client_id,
  a.matricula as registration,
  COUNT(sr.id) as total_services,
  COUNT(CASE WHEN sr.service_type = 'cleaning' THEN 1 END) as cleaning_services,
  COUNT(CASE WHEN sr.service_type = 'boarding' THEN 1 END) as boarding_services,
  MAX(sr.created_at) as last_service_date
FROM aircraft a
LEFT JOIN service_reports sr ON a.id = sr.aircraft_id
GROUP BY DATE_TRUNC('day', sr.created_at), a.id, a.client_id, a.matricula;

-- Team Productivity View
CREATE OR REPLACE VIEW team_productivity AS
SELECT
  DATE_TRUNC('day', sr.created_at) as date,
  sr.id as report_id,
  sr.client_id,
  sr.service_type,
  COUNT(DISTINCT re.employee_id) as team_size,
  SUM(re.hours_worked) as total_hours_worked,
  COUNT(DISTINCT sr.aircraft_id) as aircrafts_serviced
FROM service_reports sr
LEFT JOIN report_employees re ON sr.id = re.report_id
GROUP BY DATE_TRUNC('day', sr.created_at), sr.id, sr.client_id, sr.service_type;

-- Create function to get dashboard KPIs
CREATE OR REPLACE FUNCTION get_dashboard_kpis(
  p_start_date timestamp,
  p_end_date timestamp,
  p_client_id uuid DEFAULT NULL,
  p_service_type text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  WITH report_metrics AS (
    SELECT
      COUNT(*) as total_reports,
      COUNT(CASE WHEN status = 'publicado' THEN 1 END) as published_reports,
      COUNT(CASE WHEN status = 'rascunho' THEN 1 END) as draft_reports,
      ROUND(AVG((
        SELECT COUNT(*) 
        FROM report_employees re 
        WHERE re.report_id = sr.id
      ))::numeric, 2) as avg_team_size,
      ROUND(AVG(
        EXTRACT(EPOCH FROM (updated_at - created_at))/3600
      )::numeric, 2) as avg_service_hours
    FROM service_reports sr
    WHERE 
      created_at BETWEEN p_start_date AND p_end_date
      AND (p_client_id IS NULL OR client_id = p_client_id)
      AND (p_service_type IS NULL OR service_type = p_service_type::service_type)
  ),
  attendance_metrics AS (
    SELECT
      ROUND(AVG(
        COUNT(CASE WHEN se.presente THEN 1 END)::numeric / 
        COUNT(se.employee_id)::numeric * 100
      ), 2) as avg_attendance_rate
    FROM shifts s
    LEFT JOIN shift_employees se ON s.id = se.shift_id
    WHERE 
      s.created_at BETWEEN p_start_date AND p_end_date
    GROUP BY DATE_TRUNC('day', s.created_at)
  ),
  aircraft_metrics AS (
    SELECT
      COUNT(DISTINCT sr.aircraft_id) as total_aircrafts_serviced,
      ROUND(AVG(
        COUNT(sr.id) OVER (PARTITION BY sr.aircraft_id)
      )::numeric, 2) as avg_services_per_aircraft
    FROM service_reports sr
    WHERE 
      created_at BETWEEN p_start_date AND p_end_date
      AND (p_client_id IS NULL OR client_id = p_client_id)
      AND (p_service_type IS NULL OR service_type = p_service_type::service_type)
  )
  SELECT json_build_object(
    'reports', json_build_object(
      'total', rm.total_reports,
      'published', rm.published_reports,
      'draft', rm.draft_reports,
      'avgTeamSize', rm.avg_team_size,
      'avgServiceHours', rm.avg_service_hours
    ),
    'attendance', json_build_object(
      'avgRate', am.avg_attendance_rate
    ),
    'aircraft', json_build_object(
      'totalServiced', air.total_aircrafts_serviced,
      'avgServicesPerAircraft', air.avg_services_per_aircraft
    )
  ) INTO result
  FROM report_metrics rm
  CROSS JOIN attendance_metrics am
  CROSS JOIN aircraft_metrics air;

  RETURN result;
END;
$$;

-- Create function to get daily service stats
CREATE OR REPLACE FUNCTION get_daily_service_stats(
  p_start_date timestamp,
  p_end_date timestamp,
  p_client_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  WITH daily_stats AS (
    SELECT
      DATE_TRUNC('day', created_at) as date,
      COUNT(*) as total_services,
      COUNT(CASE WHEN service_type = 'cleaning' THEN 1 END) as cleaning_services,
      COUNT(CASE WHEN service_type = 'boarding' THEN 1 END) as boarding_services,
      COUNT(DISTINCT aircraft_id) as unique_aircrafts,
      ROUND(AVG(
        (SELECT COUNT(*) FROM report_employees re WHERE re.report_id = sr.id)
      )::numeric, 2) as avg_team_size
    FROM service_reports sr
    WHERE 
      created_at BETWEEN p_start_date AND p_end_date
      AND (p_client_id IS NULL OR client_id = p_client_id)
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date
  )
  SELECT json_agg(
    json_build_object(
      'date', ds.date,
      'totalServices', ds.total_services,
      'cleaningServices', ds.cleaning_services,
      'boardingServices', ds.boarding_services,
      'uniqueAircrafts', ds.unique_aircrafts,
      'avgTeamSize', ds.avg_team_size
    )
  ) INTO result
  FROM daily_stats ds;

  RETURN result;
END;
$$;