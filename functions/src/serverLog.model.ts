export interface ServerLog {
  author: string;   // user who wrote the log, lowercased Member.name
  body_new: any;    // body: object containing what was actually written
  body_old?: any;   // old: object containing what the data was before changing. So it can be undone
  date: number;     // date and time the event happened
  event: string;    // event type: write, delete
  target?: string;  // target: where was the change made? member,friend,tourney etc
  x?: string;       // eXtra comments
}
