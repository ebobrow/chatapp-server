export type User = {
  name: string;
  username: string;
  password: string;
};

export type UserEntry = User & {
  id: number;
  created_at: string;
  modified_at: string;
  friends: Array<number>;
};
