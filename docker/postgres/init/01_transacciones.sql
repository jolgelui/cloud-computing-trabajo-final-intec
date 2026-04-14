-- Seed CSV: data/sample_transacciones.csv (mounted at /seed in the container)

CREATE TABLE transacciones (
    id SERIAL PRIMARY KEY,
    canal TEXT,
    fecha TEXT,
    hora TEXT,
    marca TEXT,
    tipo_transaccion TEXT,
    no_tarjeta TEXT,
    no_afiliado TEXT,
    respuesta TEXT,
    error TEXT,
    no_autorizacion TEXT,
    referencia TEXT,
    moneda TEXT,
    monto TEXT,
    itbis TEXT,
    dcc TEXT,
    tarifa_dcc TEXT,
    moneda_dcc TEXT,
    moneda_dcc_alfanumerica TEXT,
    monto_dcc TEXT,
    tasa_cambio_dcc TEXT,
    margen_dcc TEXT
);

COPY transacciones (
    canal,
    fecha,
    hora,
    marca,
    tipo_transaccion,
    no_tarjeta,
    no_afiliado,
    respuesta,
    error,
    no_autorizacion,
    referencia,
    moneda,
    monto,
    itbis,
    dcc,
    tarifa_dcc,
    moneda_dcc,
    moneda_dcc_alfanumerica,
    monto_dcc,
    tasa_cambio_dcc,
    margen_dcc
)
FROM '/seed/sample_transacciones.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');
