-- Create BMI records table for tracking user BMI history
CREATE TABLE IF NOT EXISTS bmi_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bmi DECIMAL(5,2) NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  height DECIMAL(10,2) NOT NULL,
  weight_unit VARCHAR(10) NOT NULL CHECK (weight_unit IN ('kg', 'g', 'lbs')),
  height_unit VARCHAR(10) NOT NULL CHECK (height_unit IN ('cm', 'ft_in')),
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_bmi_records_user_id ON bmi_records(user_id);

-- Create index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_bmi_records_created_at ON bmi_records(created_at DESC);

-- Enable Row Level Security
ALTER TABLE bmi_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own BMI records
CREATE POLICY "Users can view own BMI records"
  ON bmi_records FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own BMI records
CREATE POLICY "Users can insert own BMI records"
  ON bmi_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own BMI records
CREATE POLICY "Users can update own BMI records"
  ON bmi_records FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own BMI records
CREATE POLICY "Users can delete own BMI records"
  ON bmi_records FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_bmi_records_updated_at
  BEFORE UPDATE ON bmi_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE bmi_records IS 'Stores BMI calculation history for users';
COMMENT ON COLUMN bmi_records.bmi IS 'Calculated Body Mass Index';
COMMENT ON COLUMN bmi_records.weight IS 'Weight in the specified unit';
COMMENT ON COLUMN bmi_records.height IS 'Height in the specified unit';
COMMENT ON COLUMN bmi_records.weight_unit IS 'Unit of weight: kg, g, or lbs';
COMMENT ON COLUMN bmi_records.height_unit IS 'Unit of height: cm or ft_in';
COMMENT ON COLUMN bmi_records.category IS 'BMI category: Underweight, Healthy Weight, Overweight, or Obesity';