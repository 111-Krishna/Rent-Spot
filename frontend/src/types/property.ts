export type Property = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  location?: string;
  houseType?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type PropertyPayload = {
  title: string;
  description: string;
  price: number;
  location: string;
  houseType: string;
  images?: File[];
};
