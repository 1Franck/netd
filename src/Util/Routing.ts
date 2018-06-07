'use strict';

import * as debugModule from 'debug';
let debug = debugModule('routing');

export class Routing {

    private defaultMethod: string = 'all';
    private defaultControllerAction: string = 'handle';

    constructor(private app: any) {}

    /**
     * @param route
     * @returns {string}
     */
    private getMethod(route: any)
    {
        return route.method === undefined ? this.defaultMethod : route.method
    }

    /**
     * @param route
     * @returns {string}
     */
    private getControllerAction(route: any)
    {
        return route.action === undefined ? this.defaultControllerAction : route.action
    }

    /**
     * @param route
     * @returns {{path: string, method: string, controller: string, action: string}}
     */
    private processRoute(route: any): any
    {
        return {
            path: route.path,
            method: this.getMethod(route),
            controller: route.controller,
            action: this.getControllerAction(route),
        };
    }

    /**
     * @param controller
     * @param processedRoute
     * @param response
     */
    private errorControllerActionNotFound(controller: any, processedRoute: any, response: any)
    {
        let msg = processedRoute.controllerName + ' has no action named ' + processedRoute.action;
        debug(msg);
        if (this.app.settings.env === 'development') {
            response.status(500).send(msg);
        } else {
            response.status(500).send('Something broke!');
        }
    }

    /**
     * @param processedRoute
     * @param request
     * @param response
     * @returns {any}
     */
    private loadController(processedRoute: any, request: any, response: any): any
    {
        let controllerClass = require('./../' + processedRoute.controller);
        return new controllerClass(request, response);
    }

    /**
     * Register a new route for express
     * @param route {{path: string, method: string, controller: string, action: string}}
     */
    public register(route: any)
    {
        route = this.processRoute(route);

        this.app[route.method](route.path, (request: any, response: any) => {

            const controller = this.loadController(route, request, response);

            if (!controller[route.action]) {
                this.errorControllerActionNotFound(controller, route, response);
            } else {
                debug('Calling ' + controller.constructor.name + '::' + route.action + '() for request ' + request.originalUrl);
                controller[route.action]();
            }
        });
    }

    /**
     * @param {string} methodName
     */
    setDefaultMethod(methodName: string)
    {
        this.defaultMethod = methodName;
    }

    /**
     * @param {string} actionName
     */
    setDefaultControllerAction(actionName: string)
    {
        this.defaultControllerAction = actionName;
    }
}