import {Response, Request, NextFunction } from 'express';
import {parse, StackFrame} from 'stacktrace-parser';
import {IOops} from './Interfaces/IOops';
import {IStack} from './Interfaces/IStack';
import {ISolution} from './Interfaces/ISolution';
import {promisify} from 'util';
import {readFile} from 'fs';
const get_content = promisify(readFile);

import * as MissingPackageSolution from './Solutions/MissingPackageSolution.json';
import * as PageNotFoundSolution from './Solutions/PageNotFoundSolution.json';
import * as BadRequestSolution from './Solutions/BadRequestSolution.json';

/**
 * Register the solutions for the application.
 * @type {object}
 */
const Solution:Array<ISolution> = [
 MissingPackageSolution,
 PageNotFoundSolution,
 BadRequestSolution,
];

/**
 * Handle Errors.
 *
 * @param req
 * @param res
 * @param err
 * @param next
 * @return {void}
 */
export function Telescope({name,message,stack}: Error, req:Request, res:Response, next: NextFunction): void {
  let details:IOops = {
    name,
    message,
    stack: null,
    statusCode: 500,
    solution:null
  };
  // set solution details.
  details.solution = Solution.filter((element:ISolution)=>message.includes(element.getErrorTitle))[0] || null;
  if(stack) {
    const trace:StackFrame[] = parse(stack);
    details.stack = <IStack>trace[0];
    details.stack.frames = trace.length;
    get_content(details.stack['file'], 'utf8').then((data: string) => {
      details.stack.content = data;
    }).then(()=>{
      res.render('ErrorPage.ejs', details);
    });
  }
}


