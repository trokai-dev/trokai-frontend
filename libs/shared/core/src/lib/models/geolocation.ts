/** ViaCEP postal-code lookup response. */
export class RespostaCep {
  cep!: string;
  logradouro!: string;
  complemento!: string;
  bairro!: string;
  localidade!: string;
  uf!: string;
  ibge!: string;
  gia!: string;
  ddd!: string;
  siafi!: string;
  erro!: boolean;
}

/** Last known search location (cached to optimize geo-aware searches). */
export class SearchLocation {
  zip: number;
  lat: number;
  lng: number;

  constructor(lat: number, lng: number, zip?: number) {
    this.lat = lat;
    this.lng = lng;
    this.zip = zip ?? 0;
  }
}
