import * as Mustache from 'mustache';

export class Router {
    router: RouterModel = myRouter;
    view = document.getElementById('app');

    constructor() {
        this.getActiveRoute();
    }

    renderError() {
        this.view.innerHTML = '404 ERROR0';
    }

    getActiveRoute() {
        let currentPathArray = window.location.pathname.substr(1).split('/');

        let routes = this.router.routes;
        let route: Route = null;
        currentPathArray.forEach((path) => {
            route = routes.filter(r => {
                return r.dynamic ? true : r.path === path;
            })[0];
            if (route && route.routes) {
                routes = route.routes;
            }
            if (route.dynamic) {
                route.dataPath += path;
            }
        });
        if (route) {
            this.fetchData(route);
        } else {
            this.renderError();
        }
    }

    fetchData(route: Route) {
        const request = new XMLHttpRequest();
        request.open('GET', `/pages-data/${route.dataPath}.json`, true);
        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                const data = JSON.parse(request.responseText);
                this.renderTemplate(data, route.template);
            } else {
                console.log('error');
            }
        };
        request.onerror = function () {
            // There was a connection error of some sort
        };
        request.send();
    }

    renderTemplate(data: any, templateName: string) {
        const request = new XMLHttpRequest();

        request.open('GET', `/pages-templates/${templateName}.htm`, true);
        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {

                const doc = new DOMParser().parseFromString(request.response, 'text/html');
                const elem = doc.querySelectorAll('script')[0].innerHTML;

                this.view.innerHTML = Mustache.render(elem, data);
            } else {
                console.log('error');
            }
        };
        request.onerror = function () {
            // There was a connection error of some sort
        };
        request.send();
    }
}


interface Route {
    path: string;
    name: string;
    dataPath: string;
    template: string;
    routes?: Array<Route>;
    dynamic?: boolean;
}

class RouterModel {
    constructor(public name: string, public routes: Array<Route>) {
    }
}

export const myRouter = new RouterModel('myRouter', [
    {
        path: '',
        name: 'Root',
        dataPath: 'home',
        template: 'home'
    },
    {
        path: 'about',
        name: 'About',
        dataPath: 'about',
        template: 'about',
        routes: [
            {
                path: 'projects',
                name: 'projects',
                dataPath: 'projects/projects',
                template: 'single-project',
                routes: [
                    {
                        path: '',
                        name: 'project',
                        dataPath: 'projects/',
                        template: 'single-project',
                        dynamic: true
                    }
                ]
            }
        ]
    },
    {
        path: 'contact',
        name: 'Contact',
        dataPath: 'contact',
        template: 'contact',
    }
]);
