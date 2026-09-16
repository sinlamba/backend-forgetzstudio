export interface ClerkUserCreatedEvent {
  type: 'user.created';
  data: {
    id: string;
    email_addresses: {
      email_address: string;
    }[];
    first_name: string | null;
    last_name: string | null;
  };
}