export interface Contact {
  userId: number;
  username: string;
}

export interface Message {
  id: string;
  message: string;
  sender: number;
  receiver: number;
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
}

export interface Chat {
  id: string;
  messages: Message[];
  contacts: Contact[];
}
