import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

var AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient =  new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME,
    ) {}

    // get all todos for a user
    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Getting all todos')

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }


    // Create a new todo item in the table
    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Creating todo item')

        const result = await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        logger.info('Todo item created', result)
        return todoItem as TodoItem
    }


    // Update a todo item in the table
    async updateTodoItem(
        todoId: string,
        todoUpdate: TodoUpdate,
        userId: string): Promise<TodoUpdate> {

            
        logger.info('Update todo item function called')

        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done
            },
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ReturnValues: 'ALL_NEW'
        }).promise()

        // const todoItemUpdate = result.Attributes as TodoUpdate
        const todoItemUpdate = result.Attributes
        logger.info('Todo item updated', todoItemUpdate)
        return todoItemUpdate as TodoUpdate
    }

    async deleteTodoItem(todoId: string, userId: string): Promise<string> {
        logger.info('Deleting todo item')

        const result = await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise()

        logger.info('Todo item deleted', result)
        return todoId as string
    }


    async addAttachmentUrl(
        userId: string,
        todoId: string,
        url: string
      ): Promise<TodoItem> {
        logger.info('Add Attachment URL', {
          todoId,
          userId
        })
    
        const updateResult = await this.docClient
          .update({
            TableName: this.todosTable,
            Key: {
              userId,
              todoId
            },
            ConditionExpression: 'userId = :userId and todoId = :todoId',
            ExpressionAttributeNames: {
              '#urls': 'attachmentUrl'
            },
            ExpressionAttributeValues: {
              ':userId': userId,
              ':todoId': todoId,
              ':newUrl': url
            },
            UpdateExpression: 'SET #urls = :newUrl',
            ReturnValues: 'ALL_NEW'
          })
          .promise()
    
        return updateResult.Attributes as TodoItem
      }


}