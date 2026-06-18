/** Purchase negotiation intent. */
export enum NegotiationType {
  BUY,
}

/** Entry point a shopping flow was started from. */
export enum ShoppingFrom {
  HOME,
  SEARCH,
}

/** Channel used to deliver a phone OTP. */
export enum PhoneOtpMethod {
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
}

/** Action that initiated a completing-information flow. */
export enum CompletingType {
  PURCHASE,
  SELL,
  QUESTION,
}
