import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate';
// import * as createError from 'http-errors'

/*
  This file contains functions that interact with the dataLayer.
  It contains the business logic for the application.
    It contains the following functions:
        - getTodosForUser
        - createTodo
        - updateTodo
        - deleteTodo
        - createAttachmentPresignedUrl
The functions are exported so that they can be used in the lambda functions.
*/

const logger = createLogger('TodosAccess')
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

// Get get todos function
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info("get todos function called")
    return await todosAccess.getAllTodos(userId)
}


// Create todo function
export async function createTodo(
    newTodo: CreateTodoRequest,
    userId: string
    ): Promise<TodoItem> {
        logger.info("create todo function called")
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    // const s3AttachmentUrl = await attachmentUtils.getUploadUrl(todoId)
    const newItem = {
        todoId,
        userId,
        createdAt,
        done: false,
        attachmentUrl: null,
        ...newTodo
    }
    logger.info('Creating new item', newItem)
    console.log("newItem : = : ", newItem)
    return await todosAccess.createTodoItem(newItem)
    }

// Update todo function
export async function updateTodo(
    
    todoId: string,
    todoUpdate: UpdateTodoRequest,
    userId: string
    ): Promise<TodoUpdate> {
        logger.info("update todo function called")
    return todosAccess.updateTodoItem(todoId, todoUpdate, userId)
    }


// Delete todo function
export async function deleteTodo(
    todoId: string,
    userId: string
    ): Promise<string> {
        logger.info("delete todo function called")
    return todosAccess.deleteTodoItem(todoId, userId)
    }

    
// generate upload url function
export async function createAttachmentPresignedUrl(
    todoId: string,
    userId: string
  ): Promise<string> {
    logger.info('Generating upload url', { todoId, userId })
    const attachmentId = uuid.v4()
    const attachmentUrl = attachmentUtils.getAttachmentUrl(attachmentId)
    const uploadUrl = attachmentUtils.getUploadUrl(attachmentId)
  
    const todoItem = await todosAccess.addAttachmentUrl(
      userId,
      todoId,
      attachmentUrl
    )
    todoItem.attachmentUrl = uploadUrl
    logger.info('URL updated', { todoItem })
  
    return todoItem.attachmentUrl
  }
