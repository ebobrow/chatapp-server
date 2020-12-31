export type User = {
  name: string;
  email: string;
  password: string;
};

export type UserEntry = User & {
  id: number;
  created_at: string;
  modified_at: string;
  friends: Array<number>;
};
