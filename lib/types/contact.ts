export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  [key: string]: string | undefined;
}

export interface ParsedContact {
  name: string;
  email: string;
  phone: string;
  address?: string;
  [key: string]: string | undefined;
}
