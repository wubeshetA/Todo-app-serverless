import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate';
// import * as createError from 'http-errors'

// TODO: Implement businessLogic

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
    const s3AttachmentUrl = await attachmentUtils.getUploadUrl(todoId)
    const newItem = {
        todoId,
        userId,
        createdAt,
        done: false,
        attachmentUrl: s3AttachmentUrl,
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


// Generate upload url function
export async function createAttachmentPresignedUrl(
    todoId: string,
    userId: string
    ): Promise<string> {
        logger.info("generate upload url function called by user: ", userId, " for todo: ", todoId, "")
    return attachmentUtils.getUploadUrl(todoId)
    }
