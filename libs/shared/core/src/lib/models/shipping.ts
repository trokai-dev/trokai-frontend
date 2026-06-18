export enum ShippingServices {
  PAC = '1',
  SEDEX = '2',
  JADLOG_PACKAGE = '3', //econômico
  JADLOG_COM = '4', //express
  JADLOG_PACKAGE_CENTRALIZADO = '27', //pegaki
  JET = '33', // jet e pegaki aparentemente
  LOGGI_EXPRESS = '31', //pegaki
  LOGGI_PONTO = '34',
  TIMEOUT = '100',
  FIXED_PRICE = '90',
}

export const ShippingServiceName = {
  [ShippingServices.PAC]: 'PAC',
  [ShippingServices.SEDEX]: 'SEDEX',
  [ShippingServices.JADLOG_PACKAGE]: 'Jadlog',
  [ShippingServices.JADLOG_COM]: 'Jadlog',
  [ShippingServices.JADLOG_PACKAGE_CENTRALIZADO]: 'Jadlog',
  [ShippingServices.JET]: 'JET',
  [ShippingServices.LOGGI_EXPRESS]: 'Loggi',
  [ShippingServices.LOGGI_PONTO]: 'Loggi',
};

export function isTransportadora(service: ShippingServices) {
  return service !== ShippingServices.SEDEX && service !== ShippingServices.PAC;
}
