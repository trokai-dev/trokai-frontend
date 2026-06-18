export class Etiqueta {
  order!: {
    dataValidade: Date;
    notaFiscal: string;
    pedido: string;
    volume: string;
    codServico: string;
    nomeServico: string;
    plp: number;
    products: [
      {
        title: string;
        cost: number;
        weight: number;
      },
    ];
    mostrarVD: boolean;
    codigoRastreio: string;
    contrato: string;
    valorMatrix: string;
  };
  buyer!: {
    name: string;
    cpf: string;
    address: {
      street: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
      number: string;
      complement: string;
    };
  };
  owner!: {
    name: string;
    cpf: string;
    address: {
      street: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
      number: string;
      complement: string;
    };
  };
}
