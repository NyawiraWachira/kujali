

export interface AddNoteToBudgetCommand {
  orgId: string;
  budgetId: string;
  noteContent: string;
  authorId: string;
  timestamp?: Date;
}

