-- Create RPC functions for incrementing counters

CREATE OR REPLACE FUNCTION increment_script_views(script_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE scripts 
  SET view_count = view_count + 1 
  WHERE id = script_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_program_views(program_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE programs 
  SET view_count = view_count + 1 
  WHERE id = program_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_program_downloads(program_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE programs 
  SET download_count = download_count + 1 
  WHERE id = program_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;