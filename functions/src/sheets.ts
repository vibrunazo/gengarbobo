import { Member } from "./member.model";

export function getMembersFromSheets(rows: Array<any>): Member[] {
  const result: Member[] = [];
  rows.forEach(r => {
    if (r.length === 4) {
      const newMember: Member = {
        name: r[0],
        code: r[1],
        team: '',
        winrate: '0',
        rank: '',
      }
      result.push(newMember);
    }
  });
  return result;
}
