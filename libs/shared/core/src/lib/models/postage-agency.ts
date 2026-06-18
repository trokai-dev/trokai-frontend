export class PostageAgency {
  id!: number;
  name!: string;
  initials!: string;
  email!: string;
  type!: string;
  note!: string;
  distance!: number;
  address!: {
    postal_code: string;
    address: string;
    number: string;
    complement: string;
    district: string;
    city: {
      city: string;
      state: {
        state_abbr: string;
        state: string;
      };
    };
    latitude: number;
    longitude: number;
  };
  phone!: {
    phone: string;
  };
  companies!: { id: number }[];
  services!: { id: number }[];
  term!: number;
  cost!: number;
  business_hours!: string | null;

  get displayDistance() {
    if (this.distance < 1000) return `${this.distance} m`;
    return `${(this.distance / 1000).toFixed(1)} km`;
  }

  get displayAddress() {
    const addr = this.address;
    const complement =
      addr.complement != null && addr.complement.trim().length > 0;

    const number = addr.number != null && addr.number.trim().length > 0;

    return `${addr.address}${number ? ', ' + addr.number : ''}${
      complement ? ' - ' + addr.complement : ''
    } - ${addr.district}, ${addr.city.city} - ${addr.city.state.state_abbr}`;
  }

  constructor(data: Partial<PostageAgency>) {
    Object.assign(this, data);
  }
}
