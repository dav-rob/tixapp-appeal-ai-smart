-- Drop tables if they already exist
DROP TABLE IF EXISTS documents, pictures, car, driver_info, council_info, "user" CASCADE;

-- USER Table
CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address1 TEXT,
    address2 TEXT,
    address3 TEXT,
    postcode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- COUNCIL_INFO Table
CREATE TABLE council_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pcn_number TEXT NOT NULL,
    contravention_code TEXT,
    contravention_code_suffix TEXT,
    contravention_description TEXT,
    contravention_datetime TIMESTAMP,
    date_of_notice TIMESTAMP,
    council TEXT,
    location TEXT,
    geo_lat NUMERIC(10, 6),
    geo_lng NUMERIC(10, 6),
    ceo_code TEXT,
    observation_period INTERVAL,
    car_make TEXT,
    car_model TEXT,
    car_colour TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- DRIVER_INFO Table
CREATE TABLE driver_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "user"(id) ON DELETE SET NULL,
    council_info_id UUID UNIQUE REFERENCES council_info(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CAR Table
CREATE TABLE car (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
    vrm TEXT NOT NULL,
    make TEXT,
    model TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PICTURES Table
CREATE TABLE pictures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    council_info_id UUID REFERENCES council_info(id) ON DELETE CASCADE,
    driver_info_id UUID REFERENCES driver_info(id) ON DELETE CASCADE,
    pic BYTEA NOT NULL, -- Binary data for images
    title TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- DOCUMENTS Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    council_info_id UUID REFERENCES council_info(id) ON DELETE CASCADE,
    driver_info_id UUID REFERENCES driver_info(id) ON DELETE CASCADE,
    doc BYTEA, -- Optional binary file data
    format TEXT CHECK (format IN ('pdf', 'docx', 'txt', 'csv', 'xlsx')), -- Limit to known formats
    text_content TEXT, -- For free-form user input or extracted text
    title TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

