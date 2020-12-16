import Vue from 'vue'
import Router from 'vue-router'

// import workspace from '@/views/workspace'
import login from '@/views/login'
import register from '@/views/register'
import administration from '@/views/administration'
import homepage from '@/views/homepage'
import test from '@/views/test'

Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'login',
            component: login
        },
        {
            path: '/login',
            name: 'login',
            component: login
        },
        {
            path: '/register',
            name: 'register',
            component: register
        },
        {
            path: '/administration',
            name: 'administration',
            component: administration,
            beforeEnter: ((to, from, next) => {
                if (localStorage.adminname && localStorage.adminid) {
                    next();
                } else {
                    next({
                        path: '/login'
                    })
                }
            })
        },
        {
            path: '/homepage',
            name: 'homepage',
            component: homepage,
            beforeEnter: ((to, from, next) => {
                if (localStorage.name && localStorage.id) {
                    next();
                } else {
                    next({
                        path: '/login'
                    })
                }
            })
        },
        {
            path: '/test',
            name: 'test',
            component: test
        }
    ]
})