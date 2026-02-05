export interface Notulen {
  id: number;
  title: string;
  date: string;
  time: string;
  place: string;
  agenda: string;
  content: string;
  conclusion: string;
}

export interface Attendance {
  id: number;
  meeting: string;
  date: string;
  time: string;
  attendees: Attendee[];
}

export interface Attendee {
  name: string;
  present: boolean;
}

export interface Presentation {
  id: number;
  title: string;
  presenter: string;
  date: string;
  time: string;
  description: string;
}

export interface NavItem {
  name: string;
  href: string;
  icon: string;
}
