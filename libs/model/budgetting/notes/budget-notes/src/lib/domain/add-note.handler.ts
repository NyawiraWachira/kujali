import { HandlerTools } from '@iote/cqrs';
import { FunctionHandler, FunctionContext } from '@ngfi/functions';

import { AddNoteToBudgetCommand } from './add-note.command';


export interface ICommandHandler<TCommand, TResult = void> {
  execute(command: TCommand, context: FunctionContext, tools: HandlerTools): Promise<TResult>;
}

/**
 * Result type for add note operation
 */
export interface AddNoteToBudgetResult {
  success: boolean;
  noteId: string;
  timestamp: Date;
}

/**
 * Note model for budget notes
 */
export interface BudgetNote {
  id?: string;
  budgetId: string;
  content: string;
  authorId: string;
  createdAt: Date;
  orgId: string;
}


const BUDGET_NOTES_REPO = (orgId: string) => `orgs/${orgId}/budget-notes`;


export class AddNoteToBudgetHandler 
  extends FunctionHandler<AddNoteToBudgetCommand, AddNoteToBudgetResult>
  implements ICommandHandler<AddNoteToBudgetCommand, AddNoteToBudgetResult> 
{
  
  public async execute(
    command: AddNoteToBudgetCommand, 
    context: FunctionContext, 
    tools: HandlerTools
  ): Promise<AddNoteToBudgetResult> {
    
    tools.Logger.log(() => `[AddNoteToBudgetHandler].execute: Adding note to budget ${command.budgetId} for org ${command.orgId}`);
    
    // Validate command data
    if (!command.orgId || command.orgId.trim() === '') {
      throw new Error('Organization ID is required');
    }
    
    if (!command.budgetId || command.budgetId.trim() === '') {
      throw new Error('Budget ID is required');
    }
    
    if (!command.noteContent || command.noteContent.trim() === '') {
      throw new Error('Note content cannot be empty');
    }
    
    if (!command.authorId || command.authorId.trim() === '') {
      throw new Error('Author ID is required');
    }
    
    // Prepare note object
    const note: BudgetNote = {
      budgetId: command.budgetId,
      content: command.noteContent.trim(),
      authorId: command.authorId,
      createdAt: command.timestamp || new Date(),
      orgId: command.orgId
    };
    
    const notesRepo = tools.getRepository<BudgetNote>(BUDGET_NOTES_REPO(command.orgId));

    const createdNote = await notesRepo.create(note);
    
    if (!createdNote.id) {
      throw new Error('Failed to create note: No ID returned from repository');
    }
    
    tools.Logger.log(() => `[AddNoteToBudgetHandler].execute: Successfully created note ${createdNote.id}`);
    
    // Return result
    return {
      success: true,
      noteId: createdNote.id,
      timestamp: createdNote.createdAt
    };
}
}
