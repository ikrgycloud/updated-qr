CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(120) NOT NULL UNIQUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_products_id ON products (id);
CREATE INDEX IF NOT EXISTS ix_products_product_name ON products (product_name);
CREATE INDEX IF NOT EXISTS ix_products_is_deleted ON products (is_deleted);

CREATE TABLE IF NOT EXISTS product_details (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    product_description TEXT NULL,
    crop_name TEXT NULL,
    dosage TEXT NULL,
    gazette_notification TEXT NULL,
    dated DATE NULL,
    marketing_license_number VARCHAR(255) NULL,
    authorization_number VARCHAR(255) NULL,
    manufacturing_license_number VARCHAR(255) NULL,
    manufactured_and_marketed_by TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_product_details_product_id ON product_details (product_id);

CREATE TABLE IF NOT EXISTS product_ingredients (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ingredient_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_product_ingredients_product_id ON product_ingredients (product_id);

CREATE TABLE IF NOT EXISTS generated_qr (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    qr_payload TEXT NOT NULL,
    snapshot_json TEXT NOT NULL,
    request_source VARCHAR(100) NULL DEFAULT 'backend-api',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_generated_qr_id ON generated_qr (id);
CREATE INDEX IF NOT EXISTS ix_generated_qr_product_id ON generated_qr (product_id);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    employee_id VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(30) NOT NULL UNIQUE,
    joining_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_users_id ON users (id);
CREATE INDEX IF NOT EXISTS ix_users_employee_id ON users (employee_id);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);
CREATE INDEX IF NOT EXISTS ix_users_phone_number ON users (phone_number);

INSERT INTO products (id, product_name)
VALUES
    (1, 'BT Gold'),
    (2, 'RHIZOZEN'),
    (3, 'HYBRIX'),
    (4, 'BTGold GR'),
    (5, 'MagicMix'),
    (6, 'MagicMix-L'),
    (7, 'MagicMix-Gr'),
    (8, 'Sree Platino'),
    (9, 'Sree Platino-Gr')
ON CONFLICT (id) DO UPDATE
SET product_name = EXCLUDED.product_name,
    updated_at = NOW();

INSERT INTO product_details (
    product_id,
    name,
    product_description,
    crop_name,
    dosage,
    gazette_notification,
    dated,
    marketing_license_number,
    authorization_number,
    manufacturing_license_number,
    manufactured_and_marketed_by
)
VALUES
    (
        1,
        'BT Gold',
        'mixture of seaweed extract; Humic and Fulvic acid, Ammo acids and Vitamins (Liquid)',
        'cotton',
        'Two Foilar applications at 2.1 lit. per Hectare',
        'S. O. 2346 (E)',
        DATE '2025-05-26',
        'MLKG/null/COMM/FM/2022/32991',
        '1990298',
        '199024',
        'Sri BioAesthetics Pvt. Ltd.
Plot No. G49, Industrial Park, TSIIC, Sultanpur, Sangareddy Dist, 502319,
Customer Care : - +91 6309981055, website :- sribioaesthetics.com'
    ),
    (
        2,
        'RHIZOZEN',
        'Mixture of Humic axid and Seaweed extract (powder)',
        'tomato',
        'Three foilar applications at 1.25 kg per hectare',
        NULL,
        NULL,
        'MLKG/null/COMM/FM/2022/32991',
        '1990298',
        '1990024',
        'Sri BioAesthetics Pvt. Ltd.
Plot No. G49, Industrial Park, TSIIC, Sultanpur, Sangareddy Dist, 502319,
Customer Care : - +91 6309981055, website :- sribioaesthetics.com'
    ),
    (
        3,
        'HYBRIX',
        'Mixture of Botanical extarct and Seaweed extract (Liquid)',
        'tomato',
        'Three foilar applications at 3.75 kg per hectare',
        NULL,
        NULL,
        'MLKG/null/COMM/FM/2022/32991',
        '1990298',
        '1990024',
        'Sri BioAesthetics Pvt. Ltd.
Plot No. G49, Industrial Park, TSIIC, Sultanpur, Sangareddy Dist, 502319,
Customer Care : - +91 6309981055, website :- sribioaesthetics.com'
    ),
    (
        4,
        'BTGold GR',
        'Mixture of Humic acid and Seaweed extract (Granules)',
        'tomato',
        'two Soil applications at 25kg. per hectare',
        NULL,
        NULL,
        'MLKG/null/COMM/FM/2022/32991',
        '1990298',
        '1990024',
        'Sri BioAesthetics Pvt. Ltd.
Plot No. G49, Industrial Park, TSIIC, Sultanpur, Sangareddy Dist, 502319,
Customer Care : - +91 6309981055, website :- sribioaesthetics.com'
    ),
    (
        5,
        'MagicMix',
        'Protein Hydrolysate 27% (Plant Source) (Powder)',
        'paddy',
        'seed treatment before sowing at 3.0g/ kg seed',
        NULL,
        NULL,
        'MLKG/null/COMM/FM/2022/32991',
        '1990298',
        '1990024',
        'Sri BioAesthetics Pvt. Ltd.
Plot No. G49, Industrial Park, TSIIC, Sultanpur, Sangareddy Dist, 502319,
Customer Care : - +91 6309981055, website :- sribioaesthetics.com'
    ),
    (
        6,
        'MagicMix-L',
        'Protein Hydrolysate 25% (Plant Source) (Liquid)',
        'tomato',
        'two soilapplications at 40 kg. per hectare',
        NULL,
        NULL,
        'MLKG/null/COMM/FM/2022/32991',
        '1990298',
        '1990024',
        'Sri BioAesthetics Pvt. Ltd.
Plot No. G49, Industrial Park, TSIIC, Sultanpur, Sangareddy Dist, 502319,
Customer Care : - +91 6309981055, website :- sribioaesthetics.com'
    ),
    (
        7,
        'MagicMix-Gr',
        'Protein Hydrolysate 1.5% (Plant Source) (granules)',
        'paddy',
        'seed treatment before sowing at 3.0g/ kg seed',
        NULL,
        NULL,
        'MLKG/null/COMM/FM/2022/32991',
        '1990298',
        '1990024',
        'Sri BioAesthetics Pvt. Ltd.
Plot No. G49, Industrial Park, TSIIC, Sultanpur, Sangareddy Dist, 502319,
Customer Care : - +91 6309981055, website :- sribioaesthetics.com'
    ),
    (
        8,
        'Sree Platino',
        'Sargassum Tenerrimum - 10% (Liquid)',
        'paddy',
        'one foliar application at 2ml. per litre',
        NULL,
        NULL,
        'MLKG/null/COMM/FM/2022/32991',
        '1990298',
        '1990024',
        'Sri BioAesthetics Pvt. Ltd.
Plot No. G49, Industrial Park, TSIIC, Sultanpur, Sangareddy Dist, 502319,
Customer Care : - +91 6309981055, website :- sribioaesthetics.com'
    ),
    (
        9,
        'Sree Platino-Gr',
        'Sargassum Tenerrimum - 2% (Liquid)',
        'paddy',
        'one soil applicaation at 12.5 kg per hectare',
        NULL,
        NULL,
        'MLKG/null/COMM/FM/2022/32991',
        '1990298',
        '1990024',
        'Sri BioAesthetics Pvt. Ltd.
Plot No. G49, Industrial Park, TSIIC, Sultanpur, Sangareddy Dist, 502319,
Customer Care : - +91 6309981055, website :- sribioaesthetics.com'
    )
ON CONFLICT (product_id) DO UPDATE
SET name = EXCLUDED.name,
    product_description = EXCLUDED.product_description,
    crop_name = EXCLUDED.crop_name,
    dosage = EXCLUDED.dosage,
    gazette_notification = EXCLUDED.gazette_notification,
    dated = EXCLUDED.dated,
    marketing_license_number = EXCLUDED.marketing_license_number,
    authorization_number = EXCLUDED.authorization_number,
    manufacturing_license_number = EXCLUDED.manufacturing_license_number,
    manufactured_and_marketed_by = EXCLUDED.manufactured_and_marketed_by;

DELETE FROM product_ingredients WHERE product_id BETWEEN 1 AND 9;

INSERT INTO product_ingredients (product_id, ingredient_name, content)
VALUES
    (1, 'sargassum wightii extract per cent by weight, minimum', '20'),
    (1, 'Glycine per cent. by weight, minimum', '10'),
    (1, 'potassium fulvic humate per cent. by weight, minimum (Source: Leonardite)', '10'),
    (1, 'Vitamin C per cent. by weight, minimum', '2.00'),
    (1, 'water per cent. by weight', 'QS'),
    (1, 'total (per cent.)', '100'),
    (2, 'humic acid powder as potassium humate (Source: Leonardite) percent by weight minimum', '80'),
    (2, 'kappaphycus alvarezii and sargassum swartzii in ratio of 1:1 extract water soluble powder per cent. by weight, minimum', '20'),
    (2, 'total (per cent)', '100'),
    (3, 'Musa acuminata pseudostem per cent. by weight, minimum', '75'),
    (3, 'sargassum tenerrimum per cent. by weight, minimum', '4'),
    (3, 'polysorbate 80 per cent by weight, minimum', '0.2'),
    (3, 'water per cent. by weight', 'QS'),
    (3, 'total (per cent)', '100'),
    (4, 'Kappaphycus alvarezii and sargassum swartzii in ratio of 1:1, extract per cent, by weight, minimum', '3.3'),
    (4, 'humic acid powder as potassium humate (Source: Leonardite) per cent. by weight, minimum', '1.0'),
    (4, 'Dolomite per cent. by weight, maximum', '95.7'),
    (4, 'total (per cent)', '100'),
    (5, 'soy flour per cent. by weight, minimum', '27'),
    (5, 'enzymes [protease 2% (400U/g) + Amylase 1% (80U/g)] per cent. by weight, minimum', '3'),
    (5, 'Diatomaceous earth powder per cent. by weight, maximum', '70'),
    (5, 'total (per cent)', '100'),
    (6, 'protein hydrolysates derived from glycine max and zea mays in ratio of 5.5 : 4.5 through enzymatic (food grade alcalase) hydrolysis per cent. by weight, minimum', '25'),
    (6, 'water per cent by weight', 'QS'),
    (6, 'total (per cent.)', '100'),
    (7, 'protein hydrolysate derived from defatted soyabean seed flour by enzymatic (Papain) hydrolysis per cent. by weight, maximum', '1.5'),
    (7, 'Bentonite per cent. by weight, maximum', '98.5'),
    (7, 'total (per cent.)', '100'),
    (8, 'alginic acid per cent. by weight, minimum', '2.0'),
    (8, 'pH (1:2 aqueous solution)', '8-10'),
    (8, 'Organic matter (dry mass basis) per cent. by weight, minimum', '20'),
    (9, 'alginic acid per cent. by weight, minimum', '0.2'),
    (9, 'pH (1:2 aqueous solution)', '6.0- 8.5'),
    (9, 'bulk density (g/cc)', '0.95-1.1');

SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1));
SELECT setval(pg_get_serial_sequence('product_details', 'id'), COALESCE((SELECT MAX(id) FROM product_details), 1));
SELECT setval(pg_get_serial_sequence('product_ingredients', 'id'), COALESCE((SELECT MAX(id) FROM product_ingredients), 1));
SELECT setval(pg_get_serial_sequence('generated_qr', 'id'), COALESCE((SELECT MAX(id) FROM generated_qr), 1));
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));
