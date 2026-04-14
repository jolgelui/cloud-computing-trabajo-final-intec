export type Transaccion = {
  id: number
  canal: string | null
  fecha: string | null
  hora: string | null
  marca: string | null
  tipoTransaccion: string | null
  noTarjeta: string | null
  noAfiliado: string | null
  respuesta: string | null
  error: string | null
  noAutorizacion: string | null
  referencia: string | null
  moneda: string | null
  monto: string | null
  itbis: string | null
  dcc: string | null
  tarifaDcc: string | null
  monedaDcc: string | null
  monedaDccAlfanumerica: string | null
  montoDcc: string | null
  tasaCambioDcc: string | null
  margenDcc: string | null
}

export type TransaccionListResponse = {
  data: Transaccion[]
  total: number
  page: number
  limit: number
}

export type TransaccionInput = Partial<Omit<Transaccion, 'id'>>
