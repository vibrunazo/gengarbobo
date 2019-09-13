export interface Member {
  name: string;
  team: string;
  winrate?: string;
  rank?: string;
  email?: string;
  code?: string;
  badges?: number;
  medals?: number;
  roles?: Array<string>;
}
